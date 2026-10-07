import type { Metadata } from 'next'
import ClientRedirect from '@/components/ClientRedirect'

const destination = 'https://github.com/sastree14/Portfolio_SC_Analytics'

export const metadata: Metadata = {
  title: 'SC-Analytics | Technical Portfolio',
  description:
    'Public technical portfolio with selected projects in data science, AI, forecasting, optimisation, automation and decision systems.',
  alternates: { canonical: 'https://sc-analytics.io/portfolio' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'SC-Analytics | Technical Portfolio',
    description:
      'Selected projects in data science, AI, forecasting, optimisation, automation and decision systems.',
    url: 'https://sc-analytics.io/portfolio',
    siteName: 'SC-Analytics',
    images: [
      {
        url: '/og/portfolio.jpg',
        width: 800,
        height: 418,
        alt: 'SC-Analytics technical portfolio',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SC-Analytics | Technical Portfolio',
    description: 'Selected technical projects by SC-Analytics.',
    images: ['/og/portfolio.jpg'],
  },
}

export default function PortfolioRedirectPage() {
  return <ClientRedirect href={destination} />
}
