/** Explicit grid placement, using one-based row and column lines. */
export type GalleryPlacement = {
	/** One-based CSS grid line. Omit to let auto-placement choose a position. */
	column?: number;
	row?: number;
	columnSpan?: number;
	rowSpan?: number;
};

/** One image, including its accessible description and optional display caption. */
export type GalleryImage = {
	src: string;
	alt: string;
	caption?: string;
	width?: number;
	height?: number;
	/** Optional position in a mixed image/video gallery. */
	order?: number;
	/** Manual desktop placement; omitted grid layouts infer spans from media aspect ratio. */
	placement?: GalleryPlacement;
};

/** A video that can appear as a swipeable slide alongside still images. */
export type GalleryVideo = {
	type: 'video';
	src: string;
	poster: string;
	alt: string;
	caption: string;
	width: number;
	height: number;
	/** Optional position in a mixed image/video gallery. */
	order?: number;
	/** Manual desktop placement; omitted grid layouts infer spans from media aspect ratio. */
	placement?: GalleryPlacement;
};

/** Video data accepted in gallery and project configuration, before slide typing. */
export type GalleryVideoOptions = Omit<GalleryVideo, 'type'>;

export type GallerySlide = GalleryImage | GalleryVideo;

// Grid layouts use content-aware spans on desktop; mobile uses two-column tiles.
export type GalleryLayout = 'grid' | 'wide-top' | 'wide-bottom' | 'stack';

/** Configuration accepted by Gallery.astro and project gallery data. */
export type GalleryOptions = {
	images: GalleryImage[];
	videos?: GalleryVideoOptions[];
	layout?: GalleryLayout;
	/** Mobile tile arrangement. Stack preserves each item's natural proportions. */
	mobileLayout?: 'grid' | 'stack';
	columns?: 1 | 2 | 3 | 4;
	lightbox?: boolean;
};

/** Keep the rendered tiles and page-wide viewer in the same mixed-media order. */
export function getGallerySlides(images: GalleryImage[], videos: GalleryVideoOptions[] = []): GallerySlide[] {
	return [...images, ...videos.map((video) => ({ ...video, type: 'video' as const }))]
		.map((slide, defaultOrder) => ({ slide, defaultOrder }))
		.sort((a, b) => (a.slide.order ?? a.defaultOrder) - (b.slide.order ?? b.defaultOrder))
		.map(({ slide }) => slide);
}
