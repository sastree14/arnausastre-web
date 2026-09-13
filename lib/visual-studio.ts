import { PUBLICATION_MODES, SC_BRAND, VISUAL_FORMATS, type PublicationMode, type VisualFormatKey } from '@/lib/brand-system'

export type VisualElementKind = 'text' | 'metric' | 'rect' | 'line' | 'logo' | 'tag'
export type TextAlign = 'left' | 'center' | 'right'
export type VisualTemplateKey = 'insight_dark' | 'insight_light' | 'metric_focus' | 'comparison_split' | 'process_steps' | 'case_result' | 'article_editorial' | 'image_only_statement'

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
  families: readonly ('linkedin' | 'website' | 'presentation' | 'vertical')[]
}

export const VISUAL_TEMPLATES: readonly VisualTemplateMeta[] = [
  { key: 'insight_dark', label: 'Insight · Dark', description: 'Strong thesis with restrained detail.', bestFor: 'Opinions, education and contrarian arguments.', families: ['linkedin', 'website', 'presentation'] },
  { key: 'insight_light', label: 'Insight · Light', description: 'Paper-like editorial composition.', bestFor: 'Executive posts and article covers.', families: ['linkedin', 'website', 'presentation'] },
  { key: 'metric_focus', label: 'Metric focus', description: 'One dominant number with evidence space.', bestFor: 'Real metrics, cases and quantified findings.', families: ['linkedin', 'website', 'presentation'] },
  { key: 'comparison_split', label: 'Comparison', description: 'Two-column contrast.', bestFor: 'Before/after, wrong/right and trade-offs.', families: ['linkedin', 'website', 'presentation'] },
  { key: 'process_steps', label: 'Process / framework', description: 'A clean sequence of 3–5 stages.', bestFor: 'Frameworks, systems and workflows.', families: ['linkedin', 'website', 'presentation'] },
  { key: 'case_result', label: 'Case result', description: 'Problem and result in one composition.', bestFor: 'Project stories and practical outcomes.', families: ['linkedin', 'website', 'presentation'] },
  { key: 'article_editorial', label: 'Article editorial', description: 'Wide editorial cover for long-form content.', bestFor: 'Article heroes, Open Graph and Knowledge.', families: ['website', 'presentation', 'linkedin'] },
  { key: 'image_only_statement', label: 'Image-led statement', description: 'The visual carries almost the entire message.', bestFor: 'Visual-first LinkedIn publishing.', families: ['linkedin', 'vertical', 'presentation'] },
]

const brand = SC_BRAND

