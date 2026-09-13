import { PUBLICATION_MODES, SC_BRAND, VISUAL_FORMATS, type PublicationMode, type VisualFormatKey } from '@/lib/brand-system'

export type VisualElementKind = 'text' | 'metric' | 'rect' | 'line' | 'logo' | 'tag'
export type TextAlign = 'left' | 'center' | 'right'

export interface VisualElement {
  id: string
  kind: VisualElementKind
  role?: string
  x: number
  y: number
  w: number
  h: number
  text?: string
  value?: string
  label?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: number
  color?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  radius?: number
  align?: TextAlign
  opacity?: number
  src?: string
  locked?: boolean
  hidden?: boolean
}

export interface VisualDesign {
  designId?: string
  name: string
  templateKey: VisualTemplateKey
  formatKey: VisualFormatKey
  publicationMode: PublicationMode
  background: string
  elements: VisualElement[]
  contentId?: string
  assetPath?: string
  status?: string
}

export interface VisualStudioContentSeed {
  content_id: string
  title: string
  body?: string
  channel: string
  content_type: string
  language?: string
  content_family?: string
  visual_type?: string
  visual_path?: string
  publication_mode?: PublicationMode
}

export interface VisualTemplateMeta {
  key: VisualTemplateKey
  label: string
  description: string
  bestFor: string
  families: Array<'linkedin' | 'website' | 'presentation' | 'vertical'>
}

export const VISUAL_TEMPLATES = [
  {
    key: 'insight_dark',
    label: 'Insight · Dark',
    description: 'Strong thesis, restrained detail, large editorial headline.',
    bestFor: 'Opinions, educational insights and contrarian arguments.',
    families: ['linkedin', 'website', 'presentation'],
  },
  {
    key: 'insight_light',
    label: 'Insight · Light',
    description: 'Paper-like editorial layout with a strong SC-Analytics signature.',
    bestFor: 'Executive posts and article covers.',
    families: ['linkedin', 'website', 'presentation'],
  },
  {
    key: 'metric_focus',
    label: 'Metric focus',
    description: 'One dominant number with explanation and evidence space.',
    bestFor: 'Real metrics, cases, quantified findings and benchmarks.',
    families: ['linkedin', 'website', 'presentation'],
  },
  {
    key: 'comparison_split',
    label: 'Comparison',
    description: 'Two-column contrast: common framing versus better framing.',
    bestFor: 'Before/after, wrong/right, trade-offs and decision comparisons.',
    families: ['linkedin', 'website', 'presentation'],
  },
  {
    key: 'process_steps',
    label: 'Process / framework',
    description: 'A clean sequence of 3–5 steps or decision stages.',
    bestFor: 'Frameworks, systems, workflows and implementation sequences.',
    families: ['linkedin', 'website', 'presentation'],
  },
  {
    key: 'case_result',
    label: 'Case result',
    description: 'Problem → intervention → business result.',
    bestFor: 'Project stories, anonymised evidence and practical outcomes.',
    families: ['linkedin', 'website', 'presentation'],
  },
  {
    key: 'article_editorial',
    label: 'Article editorial',
    description: 'Wide editorial cover designed for long-form content.',
    bestFor: 'Article heroes, Open Graph and Knowledge content.',
    families: ['website', 'presentation', 'linkedin'],
  },
  {
    key: 'image_only_statement',
    label: 'Image-only statement',
    description: 'The image carries the full message with minimal or no external copy.',
    bestFor: 'Visual-first and image-only LinkedIn publishing.',
    families: ['linkedin', 'vertical', 'presentation'],
  },
] as const satisfies readonly VisualTemplateMeta[]

export type VisualTemplateKey = (typeof VISUAL_TEMPLATES)[number]['key']

const brand = SC_BRAND

function format(formatKey: VisualFormatKey) {
  return VISUAL_FORMATS[formatKey]
}

