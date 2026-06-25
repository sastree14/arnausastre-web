import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Talk to Us',
  description:
    'Schedule a free 30-minute consultation with SC Analytics. We help CEOs, CFOs and business leaders make better decisions through analytics and data strategy. No commitment required.',
  keywords: [
    'analytics consultation',
    'schedule analytics call',
    'free analytics consultation',
    'talk to analytics consultant',
    'book analytics meeting',
    'data strategy consultation',
    'contact analytics consulting',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
