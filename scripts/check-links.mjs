import { fileURLToPath } from 'node:url';
import { checkBuiltSite, readPosts } from './lib/site-checks.mjs';

const posts = await readPosts(fileURLToPath(new URL('../src/content/blog/', import.meta.url)));
const result = await checkBuiltSite(fileURLToPath(new URL('../dist/', import.meta.url)), posts);
if (result.errors.length) {
	console.error(result.errors.join('\n'));
	process.exitCode = 1;
} else console.log(`Built-site checks passed: ${result.pages} HTML pages, ${result.links} local links/assets; draft, language and translation checks passed.`);
