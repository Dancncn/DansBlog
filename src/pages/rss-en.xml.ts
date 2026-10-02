import type { APIContext } from 'astro';
import { SITE_TITLE } from '../consts';
import { getAllPosts, filterPostsByLang, generateRssFeed } from '../utils/rss';

export async function GET(context: APIContext) {
	const allPosts = await getAllPosts();
	const posts = filterPostsByLang(allPosts, 'en');

	return generateRssFeed({
		posts,
		title: `${SITE_TITLE} - English`,
		description: 'English blog posts feed',
		language: 'en-US',
		site: context.site!,
	});
}
