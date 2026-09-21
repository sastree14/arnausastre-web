'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  adaptDesignToFormat,
  createDesignFromTemplate,
  duplicateElement,
  emptyLineElement,
  emptyLogoElement,
  emptyMetricElement,
  emptyRectElement,
  emptyTextElement,
  recommendTemplates,
  PUBLICATION_MODES,
  SC_BRAND,
  VISUAL_FORMATS,
  VISUAL_TEMPLATES,
  type VisualDesign,
  type VisualElement,
  type VisualStudioContentSeed,
  type VisualTemplateKey,
} from '@/lib/visual-studio'
import {
  contentTypeLabel,
  defaultVisualFormat,
  defaultVisualTemplate,
  enhanceVisualDesign,
  isArticleContentType,
  isLinkedInArticleType,
} from '@/lib/visual-studio-v3'
import type { PublicationMode, VisualFormatKey } from '@/lib/brand-system'

type SavedDesign = {
  design_id: string
  content_id?: string | null
  name: string
  template_key: VisualTemplateKey
  format_key: VisualFormatKey
  publication_mode: PublicationMode
  design_json: VisualDesign
  asset_path?: string
  status?: string
  is_template?: boolean
  updated_at?: string
}

type Props = {
  content: VisualStudioContentSeed[]
  savedDesigns: SavedDesign[]
  initialContentId?: string
  returnTo?: string
}

type DragState = {
  id: string
  startX: number
  startY: number
  originX: number
  originY: number
} | null

type Notice = { tone: 'info' | 'success' | 'error'; text: string } | null
type PointerLike = { clientX: number; clientY: number }

const QUICK_PRESETS: Array<{ label: string; description: string; template: VisualTemplateKey; mode: PublicationMode }> = [
  { label: 'Insight ejecutivo', description: 'Tesis + soporte con jerarquía clara.', template: 'insight_dark', mode: 'text_with_visual' },
  { label: 'Métrica / resultado', description: 'Dato protagonista con contexto.', template: 'metric_focus', mode: 'text_with_visual' },
  { label: 'Proceso / framework', description: 'Pasos conectados con flechas.', template: 'process_steps', mode: 'text_with_visual' },
  { label: 'Comparación', description: 'Dos marcos enfrentados.', template: 'comparison_split', mode: 'text_with_visual' },
  { label: 'Artículo / hero', description: 'Portada horizontal editorial.', template: 'article_editorial', mode: 'text_with_visual' },
  { label: 'Statement', description: 'Hook visual dominante.', template: 'image_only_statement', mode: 'visual_first' },
]

const palette = Array.from(new Set(Object.values(SC_BRAND.colors))).slice(0, 14)
const cloneDesign = (value: VisualDesign) => JSON.parse(JSON.stringify(value)) as VisualDesign
const isTypingTarget = (target: EventTarget | null) => target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)

function buildDesign(seed: VisualStudioContentSeed, template?: VisualTemplateKey, format?: VisualFormatKey, mode?: PublicationMode) {
  const templateKey = template || (isArticleContentType(seed.content_type) ? defaultVisualTemplate(seed) : recommendTemplates(seed)[0] || defaultVisualTemplate(seed))
  const formatKey = format || defaultVisualFormat(seed)
  return enhanceVisualDesign(
    createDesignFromTemplate(templateKey, formatKey, { ...seed, publication_mode: mode || seed.publication_mode }),
    seed,
  )
}

function wrapText(text: string, width: number, fontSize: number) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  const chars = Math.max(7, Math.floor(width / Math.max(8, fontSize * 0.53)))
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > chars && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

function fittedText(element: VisualElement) {
  let size = Math.max(14, Number(element.fontSize || 32))
  let lines = wrapText(element.text || '', element.w, size)
  while (size > 14) {
    const lineHeight = size * 1.16
    const maxLines = Math.max(1, Math.floor(Math.max(element.h, size * 1.2) / lineHeight))
    if (lines.length <= maxLines) break
    size -= 2
    lines = wrapText(element.text || '', element.w, size)
  }
  return { size, lines }
}