function fmt(key: VisualFormatKey) { return VISUAL_FORMATS[key] }
function safe(w: number, h: number) { return Math.max(44, Math.round(Math.min(w, h) * 0.06)) }
function titleSize(w: number, h: number, factor = 1) { return Math.round(Math.max(42, Math.min(84, Math.min(w, h) * 0.063)) * factor) }
function supportSize(w: number, h: number) { return Math.round(Math.max(24, Math.min(38, Math.min(w, h) * 0.03))) }
function clamp(value: string, max = 220) { const clean = value.replace(/\s+/g, ' ').trim(); return clean.length <= max ? clean : `${clean.slice(0, max - 1).trim()}…` }
function firstParagraph(body = '') { return body.split(/\n\s*\n/).map((part) => part.replace(/^#+\s*/gm, '').trim()).find(Boolean) || '' }
function sentences(value: string) { return value.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean) }
function support(seed: VisualStudioContentSeed) { const parts = sentences(firstParagraph(seed.body || '')); return clamp(parts.slice(0, 2).join(' ') || seed.content_family || 'Business decision support', 190) }

function metric(seed: VisualStudioContentSeed) {
  const source = `${seed.title} ${seed.body || ''}`
  const found = source.match(/(?:[-+]?\d+(?:[.,]\d+)?\s?%|\$\s?\d+(?:[.,]\d+)?(?:\s?[KMB])?|€\s?\d+(?:[.,]\d+)?(?:\s?[KMB])?|\d+(?:[.,]\d+)?x)/i)
  if (!found) return null
  const index = source.indexOf(found[0])
  const around = source.slice(Math.max(0, index - 65), Math.min(source.length, index + found[0].length + 85)).replace(found[0], '')
  return { value: found[0].replace(/\s+/g, ' '), label: clamp(around.trim(), 80) || 'Business impact' }
}

function steps(seed: VisualStudioContentSeed) {
  const lines = (seed.body || '').split('\n').map((line) => line.trim()).filter(Boolean)
  const bullets = lines.filter((line) => /^[-*•]\s+/.test(line)).map((line) => line.replace(/^[-*•]\s+/, ''))
  const candidates = bullets.length >= 3 ? bullets : sentences(firstParagraph(seed.body || ''))
  return (candidates.length >= 3 ? candidates : ['Understand the decision', 'Choose a proportionate approach', 'Measure business impact']).slice(0, 5).map((item) => clamp(item, 70))
}

function split(seed: VisualStudioContentSeed) {
  const title = seed.title.trim()
  for (const separator of [' vs. ', ' vs ', ' versus ', ' but ', ' not ']) {
    const index = title.toLowerCase().indexOf(separator)
    if (index > 0) return { left: clamp(title.slice(0, index), 90), right: clamp(title.slice(index + separator.length), 90) }
  }
  return { left: clamp(title, 90), right: clamp(support(seed), 100) }
}

function logo(w: number, h: number, dark: boolean): VisualElement {
  const m = safe(w, h); const lw = Math.round(Math.min(w * 0.24, 310))
  return { id: 'logo', kind: 'logo', role: 'brand', x: m, y: m, w: lw, h: Math.round(lw * 0.28), src: dark ? brand.logos.white : brand.logos.horizontal }
}
function footer(w: number, h: number, dark: boolean): VisualElement {
  const m = safe(w, h)
  return { id: 'footer', kind: 'text', role: 'footer', x: m, y: h - m - 34, w: w - m * 2, h: 34, text: `${brand.tagline}  ·  ${brand.website}`, fontSize: Math.max(18, Math.round(w / 60)), fontFamily: brand.fonts.body, fontWeight: 500, color: dark ? brand.colors.mutedOnDark : brand.colors.slate }
}
function tag(id: string, text: string, x: number, y: number, width: number, dark: boolean): VisualElement {
  return { id, kind: 'tag', x, y, w: width, h: 46, text: text.toUpperCase(), fontSize: 18, fontFamily: brand.fonts.body, fontWeight: 700, color: dark ? brand.colors.accentBlue : brand.colors.indigo, fill: dark ? brand.colors.navySoft : '#EEF2FF', radius: 23, align: 'center' }
}
function base(seed: VisualStudioContentSeed, key: VisualTemplateKey, formatKey: VisualFormatKey, background: string, elements: VisualElement[], mode?: PublicationMode): VisualDesign {
  return { name: `${seed.title} · ${VISUAL_TEMPLATES.find((item) => item.key === key)?.label || key}`, templateKey: key, formatKey, publicationMode: mode || seed.publication_mode || 'text_with_visual', background, contentId: seed.content_id, elements }
}

function insight(seed: VisualStudioContentSeed, formatKey: VisualFormatKey, dark: boolean): VisualDesign {
  const { width: w, height: h } = fmt(formatKey); const m = safe(w, h)
  const elements: VisualElement[] = [logo(w, h, dark)]
  if (dark) elements.push(tag('eyebrow-tag', seed.content_family || 'SC-Analytics insight', m, Math.round(h * 0.22), Math.min(300, w * 0.32), true))
  else elements.push({ id: 'accent', kind: 'rect', x: m, y: Math.round(h * 0.24), w: Math.max(7, w * 0.008), h: Math.round(h * 0.42), fill: brand.colors.indigo, radius: 4 })
  const x = dark ? m : m + 34
  elements.push({ id: 'headline', kind: 'text', role: 'headline', x, y: Math.round(h * 0.32), w: w - x - m, h: Math.round(h * 0.34), text: clamp(seed.title, 180), fontSize: titleSize(w, h), fontFamily: brand.fonts.display, fontWeight: 600, color: dark ? brand.colors.textOnDark : brand.colors.ink })
  elements.push({ id: 'support', kind: 'text', role: 'support', x, y: Math.round(h * 0.70), w: w - x - m, h: Math.round(h * 0.15), text: support(seed), fontSize: supportSize(w, h), fontFamily: brand.fonts.body, fontWeight: 400, color: dark ? brand.colors.mutedOnDark : brand.colors.slate })
  elements.push(footer(w, h, dark))
  return base(seed, dark ? 'insight_dark' : 'insight_light', formatKey, dark ? brand.colors.navy : brand.colors.paper, elements)
}

function metricFocus(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width: w, height: h } = fmt(formatKey); const m = safe(w, h); const mt = metric(seed) || { value: '01', label: seed.content_family || 'Decision insight' }
  return base(seed, 'metric_focus', formatKey, brand.colors.navy, [
    logo(w, h, true),
    { id: 'headline', kind: 'text', role: 'headline', x: m, y: Math.round(h * 0.23), w: w - m * 2, h: Math.round(h * 0.18), text: clamp(seed.title, 120), fontSize: titleSize(w, h, 0.68), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.textOnDark },
    { id: 'metric-box', kind: 'rect', x: m, y: Math.round(h * 0.46), w: w - m * 2, h: Math.round(h * 0.30), fill: brand.colors.navyPanel, stroke: brand.colors.line, strokeWidth: 2, radius: 28 },
    { id: 'metric-value', kind: 'metric', role: 'metric', x: m + 34, y: Math.round(h * 0.50), w: Math.round((w - m * 2) * 0.46), h: Math.round(h * 0.18), value: mt.value, label: mt.label, fontSize: Math.round(Math.min(w, h) * 0.12), fontFamily: brand.fonts.body, fontWeight: 750, color: brand.colors.accentBlue },
    { id: 'support', kind: 'text', role: 'support', x: Math.round(w * 0.52), y: Math.round(h * 0.51), w: w - Math.round(w * 0.52) - m - 20, h: Math.round(h * 0.18), text: support(seed), fontSize: supportSize(w, h), fontFamily: brand.fonts.body, color: brand.colors.mutedOnDark },
    footer(w, h, true),
  ])
}

function comparison(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width: w, height: h } = fmt(formatKey); const m = safe(w, h); const gap = Math.round(w * 0.025); const col = Math.round((w - m * 2 - gap) / 2); const parts = split(seed)
  return base(seed, 'comparison_split', formatKey, brand.colors.paper, [
    logo(w, h, false),
    { id: 'headline', kind: 'text', role: 'headline', x: m, y: Math.round(h * 0.19), w: w - m * 2, h: Math.round(h * 0.18), text: clamp(seed.title, 110), fontSize: titleSize(w, h, 0.62), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.ink },
    { id: 'left-box', kind: 'rect', x: m, y: Math.round(h * 0.42), w: col, h: Math.round(h * 0.38), fill: '#EEF2F7', stroke: brand.colors.lineLight, strokeWidth: 2, radius: 24 },
    { id: 'right-box', kind: 'rect', x: m + col + gap, y: Math.round(h * 0.42), w: col, h: Math.round(h * 0.38), fill: '#EEF2FF', stroke: '#C7D2FE', strokeWidth: 2, radius: 24 },
    tag('left-tag', 'Common framing', m + 24, Math.round(h * 0.46), Math.min(230, col - 48), false),
    tag('right-tag', 'Better framing', m + col + gap + 24, Math.round(h * 0.46), Math.min(230, col - 48), false),
    { id: 'left-text', kind: 'text', x: m + 28, y: Math.round(h * 0.57), w: col - 56, h: Math.round(h * 0.18), text: parts.left, fontSize: supportSize(w, h) + 3, fontFamily: brand.fonts.body, fontWeight: 600, color: brand.colors.slate },
    { id: 'right-text', kind: 'text', x: m + col + gap + 28, y: Math.round(h * 0.57), w: col - 56, h: Math.round(h * 0.18), text: parts.right, fontSize: supportSize(w, h) + 3, fontFamily: brand.fonts.body, fontWeight: 650, color: brand.colors.indigo },
    footer(w, h, false),
  ])
}

