import type { VisualDesign, VisualElement, VisualStudioContentSeed, VisualTemplateKey } from '@/lib/visual-studio'
import { SC_BRAND, VISUAL_FORMATS } from '@/lib/visual-studio'
import type { VisualFormatKey } from '@/lib/brand-system'

const clean = (value: unknown) => String(value || '').replace(/\s+/g, ' ').trim()
const sentences = (value: string) => clean(value).split(/(?<=[.!?])\s+/).filter(Boolean)

export function isArticleContentType(contentType?: string) {
  return ['article', 'web_article', 'linkedin_article'].includes(String(contentType || ''))
}

export function isLinkedInArticleType(contentType?: string) {
  return String(contentType || '') === 'linkedin_article'
}

export function defaultVisualFormat(seed?: VisualStudioContentSeed): VisualFormatKey {
  if (!seed) return 'linkedin_square'
  if (isLinkedInArticleType(seed.content_type)) return 'linkedin_landscape'
  if (isArticleContentType(seed.content_type)) return 'article_hero'
  return 'linkedin_square'
}

export function defaultVisualTemplate(seed?: VisualStudioContentSeed): VisualTemplateKey {
  if (seed && isArticleContentType(seed.content_type)) return 'article_editorial'
  return 'insight_dark'
}

export function deriveVisualHook(seed: VisualStudioContentSeed) {
  const strategy = seed.visual_strategy && typeof seed.visual_strategy === 'object' ? seed.visual_strategy : {}
  const configured = clean(strategy.visual_headline)
  if (configured && !/[.…]{2,}$/.test(configured)) return configured
  const title = clean(seed.title)
  if (title) return title
  return sentences(seed.body || '')[0] || 'Comprender antes de construir.'
}

export function deriveVisualSupport(seed: VisualStudioContentSeed) {
  const strategy = seed.visual_strategy && typeof seed.visual_strategy === 'object' ? seed.visual_strategy : {}
  const configured = clean(strategy.visual_support)
  if (configured && !/[.…]{2,}$/.test(configured)) return configured
  const bodySentences = sentences(String(seed.body || '').replace(/^#+\s*/gm, ' '))
  if (bodySentences.length) return bodySentences.slice(0, 2).join(' ')
  return clean(seed.content_family) || 'Decisiones empresariales basadas en evidencia.'
}

export function deriveProcessSteps(seed: VisualStudioContentSeed) {
  const lines = String(seed.body || '').split('\n').map((line) => line.trim()).filter(Boolean)
  const bullets = lines.filter((line) => /^[-*•]\s+/.test(line)).map((line) => line.replace(/^[-*•]\s+/, '').trim()).filter(Boolean)
  if (bullets.length >= 3) return bullets.slice(0, 5)
  const bodySentences = sentences(seed.body || '')
  if (bodySentences.length >= 3) return bodySentences.slice(0, 5)
  return ['Entender la decisión', 'Elegir el enfoque', 'Medir el impacto']
}

function brandLogoSize(formatKey: VisualFormatKey) {
  const format = VISUAL_FORMATS[formatKey]
  const article = ['article_hero', 'article_inline', 'open_graph', 'presentation'].includes(formatKey)
  const width = Math.round(Math.min(article ? 560 : 430, Math.max(article ? 410 : 330, format.width * (article ? 0.31 : 0.32))))
  return { width, height: Math.round(width * 0.28) }
}

function flowArrows(elements: VisualElement[], formatKey: VisualFormatKey): VisualElement[] {
  const format = VISUAL_FORMATS[formatKey]
  const boxes = elements.filter((element) => element.id.startsWith('step-box-')).sort((a, b) => a.x - b.x)
  if (boxes.length < 2) return []
  return boxes.slice(0, -1).map((box, index) => {
    const next = boxes[index + 1]
    const startX = box.x + box.w + Math.max(8, Math.round(format.width * 0.006))
    const endX = next.x - Math.max(8, Math.round(format.width * 0.006))
    return {
      id: `flow-arrow-${index}`,
      kind: 'line' as const,
      role: 'flow-arrow',
      x: startX,
      y: Math.round(box.y + box.h / 2),
      w: Math.max(16, endX - startX),
      h: 0,
      stroke: SC_BRAND.colors.accentBlue,
      strokeWidth: Math.max(3, Math.round(format.width / 360)),
      locked: true,
    }
  })
}

export function enhanceVisualDesign(design: VisualDesign, seed: VisualStudioContentSeed): VisualDesign {
  const hook = deriveVisualHook(seed)
  const support = deriveVisualSupport(seed)
  const processSteps = deriveProcessSteps(seed)
  const logoSize = brandLogoSize(design.formatKey)
  const format = VISUAL_FORMATS[design.formatKey]
  const safe = Math.max(44, Math.round(Math.min(format.width, format.height) * 0.055))
  let stepIndex = 0

  let elements = design.elements.map((element) => {
    if (element.role === 'brand') {
      const dark = ['#071522', '#0B1D2D', '#102638'].includes(design.background.toUpperCase()) || design.background === SC_BRAND.colors.navy
      return {
        ...element,
        x: safe,
        y: safe,
        w: logoSize.width,
        h: logoSize.height,
        src: element.src || (dark ? SC_BRAND.logos.white : SC_BRAND.logos.horizontal),
        locked: true,
      }
    }
    if (element.role === 'headline') return { ...element, text: hook }
    if (element.role === 'support') return { ...element, text: support }
    if (/^step-\d+$/.test(element.id) && element.kind === 'text') {
      const text = processSteps[stepIndex] || element.text || ''
      stepIndex += 1
      return { ...element, text }
    }
    return element
  })

  elements = elements.filter((element) => element.role !== 'flow-arrow')
  if (design.templateKey === 'process_steps') elements = [...elements, ...flowArrows(elements, design.formatKey)]

  return {
    ...design,
    name: `${hook} · ${design.templateKey}`,
    elements,
  }
}

export function contentTypeLabel(seed?: VisualStudioContentSeed) {
  if (!seed) return 'Publicación'
  if (seed.content_type === 'linkedin_article') return 'Artículo LinkedIn'
  if (['article', 'web_article'].includes(seed.content_type)) return 'Artículo web'
  return 'Post LinkedIn'
}
