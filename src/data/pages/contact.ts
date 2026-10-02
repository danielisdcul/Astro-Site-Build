import { site } from '../site.ts';

// Copy for src/pages/contact.astro. Shared links are in ../site.ts.
export const contact = {
	metadata: {
		title: 'Contact',
		description: `Get in touch with ${site.name}.`,
	},
	eyebrow: 'Contact',
	title: 'I would love to work with you!',
	intro: 'Feel free to reach out via email or one of the social channels listed below, and I’ll get back to you as soon as I can.',
};
