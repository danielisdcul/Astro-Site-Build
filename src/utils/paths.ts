// URL helpers for deployments hosted at a subpath, such as GitHub Pages.

// Normalize the configured base once so callers can use paths with or without a leading slash.
const baseUrl = import.meta.env.BASE_URL.endsWith('/')
	? import.meta.env.BASE_URL
	: `${import.meta.env.BASE_URL}/`;

// Leave protocols, protocol-relative URLs, and same-page anchors untouched.
const externalUrlPattern = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

// Prefix internal routes and public assets with Astro's configured deployment base.
export const withBase = (path: string) => {
	if (externalUrlPattern.test(path)) return path;

	return `${baseUrl}${path.replace(/^\/+/, '')}`;
};

// Remove the deployment base before comparing the current route to authored paths.
export const withoutBase = (path: string) => {
	if (baseUrl === '/') return path;

	const basePath = baseUrl.slice(0, -1);
	if (path === basePath) return '/';

	return path.startsWith(`${basePath}/`) ? path.slice(basePath.length) : path;
};
