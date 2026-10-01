import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Knowledge | Data, AI & Decision Systems',
  description:
    'SC-Analytics analysis on forecasting, optimisation, operations, machine learning, automation, AI and decision systems — written when there is something useful to understand.',
  keywords: [
    'forecasting insights',
    'operations research',
    'machine learning for business',
    'AI automation',
    'decision systems',
    'business analytics',
    'data AI articles',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
