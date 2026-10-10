/** Freeze mobile menu geometry while browser toolbars expand or collapse. */
export function setupStableMenuViewport(header: HTMLElement) {
	let width = window.innerWidth;
	let pending = false;

	const measure = () => {
		pending = false;
		width = window.innerWidth;
		// Resolve the small viewport and safe area independently of the menu's saved position.
		const probe = document.createElement('div');
		probe.style.cssText = 'position: fixed; top: 0; left: 0; width: 0; height: 100vh; height: 100svh; padding-bottom: env(safe-area-inset-bottom, 0px); box-sizing: border-box; visibility: hidden; pointer-events: none;';
		probe.setAttribute('aria-hidden', 'true');
		document.body.append(probe);
		const style = getComputedStyle(probe);
		const height = parseFloat(style.height);
		const bottomInset = parseFloat(style.paddingBottom) || 0;
		probe.remove();
		if (height > 0) {
			header.style.setProperty('--nav-viewport-height', `${height}px`);
			header.style.setProperty('--nav-safe-area-bottom', `${bottomInset}px`);
		}
	};

	const schedule = () => {
		if (pending) return;
		pending = true;
		requestAnimationFrame(measure);
	};
	measure();
	// Toolbar changes only affect height; a width change requires fresh menu geometry.
	window.addEventListener('resize', () => {
		if (window.innerWidth !== width) schedule();
	});
	// Re-measure even when a device rotation retains the same viewport width.
	window.addEventListener('orientationchange', schedule);
	window.screen.orientation?.addEventListener('change', schedule);
}
