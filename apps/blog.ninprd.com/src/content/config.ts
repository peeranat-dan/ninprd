import { defineCollection } from 'astro:content'
import { wordpressLoader } from '../lib/wordpress-loader'

const blog = defineCollection({
  loader: wordpressLoader(),
})

export const collections = {
  blog,
}
