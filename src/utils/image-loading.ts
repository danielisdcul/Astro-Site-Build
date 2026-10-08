type UpgradeOptions = {
	signal?: AbortSignal;
	/** Viewers can reject a result if the user has closed or changed the image. */
	isCurrent?: () => boolean;
	priority?: 'high' | 'low';
};

type ImageRequest = {
	source: string;
	signal?: AbortSignal;
	promise: Promise<boolean>;
};

// Shared across cards, portraits, and viewers: one download per large image URL.
const originals = new Map<string, Promise<string>>();
const pending = new WeakMap<HTMLImageElement, ImageRequest>();

function fetchImage(source: string, priority: 'high' | 'low') {
	let request = originals.get(source);
	if (!request) {
		const image = new Image();
		image.decoding = 'async';
		image.fetchPriority = priority;
		image.src = source;
		request = image.decode().then(() => image.src).catch(error => {
			originals.delete(source);
			throw error;
		});
		originals.set(source, request);
	}
	return request;
}

/** Upgrade any ProgressiveImage without blanking its preview or applying stale results. */
export function upgradeImage(image: HTMLImageElement, options: UpgradeOptions = {}): Promise<boolean> {
	const original = image.dataset.imageFull;
	if (!original || options.signal?.aborted || !image.isConnected) return Promise.resolve(false);
	const source = new URL(original, document.baseURI).href;
	if (image.src === source) return Promise.resolve(true);
	const existing = pending.get(image);
	if (existing?.source === source && !existing.signal?.aborted) return existing.promise;

	// Capture this selection so an old download cannot replace a newly selected image.
	const request: ImageRequest = { source, signal: options.signal, promise: Promise.resolve(false) };
	pending.set(image, request);
	const isCurrent = () => !options.signal?.aborted && image.isConnected &&
		image.dataset.imageFull === original && pending.get(image) === request &&
		(options.isCurrent?.() ?? true);

	request.promise = (async () => {
		try {
			image.loading = 'eager';
			// A failed preview still gets a chance to recover through the larger image.
			await image.decode().catch(() => {});
			if (!isCurrent()) return false;
			const decoded = await fetchImage(source, options.priority || 'high');
			if (!isCurrent()) return false;
			image.src = decoded;
			return true;
		} catch {
			// Leave the preview usable on failed connections; later clicks can retry.
			return false;
		} finally {
			if (pending.get(image) === request) pending.delete(image);
		}
	})();
	return request.promise;
}

let cleanup: (() => void) | undefined;
let restoreRegistered = false;

/** Start deferred upgrades once the page loads, keeping offscreen and hidden images small. */
export function setupProgressiveImages() {
	cleanup?.();
	const controller = new AbortController();
	const options = { signal: controller.signal };
	const visible = new WeakSet<HTMLImageElement>();
	const registered = new WeakSet<HTMLImageElement>();
	const queue = new Set<HTMLImageElement>();
	let pageLoaded = document.readyState === 'complete';
	let active = 0;
	let scheduled: number | undefined;
	const useIdleCallback = typeof window.requestIdleCallback === 'function';
	const automatic = (image: HTMLImageElement) => image.dataset.imageUpgrade === 'after-load';

	// Background work — wait for page load and idle time, then limit concurrent downloads.
	const drain = () => {
		scheduled = undefined;
		if (!pageLoaded || controller.signal.aborted) return;
		while (active < 2 && queue.size) {
			const image = queue.values().next().value!;
			queue.delete(image);
			if (!image.isConnected || !visible.has(image) || !automatic(image)) continue;
			active++;
			void upgradeImage(image, {
				...options,
				priority: 'low',
				isCurrent: () => visible.has(image) && automatic(image),
			}).finally(() => {
				active--;
				schedule();
			});
		}
	};
	const schedule = () => {
		if (!pageLoaded || !queue.size || active >= 2 || scheduled !== undefined || controller.signal.aborted) return;
		scheduled = useIdleCallback
			? window.requestIdleCallback(drain, { timeout: 1000 })
			: window.setTimeout(drain, 0);
	};

	// Visibility — nearby images may upgrade; images in closed lightboxes never enter this queue.
	const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
		for (const entry of entries) {
			const image = entry.target as HTMLImageElement;
			if (entry.isIntersecting) {
				visible.add(image);
				queue.add(image);
			} else {
				visible.delete(image);
				queue.delete(image);
			}
		}
		schedule();
	}, { rootMargin: '200px' }) : undefined;

	const registerImage = (image: HTMLImageElement) => {
		if (registered.has(image) || !automatic(image)) return;
		registered.add(image);
		if (observer) observer.observe(image);
		else {
			// Older browsers retain native lazy loading even without IntersectionObserver.
			image.addEventListener('load', () => {
				if (new URL(image.dataset.imageFull!, document.baseURI).href === image.src) return;
				visible.add(image);
				queue.add(image);
				schedule();
			}, options);
			if (image.complete && image.naturalWidth) {
				visible.add(image);
				queue.add(image);
			}
		}
	};
	const registerImages = (root: ParentNode) => {
		if (root instanceof HTMLImageElement && root.matches('[data-image-full]')) registerImage(root);
		root.querySelectorAll<HTMLImageElement>('img[data-image-full]').forEach(registerImage);
	};
	registerImages(document);

	// Newly inserted components use the same loader without another initialization call.
	const mutations = new MutationObserver(records => {
		for (const record of records) {
			for (const node of record.addedNodes) {
				if (node instanceof Element) registerImages(node);
			}
		}
	});
	mutations.observe(document.body, { childList: true, subtree: true });

	// Explicit requests bypass the page-load wait; normal link navigation remains intact.
	document.addEventListener('click', event => {
		if (!(event.target instanceof Element)) return;
		const image = event.target.closest<HTMLImageElement>('img[data-image-full]');
		if (!image) return;
		if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
		if (image.closest('a[href]') && !event.defaultPrevented) return;
		void upgradeImage(image, options);
	}, options);
	window.addEventListener('load', () => {
		pageLoaded = true;
		schedule();
	}, { ...options, once: true });
	schedule();

	// Teardown — cancel queued work and prevent downloads from changing a discarded page.
	cleanup = () => {
		controller.abort();
		observer?.disconnect();
		mutations.disconnect();
		queue.clear();
		if (scheduled !== undefined) {
			if (useIdleCallback) window.cancelIdleCallback(scheduled);
			else window.clearTimeout(scheduled);
		}
	};
	window.addEventListener('pagehide', cleanup, { ...options, once: true });
	if (!restoreRegistered) {
		restoreRegistered = true;
		window.addEventListener('pageshow', event => {
			if (event.persisted) setupProgressiveImages();
		});
	}
	return cleanup;
}
