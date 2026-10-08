import manifest from '../data/generated/images.json';

type ImageAsset = {
	preview: string;
	full: string;
	width?: number;
	height?: number;
};

/** Resolve shared build-generated variants; SVGs and external URLs pass through. */
export function getImageAsset(source: string, preview?: string): ImageAsset {
	const asset = (manifest as Record<string, ImageAsset>)[source];
	return {
		preview: preview || asset?.preview || source,
		full: asset?.full || source,
		width: asset?.width,
		height: asset?.height,
	};
}
