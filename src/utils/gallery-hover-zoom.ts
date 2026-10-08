/** Cursor-following magnification inside the open desktop image viewer. */
export function setupGalleryHoverZoom(gallery: HTMLElement, options: AddEventListenerOptions) {
	// Setup — limit mouse inspection to the desktop lightbox.
	// Match the desktop breakpoint in gallery.css; touch input retains its hold gesture.
	const hover = window.matchMedia('(min-width: 801px) and (any-hover: hover)');
	const dialog = gallery.querySelector<HTMLDialogElement>('.gallery__viewer');
	if (!dialog) return () => {};

	const frames = Array.from(dialog.querySelectorAll<HTMLElement>('.gallery__stage'));

	// Overlay creation — keep the original image and its controls clickable underneath.
	const overlays = frames.map(frame => {
		const image = frame.querySelector('img')!;
		const overlay = document.createElement('span');
		overlay.className = 'gallery__hover-zoom';
		overlay.setAttribute('aria-hidden', 'true');
		frame.append(overlay);
		const reset = () => overlay.classList.remove('is-active');

		// Cursor coordinates — measure only the visible image, excluding viewer margins.
		const inspect = (event: PointerEvent) => {
			if (
				!dialog.open ||
				!hover.matches ||
				event.pointerType !== 'mouse' ||
				event.buttons ||
				!image.complete ||
				!image.naturalWidth
			) {
				reset();
				return;
			}
			const bounds = image.getBoundingClientRect();
			const frameBounds = frame.getBoundingClientRect();
			// object-fit: contain leaves margins around portrait images in the viewer.
			const scale = Math.min(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
			const width = image.naturalWidth * scale;
			const height = image.naturalHeight * scale;
			const left = bounds.left + (bounds.width - width) / 2;
			const top = bounds.top + (bounds.height - height) / 2;
			const x = event.clientX - left;
			const y = event.clientY - top;
			if (!width || !height || x < 0 || x > width || y < 0 || y > height) {
				reset();
				return;
			}
			// At 2×, the point under the cursor stays under it as the crop follows movement.
			Object.assign(overlay.style, {
				left: `${left - frameBounds.left}px`,
				top: `${top - frameBounds.top}px`,
				width: `${width}px`,
				height: `${height}px`,
				backgroundImage: `url(${JSON.stringify(image.currentSrc || image.src)})`,
				backgroundSize: `${width * 2}px ${height * 2}px`,
				backgroundPosition: `${-x}px ${-y}px`,
			});
			overlay.classList.add('is-active');
		};

		// Per-image listeners — inspect on hover and reset when interaction ends.
		frame.addEventListener('pointerenter', inspect, options);
		frame.addEventListener('pointermove', inspect, options);
		for (const type of ['pointerleave', 'pointerdown', 'pointercancel']) frame.addEventListener(type, reset, options);
		image.addEventListener('load', reset, options);
		return overlay;
	});

	// Global resets — image changes, dialog closure, and viewport changes end inspection.
	const resetAll = () => overlays.forEach(overlay => overlay.classList.remove('is-active'));
	for (const type of ['click', 'keydown']) gallery.addEventListener(type, resetAll, options);
	dialog.addEventListener('close', resetAll, options);
	hover.addEventListener('change', resetAll, options);
	for (const type of ['resize', 'blur', 'scroll'])
		window.addEventListener(type, resetAll, { ...options, passive: true });

	// Teardown — setupGallery aborts the shared listeners before removing these overlays.
	return () => overlays.forEach(overlay => overlay.remove());
}
