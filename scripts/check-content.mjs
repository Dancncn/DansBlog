import { fileURLToPath } from 'node:url';
import { checkPosts, readPosts } from './lib/site-checks.mjs';

const posts = await readPosts(fileURLToPath(new URL('../src/content/blog/', import.meta.url)));
const errors = checkPosts(posts);
if (errors.length) {
	console.error(errors.join('\n'));
	process.exitCode = 1;
} else console.log(`Content checks passed: ${posts.length} article files.`);
