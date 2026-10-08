import type { Project } from './types.ts';

export const hum: Project = {
	// Identity and display settings for project pages and cards.
	title: 'Hum: Book Design and Illustration',
	slug: 'hum',
	featured: false,
	showOnHome: true,
	galleryLayout: 'wide-bottom',
	type: 'Standard case study',

	// Preview copy and images shown on Home and Work.
	cardTitle: 'Hum',
	cardSummary:
		'A complete book design system for a speculative science-fiction novel set in a dystopian near future where technology has disappeared. The project includes a vintage-inspired cover illustration, dust jacket, hardcover concept, expressive typography, typesetting, and interior layouts designed to create a cohesive reading experience.',
	cardLabel: '03 / Graphic design + Illustration',
	cardMeta: 'Illustration · Editorial · Typography',
	cardImages: [
		'/images/portfolio/hum-book.png',
		'/images/portfolio/hum-jacket.png',
		'/images/portfolio/hum-layout.png',
	],

	// Case study gallery: image descriptions, captions, and original dimensions.
	gallery: {
		layout: 'wide-bottom',
		images: [
			{
				src: '/images/portfolio/hum-book.png',
				previewSrc: '/images/portfolio/previews/hum-book.webp',
				alt: 'Hum book cover design',
				caption: 'Book cover design',
				width: 1600,
				height: 1200,
			},
			{
				src: '/images/portfolio/hum-jacket.png',
				previewSrc: '/images/portfolio/previews/hum-jacket.webp',
				alt: 'Hum dust jacket design',
				caption: 'Dust jacket',
				width: 1600,
				height: 1200,
			},
			{
				src: '/images/portfolio/hum-layout.png',
				previewSrc: '/images/portfolio/previews/hum-layout.webp',
				alt: 'Hum interior page layouts',
				caption: 'Interior layouts and typography',
				width: 3588,
				height: 1600,
			},
		],
	},

	// Opening summary and optional links for the case study.
	summary:
		'A complete book design system for a speculative science-fiction novel set in a dystopian near future where technology has disappeared. The project includes a vintage-inspired cover illustration, dust jacket, hardcover concept, expressive typography, typesetting, and interior layouts designed to create a cohesive reading experience.',

	// Project colors used by cards and case study styling.
	accent: '#526685',
	accentSoft: '#dee6f2',

	// Short project facts displayed alongside the introduction.
	details: [
		{ label: 'Categories', value: 'Graphic Design, Print and Publishing' },
		{ label: 'Focus', value: 'Cover illustration, dust jacket, typesetting, and layout' },
	],

	// Case study narrative, rendered in the order below.
	sections: [
		{
			title: 'Overview',
			paragraphs: [
				'Hum is a speculative science-fiction novel that takes place in a dystopian near future where all technology is permanently disabled by a planet-saving mission that unexpectedly went horribly wrong. The book follows a young protagonist named James as he explores a transformed America and makes peace with his father’s hand in the global disaster.',
			],
		},
		{
			title: 'Problem Statement',
			paragraphs: [
				'As a new title in the science fiction space, the novel needed a cover design that would appeal to the target audience as well as typesetting and layout for the book.',
			],
		},
		{
			title: 'Process',
			paragraphs: [
				'I began by exploring vintage science fiction book covers and using mood boards to drive my design decisions. I studied the processes behind some of the genre’s most iconic book designs.',
			],
		},
		{
			title: 'Results',
			paragraphs: [
				'I created a vintage-style science-fiction cover illustration for the paperback edition and dust jacket, as well as a single-color hardcover design and several typesetting examples.',
			],
		},
	],
};
