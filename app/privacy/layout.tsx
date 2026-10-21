import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | SC-Analytics',
  description: 'Information about the processing of personal data, legal bases, service providers and your rights at SC-Analytics.',
  alternates: { canonical: '/privacy' },
  robots: { index: false, follow: true },
}
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
