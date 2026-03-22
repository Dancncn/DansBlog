import type { APIContext } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { getAllPosts, generateRssFeed } from '../utils/rss';

export async function GET(context: APIContext) {
	const posts = await getAllPosts();

	return generateRssFeed({
		posts,
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		feedUrl: '/rss.xml',
		site: context.site,
	});
}
