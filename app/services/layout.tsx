import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How We Work',
  description:
    'Our structured approach to analytics consulting: we start by understanding your business problem, not by proposing technology. Serving CEOs, CFOs and senior executives who want better decisions, not more dashboards.',
  keywords: [
    'analytics consulting process',
    'how analytics consulting works',
    'business analytics methodology',
    'data strategy consulting approach',
    'analytics for business leaders',
    'decision systems consulting',
    'analytics project methodology',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
