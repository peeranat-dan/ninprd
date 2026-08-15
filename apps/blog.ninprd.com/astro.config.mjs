import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import expressiveCode from 'astro-expressive-code'
import robotsTxt from 'astro-robots-txt'
import { defineConfig } from 'astro/config'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

import rehypeTrimMdLinks from './plugins/rehype-trim-md-links'
import remarkCallouts from './plugins/remark-callouts'
import remarkCarousel from './plugins/remark-carousel'

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.ninprd.com',
  integrations: [
    react(),
    expressiveCode({
      useDarkModeMediaQuery: false, // disable dark mode by system
    }),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        if (item.url.includes('/blog/')) {
          item.priority = 0.8
          item.changefreq = 'monthly'
        }
        return item
      },
    }),
    robotsTxt(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [
      rehypeKatex,
      [rehypeExternalLinks, { target: '_blank' }],
      rehypeTrimMdLinks,
    ],
    remarkPlugins: [remarkMath, remarkCarousel, remarkCallouts],
  },
  redirects: {
    '/blog/wordpress-basic-i':
      'https://learn.ninprd.com/wordpress-series/wordpress-basic/wordpress-basic-1/',
    '/blog/wordpress-basic-ii':
      'https://learn.ninprd.com/wordpress-series/wordpress-basic/wordpress-basic-2/',
    '/blog/wordpress-basic-iii':
      'https://learn.ninprd.com/wordpress-series/wordpress-basic/wordpress-basic-3/',
    '/blog/wordpress-basic-iv':
      'https://learn.ninprd.com/wordpress-series/wordpress-basic/wordpress-basic-4/',
    '/blog/tutorial-building-your-first-wordpress-website':
      'https://learn.ninprd.com/wordpress-series/wordpress-basic/wordpress-basic-tutorial/',
  },
})
