import type { Metadata } from 'next'
import ClientRedirect from '@/components/ClientRedirect'

const destination = 'https://www.sc-analytics.io/'
const preview = 'https://www.sc-analytics.io/og/web.jpg?linkedin=20261007v3'

export const metadata: Metadata = {
  title: 'SC-Analytics | Better Decisions. Better Business Outcomes.',
  description: 'Consultoría especializada en datos, matemáticas e inteligencia artificial aplicada a decisiones de negocio.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.sc-analytics.io/linkedin/web-v2' },
  openGraph: {
    title: 'SC-Analytics | Better Decisions. Better Business Outcomes.',
    description: 'Data, mathematics and AI applied to better business decisions.',
    url: 'https://www.sc-analytics.io/linkedin/web-v2',
    siteName: 'SC-Analytics',
    type: 'website',
    images: [{ url: preview, width: 800, height: 418, alt: 'SC-Analytics website preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SC-Analytics | Better Decisions. Better Business Outcomes.',
    description: 'Data, mathematics and AI applied to better business decisions.',
    images: [preview],
  },
}

export default function Page() {
  return <ClientRedirect href={destination} />
}
