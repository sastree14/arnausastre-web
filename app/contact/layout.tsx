import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start a Conversation',
  description:
    'Talk to SC-Analytics about a business problem, a Data & AI opportunity or an ongoing partner model. Start with the decision that should improve, not with a pre-selected technology.',
  keywords: [
    'data AI consultation',
    'data science consultation',
    'AI consulting Spain',
    'analytics consultation',
    'data AI partner',
    'business analytics consulting',
    'SC Analytics contact',
  ],
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
