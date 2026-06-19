import type { Metadata } from 'next'
import { getProjectBySlug } from '@/lib/projects'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return { title: 'Projects' }
  return {
    title: project.headline,
    description: project.description,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
