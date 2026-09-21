import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllProjects, getProjectBySlug } from '@/lib/projects'
import ProjectDetailClient from '@/components/ProjectDetailClient'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params
  const project=getProjectBySlug(slug)
  if(!project)return{}
  const title=project.headline
  const description=project.description
  const canonical=`/projects/${slug}`
  return {
    title,
    description,
    keywords:[project.industry,project.capability,project.challenge].filter(Boolean),
    alternates:{canonical},
    openGraph:{
      title,
      description,
      url:`https://sc-analytics.io${canonical}`,
      type:'article',
      images:project.imagePath?[{url:project.imagePath,alt:project.headline}]:undefined,
    },
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  return <ProjectDetailClient project={project} />
}
