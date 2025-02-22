// @ts-check
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import expressiveCode from 'astro-expressive-code'
import robotsTxt from 'astro-robots-txt'
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'

import rehypeTrimMdLinks from './plugins/rehype-trim-md-links'

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.ninprd.com',
  integrations: [
    react(),
    expressiveCode({
      useDarkModeMediaQuery: false, // disable dark mode by system
    }),
    mdx(),
    sitemap(),
    robotsTxt(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank' }],
      rehypeTrimMdLinks,
    ],
  },
  redirects: {
    '/blog/wordpress-basic-i':
      'https://learn.ninprd.com/wordpress-series/wordpress-basic/wordpress-basic-1/',
  },
})
