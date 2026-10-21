import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import './public-polish.css'
import { LanguageProvider } from '@/components/LanguageProvider'
import { SiteLanguageProvider } from '@/components/SiteLanguageProvider'
import SiteChrome from '@/components/SiteChrome'
import WebAnalytics from '@/components/WebAnalytics'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sc-analytics.io'),
  title: {
    default: 'SC-Analytics | Data & AI for Better Business Decisions',
    template: '%s | SC-Analytics',
  },
  description: 'Data & AI consulting for forecasting, optimisation, machine learning, intelligent automation, analytics and decision-support systems. Understand before building.',
  keywords: [
    'data and AI consulting',
    'forecasting consulting',
    'business optimisation',
    'machine learning consulting',
    'AI automation',
    'AI agents',
    'business analytics',
    'decision support systems',
    'operations research',
    'consultoría data e inteligencia artificial',
    'consultoría data science',
    'consultoría de datos',
    'consultoría inteligencia artificial',
    'empresa data science',
    'partner analítico externo',
    'data science para pymes',
    'inteligencia artificial para pymes',
    'forecasting empresarial',
    'predicción de demanda',
    'optimización empresarial',
    'automatización inteligente',
  ],
  openGraph: {
    title: 'SC-Analytics | Better Decisions. Better Business Outcomes.',
    description: 'We help companies improve decisions, planning and operations with data, mathematics, automation and AI — only where it creates real value.',
    url: 'https://www.sc-analytics.io',
    siteName: 'SC-Analytics',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og/web.jpg',
        width: 800,
        height: 418,
        alt: 'SC-Analytics — Better Decisions. Better Business Outcomes.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SC-Analytics | Better Decisions. Better Business Outcomes.',
    description: 'Data & AI consulting built around business value, rigor and proportionate solutions.',
    images: ['/og/web.jpg'],
  },
  icons: { icon: '/brand/Monograma-simple.png' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.sc-analytics.io/#organization',
      name: 'SC-Analytics',
      url: 'https://www.sc-analytics.io/',
      description: 'Independent consultancy for forecasting, optimisation, business analytics, data science and AI automation.',
      founder: { '@type': 'Person', name: 'Arnau Sastre', jobTitle: 'Founder' },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'business enquiries',
        email: 'arnau.sastre@sc-analytics.io',
        url: 'https://www.sc-analytics.io/contact',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.sc-analytics.io/#website',
      name: 'SC-Analytics',
      url: 'https://www.sc-analytics.io/',
      publisher: { '@id': 'https://www.sc-analytics.io/#organization' },
      inLanguage: ['en','es','ca'],
    },
  ],
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The proxy resolves URL language server-side. Avoid trusting arbitrary
  // request values; only these three supported locales may reach <html>.
  const candidate=(await headers()).get('x-sc-document-language')
  const documentLanguage=candidate==='es'||candidate==='ca'?candidate:'en'
  return (
    <html lang={documentLanguage}>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <GoogleAnalytics />
        <WebAnalytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <LanguageProvider>
          <SiteLanguageProvider initialLang={documentLanguage}>
            <SiteChrome>{children}</SiteChrome>
          </SiteLanguageProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