function clampText(value: string, max = 220) {
  const clean = value.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, Math.max(0, max - 1)).trim()}…`
}

function firstParagraph(body = '') {
  return body.split(/\n\s*\n/).map((part) => part.replace(/^#+\s*/gm, '').trim()).find(Boolean) || ''
}

function sentences(value: string) {
  return value.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean)
}

function shortSupport(seed: VisualStudioContentSeed) {
  const paragraph = firstParagraph(seed.body || '')
  const parts = sentences(paragraph)
  return clampText(parts.slice(0, 2).join(' ') || seed.content_family || 'Business decision support', 190)
}

function extractMetric(seed: VisualStudioContentSeed): { value: string; label: string } | null {
  const source = `${seed.title} ${seed.body || ''}`
  const matches = source.match(/(?:[-+]?\d+(?:[.,]\d+)?\s?%|\$\s?\d+(?:[.,]\d+)?(?:\s?[KMB])?|€\s?\d+(?:[.,]\d+)?(?:\s?[KMB])?|\d+(?:[.,]\d+)?x)/i)
  if (!matches) return null
  const value = matches[0].replace(/\s+/g, ' ')
  const index = source.indexOf(matches[0])
  const around = source.slice(Math.max(0, index - 70), Math.min(source.length, index + matches[0].length + 90))
  return { value, label: clampText(around.replace(matches[0], '').replace(/[•|]/g, ' ').trim(), 80) || 'Business impact' }
}

function extractBullets(seed: VisualStudioContentSeed) {
  const raw = (seed.body || '').split('\n').map((line) => line.trim()).filter(Boolean)
  const explicit = raw.filter((line) => /^[-*•]\s+/.test(line)).map((line) => line.replace(/^[-*•]\s+/, ''))
  if (explicit.length >= 3) return explicit.slice(0, 5).map((item) => clampText(item, 70))
  const bodySentences = sentences(firstParagraph(seed.body || '')).slice(0, 4)
  return (bodySentences.length >= 3 ? bodySentences : ['Understand the decision', 'Choose a proportionate approach', 'Measure business impact']).map((item) => clampText(item, 70))
}

function splitComparison(seed: VisualStudioContentSeed) {
  const title = seed.title.trim()
  const separators = [' vs. ', ' vs ', ' versus ', ' but ', ' not ']
  for (const separator of separators) {
    const idx = title.toLowerCase().indexOf(separator)
    if (idx > 0) {
      return {
        left: clampText(title.slice(0, idx), 90),
        right: clampText(title.slice(idx + separator.length), 90),
      }
    }
  }
  return {
    left: clampText(title, 90),
    right: clampText(shortSupport(seed), 100),
  }
}

function safe(width: number, height: number) {
  return Math.max(44, Math.round(Math.min(width, height) * 0.06))
}

function baseLogo(width: number, height: number, dark = true): VisualElement {
  const margin = safe(width, height)
  const logoW = Math.round(Math.min(width * 0.24, 310))
  return {
    id: 'logo', kind: 'logo', role: 'brand', x: margin, y: margin, w: logoW, h: Math.round(logoW * 0.28),
    src: dark ? brand.logos.white : brand.logos.horizontal, locked: false,
  }
}

function footer(width: number, height: number, dark = true): VisualElement {
  const margin = safe(width, height)
  return {
    id: 'footer', kind: 'text', role: 'footer', x: margin, y: height - margin - 34, w: width - margin * 2, h: 34,
    text: `${brand.tagline}  ·  ${brand.website}`, fontSize: Math.max(18, Math.round(width / 60)),
    fontFamily: brand.fonts.body, fontWeight: 500, color: dark ? brand.colors.mutedOnDark : brand.colors.slate,
    align: 'left', opacity: 0.95,
  }
}

function titleFont(width: number, height: number, scale = 1) {
  return Math.round(Math.max(42, Math.min(84, Math.min(width, height) * 0.063)) * scale)
}

function supportFont(width: number, height: number) {
  return Math.round(Math.max(24, Math.min(38, Math.min(width, height) * 0.03)))
}

function tag(text: string, x: number, y: number, width: number, dark = true): VisualElement {
  return {
    id: `tag-${Math.random().toString(36).slice(2, 8)}`, kind: 'tag', x, y, w: width, h: 46,
    text: text.toUpperCase(), fontSize: 18, fontFamily: brand.fonts.body, fontWeight: 700,
    color: dark ? brand.colors.accentBlue : brand.colors.indigo,
    fill: dark ? brand.colors.navySoft : '#EEF2FF', radius: 23, align: 'center',
  }
}

function insightDark(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width, height } = format(formatKey)
  const margin = safe(width, height)
  return {
    name: `${seed.title} · Insight`, templateKey: 'insight_dark', formatKey,
    publicationMode: seed.publication_mode || 'text_with_visual', background: brand.colors.navy, contentId: seed.content_id,
    elements: [
      baseLogo(width, height, true),
      tag(seed.content_family || 'SC-Analytics insight', margin, Math.round(height * 0.22), Math.min(300, width * 0.32), true),
      { id: 'headline', kind: 'text', role: 'headline', x: margin, y: Math.round(height * 0.32), w: width - margin * 2, h: Math.round(height * 0.34), text: clampText(seed.title, 180), fontSize: titleFont(width, height), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.textOnDark, align: 'left' },
      { id: 'support', kind: 'text', role: 'support', x: margin, y: Math.round(height * 0.70), w: width - margin * 2, h: Math.round(height * 0.16), text: shortSupport(seed), fontSize: supportFont(width, height), fontFamily: brand.fonts.body, fontWeight: 400, color: brand.colors.mutedOnDark, align: 'left' },
      footer(width, height, true),
    ],
  }
}

function insightLight(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width, height } = format(formatKey)
  const margin = safe(width, height)
  return {
    name: `${seed.title} · Editorial`, templateKey: 'insight_light', formatKey,
    publicationMode: seed.publication_mode || 'text_with_visual', background: brand.colors.paper, contentId: seed.content_id,
    elements: [
      baseLogo(width, height, false),
      { id: 'accent', kind: 'rect', x: margin, y: Math.round(height * 0.24), w: Math.max(7, width * 0.008), h: Math.round(height * 0.42), fill: brand.colors.indigo, radius: 4 },
      { id: 'eyebrow', kind: 'text', role: 'eyebrow', x: margin + 34, y: Math.round(height * 0.24), w: width - margin * 2 - 34, h: 40, text: (seed.content_family || 'SC-Analytics').toUpperCase(), fontSize: 20, fontFamily: brand.fonts.body, fontWeight: 700, color: brand.colors.indigo },
      { id: 'headline', kind: 'text', role: 'headline', x: margin + 34, y: Math.round(height * 0.32), w: width - margin * 2 - 34, h: Math.round(height * 0.34), text: clampText(seed.title, 180), fontSize: titleFont(width, height), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.ink },
      { id: 'support', kind: 'text', role: 'support', x: margin + 34, y: Math.round(height * 0.70), w: width - margin * 2 - 34, h: Math.round(height * 0.14), text: shortSupport(seed), fontSize: supportFont(width, height), fontFamily: brand.fonts.body, fontWeight: 400, color: brand.colors.slate },
      footer(width, height, false),
    ],
  }
}

function metricFocus(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width, height } = format(formatKey)
  const margin = safe(width, height)
  const metric = extractMetric(seed) || { value: '01', label: seed.content_family || 'Decision insight' }
  return {
    name: `${seed.title} · Metric`, templateKey: 'metric_focus', formatKey,
    publicationMode: seed.publication_mode || 'text_with_visual', background: brand.colors.navy, contentId: seed.content_id,
    elements: [
      baseLogo(width, height, true),
      { id: 'headline', kind: 'text', role: 'headline', x: margin, y: Math.round(height * 0.23), w: width - margin * 2, h: Math.round(height * 0.18), text: clampText(seed.title, 120), fontSize: titleFont(width, height, 0.68), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.textOnDark },
      { id: 'metric-box', kind: 'rect', x: margin, y: Math.round(height * 0.46), w: width - margin * 2, h: Math.round(height * 0.30), fill: brand.colors.navyPanel, stroke: brand.colors.line, strokeWidth: 2, radius: 28 },
      { id: 'metric-value', kind: 'metric', role: 'metric', x: margin + 34, y: Math.round(height * 0.50), w: Math.round((width - margin * 2) * 0.46), h: Math.round(height * 0.18), value: metric.value, label: metric.label, fontSize: Math.round(Math.min(width, height) * 0.12), fontFamily: brand.fonts.body, fontWeight: 750, color: brand.colors.accentBlue },
      { id: 'support', kind: 'text', role: 'support', x: Math.round(width * 0.52), y: Math.round(height * 0.51), w: width - Math.round(width * 0.52) - margin - 20, h: Math.round(height * 0.18), text: shortSupport(seed), fontSize: supportFont(width, height), fontFamily: brand.fonts.body, fontWeight: 400, color: brand.colors.mutedOnDark },
      footer(width, height, true),
    ],
  }
}

function comparisonSplit(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width, height } = format(formatKey)
  const margin = safe(width, height)
  const parts = splitComparison(seed)
  const gap = Math.round(width * 0.025)
  const col = Math.round((width - margin * 2 - gap) / 2)
  return {
    name: `${seed.title} · Comparison`, templateKey: 'comparison_split', formatKey,
    publicationMode: seed.publication_mode || 'text_with_visual', background: brand.colors.paper, contentId: seed.content_id,
    elements: [
      baseLogo(width, height, false),
      { id: 'headline', kind: 'text', x: margin, y: Math.round(height * 0.19), w: width - margin * 2, h: Math.round(height * 0.18), text: clampText(seed.title, 110), fontSize: titleFont(width, height, 0.62), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.ink },
      { id: 'left-box', kind: 'rect', x: margin, y: Math.round(height * 0.42), w: col, h: Math.round(height * 0.38), fill: '#EEF2F7', stroke: brand.colors.lineLight, strokeWidth: 2, radius: 24 },
      { id: 'right-box', kind: 'rect', x: margin + col + gap, y: Math.round(height * 0.42), w: col, h: Math.round(height * 0.38), fill: '#EEF2FF', stroke: '#C7D2FE', strokeWidth: 2, radius: 24 },
      tag('Common framing', margin + 24, Math.round(height * 0.46), Math.min(230, col - 48), false),
      tag('Better framing', margin + col + gap + 24, Math.round(height * 0.46), Math.min(230, col - 48), false),
      { id: 'left-text', kind: 'text', x: margin + 28, y: Math.round(height * 0.57), w: col - 56, h: Math.round(height * 0.18), text: parts.left, fontSize: supportFont(width, height) + 3, fontFamily: brand.fonts.body, fontWeight: 600, color: brand.colors.slate },
      { id: 'right-text', kind: 'text', x: margin + col + gap + 28, y: Math.round(height * 0.57), w: col - 56, h: Math.round(height * 0.18), text: parts.right, fontSize: supportFont(width, height) + 3, fontFamily: brand.fonts.body, fontWeight: 650, color: brand.colors.indigo },
      footer(width, height, false),
    ],
  }
}

function processSteps(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width, height } = format(formatKey)
  const margin = safe(width, height)
  const steps = extractBullets(seed)
  const vertical = height > width * 1.1
  const elements: VisualElement[] = [baseLogo(width, height, true),
    { id: 'headline', kind: 'text', x: margin, y: Math.round(height * 0.19), w: width - margin * 2, h: Math.round(height * 0.17), text: clampText(seed.title, 115), fontSize: titleFont(width, height, 0.62), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.textOnDark }]
  if (vertical) {
    const startY = Math.round(height * 0.39)
    const stepH = Math.round((height * 0.42) / steps.length)
    steps.forEach((step, index) => {
      elements.push({ id: `step-dot-${index}`, kind: 'rect', x: margin, y: startY + index * stepH + 6, w: 42, h: 42, fill: brand.colors.accentBlue, radius: 21 })
      elements.push({ id: `step-num-${index}`, kind: 'text', x: margin, y: startY + index * stepH + 10, w: 42, h: 34, text: String(index + 1).padStart(2, '0'), fontSize: 17, fontFamily: brand.fonts.body, fontWeight: 800, color: brand.colors.navy, align: 'center' })
      elements.push({ id: `step-text-${index}`, kind: 'text', x: margin + 66, y: startY + index * stepH, w: width - margin * 2 - 66, h: stepH - 6, text: step, fontSize: supportFont(width, height), fontFamily: brand.fonts.body, fontWeight: 550, color: brand.colors.textOnDark })
    })
  } else {
    const startY = Math.round(height * 0.47)
    const gap = Math.round(width * 0.016)
    const stepW = Math.round((width - margin * 2 - gap * (steps.length - 1)) / steps.length)
    steps.forEach((step, index) => {
      const x = margin + index * (stepW + gap)
      elements.push({ id: `step-box-${index}`, kind: 'rect', x, y: startY, w: stepW, h: Math.round(height * 0.28), fill: index === steps.length - 1 ? brand.colors.navySoft : brand.colors.navyPanel, stroke: brand.colors.line, strokeWidth: 2, radius: 22 })
      elements.push({ id: `step-num-${index}`, kind: 'text', x: x + 22, y: startY + 22, w: stepW - 44, h: 30, text: String(index + 1).padStart(2, '0'), fontSize: 18, fontFamily: brand.fonts.body, fontWeight: 800, color: brand.colors.accentBlue })
      elements.push({ id: `step-text-${index}`, kind: 'text', x: x + 22, y: startY + 76, w: stepW - 44, h: Math.round(height * 0.15), text: step, fontSize: Math.max(20, supportFont(width, height) - 4), fontFamily: brand.fonts.body, fontWeight: 550, color: brand.colors.textOnDark })
    })
  }
  elements.push(footer(width, height, true))
  return { name: `${seed.title} · Framework`, templateKey: 'process_steps', formatKey, publicationMode: seed.publication_mode || 'text_with_visual', background: brand.colors.navy, contentId: seed.content_id, elements }
}

function caseResult(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width, height } = format(formatKey)
  const margin = safe(width, height)
  const metric = extractMetric(seed)
  const support = shortSupport(seed)
  return {
    name: `${seed.title} · Case`, templateKey: 'case_result', formatKey, publicationMode: seed.publication_mode || 'text_with_visual', background: brand.colors.paper, contentId: seed.content_id,
    elements: [
      baseLogo(width, height, false),
      tag('Business case', margin, Math.round(height * 0.20), 210, false),
      { id: 'headline', kind: 'text', x: margin, y: Math.round(height * 0.29), w: width - margin * 2, h: Math.round(height * 0.20), text: clampText(seed.title, 120), fontSize: titleFont(width, height, 0.64), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.ink },
      { id: 'problem-label', kind: 'text', x: margin, y: Math.round(height * 0.55), w: Math.round(width * 0.25), h: 34, text: 'PROBLEM', fontSize: 18, fontFamily: brand.fonts.body, fontWeight: 800, color: brand.colors.slate },
      { id: 'problem', kind: 'text', x: margin, y: Math.round(height * 0.60), w: Math.round(width * 0.44), h: Math.round(height * 0.17), text: support, fontSize: Math.max(22, supportFont(width, height) - 3), fontFamily: brand.fonts.body, fontWeight: 450, color: brand.colors.slate },
      { id: 'result-box', kind: 'rect', x: Math.round(width * 0.57), y: Math.round(height * 0.54), w: width - Math.round(width * 0.57) - margin, h: Math.round(height * 0.25), fill: brand.colors.navy, radius: 24 },
      { id: 'result', kind: 'metric', x: Math.round(width * 0.60), y: Math.round(height * 0.58), w: width - Math.round(width * 0.60) - margin - 20, h: Math.round(height * 0.17), value: metric?.value || '→', label: metric?.label || 'A clearer decision system', fontSize: Math.round(Math.min(width, height) * 0.075), fontFamily: brand.fonts.body, fontWeight: 800, color: brand.colors.accentBlue },
      footer(width, height, false),
    ],
  }
}

function articleEditorial(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width, height } = format(formatKey)
  const margin = safe(width, height)
  return {
    name: `${seed.title} · Article hero`, templateKey: 'article_editorial', formatKey, publicationMode: seed.publication_mode || 'text_with_visual', background: brand.colors.navy, contentId: seed.content_id,
    elements: [
      baseLogo(width, height, true),
      { id: 'eyebrow', kind: 'text', x: margin, y: Math.round(height * 0.25), w: width - margin * 2, h: 36, text: `${(seed.content_family || 'KNOWLEDGE').toUpperCase()}  ·  ${(seed.language || 'EN').toUpperCase()}`, fontSize: 20, fontFamily: brand.fonts.body, fontWeight: 750, color: brand.colors.accentBlue },
      { id: 'headline', kind: 'text', role: 'headline', x: margin, y: Math.round(height * 0.34), w: Math.round(width * 0.74), h: Math.round(height * 0.34), text: clampText(seed.title, 180), fontSize: titleFont(width, height, 0.78), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.textOnDark },
      { id: 'support', kind: 'text', x: margin, y: Math.round(height * 0.73), w: Math.round(width * 0.72), h: Math.round(height * 0.12), text: shortSupport(seed), fontSize: supportFont(width, height), fontFamily: brand.fonts.body, fontWeight: 400, color: brand.colors.mutedOnDark },
      { id: 'graphic', kind: 'rect', x: Math.round(width * 0.82), y: Math.round(height * 0.29), w: Math.round(width * 0.10), h: Math.round(height * 0.47), fill: brand.colors.navyPanelAlt, stroke: brand.colors.line, strokeWidth: 2, radius: 28 },
      { id: 'graphic-line', kind: 'line', x: Math.round(width * 0.87), y: Math.round(height * 0.36), w: 0, h: Math.round(height * 0.32), stroke: brand.colors.accentBlue, strokeWidth: 6 },
      footer(width, height, true),
    ],
  }
}

function imageOnlyStatement(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width, height } = format(formatKey)
  const margin = safe(width, height)
  return {
    name: `${seed.title} · Image only`, templateKey: 'image_only_statement', formatKey, publicationMode: 'image_only', background: brand.colors.navy, contentId: seed.content_id,
    elements: [
      baseLogo(width, height, true),
      { id: 'frame', kind: 'rect', x: margin, y: Math.round(height * 0.20), w: width - margin * 2, h: Math.round(height * 0.61), fill: brand.colors.navyPanel, stroke: brand.colors.line, strokeWidth: 2, radius: 30 },
      { id: 'statement', kind: 'text', role: 'headline', x: margin + 42, y: Math.round(height * 0.28), w: width - margin * 2 - 84, h: Math.round(height * 0.34), text: clampText(seed.title, 200), fontSize: titleFont(width, height, 0.88), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.textOnDark, align: 'left' },
      { id: 'support', kind: 'text', x: margin + 42, y: Math.round(height * 0.66), w: width - margin * 2 - 84, h: Math.round(height * 0.10), text: clampText(shortSupport(seed), 140), fontSize: supportFont(width, height), fontFamily: brand.fonts.body, fontWeight: 450, color: brand.colors.mutedOnDark },
      footer(width, height, true),
    ],
  }
}

export function createDesignFromTemplate(templateKey: VisualTemplateKey, formatKey: VisualFormatKey, seed: VisualStudioContentSeed): VisualDesign {
  switch (templateKey) {
    case 'insight_light': return insightLight(seed, formatKey)
    case 'metric_focus': return metricFocus(seed, formatKey)
    case 'comparison_split': return comparisonSplit(seed, formatKey)
    case 'process_steps': return processSteps(seed, formatKey)
    case 'case_result': return caseResult(seed, formatKey)
    case 'article_editorial': return articleEditorial(seed, formatKey)
    case 'image_only_statement': return imageOnlyStatement(seed, formatKey)
    default: return insightDark(seed, formatKey)
  }
}

export function recommendTemplates(seed: VisualStudioContentSeed): VisualTemplateKey[] {
  const source = `${seed.title} ${seed.body || ''}`.toLowerCase()
  const result: VisualTemplateKey[] = []
  if (extractMetric(seed)) result.push('metric_focus', 'case_result')
  if (/\b(vs\.?|versus|before|after|instead|rather than|not\b|trade-?off)/i.test(source)) result.push('comparison_split')
  if (/\b(process|framework|steps?|workflow|system|sequence|decision|horizon|pipeline)\b/i.test(source) || extractBullets(seed).length >= 3) result.push('process_steps')
  if (seed.content_type === 'article') result.push('article_editorial')
  result.push('insight_dark', 'insight_light', 'image_only_statement')
  return Array.from(new Set(result)).slice(0, 4)
}

export function adaptDesignToFormat(design: VisualDesign, formatKey: VisualFormatKey): VisualDesign {
  const oldFormat = format(design.formatKey)
  const next = format(formatKey)
  const sx = next.width / oldFormat.width
  const sy = next.height / oldFormat.height
  const fontScale = Math.sqrt(sx * sy)
  return {
    ...design,
    formatKey,
    name: design.name.replace(/ · [^·]+$/, '') || design.name,
    elements: design.elements.map((element) => ({
      ...element,
      x: Math.round(element.x * sx), y: Math.round(element.y * sy),
      w: Math.round(element.w * sx), h: Math.round(element.h * sy),
      fontSize: element.fontSize ? Math.max(12, Math.round(element.fontSize * fontScale)) : element.fontSize,
      strokeWidth: element.strokeWidth ? Math.max(1, Math.round(element.strokeWidth * fontScale)) : element.strokeWidth,
      radius: element.radius ? Math.round(element.radius * fontScale) : element.radius,
    })),
  }
}

export function duplicateElement(element: VisualElement): VisualElement {
  return { ...element, id: `${element.id}-copy-${Math.random().toString(36).slice(2, 7)}`, x: element.x + 24, y: element.y + 24, locked: false }
}

export function emptyTextElement(formatKey: VisualFormatKey): VisualElement {
  const { width, height } = format(formatKey)
  return { id: `text-${Date.now()}`, kind: 'text', x: Math.round(width * 0.12), y: Math.round(height * 0.45), w: Math.round(width * 0.50), h: Math.round(height * 0.16), text: 'New text', fontSize: Math.round(Math.min(width, height) * 0.04), fontFamily: brand.fonts.body, fontWeight: 500, color: brand.colors.textOnDark, align: 'left' }
}

export function emptyMetricElement(formatKey: VisualFormatKey): VisualElement {
  const { width, height } = format(formatKey)
  return { id: `metric-${Date.now()}`, kind: 'metric', x: Math.round(width * 0.12), y: Math.round(height * 0.45), w: Math.round(width * 0.40), h: Math.round(height * 0.20), value: '42%', label: 'Metric label', fontSize: Math.round(Math.min(width, height) * 0.10), fontFamily: brand.fonts.body, fontWeight: 800, color: brand.colors.accentBlue }
}

export function emptyRectElement(formatKey: VisualFormatKey): VisualElement {
  const { width, height } = format(formatKey)
  return { id: `rect-${Date.now()}`, kind: 'rect', x: Math.round(width * 0.20), y: Math.round(height * 0.36), w: Math.round(width * 0.42), h: Math.round(height * 0.24), fill: brand.colors.navyPanel, stroke: brand.colors.line, strokeWidth: 2, radius: 24, opacity: 1 }
}

export function emptyLineElement(formatKey: VisualFormatKey): VisualElement {
  const { width, height } = format(formatKey)
  return { id: `line-${Date.now()}`, kind: 'line', x: Math.round(width * 0.20), y: Math.round(height * 0.52), w: Math.round(width * 0.40), h: 0, stroke: brand.colors.accentBlue, strokeWidth: 4, opacity: 1 }
}

export function emptyLogoElement(formatKey: VisualFormatKey): VisualElement {
  const { width, height } = format(formatKey)
  return { ...baseLogo(width, height, true), id: `logo-${Date.now()}` }
}

export { PUBLICATION_MODES, VISUAL_FORMATS, SC_BRAND }
