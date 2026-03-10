import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			tags: z.array(z.string()).optional(),
			important: z.boolean().default(false),
			importantOrder: z.number().int().default(0),
			heroImage: image().optional(),
			// Language and grouping for bilingual posts
			lang: z.enum(['cn', 'en']).optional(),
			group: z.string().optional(),
			author: z.string().optional(),
			category: z.string().optional(),
			slug: z.string().optional(),
			draft: z.boolean().default(false),
			// For Typora image path compatibility
			'typora-root-url': z.string().optional(),
		}),
});

export const collections = { blog };
