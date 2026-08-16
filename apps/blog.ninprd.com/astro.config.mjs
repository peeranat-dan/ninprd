import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import expressiveCode from 'astro-expressive-code'
import robotsTxt from 'astro-robots-txt'
import { defineConfig, fontProviders } from 'astro/config'
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
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Sora',
      cssVariable: '--font-sora',
      weights: ['300 700'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: ['200 800'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Sans Thai Looped',
      cssVariable: '--font-ibm-plex-sans-thai-looped',
      weights: ['400', '500', '600', '700'],
      subsets: ['latin', 'thai'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Sans Thai',
      cssVariable: '--font-ibm-plex-sans-thai',
      weights: ['400', '500', '600', '700'],
      subsets: ['latin', 'thai'],
    },
  ],
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
