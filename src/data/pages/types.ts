import type { ContentLink, ImageReference } from '../types.ts';

/** Browser metadata is distinct from a page's visible heading and introduction. */
export type PageIntroduction = {
	metadata: { title: string; description: string };
	eyebrow: string;
	title: string;
	intro: string;
};

/** Home has separate content blocks rather than one shared page introduction. */
export type HomePage = {
	title: string;
	intro: string;
	heroMeta: string[];
	aboutLink: ContentLink;
	portrait: ImageReference;
	workLabel: string;
	workHeading: string;
	workIntro: string;
	disciplinesLabel: string;
	disciplinesHeading: string;
	disciplinesIntro: string;
	services: { title: string; description: string }[];
	calloutLabel: string;
	calloutHeading: string;
	availability: string;
};

/** Optional education details are omitted when they have no display value. */
export type EducationDegree = {
	degree: string;
	major: string;
	concentration?: string;
	school: string;
	honors?: string;
	year: number;
};

export type AboutPage = PageIntroduction & {
	portrait: ImageReference;
	sections: { title: string; body: string; degrees?: EducationDegree[] }[];
};
