import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

interface RssFeedOptions {
	posts: CollectionEntry<'blog'>[];
	title: string;
	description: string;
	feedUrl: string;
	site?: string;
}

/**
 * Get post language from frontmatter or filename
 */
export function getPostLang(post: CollectionEntry<'blog'>): string {
	const meta = post.data as { lang?: string };
	if (meta.lang === 'cn' || meta.lang === 'en') return meta.lang;

	const idMatch = post.id.match(/-(cn|en)$/);
	return idMatch?.[1] ?? 'en';
}

/**
 * Generate RSS feed
 */
export async function generateRssFeed({ posts, title, description, feedUrl, site }: RssFeedOptions) {
	const BASE_URL = import.meta.env.BASE_URL || '/';

	return rss({
		title,
		description,
		site: site ?? BASE_URL,
		items: posts.map((post) => {
			const postLang = getPostLang(post);
			const pubDate = post.data.updatedDate ?? post.data.pubDate;

			return {
				title: post.data.title,
				pubDate,
				description: post.data.description,
				link: `${BASE_URL}blog/${post.id}/`,
				categories: post.data.tags ?? [],
				// Add language for RSS readers that support it
				...(postLang && { lang: postLang }),
			};
		}),
		customData: `<language>en-us</language>`,
	});
}

/**
 * Get all posts sorted by date (newest first)
 */
export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
	const posts = await getCollection('blog');
	return posts.sort((a, b) => {
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