function process(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width: w, height: h } = fmt(formatKey); const m = safe(w, h); const list = steps(seed)
  const elements: VisualElement[] = [logo(w, h, true), { id: 'headline', kind: 'text', role: 'headline', x: m, y: Math.round(h * 0.19), w: w - m * 2, h: Math.round(h * 0.17), text: clamp(seed.title, 115), fontSize: titleSize(w, h, 0.62), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.textOnDark }]
  if (h > w * 1.1) {
    const y0 = Math.round(h * 0.39); const sh = Math.round((h * 0.42) / list.length)
    list.forEach((text, i) => { elements.push({ id: `step-dot-${i}`, kind: 'rect', x: m, y: y0 + i * sh + 6, w: 42, h: 42, fill: brand.colors.accentBlue, radius: 21 }); elements.push({ id: `step-${i}`, kind: 'text', x: m + 66, y: y0 + i * sh, w: w - m * 2 - 66, h: sh - 6, text, fontSize: supportSize(w, h), fontFamily: brand.fonts.body, fontWeight: 550, color: brand.colors.textOnDark }) })
  } else {
    const y0 = Math.round(h * 0.47); const gap = Math.round(w * 0.016); const sw = Math.round((w - m * 2 - gap * (list.length - 1)) / list.length)
    list.forEach((text, i) => { const x = m + i * (sw + gap); elements.push({ id: `step-box-${i}`, kind: 'rect', x, y: y0, w: sw, h: Math.round(h * 0.28), fill: i === list.length - 1 ? brand.colors.navySoft : brand.colors.navyPanel, stroke: brand.colors.line, strokeWidth: 2, radius: 22 }); elements.push({ id: `step-${i}`, kind: 'text', x: x + 22, y: y0 + 58, w: sw - 44, h: Math.round(h * 0.16), text, fontSize: Math.max(20, supportSize(w, h) - 4), fontFamily: brand.fonts.body, fontWeight: 550, color: brand.colors.textOnDark }) })
  }
  elements.push(footer(w, h, true)); return base(seed, 'process_steps', formatKey, brand.colors.navy, elements)
}

