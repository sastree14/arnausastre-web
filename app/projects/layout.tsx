import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies',
  description:
    'Real analytics projects across retail, finance, logistics and professional services. See how rigorous methodology translates into measurable business results for CEOs and CFOs.',
  keywords: [
    'analytics case studies',
    'business analytics results',
    'forecasting case study',
    'analytics ROI examples',
    'data analytics projects',
    'machine learning business results',
    'optimization case study',
    'decision systems examples',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
