import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import { getPostLang as getPostLangBase } from './postAnalytics';

interface RssFeedOptions {
	posts: CollectionEntry<'blog'>[];
	title: string;
	description: string;
	site: URL;
	language?: 'zh-CN' | 'en-US';
}

export function getPostLang(post: CollectionEntry<'blog'>): string {
	return getPostLangBase(post) ?? 'en';
}

/**
 * Generate RSS feed
 */
export async function generateRssFeed({ posts, title, description, site, language }: RssFeedOptions) {
	const BASE_URL = import.meta.env.BASE_URL || '/';
	const items = await Promise.all(
		posts.map(async (post) => {
			const postLang = getPostLang(post);
			const pubDate = post.data.updatedDate ?? post.data.pubDate;
			const renderedHtml = post.rendered?.html ?? post.body ?? '';

			return {
				title: post.data.title,
				pubDate,
				description: post.data.description,
				link: `${BASE_URL}blog/${post.id}/`,
				categories: post.data.tags ?? [],
				content: renderedHtml,
				// Add language for RSS readers that support it
				...(postLang && { lang: postLang }),
			};
		})
	);

	return rss({
		title,
		description,
		site,
		items,
		customData: language ? `<language>${language}</language>` : '',
	});
}

/**
 * Get all posts sorted by date (newest first)
 */
export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
	const posts = await getCollection('blog');
	return posts
		.filter((post) => post.data.draft !== true)
		.sort((a, b) => {
		const dateA = a.data.updatedDate ?? a.data.pubDate;
		const dateB = b.data.updatedDate ?? b.data.pubDate;
		return dateB.valueOf() - dateA.valueOf();
		});
}

/**
 * Filter posts by language
 */
export function filterPostsByLang(posts: CollectionEntry<'blog'>[], lang: string): CollectionEntry<'blog'>[] {
	return posts.filter((post) => getPostLang(post) === lang);
}
