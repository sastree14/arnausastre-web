import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/projects'
import ProjectDetailClient from '@/components/ProjectDetailClient'
import WebsiteProjectGoldStandard from '@/components/projects/WebsiteProjectGoldStandard'
import { getWebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}

  const goldStandard = getWebsiteProjectGoldStandard(slug)
  const title = `${goldStandard?.title || project.headline} — Full case study`
  const description = goldStandard?.description || project.description
  const canonical = `/projects/${slug}/case-study`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `https://sc-analytics.io${canonical}`,
      type: 'article',
    },
  }
}

export default async function ProjectCaseStudyPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const goldStandard = getWebsiteProjectGoldStandard(slug)
  if (goldStandard) return <WebsiteProjectGoldStandard project={goldStandard} />

  return <ProjectDetailClient project={project} />
}
