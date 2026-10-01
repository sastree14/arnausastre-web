import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Why SC-Analytics',
  description:
    'Why companies work with SC-Analytics: direct communication, quantitative rigor, proportionate solutions and Data & AI capability built around real business decisions.',
  keywords: [
    'SC Analytics',
    'data AI consulting',
    'data science consulting Spain',
    'analytics consulting',
    'AI consulting',
    'external data team',
    'data AI partner',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
