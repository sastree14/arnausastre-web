'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  SC_BRAND,
  VISUAL_FORMATS,
  VISUAL_TEMPLATES,
  PUBLICATION_MODES,
  type VisualDesign,
  type VisualElement,
  type VisualStudioContentSeed,
  type VisualTemplateKey,
} from '@/lib/visual-studio'
import type { PublicationMode, VisualFormatKey } from '@/lib/brand-system'

interface SavedDesign {
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
}

type DragState = { id: string; startX: number; startY: number; originX: number; originY: number } | null
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se'
type ResizeState = {
  id: string
  handle: ResizeHandle
  startX: number
  startY: number
  originX: number
  originY: number
  originW: number
  originH: number
} | null

type Notice = { tone: 'info' | 'success' | 'error'; text: string } | null

const palette = [
  SC_BRAND.colors.navy,
  SC_BRAND.colors.navyPanel,
  SC_BRAND.colors.navyPanelAlt,
  SC_BRAND.colors.navySoft,
  SC_BRAND.colors.accentBlue,
  SC_BRAND.colors.textOnDark,
  SC_BRAND.colors.mutedOnDark,
  SC_BRAND.colors.paper,
  SC_BRAND.colors.ink,
  SC_BRAND.colors.slate,
  SC_BRAND.colors.indigo,
  SC_BRAND.colors.white,
]

const QUICK_PRESETS: Array<{
  label: string
  description: string
  template: VisualTemplateKey
  format: VisualFormatKey
  mode: PublicationMode
}> = [
  { label: 'Post rápido', description: 'Opción segura para la mayoría de publicaciones.', template: 'insight_dark', format: 'linkedin_square', mode: 'text_with_visual' },
  { label: 'Métrica / resultado', description: 'Cuando hay un dato, impacto o resultado protagonista.', template: 'metric_focus', format: 'linkedin_square', mode: 'text_with_visual' },
  { label: 'Framework / proceso', description: 'Para explicar pasos, sistemas o metodología.', template: 'process_steps', format: 'linkedin_square', mode: 'text_with_visual' },
  { label: 'Artículo / hero', description: 'Portada editorial para Knowledge y artículos web.', template: 'article_editorial', format: 'article_hero', mode: 'text_with_visual' },
]

function cloneDesign(value: VisualDesign): VisualDesign {
  return JSON.parse(JSON.stringify(value)) as VisualDesign
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable
}

function wrapText(text: string, width: number, fontSize: number) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (!clean) return ['']
  const chars = Math.max(7, Math.floor(width / Math.max(8, fontSize * 0.54)))
  const words = clean.split(' ')
  const lines: string[] = []
  let line = ''
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word
    if (next.length > chars && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  })
  if (line) lines.push(line)
  return lines.slice(0, 12)
}

