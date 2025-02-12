import { z } from "astro/zod";

export const TaxonomySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  taxonomy: z.string(),
});

export type Taxonomy = z.infer<typeof TaxonomySchema>;
