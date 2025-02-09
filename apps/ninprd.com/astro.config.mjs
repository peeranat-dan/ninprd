// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      WORDPRESS_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      WORDPRESS_USERNAME: envField.string({
        context: "server",
        access: "secret",
      }),
      WORDPRESS_PASSWORD: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
});
