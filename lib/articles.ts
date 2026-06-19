export interface Article {
  slug: string
  image?: string
  titleEn: string
  titleEs: string
  date: string
  readingTime: number
  tagsEn: string[]
  tagsEs: string[]
  excerptEn: string
  excerptEs: string
  bodyEn: string
  bodyEs: string
  topics?: string[]
  industries?: string[]
  audience?: string
  type?: string
}

export const articles: Article[] = [
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}
