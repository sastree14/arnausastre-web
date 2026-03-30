import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies',
  description:
    'Analytical engagements across retail, logistics and financial services — showing how rigorous quantitative methodology translates into measurable operational improvement.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
