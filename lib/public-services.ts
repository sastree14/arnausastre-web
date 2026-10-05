import "server-only";
import { cache } from "react";
import { queryGrowthTable } from "@/lib/supabase-growth";
export type PublishedService = {
  slug: string;
  title: string;
  meta_description: string;
  h1: string;
  intro: string;
  sections?: { heading?: string; body?: string }[];
  cta_title?: string;
  cta_body?: string;
};
export const getPublishedService = cache(
  async (slug: string): Promise<PublishedService | null> => {
    if (!/^[a-z0-9-]{1,120}$/.test(slug) || !process.env.SUPABASE_URL)
      return null;
    try {
      return (
        (
          await queryGrowthTable<PublishedService>(
            "seo_pages",
            {
              tenant_id: "eq.sc-analytics",
              slug: `eq.${slug}`,
              status: "eq.published",
              limit: "1",
            },
            { cacheSeconds: 300 },
          )
        )[0] || null
      );
    } catch {
      return null;
    }
  },
);
