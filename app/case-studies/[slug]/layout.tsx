import type { Metadata } from 'next'
import { getCaseStudyBySlug } from '@/lib/case-studies'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cs = getCaseStudyBySlug(slug)
  if (!cs) return { title: 'Case Studies' }
  return {
    title: cs.titleEn,
    description: cs.excerptEn,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
