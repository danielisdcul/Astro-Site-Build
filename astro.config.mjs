// @ts-check
import { defineConfig } from 'astro/config';
import { prepareImageAssets } from './scripts/image-assets.mjs';

// Prepare shared image variants even when Astro is run directly instead of through npm.
await prepareImageAssets(new URL('./', import.meta.url));

// https://astro.build/config
export default defineConfig({
	site: 'https://danielisdcul.github.io',
	base: '/Astro-Site-Build',
	trailingSlash: 'always',
});
