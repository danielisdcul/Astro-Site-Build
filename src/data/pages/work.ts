import type { PageIntroduction } from './types.ts';

// Copy for src/pages/work.astro.
export const work = {
	// Browser title and page description.
	metadata: {
		title: 'Work',
		description:
			'Explore branding, editorial, web design, and user experience projects by Daniel Culley.',
	},

	// Visible page introduction.
	eyebrow: 'Work',
	title: 'More of my work',
	intro:
		'A broader collection of identity, editorial, web, and user experience projects shaped by thoughtful problem-solving and attention to detail.',
} satisfies PageIntroduction;
