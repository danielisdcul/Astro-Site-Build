/** Keep the edge menu's vertical position across pages without changing its handedness. */
export function setupMenuPosition(button: HTMLButtonElement, header: HTMLElement) {
	const storageKey = 'mobileMenuPosition';
	const holdDelay = 100;
	let position: number | null = null;
	let press: { id: number; x: number; y: number; offset: number; dragging: boolean } | null = null;
	let holdTimer: ReturnType<typeof setTimeout> | undefined;
	let suppressClick = false;
	try {
		const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
		// Refresh starts at the middle; following links keeps the position the user chose.
		if (navigation?.type === 'reload') localStorage.removeItem(storageKey);
		const saved = navigation?.type === 'reload' ? null : localStorage.getItem(storageKey);
		if (saved !== null && saved.trim() !== '') {
			const value = Number(saved);
			if (Number.isFinite(value) && value >= 0 && value <= 1) position = value;
		}
	} catch {}

	// A viewport fraction survives orientation changes; CSS keeps the control inside safe areas.
	const applyPosition = (value: number) => {
		position = Math.max(0, Math.min(1, value));
		header.style.setProperty('--nav-center-y', `${position * 100}svh`);
	};
	const savePosition = () => {
		if (position !== null) {
			try { localStorage.setItem(storageKey, String(position)); } catch {}
		}
	};
	if (position !== null) applyPosition(position);
	const moveTo = (center: number) => {
		// Resolve the same viewport units as CSS, including when mobile browser bars collapse.
		const viewportHeight = parseFloat(getComputedStyle(button).maxHeight) || window.innerHeight;
		applyPosition(center / viewportHeight);
		const rect = button.getBoundingClientRect();
		// Store the clamped position so dragging beyond an edge does not create a dead zone.
		applyPosition((rect.top + rect.height / 2) / viewportHeight);
	};
	const finishPress = () => {
		clearTimeout(holdTimer);
		const previous = press;
		press = null;
		button.classList.remove('is-dragging');
		if (previous?.dragging) savePosition();
		if (previous && button.hasPointerCapture(previous.id)) button.releasePointerCapture(previous.id);
	};

	button.addEventListener('pointerdown', (event) => {
		if (!event.isPrimary || event.button !== 0 || press) return;
		suppressClick = false;
		const rect = button.getBoundingClientRect();
		press = { id: event.pointerId, x: event.clientX, y: event.clientY,
			offset: event.clientY - (rect.top + rect.height / 2), dragging: false };
		button.setPointerCapture(event.pointerId);
		holdTimer = setTimeout(() => {
			if (!press) return;
			press.dragging = true;
			suppressClick = true;
			button.classList.add('is-dragging');
		}, holdDelay);
	});
	button.addEventListener('pointermove', (event) => {
		if (!press || event.pointerId !== press.id) return;
		if (press.dragging) {
			moveTo(event.clientY - press.offset);
		} else if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) {
			// Moving before the hold completes is a swipe, not a menu tap.
			suppressClick = true;
			finishPress();
		}
	});
	button.addEventListener('pointerup', (event) => {
		if (press?.id === event.pointerId) finishPress();
	});
	for (const type of ['pointercancel', 'lostpointercapture']) {
		button.addEventListener(type, finishPress);
	}
	button.addEventListener('click', (event) => {
		// Keyboard and assistive-technology clicks should always activate the menu.
		if (suppressClick && event.detail !== 0) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		suppressClick = false;
	}, { capture: true });
	button.addEventListener('contextmenu', (event) => event.preventDefault());
	button.addEventListener('keydown', (event) => {
		if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
		event.preventDefault();
		const rect = button.getBoundingClientRect();
		moveTo(rect.top + rect.height / 2 + (event.key === 'ArrowUp' ? -20 : 20));
		savePosition();
	});
	window.addEventListener('blur', finishPress);
	window.addEventListener('resize', finishPress);
}
