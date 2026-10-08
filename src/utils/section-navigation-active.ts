import { sectionNavigationMobileQuery } from './section-navigation-mobile.ts';

/** Keep the section links and connecting lines in sync with the reading position. */
export function setupSectionNavigationActive(navigation: HTMLElement) {
	// The sidebar shares one hierarchy across desktop and the enhanced mobile rail.
	const list = navigation.querySelector<HTMLElement>('.section-jump__desktop');
	if (!list) return;
	const entries = Array.from(list.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
		.flatMap(link => {
			const target = document.getElementById(link.hash.slice(1));
			const group = link.closest<HTMLElement>('.section-jump__desktop-group');
			return target && group ? [{ link, target, group }] : [];
		});
	if (!entries.length) return;

	const mobile = window.matchMedia(sectionNavigationMobileQuery);
	const rail = navigation.querySelector<HTMLElement>('.section-jump__rail-track');
	const dots = new Map(Array.from(navigation.querySelectorAll<HTMLElement>('.section-jump__rail-dot'))
		.map(dot => [dot.dataset.sectionId, dot]));
	let currentDot: HTMLElement | undefined;
	const header = document.querySelector<HTMLElement>('.site-header');
	let current: typeof entries[number] | undefined;
	let frame = 0;

	// Clear the previous state, then mark the exact link and its main-section group.
	const select = (entry: typeof current) => {
		if (entry === current) return;
		current?.link.removeAttribute('aria-current');
		current?.group.classList.remove('is-current-section');
		current?.group.style.removeProperty('--section-jump-child-position');
		currentDot?.classList.remove('is-current-section');
		current = entry;
		list.toggleAttribute('data-current-section', Boolean(entry));
		entry?.link.setAttribute('aria-current', 'location');
		entry?.group.classList.add('is-current-section');
		const sectionLink = entry?.group.querySelector<HTMLAnchorElement>(':scope > a');
		currentDot = sectionLink ? dots.get(sectionLink.hash.slice(1)) : undefined;
		currentDot?.classList.add('is-current-section');
		rail?.toggleAttribute('data-current-section', Boolean(currentDot));
	};

	const update = () => {
		frame = 0;
		if (mobile.matches && !navigation.hasAttribute('data-mobile-ready')) return select(undefined);

		// The reading boundary matches the section anchors' 64px clearance below the header.
		const boundary = (header?.getBoundingClientRect().bottom ?? 0) + 65;
		let next: typeof current;
		const visibleEntries = entries.filter(entry => mobile.matches || !entry.group.hasAttribute('data-mobile-only'));
		for (const entry of visibleEntries) {
			if (entry.target.getBoundingClientRect().top <= boundary) next = entry;
		}
		// A short final section may never reach the boundary before scrolling runs out.
		if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
			next = visibleEntries[visibleEntries.length - 1];
		}
		select(next);
		if (!current) return;

		// Compact mobile dots use their own spacing, including the gallery link.
		if (mobile.matches && rail && currentDot) {
			const bounds = currentDot.getBoundingClientRect();
			const center = bounds.top + bounds.height / 2 - rail.getBoundingClientRect().top - 4;
			rail.style.setProperty('--section-jump-mobile-active-position', `${center}px`);
		}

		// Locate the fade in the existing rail; these styles never alter layout dimensions.
		const marker = current.group.querySelector<HTMLElement>('.section-jump__marker');
		if (marker) {
			const bounds = marker.getBoundingClientRect();
			const center = bounds.top + bounds.height / 2 - list.getBoundingClientRect().top - 14;
			list.style.setProperty('--section-jump-active-position', `${center}px`);
		}
		const children = current.group.querySelector<HTMLElement>('.section-jump__children');
		if (children) {
			const bounds = current.link.getBoundingClientRect();
			const center = children.contains(current.link)
				? bounds.top + bounds.height / 2 - children.getBoundingClientRect().top
				: 0;
			current.group.style.setProperty('--section-jump-child-position', `${center}px`);
		}
	};

	// Batch scroll events into one update per frame, including restored scroll positions.
	const schedule = () => {
		if (!frame) frame = window.requestAnimationFrame(update);
	};
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	window.addEventListener('pageshow', schedule);
	mobile.addEventListener('change', schedule);
	const observer = new ResizeObserver(schedule);
	observer.observe(document.body);
	observer.observe(list);
	if (rail) observer.observe(rail);
	update();

	return () => {
		window.cancelAnimationFrame(frame);
		window.removeEventListener('scroll', schedule);
		window.removeEventListener('resize', schedule);
		window.removeEventListener('pageshow', schedule);
		mobile.removeEventListener('change', schedule);
		observer.disconnect();
		select(undefined);
	};
}
