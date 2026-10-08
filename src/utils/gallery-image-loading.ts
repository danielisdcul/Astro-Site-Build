/** Keep a small preview visible until the selected original has finished decoding. */
export function createGalleryImageLoader(
	isVisible: (image: HTMLImageElement) => boolean,
	signal: AbortSignal,
) {
	// Requests — share original downloads and prevent repeated scroll events from starting duplicates.
	const originals = new Map<string, Promise<HTMLImageElement>>();
	const pending = new WeakMap<HTMLImageElement, string>();

	const fetchOriginal = (source: string) => {
		let request = originals.get(source);
		if (!request) {
			const original = new Image();
			original.decoding = 'async';
			original.src = source;
			request = original.decode().then(() => original).catch(error => {
				originals.delete(source);
				throw error;
			});
			originals.set(source, request);
		}
		return request;
	};

	// Upgrade — load the preview first, then replace it without flashing an empty frame.
	return async (image: HTMLImageElement, source: string, preview: string) => {
		preview = new URL(preview, document.baseURI).href;
		if (signal.aborted || image.src === source || pending.get(image) === source) return;
		pending.set(image, source);
		image.loading = 'eager';
		if (image.src !== preview) image.src = preview;

		try {
			// A failed preview should still allow the original image to load.
			await image.decode().catch(() => {});
			if (signal.aborted || pending.get(image) !== source || !isVisible(image)) return;
			const original = await fetchOriginal(source);
			if (!signal.aborted && pending.get(image) === source && isVisible(image)) image.src = original.src;
		} catch {
			// Keep the preview on a slow or failed connection; a later selection can retry.
		} finally {
			if (pending.get(image) === source) pending.delete(image);
		}
	};
}
