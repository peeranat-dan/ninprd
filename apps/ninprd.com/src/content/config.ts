import { glob } from "astro/loaders";
import { postLoader } from "../lib/wordpress/post-loader";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  loader: postLoader(),
});

const experience = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "src/content/experience",
  }),
  schema: z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string().transform((d) =>
      new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
    ),
    endDate: z
      .string()
      .optional()
      .transform((d) => {
        if (!d) return undefined;
        return new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
      }),
    description: z.string(),
    companyWebsite: z.string().url(),
  }),
});

export const collections = {
  blog,
  experience,
};