function caseResult(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width: w, height: h } = fmt(formatKey); const m = safe(w, h); const mt = metric(seed)
  return base(seed, 'case_result', formatKey, brand.colors.paper, [
    logo(w, h, false), tag('case-tag', 'Business case', m, Math.round(h * 0.20), 210, false),
    { id: 'headline', kind: 'text', role: 'headline', x: m, y: Math.round(h * 0.29), w: w - m * 2, h: Math.round(h * 0.20), text: clamp(seed.title, 120), fontSize: titleSize(w, h, 0.64), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.ink },
    { id: 'problem', kind: 'text', x: m, y: Math.round(h * 0.58), w: Math.round(w * 0.44), h: Math.round(h * 0.18), text: support(seed), fontSize: Math.max(22, supportSize(w, h) - 3), fontFamily: brand.fonts.body, color: brand.colors.slate },
    { id: 'result-box', kind: 'rect', x: Math.round(w * 0.57), y: Math.round(h * 0.54), w: w - Math.round(w * 0.57) - m, h: Math.round(h * 0.25), fill: brand.colors.navy, radius: 24 },
    { id: 'result', kind: 'metric', x: Math.round(w * 0.60), y: Math.round(h * 0.58), w: w - Math.round(w * 0.60) - m - 20, h: Math.round(h * 0.17), value: mt?.value || '→', label: mt?.label || 'A clearer decision system', fontSize: Math.round(Math.min(w, h) * 0.075), fontFamily: brand.fonts.body, fontWeight: 800, color: brand.colors.accentBlue },
    footer(w, h, false),
  ])
}

