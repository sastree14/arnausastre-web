import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content";
import { getAllProjects } from "@/lib/projects";
import { queryGrowthTable } from "@/lib/supabase-growth";
import { serviceCatalog } from "@/lib/commercial-content";
import { LANGUAGES, SITE_ORIGIN, localizedHref } from "@/lib/site-routing";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "/",
    "/services",
    "/projects",
    "/knowledge",
    "/about",
    "/contact",
    "/partner-analitico",
    "/briefing",
    "/privacy",
    "/legal",
    ...serviceCatalog.map((s) => `/services/${s.slug}`),
    ...getAllProjects().flatMap((p) => [
      `/projects/${p.slug}`,
      `/projects/${p.slug}/case-study`,
    ]),
  ];
  const entries: MetadataRoute.Sitemap = routes.flatMap((path) =>
    LANGUAGES.map((lang) => ({
      url: SITE_ORIGIN + localizedHref(path, lang),
      alternates: {
        languages: Object.fromEntries(
          LANGUAGES.map((code) => [
            code,
            SITE_ORIGIN + localizedHref(path, code),
          ]),
        ),
      },
      changeFrequency: "monthly",
      priority: path === "/" ? 1 : path.includes("case-study") ? 0.65 : 0.8,
    })),
  );
  for (const article of getAllArticles()) {
    const langs = LANGUAGES.filter(
      (lang) => lang !== "ca" || Boolean(article.bodyCa),
    );
    for (const lang of langs)
      entries.push({
        url: `${SITE_ORIGIN}/knowledge/${article.slug}/${lang}`,
        lastModified: new Date(article.date),
        alternates: {
          languages: Object.fromEntries(
            langs.map((code) => [
              code,
              `${SITE_ORIGIN}/knowledge/${article.slug}/${code}`,
            ]),
          ),
        },
        changeFrequency: "monthly",
        priority: 0.7,
      });
  }
  try {
    const pages = await queryGrowthTable<{ slug: string; updated_at?: string }>(
      "seo_pages",
      { tenant_id: "eq.sc-analytics", status: "eq.published", limit: "200" },
      { cacheSeconds: 300 },
    );
    for (const page of pages)
      if (!serviceCatalog.some((service) => service.slug === page.slug))
        entries.push({
          url: `${SITE_ORIGIN}/en/services/${page.slug}`,
          lastModified: page.updated_at ? new Date(page.updated_at) : undefined,
          changeFrequency: "monthly",
          priority: 0.7,
        });
    const articles = await queryGrowthTable<{
      brief_id?: string;
      content_id: string;
      language: string;
      published_at?: string;
    }>(
      "content_items",
      {
        tenant_id: "eq.sc-analytics",
        content_type: "eq.article",
        status: "eq.published",
        order: "published_at.desc",
        limit: "1000",
      },
      { cacheSeconds: 300 },
    );
    for (const article of articles)
      if (LANGUAGES.includes(article.language as (typeof LANGUAGES)[number]))
        entries.push({
          url: `${SITE_ORIGIN}/knowledge/${article.brief_id || article.content_id}/${article.language}`,
          lastModified: article.published_at
            ? new Date(article.published_at)
            : undefined,
          changeFrequency: "monthly",
          priority: 0.7,
        });
  } catch {
    /* Repository pages remain available without the optional CMS. */
  }
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
