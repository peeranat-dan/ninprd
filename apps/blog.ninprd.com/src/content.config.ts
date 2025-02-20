import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const blog = defineCollection({
  loader: glob({
    pattern: ['**/*.{md,mdx}', '!templates/**', '!/.obsidian/**'],
    base: './src/blog',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      tags: z.array(z.string()),
      date: z.date().transform((val) =>
        new Date(val).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      ),
      featuredImage: image(),
      status: z.enum(['draft', 'published']),
    }),
})

export const collections = {
  blog,
}
