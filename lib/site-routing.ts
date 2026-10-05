import type { SiteLanguage } from "@/lib/public-copy";
export const SITE_ORIGIN = "https://www.sc-analytics.io";
export const LANGUAGES: SiteLanguage[] = ["es", "ca", "en"];
export function stripLocale(path: string) {
  return path.replace(/^\/(es|ca|en)(?=\/|$)/, "") || "/";
}
export function localizedHref(href: string, lang: SiteLanguage): string {
  if (
    !href.startsWith("/") ||
    href.startsWith("//") ||
    /^\/(api|growth-admin|_next)(\/|$)/.test(href)
  )
    return href;
  const clean = stripLocale(href);
  const article = clean.match(
    /^\/knowledge\/([^/?#]+)(?:\/(es|ca|en))?([?#].*)?$/,
  );
  if (article)
    return `/knowledge/${article[1]}/${article[2] || lang}${article[3] || ""}`;
  return `/${lang}${clean === "/" ? "" : clean}`;
}
