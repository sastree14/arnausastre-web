import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre nosotros',
  description:
    'SC-Analytics existe para ayudar a las organizaciones a tomar mejores decisiones — combinando comprensión, análisis riguroso y sistemas que funcionan en la práctica.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
