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
  metadataBase: new URL("https://www.arnausastre.com"),
  title: {
    default: "Arnau Sastre Analytics",
    template: "%s | Arnau Sastre Analytics",
  },
  description:
    "Advanced decision systems for business: forecasting, optimization, machine learning, analytics automation and mathematical modeling.",
  keywords: [
    "data science consultant",
    "machine learning consultant",
    "forecasting consultant",
    "optimization consultant",
    "analytics automation",
    "decision systems",
    "business analytics consultant",
    "predictive analytics",
    "mathematical optimization",
  ],
  openGraph: {
    title: "Arnau Sastre Analytics",
    description:
      "Advanced decision systems for business: forecasting, optimization, machine learning, analytics automation and mathematical modeling.",
    url: "https://www.arnausastre.com",
    siteName: "Arnau Sastre Analytics",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arnau Sastre Analytics",
    description:
      "Advanced decision systems for business: forecasting, optimization, machine learning, analytics automation and mathematical modeling.",
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
