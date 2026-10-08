/** A visible link label and its local, HTTPS, or email destination. */
export type ContentLink = {
	label: string;
	href: string;
};

/** An authored image reference; dimensions and variants come from the generated manifest. */
export type ImageReference = {
	src: string;
	alt: string;
};

/** Identity, default metadata, and navigation shared by every page. */
export type SiteData = {
	name: string;
	brand: string;
	title: string;
	description: string;
	email: string;
	portrait: ImageReference;
	socialLinks: ContentLink[];
	navigation: ContentLink[];
};
