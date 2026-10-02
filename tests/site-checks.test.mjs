import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { checkPosts, checkBuiltSite, localTarget } from '../scripts/lib/site-checks.mjs';

const article = { title: 'Example', description: 'Example description', pubDate: '2026-10-02', lang: 'cn', group: 'example' };
test('duplicate group/language fails even when filenames differ', () => {
	assert.match(checkPosts([{ id: 'setup-cn', data: article }, { id: 'uninstall-cn', data: article }]).join('\n'), /duplicate group/);
});
test('language suffix and boolean draft validation', () => {
	const errors = checkPosts([{ id: 'example-en', data: { ...article, draft: 'true' } }]);
	assert.equal(errors.length, 2);
});
test('local links resolve relative paths and encoded Chinese fragments', () => {
	assert.deepEqual(localTarget('../other/#%E7%9B%AE%E5%BD%95', 'https://danarnoux.com/blog/example/', 'https://danarnoux.com'), { path: 'blog/other/index.html', fragment: '目录' });
	assert.equal(localTarget('https://example.org/', 'https://danarnoux.com/', 'https://danarnoux.com'), null);
});
test('built-site gate detects missing resources, broken fragments and leaked drafts', async () => {
	const root = await mkdtemp(join(tmpdir(), 'blog-site-check-'));
	try {
		await mkdir(join(root, 'blog', 'draft-cn'), { recursive: true });
		await writeFile(join(root, 'index.html'), '<a href="/missing/">Missing</a><a href="#missing">Anchor</a><img src="/missing.png">');
		await writeFile(join(root, 'blog', 'draft-cn', 'index.html'), '<html lang="zh-CN"></html>');
		await writeFile(join(root, 'rss-zh.xml'), '<language>zh-CN</language>');
		await writeFile(join(root, 'rss-en.xml'), '<language>en-US</language>');
		const { errors } = await checkBuiltSite(root, [{ id: 'draft-cn', data: { ...article, draft: true } }]);
		assert.equal(errors.length, 4);
		assert.ok(errors.some((error) => error.includes('draft leaked')));
	} finally {
		assert.ok(resolve(root).startsWith(resolve(tmpdir()) + sep + 'blog-site-check-'));
		await rm(root, { recursive: true, force: true });
	}
});
