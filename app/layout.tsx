import type { Metadata } from "next";
import { requestLanguage, pageMetadata } from "@/lib/site-metadata";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SiteLanguageProvider } from "@/components/SiteLanguageProvider";
import SiteChrome from "@/components/SiteChrome";
import WebAnalytics from "@/components/WebAnalytics";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await pageMetadata(
    "/",
    {
      es: "SC-Analytics | Mejores decisiones. Mejores resultados empresariales.",
      ca: "SC-Analytics | Millors decisions. Millors resultats empresarials.",
      en: "SC-Analytics | Better decisions. Better business outcomes.",
    },
    {
      es: "Consultoría de datos, matemáticas e IA para mejorar previsiones, operaciones y decisiones de negocio. Comprender antes de construir.",
      ca: "Consultoria de dades, matemàtiques i IA per millorar previsions, operacions i decisions de negoci. Comprendre abans de construir.",
      en: "Data, mathematics and AI consulting to improve forecasting, operations and business decisions. Understand before building.",
    },
  );
  return {
    ...metadata,
    metadataBase: new URL("https://www.sc-analytics.io"),
    title: { default: String(metadata.title), template: "%s | SC-Analytics" },
    icons: { icon: "/brand/Monograma-simple.png" },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "SC-Analytics",
  url: "https://www.sc-analytics.io",
  description:
    "Data & AI consultancy helping companies improve decisions, planning and operations through forecasting, optimisation, machine learning, automation, analytics and AI.",
  serviceType: [
    "Data & AI Consulting",
    "Forecasting",
    "Business Optimisation",
    "Machine Learning",
    "AI Automation",
    "Decision Support Systems",
  ],
  areaServed: ["Spain", "Europe"],
  knowsAbout: [
    "Data Science",
    "Artificial Intelligence",
    "Forecasting",
    "Operations Research",
    "Optimization",
    "Machine Learning",
    "AI Automation",
    "Business Analytics",
    "Decision Support Systems",
  ],
  slogan: "Mejores decisiones. Mejores resultados empresariales.",
  founder: { "@type": "Person", name: "Arnau Sastre", jobTitle: "Founder" },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "business enquiries",
    url: "https://www.sc-analytics.io/contact",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const lang = await requestLanguage();
  return (
    <html lang={lang}>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider initialLanguage={lang === "ca" ? "es" : lang}>
          <SiteLanguageProvider initialLanguage={lang}>
            <GoogleAnalytics />
            <WebAnalytics />
            <SiteChrome>{children}</SiteChrome>
          </SiteLanguageProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