function SvgText({ element }: { element: VisualElement }) {
  const size = element.fontSize || 32
  const lines = wrapText(element.text || '', element.w, size)
  const lineHeight = size * 1.16
  const anchor = element.align === 'center' ? 'middle' : element.align === 'right' ? 'end' : 'start'
  const x = element.align === 'center' ? element.x + element.w / 2 : element.align === 'right' ? element.x + element.w : element.x
  return (
    <text x={x} y={element.y + size} fill={element.color || SC_BRAND.colors.textOnDark} fontFamily={element.fontFamily || SC_BRAND.fonts.body} fontSize={size} fontWeight={element.fontWeight || 500} textAnchor={anchor} opacity={element.opacity ?? 1}>
      {lines.map((line, index) => <tspan key={`${element.id}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>{line}</tspan>)}
    </text>
  )
}

function SvgMetric({ element }: { element: VisualElement }) {
  const size = element.fontSize || 90
  const labelSize = Math.max(17, Math.round(size * 0.26))
  const lines = wrapText(element.label || '', element.w, labelSize)
  return (
    <g opacity={element.opacity ?? 1}>
      <text x={element.x} y={element.y + size} fill={element.color || SC_BRAND.colors.accentBlue} fontFamily={element.fontFamily || SC_BRAND.fonts.body} fontSize={size} fontWeight={element.fontWeight || 800}>{element.value || '42%'}</text>
      <text x={element.x} y={element.y + size + labelSize * 1.7} fill={SC_BRAND.colors.mutedOnDark} fontFamily={SC_BRAND.fonts.body} fontSize={labelSize} fontWeight={550}>
        {lines.slice(0, 3).map((line, index) => <tspan key={index} x={element.x} dy={index === 0 ? 0 : labelSize * 1.25}>{line}</tspan>)}
      </text>
    </g>
  )
}

function VisualElementNode({ element }: { element: VisualElement }) {
  if (element.hidden) return null
  if (element.kind === 'rect') return <rect x={element.x} y={element.y} width={element.w} height={element.h} rx={element.radius || 0} fill={element.fill || 'transparent'} stroke={element.stroke || 'none'} strokeWidth={element.strokeWidth || 0} opacity={element.opacity ?? 1} />
  if (element.kind === 'line') return <line x1={element.x} y1={element.y} x2={element.x + element.w} y2={element.y + element.h} stroke={element.stroke || SC_BRAND.colors.accentBlue} strokeWidth={element.strokeWidth || 3} opacity={element.opacity ?? 1} strokeLinecap="round" />
  if (element.kind === 'logo') return <image href={element.src || SC_BRAND.logos.horizontal} x={element.x} y={element.y} width={element.w} height={element.h} preserveAspectRatio="xMinYMid meet" opacity={element.opacity ?? 1} />
  if (element.kind === 'metric') return <SvgMetric element={element} />
  if (element.kind === 'tag') {
    const size = element.fontSize || 18
    return <g opacity={element.opacity ?? 1}><rect x={element.x} y={element.y} width={element.w} height={element.h} rx={element.radius || element.h / 2} fill={element.fill || SC_BRAND.colors.navySoft} stroke={element.stroke || 'none'} /><text x={element.x + element.w / 2} y={element.y + element.h / 2 + size * 0.34} fill={element.color || SC_BRAND.colors.accentBlue} fontFamily={element.fontFamily || SC_BRAND.fonts.body} fontSize={size} fontWeight={element.fontWeight || 700} textAnchor="middle">{element.text || ''}</text></g>
  }
  return <SvgText element={element} />
}

function TemplateThumb({ templateKey, selected }: { templateKey: VisualTemplateKey; selected: boolean }) {
  const dark = ['insight_dark', 'metric_focus', 'process_steps', 'article_editorial', 'image_only_statement'].includes(templateKey)
  return (
    <div className={`relative aspect-[4/3] overflow-hidden rounded-xl border transition ${selected ? 'border-sky-400 ring-1 ring-sky-400/40' : 'border-slate-700 hover:border-slate-500'} ${dark ? 'bg-[#071522]' : 'bg-slate-50'}`}>
      <div className={`absolute left-3 top-3 h-1.5 w-12 rounded-full ${dark ? 'bg-sky-300' : 'bg-indigo-500'}`} />
      {templateKey === 'metric_focus' && <><div className="absolute left-3 top-8 text-2xl font-bold text-sky-300">42%</div><div className="absolute bottom-3 left-3 right-3 h-4 rounded bg-slate-700/50" /></>}
      {templateKey === 'comparison_split' && <div className="absolute inset-x-3 bottom-3 top-8 grid grid-cols-2 gap-2"><div className="rounded bg-slate-200"/><div className="rounded bg-indigo-100"/></div>}
      {templateKey === 'process_steps' && <div className="absolute inset-x-3 bottom-3 top-8 flex gap-1.5">{[1, 2, 3].map((n) => <div key={n} className="flex-1 rounded bg-slate-800" />)}</div>}
      {templateKey === 'case_result' && <div className="absolute inset-x-3 bottom-3 top-8 grid grid-cols-[1fr_0.7fr] gap-2"><div className="rounded bg-slate-200"/><div className="rounded bg-slate-900"/></div>}
      {!['metric_focus', 'comparison_split', 'process_steps', 'case_result'].includes(templateKey) && <><div className={`absolute left-3 right-5 top-9 h-2 rounded ${dark ? 'bg-white/80' : 'bg-slate-900/80'}`}/><div className={`absolute left-3 right-10 top-14 h-2 rounded ${dark ? 'bg-white/60' : 'bg-slate-900/60'}`}/><div className={`absolute left-3 right-16 top-20 h-1.5 rounded ${dark ? 'bg-slate-500' : 'bg-slate-300'}`}/></>}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{children}</span>
}

function Pill({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'blue' | 'green' | 'amber' }) {
  const className = tone === 'blue' ? 'border-sky-800 bg-sky-950/50 text-sky-300' : tone === 'green' ? 'border-emerald-800 bg-emerald-950/50 text-emerald-300' : tone === 'amber' ? 'border-amber-800 bg-amber-950/40 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-300'
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${className}`}>{children}</span>
}

export default function VisualStudioClientV2({ content, savedDesigns, initialContentId }: Props) {
  const preferredContent = content.find((item) => item.content_id === initialContentId) || content[0]
  const initialFormat: VisualFormatKey = preferredContent?.content_type === 'article' ? 'article_hero' : 'linkedin_square'
  const initialTemplate = preferredContent ? recommendTemplates(preferredContent)[0] : 'insight_dark'
  const initialDesign = preferredContent
    ? createDesignFromTemplate(initialTemplate, initialFormat, preferredContent)
    : createDesignFromTemplate('insight_dark', 'linkedin_square', { content_id: 'draft', title: 'A better decision starts with the right question.', body: 'Use this canvas to create a branded SC-Analytics visual.', channel: 'manual', content_type: 'post', language: 'en' })

  const [contentId, setContentId] = useState(preferredContent?.content_id || '')
  const [design, setDesign] = useState<VisualDesign>(initialDesign)
  const designRef = useRef<VisualDesign>(initialDesign)
  const undoStack = useRef<VisualDesign[]>([])
  const redoStack = useRef<VisualDesign[]>([])
  const [historyVersion, setHistoryVersion] = useState(0)
  const [selectedId, setSelectedId] = useState<string>('headline')
  const [suggestions, setSuggestions] = useState<VisualTemplateKey[]>(preferredContent ? recommendTemplates(preferredContent) : ['insight_dark', 'insight_light', 'metric_focus', 'image_only_statement'])
  const [drag, setDrag] = useState<DragState>(null)
  const [resize, setResize] = useState<ResizeState>(null)
  const [zoom, setZoom] = useState(100)
  const [busy, setBusy] = useState<string>('')
  const [notice, setNotice] = useState<Notice>(null)
  const [saved, setSaved] = useState<SavedDesign[]>(savedDesigns)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const textEditorRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => { designRef.current = design }, [design])

  const seed = useMemo(() => content.find((item) => item.content_id === contentId) || preferredContent, [content, contentId, preferredContent])
  const format = VISUAL_FORMATS[design.formatKey]
  const selected = design.elements.find((element) => element.id === selectedId) || null
  const canUndo = undoStack.current.length > 0
  const canRedo = redoStack.current.length > 0

  function setDesignDirect(next: VisualDesign) {
    designRef.current = next
    setDesign(next)
  }

  function pushUndo(snapshot = designRef.current) {
    undoStack.current = [...undoStack.current.slice(-59), cloneDesign(snapshot)]
    redoStack.current = []
    setHistoryVersion((value) => value + 1)
  }

  function mutateDesign(updater: (current: VisualDesign) => VisualDesign, record = true) {
    const current = designRef.current
    if (record) pushUndo(current)
    setDesignDirect(updater(current))
  }

  function undo() {
    const previous = undoStack.current.pop()
    if (!previous) return
    redoStack.current = [...redoStack.current.slice(-59), cloneDesign(designRef.current)]
    setDesignDirect(previous)
    setSelectedId(previous.elements.some((element) => element.id === selectedId) ? selectedId : previous.elements[0]?.id || '')
    setHistoryVersion((value) => value + 1)
    setNotice({ tone: 'info', text: 'Cambio deshecho.' })
  }

  function redo() {
    const next = redoStack.current.pop()
    if (!next) return
    undoStack.current = [...undoStack.current.slice(-59), cloneDesign(designRef.current)]
    setDesignDirect(next)
    setSelectedId(next.elements.some((element) => element.id === selectedId) ? selectedId : next.elements[0]?.id || '')
    setHistoryVersion((value) => value + 1)
    setNotice({ tone: 'info', text: 'Cambio rehecho.' })
  }

  function updateElement(id: string, changes: Partial<VisualElement>, record = true) {
    mutateDesign((current) => ({ ...current, elements: current.elements.map((element) => element.id === id ? { ...element, ...changes } : element) }), record)
  }

  function chooseContent(nextId: string) {
    const next = content.find((item) => item.content_id === nextId)
    if (!next) return
    const nextSuggestions = recommendTemplates(next)
    const nextFormat: VisualFormatKey = next.content_type === 'article' ? 'article_hero' : 'linkedin_square'
    const nextDesign = createDesignFromTemplate(nextSuggestions[0], nextFormat, next)
    pushUndo()
    setContentId(nextId)
    setSuggestions(nextSuggestions)
    setDesignDirect(nextDesign)
    setSelectedId(nextDesign.elements.find((element) => element.role === 'headline')?.id || nextDesign.elements[0]?.id || '')
    setZoom(100)
    setNotice({ tone: 'success', text: 'Publicación cargada. Ya puedes escoger una presentación o editarla manualmente.' })
  }

  function applyTemplate(templateKey: VisualTemplateKey, formatKey = design.formatKey, mode = design.publicationMode) {
    if (!seed) return
    const next = createDesignFromTemplate(templateKey, formatKey, { ...seed, publication_mode: mode })
    pushUndo()
    setDesignDirect(next)
    setSelectedId(next.elements.find((element) => element.role === 'headline')?.id || next.elements[0]?.id || '')
    setNotice({ tone: 'success', text: `Plantilla aplicada: ${VISUAL_TEMPLATES.find((item) => item.key === templateKey)?.label || templateKey}.` })
  }

  function applyQuickPreset(preset: (typeof QUICK_PRESETS)[number]) {
    if (!seed) return
    const targetFormat: VisualFormatKey = seed.content_type === 'article' && preset.template !== 'article_editorial' ? 'article_hero' : preset.format
    applyTemplate(preset.template, targetFormat, preset.mode)
  }

  function changeFormat(nextKey: VisualFormatKey) {
    mutateDesign((current) => adaptDesignToFormat(current, nextKey))
    setNotice({ tone: 'info', text: `Formato adaptado a ${VISUAL_FORMATS[nextKey].label}.` })
  }

  function setPublicationMode(mode: PublicationMode) {
    mutateDesign((current) => ({ ...current, publicationMode: mode }))
  }

  function addElement(kind: 'text' | 'metric' | 'rect' | 'line' | 'logo') {
    const element = kind === 'metric' ? emptyMetricElement(design.formatKey) : kind === 'rect' ? emptyRectElement(design.formatKey) : kind === 'line' ? emptyLineElement(design.formatKey) : kind === 'logo' ? emptyLogoElement(design.formatKey) : emptyTextElement(design.formatKey)
    mutateDesign((current) => ({ ...current, elements: [...current.elements, element] }))
    setSelectedId(element.id)
  }

  function removeSelected() {
    const current = designRef.current.elements.find((element) => element.id === selectedId)
    if (!current || current.role === 'brand') return
    mutateDesign((state) => ({ ...state, elements: state.elements.filter((element) => element.id !== current.id) }))
    setSelectedId('')
    setNotice({ tone: 'info', text: 'Elemento eliminado.' })
  }

  function duplicateSelected() {
    const current = designRef.current.elements.find((element) => element.id === selectedId)
    if (!current) return
    const copy = duplicateElement(current)
    mutateDesign((state) => ({ ...state, elements: [...state.elements, copy] }))
    setSelectedId(copy.id)
    setNotice({ tone: 'info', text: 'Elemento duplicado.' })
  }

  function moveSelected(dx: number, dy: number) {
    const current = designRef.current.elements.find((element) => element.id === selectedId)
    if (!current || current.locked) return
    const currentFormat = VISUAL_FORMATS[designRef.current.formatKey]
    const x = Math.max(0, Math.min(currentFormat.width - current.w, current.x + dx))
    const y = Math.max(0, Math.min(currentFormat.height - current.h, current.y + dy))
    updateElement(current.id, { x, y })
  }

  function moveLayer(direction: -1 | 1) {
    const currentSelected = designRef.current.elements.find((element) => element.id === selectedId)
    if (!currentSelected) return
    mutateDesign((current) => {
      const index = current.elements.findIndex((element) => element.id === currentSelected.id)
      const target = Math.max(0, Math.min(current.elements.length - 1, index + direction))
      if (target === index) return current
      const elements = [...current.elements]
      const [item] = elements.splice(index, 1)
      elements.splice(target, 0, item)
      return { ...current, elements }
    })
  }

  function pointFromEvent(event: React.PointerEvent<SVGSVGElement | SVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (event.clientX - rect.left) * (format.width / rect.width), y: (event.clientY - rect.top) * (format.height / rect.height) }
  }

  function startDrag(event: React.PointerEvent<SVGGElement>, element: VisualElement) {
    event.stopPropagation()
    setSelectedId(element.id)
    if (element.locked) return
    const point = pointFromEvent(event)
    pushUndo()
    setDrag({ id: element.id, startX: point.x, startY: point.y, originX: element.x, originY: element.y })
    setResize(null)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function startResize(event: React.PointerEvent<SVGCircleElement>, element: VisualElement, handle: ResizeHandle) {
    event.stopPropagation()
    if (element.locked) return
    setSelectedId(element.id)
    const point = pointFromEvent(event)
    pushUndo()
    setResize({ id: element.id, handle, startX: point.x, startY: point.y, originX: element.x, originY: element.y, originW: element.w, originH: element.h })
    setDrag(null)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    if (resize) {
      const point = pointFromEvent(event)
      const dx = point.x - resize.startX
      const dy = point.y - resize.startY
      const element = designRef.current.elements.find((item) => item.id === resize.id)
      if (!element) return
      const west = resize.handle === 'nw' || resize.handle === 'sw'
      const north = resize.handle === 'nw' || resize.handle === 'ne'
      let width = west ? resize.originW - dx : resize.originW + dx
      let height = north ? resize.originH - dy : resize.originH + dy
      const minW = element.kind === 'line' ? 20 : 48
      const minH = element.kind === 'line' ? 0 : 32
      width = Math.max(minW, width)
      height = Math.max(minH, height)
      if (element.kind === 'logo' || event.shiftKey) {
        const ratio = resize.originW / Math.max(1, resize.originH)
        if (Math.abs(width / resize.originW - 1) >= Math.abs(height / Math.max(1, resize.originH) - 1)) height = Math.max(minH, width / ratio)
        else width = Math.max(minW, height * ratio)
      }
      let x = west ? resize.originX + (resize.originW - width) : resize.originX
      let y = north ? resize.originY + (resize.originH - height) : resize.originY
      x = Math.max(0, Math.min(format.width - width, x))
      y = Math.max(0, Math.min(format.height - height, y))
      width = Math.min(width, format.width - x)
      height = Math.min(height, format.height - y)
      updateElement(resize.id, { x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }, false)
      return
    }
    if (!drag) return
    const point = pointFromEvent(event)
    const element = designRef.current.elements.find((item) => item.id === drag.id)
    if (!element) return
    const nextX = Math.round(Math.max(0, Math.min(format.width - element.w, drag.originX + point.x - drag.startX)))
    const nextY = Math.round(Math.max(0, Math.min(format.height - element.h, drag.originY + point.y - drag.startY)))
    updateElement(drag.id, { x: nextX, y: nextY }, false)
  }

  function stopPointerAction() {
    setDrag(null)
    setResize(null)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return
      const modifier = event.ctrlKey || event.metaKey
      if (modifier && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        duplicateSelected()
        return
      }
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo(); else undo()
        return
      }
      if (modifier && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if (modifier && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void saveDesign(false)
        return
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        removeSelected()
        return
      }
      if (event.key === 'Escape') {
        setSelectedId('')
        return
      }
      const step = event.shiftKey ? 10 : 1
      if (event.key === 'ArrowLeft') { event.preventDefault(); moveSelected(-step, 0) }
      if (event.key === 'ArrowRight') { event.preventDefault(); moveSelected(step, 0) }
      if (event.key === 'ArrowUp') { event.preventDefault(); moveSelected(0, -step) }
      if (event.key === 'ArrowDown') { event.preventDefault(); moveSelected(0, step) }
      if (event.key === '+' || event.key === '=') setZoom((value) => Math.min(180, value + 10))
      if (event.key === '-') setZoom((value) => Math.max(40, value - 10))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, contentId, historyVersion, busy])

  async function serializeSvg() {
    const node = svgRef.current
    if (!node) throw new Error('Canvas is not ready')
    const clone = node.cloneNode(true) as SVGSVGElement
    clone.querySelectorAll('[data-selection]').forEach((item) => item.remove())
    const images = Array.from(clone.querySelectorAll('image'))
    await Promise.all(images.map(async (image) => {
      const href = image.getAttribute('href') || image.getAttribute('xlink:href')
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
        // Keep export available even when an optional image cannot be embedded.
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
      const loaded = new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject })
      image.src = url
      await loaded
      const canvas = document.createElement('canvas')
      canvas.width = format.width
      canvas.height = format.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas export is unavailable')
      context.drawImage(image, 0, 0, format.width, format.height)
      return canvas.toDataURL('image/png')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function saveDesign(asTemplate = false) {
    setBusy(asTemplate ? 'template' : 'save')
    setNotice({ tone: 'info', text: asTemplate ? 'Guardando como plantilla…' : 'Guardando borrador…' })
    try {
      const current = designRef.current
      const response = await fetch('/api/growth-admin/visual-studio/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designId: asTemplate ? undefined : current.designId, contentId: asTemplate ? undefined : contentId || undefined, name: current.name, templateKey: current.templateKey, formatKey: current.formatKey, publicationMode: current.publicationMode, design: current, isTemplate: asTemplate }),
      })
      if (!response.ok) throw new Error(await response.text())
      const result = await response.json()
      if (!asTemplate) setDesignDirect({ ...designRef.current, designId: result.designId })
      const savedRow: SavedDesign = { design_id: result.designId, content_id: asTemplate ? null : contentId, name: current.name, template_key: current.templateKey, format_key: current.formatKey, publication_mode: current.publicationMode, design_json: { ...current, designId: result.designId }, status: asTemplate ? 'template' : 'draft', is_template: asTemplate }
      setSaved((rows) => [savedRow, ...rows.filter((item) => item.design_id !== result.designId)])
      setNotice({ tone: 'success', text: asTemplate ? 'Plantilla guardada para reutilizarla.' : 'Borrador guardado en Supabase.' })
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'No se ha podido guardar el diseño.' })
    } finally {
      setBusy('')
    }
  }

  async function attachToPublication() {
    if (!contentId || !seed) {
      setNotice({ tone: 'error', text: 'Selecciona una publicación antes de adjuntar un visual.' })
      return
    }
    setBusy('attach')
    setNotice({ tone: 'info', text: `Renderizando y adjuntando a “${seed.title}”…` })
    try {
      const current = designRef.current
      const pngDataUrl = await exportPng()
      const response = await fetch('/api/growth-admin/visual-studio/apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designId: current.designId, contentId, name: current.name, templateKey: current.templateKey, formatKey: current.formatKey, publicationMode: current.publicationMode, design: current, pngDataUrl }),
      })
      if (!response.ok) throw new Error(await response.text())
      const result = await response.json()
      setDesignDirect({ ...designRef.current, designId: result.designId, assetPath: result.assetPath, status: 'attached' })
      setNotice({ tone: 'success', text: `Visual adjuntado correctamente a “${seed.title}”. Ahora vuelve al Centro de Control para aprobarlo o programarlo.` })
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'No se ha podido adjuntar el visual.' })
    } finally {
      setBusy('')
    }
  }

  async function downloadPng() {
    setBusy('download')
    try {
      const dataUrl = await exportPng()
      const anchor = document.createElement('a')
      anchor.href = dataUrl
      anchor.download = `${(designRef.current.name || 'sc-analytics-visual').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${designRef.current.formatKey}.png`
      anchor.click()
      setNotice({ tone: 'success', text: `PNG exportado a ${format.width}×${format.height}.` })
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'La exportación PNG ha fallado.' })
    } finally {
      setBusy('')
    }
  }

  function loadSaved(item: SavedDesign) {
    const loaded = item.design_json && item.design_json.elements ? item.design_json : null
    if (!loaded) return
    pushUndo()
    setDesignDirect({ ...loaded, designId: item.design_id, assetPath: item.asset_path || loaded.assetPath, status: item.status })
    if (item.content_id) setContentId(item.content_id)
    setSelectedId(loaded.elements.find((element) => element.role === 'headline')?.id || loaded.elements[0]?.id || '')
    setNotice({ tone: 'success', text: `Diseño cargado: ${item.name}.` })
  }

  const selectionHandles = selected && !selected.hidden ? [
    { key: 'nw' as const, x: selected.x, y: selected.y },
    { key: 'ne' as const, x: selected.x + selected.w, y: selected.y },
    { key: 'sw' as const, x: selected.x, y: selected.y + selected.h },
    { key: 'se' as const, x: selected.x + selected.w, y: selected.y + selected.h },
  ] : []

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="mx-auto flex max-w-[1900px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <a href="/growth-admin" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:border-slate-500 hover:text-white">← Centro de Control</a>
            <img src={SC_BRAND.logos.white} alt="SC-Analytics" className="hidden h-10 w-36 object-contain sm:block" />
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">Sistema visual privado</p><h1 className="mt-0.5 text-2xl font-semibold">Visual Studio</h1></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={undo} disabled={!canUndo} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 disabled:opacity-30">↶ Deshacer</button>
            <button type="button" onClick={redo} disabled={!canRedo} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 disabled:opacity-30">↷ Rehacer</button>
            <button type="button" onClick={() => saveDesign(false)} disabled={Boolean(busy)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-slate-500 disabled:opacity-50">{busy === 'save' ? 'Guardando…' : 'Guardar borrador'}</button>
            <button type="button" onClick={() => saveDesign(true)} disabled={Boolean(busy)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-slate-500 disabled:opacity-50">Guardar plantilla</button>
            <button type="button" onClick={downloadPng} disabled={Boolean(busy)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-slate-500 disabled:opacity-50">{busy === 'download' ? 'Renderizando…' : 'Exportar PNG'}</button>
            <button type="button" onClick={attachToPublication} disabled={Boolean(busy) || !contentId} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-40">{busy === 'attach' ? 'Adjuntando…' : 'Adjuntar a la publicación'}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1900px] 2xl:grid-cols-[350px_minmax(650px,1fr)_350px]">
        <aside className="border-b border-slate-800 bg-slate-950/70 p-5 2xl:min-h-[calc(100vh-78px)] 2xl:border-b-0 2xl:border-r">
          <div className="rounded-2xl border border-sky-900/60 bg-sky-950/20 p-4">
            <div className="flex items-center justify-between gap-3"><FieldLabel>Publicación seleccionada</FieldLabel>{seed?.visual_path ? <Pill tone="green">visual existente</Pill> : <Pill tone="amber">sin visual</Pill>}</div>
            <select value={contentId} onChange={(event) => chooseContent(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200">
              {content.map((item) => <option key={item.content_id} value={item.content_id}>{item.content_type === 'article' ? 'Artículo' : 'LinkedIn'} · {(item.language || '—').toUpperCase()} · {item.title.slice(0, 62)}</option>)}
            </select>
            {seed && <div className="mt-3"><p className="text-sm font-semibold leading-5 text-white">{seed.title}</p><div className="mt-3 flex flex-wrap gap-2"><Pill tone="blue">{seed.content_type === 'article' ? 'WEB' : 'LINKEDIN'}</Pill><Pill>{(seed.language || '—').toUpperCase()}</Pill><Pill>{seed.content_family || 'general'}</Pill></div><p className="mt-3 text-[11px] leading-5 text-slate-500">Todo lo que adjuntes desde este editor irá únicamente a esta publicación. Cambia la publicación aquí antes de diseñar otra pieza.</p></div>}
          </div>

          <div className="mt-6">
            <FieldLabel>Modo rápido</FieldLabel>
            <div className="grid gap-2">
              {QUICK_PRESETS.map((preset) => <button type="button" key={preset.label} onClick={() => applyQuickPreset(preset)} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-left transition hover:border-sky-800 hover:bg-sky-950/20"><p className="text-xs font-semibold text-slate-200">{preset.label}</p><p className="mt-1 text-[10px] leading-4 text-slate-600">{preset.description}</p></button>)}
            </div>
          </div>

          <div className="mt-6">
            <FieldLabel>Comportamiento de publicación</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PUBLICATION_MODES) as Array<[PublicationMode, (typeof PUBLICATION_MODES)[PublicationMode]]>).map(([key, item]) => <button type="button" key={key} onClick={() => setPublicationMode(key)} className={`rounded-lg border p-2.5 text-left ${design.publicationMode === key ? 'border-sky-500 bg-sky-950/30' : 'border-slate-800 bg-slate-900/40'}`}><p className="text-xs font-semibold text-slate-200">{item.label}</p></button>)}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-600">{PUBLICATION_MODES[design.publicationMode].description}</p>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between"><FieldLabel>Sugerencias para este contenido</FieldLabel><button type="button" onClick={() => seed && setSuggestions(recommendTemplates(seed))} className="mb-1 text-[11px] font-medium text-sky-300">Recalcular</button></div>
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((key) => {
                const meta = VISUAL_TEMPLATES.find((item) => item.key === key)!
                return <button type="button" key={key} onClick={() => applyTemplate(key)} className="text-left"><TemplateThumb templateKey={key} selected={design.templateKey === key}/><p className="mt-1.5 text-xs font-medium text-slate-300">{meta.label}</p></button>
              })}
            </div>
          </div>

          <details className="mt-6">
            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Todas las plantillas</summary>
            <div className="mt-3 space-y-2">{VISUAL_TEMPLATES.map((item) => <button type="button" key={item.key} onClick={() => applyTemplate(item.key)} className={`w-full rounded-lg border px-3 py-2 text-left ${design.templateKey === item.key ? 'border-sky-500 bg-sky-950/20' : 'border-slate-800 bg-slate-900/30'}`}><p className="text-xs font-medium text-slate-200">{item.label}</p><p className="mt-1 text-[10px] leading-4 text-slate-600">{item.bestFor}</p></button>)}</div>
          </details>

          {saved.length > 0 && <details className="mt-6"><summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Diseños guardados ({saved.length})</summary><div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">{saved.slice(0, 30).map((item) => <button type="button" key={item.design_id} onClick={() => loadSaved(item)} className="w-full rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-left"><p className="line-clamp-1 text-xs font-medium text-slate-200">{item.name}</p><p className="mt-1 text-[10px] text-slate-600">{item.format_key} · {item.status || 'draft'}{item.is_template ? ' · template' : ''}</p></button>)}</div></details>}
        </aside>

        <section className="min-w-0 p-5 md:p-8">
          {seed && <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Estás diseñando para</p><p className="mt-1 max-w-3xl text-base font-semibold text-white">{seed.title}</p><p className="mt-1 text-xs text-slate-500">{seed.content_type === 'article' ? 'Artículo web' : 'Publicación de LinkedIn'} · {(seed.language || '—').toUpperCase()} · {PUBLICATION_MODES[design.publicationMode].label}</p></div><a href="/growth-admin#approvals" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">Volver a aprobaciones</a></div>}

          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div><FieldLabel>Formato</FieldLabel><select value={design.formatKey} onChange={(event) => changeFormat(event.target.value as VisualFormatKey)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">{Object.values(VISUAL_FORMATS).map((item) => <option key={item.key} value={item.key}>{item.label} · {item.width}×{item.height}</option>)}</select></div>
            <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setZoom((value) => Math.max(40, value - 10))} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">−</button><span className="min-w-14 text-center text-xs text-slate-500">{zoom}%</span><button type="button" onClick={() => setZoom((value) => Math.min(180, value + 10))} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+</button><button type="button" onClick={() => setZoom(100)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">Ajustar</button><span className="mx-1 h-6 w-px bg-slate-800"/><button type="button" onClick={() => addElement('text')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Texto</button><button type="button" onClick={() => addElement('metric')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Métrica</button><button type="button" onClick={() => addElement('rect')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Forma</button><button type="button" onClick={() => addElement('line')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Línea</button><button type="button" onClick={() => addElement('logo')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Logo</button></div>
          </div>

          <div className="flex min-h-[680px] items-center justify-center overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-inner shadow-black/30">
            <svg ref={svgRef} viewBox={`0 0 ${format.width} ${format.height}`} width={format.width} height={format.height} onPointerMove={handleMove} onPointerUp={stopPointerAction} onPointerLeave={stopPointerAction} onPointerDown={() => setSelectedId('')} className="touch-none bg-white shadow-2xl shadow-black/40" style={{ aspectRatio: `${format.width}/${format.height}`, width: `${zoom}%`, maxWidth: 'none', height: 'auto' }}>
              <rect x="0" y="0" width={format.width} height={format.height} fill={design.background} />
              {design.elements.map((element) => <g key={element.id} onDoubleClick={(event) => { event.stopPropagation(); setSelectedId(element.id); if (['text', 'tag'].includes(element.kind)) setTimeout(() => textEditorRef.current?.focus(), 0) }} onPointerDown={(event) => startDrag(event, element)} className={element.locked ? '' : 'cursor-move'}><VisualElementNode element={element}/>{selectedId === element.id && !element.hidden && <g data-selection="true"><rect x={element.x - 7} y={element.y - 7} width={Math.max(14, element.w + 14)} height={Math.max(14, element.h + 14)} fill="none" stroke="#38BDF8" strokeWidth={3} strokeDasharray="12 8" pointerEvents="none"/>{selectionHandles.map((handle) => <circle key={handle.key} cx={handle.x} cy={handle.y} r={11} fill="#F8FAFC" stroke="#0284C7" strokeWidth={4} className="cursor-nwse-resize" onPointerDown={(event) => startResize(event, element, handle.key)} />)}</g>}</g>)}
            </svg>
          </div>

          <div className={`mt-4 rounded-xl border p-4 text-xs ${notice?.tone === 'success' ? 'border-emerald-900 bg-emerald-950/20 text-emerald-300' : notice?.tone === 'error' ? 'border-rose-900 bg-rose-950/20 text-rose-300' : 'border-slate-800 bg-slate-900/40 text-slate-500'}`}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><span>{format.label} · {format.width}×{format.height} · {design.templateKey}</span><span>{notice?.text || 'Arrastra para mover. Usa los tiradores de las esquinas para cambiar tamaño.'}</span></div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Atajos</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-500"><span><kbd className="text-slate-300">Supr</kbd> borrar</span><span><kbd className="text-slate-300">Ctrl/Cmd+D</kbd> duplicar</span><span><kbd className="text-slate-300">Ctrl/Cmd+Z</kbd> deshacer</span><span><kbd className="text-slate-300">Ctrl/Cmd+Shift+Z</kbd> rehacer</span><span><kbd className="text-slate-300">Flechas</kbd> mover 1 px</span><span><kbd className="text-slate-300">Shift+Flechas</kbd> mover 10 px</span><span><kbd className="text-slate-300">Shift+resize</kbd> mantener proporción</span><span><kbd className="text-slate-300">Ctrl/Cmd+S</kbd> guardar</span></div></div>
        </section>

        <aside className="border-t border-slate-800 bg-slate-950/70 p-5 2xl:min-h-[calc(100vh-78px)] 2xl:border-l 2xl:border-t-0">
          <FieldLabel>Marca SC-Analytics</FieldLabel>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"><div className="flex items-center gap-3"><img src={SC_BRAND.logos.white} alt="SC-Analytics" className="h-12 w-40 object-contain object-left"/><div><p className="text-[10px] text-slate-600">Inter + Playfair</p><p className="text-[10px] text-slate-600">Paleta controlada</p></div></div><div className="mt-4 flex flex-wrap gap-1.5">{palette.map((color) => <span key={color} title={color} className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: color }}/>)}</div></div>

          <div className="mt-6">
            <div className="flex items-end justify-between"><FieldLabel>Capas</FieldLabel>{selected && <span className="mb-1 text-[10px] text-sky-300">{selected.kind}</span>}</div>
            <div className="max-h-52 space-y-1 overflow-auto rounded-lg border border-slate-800 p-2">{[...design.elements].reverse().map((element) => <button type="button" key={element.id} onClick={() => setSelectedId(element.id)} className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${selectedId === element.id ? 'bg-sky-950/50 text-sky-200' : 'text-slate-500 hover:bg-slate-900'}`}><span className="truncate">{element.role || element.text || element.value || element.kind}</span><span className="ml-2 text-[9px]">{element.hidden ? 'HIDE' : element.locked ? 'LOCK' : ''}</span></button>)}</div>
          </div>

          {selected ? <div className="mt-6 space-y-4">
            <div className="grid grid-cols-4 gap-2"><button type="button" onClick={duplicateSelected} className="rounded-lg border border-slate-700 px-2 py-2 text-xs">Duplicar</button><button type="button" onClick={() => moveLayer(1)} className="rounded-lg border border-slate-700 px-2 py-2 text-xs">↑ capa</button><button type="button" onClick={() => moveLayer(-1)} className="rounded-lg border border-slate-700 px-2 py-2 text-xs">↓ capa</button><button type="button" onClick={removeSelected} disabled={selected.role === 'brand'} className="rounded-lg border border-rose-900 px-2 py-2 text-xs text-rose-300 disabled:opacity-30">Borrar</button></div>

            {['text', 'tag'].includes(selected.kind) && <label><FieldLabel>Texto</FieldLabel><textarea ref={textEditorRef} value={selected.text || ''} onFocus={() => pushUndo()} onChange={(event) => updateElement(selected.id, { text: event.target.value }, false)} rows={4} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm"/></label>}
            {selected.kind === 'metric' && <><label><FieldLabel>Valor</FieldLabel><input value={selected.value || ''} onFocus={() => pushUndo()} onChange={(event) => updateElement(selected.id, { value: event.target.value }, false)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/></label><label><FieldLabel>Etiqueta</FieldLabel><textarea value={selected.label || ''} onFocus={() => pushUndo()} onChange={(event) => updateElement(selected.id, { label: event.target.value }, false)} rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm"/></label></>}
            {selected.kind === 'logo' && <><label><FieldLabel>Versión de logo</FieldLabel><select value={selected.src || SC_BRAND.logos.horizontal} onChange={(event) => updateElement(selected.id, { src: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option value={SC_BRAND.logos.horizontal}>Horizontal transparente</option><option value={SC_BRAND.logos.white}>Blanco</option><option value={SC_BRAND.logos.monogram}>Monograma transparente</option><option value={SC_BRAND.logos.monogramSolid}>Monograma sólido</option><option value={SC_BRAND.logos.circular}>Circular</option></select></label><div><FieldLabel>Tamaño rápido</FieldLabel><div className="grid grid-cols-3 gap-2">{[['Normal', 1], ['Grande', 1.25], ['Protagonista', 1.55]].map(([label, factor]) => <button type="button" key={String(label)} onClick={() => { const f = Number(factor); updateElement(selected.id, { w: Math.round(selected.w * f), h: Math.round(selected.h * f) }) }} className="rounded-lg border border-slate-700 px-2 py-2 text-[10px]">{label}</button>)}</div></div></>}

            <div className="grid grid-cols-2 gap-3">{(['x', 'y', 'w', 'h'] as const).map((key) => <label key={key}><FieldLabel>{key.toUpperCase()}</FieldLabel><input type="number" value={Math.round(selected[key])} onFocus={() => pushUndo()} onChange={(event) => updateElement(selected.id, { [key]: Number(event.target.value) }, false)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/></label>)}</div>

            {['text', 'metric', 'tag'].includes(selected.kind) && <div className="grid grid-cols-2 gap-3"><label><FieldLabel>Tamaño fuente</FieldLabel><input type="number" value={selected.fontSize || 30} onFocus={() => pushUndo()} onChange={(event) => updateElement(selected.id, { fontSize: Number(event.target.value) }, false)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/></label><label><FieldLabel>Peso</FieldLabel><input type="number" min="100" max="900" step="50" value={selected.fontWeight || 500} onFocus={() => pushUndo()} onChange={(event) => updateElement(selected.id, { fontWeight: Number(event.target.value) }, false)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/></label></div>}

            {selected.kind === 'text' && <label><FieldLabel>Alineación</FieldLabel><div className="grid grid-cols-3 gap-2">{(['left', 'center', 'right'] as const).map((align) => <button type="button" key={align} onClick={() => updateElement(selected.id, { align })} className={`rounded-lg border px-2 py-2 text-xs ${selected.align === align ? 'border-sky-500 text-sky-300' : 'border-slate-700'}`}>{align}</button>)}</div></label>}

            <div><FieldLabel>Apariencia</FieldLabel><div className="grid grid-cols-2 gap-3">{['text', 'metric', 'tag'].includes(selected.kind) && <label><span className="mb-1 block text-[10px] text-slate-600">Color texto</span><input type="color" value={selected.color || SC_BRAND.colors.textOnDark} onFocus={() => pushUndo()} onChange={(event) => updateElement(selected.id, { color: event.target.value }, false)} className="h-9 w-full rounded border border-slate-700 bg-slate-900"/></label>}{['rect', 'tag'].includes(selected.kind) && <label><span className="mb-1 block text-[10px] text-slate-600">Relleno</span><input type="color" value={selected.fill || SC_BRAND.colors.navyPanel} onFocus={() => pushUndo()} onChange={(event) => updateElement(selected.id, { fill: event.target.value }, false)} className="h-9 w-full rounded border border-slate-700 bg-slate-900"/></label>}{['rect', 'line'].includes(selected.kind) && <label><span className="mb-1 block text-[10px] text-slate-600">Trazo</span><input type="color" value={selected.stroke || SC_BRAND.colors.line} onFocus={() => pushUndo()} onChange={(event) => updateElement(selected.id, { stroke: event.target.value }, false)} className="h-9 w-full rounded border border-slate-700 bg-slate-900"/></label>}</div></div>

            <label><FieldLabel>Opacidad · {Math.round((selected.opacity ?? 1) * 100)}%</FieldLabel><input type="range" min="0.1" max="1" step="0.05" value={selected.opacity ?? 1} onPointerDown={() => pushUndo()} onChange={(event) => updateElement(selected.id, { opacity: Number(event.target.value) }, false)} className="w-full"/></label>
            <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => updateElement(selected.id, { locked: !selected.locked })} className={`rounded-lg border px-3 py-2 text-xs ${selected.locked ? 'border-amber-700 text-amber-300' : 'border-slate-700'}`}>{selected.locked ? 'Desbloquear' : 'Bloquear'}</button><button type="button" onClick={() => updateElement(selected.id, { hidden: !selected.hidden })} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">{selected.hidden ? 'Mostrar' : 'Ocultar'}</button></div>
          </div> : <div className="mt-6 rounded-xl border border-dashed border-slate-800 p-5 text-center text-xs leading-5 text-slate-600">Selecciona un elemento en el canvas o en Capas para editarlo.</div>}

          <div className="mt-7 border-t border-slate-800 pt-5"><FieldLabel>Canvas</FieldLabel><label><span className="mb-1 block text-[10px] text-slate-600">Fondo</span><input type="color" value={design.background} onFocus={() => pushUndo()} onChange={(event) => mutateDesign((current) => ({ ...current, background: event.target.value }), false)} className="h-10 w-full rounded border border-slate-700 bg-slate-900"/></label><p className="mt-3 text-[10px] leading-4 text-slate-600">Las reglas de marca mantienen la coherencia, pero puedes mover, redimensionar y editar la composición. Adjuntar nunca equivale a publicar.</p></div>
        </aside>
      </div>
    </main>
  )
}
