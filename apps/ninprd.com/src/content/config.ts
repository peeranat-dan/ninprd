import { postLoader } from "../lib/wordpress/post-loader";
import { defineCollection } from "astro:content";

const blog = defineCollection({
  loader: postLoader(),
});

export const collections = {
  blog,
};
