import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/components/LanguageProvider'
import { SiteLanguageProvider } from '@/components/SiteLanguageProvider'
import SiteChrome from '@/components/SiteChrome'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL('https://sc-analytics.io'),
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
    'forecasting empresarial',
    'optimización empresarial',
    'automatización inteligente',
  ],
  openGraph: {
    title: 'SC-Analytics | Better Decisions. Better Business Outcomes.',
    description: 'We help companies improve decisions, planning and operations with data, mathematics, automation and AI — only where it creates real value.',
    url: 'https://sc-analytics.io',
    siteName: 'SC-Analytics',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SC-Analytics | Better Decisions. Better Business Outcomes.',
    description: 'Data & AI consulting built around business value, rigor and proportionate solutions.',
  },
  icons: { icon: '/brand/Monograma-simple.png' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'SC-Analytics',
  url: 'https://sc-analytics.io',
  description: 'Data & AI consultancy helping companies improve decisions, planning and operations through forecasting, optimisation, machine learning, automation, analytics and AI.',
  serviceType: [
    'Data & AI Consulting',
    'Forecasting',
    'Business Optimisation',
    'Machine Learning',
    'AI Automation',
    'Decision Support Systems',
  ],
  areaServed: ['Spain', 'Europe'],
  founder: { '@type': 'Person', name: 'Arnau Sastre', jobTitle: 'Founder' },
  contactPoint: { '@type': 'ContactPoint', contactType: 'business enquiries', url: 'https://sc-analytics.io/contact' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <LanguageProvider>
          <SiteLanguageProvider>
            <SiteChrome>{children}</SiteChrome>
          </SiteLanguageProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
