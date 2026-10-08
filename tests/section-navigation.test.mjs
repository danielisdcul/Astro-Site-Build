import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { setMaxListeners } from 'node:events';
import { setupSectionNavigationMobile } from '../src/utils/section-navigation-mobile.ts';
import { setupSectionNavigationActive } from '../src/utils/section-navigation-active.ts';

const globalNames = ['window', 'document', 'MutationObserver', 'ResizeObserver'];
const previousGlobals = Object.fromEntries(globalNames.map(name => [name, globalThis[name]]));
const cleanups = [];

afterEach(() => {
	cleanups.splice(0).reverse().forEach(stop => stop?.());
	for (const name of globalNames) {
		if (previousGlobals[name] === undefined) delete globalThis[name];
		else globalThis[name] = previousGlobals[name];
	}
});

// Exercise native event dispatch with controlled geometry and viewport changes.
class Element extends EventTarget {
	attributes = new Map();
	dataset = {};
	styles = new Map();
	classes = new Set();
	descendants = new Set();
	selectors = new Map();
	classList = {
		contains: name => this.classes.has(name),
		add: name => this.classes.add(name),
		remove: name => this.classes.delete(name),
		toggle: (name, value) => value ? this.classes.add(name) : this.classes.delete(name),
	};
	style = {
		setProperty: (name, value) => this.styles.set(name, value),
		removeProperty: name => this.styles.delete(name),
	};
	getBoundingClientRect() { return { top: 100, height: 20, bottom: 120 }; }
	setAttribute(name, value) { this.attributes.set(name, value); }
	removeAttribute(name) { this.attributes.delete(name); }
	hasAttribute(name) { return this.attributes.has(name); }
	toggleAttribute(name, value) { value ? this.attributes.set(name, '') : this.attributes.delete(name); }
	querySelector(selector) { return this.selectors.get(selector) ?? null; }
	querySelectorAll(selector) { return this.selectors.get(selector) ?? []; }
	contains(node) { return node === this || this.descendants.has(node); }
	setPointerCapture() {}
	focus() { this.focused = true; }
	addEventListener(type, callback, options) {
		if (options?.signal) setMaxListeners(30, options.signal);
		super.addEventListener(type, callback, options);
	}
}

const send = (target, type, values = {}) => {
	const event = new Event(type, { cancelable: true });
	Object.defineProperties(event, Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value }])));
	target.dispatchEvent(event);
};

function environment({ mobile = true, lefty = false, scrollY = 0 } = {}) {
	const navigation = new Element();
	const header = new Element();
	if (lefty) header.classes.add('is-lefty');
	header.getBoundingClientRect = () => ({ bottom: 89 });
	const toggle = new Element();
	const panel = new Element();
	const close = new Element();
	const list = new Element();
	const rail = new Element();
	for (const [selector, node] of [
		['.section-jump__rail-toggle', toggle], ['.section-jump__panel', panel],
		['.section-jump__close', close], ['.section-jump__desktop', list], ['.section-jump__rail-track', rail],
	]) navigation.selectors.set(selector, node);
	navigation.descendants = new Set([toggle, panel, close, list, rail]);
	const media = Object.assign(new EventTarget(), { matches: mobile });
	const frames = new Map();
	let frameId = 0;
	const viewport = Object.assign(new EventTarget(), {
		scrollY, innerHeight: 600, matchMedia: () => media,
		requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
		cancelAnimationFrame(id) { frames.delete(id); },
	});
	const document = Object.assign(new Element(), { body: new Element(), documentElement: { scrollHeight: 3500 } });
	document.selectors.set('.site-header', header);
	const positions = [200, 1000, 1200, 3400];
	const groups = [new Element(), new Element(), new Element()];
	groups[0].setAttribute('data-mobile-only', '');
	const links = positions.map((_, index) => {
		const link = new Element();
		link.hash = `#section-${index}`;
		link.group = groups[[0, 1, 1, 2][index]];
		link.closest = selector => selector === 'a' ? link : link.group;
		navigation.descendants.add(link);
		return link;
	});
	groups.forEach((group, index) => {
		group.selectors.set(':scope > a', links[[0, 1, 3][index]]);
		group.selectors.set('.section-jump__marker', new Element());
	});
	const dots = [0, 1, 3].map(index => Object.assign(new Element(), { dataset: { sectionId: `section-${index}` } }));
	navigation.selectors.set('.section-jump__rail-dot', dots);
	list.selectors.set('a[href^="#"]', links);
	document.getElementById = id => {
		const index = Number(id.split('-')[1]);
		return { getBoundingClientRect: () => ({ top: positions[index] - viewport.scrollY }) };
	};
	let syncHeader;
	globalThis.MutationObserver = class {
		constructor(callback) { syncHeader = callback; } observe() {} disconnect() {}
	};
	globalThis.ResizeObserver = class { observe() {} disconnect() {} };
	globalThis.window = viewport;
	globalThis.document = document;
	const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); };
	cleanups.push(setupSectionNavigationMobile(navigation));
	return { navigation, header, toggle, panel, close, media, viewport, document, links, groups, dots, rail, frames, positions,
		syncHeader: () => syncHeader(), flush,
		scroll(y) { viewport.scrollY = y; send(viewport, 'scroll'); flush(); },
		active: () => links.findIndex(link => link.hasAttribute('aria-current')),
		press(x, y = 100) { send(toggle, 'pointerdown', { isPrimary: true, button: 0, pointerId: 1, clientX: x, clientY: y }); },
		move(x, y = 100) { send(toggle, 'pointermove', { pointerId: 1, clientX: x, clientY: y }); },
	};
}

