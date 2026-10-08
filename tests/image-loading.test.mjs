import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { setupProgressiveImages, upgradeImage } from '../src/utils/image-loading.ts';

const globalNames = ['window', 'document', 'Image', 'HTMLImageElement', 'Element', 'IntersectionObserver', 'MutationObserver'];
const previousGlobals = Object.fromEntries(globalNames.map(name => [name, globalThis[name]]));
let stop;

afterEach(() => {
	stop?.();
	stop = undefined;
	for (const name of globalNames) {
		if (previousGlobals[name] === undefined) delete globalThis[name];
		else globalThis[name] = previousGlobals[name];
	}
});

const settle = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
	let resolve, reject;
	const promise = new Promise((success, failure) => { resolve = success; reject = failure; });
	return { promise, resolve, reject };
}

// Control image decoding and visibility without depending on a real network or timers.
function environment(readyState = 'loading') {
	const downloads = [];
	const images = [];
	const idle = new Map();
	let nextIdle = 0;
	let observer;
	class Element extends EventTarget {}
	class Image extends Element {
		constructor(source) {
			super();
			this.src = source || '';
			this.dataset = {};
			this.isConnected = Boolean(source);
			this.ready = deferred();
			this.complete = true;
			this.naturalWidth = 640;
			if (!source) downloads.push(this);
		}
		decode() { return this.ready.promise; }
		matches() { return Boolean(this.dataset.imageFull); }
		closest(selector) { return selector.startsWith('img') ? this : null; }
		querySelectorAll() { return []; }
	}
	const document = Object.assign(new EventTarget(), {
		baseURI: 'https://site.test/', readyState, body: new Element(),
		querySelectorAll: () => images,
	});
	const window = Object.assign(new EventTarget(), {
		requestIdleCallback(callback) { idle.set(++nextIdle, callback); return nextIdle; },
		cancelIdleCallback(id) { idle.delete(id); },
	});
	class IntersectionObserver {
		constructor(callback) { this.callback = callback; this.observed = []; observer = this; }
		observe(image) { this.observed.push(image); }
		disconnect() {}
	}
	class MutationObserver { observe() {} disconnect() {} }
	Object.assign(globalThis, { window, document, Image, HTMLImageElement: Image, Element, IntersectionObserver, MutationObserver });

	return {
		downloads, window, document,
		image(name, mode = 'after-load') {
			const image = new Image(`https://site.test/${name}-preview.webp`);
			image.dataset = { imageFull: `/${name}-full.webp`, imageUpgrade: mode };
			images.push(image);
			return image;
		},
		intersect(entries) { observer.callback(entries.map(([target, isIntersecting]) => ({ target, isIntersecting }))); },
		observed: () => observer.observed,
		flushIdle() {
			const callbacks = [...idle.values()];
			idle.clear();
			callbacks.forEach(callback => callback());
		},
	};
}

test('preview decodes before the larger request, which replaces it only after decoding', async () => {
	const env = environment();
	const image = env.image('order');
	const request = upgradeImage(image);
	assert.equal(env.downloads.length, 0);
	image.ready.resolve(); await settle();
	assert.equal(env.downloads.length, 1);
	assert.equal(image.src, 'https://site.test/order-preview.webp');
	env.downloads[0].ready.resolve();
	assert.equal(await request, true);
	assert.equal(image.src, 'https://site.test/order-full.webp');
});

test('different components share a single full-size download', async () => {
	const env = environment();
	const card = env.image('shared');
	const viewer = env.image('shared', 'on-demand');
	card.ready.resolve(); viewer.ready.resolve();
	const requests = [upgradeImage(card), upgradeImage(viewer), upgradeImage(viewer)];
	await settle(); assert.equal(env.downloads.length, 1);
	env.downloads[0].ready.resolve(); await Promise.all(requests);
	assert.equal(card.src, viewer.src);
});

test('failed downloads retain the preview and can retry', async () => {
	const env = environment();
	const image = env.image('retry'); image.ready.resolve();
	const failed = upgradeImage(image); await settle();
	env.downloads[0].ready.reject(Error('offline'));
	assert.equal(await failed, false);
	assert.equal(image.src, 'https://site.test/retry-preview.webp');
	const retry = upgradeImage(image); await settle();
	assert.equal(env.downloads.length, 2);
	env.downloads[1].ready.resolve(); assert.equal(await retry, true);
});

test('changing the selected image rejects stale results; cancellation skips a download', async () => {
	const env = environment();
	const image = env.image('old'); image.ready.resolve();
	const old = upgradeImage(image); await settle();
	image.dataset.imageFull = '/new-full.webp';
	image.src = 'https://site.test/new-preview.webp';
	const current = upgradeImage(image); await settle();
	env.downloads[0].ready.resolve();
	assert.equal(await old, false);
	assert.equal(image.src, 'https://site.test/new-preview.webp');
	env.downloads[1].ready.resolve(); assert.equal(await current, true);
	const hidden = env.image('cancelled');
	const controller = new AbortController();
	const cancelled = upgradeImage(hidden, { signal: controller.signal });
	controller.abort(); hidden.ready.resolve();
	assert.equal(await cancelled, false);
	assert.equal(env.downloads.length, 2);
});

test('automatic upgrades wait for window load, respect visibility, and leave hidden viewers small', async () => {
	const env = environment();
	const visible = env.image('visible');
	const offscreen = env.image('offscreen');
	const viewer = env.image('hidden-viewer', 'on-demand');
	for (const image of [visible, offscreen, viewer]) image.ready.resolve();
	stop = setupProgressiveImages();
	assert.deepEqual(env.observed(), [visible, offscreen]);
	env.intersect([[visible, true], [offscreen, false]]);
	env.flushIdle(); await settle(); assert.equal(env.downloads.length, 0);
	env.window.dispatchEvent(new Event('load')); env.flushIdle(); await settle();
	assert.equal(env.downloads.length, 1);
	assert.equal(env.downloads[0].src, 'https://site.test/visible-full.webp');
	env.downloads[0].ready.resolve(); await settle();
	assert.equal(offscreen.src, 'https://site.test/offscreen-preview.webp');
	assert.equal(viewer.src, 'https://site.test/hidden-viewer-preview.webp');
});

test('click upgrades an on-demand image before the page finishes loading', async () => {
	const env = environment();
	const image = env.image('clicked', 'on-demand'); image.ready.resolve();
	stop = setupProgressiveImages();
	const click = new Event('click');
	Object.defineProperties(click, { target: { value: image }, button: { value: 0 } });
	env.document.dispatchEvent(click); await settle();
	assert.equal(env.downloads.length, 1);
	env.downloads[0].ready.resolve(); await settle();
	assert.equal(image.src, 'https://site.test/clicked-full.webp');
});

test('background upgrades limit concurrency to two and resume the queue as requests finish', async () => {
	const env = environment('complete');
	const images = ['queued-a', 'queued-b', 'queued-c'].map(name => env.image(name));
	images.forEach(image => image.ready.resolve());
	stop = setupProgressiveImages();
	env.intersect(images.map(image => [image, true])); env.flushIdle(); await settle();
	assert.equal(env.downloads.length, 2);
	env.downloads[0].ready.resolve(); await settle(); env.flushIdle(); await settle();
	assert.equal(env.downloads.length, 3);
	env.downloads[1].ready.resolve(); env.downloads[2].ready.resolve(); await settle();
});
