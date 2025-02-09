import { z } from "astro/zod";

export const WordPressPostSchema = z.object({
  id: z.number(),
  title: z.object({
    rendered: z.string(),
  }),
  date: z.string().transform((d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  ),
  slug: z.string(),
  content: z.object({
    rendered: z.string(),
  }),
  excerpt: z.object({
    rendered: z.string().transform((value) => value.replace(/<\/?p>/g, "")),
  }),
  _embedded: z.object({
    author: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        url: z.string(),
        avatar_urls: z.object({
          24: z.string(),
          48: z.string(),
          96: z.string(),
        }),
      }),
    ),
    "wp:featuredmedia": z.array(
      z.object({
        id: z.number(),
        slug: z.string(),
        alt_text: z.string(),
        media_details: z.object({
          sizes: z.record(
            z.string(),
            z.object({
              file: z.string(),
              width: z.number(),
              height: z.number(),
              source_url: z.string(),
            }),
          ),
        }),
      }),
    ),
    "wp:term": z.array(
      z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          slug: z.string(),
          taxonomy: z.string(),
        }),
      ),
    ),
  }),
});

export type WordPressPost = z.infer<typeof WordPressPostSchema>;
