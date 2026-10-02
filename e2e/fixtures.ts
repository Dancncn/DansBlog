import { test as base, expect } from '@playwright/test';

export const ARTICLE_CN = '/blog/how-to-build-a-personal-blog-cn/';

interface ApiRequest {
	method: string;
	pathname: string;
	body: string | null;
}

interface NetworkLog {
	api: ApiRequest[];
	blockedExternal: string[];
}

// Remote images are served from this local fixture, including article lightboxes.
// No test requires Cloudflare, GitHub, analytics, a mailbox, or the production API.
const IMAGE = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 640 320"><rect width="640" height="320" fill="#e4e4e7"/><text x="24" y="160" fill="#18181b" font-size="24">Offline article image</text></svg>';

export const test = base.extend<{ network: NetworkLog }>({
	network: [async ({ context, page }, use) => {
		const log: NetworkLog = { api: [], blockedExternal: [] };
		const unexpectedApi: string[] = [];
		const pageErrors: string[] = [];
		page.on('pageerror', (error) => pageErrors.push(error.message));

		await context.route('**/*', async (route) => {
			const request = route.request();
			const url = new URL(request.url());
			if (url.origin === 'http://127.0.0.1:4322') {
				await route.continue();
				return;
			}

			if (url.hostname === 'api.danarnoux.com') {
				log.api.push({ method: request.method(), pathname: url.pathname, body: request.postData() });
				const headers = {
					'access-control-allow-origin': 'http://127.0.0.1:4322',
					'access-control-allow-credentials': 'true',
					'access-control-allow-methods': 'GET,POST,OPTIONS',
					'access-control-allow-headers': 'Authorization, Content-Type',
				};
				if (request.method() === 'OPTIONS') {
					await route.fulfill({ status: 204, headers });
					return;
				}
				let status = 200;
				let body: unknown;
				if (url.pathname === '/api/views/batch' && request.method() === 'GET') {
					body = { views: Object.fromEntries((url.searchParams.get('posts') || '').split(',').filter(Boolean).map((key) => [key, 0])) };
				} else if (url.pathname === '/api/views' && ['GET', 'POST'].includes(request.method())) {
					body = { views: 0, incremented: request.method() === 'POST' };
				} else if (url.pathname === '/api/comments' && request.method() === 'GET') {
					body = { comments: [] };
				} else if (url.pathname === '/api/me' && request.method() === 'GET') {
					status = 401;
					body = { error: 'Unauthorized' };
				} else if (url.pathname === '/api/admin/check' && request.method() === 'GET') {
					body = { isAdmin: false, email: null };
				} else {
					// Fail closed, especially for contact/email/OAuth/upload mutations.
					unexpectedApi.push(`${request.method()} ${url.pathname}`);
					status = 403;
					body = { error: 'External side effects are blocked by browser regression tests' };
				}
				await route.fulfill({ status, headers, json: body });
				return;
			}

			log.blockedExternal.push(url.origin);
			if (request.resourceType() === 'image') {
				await route.fulfill({ contentType: 'image/svg+xml', body: IMAGE });
			} else {
				await route.abort('blockedbyclient');
			}
		});

		await use(log);
		expect(unexpectedApi, 'The test must not submit login, contact, upload, or other unexpected API requests').toEqual([]);
		expect(pageErrors, 'Browser scripts must run without uncaught exceptions').toEqual([]);
	}, { auto: true }],
});

export { expect };
