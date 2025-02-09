import {
  WORDPRESS_URL,
  WORDPRESS_USERNAME,
  WORDPRESS_PASSWORD,
} from "astro:env/server";
import type { Loader, LoaderContext } from "astro/loaders";
import { z } from "astro/zod";

import { PostSchema } from "../../types/post";
import { WordPressPostSchema } from "../../types/wordpress";

async function fetchWordPressPosts({
  page = 1,
  limit = 100,
}: {
  page?: number;
  limit?: number;
} = {}) {
  const url = `${WORDPRESS_URL}/posts/?_fields=id,title,content,excerpt,featured_media,date,slug,_links,_embedded&_embed=wp:term,wp:featuredmedia,author&per_page=${limit}&page=${page}`;

  const headers = new Headers();

  headers.append(
    "Authorization",
    "Basic " +
      Buffer.from(WORDPRESS_USERNAME + ":" + WORDPRESS_PASSWORD).toString(
        "base64",
      ),
  );

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  const data = await response.json();

  return z
    .array(WordPressPostSchema)
    .parse(data ?? [])
    .map((post) => ({
      id: post.id,
      title: post.title.rendered,
      slug: post.slug,
      content: post.content.rendered,
      excerpt: post.excerpt.rendered,
      date: post.date,
      featuredImage: {
        url: post._embedded["wp:featuredmedia"][0].media_details.sizes["full"]
          ?.source_url,
        alt: post._embedded["wp:featuredmedia"][0].alt_text,
      },
      author: {
        name: post._embedded.author[0].name,
        url: post._embedded.author[0].avatar_urls[48],
      },
      category: post._embedded["wp:term"][0][0],
      tags: post._embedded["wp:term"][1][0],
    }));
}

export function postLoader(): Loader {
  return {
    name: "wordpress-loader",
    load: async ({ store, logger }: LoaderContext): Promise<void> => {
      logger.info("Loading posts");
      const posts = await fetchWordPressPosts();
      store.clear();

      // Load data and update the store
      for (const post of posts) {
        store.set({
          id: post.id.toString(),
          data: post,
        });
      }
    },
    schema: () => PostSchema,
  };
}
