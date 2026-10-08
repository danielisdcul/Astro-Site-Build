import type { GalleryOptions, GalleryVideoOptions } from '../gallery.ts';
import type { ContentLink } from '../types.ts';

// Reusable facts and links used in project introductions and content sections.
export type ProjectDetail = {
	label: string;
	value: string;
};

/** A narrative section; optional fields control its paragraphs, lists, facts, and link. */
export type ProjectSection = {
	title: string;
	/** Override the generated jump-nav hierarchy: 1 is a section, 2 is a subsection. */
	navigationLevel?: 1 | 2;
	lead?: string;
	paragraphs?: string[];
	list?: string[];
	listBeforeParagraphs?: boolean;
	details?: ProjectDetail[];
	link?: ContentLink;
	gallery?: GalleryOptions;
	videos?: GalleryVideoOptions[];
};

/** Shared data shape for project cards and case study pages. */
export type Project = {
	// Identity and case study presentation.
	title: string;
	slug: string;
	featured: boolean;
	showOnHome: boolean;
	type: 'Bespoke case study' | 'Standard case study';

	// Project card content for Home and Work.
	/** Card arrangement; also used when a project omits its main gallery configuration. */
	cardLayout: 'wide-top' | 'wide-bottom';
	cardTitle: string;
	cardSummary: string;
	cardLabel: string;
	/** Extra metadata shown only on a featured Home card. */
	cardMeta?: string;
	cardImages: string[];

	// Optional gallery configuration and case study introduction.
	gallery?: GalleryOptions;
	summary: string;
	links?: ContentLink[];

	// Introductory facts and the ordered case study content.
	details: ProjectDetail[];
	sections: ProjectSection[];
};
