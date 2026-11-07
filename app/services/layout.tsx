import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Services | Data, AI, Forecasting & Optimization',
  description:
    'Specialist data science: predictive modelling, mathematical optimisation, simulation and tailored decision systems integrated with existing business software.',
  alternates: { canonical: '/services' },
  keywords: [
    'demand forecasting',
    'inventory optimization',
    'operations research consulting',
    'machine learning consulting',
    'AI automation services',
    'business intelligence consulting',
    'data science consulting',
    'decision systems',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
