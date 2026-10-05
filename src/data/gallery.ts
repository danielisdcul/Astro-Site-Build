export type GalleryImage = {
	src: string;
	alt: string;
	caption?: string;
	width?: number;
	height?: number;
};

export type GalleryLayout = 'grid' | 'wide-top' | 'wide-bottom' | 'stack';

export type GalleryOptions = {
	images: GalleryImage[];
	layout?: GalleryLayout;
	columns?: 1 | 2 | 3 | 4;
	lightbox?: boolean;
};
