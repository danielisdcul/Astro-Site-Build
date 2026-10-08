import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { imageMetadata } from 'astro/assets/utils';
import { getGallerySlides } from '../src/data/gallery.ts';
import { projects } from '../src/data/projects/index.ts';
import { site, emailLink } from '../src/data/site.ts';
import { home } from '../src/data/pages/home.ts';
import { about } from '../src/data/pages/about.ts';
import { work } from '../src/data/pages/work.ts';
import { contact } from '../src/data/pages/contact.ts';
import { createSectionNavigation, flattenSectionNavigation } from '../src/utils/section-navigation.ts';

const publicRoot = new URL('../public/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('../src/data/generated/images.json', import.meta.url), 'utf8'));
const galleries = projects.flatMap(project => [project.gallery, ...project.sections.map(section => section.gallery)].filter(Boolean));
const nonempty = (value, context) => assert.ok(typeof value === 'string' && value.trim() === value && value.length > 0, context);
const localAsset = source => {
	assert.match(source, /^\/(?:images|videos)\//, source);
	assert.ok(!source.split('/').includes('..'), source);
	return new URL(source.slice(1), publicRoot);
};

test('project slugs are unique routes and the registry contains meaningful content', () => {
	assert.equal(new Set(projects.map(project => project.slug)).size, projects.length);
	for (const project of projects) {
		assert.match(project.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
		for (const key of ['title', 'summary', 'cardTitle', 'cardSummary', 'cardLabel', 'type']) nonempty(project[key], `${project.slug}.${key}`);
		assert.ok(project.cardImages.length > 0 && project.sections.length > 0);
		assert.ok(['wide-top', 'wide-bottom'].includes(project.cardLayout));
		assert.ok(!('accent' in project) && !('accentSoft' in project) && !('galleryLayout' in project));
		assert.ok(project.featured || !('cardMeta' in project), 'only featured cards use card metadata');
		for (const section of project.sections) {
			nonempty(section.title, `${project.slug} section title`);
			assert.ok(section.lead || section.paragraphs?.length || section.list?.length || section.details?.length || section.gallery || section.videos?.length || section.link, section.title);
			if (section.listBeforeParagraphs) assert.ok(section.list?.length, section.title);
		}
		const navigation = flattenSectionNavigation(createSectionNavigation(project.sections));
		assert.deepEqual(navigation.map(item => item.title), project.sections.map(section => section.title));
		assert.equal(new Set(navigation.map(item => item.id)).size, project.sections.length);
	}
});

test('page copy is populated and both portraits use the shared identity data', () => {
	for (const page of [home, about, work, contact]) {
		nonempty(page.title, 'visible page title');
		nonempty(page.intro, 'page introduction');
		if (page.metadata) {
			nonempty(page.metadata.title, 'browser title');
			nonempty(page.metadata.description, 'page description');
		}
	}
	assert.equal(home.portrait, site.portrait);
	assert.equal(about.portrait, site.portrait);
	assert.ok(site.portrait.alt.includes(site.name));
	assert.equal(emailLink.href, `mailto:${site.email}`);
	for (const section of about.sections) {
		nonempty(section.title, 'about section title');
		nonempty(section.body, section.title);
		for (const degree of section.degrees ?? []) {
			assert.ok(Number.isInteger(degree.year) && degree.year > 1900);
			for (const optional of ['concentration', 'honors']) {
				if (optional in degree) nonempty(degree[optional], `degree ${optional}`);
			}
		}
	}
});

test('all authored local images have existing variants and correct declared dimensions', async () => {
	const images = [site.portrait, ...projects.flatMap(project => project.cardImages.map(src => ({ src }))),
		...galleries.flatMap(gallery => [...gallery.images, ...(gallery.videos ?? []).map(video => ({ src: video.poster }))]),
		...projects.flatMap(project => project.sections.flatMap(section => (section.videos ?? []).map(video => ({ src: video.poster }))))];
	for (const image of images) {
		await access(localAsset(image.src));
		const asset = manifest[image.src];
		assert.ok(asset, `missing generated variants: ${image.src}`);
		await access(localAsset(asset.preview));
		await access(localAsset(asset.full));
		assert.ok(asset.preview !== asset.full);
		if (image.width !== undefined) assert.equal(image.width, asset.width, image.src);
		if (image.height !== undefined) assert.equal(image.height, asset.height, image.src);
		if ('alt' in image) nonempty(image.alt, image.src);
	}
	// Verify the generated lookup table against the actual files, not just authored values.
	for (const [source, asset] of Object.entries(manifest)) {
		const metadata = await imageMetadata(await readFile(localAsset(source)), source);
		assert.deepEqual([asset.width, asset.height], [metadata.width, metadata.height], source);
		const preview = await imageMetadata(await readFile(localAsset(asset.preview)), asset.preview);
		const full = await imageMetadata(await readFile(localAsset(asset.full)), asset.full);
		assert.deepEqual([full.width, full.height], [metadata.width, metadata.height], asset.full);
		assert.ok(preview.width <= 640 && preview.width <= Math.ceil(metadata.width / 2), asset.preview);
		assert.ok(Math.abs(preview.width / preview.height - metadata.width / metadata.height) < 0.005, asset.preview);
	}
});

// MP4 track headers store display dimensions as 16.16 fixed-point values.
function videoTrackDimensions(buffer, start = 0, end = buffer.length) {
	const tracks = [];
	for (let offset = start; offset + 8 <= end;) {
		let size = buffer.readUInt32BE(offset);
		const type = buffer.toString('ascii', offset + 4, offset + 8);
		let header = 8;
		if (size === 1) { size = Number(buffer.readBigUInt64BE(offset + 8)); header = 16; }
		if (size === 0) size = end - offset;
		assert.ok(size >= header && offset + size <= end, 'valid MP4 box');
		if (type === 'moov' || type === 'trak') tracks.push(...videoTrackDimensions(buffer, offset + header, offset + size));
		if (type === 'tkhd') {
			const width = buffer.readUInt32BE(offset + size - 8) / 65536;
			const height = buffer.readUInt32BE(offset + size - 4) / 65536;
			if (width && height) tracks.push({ width, height });
		}
		offset += size;
	}
	return tracks;
}

test('video files exist and declared dimensions match their actual display tracks', async () => {
	const videos = [...galleries.flatMap(gallery => gallery.videos ?? []),
		...projects.flatMap(project => project.sections.flatMap(section => section.videos ?? []))];
	for (const video of videos) {
		nonempty(video.alt, video.src);
		nonempty(video.caption, video.src);
		const tracks = videoTrackDimensions(await readFile(localAsset(video.src)));
		assert.ok(tracks.some(track => track.width === video.width && track.height === video.height), video.src);
	}
});

test('gallery placement stays inside its columns and manual cells never overlap', () => {
	for (const gallery of galleries) {
		const slides = getGallerySlides(gallery.images, gallery.videos);
		assert.ok(slides.length > 0);
		const occupied = new Set();
		for (const slide of slides) {
			if (slide.order !== undefined) assert.ok(Number.isInteger(slide.order) && slide.order >= 0);
			for (const value of Object.values(slide.placement ?? {})) assert.ok(Number.isInteger(value) && value > 0);
			const { column, row, columnSpan = 1, rowSpan = 1 } = slide.placement ?? {};
			if (column) assert.ok(column + columnSpan - 1 <= (gallery.columns ?? 2), slide.src);
			if (column && row) {
				for (let y = row; y < row + rowSpan; y++) for (let x = column; x < column + columnSpan; x++) {
					const cell = `${x},${y}`;
					assert.ok(!occupied.has(cell), `overlapping gallery cell ${cell}: ${slide.src}`);
					occupied.add(cell);
				}
			}
		}
	}
});

test('mixed gallery order is stable and does not mutate authored arrays', () => {
	const images = [{ src: '/image.jpg', alt: 'Image', order: 1 }];
	const videos = [{ src: '/video.mp4', poster: '/poster.jpg', alt: 'Video', caption: 'Video', width: 100, height: 50, order: 0 }];
	const original = structuredClone({ images, videos });
	assert.deepEqual(getGallerySlides(images, videos).map(slide => slide.src), ['/video.mp4', '/image.jpg']);
	assert.deepEqual({ images, videos }, original);
});

test('authored links have safe protocols and internal destinations exist', async () => {
	const links = [...site.navigation, ...site.socialLinks, emailLink, home.aboutLink,
		...projects.flatMap(project => [...(project.links ?? []), ...project.sections.flatMap(section => section.link ? [section.link] : [])])];
	for (const link of links) {
		nonempty(link.label, 'link label');
		const url = new URL(link.href, 'https://portfolio.test');
		assert.ok(['https:', 'mailto:'].includes(url.protocol), link.href);
		if (link.href.startsWith('/')) {
			assert.ok(!link.href.startsWith('//'), link.href);
			await access(new URL(`../src/pages/${url.pathname.slice(1).replace(/\/$/, '') || 'index'}.astro`, import.meta.url));
		}
	}
});

test('manual section hierarchy works with regular sections, phases and orphan subsections', () => {
	const navigation = createSectionNavigation([
		{ title: 'Orphan subsection', navigationLevel: 2 },
		{ title: 'Research', navigationLevel: 1 },
		{ title: 'Interviews', navigationLevel: 2 },
		{ title: 'Phase 01 — Design' },
		{ title: 'Sketches' },
		{ title: 'Results' },
	]);
	assert.deepEqual(navigation.map(item => item.title), ['Orphan subsection', 'Research', 'Phase 01 — Design', 'Results']);
	assert.equal(navigation[1].children[0].title, 'Interviews');
	assert.equal(navigation[2].children[0].title, 'Sketches');
	assert.equal(flattenSectionNavigation(navigation).length, 6);
});
