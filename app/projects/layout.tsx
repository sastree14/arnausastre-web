import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Success Stories',
  description:
    '32 public portfolio implementations across AI, data, forecasting, BI, risk, optimisation and finance. Explore the business decision, technical proof and clearly labelled reference economics behind each system.',
  keywords: [
    'analytics success stories',
    'data analytics projects',
    'AI automation examples',
    'forecasting case study',
    'optimization projects',
    'business intelligence portfolio',
    'machine learning decision systems',
    'technical portfolio',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
