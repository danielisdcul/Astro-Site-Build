import { site } from '../site.ts';

// Copy and image references for src/pages/index.astro.
export const home = {
	// Hero
	title: 'I make thoughtful ideas feel useful, clear, and human.',
	intro:
		'I’m a multidisciplinary designer who enjoys bringing ideas to life through branding, graphic design, and digital experiences. I believe the best design starts with curiosity, thoughtful problem-solving, and a genuine understanding of the people it’s made for.',
	heroMeta: ['Values', 'Story', 'Mission'],
	aboutLink: { label: 'More about me', href: '/about/' },
	portrait: {
		src: '/images/portfolio/daniel-portrait.png',
		alt: `Portrait of ${site.name}`,
	},

	// Selected work (the cards use data/projects/)
	workLabel: '01 — Selected Work',
	workHeading: 'My Selected Work',
	workIntro: 'A mix of identity, editorial, and UI/UX work designed to make each interaction feel more considered.',

	// Disciplines
	disciplinesLabel: '02 — Disciplines',
	disciplinesHeading: 'A thoughtful process, from first thought to final detail.',
	disciplinesIntro: 'I work across the places where a brand becomes tangible: its identity, its stories, and the digital experiences people use every day.',
	services: [
		{
			title: 'Web Design',
			description: 'Responsive websites that bring your brand to life through clear content, thoughtful layouts, and purposeful design.',
		},
		{
			title: 'User Experience',
			description: 'Research and data-driven experiences with natural, intuitive layouts that reduce frustration and make every interaction clear, effortless, and positive.',
		},
		{
			title: 'Brand Identity & Visual Design',
			description: 'Distinctive logos, typography, and visual systems that tell your story consistently across print and digital.',
		},
	],

	// Closing callout (the email address comes from site.ts)
	calloutLabel: '03 — Start a conversation',
	calloutHeading: 'Have an idea in mind? Let’s make something clear, useful, and memorable.',
	availability: 'Available for freelance work and open to long-term opportunities.',
};
