import { site } from '../site.ts';
import type { AboutPage } from './types.ts';

// Copy for src/pages/about.astro.
export const about: AboutPage = {
	// Browser title and page description.
	metadata: {
		title: 'About',
		description: `About ${site.name} and selected work.`,
	},

	// Visible page introduction.
	eyebrow: 'About',
	portrait: site.portrait,
	title: 'Hi, I’m Daniel',
	intro:
		'I’m a multidisciplinary designer based in San Diego. I believe thoughtful design begins with curiosity, empathy, and a clear understanding of the people it serves. I value simplicity, honest communication, and purposeful decisions, creating work that is visually engaging, useful, intuitive, and built to last.',

	// Biography sections and education details, shown in this order.
	sections: [
		{
			title: 'My Approach to Design',
			body:
				'I’ve always been drawn to design because it’s a way to solve problems creatively. Whether I’m building a brand, designing a website, or laying out a printed piece, I enjoy figuring out how all the pieces come together to create something that’s clear, intuitive, and enjoyable to use. Good design should look great, but it should also have a purpose.',
		},
		{
			title: 'Education',
			body:
				'I earned my Bachelor of Science in Graphic Information Technology from Arizona State University with a concentration in User Experience. My education combined graphic design with Human Systems Engineering, teaching me to think beyond how something looks and focus on how people actually interact with it. That perspective continues to shape every project I take on, helping me create work that’s both visually engaging and genuinely useful.',
			degrees: [
				{
					degree: 'Bachelor of Science',
					major: 'Graphic Information Technology',
					concentration: 'User Experience',
					school: 'Arizona State University',
					honors: 'Magna Cum Laude',
					year: 2026,
				},
				{
					degree: 'Associate of Arts',
					major: 'Web Development and Design',
					school: 'MiraCosta College',
					year: 2022,
				},
				{
					degree: 'Associate of Arts',
					major: 'Communications',
					school: 'MiraCosta College',
					year: 2023,
				},
				{
					degree: 'Associate of Arts',
					major: 'Liberal Arts',
					concentration: 'Social and Behavioral Sciences',
					school: 'MiraCosta College',
					year: 2023,
				},
			],
		},
		{
			title: 'Beyond Design',
			body:
				'When I’m not designing, you’ll probably find me spending time with my wife and daughter or somewhere outside. I love hiking, camping, fishing, and exploring new places. The outdoors is where I do some of my best thinking. It’s also where I’m reminded that the best design often feels effortless because every part serves a purpose. That’s something I try to carry into my own work.',
		},
		{
			title: 'What I Hope to Create',
			body:
				'At the end of the day, I want to create work that helps people. Whether it’s a logo, a website, or a printed piece, my goal is to make something that’s thoughtful, functional, and built to last. If it solves a real problem and leaves a positive impression, then I’ve done my job.',
		},
	],
};
