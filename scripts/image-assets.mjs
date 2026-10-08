import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageMetadata } from 'astro/assets/utils';
import sharpService from 'astro/assets/services/sharp';

// One asset pipeline serves every image component. Astro runs this before dev/build.
// Original files stay available; generated WebPs and their manifest can be regenerated.
const settings = { previewWidth: 640, previewQuality: 75, fullQuality: 85 };
const supported = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

async function findImages(directory) {
	const paths = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		// Never treat a generated variant as another source image.
		if (entry.isDirectory() && ['generated', 'previews'].includes(entry.name)) continue;
		const path = join(directory, entry.name);
		if (entry.isDirectory()) paths.push(...await findImages(path));
		else if (supported.has(extname(entry.name).toLowerCase())) paths.push(path);
	}
	return paths.sort();
}

async function readIfPresent(path) {
	try { return await readFile(path); }
	catch (error) {
		if (error.code !== 'ENOENT') throw error;
		return null;
	}
}

export async function prepareImageAssets(root = new URL('../', import.meta.url)) {
	const projectRoot = fileURLToPath(root);
	const imageRoot = join(projectRoot, 'public/images');
	const outputRoot = join(imageRoot, 'generated');
	const manifestPath = join(projectRoot, 'src/data/generated/images.json');
	const manifest = {};
	const expected = new Set();

	// Content hashes refresh browser caches when an original or encoder setting changes.
	for (const source of await findImages(imageRoot)) {
		const original = await readFile(source);
		const hash = createHash('sha256').update(original).update(JSON.stringify(settings)).digest('hex').slice(0, 12);
		const path = relative(imageRoot, source).split('\\').join('/');
		const metadata = await imageMetadata(original, source);
		const variants = {};

		for (const mode of ['preview', 'full']) {
			const name = `${path}-${hash}-${mode}.webp`;
			const destination = join(outputRoot, name);
			expected.add(destination);
			if (!await readIfPresent(destination)) {
				const transformed = await sharpService.transform(
					original,
					{
						src: source,
						format: 'webp',
						width: mode === 'preview' ? Math.min(settings.previewWidth, Math.ceil(metadata.width / 2)) : undefined,
						quality: mode === 'preview' ? settings.previewQuality : settings.fullQuality,
					},
					{ service: { config: {} } },
					console,
				);
				await mkdir(dirname(destination), { recursive: true });
				await writeFile(destination, transformed.data);
			}
			variants[mode] = `/images/generated/${name}`;
		}
		manifest[`/images/${path}`] = { ...variants, width: metadata.width, height: metadata.height };
	}

	// Write only changed metadata so a running dev server does not loop on file updates.
	const content = `${JSON.stringify(manifest, null, '\t')}\n`;
	if ((await readIfPresent(manifestPath))?.toString() !== content) {
		await mkdir(dirname(manifestPath), { recursive: true });
		await writeFile(manifestPath, content);
	}

	// Remove obsolete variants after replacing or removing an original image.
	if (await readDirectoryIfPresent(outputRoot)) {
		for (const path of await findImages(outputRoot)) {
			if (!expected.has(path)) await rm(path);
		}
	}
	return manifest;
}

async function readDirectoryIfPresent(path) {
	try { return await readdir(path); }
	catch (error) {
		if (error.code !== 'ENOENT') throw error;
		return null;
	}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	const manifest = await prepareImageAssets();
	console.log(`Prepared previews and full-size WebPs for ${Object.keys(manifest).length} images.`);
}
