import type { Metadata } from 'next'
import ClientRedirect from '@/components/ClientRedirect'

const destination = 'https://calendly.com/arnau-sastre-sc-analytics/30min'

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SC-Analytics | Book a 30-Minute Discovery Call',
    description: '30 minutes · no cost · no commitment.',
  },
}

export default function Page() {
  return <ClientRedirect href={destination} />
}
