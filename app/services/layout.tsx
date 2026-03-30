import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Demand forecasting, mathematical optimization, machine learning pipelines and analytics automation — rigorous quantitative systems designed for measurable operational impact.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
