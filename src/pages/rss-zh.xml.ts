import type { APIContext } from 'astro';
import { SITE_TITLE } from '../consts';
import { getAllPosts, filterPostsByLang, generateRssFeed } from '../utils/rss';

export async function GET(context: APIContext) {
	const allPosts = await getAllPosts();
	const posts = filterPostsByLang(allPosts, 'cn');

	return generateRssFeed({
		posts,
		title: `${SITE_TITLE} - 中文`,
		description: '中文博客文章订阅',
		feedUrl: '/rss-zh.xml',
		site: context.site,
	});
}
