export const sectionNavigationMobileQuery = '(max-width: 800px), (orientation: landscape) and (max-height: 500px)';

/** An edge rail opposite the main menu, opened with a tap or an inward swipe. */
export function setupSectionNavigationMobile(navigation: HTMLElement) {
	const header = document.querySelector<HTMLElement>('.site-header');
	const toggle = navigation.querySelector<HTMLButtonElement>('.section-jump__rail-toggle');
	const panel = navigation.querySelector<HTMLElement>('.section-jump__panel');
	const close = navigation.querySelector<HTMLButtonElement>('.section-jump__close');
	if (!header || !toggle || !panel || !close) return;

	// Match the main menu on narrow screens and phones rotated into landscape.
	const mobile = window.matchMedia(sectionNavigationMobileQuery);
	const controller = new AbortController();
	const options = { signal: controller.signal };
	let open = false;
	let mainMenuOpen = false;
	let side = '';
	let press: { id: number; x: number; y: number } | undefined;
	let suppressClick = false;

	// Hide closed links from keyboard navigation as well as from view.
	const setOpen = (value: boolean) => {
		open = value && mobile.matches && !mainMenuOpen;
		navigation.classList.toggle('is-section-jump-open', open);
		toggle.setAttribute('aria-expanded', String(open));
		toggle.setAttribute('aria-label', open ? 'Close section navigation' : 'Open section navigation');
		panel.inert = mobile.matches && !open;
	};

	// Header classes are the source of truth for both handedness and menu visibility.
	const syncHeader = () => {
		const nextSide = header.classList.contains('is-lefty') ? 'right' : 'left';
		mainMenuOpen = header.classList.contains('is-menu-open');
		if (nextSide !== side || mainMenuOpen || !mobile.matches) {
			press = undefined;
			setOpen(false);
		}
		side = nextSide;
		navigation.dataset.side = side;
		navigation.toggleAttribute('data-main-menu-open', mobile.matches && mainMenuOpen);
		navigation.inert = mobile.matches && mainMenuOpen;
		panel.inert = mobile.matches && !open;
	};
	navigation.setAttribute('data-mobile-ready', '');
	syncHeader();
	const observer = new MutationObserver(syncHeader);
	observer.observe(header, { attributes: true, attributeFilter: ['class'] });
	mobile.addEventListener('change', syncHeader, options);

	// The rail owns horizontal swipes; vertical movement remains native page scrolling.
	toggle.addEventListener('pointerdown', event => {
		if (!mobile.matches || mainMenuOpen || !event.isPrimary || event.button !== 0) return;
		press = { id: event.pointerId, x: event.clientX, y: event.clientY };
		suppressClick = false;
		toggle.setPointerCapture(event.pointerId);
	}, options);
	toggle.addEventListener('pointermove', event => {
		if (!press || event.pointerId !== press.id) return;
		const dx = event.clientX - press.x;
		const dy = event.clientY - press.y;
		if (Math.hypot(dx, dy) < 10) return;
		suppressClick = true;
		if (Math.abs(dy) >= Math.abs(dx)) {
			press = undefined;
			return;
		}
		const inward = side === 'left' ? dx : -dx;
		if (inward >= 24 || inward <= -24) {
			setOpen(inward > 0);
			press = undefined;
		}
	}, options);
	for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
		toggle.addEventListener(type, () => { press = undefined; }, options);
	}
	toggle.addEventListener('click', event => {
		if (suppressClick && event.detail !== 0) {
			suppressClick = false;
			return;
		}
		setOpen(!open);
	}, options);

	// Close with the visible button, a section selection, an outside tap, or Escape.
	close.addEventListener('click', () => {
		setOpen(false);
		toggle.focus({ preventScroll: true });
	}, options);
	panel.addEventListener('click', event => {
		if (mobile.matches && (event.target as Element).closest('a')) {
			setOpen(false);
			toggle.focus({ preventScroll: true });
		}
	}, options);
	document.addEventListener('pointerdown', event => {
		if (open && !navigation.contains(event.target as Node)) setOpen(false);
	}, options);
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && open) {
			setOpen(false);
			toggle.focus({ preventScroll: true });
		}
	}, options);
	navigation.addEventListener('focusout', event => {
		if (open && !navigation.contains(event.relatedTarget as Node)) setOpen(false);
	}, options);

	return () => {
		controller.abort();
		observer.disconnect();
		setOpen(false);
		navigation.inert = false;
		panel.inert = false;
		navigation.removeAttribute('data-mobile-ready');
		navigation.removeAttribute('data-main-menu-open');
		delete navigation.dataset.side;
	};
}
