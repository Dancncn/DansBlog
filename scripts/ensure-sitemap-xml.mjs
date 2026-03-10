import { access, constants, copyFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
const sitemapPath = resolve(distDir, 'sitemap.xml');
const sitemapIndexPath = resolve(distDir, 'sitemap-index.xml');

const exists = async (path) => {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
};

const ensureNonEmpty = async (path) => {
	const fileStat = await stat(path);
	if (!fileStat.isFile() || fileStat.size <= 0) {
		throw new Error(`Invalid sitemap file: ${path}`);
	}
};

if (await exists(sitemapPath)) {
	await ensureNonEmpty(sitemapPath);
	process.exit(0);
}

if (await exists(sitemapIndexPath)) {
	await ensureNonEmpty(sitemapIndexPath);
	await copyFile(sitemapIndexPath, sitemapPath);
	await ensureNonEmpty(sitemapPath);
	process.exit(0);
}

const files = await readdir(distDir).catch(() => []);
const sitemapFiles = files.filter((name) => /^sitemap.*\.xml$/i.test(name));
throw new Error(
	`dist/sitemap-index.xml is missing. Found sitemap files: ${sitemapFiles.length ? sitemapFiles.join(', ') : '(none)'}`
);
