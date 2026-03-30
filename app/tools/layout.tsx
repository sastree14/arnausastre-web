import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tools',
  description:
    'Interactive calculators and simulators for forecasting, inventory optimization, pricing and operational decision support — built on rigorous analytical foundations.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
