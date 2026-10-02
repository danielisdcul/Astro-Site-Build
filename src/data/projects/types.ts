// The fields available when editing a project file.
export type Detail = {
	label: string;
	value: string;
};

export type ProjectSection = {
	title: string;
	lead?: string;
	paragraphs?: string[];
	list?: string[];
	listBeforeParagraphs?: boolean;
	details?: Detail[];
	link?: {
		label: string;
		href: string;
	};
};

export type Project = {
	title: string;
	slug: string;
	featured: boolean;
	showOnHome: boolean;
	galleryLayout: 'wide-top' | 'wide-bottom';
	type: 'Bespoke case study' | 'Standard case study';
	cardTitle: string;
	cardSummary: string;
	cardLabel: string;
	cardMeta: string;
	cardImages: string[];
	summary: string;
	accent: string;
	accentSoft: string;
	details: Detail[];
	sections: ProjectSection[];
};
