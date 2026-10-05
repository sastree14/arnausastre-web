"use client";
import { createContext, useContext, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { SiteLanguage } from "@/lib/public-copy";
import { localizedHref } from "@/lib/site-routing";
const Context = createContext<{
  lang: SiteLanguage;
  setLang: (lang: SiteLanguage) => void;
}>({ lang: "es", setLang: () => {} });
export function SiteLanguageProvider({
  children,
  initialLanguage = "es",
}: {
  children: ReactNode;
  initialLanguage?: SiteLanguage;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const pathLanguage =
    pathname.match(/^\/(es|ca|en)(?:\/|$)/)?.[1] ||
    pathname.match(/^\/knowledge\/[^/]+\/(es|ca|en)$/)?.[1];
  const lang = (pathLanguage || initialLanguage) as SiteLanguage;
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (lang: SiteLanguage) =>
    router.push(
      localizedHref(
        pathname.replace(/^(\/knowledge\/[^/]+)\/(es|ca|en)$/, "$1"),
        lang,
      ) + window.location.search,
    );
  return (
    <Context.Provider value={{ lang, setLang }}>{children}</Context.Provider>
  );
}
export function useSiteLanguage() {
  return useContext(Context);
}
