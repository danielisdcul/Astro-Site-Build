/** A quick downward swipe dismisses the mobile viewer without taking over horizontal swipes. */
export function setupGalleryDismiss(
	gallery: HTMLElement,
	mobile: MediaQueryList,
	options: AddEventListenerOptions,
) {
	// Setup — listen inside the image track, away from the close button and caption.
	const dialog = gallery.querySelector<HTMLDialogElement>('dialog');
	const track = dialog?.querySelector<HTMLElement>('.gallery__swipe-track');
	if (!dialog || !track) return;

	let gesture: {
		id: number;
		x: number;
		y: number;
		time: number;
		downward: boolean;
	} | null = null;
	const reset = () => { gesture = null; };
	const isMagnifying = () => Boolean(track.querySelector('.is-magnifying'));

	// Start — multi-touch and magnification keep their existing behavior.
	track.addEventListener('touchstart', event => {
		reset();
		if (!mobile.matches || !dialog.open || event.touches.length !== 1 || isMagnifying()) return;
		const touch = event.touches[0];
		gesture = {
			id: touch.identifier,
			x: touch.clientX,
			y: touch.clientY,
			time: event.timeStamp,
			downward: false,
		};
	}, { ...options, passive: true });

	// Direction — only claim a downward movement; horizontal swiping stays native.
	track.addEventListener('touchmove', event => {
		if (!gesture) return;
		if (event.touches.length !== 1 || isMagnifying()) return reset();
		const touch = event.touches[0];
		if (touch.identifier !== gesture.id) return reset();
		const dx = Math.abs(touch.clientX - gesture.x);
		const dy = touch.clientY - gesture.y;
		if (!gesture.downward && Math.hypot(dx, dy) > 12) {
			if (dy <= dx * 1.5) return reset();
			gesture.downward = true;
		}
		if (gesture.downward && event.cancelable) event.preventDefault();
	}, { ...options, passive: false });

	// Finish — require distance, speed, and a mostly vertical motion to avoid accidental closing.
	track.addEventListener('touchend', event => {
		const start = gesture;
		reset();
		if (!start?.downward || event.touches.length || !mobile.matches || !dialog.open || isMagnifying()) return;
		const touch = Array.from(event.changedTouches).find(touch => touch.identifier === start.id);
		if (!touch) return;
		const distance = touch.clientY - start.y;
		const duration = event.timeStamp - start.time;
		if (
			distance >= 70 && distance > Math.abs(touch.clientX - start.x) * 1.5 &&
			duration > 0 && duration <= 400 && distance / duration >= 0.5
		) dialog.close();
	}, { ...options, passive: true });

	// Reset — never carry a partial gesture across cancellation or viewport changes.
	track.addEventListener('touchcancel', reset, options);
	dialog.addEventListener('close', reset, options);
	mobile.addEventListener('change', reset, options);
	window.addEventListener('blur', reset, options);
	window.addEventListener('resize', reset, options);
}
