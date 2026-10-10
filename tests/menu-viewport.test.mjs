import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setupStableMenuViewport } from '../src/utils/stable-menu-viewport.ts';

function viewportHarness(t) {
	const browser = new EventTarget();
	browser.innerWidth = 390;
	browser.innerHeight = 700;
	browser.screen = { orientation: new EventTarget() };
	const frames = [];
	const properties = new Map();
	const header = { style: { setProperty: (name, value) => properties.set(name, value) } };
	const geometry = { height: '700px', paddingBottom: '0px' };
	let probes = 0;
	const mocks = {
		window: browser,
		document: {
			createElement: () => ({ style: {}, setAttribute() {}, remove() {} }),
			body: { append() { probes++; } },
		},
		getComputedStyle: () => geometry,
		requestAnimationFrame: callback => frames.push(callback),
	};
	for (const [name, value] of Object.entries(mocks)) {
		const original = Object.getOwnPropertyDescriptor(globalThis, name);
		Object.defineProperty(globalThis, name, { configurable: true, value });
		t.after(() => {
			if (original) Object.defineProperty(globalThis, name, original);
			else delete globalThis[name];
		});
	}
	setupStableMenuViewport(header);
	return { browser, frames, properties, geometry, probes: () => probes };
}

test('Safari toolbar height and safe-area changes preserve the mobile menu geometry', t => {
	const { browser, frames, properties, geometry, probes } = viewportHarness(t);
	assert.equal(properties.get('--nav-viewport-height'), '700px');
	assert.equal(properties.get('--nav-safe-area-bottom'), '0px');
	// Model both the visible viewport and reported small viewport changing in Safari.
	browser.innerHeight = 800;
	geometry.height = '800px';
	geometry.paddingBottom = '34px';
	browser.dispatchEvent(new Event('resize'));
	assert.equal(frames.length, 0);
	assert.equal(properties.get('--nav-viewport-height'), '700px');
	assert.equal(properties.get('--nav-safe-area-bottom'), '0px');
	assert.equal(probes(), 1);
});

test('rotation and viewport width changes refresh the menu geometry after layout', t => {
	const { browser, frames, properties, geometry, probes } = viewportHarness(t);
	browser.innerWidth = 844;
	browser.innerHeight = 390;
	geometry.height = '350px';
	geometry.paddingBottom = '21px';
	browser.dispatchEvent(new Event('resize'));
	browser.dispatchEvent(new Event('orientationchange'));
	browser.screen.orientation.dispatchEvent(new Event('change'));
	assert.equal(frames.length, 1);
	frames.shift()();
	assert.equal(properties.get('--nav-viewport-height'), '350px');
	assert.equal(properties.get('--nav-safe-area-bottom'), '21px');
	assert.equal(probes(), 2);
	// Rotation can change geometry even when width stays the same.
	geometry.height = '360px';
	browser.screen.orientation.dispatchEvent(new Event('change'));
	assert.equal(frames.length, 1);
	frames.shift()();
	assert.equal(properties.get('--nav-viewport-height'), '360px');
});
