import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SC-Analytics Operating System',
  robots: { index: false, follow: false, nocache: true },
}

export default function GrowthAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
