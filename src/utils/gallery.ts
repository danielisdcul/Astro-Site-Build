import { setupGalleryMagnifier } from './gallery-magnifier';
import { setupGalleryHoverZoom } from './gallery-hover-zoom';
import { setupGalleryDismiss } from './gallery-dismiss';
import { upgradeImage } from './image-loading';

/** Tiled previews open a shared lightbox, with native swipe navigation on mobile. */
export function setupGallery(gallery: HTMLElement) {
	// Setup — one abort signal owns all listeners for this gallery instance.
	const controller = new AbortController();
	const options = { signal: controller.signal };
	// Short landscape screens use the touch viewer and dot indicator as well as narrow screens.
	const mobile = window.matchMedia('(max-width: 800px), (orientation: landscape) and (max-height: 500px)');
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
	const fullVideo = gallery.querySelector<HTMLVideoElement>('.gallery__full-video');
	const caption = gallery.querySelector<HTMLElement>('.gallery__viewer-caption');
	const count = gallery.querySelector<HTMLElement>('.gallery__count');
	if (!dialog || !fullImage || !fullVideo || !caption || !count || !dialog.showModal) {
		return () => {};
	}

	const track = dialog.querySelector<HTMLElement>('.gallery__swipe-track')!;
	const dots = Array.from(dialog.querySelectorAll<HTMLElement>('.gallery__dot'));
	const thumbnails = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-gallery-image]'));
	const thumbnailStrip = dialog.querySelector<HTMLElement>('.gallery__thumbnails');
	const slides = Array.from(track.querySelectorAll<HTMLElement>('.gallery__slide'));
	let activeIndex = 0;

	// Loading — the shared site loader handles previews, decoding, caching, and failures.
	const loadSelectedImage = () => {
		if (!dialog.open) return;
		const slide = slides[activeIndex];
		const image = slide?.querySelector<HTMLImageElement>('img');
		if (!image) return;
		const target = mobile.matches ? image : fullImage;
		void upgradeImage(target, {
			signal: options.signal,
			isCurrent: () => dialog.open && target === (mobile.matches ? slides[activeIndex]?.querySelector('img') : fullImage),
		});
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

	// Start playback only when the user opens a video directly; swiping onto one stays paused.
	const playSelectedVideo = () => {
		const slideVideo = slides[activeIndex]?.querySelector<HTMLVideoElement>('[data-gallery-video-src]');
		const player = mobile.matches ? slideVideo : fullVideo;
		if (!player) return;
		void player.play().catch(() => {
			// Some browsers block audible autoplay; muted playback is allowed more consistently.
			player.muted = true;
			void player.play().catch(() => {});
		});
	};

	// Image selection — keep the desktop image, mobile dots, and accessible count together.
	const showImage = (index: number, align = true) => {
		const previousIndex = activeIndex;
		activeIndex = (index + slides.length) % slides.length;
		const slide = slides[activeIndex];
		const image = slide.querySelector<HTMLImageElement>('img');
		const video = slide.querySelector<HTMLVideoElement>('[data-gallery-video-src]');
		// A desktop hover zoom can remain active when a section poster opens the shared viewer.
		dialog.querySelectorAll('.gallery__hover-zoom.is-active').forEach((overlay) => {
			overlay.classList.remove('is-active');
		});
		fullVideo.pause();
		slides.forEach((item) => {
			const itemVideo = item.querySelector<HTMLVideoElement>('[data-gallery-video-src]');
			if (itemVideo && itemVideo !== video) itemVideo.pause();
		});

		if (image) {
			if (fullVideo.src) {
				fullVideo.removeAttribute('src');
				delete fullVideo.dataset.galleryVideoSrc;
			}
			fullVideo.hidden = true;
			fullImage.hidden = false;
			if (fullImage.dataset.imageFull !== image.dataset.imageFull) {
				fullImage.dataset.imageFull = image.dataset.imageFull;
				fullImage.dataset.imagePreview = image.dataset.imagePreview;
				fullImage.src = image.dataset.imagePreview || image.src;
			}
			fullImage.alt = image.alt;
		} else if (video) {
			fullImage.hidden = true;
			fullVideo.hidden = false;
			fullVideo.setAttribute('aria-label', video.getAttribute('aria-label') || 'Gallery video');
			const source = video.dataset.galleryVideoSrc!;
			if (fullVideo.dataset.galleryVideoSrc !== source) {
				fullVideo.pause();
				fullVideo.dataset.galleryVideoSrc = source;
				fullVideo.src = source;
				fullVideo.poster = video.dataset.galleryVideoPoster || '';
			}
			if (!video.src) {
				video.src = source;
				video.poster = video.dataset.galleryVideoPoster || '';
			}
		} else return;

		// Resolve lazily because later section galleries may not exist when this component connects.
		const trigger = gallery.ownerDocument.querySelector<HTMLElement>(
			`.gallery__trigger[data-gallery-index="${activeIndex}"], [data-gallery-video-trigger][data-gallery-index="${activeIndex}"]`,
		);
		const description = image?.alt || video?.getAttribute('aria-label') || 'Video';
		caption.textContent = mobile.matches ? description
			: trigger?.closest('figure')?.querySelector('.gallery__caption-text')?.textContent || description;
		count.textContent = `Item ${activeIndex + 1} of ${slides.length}`;
		dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeIndex));
		thumbnails.forEach((thumbnail, i) => thumbnail.setAttribute('aria-pressed', String(i === activeIndex)));
		if (align) alignSlide();
		alignThumbnail();
		loadSelectedImage();
		if (dialog.open && activeIndex !== previousIndex) playSelectedVideo();
	};

	// Opening — every tile starts the viewer at the image the user selected.
	gallery.ownerDocument.addEventListener('click', event => {
		if (!(event.target instanceof Element)) return;
		const trigger = event.target.closest<HTMLElement>(
			'.gallery__trigger[data-gallery-index], [data-gallery-video-trigger][data-gallery-index]',
		);
		if (!trigger || !gallery.ownerDocument.contains(trigger)) return;
		const index = Number(trigger.dataset.galleryIndex);
		if (!Number.isInteger(index) || index < 0 || index >= slides.length) return;
		// Preserve shortcuts for opening the image or video source in another browser tab.
		if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;

		event.preventDefault();
		showImage(index);
		dialog.showModal();
		alignSlide();
		alignThumbnail();
		loadSelectedImage();
		playSelectedVideo();
	}, options);

	// Mobile swiping — native scroll snapping moves the images with the user's thumb.
	track.addEventListener('scroll', () => {
		if (!mobile.matches || !dialog.open || !track.clientWidth) return;
		const index = Math.round(track.scrollLeft / track.clientWidth);
		showImage(Math.max(0, Math.min(slides.length - 1, index)), false);
	}, { ...options, passive: true });

	// Viewer controls — desktop arrows and thumbnails share the same selection logic.
	dialog.querySelector('[data-gallery-close]')?.addEventListener('click', () => dialog.close(), options);
	dialog.querySelector('[data-gallery-prev]')?.addEventListener('click', () => showImage(activeIndex - 1), options);
	dialog.querySelector('[data-gallery-next]')?.addEventListener('click', () => showImage(activeIndex + 1), options);
	thumbnails.forEach((thumbnail, index) => thumbnail.addEventListener('click', () => showImage(index), options));

	// Keyboard and backdrop — Escape and focus restoration use native dialog behavior.
	dialog.addEventListener('keydown', event => {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

		event.preventDefault();
		showImage(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1
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
	dialog.addEventListener('close', () => {
		fullVideo.pause();
		slides.forEach((slide) => slide.querySelector<HTMLVideoElement>('video')?.pause());
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
