import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Knowledge',
  description:
    'In-depth analyses on forecasting, machine learning, optimisation and building decision systems that create real business value.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
