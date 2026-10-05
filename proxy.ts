import { NextRequest, NextResponse } from "next/server";
import { localizedHref, stripLocale } from "@/lib/site-routing";
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const prefix = pathname.match(/^\/(es|ca|en)(?=\/|$)/)?.[1];
  const articleLocale = pathname.match(/^\/knowledge\/[^/]+\/(es|ca|en)$/)?.[1];
  const lang = prefix || articleLocale || "es";
  const cleanPath = stripLocale(pathname);
  const aliasPath = cleanPath
    .replace(/^\/insights(?=\/|$)/, "/knowledge")
    .replace(/^\/case-studies(?=\/|$)/, "/projects");
  if (aliasPath !== cleanPath) {
    const url = request.nextUrl.clone();
    url.pathname = localizedHref(aliasPath, lang as "es" | "ca" | "en");
    return NextResponse.redirect(url, 308);
  }

  const headers = new Headers(request.headers);
  headers.set("x-site-language", lang);
  headers.set("x-site-path", pathname);
  if (prefix) {
    const article = cleanPath.match(/^\/knowledge\/([^/]+)(?:\/(es|ca|en))?$/);
    if (article) {
      const url = request.nextUrl.clone();
      url.pathname = `/knowledge/${article[1]}/${article[2] || lang}`;
      return NextResponse.redirect(url, 308);
    }
    return NextResponse.next({ request: { headers } });
  }
  if (articleLocale) return NextResponse.next({ request: { headers } });
  const url = request.nextUrl.clone();
  url.pathname = localizedHref(pathname, "es");
  return NextResponse.redirect(url, 308);
}
export const config = {
  matcher: ["/((?!api(?:/|$)|growth-admin(?:/|$)|_next(?:/|$)|.*\\..*).*)"],
};
