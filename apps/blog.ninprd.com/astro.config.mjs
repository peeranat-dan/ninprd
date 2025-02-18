// @ts-check
import { defineConfig, envField } from 'astro/config'
import react from '@astrojs/react'
import expressiveCode from 'astro-expressive-code'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'
import rehypeExternalLinks from 'rehype-external-links'

import rehypeTrimMdLinks from './plugins/rehype-trim-md-links'


// https://astro.build/config
export default defineConfig({
  integrations: [react(), expressiveCode(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [[rehypeExternalLinks, {target: '_blank'}], rehypeTrimMdLinks]
  },
  env: {
    schema: {
      WORDPRESS_URL: envField.string({
        context: 'server',
        access: 'secret',
      }),
      WORDPRESS_USERNAME: envField.string({
        context: 'server',
        access: 'secret',
      }),
      WORDPRESS_PASSWORD: envField.string({
        context: 'server',
        access: 'secret',
      }),
    },
  },
})
