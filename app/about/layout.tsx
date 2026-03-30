import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Quantitative consultant specializing in decision systems, demand forecasting, mathematical optimization and machine learning applied to real business operations.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
