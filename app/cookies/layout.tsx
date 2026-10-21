import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | SC-Analytics',
  description: 'Information about essential storage, Google Analytics cookies and how to change your cookie preferences.',
  alternates: { canonical: '/cookies' },
  robots: { index: false, follow: true },
}
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
