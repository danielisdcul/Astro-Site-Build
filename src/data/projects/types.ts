import type { GalleryOptions } from '../gallery.ts';

// Reusable facts and links used in project introductions and content sections.
export type Detail = {
	label: string;
	value: string;
};

export type ProjectLink = {
	label: string;
	href: string;
};

/** A narrative section; optional fields control its paragraphs, lists, facts, and link. */
export type ProjectSection = {
	title: string;
	lead?: string;
	paragraphs?: string[];
	list?: string[];
	listBeforeParagraphs?: boolean;
	details?: Detail[];
	link?: ProjectLink;
};

/** Shared data shape for project cards and case study pages. */
export type Project = {
	// Identity, visibility, and the fallback gallery arrangement.
	title: string;
	slug: string;
	featured: boolean;
	showOnHome: boolean;
	galleryLayout: 'wide-top' | 'wide-bottom';
	type: 'Bespoke case study' | 'Standard case study';

	// Project card content for Home and Work.
	cardTitle: string;
	cardSummary: string;
	cardLabel: string;
	cardMeta: string;
	cardImages: string[];

	// Optional gallery configuration and case study introduction.
	gallery?: GalleryOptions;
	summary: string;
	links?: ProjectLink[];

	// Theme colors and the ordered case study content.
	accent: string;
	accentSoft: string;
	details: Detail[];
	sections: ProjectSection[];
};
