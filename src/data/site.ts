import type { ContentLink, SiteData } from './types.ts';

const designerName = 'Daniel Culley';

// Shared identity, default metadata, navigation, and contact details.
// Page copy lives in ./pages/; case studies live in ./projects/.
export const site = {
	// Shared identity and default page metadata.
	name: designerName,
	brand: 'Culley Design',
	title: 'Selected work',
	description:
		'I’m a multidisciplinary designer who enjoys bringing ideas to life through branding, graphic design, and digital experiences.',

	// Profile and contact details shared by pages and the footer.
	email: 'dculleydesign@gmail.com',
	portrait: {
		src: '/images/portfolio/daniel-portrait.png',
		alt: `Portrait of ${designerName}`,
	},
	socialLinks: [
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/culleydesign/' },
	],

	// Main navigation links, displayed in this order.
	navigation: [
		{ href: '/work/', label: 'Work' },
		{ href: '/about/', label: 'About' },
		{ href: '/contact/', label: 'Contact' },
	],
} satisfies SiteData;

// The email address above is also used for the home-page link text.
export const emailLink = {
	label: 'Email',
	href: `mailto:${site.email}`,
} satisfies ContentLink;
