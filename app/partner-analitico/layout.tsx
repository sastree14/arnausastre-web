import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data & AI Partner | External Analytics Capability',
  description:
    'External Data & AI capability for companies, consultancies and technology partners that need forecasting, optimisation, machine learning, automation or analytics without building every specialism in-house.',
  keywords: [
    'data AI partner',
    'external analytics partner',
    'external data science team',
    'data science as a service',
    'AI consulting Spain',
    'analytics partner',
    'technology partner',
  ],
  alternates: { canonical: '/partner-analitico' },
  openGraph: {
    title: 'SC-Analytics · Data & AI Partner',
    description: 'External specialist capability that retains context and enters when the business needs it.',
    url: 'https://sc-analytics.io/partner-analitico',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
