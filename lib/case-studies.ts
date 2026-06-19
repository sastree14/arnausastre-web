export interface CaseStudy {
  slug: string
  industry: string
  industryEs: string
  company: string
  titleEn: string
  titleEs: string
  excerptEn: string
  excerptEs: string
  problemEn: string
  problemEs: string
  approachEn: string
  approachEs: string
  solutionEn: string
  solutionEs: string
  results: { metric: string; metricEs: string; value: string }[]
  tagsEn: string[]
  tagsEs: string[]
}

export const caseStudies: CaseStudy[] = [
]

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug)
}
