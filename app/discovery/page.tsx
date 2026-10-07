import type { Metadata } from 'next'
import ClientRedirect from '@/components/ClientRedirect'

const destination = 'https://calendly.com/arnau-sastre-sc-analytics/30min'

export const metadata: Metadata = {
  title: 'Book a 30-Minute Discovery Call',
  description:
    'A first 30-minute conversation with SC-Analytics to understand the problem, context and potential value. No cost and no commitment.',
  alternates: { canonical: 'https://sc-analytics.io/discovery' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Book a 30-Minute Discovery Call | SC-Analytics',
    description: '30 minutes · no cost · no commitment.',
    url: 'https://sc-analytics.io/discovery',
    siteName: 'SC-Analytics',
    images: [
      {
        url: '/og/discovery.jpg',
        width: 800,
        height: 418,
        alt: 'SC-Analytics discovery call',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a 30-Minute Discovery Call | SC-Analytics',
    description: '30 minutes · no cost · no commitment.',
    images: ['/og/discovery.jpg'],
  },
}

export default function DiscoveryRedirectPage() {
  return <ClientRedirect href={destination} />
}
