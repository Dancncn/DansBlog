// @ts-check

/*
 * Astro runtime configuration:
 * Cloudflare Pages serves the canonical site from the root path in every build.
 */
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

/*
 * Minimal GitHub-style alert parser for markdown blockquotes.
 * Supports:
 * > [!NOTE]
 * > [!TIP]
 * > [!IMPORTANT]
 * > [!WARNING]
 * > [!CAUTION]
 */
function remarkGitHubAlertFallback() {
	const ALERT_TYPES = new Set(['note', 'tip', 'important', 'warning', 'caution']);

	/** @param {import('mdast').Root} tree */
	return (tree) => {
		/** @param {import('mdast').Nodes} node */
		const visit = (node) => {
			if (!node || typeof node !== 'object') return;

			if (node.type === 'blockquote' && Array.isArray(node.children) && node.children.length > 0) {
				const first = node.children[0];
				if (first?.type === 'paragraph' && Array.isArray(first.children) && first.children.length > 0) {
					const firstChild = first.children[0];
					if (firstChild?.type === 'text') {
						const match = firstChild.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
						if (match) {
							const rawType = match[1].toLowerCase();
							if (ALERT_TYPES.has(rawType)) {
								firstChild.value = firstChild.value.replace(match[0], '');
								if (!firstChild.value.length) {
									first.children.shift();
								}

								node.data = Object.assign(node.data ?? {}, {
									hName: 'blockquote',
									hProperties: { className: ['markdown-alert', `markdown-alert-${rawType}`] },
								});

								/** @type {import('mdast').Paragraph} */
								const titleNode = {
									type: 'paragraph',
									data: {
										hName: 'p',
										hProperties: { className: ['markdown-alert-title'] },
									},
									children: [{ type: 'text', value: rawType }],
								};

								if (first.children.length === 0) {
									node.children.shift();
								}

								node.children.unshift(titleNode);
							}
						}
					}
				}
			}

			if ('children' in node && Array.isArray(node.children)) {
				for (const child of node.children) visit(child);
			}
		};

		visit(tree);
	};
}

const runtimeBase = '/';
const runtimeSite = 'https://danarnoux.com';

/*
 * Rewrites markdown `<img src="/image/...">` to include the active base path.
 * This prevents broken images when the same markdown is built for different hosts.
 */
/** @param {string} basePath */
function rehypePrefixPublicImageBase(basePath) {
	return () => {
		/** @param {import('hast').Root} tree */
		return (tree) => {
			/** @param {import('hast').Nodes} node */
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

				if ('children' in node && Array.isArray(node.children)) {
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
	compressHTML: true,
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => {
				if (page === 'https://danarnoux.com/admin/' || page === 'https://danarnoux.com/important/') {
					return false;
				}
				return !/^https:\/\/danarnoux\.com\/blog\/page\/\d+\/$/.test(page);
			},
		}),
	],
	markdown: {
		processor: unified({
			remarkPlugins: [remarkGitHubAlertFallback],
			rehypePlugins: [rehypePrefixPublicImageBase(runtimeBase)],
		}),
		syntaxHighlight: 'shiki',
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
			wrap: false,
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
