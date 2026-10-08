import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';
import sharpService from 'astro/assets/services/sharp';

// Generate a mobile preview beside an original image, inside a previews directory.
// Example: node scripts/gallery-previews.mjs public/images/portfolio/vita-sign.png
// Add the resulting public URL as previewSrc in the project's gallery data.
const sources = process.argv.slice(2);
if (!sources.length) throw new Error('Provide the paths of the original gallery images.');

for (const source of sources) {
	const directory = join(dirname(source), 'previews');
	const destination = join(directory, `${basename(source, extname(source))}.webp`);
	const original = await readFile(source);
	const preview = await sharpService.transform(
		original,
		{ src: source, width: 640, format: 'webp', quality: 75 },
		{ service: { config: {} } },
		console,
	);
	await mkdir(directory, { recursive: true });
	await writeFile(destination, preview.data);
	console.log(`${destination}: ${Math.round(preview.data.length / 1024)} KB`);
}
