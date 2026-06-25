import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sc-analytics.io"),
  title: {
    default: "SC Analytics | Analytics Consulting for Business Leaders",
    template: "%s | SC Analytics",
  },
  description:
    "Analytics consulting for CEOs, CFOs and senior executives. We build decision systems that improve forecasting accuracy, reduce operational waste and drive measurable business results.",
  keywords: [
    "analytics consulting",
    "analytics consulting for CEOs",
    "analytics consulting for executives",
    "business decision systems",
    "demand forecasting consulting",
    "data-driven decision making",
    "executive analytics",
    "CFO analytics tools",
    "business intelligence consulting",
    "machine learning consulting",
    "operations research consulting",
    "supply chain analytics",
    "predictive analytics consulting",
    "data strategy consulting",
    "business optimization consulting",
    "consultoría analítica",
    "análisis de datos empresarial",
    "sistemas de decisión empresarial",
    "forecasting empresarial",
    "optimización de operaciones",
  ],
  openGraph: {
    title: "SC Analytics | Analytics Consulting for Business Leaders",
    description:
      "We help CEOs and CFOs make better decisions through analytics. Demand forecasting, optimization and decision systems that deliver measurable business results.",
    url: "https://sc-analytics.io",
    siteName: "SC Analytics",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SC Analytics | Analytics Consulting for Business Leaders",
    description:
      "Analytics consulting for CEOs and CFOs. Demand forecasting, optimization and decision systems that deliver measurable business results.",
  },
  icons: {
    icon: "/brand/Monograma-simple.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "SC Analytics",
  "alternateName": "Arnau Sastre Analytics",
  "url": "https://sc-analytics.io",
  "description": "Analytics consulting firm specializing in decision systems, demand forecasting, business optimization and machine learning for executives and senior business leaders.",
  "serviceType": ["Analytics Consulting", "Data Strategy", "Decision Systems", "Demand Forecasting", "Business Optimization"],
  "areaServed": ["Spain", "Europe"],
  "knowsAbout": [
    "Demand Forecasting",
    "Business Analytics",
    "Machine Learning",
    "Operations Research",
    "Decision Systems",
    "Data Strategy",
    "Mathematical Optimization",
    "Supply Chain Analytics"
  ],
  "founder": {
    "@type": "Person",
    "name": "Arnau Sastre",
    "jobTitle": "Founder & Analytics Consultant"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "url": "https://sc-analytics.io/contact"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            {children}
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
