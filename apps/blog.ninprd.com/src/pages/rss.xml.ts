import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async (context) => {
  const posts = await getCollection("blog");
  return rss({
    title: "blog.ninprd",
    description:
      "Read about experience sharing and technology on blog.ninprd, a dynamic blog by Peeranat Danaidusadeekul, a full-time Software Engineer and part-time blogger.",
    site: context.site ?? "https://blog.ninprd.com",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.excerpt,
      link: `/blog/${post.data.slug}/`,
    })),
  });
};
