import { setupStableMenuViewport } from './stable-menu-viewport';

/** Keep the edge menu's vertical position across pages without changing its handedness. */
export function setupMenuPosition(button: HTMLButtonElement, header: HTMLElement) {
	setupStableMenuViewport(header);
	// Configuration and press state — positions are stored as a viewport fraction.
	const storageKey = 'mobileMenuPosition';
	const holdDelay = 100;
	let position: number | null = null;
	let press: {
		id: number;
		x: number;
		y: number;
		offset: number;
		dragging: boolean;
	} | null = null;
	let holdTimer: ReturnType<typeof setTimeout> | undefined;
	let suppressClick = false;

	// Saved position — refresh resets to the middle; navigation restores the last placement.
	try {
		const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
		if (navigation?.type === 'reload') localStorage.removeItem(storageKey);
		const saved = navigation?.type === 'reload' ? null : localStorage.getItem(storageKey);
		if (saved !== null && saved.trim() !== '') {
			const value = Number(saved);
			if (Number.isFinite(value) && value >= 0 && value <= 1) position = value;
		}
	} catch {
		// Storage may be unavailable; the menu can still be repositioned for this page.
	}

	// Position helpers — apply, save, and clamp the control to the CSS drag bounds.
	// A viewport fraction survives orientation changes; CSS keeps the control inside safe areas.
	const applyPosition = (value: number) => {
		position = Math.max(0, Math.min(1, value));
		header.style.setProperty('--nav-center-y', `calc(var(--nav-viewport-height, 100svh) * ${position})`);
	};

	const savePosition = () => {
		if (position !== null) {
			try {
				localStorage.setItem(storageKey, String(position));
			} catch {
				// Saving is optional; retain the current position when storage is blocked.
			}
		}
	};
	if (position !== null) applyPosition(position);

	const moveTo = (center: number) => {
		// Use the same frozen viewport measurement as CSS while browser toolbars change.
		const viewportHeight = parseFloat(getComputedStyle(button).maxHeight) || window.innerHeight;
		applyPosition(center / viewportHeight);
		const rect = button.getBoundingClientRect();
		// Store the clamped position so dragging beyond an edge does not create a dead zone.
		applyPosition((rect.top + rect.height / 2) / viewportHeight);
	};

	// Press cleanup — finish dragging, save the position, and release pointer capture.
	const finishPress = () => {
		clearTimeout(holdTimer);
		const previous = press;
		press = null;
		button.classList.remove('is-dragging');
		if (previous?.dragging) savePosition();
		if (previous && button.hasPointerCapture(previous.id)) button.releasePointerCapture(previous.id);
	};

	// Pointer gestures — a hold starts dragging; early movement cancels a menu tap.
	button.addEventListener('pointerdown', (event) => {
		if (!event.isPrimary || event.button !== 0 || press) return;
		suppressClick = false;
		const rect = button.getBoundingClientRect();
		press = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			offset: event.clientY - (rect.top + rect.height / 2),
			dragging: false,
		};
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

	// Activation — suppress drag-generated clicks while allowing keyboard activation.
	button.addEventListener('click', (event) => {
		// Keyboard and assistive-technology clicks should always activate the menu.
		if (suppressClick && event.detail !== 0) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		suppressClick = false;
	}, { capture: true });

	button.addEventListener('contextmenu', (event) => event.preventDefault());

	// Keyboard positioning — move the control vertically in small steps.
	button.addEventListener('keydown', (event) => {
		if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
		event.preventDefault();
		const rect = button.getBoundingClientRect();
		moveTo(rect.top + rect.height / 2 + (event.key === 'ArrowUp' ? -20 : 20));
		savePosition();
	});

	// Interrupted gestures — finish the press when focus or viewport size changes.
	window.addEventListener('blur', finishPress);
	window.addEventListener('resize', finishPress);
}
