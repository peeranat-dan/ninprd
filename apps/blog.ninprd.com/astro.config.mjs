// @ts-check
import { defineConfig, envField } from 'astro/config'

import react from '@astrojs/react'

import tailwindcss from '@tailwindcss/vite'

import expressiveCode from 'astro-expressive-code'

import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  integrations: [react(), expressiveCode(), mdx()],
  vite: {
    plugins: [tailwindcss()],
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
