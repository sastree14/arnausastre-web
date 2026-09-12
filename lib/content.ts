import 'server-only'
import fs from 'fs'
import path from 'path'
import { parse as parseYaml } from 'yaml'

export interface Article {
  slug: string
  titleEn: string
  titleEs: string
  excerptEn: string
  excerptEs: string
  date: string
  readingTime: number
  industry: string
  challenge: string
  audience: string
  level: string
  theme: string
  published: boolean
  tagsEn: string[]
  tagsEs: string[]
  bodyEn: string
  bodyEs: string
  image?: string
}

export interface Project {
  slug: string
  titleEn: string
  titleEs: string
  excerptEn: string
  excerptEs: string
  date: string
  industry: string
  type: string
  published: boolean
  tagsEn: string[]
  tagsEs: string[]
  bodyEn: string
  bodyEs: string
}

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')
const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects')

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return { data: {}, content: raw }
  const parsed = parseYaml(match[1])
  const data = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : {}
  return { data, content: raw.slice(match[0].length) }
}

function splitBody(content: string): [string, string] {
  const [bodyEn, bodyEs = ''] = content.split(/\n?<!--\s*ES\s*-->\n?/)
  return [bodyEn.trim(), bodyEs.trim()]
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return []

  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, filename), 'utf-8')
      const { data, content } = parseFrontmatter(raw)
      if (!data.published) return null
      const [bodyEn, bodyEs] = splitBody(content)
      return { ...data, bodyEn, bodyEs } as unknown as Article
    })
    .filter((a): a is Article => a !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug)
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return []

  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, filename), 'utf-8')
      const { data, content } = parseFrontmatter(raw)
      if (!data.published) return null
      const [bodyEn, bodyEs] = splitBody(content)
      return { ...data, bodyEn, bodyEs } as unknown as Project
    })
    .filter((p): p is Project => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug)
}
