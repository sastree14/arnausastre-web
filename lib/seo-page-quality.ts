/**
 * SEO landing publish gate for the existing authenticated CMI.
 * It deliberately checks structure, not "rankability"; Google does not
 * guarantee rankings, and human approval of business claims is still needed.
 * This does not change the public /services/[slug] visual template.
 */
export type SeoLandingDraft = {
  slug: string
  title: string
  meta_description: string
  h1: string
  intro: string
  primary_keyword: string
  sections: unknown
  internal_links: unknown
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const text = (value:unknown) => typeof value === 'string' ? value.trim() : ''

export function validateSeoLanding(draft:SeoLandingDraft):string[] {
  const problems:string[] = []
  if (!slugPattern.test(draft.slug) || draft.slug.length > 110) problems.push('Invalid URL slug')
  if (text(draft.primary_keyword).length < 3) problems.push('Missing primary keyword')
  if (text(draft.title).length < 15 || text(draft.title).length > 80) problems.push('SEO title must be 15–80 characters')
  if (text(draft.meta_description).length < 70 || text(draft.meta_description).length > 175) problems.push('Meta description must be 70–175 characters')
  if (text(draft.h1).length < 10 || text(draft.h1).length > 140) problems.push('H1 is missing or too long')
  if (text(draft.intro).length < 100) problems.push('Introduction must be at least 100 characters')
  const sections = Array.isArray(draft.sections) ? draft.sections : []
  if (sections.length < 2) problems.push('At least two substantive sections are required')
  for (const section of sections) {
    if (!section || typeof section !== 'object' || text(section.heading).length < 5 || text(section.body).length < 70) {
      problems.push('Every section requires a descriptive heading and 70+ characters of body text')
      break
    }
  }
  const links = Array.isArray(draft.internal_links) ? draft.internal_links : []
  for (const link of links) {
    if (!link || typeof link !== 'object' || typeof link.href !== 'string' ||
        !/^\/(?!\/)[a-z0-9/_?=&#%-]*$/i.test(link.href) ||
        text(link.label).length < 3) {
      problems.push('Internal links must be labelled local paths, not external or unsafe URLs')
      break
    }
  }
  return problems
}
