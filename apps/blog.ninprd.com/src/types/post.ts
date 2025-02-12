import { z } from 'astro/zod'
import { TaxonomySchema } from './taxonomy'

export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string(),
  date: z.string(),
  featuredImage: z.object({
    url: z.string(),
    alt: z.string(),
  }),
  author: z.object({
    name: z.string(),
    url: z.string(),
  }),
  category: TaxonomySchema,
  tags: TaxonomySchema,
})

export type Post = z.infer<typeof PostSchema>
