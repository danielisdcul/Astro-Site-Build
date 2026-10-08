import { setupGalleryMagnifier } from './gallery-magnifier';
import { setupGalleryHoverZoom } from './gallery-hover-zoom';
import { setupGalleryDismiss } from './gallery-dismiss';
import { createGalleryImageLoader } from './gallery-image-loading';

/** Tiled previews open a shared lightbox, with native swipe navigation on mobile. */
export function setupGallery(gallery: HTMLElement) {
	// Setup — one abort signal owns all listeners for this gallery instance.
	const controller = new AbortController();
	const options = { signal: controller.signal };
	// Keep this breakpoint aligned with the mobile rules in gallery.css.
	const mobile = window.matchMedia('(max-width: 800px)');
	const cleanupLightbox = setupLightbox(gallery, mobile, options);
	const cleanupMagnifier = setupGalleryMagnifier(gallery, mobile, options);
	setupGalleryDismiss(gallery, mobile, options);
	const cleanupHoverZoom = setupGalleryHoverZoom(gallery, options);

	// Teardown — release listeners, observers, and zoom overlays when disconnected.
	return () => {
		controller.abort();
		cleanupLightbox();
		cleanupMagnifier();
		cleanupHoverZoom();
	};
}

/** Coordinate the desktop viewer and mobile swipe track around one selected image. */
function setupLightbox(
	gallery: HTMLElement,
	mobile: MediaQueryList,
	options: AddEventListenerOptions,
) {
	// Viewer elements — galleries with the lightbox disabled need no interaction setup.
	const dialog = gallery.querySelector<HTMLDialogElement>('dialog');
	const fullImage = gallery.querySelector<HTMLImageElement>('.gallery__full-image');
	const caption = gallery.querySelector<HTMLElement>('.gallery__viewer-caption');
	const count = gallery.querySelector<HTMLElement>('.gallery__count');
	const triggers = Array.from(gallery.querySelectorAll<HTMLAnchorElement>('.gallery__trigger'));
	if (!dialog || !fullImage || !caption || !count || !triggers.length || !dialog.showModal) {
		return () => {};
	}

	const track = dialog.querySelector<HTMLElement>('.gallery__swipe-track')!;
	const dots = Array.from(dialog.querySelectorAll<HTMLElement>('.gallery__dot'));
	const thumbnails = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-gallery-image]'));
	const thumbnailStrip = dialog.querySelector<HTMLElement>('.gallery__thumbnails');
	const slides = Array.from(track.querySelectorAll<HTMLImageElement>('img'));
	let activeIndex = 0;

	// Loading — only the visible lightbox image upgrades from its preview to the original.
	const loadImage = createGalleryImageLoader(
		image => dialog.open && image === (mobile.matches ? slides[activeIndex] : fullImage),
		options.signal!,
	);
	const loadSelectedImage = () => {
		if (!dialog.open) return;
		const trigger = triggers[activeIndex];
		const image = mobile.matches ? slides[activeIndex] : fullImage;
		const preview = trigger.querySelector<HTMLImageElement>('img')!.dataset.galleryPreview || trigger.href;
		void loadImage(image, trigger.href, preview);
	};

	// Alignment — preserve the selected image across opening and viewport changes.
	const alignSlide = () => {
		if (mobile.matches && dialog.open) track.scrollLeft = activeIndex * track.clientWidth;
	};

	const alignThumbnail = () => {
		const thumbnail = thumbnails[activeIndex];
		if (!thumbnailStrip || !thumbnail || !dialog.open || mobile.matches) return;

		const stripBounds = thumbnailStrip.getBoundingClientRect();
		const bounds = thumbnail.getBoundingClientRect();
		if (bounds.left < stripBounds.left) thumbnailStrip.scrollLeft += bounds.left - stripBounds.left - 4;
		else if (bounds.right > stripBounds.right) thumbnailStrip.scrollLeft += bounds.right - stripBounds.right + 4;
	};

	// Image selection — keep the desktop image, mobile dots, and accessible count together.
	const showImage = (index: number, align = true) => {
		activeIndex = (index + triggers.length) % triggers.length;
		const trigger = triggers[activeIndex];
		const image = trigger.querySelector('img')!;
		fullImage.alt = image.alt;
		caption.textContent = mobile.matches ? image.alt
			: trigger.closest('figure')?.querySelector('.gallery__caption-text')?.textContent || image.alt;
		count.textContent = `Image ${activeIndex + 1} of ${triggers.length}`;
		dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeIndex));
		thumbnails.forEach((thumbnail, i) => thumbnail.setAttribute('aria-pressed', String(i === activeIndex)));
		if (align) alignSlide();
		alignThumbnail();
		loadSelectedImage();
	};

	// Opening — every tile starts the viewer at the image the user selected.
	triggers.forEach((trigger, index) => {
		trigger.addEventListener('click', event => {
			// Preserve shortcuts for opening the original image in another browser tab.
			if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;

			event.preventDefault();
			showImage(index);
			dialog.showModal();
			alignSlide();
			alignThumbnail();
			loadSelectedImage();
		}, options);
	});

	// Mobile swiping — native scroll snapping moves the images with the user's thumb.
	track.addEventListener('scroll', () => {
		if (!mobile.matches || !dialog.open || !track.clientWidth) return;
		const index = Math.round(track.scrollLeft / track.clientWidth);
		showImage(Math.max(0, Math.min(triggers.length - 1, index)), false);
	}, { ...options, passive: true });

	// Viewer controls — desktop arrows and thumbnails share the same selection logic.
	gallery.querySelector('[data-gallery-close]')?.addEventListener('click', () => dialog.close(), options);
	gallery.querySelector('[data-gallery-prev]')?.addEventListener('click', () => showImage(activeIndex - 1), options);
	gallery.querySelector('[data-gallery-next]')?.addEventListener('click', () => showImage(activeIndex + 1), options);
	thumbnails.forEach((thumbnail, index) => thumbnail.addEventListener('click', () => showImage(index), options));

	// Keyboard and backdrop — Escape and focus restoration use native dialog behavior.
	dialog.addEventListener('keydown', event => {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

		event.preventDefault();
		showImage(event.key === 'Home' ? 0 : event.key === 'End' ? triggers.length - 1
			: activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
	}, options);

	dialog.addEventListener('click', event => {
		if (event.target !== dialog) return;
		const bounds = dialog.getBoundingClientRect();
		if (
			event.clientX < bounds.left ||
			event.clientX > bounds.right ||
			event.clientY < bounds.top ||
			event.clientY > bounds.bottom
		) dialog.close();
	}, options);

	// Responsive updates — retain the selected image when switching viewer layouts.
	const updateMode = () => {
		track.tabIndex = mobile.matches ? 0 : -1;
		showImage(activeIndex);
	};
	mobile.addEventListener('change', updateMode, options);
	const resize = new ResizeObserver(alignSlide);
	resize.observe(track);
	updateMode();

	return () => {
		resize.disconnect();
		if (dialog.open) dialog.close();
	};
}
