import 'server-only'
import { getPortfolioCaseProfile, portfolioCaseProfiles } from '@/lib/portfolio-case-registry'

export interface ProjectMetric {
  label: string
  value: string
}

export interface ProjectSection {
  title: string
  body: string
}

export interface Project {
  slug: string
  headline: string
  industry: string
  capability: string
  challenge: string
  audience: string
  description: string
  metrics: ProjectMetric[]
  image: string
  imagePath: string
  status: string
  sections: ProjectSection[]
  confidentiality: string
}

function projectFromProfile(slug: string): Project | undefined {
  const profile = getPortfolioCaseProfile(slug)
  if (!profile) return undefined

  return {
    slug: profile.slug,
    headline: profile.title.en,
    industry: profile.archetype,
    capability: profile.technologies.slice(0, 4).join(' · '),
    challenge: profile.archetype,
    audience: 'Business and technical decision-makers',
    description: profile.summary.en,
    metrics: [],
    image: 'cover.png',
    imagePath: `/projects/${profile.slug}/cover.png`,
    status: 'Published',
    sections: [
      { title: 'Problem', body: profile.summary.en },
      {
        title: 'Approach',
        body: 'A public portfolio implementation structured around a concrete decision, explicit validation and inspectable technical evidence.',
      },
      {
        title: 'Solution',
        body: `Implemented with ${profile.technologies.slice(0, 6).join(', ')}.`,
      },
    ],
    confidentiality:
      'Public portfolio implementation. Reference metrics and economics are illustrative unless explicitly stated otherwise.',
  }
}

export function getAllProjects(): Project[] {
  return portfolioCaseProfiles
    .map((profile) => projectFromProfile(profile.slug))
    .filter((project): project is Project => Boolean(project))
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projectFromProfile(slug)
}
