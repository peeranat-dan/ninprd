import { defineCollection } from 'astro:content'
import { docsSchema } from '@astrojs/starlight/schema'
import { glob } from 'astro/loaders'

const knowledgeBase = defineCollection({
  loader: glob({
    pattern: ['**/*.{md,mdx}', '!templates/**', '!/.obsidian/**'],
    base: './src/content/docs',
  }),
  schema: docsSchema(),
})

export const collections = {
  docs: knowledgeBase,
}