function article(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width: w, height: h } = fmt(formatKey); const m = safe(w, h)
  return base(seed, 'article_editorial', formatKey, brand.colors.navy, [
    logo(w, h, true),
    { id: 'eyebrow', kind: 'text', x: m, y: Math.round(h * 0.25), w: w - m * 2, h: 36, text: `${(seed.content_family || 'KNOWLEDGE').toUpperCase()}  ·  ${(seed.language || 'EN').toUpperCase()}`, fontSize: 20, fontFamily: brand.fonts.body, fontWeight: 750, color: brand.colors.accentBlue },
    { id: 'headline', kind: 'text', role: 'headline', x: m, y: Math.round(h * 0.34), w: Math.round(w * 0.74), h: Math.round(h * 0.34), text: clamp(seed.title, 180), fontSize: titleSize(w, h, 0.78), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.textOnDark },
    { id: 'support', kind: 'text', x: m, y: Math.round(h * 0.73), w: Math.round(w * 0.72), h: Math.round(h * 0.12), text: support(seed), fontSize: supportSize(w, h), fontFamily: brand.fonts.body, color: brand.colors.mutedOnDark },
    { id: 'graphic', kind: 'rect', x: Math.round(w * 0.82), y: Math.round(h * 0.29), w: Math.round(w * 0.10), h: Math.round(h * 0.47), fill: brand.colors.navyPanelAlt, stroke: brand.colors.line, strokeWidth: 2, radius: 28 },
    { id: 'graphic-line', kind: 'line', x: Math.round(w * 0.87), y: Math.round(h * 0.36), w: 0, h: Math.round(h * 0.32), stroke: brand.colors.accentBlue, strokeWidth: 6 },
    footer(w, h, true),
  ])
}

function imageLed(seed: VisualStudioContentSeed, formatKey: VisualFormatKey): VisualDesign {
  const { width: w, height: h } = fmt(formatKey); const m = safe(w, h)
  return base(seed, 'image_only_statement', formatKey, brand.colors.navy, [
    logo(w, h, true),
    { id: 'frame', kind: 'rect', x: m, y: Math.round(h * 0.20), w: w - m * 2, h: Math.round(h * 0.61), fill: brand.colors.navyPanel, stroke: brand.colors.line, strokeWidth: 2, radius: 30 },
    { id: 'statement', kind: 'text', role: 'headline', x: m + 42, y: Math.round(h * 0.28), w: w - m * 2 - 84, h: Math.round(h * 0.34), text: clamp(seed.title, 200), fontSize: titleSize(w, h, 0.88), fontFamily: brand.fonts.display, fontWeight: 600, color: brand.colors.textOnDark },
    { id: 'support', kind: 'text', x: m + 42, y: Math.round(h * 0.66), w: w - m * 2 - 84, h: Math.round(h * 0.10), text: clamp(support(seed), 140), fontSize: supportSize(w, h), fontFamily: brand.fonts.body, color: brand.colors.mutedOnDark },
    footer(w, h, true),
  ], 'image_only')
}

export function createDesignFromTemplate(key: VisualTemplateKey, formatKey: VisualFormatKey, seed: VisualStudioContentSeed): VisualDesign {
  if (key === 'insight_light') return insight(seed, formatKey, false)
  if (key === 'metric_focus') return metricFocus(seed, formatKey)
  if (key === 'comparison_split') return comparison(seed, formatKey)
  if (key === 'process_steps') return process(seed, formatKey)
  if (key === 'case_result') return caseResult(seed, formatKey)
  if (key === 'article_editorial') return article(seed, formatKey)
  if (key === 'image_only_statement') return imageLed(seed, formatKey)
  return insight(seed, formatKey, true)
}