test('the rail follows handedness and returns closed after the main menu hides it', () => {
	const env = environment();
	assert.equal(env.navigation.dataset.side, 'left');
	assert.equal(env.panel.inert, true);
	send(env.toggle, 'click', { detail: 1 });
	assert.equal(env.panel.inert, false);
	assert.equal(env.toggle.attributes.get('aria-expanded'), 'true');
	env.header.classes.add('is-menu-open'); env.syncHeader();
	assert.equal(env.navigation.hasAttribute('data-main-menu-open'), true);
	assert.equal(env.navigation.inert, true);
	assert.equal(env.panel.inert, true);
	env.header.classes.delete('is-menu-open'); env.syncHeader();
	assert.equal(env.navigation.hasAttribute('data-main-menu-open'), false);
	assert.equal(env.navigation.inert, false);
	assert.equal(env.toggle.attributes.get('aria-expanded'), 'false');
	env.header.classes.add('is-lefty'); env.syncHeader();
	assert.equal(env.navigation.dataset.side, 'right');
});

test('inward swipes open on either edge without the following click closing the panel', () => {
	for (const lefty of [false, true]) {
		const env = environment({ lefty });
		env.press(100); env.move(lefty ? 70 : 130);
		assert.equal(env.panel.inert, false);
		send(env.toggle, 'click', { detail: 1 });
		assert.equal(env.panel.inert, false);
		send(env.close, 'click');
		assert.equal(env.panel.inert, true);
		assert.equal(env.toggle.focused, true);
	}
});

test('vertical gestures do not open the rail; outside taps and Escape dismiss it', () => {
	const env = environment();
	env.press(100); env.move(102, 140);
	assert.equal(env.panel.inert, true);
	send(env.toggle, 'click', { detail: 1 });
	assert.equal(env.panel.inert, true);
	send(env.toggle, 'click', { detail: 0 });
	assert.equal(env.panel.inert, false);
	send(env.document, 'pointerdown');
	assert.equal(env.panel.inert, true);
	send(env.toggle, 'click', { detail: 0 });
	send(env.document, 'keydown', { key: 'Escape' });
	assert.equal(env.panel.inert, true);
	assert.equal(env.toggle.focused, true);
});

test('section selection closes the panel and resizing to desktop releases its links', () => {
	const env = environment();
	send(env.toggle, 'click', { detail: 0 });
	send(env.panel, 'click', { target: env.links[1] });
	assert.equal(env.panel.inert, true);
	env.media.matches = false; send(env.media, 'change');
	assert.equal(env.panel.inert, false);
	assert.equal(env.navigation.classes.has('is-section-jump-open'), false);
});

test('mobile tracks gallery, subsections and parent dots; desktop excludes the mobile gallery', () => {
	const env = environment({ scrollY: 300 });
	cleanups.push(setupSectionNavigationActive(env.navigation));
	assert.equal(env.active(), 0);
	assert.equal(env.dots[0].classes.has('is-current-section'), true);
	env.scroll(1050);
	assert.equal(env.active(), 2);
	assert.equal(env.groups[1].classes.has('is-current-section'), true);
	assert.equal(env.dots[1].classes.has('is-current-section'), true);
	assert.equal(env.dots[0].classes.has('is-current-section'), false);
	assert.equal(env.rail.hasAttribute('data-current-section'), true);
	env.scroll(2900);
	assert.equal(env.active(), 3, 'short last section is selected at the page bottom');
	env.media.matches = false; send(env.media, 'change'); env.flush();
	env.scroll(300);
	assert.equal(env.active(), -1, 'gallery does not become a desktop section');
	env.scroll(900);
	assert.equal(env.active(), 1);
	send(env.viewport, 'scroll'); send(env.viewport, 'scroll');
	assert.equal(env.frames.size, 1, 'scroll updates remain batched');
});
