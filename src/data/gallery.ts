/** One image, including its accessible description and optional display caption. */
export type GalleryImage = {
	src: string;
	/** Small mobile tile and lightbox preview; the original loads when selected. */
	previewSrc?: string;
	alt: string;
	caption?: string;
	width?: number;
	height?: number;
};

// Desktop layouts; mobile uses two-column tiles that open a swipeable viewer.
export type GalleryLayout = 'grid' | 'wide-top' | 'wide-bottom' | 'stack';

/** Configuration accepted by Gallery.astro and project gallery data. */
export type GalleryOptions = {
	images: GalleryImage[];
	layout?: GalleryLayout;
	columns?: 1 | 2 | 3 | 4;
	lightbox?: boolean;
};
