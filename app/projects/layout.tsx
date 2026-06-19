import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Real analytical engagements across different industries — showing how rigorous quantitative methodology translates into measurable operational improvement.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
