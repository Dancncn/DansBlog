/**
 * IndexNow Notifier
 *
 * Notifies Bing about updated URLs.
 * Designed for Cloudflare Pages automatic deployment.
 *
 * Usage:
 *   npm run indexnow:sitemap   # Notify all URLs from sitemap
 *   npm run indexnow -- https://danarnoux.com/blog/new-post/  # Notify single URL
 *
 * Required env vars (set in Cloudflare Pages):
 *   INDEXNOW_KEY    - Your IndexNow key
 *   INDEXNOW_HOST   - Your domain (optional, defaults to danarnoux.com)
 */


// IndexNow config from environment variables
const KEY = process.env.INDEXNOW_KEY;
const HOST = process.env.INDEXNOW_HOST || 'danarnoux.com';

// Bing IndexNow endpoint
const BING_URL = 'https://www.bing.com/indexnow';

/**
 * Get key from environment variable
 */
function getKey() {
	if (!KEY) {
		console.error('❌ INDEXNOW_KEY environment variable is not set');
		console.error('');
		console.error('To run locally:');
		console.error('  INDEXNOW_KEY=your-key node scripts/indexnow.mjs sitemap');
		console.error('');
		console.error('In Cloudflare Pages, add this in Settings > Variables and Secrets:');
		console.error('  INDEXNOW_KEY = your-indexnow-key');
		process.exit(1);
	}
	return KEY;
}

/**
 * Fetch URLs from sitemap using simple regex (no extra deps)
 */
async function fetchUrlsFromSitemap(sitemapUrl) {
	try {
		const response = await fetch(sitemapUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch sitemap: ${response.status}`);
		}
		const xml = await response.text();

		// Simple regex to extract URLs from <loc>...</loc>
		const urlMatches = xml.match(/<loc>([^<]+)<\/loc>/g);
		if (!urlMatches) {
			console.log('⚠️  No URLs found in sitemap');
			return [];
		}

		const urls = urlMatches.map((match) => match.replace(/<\/?loc>/g, ''));
		return urls;
	} catch (error) {
		console.error(`❌ Failed to fetch sitemap: ${error.message}`);
		process.exit(1);
	}
}

/**
 * Send IndexNow notification
 */
async function notifyIndexNow(urls, key) {
	const payload = {
		host: HOST,
		key: key,
		urlList: urls,
	};

	const payloadStr = JSON.stringify(payload);

	console.log(`📤 Notifying Bing about ${urls.length} URL(s)...`);

	try {
		const response = await fetch(BING_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: payloadStr,
		});

		if (response.ok || response.status === 202) {
			console.log('✅ Bing notified successfully!');
			console.log(`   Status: ${response.status}`);
		} else {
			const errorText = await response.text();
			console.log(`⚠️  Bing response: ${response.status}`);
			console.log(`   ${errorText}`);
		}
	} catch (error) {
		console.error(`❌ Failed to notify Bing: ${error.message}`);
	}
}

/**
 * Main
 */
async function main() {
	// Get key - from env or file
	const key = getKey();
	const source = KEY ? 'environment' : 'file';
	console.log(`✅ Key loaded from ${source}`);

	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.log('Usage: node scripts/indexnow.mjs <url1> <url2> ...');
		console.log('   or: node scripts/indexnow.mjs sitemap');
		console.log('   or: node scripts/indexnow.mjs https://danarnoux.com/blog/new-post/');
		process.exit(0);
	}

	let urls = [];

	if (args[0] === 'sitemap') {
		// Fetch from sitemap
		console.log('📥 Fetching URLs from sitemap...');
		urls = await fetchUrlsFromSitemap(`https://danarnoux.com/sitemap.xml`);
		console.log(`   Found ${urls.length} URLs`);
	} else {
		// Use provided URLs
		urls = args.map((url) => {
			// Ensure URL has protocol
			return url.startsWith('http') ? url : `https://danarnoux.com${url.startsWith('/') ? '' : '/'}${url}`;
		});
	}

	if (urls.length === 0) {
		console.log('❌ No URLs to notify');
		process.exit(1);
	}

	await notifyIndexNow(urls, key);
}

main();
