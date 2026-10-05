import { cache } from "react";
import { headers } from "next/headers";
import type { Metadata } from "next";
import type { SiteLanguage } from "@/lib/public-copy";
import { LANGUAGES, SITE_ORIGIN, localizedHref } from "@/lib/site-routing";
export const requestLanguage = cache(async (): Promise<SiteLanguage> => {
  const lang = (await headers()).get("x-site-language");
  return lang === "en" || lang === "ca" ? lang : "es";
});
export async function pageMetadata(
  path: string,
  titles: Record<SiteLanguage, string>,
  descriptions: Record<SiteLanguage, string>,
): Promise<Metadata> {
  const lang = await requestLanguage();
  const canonical = localizedHref(path, lang);
  return {
    title: titles[lang],
    description: descriptions[lang],
    alternates: {
      canonical,
      languages: Object.fromEntries(
        LANGUAGES.map((code) => [code, localizedHref(path, code)]),
      ),
    },
    openGraph: {
      title: titles[lang],
      description: descriptions[lang],
      url: SITE_ORIGIN + canonical,
      locale: { es: "es_ES", ca: "ca_ES", en: "en_GB" }[lang],
      images: [{ url: `/api/og?lang=${lang}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[lang],
      description: descriptions[lang],
      images: [`/api/og?lang=${lang}`],
    },
  };
}
