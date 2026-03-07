// @ts-check

/*
 * Astro runtime configuration:
 * - Uses one codebase for both GitHub Pages (repo subpath) and Cloudflare Pages (root path).
 * - Keeps asset/link behavior deterministic by deriving `site` + `base` from build environment.
 */
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

const REPO_BASE = '/DansBlog/';
const isCloudflarePages = Boolean(process.env.CF_PAGES);
const isProduction = process.env.NODE_ENV === 'production';
// Cloudflare serves from "/", while GitHub Pages needs the repository subpath.
const runtimeBase = isCloudflarePages ? '/' : isProduction ? REPO_BASE : '/';
const runtimeSite = 'https://danarnoux.com';

/*
 * Rewrites markdown `<img src="/image/...">` to include the active base path.
 * This prevents broken images when the same markdown is built for different hosts.
 */
function rehypePrefixPublicImageBase(basePath) {
	return () => {
		return (tree) => {
			const walk = (node) => {
				if (!node || typeof node !== 'object') return;

				if (
					node.type === 'element' &&
					node.tagName === 'img' &&
					node.properties &&
					typeof node.properties.src === 'string'
				) {
					const src = node.properties.src;
					if (src.startsWith('/image/')) {
						node.properties.src = `${basePath}${src.slice(1)}`;
					}
				}

				if (Array.isArray(node.children)) {
					for (const child of node.children) walk(child);
				}
			};

			walk(tree);
		};
	};
}

// https://astro.build/config
export default defineConfig({
	site: runtimeSite,
	base: runtimeBase,
	trailingSlash: 'always',
	output: 'static',
	integrations: [mdx(), sitemap()],
	markdown: {
		// Keep markdown image URLs deployment-agnostic.
		rehypePlugins: [rehypePrefixPublicImageBase(runtimeBase)],
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
