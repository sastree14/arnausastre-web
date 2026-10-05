"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/site-routing";
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
const allowed = () =>
  localStorage.getItem("sc-analytics-consent") === "accepted";
const track = (name: string, params: Record<string, unknown>) => {
  if (allowed()) window.gtag?.("event", name, params);
};
export default function WebAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/growth-admin")) return;
    const clean = stripLocale(pathname);
    const depths = new Set<number>();
    const page = () => {
      if (!allowed()) return;
      track("page_view", {
        page_path: pathname,
        page_location: location.origin + pathname,
      });
      if (clean.startsWith("/knowledge/"))
        track("article_view", {
          content_slug: clean.split("/")[2],
          content_language: document.documentElement.lang,
        });
    };
    page();
    window.addEventListener("sc-analytics-ready", page);
    const scroll = () => {
      if (!allowed() || !clean.startsWith("/knowledge/")) return;
      const depth =
        (100 * scrollY) /
        Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      for (const n of [50, 90])
        if (depth >= n && !depths.has(n)) {
          depths.add(n);
          track(`article_${n}_percent`, { page_path: pathname });
        }
    };
    const click = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      try {
        const url = new URL(anchor.href);
        if (
          url.origin === location.origin &&
          stripLocale(url.pathname) === "/contact"
        ) {
          // Keep only a public content path; never query strings or personal data.
          sessionStorage.setItem("sc-contact-origin", pathname);
          track("contact_click", {
            source_path: pathname,
            contact_intent: ["problem", "opportunity", "partner"].includes(
              url.searchParams.get("intent") || "",
            )
              ? url.searchParams.get("intent")
              : "general",
          });
        } else if (url.hostname === "calendly.com")
          track("calendly_open", { source_path: pathname });
        else if (url.hostname.endsWith("linkedin.com"))
          track("linkedin_outbound", { source_path: pathname });
      } catch {}
    };
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("sc-analytics-ready", page);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("click", click, true);
    };
  }, [pathname]);
  return null;
}
