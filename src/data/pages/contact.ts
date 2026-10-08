import { site } from '../site.ts';
import type { PageIntroduction } from './types.ts';

// Copy for src/pages/contact.astro. Shared links are in ../site.ts.
export const contact = {
	// Browser title and page description.
	metadata: {
		title: 'Contact',
		description: `Get in touch with ${site.name}.`,
	},

	// Visible page introduction.
	eyebrow: 'Contact',
	title: 'I’d love to work with you.',
	intro:
		'Feel free to reach out via email or one of the social channels listed below, and I’ll get back to you as soon as I can.',
} satisfies PageIntroduction;
