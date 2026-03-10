import { constants, copyFile, stat, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
const sitemapIndexPath = resolve(distDir, 'sitemap-index.xml');
const sitemapPath = resolve(distDir, 'sitemap.xml');

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
	await copyFile(sitemapIndexPath, sitemapPath);
	await ensureNonEmpty(sitemapPath);
}
