import { wordpressLoader } from "../lib/wordpress-loader";
import { defineCollection } from "astro:content";

const blog = defineCollection({
  loader: wordpressLoader(),
});

export const collections = {
  blog,
};
