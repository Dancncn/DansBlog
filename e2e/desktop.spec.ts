import { test, expect, ARTICLE_CN } from './fixtures';

test('homepage article cards navigate to the selected article', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Latest Posts' })).toBeVisible();
	const card = page.getByRole('main').getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) }).first();
	const title = await card.getByRole('heading', { level: 3 }).innerText();
	const href = await card.getAttribute('href');
	expect(href).toMatch(/^\/blog\/.+\/$/);
	await card.click();
	await expect(page).toHaveURL(new RegExp(`${href}$`));
	await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
});

test('Chinese and English versions retain their article identity and language metadata', async ({ page }) => {
	const cn = '/blog/openclaw-windows-uninstall-guide-cn/';
	const en = '/blog/openclaw-windows-uninstall-guide-en/';
	await page.goto(cn);
	await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
	await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute('href', `https://danarnoux.com${cn}`);
	await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `https://danarnoux.com${en}`);
	await page.getByRole('link', { name: 'English Version', exact: true }).click();
	await expect(page).toHaveURL(new RegExp(`${en}$`));
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.getByRole('heading', { level: 1, name: 'OpenClaw Windows Uninstall Guide', exact: true })).toBeVisible();
	await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute('href', `https://danarnoux.com${cn}`);
	await page.getByRole('link', { name: '中文版', exact: true }).click();
	await expect(page).toHaveURL(new RegExp(`${cn}$`));
	await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
});

test('desktop table of contents scrolls to a Chinese heading', async ({ page }) => {
	await page.goto(ARTICLE_CN);
	const link = page.locator('[data-toc="sidebar"]').getByRole('link', { name: '安装', exact: true });
	const href = await link.getAttribute('href');
	await link.click();
	await expect.poll(() => new URL(page.url()).hash).toBe(href);
	await expect(page.getByRole('heading', { level: 2, name: '安装', exact: true })).toBeInViewport();
	await expect(link).toHaveAttribute('aria-current', 'true');
});

test('login dialog opens and closes without submitting a login', async ({ page }) => {
	await page.goto('/');
	const login = page.getByRole('banner').getByRole('button', { name: 'Login', exact: true });
	const dialog = page.getByRole('dialog', { name: 'Login', exact: true });
	await login.click();
	await expect(dialog).toBeVisible();
	await expect(dialog.getByRole('link', { name: 'Login with GitHub' })).toHaveAttribute('href', /\/api\/auth\/github\/start$/);
	await expect(dialog.getByRole('button', { name: 'Send Login Link' })).toBeVisible();
	await dialog.getByRole('button', { name: 'Cancel' }).click();
	await expect(dialog).toBeHidden();
	await login.click();
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
});

test('article lightbox opens, closes by button and Escape, and restores scrolling', async ({ page }) => {
	await page.goto(ARTICLE_CN);
	const image = page.locator('.markdown-prose').getByRole('img', { name: 'step1', exact: true }).first();
	await expect(image).toBeVisible();
	await image.scrollIntoViewIfNeeded();
	const scrollBefore = await page.evaluate(() => window.scrollY);
	await image.click();
	const lightbox = page.locator('#img-lightbox');
	await expect(lightbox).toHaveAttribute('aria-hidden', 'false');
	await expect(lightbox.getByRole('img', { name: 'step1', exact: true })).toBeVisible();
	await expect(page.locator('body')).toHaveCSS('position', 'fixed');
	await lightbox.getByRole('button', { name: 'Close image preview' }).click();
	await expect(lightbox).toBeHidden();
	await expect(page.locator('body')).not.toHaveCSS('position', 'fixed');
	await expect.poll(() => page.evaluate((position) => Math.abs(window.scrollY - position), scrollBefore)).toBeLessThan(3);
	await image.click();
	await expect(lightbox).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(lightbox).toBeHidden();
});

test('code copying writes the original code and long blocks expand and collapse', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto(ARTICLE_CN);
	const codeBlock = page.locator('.markdown-prose pre').first();
	const original = (await codeBlock.locator('code').textContent())!;
	await codeBlock.hover();
	const copy = codeBlock.getByRole('button', { name: 'Copy code', exact: true });
	await copy.click();
	await expect(copy).toContainText('Copied!');
	// Windows clipboard normalizes line endings; preserve every other code character.
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied.replace(/\r\n/g, '\n')).toBe(original.replace(/\r\n/g, '\n'));
	const longBlock = page.locator('.markdown-prose pre').filter({ has: page.locator('.code-expand-btn') }).first();
	await expect(longBlock).toHaveCSS('max-height', '400px');
	await longBlock.getByRole('button', { name: /Expand Code$/ }).click();
	await expect(longBlock).toHaveCSS('max-height', 'none');
	await longBlock.getByRole('button', { name: /Collapse$/ }).click();
	await expect(longBlock).toHaveCSS('max-height', '400px');
});

test('browser back restores article controls without duplicate initialization or views', async ({ page, network }) => {
	await page.goto(ARTICLE_CN);
	await expect(page.locator('[data-post-views]')).toHaveText('0 views');
	const blockCount = await page.locator('.markdown-prose pre').count();
	expect(blockCount).toBeGreaterThan(0);
	await expect(page.getByRole('button', { name: 'Copy code', exact: true })).toHaveCount(blockCount);

	for (let round = 0; round < 2; round++) {
		await page.getByRole('banner').getByRole('link', { name: 'Blog', exact: true }).click();
		await expect(page).toHaveURL(/\/blog\/$/);
		await page.goBack();
		await expect(page).toHaveURL(new RegExp(`${ARTICLE_CN}$`));
		await expect(page.locator('[data-post-views]')).toHaveText('0 views');
		await expect(page.getByRole('button', { name: 'Copy code', exact: true })).toHaveCount(blockCount);
		const rss = page.getByRole('button', { name: 'RSS Feed', exact: true });
		await rss.click();
		await expect(rss).toHaveAttribute('aria-expanded', 'true');
		await rss.click();
		await expect(rss).toHaveAttribute('aria-expanded', 'false');
	}
	const increments = network.api.filter((request) => request.method === 'POST' && request.pathname === '/api/views');
	expect(increments).toHaveLength(1);
});
