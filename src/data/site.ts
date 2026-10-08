// Shared identity, default metadata, navigation, and contact details.
// Page copy lives in ./pages/; case studies live in ./projects/.
export const site = {
	// Shared identity and default page metadata.
	name: 'Daniel Culley',
	brand: 'Culley Design',
	title: 'Selected work',
	description:
		'I’m a multidisciplinary designer who enjoys bringing ideas to life through branding, graphic design, and digital experiences.',

	// Contact details reused across pages and the footer.
	email: 'dculleydesign@gmail.com',
	socialLinks: [
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/culleydesign/' },
	],

	// Main navigation links, displayed in this order.
	navigation: [
		{ href: '/work/', label: 'Work' },
		{ href: '/about/', label: 'About' },
		{ href: '/contact/', label: 'Contact' },
	],
};

// The email address above is also used for the home-page link text.
export const emailLink = {
	label: 'Email',
	href: `mailto:${site.email}`,
};
