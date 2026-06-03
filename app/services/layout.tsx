import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cómo trabajamos',
  description:
    'Cómo trabajamos con organizaciones para entender su situación, evaluar alternativas y construir únicamente aquello que crea valor real.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
