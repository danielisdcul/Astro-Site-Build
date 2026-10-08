/** One section link, optionally containing subsections. */
export type SectionNavigationItem = {
	id: string;
	title: string;
	children: SectionNavigationItem[];
};

type NavigableSection = { title: string; navigationLevel?: 1 | 2 };

const topLevelTitles = /^(project overview|overview|tools used|skills demonstrated|key takeaways|project reflection|results|conclusion)$/i;
const phaseTitle = /^phase\s+\d+/i;

/** Create a section tree and stable, unique anchors from the content a page already renders. */
export function createSectionNavigation(sections: readonly NavigableSection[]): SectionNavigationItem[] {
	const roots: SectionNavigationItem[] = [];
	let currentPhase: SectionNavigationItem | undefined;
	let currentParent: SectionNavigationItem | undefined;

	sections.forEach(({ title, navigationLevel }, index) => {
		const slug = title
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') || 'content';

		const item = { id: `section-${index + 1}-${slug}`, title, children: [] };
		const isPhase = phaseTitle.test(title);
		const isTopLevel = navigationLevel === 1 || (navigationLevel !== 2 && (isPhase || topLevelTitles.test(title)));

		// An explicit subsection belongs to the latest root, even when it is not a phase.
		if (navigationLevel === 2 && currentParent) {
			currentParent.children.push(item);
		} else if (isTopLevel || !currentPhase) {
			roots.push(item);
			currentParent = item;
			currentPhase = isPhase ? item : undefined;
		} else {
			currentPhase.children.push(item);
		}
	});

	return roots;
}

/** Flatten the tree in document order for assigning IDs to rendered sections. */
export function flattenSectionNavigation(items: SectionNavigationItem[]): SectionNavigationItem[] {
	return items.flatMap((item) => [item, ...flattenSectionNavigation(item.children)]);
}
