import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch to discuss analytics consulting, forecasting systems, optimization models or machine learning projects for your business operations.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
