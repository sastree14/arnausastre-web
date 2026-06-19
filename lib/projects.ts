import 'server-only'
import fs from 'fs'
import path from 'path'

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
  image: string       // filename as written in project.txt, e.g. "cover.png"
  imagePath: string   // resolved public URL, e.g. "/projects/slug/cover.png"
  status: string
  sections: ProjectSection[]
  confidentiality: string
}

const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects')

// Top-level keys that terminate sections mode if encountered after Sections:
const SECTIONS_TERMINATORS = new Set(['Confidentiality'])

function parseMetrics(raw: string): ProjectMetric[] {
  return raw
    .split('\n')
    .filter((l) => l.trim().startsWith('*'))
    .map((l) => {
      const item = l.trim().slice(1).trim()
      const colonIdx = item.indexOf(':')
      if (colonIdx === -1) return null
      return { label: item.slice(0, colonIdx).trim(), value: item.slice(colonIdx + 1).trim() }
    })
    .filter((m): m is ProjectMetric => m !== null)
}

function parseSections(raw: string): ProjectSection[] {
  const sections: ProjectSection[] = []
  let currentTitle: string | null = null
  let currentBody: string[] = []

  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Za-z][A-Za-z &]*):\s*$/)
    if (match) {
      if (currentTitle !== null) {
        const body = currentBody.join('\n').trim()
        if (body) sections.push({ title: currentTitle, body })
      }
      currentTitle = match[1].trim()
      currentBody = []
    } else if (currentTitle !== null) {
      currentBody.push(line)
    }
  }
  if (currentTitle !== null) {
    const body = currentBody.join('\n').trim()
    if (body) sections.push({ title: currentTitle, body })
  }

  return sections
}

function parseProjectTxt(content: string, slug: string): Project {
  const lines = content.split('\n')
  const topLevel: Record<string, string[]> = {}
  let currentKey: string | null = null
  let inSections = false

  for (const line of lines) {
    const keyMatch = line.match(/^([A-Za-z][A-Za-z &]*):\s*$/)
    if (keyMatch) {
      const key = keyMatch[1].trim()
      if (inSections && !SECTIONS_TERMINATORS.has(key)) {
        // Sub-section header — append to Sections value
        topLevel['Sections'] = [...(topLevel['Sections'] || []), line]
        currentKey = 'Sections'
      } else {
        // Top-level key
        if (SECTIONS_TERMINATORS.has(key)) inSections = false
        if (key === 'Sections') inSections = true
        currentKey = key
        topLevel[currentKey] = topLevel[currentKey] || []
      }
    } else if (currentKey) {
      topLevel[currentKey] = [...(topLevel[currentKey] || []), line]
    }
  }

  const get = (key: string) => (topLevel[key] || []).join('\n').trim()
  const image = get('Image') || 'cover.png'

  return {
    slug,
    headline: get('Headline'),
    industry: get('Industry'),
    capability: get('Capability'),
    challenge: get('Challenge'),
    audience: get('Audience'),
    description: get('Description'),
    metrics: parseMetrics(get('Metrics')),
    image,
    imagePath: `/projects/${slug}/${image}`,
    status: get('Status'),
    sections: parseSections(get('Sections')),
    confidentiality: get('Confidentiality'),
  }
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return []

  return fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const txtPath = path.join(PROJECTS_DIR, d.name, 'project.txt')
      if (!fs.existsSync(txtPath)) return null
      return parseProjectTxt(fs.readFileSync(txtPath, 'utf-8'), d.name)
    })
    .filter((p): p is Project => p !== null && p.status.toLowerCase() === 'published')
}

export function getProjectBySlug(slug: string): Project | undefined {
  const txtPath = path.join(PROJECTS_DIR, slug, 'project.txt')
  if (!fs.existsSync(txtPath)) return undefined
  const p = parseProjectTxt(fs.readFileSync(txtPath, 'utf-8'), slug)
  return p.status.toLowerCase() === 'published' ? p : undefined
}
