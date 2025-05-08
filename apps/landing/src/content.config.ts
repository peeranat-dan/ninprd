import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const projects = defineCollection({
  loader: glob({
    pattern: ['**/*.{md,mdx}'],
    base: './src/projects',
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      stacks: z.array(z.string()),
      imageUrl: image(),
      url: z.string().url(),
      order: z.number(),
    }),
})

export const collections = {
  projects,
}