export function recommendTemplates(seed: VisualStudioContentSeed): VisualTemplateKey[] {
  const source = `${seed.title} ${seed.body || ''}`.toLowerCase(); const result: VisualTemplateKey[] = []
  if (metric(seed)) result.push('metric_focus', 'case_result')
  if (/\b(vs\.?|versus|before|after|instead|rather than|not\b|trade-?off)/i.test(source)) result.push('comparison_split')
  if (/\b(process|framework|steps?|workflow|system|sequence|decision|horizon|pipeline)\b/i.test(source) || steps(seed).length >= 3) result.push('process_steps')
  if (seed.content_type === 'article') result.push('article_editorial')
  result.push('insight_dark', 'insight_light', 'image_only_statement')
  return Array.from(new Set(result)).slice(0, 4)
}

export function adaptDesignToFormat(design: VisualDesign, formatKey: VisualFormatKey): VisualDesign {
  const old = fmt(design.formatKey); const next = fmt(formatKey); const sx = next.width / old.width; const sy = next.height / old.height; const fs = Math.sqrt(sx * sy)
  return { ...design, formatKey, elements: design.elements.map((el) => ({ ...el, x: Math.round(el.x * sx), y: Math.round(el.y * sy), w: Math.round(el.w * sx), h: Math.round(el.h * sy), fontSize: el.fontSize ? Math.max(12, Math.round(el.fontSize * fs)) : el.fontSize, strokeWidth: el.strokeWidth ? Math.max(1, Math.round(el.strokeWidth * fs)) : el.strokeWidth, radius: el.radius ? Math.round(el.radius * fs) : el.radius })) }
}

let elementSequence = 0
function uid(prefix: string) { elementSequence += 1; return `${prefix}-${Date.now()}-${elementSequence}` }
export function duplicateElement(el: VisualElement): VisualElement { return { ...el, id: uid(`${el.id}-copy`), x: el.x + 24, y: el.y + 24, locked: false } }
export function emptyTextElement(formatKey: VisualFormatKey): VisualElement { const { width: w, height: h } = fmt(formatKey); return { id: uid('text'), kind: 'text', x: Math.round(w * 0.12), y: Math.round(h * 0.45), w: Math.round(w * 0.50), h: Math.round(h * 0.16), text: 'New text', fontSize: Math.round(Math.min(w, h) * 0.04), fontFamily: brand.fonts.body, fontWeight: 500, color: brand.colors.textOnDark } }
export function emptyMetricElement(formatKey: VisualFormatKey): VisualElement { const { width: w, height: h } = fmt(formatKey); return { id: uid('metric'), kind: 'metric', x: Math.round(w * 0.12), y: Math.round(h * 0.45), w: Math.round(w * 0.40), h: Math.round(h * 0.20), value: '42%', label: 'Metric label', fontSize: Math.round(Math.min(w, h) * 0.10), fontFamily: brand.fonts.body, fontWeight: 800, color: brand.colors.accentBlue } }
export function emptyRectElement(formatKey: VisualFormatKey): VisualElement { const { width: w, height: h } = fmt(formatKey); return { id: uid('rect'), kind: 'rect', x: Math.round(w * 0.20), y: Math.round(h * 0.36), w: Math.round(w * 0.42), h: Math.round(h * 0.24), fill: brand.colors.navyPanel, stroke: brand.colors.line, strokeWidth: 2, radius: 24, opacity: 1 } }
export function emptyLineElement(formatKey: VisualFormatKey): VisualElement { const { width: w, height: h } = fmt(formatKey); return { id: uid('line'), kind: 'line', x: Math.round(w * 0.20), y: Math.round(h * 0.52), w: Math.round(w * 0.40), h: 0, stroke: brand.colors.accentBlue, strokeWidth: 4, opacity: 1 } }
export function emptyLogoElement(formatKey: VisualFormatKey): VisualElement { const { width: w, height: h } = fmt(formatKey); return { ...logo(w, h, true), id: uid('logo') } }

export { PUBLICATION_MODES, VISUAL_FORMATS, SC_BRAND }
