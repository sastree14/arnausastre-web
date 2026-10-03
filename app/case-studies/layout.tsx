import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Success Stories',
  description:
    'Public analytical implementations showing the business problem, decision logic, technical approach and clearly labelled reference economics behind each system.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
