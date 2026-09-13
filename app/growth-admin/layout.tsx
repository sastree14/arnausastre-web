import type { Metadata } from 'next'
import ControlCenterQuickNav from '@/components/control-center/ControlCenterQuickNav'

export const metadata: Metadata = {
  title: 'SC-Analytics Control Center',
  robots: { index: false, follow: false, nocache: true },
}

export default function GrowthAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<ControlCenterQuickNav /></>
}
