import type { Metadata } from 'next'
import ClientRedirect from '@/components/ClientRedirect'

const destination = 'https://github.com/sastree14/Portfolio_SC_Analytics'

export const metadata: Metadata = {
  title: 'SC-Analytics | Technical Portfolio',
  description: 'Selected projects in data science, AI, forecasting, optimisation, automation and decision systems.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.sc-analytics.io/linkedin/portfolio-v2' },
  openGraph: {
    title: 'SC-Analytics | Technical Portfolio',
    description: 'Selected systems and technical projects by SC-Analytics.',
    url: 'https://www.sc-analytics.io/linkedin/portfolio-v2',
    siteName: 'SC-Analytics',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SC-Analytics | Technical Portfolio',
    description: 'Selected systems and technical projects by SC-Analytics.',
  },
}

export default function Page() {
  return <ClientRedirect href={destination} />
}
