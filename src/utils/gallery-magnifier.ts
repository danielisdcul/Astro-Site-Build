/** Hold an image to inspect it in the full frame; a quick swipe stays native. */
export function setupGalleryMagnifier(
	gallery: HTMLElement,
	mobile: MediaQueryList,
	options: AddEventListenerOptions,
) {
	// Setup — magnify only the images inside the mobile lightbox, leaving tiles tappable.
	const dialog = gallery.querySelector<HTMLDialogElement>('dialog');
	const track = dialog?.querySelector<HTMLElement>('.gallery__swipe-track');
	if (!dialog || !track) return () => {};

	const media = Array.from(track.querySelectorAll<HTMLElement>('.gallery__media'));
	const images = media.map(frame => frame.querySelector('img')!);
	const holdDelay = 200;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let selection: {
		frame: HTMLElement;
		image: HTMLImageElement;
		rect: DOMRect;
		x: number;
		y: number;
		pointer?: number;
		active: boolean;
	} | null = null;

	// Reset — clear the pending hold, remove the zoom, and release the captured pointer.
	const stop = () => {
		clearTimeout(timer);
		const previous = selection;
		selection = null;
		if (!previous) return;
		previous.frame.classList.remove('is-magnifying');
		for (const property of [
			'--gallery-zoom-image',
			'--gallery-zoom-size',
			'--gallery-zoom-position',
		]) previous.frame.style.removeProperty(property);

		if (previous.pointer !== undefined && previous.frame.hasPointerCapture(previous.pointer))
			previous.frame.releasePointerCapture(previous.pointer);
	};

	// Magnified crop — center the selected region while keeping the frame filled.
	const render = () => {
		if (!selection?.active) return;
		const { frame, rect, x, y } = selection;
		// Cover the entire frame even for very wide images; clamp the crop at the image edges.
		const zoom = Math.max(3, frame.clientWidth / rect.width, frame.clientHeight / rect.height);
		const width = rect.width * zoom;
		const height = rect.height * zoom;
		const left = Math.max(frame.clientWidth - width, Math.min(0, frame.clientWidth / 2 - x * zoom));
		const top = Math.max(frame.clientHeight - height, Math.min(0, frame.clientHeight / 2 - y * zoom));
		frame.style.setProperty('--gallery-zoom-size', `${width}px ${height}px`);
		frame.style.setProperty('--gallery-zoom-position', `${left}px ${top}px`);
	};

	// Activation — paint the selected image and capture touch movement after the hold.
	const activate = () => {
		if (!selection) return;
		const { frame, image, pointer } = selection;
		selection.active = true;
		frame.style.setProperty('--gallery-zoom-image', `url(${JSON.stringify(image.currentSrc || image.src)})`);
		render();
		frame.classList.add('is-magnifying');
		if (pointer !== undefined) frame.setPointerCapture(pointer);
	};

	// Accessibility — expose keyboard instructions only in the mobile carousel.
	const updateMode = () => {
		stop();
		media.forEach(frame => {
			if (mobile.matches) {
				frame.tabIndex = 0;
				frame.setAttribute('role', 'group');
				frame.setAttribute('aria-label', 'Image magnifier');
				frame.setAttribute(
					'aria-description',
					'Hold to magnify, move to inspect, and release to reset. With a keyboard, use Enter to zoom, arrow keys to inspect, and Escape to reset.'
				);
			} else {
				for (const attribute of ['tabindex', 'role', 'aria-label', 'aria-description']) frame.removeAttribute(attribute);
			}
		});
	};

	// Image interactions — distinguish a short swipe from a hold, then track inspection.
	media.forEach((frame, index) => {
		const image = images[index];
		image.addEventListener('load', () => {
			if (selection?.frame === frame) stop();
		}, options);
		frame.addEventListener('pointerdown', event => {
			if (!mobile.matches || !dialog.open) return;
			if (!event.isPrimary) {
				stop();
				return;
			}
			if (event.button !== 0 || !image.complete || !image.naturalWidth) return;
			stop();
			const rect = image.getBoundingClientRect();
			if (
				event.clientX < rect.left ||
				event.clientX > rect.right ||
				event.clientY < rect.top ||
				event.clientY > rect.bottom
			) return;
			selection = {
				frame,
				image,
				rect,
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
				pointer: event.pointerId,
				active: false,
			};
			timer = setTimeout(activate, holdDelay);
		}, options);

		frame.addEventListener('pointermove', event => {
			if (!selection || selection.pointer !== event.pointerId) return;
			const x = event.clientX - selection.rect.left;
			const y = event.clientY - selection.rect.top;
			if (!selection.active) {
				if (Math.hypot(x - selection.x, y - selection.y) > 8) stop();
				return;
			}
			selection.x = Math.max(0, Math.min(selection.rect.width, x));
			selection.y = Math.max(0, Math.min(selection.rect.height, y));
			render();
		}, options);
		for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) frame.addEventListener(type, stop, options);
		frame.addEventListener('pointerleave', () => {
			if (selection?.frame === frame && !selection.active) stop();
		}, options);

		frame.addEventListener('contextmenu', event => {
			if (mobile.matches) event.preventDefault();
		}, options);

		// Keyboard inspection — toggle zoom, move through the image, or reset with Escape.
		frame.addEventListener('keydown', event => {
			if (!mobile.matches) return;
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				event.stopPropagation();
				if (selection?.active) {
					stop();
					return;
				}
				if (!image.complete || !image.naturalWidth) return;
				stop();
				const rect = image.getBoundingClientRect();
				selection = {
					frame,
					image,
					rect,
					x: rect.width / 2,
					y: rect.height / 2,
					active: false,
				};
				activate();
			} else if (
				selection?.active &&
				selection.frame === frame &&
				(event.key.startsWith('Arrow') || event.key === 'Escape')
			) {
				event.preventDefault();
				event.stopPropagation();
				if (event.key === 'Escape') {
					stop();
					return;
				}
				selection.x = Math.max(
					0,
					Math.min(
						selection.rect.width,
						selection.x + (event.key === 'ArrowLeft' ? -20 : event.key === 'ArrowRight' ? 20 : 0)
					)
				);
				selection.y = Math.max(
					0,
					Math.min(
						selection.rect.height,
						selection.y + (event.key === 'ArrowUp' ? -20 : event.key === 'ArrowDown' ? 20 : 0)
					)
				);
				render();
			}
		}, options);

		frame.addEventListener('focusout', () => {
			if (selection?.frame === frame) stop();
		}, options);
	});

	// Gesture coordination — release magnification for pinch zoom, scrolling, or viewport changes.
	// Prevent native panning only after a hold activates magnification. Swipes and pinch zoom stay available.
	track.addEventListener('touchmove', event => {
		if (
			selection?.active &&
			selection.pointer !== undefined &&
			event.touches.length === 1 &&
			event.cancelable
		) event.preventDefault();
	}, { ...options, passive: false });

	track.addEventListener('touchstart', event => {
		if (event.touches.length > 1) stop();
	}, { ...options, passive: true });

	track.addEventListener('scroll', stop, { ...options, passive: true });
	dialog.addEventListener('close', stop, options);
	mobile.addEventListener('change', updateMode, options);
	window.addEventListener('resize', stop, options);
	window.addEventListener('blur', stop, options);
	window.addEventListener('scroll', stop, { ...options, passive: true });

	// Initialization and teardown — restore a clean frame when the gallery disconnects.
	updateMode();

	return () => {
		stop();
		media.forEach(frame => {
			for (const attribute of ['tabindex', 'role', 'aria-label', 'aria-description']) frame.removeAttribute(attribute);
		});
	};
}
