import type { Metadata } from 'next'
import DemosLabPageClient from '@/components/DemosLabPageClient'

export const metadata: Metadata = {
  title: 'Demostraciones interactivas e industrias',
  description: 'Explora soluciones de predicción, optimización, simulación y sistemas de decisión a medida. Demos técnicas públicas y futuro laboratorio sectorial de SC-Analytics.',
  alternates: { canonical: '/demos' },
  // Keep the preview-only catalog out of search until sector experiences and QA are complete.
  robots: { index: false, follow: false }, 
  openGraph: {
    title: 'SC-Analytics | Laboratorio interactivo de decisiones',
    description: 'Explora problemas empresariales mediante demostraciones interactivas basadas en datos sintéticos.',
    url: 'https://www.sc-analytics.io/demos',
    siteName: 'SC-Analytics',
    type: 'website',
  },
}

export default function DemosPage() {
  return <DemosLabPageClient />
}
