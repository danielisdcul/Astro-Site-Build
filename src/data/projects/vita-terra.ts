import type { Project } from './types.ts';

export const vitaTerra: Project = {
	title: 'Vita Terra',
	slug: 'vita-terra',
	featured: false,
	showOnHome: true,
	galleryLayout: 'wide-top',
	type: 'Standard case study',
	cardTitle: 'Vita',
	cardSummary: 'A sustainable clothing brand identity shaped around transparency, ethical production, and thoughtful craftsmanship.',
	cardLabel: '02 / Brand Identity + Campaign',
	cardMeta: 'Brand strategy · Identity · Campaign',
	cardImages: [
		'/images/portfolio/vita-sign.png',
		'/images/portfolio/vita-fabric.png',
		'/images/portfolio/vita-tags.png',
	],
	gallery: {
		layout: 'wide-top',
		images: [
			{ src: '/images/portfolio/vita-sign.png', alt: 'Vita Terra brand sign', caption: 'Brand signage', width: 1600, height: 1066 },
			{ src: '/images/portfolio/vita-fabric.png', alt: 'Vita Terra branding on fabric', caption: 'Fabric branding', width: 1044, height: 1044 },
			{ src: '/images/portfolio/vita-tags.png', alt: 'Vita Terra clothing tags', caption: 'Clothing tags', width: 1600, height: 1200 },
		],
	},
	summary:
		'Vita Terra is a sustainable clothing brand committed to producing high-quality apparel while supporting the farmers who grow its cotton.',
	accent: '#54735a',
	accentSoft: '#dce7dc',
	details: [
		{ label: 'Categories', value: 'Branding, Graphic Design' },
		{ label: 'Focus', value: 'Sustainable clothing brand identity and labeling system' },
	],
	sections: [
		{
			title: 'Overview',
			paragraphs: ['Vita Terra is a sustainable clothing brand committed to producing high-quality apparel while supporting the farmers who grow its cotton. The company prioritizes transparency throughout its supply chain, ensures fair wages for workers, uses only renewable materials, and maintains a 100% plastic-free production process. By combining ethical practices with quality craftsmanship, Vita Terra aims to create clothing that benefits both people and the planet.'],
		},
		{
			title: 'Problem Statement',
			paragraphs: ['Vita Terra needed a cohesive visual identity that clearly communicated its commitment to sustainability, transparency, and ethical production while differentiating the brand within the competitive apparel market.'],
		},
		{
			title: 'Process',
			paragraphs: ['I began by researching competing brands and studying the target audience to guide my design choices. I created mood boards to capture the feeling and direction I wanted for the brand. I worked with my team to refine my design decisions and incorporated feedback into the final design system.'],
		},
		{
			title: 'Results',
			paragraphs: ['I created a cohesive brand identity with a labeling system that effectively reflects the values and goals of the company.'],
		},
	],
};
