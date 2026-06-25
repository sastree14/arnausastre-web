import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'SC Analytics helps CEOs, CFOs and senior executives make better, data-driven decisions through rigorous analytical systems — built for real operational environments, not just presentations.',
  keywords: [
    'analytics consulting firm',
    'data analytics consultants',
    'analytics for executives',
    'business analytics team',
    'about SC Analytics',
    'Arnau Sastre analytics',
    'analytics consulting background',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
