import type { Project } from './types.ts';

export const hum: Project = {
	title: 'Hum: Book Design and Illustration',
	slug: 'hum',
	featured: false,
	showOnHome: true,
	galleryLayout: 'wide-bottom',
	type: 'Standard case study',
	cardTitle: 'Hum',
	cardSummary: 'A complete book design system for a speculative science-fiction novel set in a dystopian near future where technology has disappeared. The project includes a vintage-inspired cover illustration, dust jacket, hardcover concept, expressive typography, typesetting, and interior layouts designed to create a cohesive reading experience.',
	cardLabel: '03 / Graphic design + Illustration',
	cardMeta: 'Illustration · Editorial · Typography',
	cardImages: [
		'/images/portfolio/hum-book.png',
		'/images/portfolio/hum-jacket.png',
		'/images/portfolio/hum-layout.png',
	],
	summary: 'A complete book design system for a speculative science-fiction novel set in a dystopian near future where technology has disappeared. The project includes a vintage-inspired cover illustration, dust jacket, hardcover concept, expressive typography, typesetting, and interior layouts designed to create a cohesive reading experience.',
	accent: '#526685',
	accentSoft: '#dee6f2',
	details: [
		{ label: 'Categories', value: 'Graphic Design, Print and Publishing' },
		{ label: 'Focus', value: 'Cover illustration, dust jacket, typesetting, and layout' },
	],
	sections: [
		{
			title: 'Overview',
			paragraphs: ['Hum is a speculative science-fiction novel that takes place in a dystopian near future where all technology is permanently disabled by a planet-saving mission that unexpectedly went horribly wrong. The book follows a young protagonist named James as he explores a transformed America and makes peace with his father’s hand in the global disaster.'],
		},
		{
			title: 'Problem Statement',
			paragraphs: ['As a new title in the science fiction space, the novel needed a cover design that would appeal to the target audience as well as typesetting and layout for the book.'],
		},
		{
			title: 'Process',
			paragraphs: ['I began by exploring vintage science fiction book covers and using mood boards to drive my design decisions. I studied the processes behind some of the genre’s most iconic book designs.'],
		},
		{
			title: 'Results',
			paragraphs: ['I created a vintage-style science-fiction cover illustration for the paperback edition and dust jacket, as well as a single-color hardcover design and several typesetting examples.'],
		},
	],
};
