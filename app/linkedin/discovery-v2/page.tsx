import type { Metadata } from 'next'
import ClientRedirect from '@/components/ClientRedirect'

const destination = 'https://calendly.com/arnau-sastre-sc-analytics/30min'
const preview = 'https://www.sc-analytics.io/og/discovery.jpg?linkedin=20261007v3'

export const metadata: Metadata = {
  title: 'SC-Analytics | Book a 30-Minute Discovery Call',
  description: '30 minutes · no cost · no commitment.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.sc-analytics.io/linkedin/discovery-v2' },
  openGraph: {
    title: 'SC-Analytics | Book a 30-Minute Discovery Call',
    description: '30 minutes · no cost · no commitment.',
    url: 'https://www.sc-analytics.io/linkedin/discovery-v2',
    siteName: 'SC-Analytics',
    type: 'website',
    images: [{ url: preview, width: 800, height: 418, alt: 'SC-Analytics discovery call preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SC-Analytics | Book a 30-Minute Discovery Call',
    description: '30 minutes · no cost · no commitment.',
    images: [preview],
  },
}

export default function Page() {
  return <ClientRedirect href={destination} />
}
