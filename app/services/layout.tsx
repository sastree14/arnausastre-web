import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'How We Work | Data, AI, Forecasting & Optimization',
  description:
    'From business problem to working system: forecasting, optimisation, machine learning, AI automation, analytics and simulation selected around the decision that needs to improve.',
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
