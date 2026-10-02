import { test, expect, ARTICLE_CN } from './fixtures';

test('mobile menu opens, navigates, and closes correctly after browser back', async ({ page }) => {
	await page.goto('/');
	const trigger = page.getByRole('button', { name: 'Menu', exact: true });
	await trigger.click();
	const drawer = page.getByRole('complementary', { name: 'Mobile navigation' });
	await expect(drawer).toBeVisible();
	await expect(trigger).toHaveAttribute('aria-expanded', 'true');
	await drawer.getByRole('link', { name: 'Blog', exact: true }).click();
	await expect(page).toHaveURL(/\/blog\/$/);
	await expect(page.locator('#mobile-drawer')).toHaveAttribute('aria-hidden', 'true');
	await expect(page.locator('html')).not.toHaveClass(/overflow-hidden/);
	await page.goBack();
	await expect(page).toHaveURL('http://127.0.0.1:4322/');
	await trigger.click();
	await expect(drawer).toBeVisible();
	await expect(trigger).toHaveAttribute('aria-expanded', 'true');
	await drawer.getByRole('button', { name: 'Close menu' }).click();
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await expect(page.locator('#mobile-drawer')).toBeHidden();
});

test('mobile article contents navigate to a heading and release the scroll lock', async ({ page }) => {
	await page.goto(ARTICLE_CN);
	const trigger = page.getByRole('button', { name: 'Open table of contents' });
	await trigger.click();
	const drawer = page.getByRole('complementary', { name: 'Table of contents', exact: true });
	await expect(drawer).toBeVisible();
	const link = drawer.getByRole('link', { name: '需求分析', exact: true });
	const href = await link.getAttribute('href');
	await link.click();
	await expect.poll(() => new URL(page.url()).hash).toBe(href);
	await expect(page.getByRole('heading', { level: 2, name: '需求分析', exact: true })).toBeInViewport();
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await expect(page.locator('#toc-drawer')).toBeHidden();
	await expect(page.locator('html')).not.toHaveClass(/overflow-hidden/);
});
