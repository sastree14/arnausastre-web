"use client";
import Link from "@/components/SiteLink";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import { common, method, tr } from "@/lib/commercial-content";
export function Hero({
  label,
  title,
  body,
  children,
}: {
  label: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="public-hero">
      <div className="site-container grid gap-10 py-16 md:py-24 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
        <div>
          <p className="eyebrow">{label}</p>
          <h1>{title}</h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-8 text-[#DCE6EF]">
            {body}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}
export function Heading({
  label,
  title,
  body,
}: {
  label?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-9 max-w-3xl">
      {label && <p className="eyebrow text-[#496C8A]">{label}</p>}
      <h2 className="mt-3">{title}</h2>
      {body && (
        <p className="mt-4 text-base leading-7 text-slate-600">{body}</p>
      )}
    </div>
  );
}
export function ContactCTA() {
  const { lang } = useSiteLanguage();
  return (
    <section className="border-t border-[#C6CFD6] bg-[#F4F1EA]">
      <div className="site-container py-14 md:flex md:items-center md:justify-between md:gap-12">
        <div className="max-w-xl">
          <p className="eyebrow text-[#496C8A]">
            {tr("EL SIGUIENTE PASO", "EL SEGÜENT PAS", "THE NEXT STEP")[lang]}
          </p>
          <h2 className="mt-3">{common.talk[lang]}</h2>
          <p className="mt-4 leading-7 text-slate-600">
            {common.noCommitment[lang]}
          </p>
        </div>
        <div className="mt-7 flex shrink-0 flex-col items-start gap-4 md:mt-0">
          <Link className="button-primary" href="/contact">
            {common.talk[lang]} <span aria-hidden>→</span>
          </Link>
          <a
            className="text-sm font-semibold underline underline-offset-4"
            href="https://calendly.com/arnau-sastre-sc-analytics/30min"
          >
            {common.book[lang]} ↗
          </a>
        </div>
      </div>
    </section>
  );
}
export function Method() {
  const { lang } = useSiteLanguage();
  return (
    <section className="site-container section-space">
      <Heading
        label={tr("MÉTODO", "MÈTODE", "METHOD")[lang]}
        title={
          tr(
            "Comprender antes de construir.",
            "Comprendre abans de construir.",
            "Understand before building.",
          )[lang]
        }
        body={
          tr(
            "Cada fase debe dejar una decisión clara y un entregable útil. El alcance y los criterios se acuerdan antes de desarrollar.",
            "Cada fase ha de deixar una decisió clara i un lliurable útil. L’abast i els criteris s’acorden abans de desenvolupar.",
            "Each phase should leave a clear decision and a useful deliverable. Scope and criteria are agreed before development.",
          )[lang]
        }
      />
      <div className="grid gap-0 border-t border-l border-[#C6CFD6] md:grid-cols-2 xl:grid-cols-4">
        {method.map((item, i) => (
          <article key={i} className="border-b border-r border-[#C6CFD6] p-6">
            <p className="eyebrow text-[#496C8A]">0{i + 1}</p>
            <h3 className="mt-5 text-xl font-semibold">{item.title[lang]}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {item.body[lang]}
            </p>
            <p className="mt-6 border-t border-[#C6CFD6] pt-4 text-sm font-medium">
              {item.output[lang]}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
