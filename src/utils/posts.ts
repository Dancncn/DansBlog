import type { CollectionEntry } from 'astro:content';

/**
 * Get related posts based on tag similarity.
 * - Same language only
 * - Exclude current post
 * - Rank by number of overlapping tags
 * - At least 1 shared tag required
 * - Fallback to latest posts if no matches
 */
export function getRelatedPosts(
	currentPost: CollectionEntry<'blog'>,
	allPosts: CollectionEntry<'blog'>[],
	limit: number = 4
): CollectionEntry<'blog'>[] {
	const currentTags = new Set(currentPost.data.tags ?? []);
	const currentLang = getPostLang(currentPost);

	// Filter: same language, not current post, has at least 1 shared tag
	const candidates = allPosts
		.filter((post) => {
			// Exclude current post
			if (post.id === currentPost.id) return false;

			// Same language check
			const postLang = getPostLang(post);
			if (postLang !== currentLang) return false;

			// Must have at least 1 shared tag
			const postTags = new Set(post.data.tags ?? []);
			const sharedTags = [...currentTags].filter((tag) => postTags.has(tag));
			return sharedTags.length > 0;
		})
		.map((post) => {
			const postTags = new Set(post.data.tags ?? []);
			const sharedTags = [...currentTags].filter((tag) => postTags.has(tag));
			return {
				post,
				score: sharedTags.length,
			};
		})
		.sort((a, b) => b.score - a.score);

	// If we have related posts, return top N
	if (candidates.length > 0) {
		return candidates.slice(0, limit).map((c) => c.post);
	}

	// Fallback: latest posts (same language, excluding current)
	const sorted = allPosts
		.filter((post) => {
			if (post.id === currentPost.id) return false;
			return getPostLang(post) === currentLang;
		})
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	return sorted.slice(0, limit);
}

/**
 * Get post language from frontmatter or filename
 */
function getPostLang(post: CollectionEntry<'blog'>): string | undefined {
	const meta = post.data as { lang?: string };
	if (meta.lang === 'cn' || meta.lang === 'en') return meta.lang;

	const idMatch = post.id.match(/-(cn|en)$/);
	return idMatch?.[1] as 'cn' | 'en' | undefined;
}
