import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics Insights',
  description:
    'In-depth articles on demand forecasting, operations research, machine learning and decision systems — written for business leaders and executives who want to understand analytics, not just buy it.',
  keywords: [
    'analytics articles for executives',
    'forecasting insights',
    'machine learning for business',
    'decision systems articles',
    'business analytics thought leadership',
    'analytics knowledge base',
    'supply chain analytics insights',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
