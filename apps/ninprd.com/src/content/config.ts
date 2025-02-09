import { postLoader } from "../lib/wordpress/post-loader";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  loader: postLoader(),
});

const experience = defineCollection({
  type: "content",
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
