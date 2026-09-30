import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllProjects, getProjectBySlug } from '@/lib/projects'
import ProjectOverviewClient from '@/components/projects/ProjectOverviewClient'
import { getWebsiteProjectGoldStandard } from '@/lib/website-project-gold-standard'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const goldStandard = getWebsiteProjectGoldStandard(slug)
  const project = getProjectBySlug(slug)

  if (!project) return {}

  const title = goldStandard?.title || project.headline
  const description = goldStandard?.description || project.description
  const canonical = `/projects/${slug}`

  return {
    title,
    description,
    keywords: [
      project.industry,
      project.capability,
      project.challenge,
      ...(goldStandard?.capabilities || []),
    ].filter(Boolean),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `https://sc-analytics.io${canonical}`,
      type: 'article',
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const goldStandard = getWebsiteProjectGoldStandard(slug)
  return <ProjectOverviewClient project={project} goldStandard={goldStandard} />
}
