"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import { localizedHref } from "@/lib/site-routing";
export default function SiteLink(props: ComponentProps<typeof Link>) {
  const { lang } = useSiteLanguage();
  return (
    <Link
      {...props}
      href={
        typeof props.href === "string"
          ? localizedHref(props.href, lang)
          : props.href
      }
    />
  );
}
