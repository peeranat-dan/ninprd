// @ts-check
import starlight from '@astrojs/starlight'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { remarkHeadingId } from 'remark-custom-heading-id'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkHeadingId],
  },
  integrations: [
    starlight({
      title: 'Learn.ninprd.com',
      social: {
        github: 'https://github.com/peeranat-dan/ninprd',
      },
      customCss: [
        './src/styles/globals.css',
        '@fontsource-variable/jetbrains-mono',
        '@fontsource/ibm-plex-sans-thai-looped/400.css',
        '@fontsource/ibm-plex-sans-thai-looped/600.css',
        '@fontsource/ibm-plex-sans-thai-looped/700.css',
        '@fontsource/ibm-plex-sans-thai/400.css',
        '@fontsource/ibm-plex-sans-thai/500.css',
        '@fontsource/ibm-plex-sans-thai/600.css',
        '@fontsource/ibm-plex-sans-thai/700.css',
        '@fontsource-variable/sora',
      ],
      sidebar: [
        'directory',
        {
          label: 'WordPress Series',
          items: [
            {
              label: 'WordPress Basics',
              autogenerate: { directory: 'wordpress-series/wordpress-basic' },
            },
          ],
        },
      ],
    }),
  ],
})
