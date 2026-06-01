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
    default: "SC Analytics",
    template: "%s | SC Analytics",
  },
  description:
    "Quantitative decision systems for business: demand forecasting, mathematical optimization, machine learning pipelines and analytics automation. Rigorous methodology, measurable operational impact.",
  keywords: [
    "analytics consulting",
    "demand forecasting",
    "business optimization",
    "machine learning consulting",
    "decision systems",
    "predictive analytics",
    "quantitative consulting",
    "forecasting models",
    "operational analytics",
    "mathematical modeling",
  ],
  openGraph: {
    title: "SC Analytics",
    description:
      "Quantitative decision systems for business: demand forecasting, mathematical optimization, machine learning pipelines and analytics automation.",
    url: "https://sc-analytics.io",
    siteName: "SC Analytics",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SC Analytics",
    description:
      "Quantitative decision systems for business: demand forecasting, mathematical optimization, machine learning pipelines and analytics automation.",
  },
  icons: {
    icon: "/brand/Monograma-simple.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
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
