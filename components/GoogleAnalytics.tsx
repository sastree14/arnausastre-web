"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/SiteLink";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import { tr } from "@/lib/commercial-content";
const ID = "G-3E1DK7935G";
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const { lang } = useSiteLanguage();
  const [choice, setChoice] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const value = localStorage.getItem("sc-analytics-consent");
    const timer = setTimeout(() => {
      setChoice(value);
      setVisible(value !== "accepted" && value !== "rejected");
    }, 0);
    const settings = () => setVisible(true);
    window.addEventListener("sc-consent-settings", settings);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("sc-consent-settings", settings);
    };
  }, []);
  function decide(value: "accepted" | "rejected") {
    localStorage.setItem("sc-analytics-consent", value);
    setChoice(value);
    setVisible(false);
    window.dispatchEvent(new Event("sc-consent-change"));
    if (value === "rejected") {
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      document.cookie.split(";").forEach((item) => {
        const name = item.split("=")[0].trim();
        if (name.startsWith("_ga"))
          for (const domain of [
            "",
            `; domain=${location.hostname}`,
            `; domain=.sc-analytics.io`,
          ])
            document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
      });
      window.location.reload();
    }
  }
  if (pathname.startsWith("/growth-admin")) return null;
  return (
    <>
      {choice === "accepted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
          >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${ID}',{send_page_view:false});window.dispatchEvent(new Event('sc-analytics-ready'));`}</Script>
        </>
      )}
      {visible && (
        <aside
          aria-label={
            tr(
              "Preferencias de analítica",
              "Preferències d’analítica",
              "Analytics preferences",
            )[lang]
          }
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl border border-[#496C8A] bg-white p-5 shadow-xl sm:p-6"
        >
          <p className="font-semibold">
            {
              tr(
                "Tú eliges si medimos las visitas.",
                "Tu tries si mesurem les visites.",
                "You choose whether we measure visits.",
              )[lang]
            }
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {
              tr(
                "Usamos Google Analytics solo con tu permiso para entender el uso de la web. Puedes rechazarlo y cambiar tu elección desde el pie de página.",
                "Fem servir Google Analytics només amb el teu permís per entendre l’ús de la web. Pots rebutjar-lo i canviar l’elecció al peu de pàgina.",
                "We use Google Analytics only with your permission to understand website usage. You can reject it and change your choice in the footer.",
              )[lang]
            }{" "}
            <Link href="/privacy" className="underline">
              {
                tr("Más información", "Més informació", "More information")[
                  lang
                ]
              }
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="button-primary"
              onClick={() => decide("accepted")}
            >
              {
                tr(
                  "Aceptar analítica",
                  "Acceptar analítica",
                  "Accept analytics",
                )[lang]
              }
            </button>
            <button
              className="button-primary"
              onClick={() => decide("rejected")}
            >
              {
                tr(
                  "Rechazar analítica",
                  "Rebutjar analítica",
                  "Reject analytics",
                )[lang]
              }
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
