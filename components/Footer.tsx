"use client";

import Link from "@/components/SiteLink";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";

const COPY = {
  es: {
    statement:
      "Consultoría de datos, matemáticas e inteligencia artificial aplicada a decisiones de negocio.",
    work: "Cómo trabajamos",
    cases: "Proyectos y casos",
    knowledge: "Conocimiento",
    partner: "Partner Data e IA",
    why: "Por qué SC-Analytics",
    contact: "Contacta con nosotros",
    rights: "© 2026 SC-Analytics. Todos los derechos reservados.",
  },
  ca: {
    statement:
      "Consultoria de dades, matemàtiques i intel·ligència artificial aplicada a decisions de negoci.",
    work: "Com treballem",
    cases: "Projectes i casos",
    knowledge: "Coneixement",
    partner: "Partner Dades i IA",
    why: "Per què SC-Analytics",
    contact: "Contacta amb nosaltres",
    rights: "© 2026 SC-Analytics. Tots els drets reservats.",
  },
  en: {
    statement:
      "Data, mathematics and artificial intelligence consulting applied to business decisions.",
    work: "How we work",
    cases: "Projects and cases",
    knowledge: "Knowledge",
    partner: "Data and AI Partner",
    why: "Why SC-Analytics",
    contact: "Contact us",
    rights: "© 2026 SC-Analytics. All rights reserved.",
  },
} as const;

export default function Footer() {
  const { lang } = useSiteLanguage();
  const t = COPY[lang];

  return (
    <footer className="border-t border-[#496C8A] bg-[#0D1B2A] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-7 lg:grid-cols-[.8fr_1.2fr_auto] lg:items-center">
          <div>
            <span className="font-[family-name:var(--font-playfair)] text-[25px]">
              SC·Analytics
            </span>
            <p className="mt-3 max-w-sm text-[15px] leading-6 text-[#A8BACB]">
              {t.statement}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-[#A8BACB]">
            <Link href="/services" className="transition hover:text-white">
              {t.work}
            </Link>
            <Link href="/projects" className="transition hover:text-white">
              {t.cases}
            </Link>
            <Link href="/knowledge" className="transition hover:text-white">
              {t.knowledge}
            </Link>
            <Link
              href="/partner-analitico"
              className="transition hover:text-white"
            >
              {t.partner}
            </Link>
            <Link href="/about" className="transition hover:text-white">
              {t.why}
            </Link>
          </nav>

          <Link
            href="/contact"
            className="inline-flex justify-center border border-[#A8BACB] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-white/5"
          >
            {t.contact} →
          </Link>
        </div>

        <div className="mt-7 flex flex-col gap-2 border-t border-[#496C8A] pt-4 text-[12px] text-[#718AA1] sm:flex-row sm:items-center sm:justify-between">
          <p>{t.rights}</p>
          <div className="flex flex-wrap gap-4 text-[#A8BACB]">
            <Link href="/privacy">
              {lang === "en"
                ? "Privacy"
                : lang === "ca"
                  ? "Privacitat"
                  : "Privacidad"}
            </Link>
            <Link href="/legal">
              {lang === "en" ? "Legal information" : "Aviso legal"}
            </Link>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new Event("sc-consent-settings"))
              }
            >
              {lang === "en"
                ? "Cookie settings"
                : lang === "ca"
                  ? "Preferències de cookies"
                  : "Preferencias de cookies"}
            </button>
          </div>
          <a
            href="https://linkedin.com/in/arnausastre"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[#A8BACB]"
          >
            LinkedIn ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
