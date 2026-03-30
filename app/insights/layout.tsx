import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insights',
  description:
    'Technical articles on forecasting, machine learning, mathematical optimization and building analytical decision systems that deliver measurable business results.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
