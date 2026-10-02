import { readdir, readFile } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';
import { parse as parseHtml } from 'parse5';
import { parse as parseYaml } from 'yaml';

export async function filesUnder(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	return (await Promise.all(entries.map((entry) => {
		const path = resolve(directory, entry.name);
		return entry.isDirectory() ? filesUnder(path) : [path];
	}))).flat();
}

export async function readPosts(directory) {
	return Promise.all((await filesUnder(directory)).filter((file) => /\.mdx?$/.test(file)).map(async (file) => {
		const source = await readFile(file, 'utf8');
		const match = source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
		if (!match) throw new Error(`${file}: missing frontmatter`);
		const data = parseYaml(match[1]);
		const id = relative(directory, file).split(sep).join('/').replace(/\.mdx?$/, '');
		return { file, id, data };
	}));
}

export function checkPosts(posts) {
	const errors = [];
	const groups = new Map();
	for (const post of posts) {
		const { data, id } = post;
		if (!data || typeof data !== 'object') { errors.push(`${id}: invalid metadata`); continue; }
		for (const key of ['title', 'description']) {
			if (typeof data[key] !== 'string' || !data[key].trim()) errors.push(`${id}: missing ${key}`);
		}
		if (!data.pubDate || !Number.isFinite(Date.parse(String(data.pubDate)))) errors.push(`${id}: invalid pubDate`);
		if (data.draft !== undefined && typeof data.draft !== 'boolean') errors.push(`${id}: draft must be boolean`);
		const suffix = id.match(/-(cn|en)$/)?.[1];
		const lang = data.lang ?? suffix;
		if (!['cn', 'en'].includes(lang)) errors.push(`${id}: language must be cn or en`);
		if (suffix && data.lang && suffix !== data.lang) errors.push(`${id}: filename and language disagree`);
		const group = data.group ?? id.replace(/-(cn|en)$/, '');
		if (typeof group !== 'string' || !group.trim()) errors.push(`${id}: invalid group`);
		const key = `${group}:${lang}`;
		if (groups.has(key)) errors.push(`${id}: duplicate group/language ${key} (also ${groups.get(key)})`);
		groups.set(key, id);
	}
	return errors;
}

export function inspectHtml(source) {
	const nodes = [];
	function walk(node) {
		if (node.tagName) nodes.push({ tag: node.tagName, attrs: Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value])) });
		for (const child of node.childNodes ?? []) walk(child);
	}
	walk(parseHtml(source));
	return { nodes, ids: new Set(nodes.flatMap(({ attrs }) => [attrs.id, attrs.name].filter(Boolean))) };
}

// Resolve against the deployed site, checking only local resources. Remote links
// are deliberately excluded so an unrelated service outage cannot break a build.
export function localTarget(raw, pageUrl, site) {
	if (!raw || raw === '#' || /^(?:mailto:|tel:|data:|blob:)/i.test(raw)) return null;
	const url = new URL(raw, pageUrl);
	if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`unsupported link protocol: ${raw}`);
	if (url.origin !== new URL(site).origin) return null;
	const pathname = decodeURIComponent(url.pathname);
	const path = pathname.endsWith('/') ? `${pathname}index.html` : extname(pathname) ? pathname : `${pathname}/index.html`;
	return { path: path.replace(/^\//, ''), fragment: decodeURIComponent(url.hash.slice(1)) };
}

export async function checkBuiltSite(directory, posts, site = 'https://danarnoux.com') {
	const files = await filesUnder(directory);
	const names = new Set(files.map((file) => relative(directory, file).split(sep).join('/')));
	const pages = new Map();
	for (const file of files.filter((name) => name.endsWith('.html'))) {
		pages.set(relative(directory, file).split(sep).join('/'), inspectHtml(await readFile(file, 'utf8')));
	}
	const errors = [];
	let links = 0;
	for (const [path, page] of pages) {
		const pageUrl = new URL(path.replace(/index\.html$/, ''), `${site}/`);
		for (const node of page.nodes) {
			for (const attribute of ['href', 'src', 'poster']) {
				const raw = node.attrs[attribute];
				if (!raw) continue;
				try {
					const target = localTarget(raw, pageUrl, site);
					if (!target) continue;
					links++;
					if (!names.has(target.path)) errors.push(`${path}: missing local resource ${raw}`);
					else if (attribute === 'href' && target.fragment && pages.has(target.path) && !pages.get(target.path).ids.has(target.fragment)) errors.push(`${path}: missing anchor ${raw}`);
				} catch (error) { errors.push(`${path}: ${error.message}`); }
			}
		}
	}
	const published = posts.filter(({ data }) => data.draft !== true);
	for (const post of posts) {
		const path = `blog/${post.id}/index.html`;
		if (post.data.draft === true) {
			if (pages.has(path)) errors.push(`${post.id}: draft leaked into production`);
			continue;
		}
		const page = pages.get(path);
		if (!page) { errors.push(`${post.id}: article page missing`); continue; }
		const lang = post.data.lang ?? post.id.match(/-(cn|en)$/)?.[1];
		const htmlLang = lang === 'cn' ? 'zh-CN' : 'en';
		if (!page.nodes.some((node) => node.tag === 'html' && node.attrs.lang === htmlLang)) errors.push(`${post.id}: incorrect HTML language`);
		const group = post.data.group ?? post.id.replace(/-(cn|en)$/, '');
		const translations = published.filter((other) => (other.data.group ?? other.id.replace(/-(cn|en)$/, '')) === group);
		if (translations.length > 1) for (const other of translations) {
			const alternateLang = (other.data.lang ?? other.id.match(/-(cn|en)$/)?.[1]) === 'cn' ? 'zh-CN' : 'en';
			const href = new URL(`/blog/${other.id}/`, site).href;
			if (!page.nodes.some((node) => node.tag === 'link' && node.attrs.rel === 'alternate' && node.attrs.hreflang === alternateLang && node.attrs.href === href)) errors.push(`${post.id}: missing alternate ${alternateLang}`);
		}
	}
	for (const [file, lang] of [['rss-zh.xml', 'zh-CN'], ['rss-en.xml', 'en-US']]) {
		if (!names.has(file) || !(await readFile(resolve(directory, file), 'utf8')).includes(`<language>${lang}</language>`)) errors.push(`${file}: incorrect feed language`);
	}
	return { errors, pages: pages.size, links };
}