function SvgElement({ element }: { element: VisualElement }) {
  if (element.hidden) return null
  if (element.kind === 'rect') {
    return <rect x={element.x} y={element.y} width={element.w} height={element.h} rx={element.radius || 0} fill={element.fill || 'transparent'} stroke={element.stroke || 'none'} strokeWidth={element.strokeWidth || 0} opacity={element.opacity ?? 1}/>
  }
  if (element.kind === 'line') {
    return <line x1={element.x} y1={element.y} x2={element.x + element.w} y2={element.y + element.h} stroke={element.stroke || SC_BRAND.colors.accentBlue} strokeWidth={element.strokeWidth || 3} opacity={element.opacity ?? 1} strokeLinecap="round" markerEnd={element.role === 'flow-arrow' ? 'url(#flow-arrow-head)' : undefined}/>
  }
  if (element.kind === 'logo') {
    const href = element.src || SC_BRAND.logos.horizontal
    if (element.role === 'brand' && element.color) {
      const maskId = `logo-mask-${element.id.replace(/[^a-z0-9_-]/gi, '-')}`
      return <g opacity={element.opacity ?? 1}><defs><mask id={maskId}><image href={href} x={element.x} y={element.y} width={element.w} height={element.h} preserveAspectRatio="xMinYMid meet"/></mask></defs><rect x={element.x} y={element.y} width={element.w} height={element.h} fill={element.color} mask={`url(#${maskId})`}/></g>
    }
    return <image href={href} x={element.x} y={element.y} width={element.w} height={element.h} preserveAspectRatio={element.role === 'illustration' ? 'xMidYMid slice' : 'xMinYMid meet'} opacity={element.opacity ?? 1}/>
  }
  if (element.kind === 'metric') {
    const size = element.fontSize || 90
    const labelSize = Math.max(17, Math.round(size * 0.26))
    const lines = wrapText(element.label || '', element.w, labelSize)
    return <g opacity={element.opacity ?? 1}><text x={element.x} y={element.y + size} fill={element.color || SC_BRAND.colors.accentBlue} fontFamily={element.fontFamily || SC_BRAND.fonts.body} fontSize={size} fontWeight={element.fontWeight || 800}>{element.value || '42%'}</text><text x={element.x} y={element.y + size + labelSize * 1.7} fill={SC_BRAND.colors.mutedOnDark} fontFamily={element.fontFamily || SC_BRAND.fonts.body} fontSize={labelSize} fontWeight={550}>{lines.map((line, index) => <tspan key={index} x={element.x} dy={index === 0 ? 0 : labelSize * 1.25}>{line}</tspan>)}</text></g>
  }
  if (element.kind === 'tag') {
    const size = element.fontSize || 18
    return <g opacity={element.opacity ?? 1}><rect x={element.x} y={element.y} width={element.w} height={element.h} rx={element.radius || element.h / 2} fill={element.fill || SC_BRAND.colors.navySoft}/><text x={element.x + element.w / 2} y={element.y + element.h / 2 + size * 0.34} fill={element.color || SC_BRAND.colors.accentBlue} fontFamily={element.fontFamily || SC_BRAND.fonts.body} fontSize={size} fontWeight={element.fontWeight || 700} textAnchor="middle">{element.text || ''}</text></g>
  }
  const { size, lines } = fittedText(element)
  const lineHeight = size * 1.16
  const anchor = element.align === 'center' ? 'middle' : element.align === 'right' ? 'end' : 'start'
  const x = element.align === 'center' ? element.x + element.w / 2 : element.align === 'right' ? element.x + element.w : element.x
  return <text x={x} y={element.y + size} fill={element.color || SC_BRAND.colors.textOnDark} fontFamily={element.fontFamily || SC_BRAND.fonts.body} fontSize={size} fontWeight={element.fontWeight || 500} textAnchor={anchor} opacity={element.opacity ?? 1}>{lines.map((line, index) => <tspan key={`${element.id}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>{line}</tspan>)}</text>
}

function Canvas({ design, selectedId, onSelect, onPointerDown, svgRef, selection = true }: {
  design: VisualDesign
  selectedId?: string
  onSelect?: (id: string) => void
  onPointerDown?: (event: React.PointerEvent<SVGGElement>, element: VisualElement) => void
  svgRef?: React.RefObject<SVGSVGElement | null>
  selection?: boolean
}) {
  const format = VISUAL_FORMATS[design.formatKey]
  const selected = design.elements.find((element) => element.id === selectedId)
  return <svg ref={svgRef} viewBox={`0 0 ${format.width} ${format.height}`} width={format.width} height={format.height} className="h-auto w-full bg-white"><defs><marker id="flow-arrow-head" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={SC_BRAND.colors.accentBlue}/></marker></defs><rect x="0" y="0" width={format.width} height={format.height} fill={design.background}/>{design.elements.map((element) => <g key={element.id} onPointerDown={onPointerDown ? (event) => onPointerDown(event, element) : undefined} onClick={() => onSelect?.(element.id)} className={onPointerDown && !element.locked ? 'cursor-move' : ''}><SvgElement element={element}/>{selection && selected?.id === element.id && !element.hidden && <rect data-selection="true" x={element.x - 7} y={element.y - 7} width={element.w + 14} height={element.h + 14} fill="none" stroke="#38BDF8" strokeWidth={3} strokeDasharray="12 8" pointerEvents="none"/>}</g>)}</svg>
}

function previewInline(value: string) {
  return String(value || '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[\*_\`]+/g, '')
    .trim()
}

function ArticlePreviewBody({ body }: { body: string }) {
  const lines = String(body || '').split('\n')
  const nodes: React.ReactNode[] = []
  let bullets: string[] = []

  const flushBullets = () => {
    if (!bullets.length) return
    nodes.push(<ul key={`preview-list-${nodes.length}`} className="my-3 list-disc space-y-1 pl-5">{bullets.map((item, index) => <li key={`${item}-${index}`}>{previewInline(item)}</li>)}</ul>)
    bullets = []
  }

  lines.forEach((raw, index) => {
    const line = raw.trim()
    if (line.startsWith('- ')) {
      bullets.push(line.slice(2))
      return
    }
    flushBullets()
    if (!line) return
    if (line.startsWith('### ')) nodes.push(<h4 key={index} className="mb-1 mt-4 text-sm font-semibold text-slate-900">{previewInline(line.slice(4))}</h4>)
    else if (line.startsWith('## ')) nodes.push(<h3 key={index} className="mb-1 mt-5 text-base font-semibold text-slate-900">{previewInline(line.slice(3))}</h3>)
    else if (line.startsWith('# ')) nodes.push(<h3 key={index} className="mb-1 mt-5 text-base font-semibold text-slate-900">{previewInline(line.slice(2))}</h3>)
    else nodes.push(<p key={index} className="my-2">{previewInline(line)}</p>)
  })
  flushBullets()
  return <div className="mt-4 max-h-56 overflow-auto text-sm leading-6 text-slate-600">{nodes}</div>
}

function PublicationPreview({ seed, design }: { seed: VisualStudioContentSeed; design: VisualDesign }) {
  const showVisual = design.publicationMode !== 'text_only'
  if (isLinkedInArticleType(seed.content_type)) {
    return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"><div className="border-b border-slate-100 p-4"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-sky-700">LinkedIn article preview</p><p className="mt-1 text-xs text-slate-500">Portada + título + cuerpo largo</p></div>{showVisual && <Canvas design={design} selection={false}/>}<div className="p-5"><h3 className="text-xl font-semibold">{seed.title}</h3><ArticlePreviewBody body={seed.body || ''}/></div></div>
  }
  if (isArticleContentType(seed.content_type)) {
    return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm">{showVisual && <Canvas design={design} selection={false}/>}<div className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-indigo-600">Artículo web</p><h3 className="mt-2 text-xl font-semibold">{seed.title}</h3><ArticlePreviewBody body={seed.body || ''}/></div></div>
  }
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"><div className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">AS</div><div><p className="text-sm font-semibold">Arnau Sastre · SC-Analytics</p><p className="text-[11px] text-slate-500">LinkedIn post preview</p></div></div>{showVisual && <Canvas design={design} selection={false}/>}<div className="p-4"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{design.publicationMode === 'image_only' ? 'SC-Analytics · Comprender antes de construir.' : seed.body}</p></div></div>
}

export default function VisualStudioClientV3({ content, savedDesigns, initialContentId, returnTo = '/growth-admin/content#publications' }: Props) {
  const router = useRouter()
  const preferred = content.find((item) => item.content_id === initialContentId) || content[0]
  const [contentId, setContentId] = useState(preferred?.content_id || '')
  const seed = useMemo(() => content.find((item) => item.content_id === contentId) || preferred, [content, contentId, preferred])
  const initial = preferred ? buildDesign(preferred) : createDesignFromTemplate('insight_dark', 'linkedin_square', { content_id: 'draft', title: 'Comprender antes de construir.', body: '', channel: 'manual', content_type: 'linkedin_post' })
  const [design, setDesign] = useState<VisualDesign>(initial)
  const designRef = useRef(initial)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const undoStack = useRef<VisualDesign[]>([])
  const redoStack = useRef<VisualDesign[]>([])
  const [selectedId, setSelectedId] = useState(initial.elements.find((element) => element.role === 'headline')?.id || '')
  const [drag, setDrag] = useState<DragState>(null)
  const [zoom, setZoom] = useState(85)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState<Notice>(null)
  const [saved, setSaved] = useState(savedDesigns)
  const selected = design.elements.find((element) => element.id === selectedId) || null
  const format = VISUAL_FORMATS[design.formatKey]
  const suggestions = seed ? Array.from(new Set([...(isArticleContentType(seed.content_type) ? ['article_editorial' as VisualTemplateKey] : []), ...recommendTemplates(seed)])) : []

  useEffect(() => { designRef.current = design }, [design])

  function setDirect(next: VisualDesign) {
    designRef.current = next
    setDesign(next)
  }

  function snapshot() {
    undoStack.current = [...undoStack.current.slice(-59), cloneDesign(designRef.current)]
    redoStack.current = []
  }

  function mutate(fn: (current: VisualDesign) => VisualDesign, record = true) {
    if (record) snapshot()
    setDirect(fn(designRef.current))
  }

  function updateElement(id: string, changes: Partial<VisualElement>, record = true) {
    mutate((current) => ({ ...current, elements: current.elements.map((element) => element.id === id ? { ...element, ...changes } : element) }), record)
  }

  function undo() {
    const previous = undoStack.current.pop()
    if (!previous) return
    redoStack.current.push(cloneDesign(designRef.current))
    setDirect(previous)
  }

  function redo() {
    const next = redoStack.current.pop()
    if (!next) return
    undoStack.current.push(cloneDesign(designRef.current))
    setDirect(next)
  }

  function chooseContent(nextId: string) {
    const next = content.find((item) => item.content_id === nextId)
    if (!next) return
    const nextDesign = buildDesign(next)
    snapshot()
    setContentId(nextId)
    setDirect(nextDesign)
    setSelectedId(nextDesign.elements.find((element) => element.role === 'headline')?.id || '')
    setZoom(85)
    router.replace(`/growth-admin/visual-studio?content=${encodeURIComponent(nextId)}&return_to=${encodeURIComponent(returnTo)}`, { scroll: false })
  }

  function applyTemplate(template: VisualTemplateKey, mode = design.publicationMode) {
    if (!seed) return
    const next = buildDesign(seed, template, design.formatKey, mode)
    snapshot()
    setDirect(next)
    setSelectedId(next.elements.find((element) => element.role === 'headline')?.id || '')
    setNotice({ tone: 'success', text: `Plantilla aplicada: ${VISUAL_TEMPLATES.find((row) => row.key === template)?.label || template}.` })
  }

  function changeFormat(formatKey: VisualFormatKey) {
    if (!seed) return
    snapshot()
    setDirect(enhanceVisualDesign(adaptDesignToFormat(designRef.current, formatKey), seed))
  }

  function addElement(kind: 'text' | 'metric' | 'rect' | 'line') {
    const element = kind === 'metric' ? emptyMetricElement(design.formatKey) : kind === 'rect' ? emptyRectElement(design.formatKey) : kind === 'line' ? emptyLineElement(design.formatKey) : emptyTextElement(design.formatKey)
    mutate((current) => ({ ...current, elements: [...current.elements, element] }))
    setSelectedId(element.id)
  }

  async function addImage(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    const base = emptyLogoElement(design.formatKey)
    const width = Math.round(format.width * 0.38)
    const element: VisualElement = { ...base, id: `illustration-${Date.now()}`, role: 'illustration', src: dataUrl, locked: false, x: Math.round(format.width * 0.56), y: Math.round(format.height * 0.33), w: width, h: Math.round(format.height * 0.38) }
    mutate((current) => ({ ...current, elements: [...current.elements, element] }))
    setSelectedId(element.id)
    setNotice({ tone: 'success', text: 'Imagen añadida dentro del diseño.' })
  }

  function removeSelected() {
    if (!selected || selected.role === 'brand' || selected.role === 'flow-arrow') return
    mutate((current) => ({ ...current, elements: current.elements.filter((element) => element.id !== selected.id) }))
    setSelectedId('')
  }

  function duplicateSelected() {
    if (!selected || selected.role === 'brand' || selected.role === 'flow-arrow') return
    const copy = duplicateElement(selected)
    mutate((current) => ({ ...current, elements: [...current.elements, copy] }))
    setSelectedId(copy.id)
  }

  function moveSelected(dx: number, dy: number) {
    if (!selected || selected.locked) return
    updateElement(selected.id, {
      x: Math.max(0, Math.min(format.width - selected.w, selected.x + dx)),
      y: Math.max(0, Math.min(format.height - selected.h, selected.y + dy)),
    })
  }

  function pointerPoint(event: PointerLike) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (event.clientX - rect.left) * format.width / rect.width,
      y: (event.clientY - rect.top) * format.height / rect.height,
    }
  }

  function startDrag(event: React.PointerEvent<SVGGElement>, element: VisualElement) {
    event.stopPropagation()
    setSelectedId(element.id)
    if (element.locked) return
    const point = pointerPoint(event)
    snapshot()
    setDrag({ id: element.id, startX: point.x, startY: point.y, originX: element.x, originY: element.y })
  }

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag) return
    const element = designRef.current.elements.find((row) => row.id === drag.id)
    if (!element) return
    const point = pointerPoint(event)
    updateElement(element.id, {
      x: Math.round(Math.max(0, Math.min(format.width - element.w, drag.originX + point.x - drag.startX))),
      y: Math.round(Math.max(0, Math.min(format.height - element.h, drag.originY + point.y - drag.startY))),
    }, false)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return
      const mod = event.ctrlKey || event.metaKey
      if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return }
      if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); return }
      if (mod && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateSelected(); return }
      if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); removeSelected(); return }
      const step = event.shiftKey ? 10 : 1
      if (event.key === 'ArrowLeft') { event.preventDefault(); moveSelected(-step, 0) }
      if (event.key === 'ArrowRight') { event.preventDefault(); moveSelected(step, 0) }
      if (event.key === 'ArrowUp') { event.preventDefault(); moveSelected(0, -step) }
      if (event.key === 'ArrowDown') { event.preventDefault(); moveSelected(0, step) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  async function serializeSvg() {
    if (!svgRef.current) throw new Error('Canvas no disponible')
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement
    clone.querySelectorAll('[data-selection]').forEach((node) => node.remove())
    const images = Array.from(clone.querySelectorAll('image'))
    await Promise.all(images.map(async (image) => {
      const href = image.getAttribute('href') || ''
      if (!href || href.startsWith('data:')) return
      try {
        const response = await fetch(href)
        if (!response.ok) return
        const blob = await response.blob()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ''))
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        image.setAttribute('href', dataUrl)
      } catch {
        // External images are optional; export can continue without inlining them.
      }
    }))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    return new XMLSerializer().serializeToString(clone)
  }

  async function exportPng() {
    const source = await serializeSvg()
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    try {
      const image = new Image()
      image.decoding = 'async'
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject; image.src = url })
      const canvas = document.createElement('canvas')
      canvas.width = format.width
      canvas.height = format.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas 2D no disponible')
      context.drawImage(image, 0, 0, format.width, format.height)
      return canvas.toDataURL('image/png')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function saveDesign(asTemplate: boolean) {
    setBusy(asTemplate ? 'template' : 'save')
    try {
      const current = designRef.current
      const response = await fetch('/api/growth-admin/visual-studio/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: current.designId,
          contentId: asTemplate ? null : contentId,
          name: current.name,
          templateKey: current.templateKey,
          formatKey: current.formatKey,
          publicationMode: current.publicationMode,
          design: current,
          isTemplate: asTemplate,
        }),
      })
      if (!response.ok) throw new Error(await response.text())
      const result = await response.json()
      const next = { ...current, designId: result.designId, status: asTemplate ? 'template' : 'draft' }
      setDirect(next)
      setSaved((rows) => [{ design_id: result.designId, content_id: asTemplate ? null : contentId, name: next.name, template_key: next.templateKey, format_key: next.formatKey, publication_mode: next.publicationMode, design_json: next, status: next.status, is_template: asTemplate }, ...rows.filter((row) => row.design_id !== result.designId)])
      setNotice({ tone: 'success', text: asTemplate ? 'Plantilla guardada.' : 'Borrador guardado.' })
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'No se pudo guardar.' })
    } finally {
      setBusy('')
    }
  }

  async function attach() {
    if (!seed) return
    setBusy('attach')
    try {
      const pngDataUrl = await exportPng()
      const current = designRef.current
      const response = await fetch('/api/growth-admin/visual-studio/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: current.designId,
          contentId,
          name: current.name,
          templateKey: current.templateKey,
          formatKey: current.formatKey,
          publicationMode: current.publicationMode,
          design: current,
          pngDataUrl,
        }),
      })
      if (!response.ok) throw new Error(await response.text())
      const result = await response.json()
      setDirect({ ...current, designId: result.designId, assetPath: result.assetPath, status: 'attached' })
      setNotice({ tone: 'success', text: 'Visual adjuntado. La publicación ya usa este diseño.' })
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'No se pudo adjuntar.' })
    } finally {
      setBusy('')
    }
  }

  function loadSaved(item: SavedDesign) {
    if (!seed || !item.design_json?.elements) return
    snapshot()
    const loaded = enhanceVisualDesign({ ...cloneDesign(item.design_json), designId: item.design_id, contentId: seed.content_id }, seed)
    setDirect(loaded)
    setSelectedId(loaded.elements.find((element) => element.role === 'headline')?.id || '')
    setNotice({ tone: 'success', text: `Diseño cargado: ${item.name}.` })
  }

  if (!seed) return <div className="p-8 text-sm text-slate-500">No hay publicaciones disponibles para diseñar.</div>

  const articleMode = isArticleContentType(seed.content_type)
  const usablePresets = QUICK_PRESETS.filter((preset) => !articleMode || ['article_editorial', 'process_steps', 'comparison_split'].includes(preset.template))

  return <main className="min-h-screen bg-[#050816] text-slate-100">
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-[1900px] flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3"><a href={returnTo} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">← Volver</a><img src={SC_BRAND.logos.white} alt="SC-Analytics" className="h-11 w-44 object-contain object-left"/><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-sky-300">Sistema visual privado · V3</p><h1 className="text-xl font-semibold">Visual Studio</h1></div></div>
        <div className="flex flex-wrap gap-2"><button onClick={undo} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">↶</button><button onClick={redo} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">↷</button><button onClick={() => saveDesign(false)} disabled={Boolean(busy)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">{busy === 'save' ? 'Guardando…' : 'Guardar'}</button><button onClick={() => saveDesign(true)} disabled={Boolean(busy)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">Guardar plantilla</button><a href={`/growth-admin/preview/${encodeURIComponent(contentId)}`} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">Ver publicación</a><button onClick={attach} disabled={Boolean(busy)} className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-950">{busy === 'attach' ? 'Adjuntando…' : 'Adjuntar visual'}</button></div>
      </div>
    </header>

    <div className="mx-auto grid max-w-[1900px] 2xl:grid-cols-[330px_minmax(620px,1fr)_380px]">
      <aside className="border-r border-slate-800 bg-slate-950/70 p-5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Publicación<select value={contentId} onChange={(event) => chooseContent(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">{content.map((item) => <option key={item.content_id} value={item.content_id}>{contentTypeLabel(item)} · {(item.language || '—').toUpperCase()} · {item.title.slice(0, 52)}</option>)}</select></label>
        <div className="mt-3 rounded-xl border border-sky-900/60 bg-sky-950/20 p-3"><p className="text-xs font-semibold text-white">{seed.title}</p><p className="mt-2 text-[10px] text-slate-500">{contentTypeLabel(seed)} · {(seed.language || '—').toUpperCase()}</p></div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Presentaciones rápidas</p>
        <div className="mt-2 grid gap-2">{usablePresets.map((preset) => <button key={preset.label} onClick={() => applyTemplate(preset.template, preset.mode)} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-left hover:border-slate-700"><p className="text-xs font-semibold">{preset.label}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{preset.description}</p></button>)}</div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Sugeridas para este contenido</p>
        <div className="mt-2 flex flex-wrap gap-2">{suggestions.map((key) => <button key={key} onClick={() => applyTemplate(key)} className={`rounded-full border px-3 py-1.5 text-[10px] ${design.templateKey === key ? 'border-sky-500 text-sky-300' : 'border-slate-700 text-slate-400'}`}>{VISUAL_TEMPLATES.find((row) => row.key === key)?.label || key}</button>)}</div>

        {!articleMode && <><p className="mt-6 text-[10px] font-semibold uppercase tracking-wide text-slate-500">LinkedIn · imagen + texto</p><div className="mt-2 grid grid-cols-2 gap-2">{(Object.entries(PUBLICATION_MODES) as Array<[PublicationMode, (typeof PUBLICATION_MODES)[PublicationMode]]>).map(([key, item]) => <button key={key} onClick={() => mutate((current) => ({ ...current, publicationMode: key }))} className={`rounded-lg border p-2 text-left text-[10px] ${design.publicationMode === key ? 'border-sky-500 bg-sky-950/30' : 'border-slate-800'}`}>{item.label}</button>)}</div><p className="mt-2 text-[10px] leading-4 text-slate-500">{PUBLICATION_MODES[design.publicationMode].description}</p></>}

        {saved.length > 0 && <details className="mt-6"><summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wide text-slate-500">Diseños guardados ({saved.length})</summary><div className="mt-2 max-h-56 space-y-2 overflow-auto">{saved.slice(0, 30).map((item) => <button key={item.design_id} onClick={() => loadSaved(item)} className="w-full rounded-lg border border-slate-800 p-2 text-left text-xs text-slate-400 hover:border-slate-700">{item.name}</button>)}</div></details>}
      </aside>

      <section className="min-w-0 p-5 md:p-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Formato<select value={design.formatKey} onChange={(event) => changeFormat(event.target.value as VisualFormatKey)} className="mt-1 block rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">{Object.values(VISUAL_FORMATS).map((row) => <option key={row.key} value={row.key}>{row.label} · {row.width}×{row.height}</option>)}</select></label><div className="flex flex-wrap gap-2"><button onClick={() => setZoom((value) => Math.max(45, value - 10))} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">−</button><span className="px-2 py-2 text-xs text-slate-500">{zoom}%</span><button onClick={() => setZoom((value) => Math.min(140, value + 10))} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+</button><button onClick={() => addElement('text')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Texto</button><button onClick={() => addElement('metric')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Métrica</button><button onClick={() => addElement('rect')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Forma</button><button onClick={() => addElement('line')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Flecha/línea</button><button onClick={() => imageInputRef.current?.click()} className="rounded-lg border border-sky-800 bg-sky-950/30 px-3 py-2 text-xs text-sky-300">+ Imagen</button><input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void addImage(file); event.currentTarget.value = '' }}/></div></div>

        <div className="flex min-h-[620px] items-center justify-center overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-5"><div style={{ width: `${zoom}%`, minWidth: 320 }} onPointerMove={handleMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}><Canvas design={design} selectedId={selectedId} onSelect={setSelectedId} onPointerDown={startDrag} svgRef={svgRef}/></div></div>
        <div className={`mt-3 rounded-xl border p-3 text-xs ${notice?.tone === 'success' ? 'border-emerald-900 bg-emerald-950/20 text-emerald-300' : notice?.tone === 'error' ? 'border-rose-900 bg-rose-950/20 text-rose-300' : 'border-slate-800 text-slate-500'}`}>{notice?.text || 'El hook se muestra completo con ajuste automático de tamaño. Arrastra elementos o usa las flechas del teclado.'}</div>

        <div className="mt-6"><div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-sky-300">Preview final en vivo</p><h2 className="mt-1 text-lg font-semibold">Así verá la pieza el lector</h2></div><span className="rounded-full border border-slate-700 px-3 py-1 text-[10px] text-slate-400">actualización inmediata</span></div><PublicationPreview seed={seed} design={design}/></div>
      </section>

      <aside className="border-l border-slate-800 bg-slate-950/70 p-5">
        <div className="rounded-xl border border-slate-800 p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Marca</p><span className="text-[10px] text-slate-600">logo arriba izquierda</span></div><img src={SC_BRAND.logos.white} alt="SC-Analytics" className="mt-2 h-14 w-52 object-contain object-left"/><div className="mt-3 flex flex-wrap gap-1">{palette.map((color) => <span key={color} className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: color }}/>)}</div></div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Capas</p>
        <div className="mt-2 max-h-48 space-y-1 overflow-auto rounded-lg border border-slate-800 p-2">{[...design.elements].reverse().map((element) => <button key={element.id} onClick={() => setSelectedId(element.id)} className={`flex w-full justify-between rounded px-2 py-1.5 text-left text-xs ${selectedId === element.id ? 'bg-sky-950/50 text-sky-200' : 'text-slate-500'}`}><span className="truncate">{element.role || element.text || element.value || element.kind}</span><span className="text-[9px]">{element.locked ? 'LOCK' : ''}</span></button>)}</div>

        {selected ? <div className="mt-5 space-y-4"><div className="flex gap-2"><button onClick={duplicateSelected} disabled={selected.role === 'brand' || selected.role === 'flow-arrow'} className="rounded-lg border border-slate-700 px-3 py-2 text-xs disabled:opacity-30">Duplicar</button><button onClick={removeSelected} disabled={selected.role === 'brand' || selected.role === 'flow-arrow'} className="rounded-lg border border-rose-900 px-3 py-2 text-xs text-rose-300 disabled:opacity-30">Borrar</button></div>
          {['text', 'tag'].includes(selected.kind) && <label className="block text-[10px] uppercase tracking-wide text-slate-500">Texto<textarea value={selected.text || ''} onFocus={snapshot} onChange={(event) => updateElement(selected.id, { text: event.target.value }, false)} rows={5} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm normal-case text-white"/></label>}
          {selected.kind === 'metric' && <><label className="block text-[10px] uppercase tracking-wide text-slate-500">Valor<input value={selected.value || ''} onFocus={snapshot} onChange={(event) => updateElement(selected.id, { value: event.target.value }, false)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm normal-case text-white"/></label><label className="block text-[10px] uppercase tracking-wide text-slate-500">Etiqueta<textarea value={selected.label || ''} onFocus={snapshot} onChange={(event) => updateElement(selected.id, { label: event.target.value }, false)} rows={3} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm normal-case text-white"/></label></>}
          {selected.kind === 'logo' && selected.role === 'brand' && <><label className="block text-[10px] uppercase tracking-wide text-slate-500">Color del logo<input type="color" value={selected.color || SC_BRAND.colors.white} onChange={(event) => updateElement(selected.id, { color: event.target.value })} className="mt-1 h-10 w-full rounded border border-slate-700 bg-slate-900"/></label><div><p className="text-[10px] uppercase tracking-wide text-slate-500">Tamaño</p><div className="mt-1 grid grid-cols-3 gap-2">{[['Base', 0.28], ['Grande', 0.34], ['XL', 0.40]].map(([label, ratio]) => <button key={String(label)} onClick={() => { const width = Math.round(format.width * Number(ratio)); updateElement(selected.id, { x: Math.max(44, Math.round(Math.min(format.width, format.height) * 0.055)), y: Math.max(44, Math.round(Math.min(format.width, format.height) * 0.055)), w: width, h: Math.round(width * 0.28) }) }} className="rounded-lg border border-slate-700 px-2 py-2 text-[10px]">{label}</button>)}</div></div></>}
          {selected.kind === 'logo' && selected.role === 'illustration' && <label className="block text-[10px] uppercase tracking-wide text-slate-500">Imagen / URL<input value={selected.src || ''} onFocus={snapshot} onChange={(event) => updateElement(selected.id, { src: event.target.value }, false)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs normal-case text-white"/></label>}

          <div className="grid grid-cols-2 gap-2"><label className="text-[10px] uppercase tracking-wide text-slate-500">X<input type="number" value={Math.round(selected.x)} onChange={(event) => updateElement(selected.id, { x: Number(event.target.value) })} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs normal-case text-white"/></label><label className="text-[10px] uppercase tracking-wide text-slate-500">Y<input type="number" value={Math.round(selected.y)} onChange={(event) => updateElement(selected.id, { y: Number(event.target.value) })} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs normal-case text-white"/></label><label className="text-[10px] uppercase tracking-wide text-slate-500">Ancho<input type="number" value={Math.round(selected.w)} onChange={(event) => updateElement(selected.id, { w: Math.max(20, Number(event.target.value)) })} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs normal-case text-white"/></label><label className="text-[10px] uppercase tracking-wide text-slate-500">Alto<input type="number" value={Math.round(selected.h)} onChange={(event) => updateElement(selected.id, { h: Math.max(20, Number(event.target.value)) })} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs normal-case text-white"/></label></div>
          {['text', 'tag', 'metric'].includes(selected.kind) && <><label className="block text-[10px] uppercase tracking-wide text-slate-500">Color<input type="color" value={selected.color || SC_BRAND.colors.white} onChange={(event) => updateElement(selected.id, { color: event.target.value })} className="mt-1 h-9 w-full rounded border border-slate-700 bg-slate-900"/></label><label className="block text-[10px] uppercase tracking-wide text-slate-500">Tamaño tipografía<input type="range" min="14" max="120" value={selected.fontSize || 32} onChange={(event) => updateElement(selected.id, { fontSize: Number(event.target.value) })} className="mt-2 w-full"/></label></>}
          {selected.kind === 'rect' && <label className="block text-[10px] uppercase tracking-wide text-slate-500">Relleno<input type="color" value={selected.fill || SC_BRAND.colors.navySoft} onChange={(event) => updateElement(selected.id, { fill: event.target.value })} className="mt-1 h-9 w-full rounded border border-slate-700 bg-slate-900"/></label>}
          {selected.kind === 'line' && <label className="block text-[10px] uppercase tracking-wide text-slate-500">Color línea<input type="color" value={selected.stroke || SC_BRAND.colors.accentBlue} onChange={(event) => updateElement(selected.id, { stroke: event.target.value })} className="mt-1 h-9 w-full rounded border border-slate-700 bg-slate-900"/></label>}
        </div> : <p className="mt-5 text-xs text-slate-600">Selecciona una capa para editarla.</p>}
      </aside>
    </div>
  </main>
}
