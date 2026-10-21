import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Notice | SC-Analytics',
  description: 'Legal information, independent professional ownership and website terms for SC-Analytics.',
  alternates: { canonical: '/legal' },
  robots: { index: false, follow: true },
}
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
