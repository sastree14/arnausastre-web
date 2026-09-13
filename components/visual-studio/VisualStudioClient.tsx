'use client'

import { useMemo, useRef, useState } from 'react'
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
}

type DragState = { id: string; startX: number; startY: number; originX: number; originY: number } | null

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
    } else line = next
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
    <text
      x={x}
      y={element.y + size}
      fill={element.color || SC_BRAND.colors.textOnDark}
      fontFamily={element.fontFamily || SC_BRAND.fonts.body}
      fontSize={size}
      fontWeight={element.fontWeight || 500}
      textAnchor={anchor}
      opacity={element.opacity ?? 1}
    >
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
    <div className={`relative aspect-[4/3] overflow-hidden rounded-lg border ${selected ? 'border-sky-400' : 'border-slate-700'} ${dark ? 'bg-[#071522]' : 'bg-slate-50'}`}>
      <div className={`absolute left-3 top-3 h-1.5 w-10 rounded-full ${dark ? 'bg-sky-300' : 'bg-indigo-500'}`} />
      {templateKey === 'metric_focus' && <><div className="absolute left-3 top-8 text-2xl font-bold text-sky-300">42%</div><div className="absolute bottom-3 left-3 right-3 h-4 rounded bg-slate-700/50" /></>}
      {templateKey === 'comparison_split' && <div className="absolute inset-x-3 bottom-3 top-8 grid grid-cols-2 gap-2"><div className="rounded bg-slate-200"/><div className="rounded bg-indigo-100"/></div>}
      {templateKey === 'process_steps' && <div className="absolute inset-x-3 bottom-3 top-8 flex gap-1.5">{[1,2,3].map((n)=><div key={n} className="flex-1 rounded bg-slate-800" />)}</div>}
      {templateKey === 'case_result' && <div className="absolute inset-x-3 bottom-3 top-8 grid grid-cols-[1fr_0.7fr] gap-2"><div className="rounded bg-slate-200"/><div className="rounded bg-slate-900"/></div>}
      {!['metric_focus','comparison_split','process_steps','case_result'].includes(templateKey) && <><div className={`absolute left-3 right-5 top-9 h-2 rounded ${dark ? 'bg-white/80' : 'bg-slate-900/80'}`}/><div className={`absolute left-3 right-10 top-14 h-2 rounded ${dark ? 'bg-white/60' : 'bg-slate-900/60'}`}/><div className={`absolute left-3 right-16 top-20 h-1.5 rounded ${dark ? 'bg-slate-500' : 'bg-slate-300'}`}/></>}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{children}</span>
}

export default function VisualStudioClient({ content, savedDesigns }: Props) {
  const initialContent = content[0]
  const initialFormat: VisualFormatKey = initialContent?.content_type === 'article' ? 'article_hero' : 'linkedin_square'
  const initialTemplate = initialContent ? recommendTemplates(initialContent)[0] : 'insight_dark'
  const [contentId, setContentId] = useState(initialContent?.content_id || '')
  const [design, setDesign] = useState<VisualDesign>(() => initialContent ? createDesignFromTemplate(initialTemplate, initialFormat, initialContent) : createDesignFromTemplate('insight_dark', 'linkedin_square', { content_id: 'draft', title: 'A better decision starts with the right question.', body: 'Use this canvas to create a branded SC-Analytics visual.', channel: 'manual', content_type: 'post', language: 'en' }))
  const [selectedId, setSelectedId] = useState<string>('headline')
  const [suggestions, setSuggestions] = useState<VisualTemplateKey[]>(initialContent ? recommendTemplates(initialContent) : ['insight_dark','insight_light','metric_focus','image_only_statement'])
  const [drag, setDrag] = useState<DragState>(null)
  const [busy, setBusy] = useState<string>('')
  const [notice, setNotice] = useState<string>('')
  const [saved, setSaved] = useState<SavedDesign[]>(savedDesigns)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const seed = useMemo(() => content.find((item) => item.content_id === contentId) || initialContent, [content, contentId, initialContent])
  const format = VISUAL_FORMATS[design.formatKey]
  const selected = design.elements.find((element) => element.id === selectedId) || null

  function updateElement(id: string, changes: Partial<VisualElement>) {
    setDesign((current) => ({ ...current, elements: current.elements.map((element) => element.id === id ? { ...element, ...changes } : element) }))
  }

  function chooseContent(nextId: string) {
    setContentId(nextId)
    const next = content.find((item) => item.content_id === nextId)
    if (!next) return
    const nextSuggestions = recommendTemplates(next)
    const nextFormat: VisualFormatKey = next.content_type === 'article' ? 'article_hero' : (design.formatKey.startsWith('linkedin_') ? design.formatKey : 'linkedin_square')
    const nextDesign = createDesignFromTemplate(nextSuggestions[0], nextFormat, next)
    setSuggestions(nextSuggestions)
    setDesign(nextDesign)
    setSelectedId('headline')
    setNotice('Loaded publication and prepared recommended layouts.')
  }

  function applyTemplate(templateKey: VisualTemplateKey) {
    if (!seed) return
    const next = createDesignFromTemplate(templateKey, design.formatKey, { ...seed, publication_mode: design.publicationMode })
    setDesign(next)
    setSelectedId(next.elements.find((element) => element.role === 'headline')?.id || next.elements[0]?.id || '')
    setNotice(`Applied ${VISUAL_TEMPLATES.find((item) => item.key === templateKey)?.label || templateKey}.`)
  }

  function changeFormat(nextKey: VisualFormatKey) {
    setDesign((current) => adaptDesignToFormat(current, nextKey))
    setNotice(`Adapted canvas to ${VISUAL_FORMATS[nextKey].label}.`)
  }

  function setPublicationMode(mode: PublicationMode) {
    setDesign((current) => ({ ...current, publicationMode: mode }))
  }

  function addElement(kind: 'text' | 'metric' | 'rect' | 'line' | 'logo') {
    const element = kind === 'metric' ? emptyMetricElement(design.formatKey) : kind === 'rect' ? emptyRectElement(design.formatKey) : kind === 'line' ? emptyLineElement(design.formatKey) : kind === 'logo' ? emptyLogoElement(design.formatKey) : emptyTextElement(design.formatKey)
    setDesign((current) => ({ ...current, elements: [...current.elements, element] }))
    setSelectedId(element.id)
  }

  function removeSelected() {
    if (!selected || selected.role === 'brand') return
    setDesign((current) => ({ ...current, elements: current.elements.filter((element) => element.id !== selected.id) }))
    setSelectedId('')
  }

  function duplicateSelected() {
    if (!selected) return
    const copy = duplicateElement(selected)
    setDesign((current) => ({ ...current, elements: [...current.elements, copy] }))
    setSelectedId(copy.id)
  }

  function moveLayer(direction: -1 | 1) {
    if (!selected) return
    setDesign((current) => {
      const index = current.elements.findIndex((element) => element.id === selected.id)
      const target = Math.max(0, Math.min(current.elements.length - 1, index + direction))
      if (target === index) return current
      const elements = [...current.elements]
      const [item] = elements.splice(index, 1)
      elements.splice(target, 0, item)
      return { ...current, elements }
    })
  }

  function pointFromEvent(event: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (event.clientX - rect.left) * (format.width / rect.width), y: (event.clientY - rect.top) * (format.height / rect.height) }
  }

  function startDrag(event: React.PointerEvent<SVGGElement>, element: VisualElement) {
    event.stopPropagation()
    setSelectedId(element.id)
    if (element.locked) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (event.clientX - rect.left) * (format.width / rect.width)
    const y = (event.clientY - rect.top) * (format.height / rect.height)
    setDrag({ id: element.id, startX: x, startY: y, originX: element.x, originY: element.y })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!drag) return
    const point = pointFromEvent(event)
    const element = design.elements.find((item) => item.id === drag.id)
    if (!element) return
    const nextX = Math.round(Math.max(0, Math.min(format.width - element.w, drag.originX + point.x - drag.startX)))
    const nextY = Math.round(Math.max(0, Math.min(format.height - element.h, drag.originY + point.y - drag.startY)))
    updateElement(drag.id, { x: nextX, y: nextY })
  }

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
        // Export remains usable even if a decorative image cannot be embedded.
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
    setNotice('')
    try {
      const response = await fetch('/api/growth-admin/visual-studio/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: asTemplate ? undefined : design.designId,
          contentId: asTemplate ? undefined : contentId || undefined,
          name: design.name,
          templateKey: design.templateKey,
          formatKey: design.formatKey,
          publicationMode: design.publicationMode,
          design,
          isTemplate: asTemplate,
        }),
      })
      if (!response.ok) throw new Error(await response.text())
      const result = await response.json()
      if (!asTemplate) setDesign((current) => ({ ...current, designId: result.designId }))
      const savedRow: SavedDesign = {
        design_id: result.designId, content_id: asTemplate ? null : contentId, name: design.name,
        template_key: design.templateKey, format_key: design.formatKey, publication_mode: design.publicationMode,
        design_json: { ...design, designId: result.designId }, status: asTemplate ? 'template' : 'draft', is_template: asTemplate,
      }
      setSaved((current) => [savedRow, ...current.filter((item) => item.design_id !== result.designId)])
      setNotice(asTemplate ? 'Saved as a reusable SC-Analytics template.' : 'Draft saved in Supabase.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save design.')
    } finally { setBusy('') }
  }

  async function attachToPublication() {
    if (!contentId) { setNotice('Select a publication before attaching a visual.'); return }
    setBusy('attach')
    setNotice('Rendering PNG…')
    try {
      const pngDataUrl = await exportPng()
      const response = await fetch('/api/growth-admin/visual-studio/apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: design.designId,
          contentId,
          name: design.name,
          templateKey: design.templateKey,
          formatKey: design.formatKey,
          publicationMode: design.publicationMode,
          design,
          pngDataUrl,
        }),
      })
      if (!response.ok) throw new Error(await response.text())
      const result = await response.json()
      setDesign((current) => ({ ...current, designId: result.designId, assetPath: result.assetPath, status: 'attached' }))
      setNotice('Visual attached to the publication. It will be used only when that content is explicitly approved/published.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not attach visual.')
    } finally { setBusy('') }
  }

  async function downloadPng() {
    setBusy('download')
    try {
      const dataUrl = await exportPng()
      const anchor = document.createElement('a')
      anchor.href = dataUrl
      anchor.download = `${(design.name || 'sc-analytics-visual').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${design.formatKey}.png`
      anchor.click()
      setNotice(`Exported ${format.width}×${format.height} PNG.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'PNG export failed.')
    } finally { setBusy('') }
  }

  function loadSaved(item: SavedDesign) {
    const loaded = item.design_json && item.design_json.elements ? item.design_json : null
    if (!loaded) return
    setDesign({ ...loaded, designId: item.design_id, assetPath: item.asset_path || loaded.assetPath, status: item.status })
    if (item.content_id) setContentId(item.content_id)
    setSelectedId(loaded.elements.find((element) => element.role === 'headline')?.id || loaded.elements[0]?.id || '')
    setNotice(`Loaded ${item.name}.`)
  }

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 px-5 py-4 lg:px-8">
        <div className="mx-auto flex max-w-[1900px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <a href="/growth-admin" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:text-white">← Control Center</a>
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">SC-Analytics · Visual system</p><h1 className="mt-1 text-2xl font-semibold">Visual Studio</h1></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => saveDesign(false)} disabled={Boolean(busy)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-slate-500 disabled:opacity-50">{busy === 'save' ? 'Saving…' : 'Save draft'}</button>
            <button onClick={() => saveDesign(true)} disabled={Boolean(busy)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-slate-500 disabled:opacity-50">Save as template</button>
            <button onClick={downloadPng} disabled={Boolean(busy)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-slate-500 disabled:opacity-50">{busy === 'download' ? 'Rendering…' : 'Export PNG'}</button>
            <button onClick={attachToPublication} disabled={Boolean(busy) || !contentId} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-40">{busy === 'attach' ? 'Attaching…' : 'Attach to publication'}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1900px] gap-0 2xl:grid-cols-[330px_minmax(650px,1fr)_330px]">
        <aside className="border-b border-slate-800 bg-slate-950/70 p-5 2xl:min-h-[calc(100vh-78px)] 2xl:border-b-0 2xl:border-r">
          <div>
            <FieldLabel>Publication</FieldLabel>
            <select value={contentId} onChange={(event) => chooseContent(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200">
              {content.map((item) => <option key={item.content_id} value={item.content_id}>{item.content_type === 'article' ? 'Article' : 'LinkedIn'} · {(item.language || '—').toUpperCase()} · {item.title.slice(0, 62)}</option>)}
            </select>
            {seed && <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3"><p className="line-clamp-2 text-xs font-medium text-slate-200">{seed.title}</p><p className="mt-1 text-[11px] text-slate-600">{seed.channel} · {seed.content_type} · {seed.content_family || 'general'}</p></div>}
          </div>

          <div className="mt-6">
            <FieldLabel>Publishing behaviour</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PUBLICATION_MODES) as Array<[PublicationMode, (typeof PUBLICATION_MODES)[PublicationMode]]>).map(([key, item]) => <button key={key} onClick={() => setPublicationMode(key)} className={`rounded-lg border p-2.5 text-left ${design.publicationMode === key ? 'border-sky-500 bg-sky-950/30' : 'border-slate-800 bg-slate-900/40'}`}><p className="text-xs font-semibold text-slate-200">{item.label}</p></button>)}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-600">{PUBLICATION_MODES[design.publicationMode].description}</p>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between"><FieldLabel>Smart layout suggestions</FieldLabel><button onClick={() => seed && setSuggestions(recommendTemplates(seed))} className="mb-1 text-[11px] font-medium text-sky-300">Suggest again</button></div>
            <div className="grid grid-cols-2 gap-3">
              {suggestions.map((key) => {
                const meta = VISUAL_TEMPLATES.find((item) => item.key === key)!
                return <button key={key} onClick={() => applyTemplate(key)} className="text-left"><TemplateThumb templateKey={key} selected={design.templateKey === key}/><p className="mt-1.5 text-xs font-medium text-slate-300">{meta.label}</p></button>
              })}
            </div>
          </div>

          <details className="mt-6" open>
            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">All templates</summary>
            <div className="mt-3 space-y-2">{VISUAL_TEMPLATES.map((item) => <button key={item.key} onClick={() => applyTemplate(item.key)} className={`w-full rounded-lg border px-3 py-2 text-left ${design.templateKey === item.key ? 'border-sky-500 bg-sky-950/20' : 'border-slate-800 bg-slate-900/30'}`}><p className="text-xs font-medium text-slate-200">{item.label}</p><p className="mt-1 text-[10px] leading-4 text-slate-600">{item.bestFor}</p></button>)}</div>
          </details>

          {saved.length > 0 && <details className="mt-6"><summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Saved designs ({saved.length})</summary><div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">{saved.slice(0, 30).map((item) => <button key={item.design_id} onClick={() => loadSaved(item)} className="w-full rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-left"><p className="line-clamp-1 text-xs font-medium text-slate-200">{item.name}</p><p className="mt-1 text-[10px] text-slate-600">{item.format_key} · {item.status || 'draft'}{item.is_template ? ' · template' : ''}</p></button>)}</div></details>}
        </aside>

        <section className="min-w-0 p-5 md:p-8">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div><FieldLabel>Canvas format</FieldLabel><select value={design.formatKey} onChange={(event) => changeFormat(event.target.value as VisualFormatKey)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm">{Object.values(VISUAL_FORMATS).map((item) => <option key={item.key} value={item.key}>{item.label} · {item.width}×{item.height}</option>)}</select></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => addElement('text')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Text</button><button onClick={() => addElement('metric')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Metric</button><button onClick={() => addElement('rect')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Shape</button><button onClick={() => addElement('line')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Line</button><button onClick={() => addElement('logo')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">+ Logo</button></div>
          </div>

          <div className="flex min-h-[650px] items-center justify-center overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-inner shadow-black/30">
            <svg ref={svgRef} viewBox={`0 0 ${format.width} ${format.height}`} width={format.width} height={format.height} onPointerMove={handleMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)} onPointerDown={() => setSelectedId('')} className="max-h-[76vh] max-w-full touch-none bg-white shadow-2xl shadow-black/40" style={{ aspectRatio: `${format.width}/${format.height}`, width: 'auto', height: 'auto' }}>
              <rect x="0" y="0" width={format.width} height={format.height} fill={design.background} />
              {design.elements.map((element) => <g key={element.id} onPointerDown={(event) => startDrag(event, element)} className={element.locked ? '' : 'cursor-move'}><VisualElementNode element={element}/>{selectedId === element.id && !element.hidden && <rect data-selection="true" x={element.x - 8} y={element.y - 8} width={element.w + 16} height={element.h + 16} fill="none" stroke="#38BDF8" strokeWidth={3} strokeDasharray="12 8" pointerEvents="none"/>}</g>)}
            </svg>
          </div>
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>{format.label} · {format.width}×{format.height} · {design.templateKey}</span><span>{notice || 'Drag elements directly on the canvas. Use the property panel for precise control.'}</span></div>
        </section>

        <aside className="border-t border-slate-800 bg-slate-950/70 p-5 2xl:min-h-[calc(100vh-78px)] 2xl:border-l 2xl:border-t-0">
          <FieldLabel>Brand</FieldLabel>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"><div className="flex items-center gap-3"><img src={SC_BRAND.logos.monogramSolid} alt="SC-Analytics" className="h-9 w-9 rounded"/><div><p className="text-sm font-semibold">SC-Analytics</p><p className="text-[10px] text-slate-600">Inter + Playfair · controlled palette</p></div></div><div className="mt-4 flex flex-wrap gap-1.5">{palette.map((color) => <span key={color} title={color} className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: color }}/>)}</div></div>

          <div className="mt-6">
            <div className="flex items-end justify-between"><FieldLabel>Layers</FieldLabel>{selected && <span className="mb-1 text-[10px] text-sky-300">{selected.kind}</span>}</div>
            <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-slate-800 p-2">{[...design.elements].reverse().map((element) => <button key={element.id} onClick={() => setSelectedId(element.id)} className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs ${selectedId === element.id ? 'bg-sky-950/50 text-sky-200' : 'text-slate-500 hover:bg-slate-900'}`}><span className="truncate">{element.role || element.text || element.value || element.kind}</span><span className="ml-2 text-[9px]">{element.hidden ? 'HIDE' : element.locked ? 'LOCK' : ''}</span></button>)}</div>
          </div>

          {selected ? <div className="mt-6 space-y-4">
            <div className="flex gap-2"><button onClick={duplicateSelected} className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-xs">Duplicate</button><button onClick={() => moveLayer(1)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">↑</button><button onClick={() => moveLayer(-1)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">↓</button><button onClick={removeSelected} disabled={selected.role === 'brand'} className="rounded-lg border border-rose-900 px-3 py-2 text-xs text-rose-300 disabled:opacity-30">Delete</button></div>

            {['text','tag'].includes(selected.kind) && <label><FieldLabel>Text</FieldLabel><textarea value={selected.text || ''} onChange={(event) => updateElement(selected.id, { text: event.target.value })} rows={4} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm"/></label>}
            {selected.kind === 'metric' && <><label><FieldLabel>Value</FieldLabel><input value={selected.value || ''} onChange={(event) => updateElement(selected.id,{ value:event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/></label><label><FieldLabel>Label</FieldLabel><textarea value={selected.label || ''} onChange={(event) => updateElement(selected.id,{ label:event.target.value })} rows={3} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm"/></label></>}
            {selected.kind === 'logo' && <label><FieldLabel>Logo variant</FieldLabel><select value={selected.src || SC_BRAND.logos.horizontal} onChange={(event)=>updateElement(selected.id,{src:event.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"><option value={SC_BRAND.logos.horizontal}>Horizontal transparent</option><option value={SC_BRAND.logos.white}>White</option><option value={SC_BRAND.logos.monogram}>Monogram transparent</option><option value={SC_BRAND.logos.monogramSolid}>Monogram solid</option><option value={SC_BRAND.logos.circular}>Circular</option></select></label>}

            <div className="grid grid-cols-2 gap-3">{(['x','y','w','h'] as const).map((key) => <label key={key}><FieldLabel>{key.toUpperCase()}</FieldLabel><input type="number" value={Math.round(selected[key])} onChange={(event) => updateElement(selected.id,{[key]:Number(event.target.value)})} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/></label>)}</div>

            {['text','metric','tag'].includes(selected.kind) && <div className="grid grid-cols-2 gap-3"><label><FieldLabel>Font size</FieldLabel><input type="number" value={selected.fontSize || 30} onChange={(event)=>updateElement(selected.id,{fontSize:Number(event.target.value)})} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/></label><label><FieldLabel>Weight</FieldLabel><input type="number" min="100" max="900" step="50" value={selected.fontWeight || 500} onChange={(event)=>updateElement(selected.id,{fontWeight:Number(event.target.value)})} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"/></label></div>}

            {selected.kind === 'text' && <label><FieldLabel>Alignment</FieldLabel><div className="grid grid-cols-3 gap-2">{(['left','center','right'] as const).map((align)=><button key={align} onClick={()=>updateElement(selected.id,{align})} className={`rounded-lg border px-2 py-2 text-xs ${selected.align===align?'border-sky-500 text-sky-300':'border-slate-700'}`}>{align}</button>)}</div></label>}

            <div><FieldLabel>Appearance</FieldLabel><div className="grid grid-cols-2 gap-3">{['text','metric','tag'].includes(selected.kind) && <label><span className="mb-1 block text-[10px] text-slate-600">Text colour</span><input type="color" value={selected.color || SC_BRAND.colors.textOnDark} onChange={(event)=>updateElement(selected.id,{color:event.target.value})} className="h-9 w-full rounded border border-slate-700 bg-slate-900"/></label>}{['rect','tag'].includes(selected.kind) && <label><span className="mb-1 block text-[10px] text-slate-600">Fill</span><input type="color" value={selected.fill || SC_BRAND.colors.navyPanel} onChange={(event)=>updateElement(selected.id,{fill:event.target.value})} className="h-9 w-full rounded border border-slate-700 bg-slate-900"/></label>}{['rect','line'].includes(selected.kind) && <label><span className="mb-1 block text-[10px] text-slate-600">Stroke</span><input type="color" value={selected.stroke || SC_BRAND.colors.line} onChange={(event)=>updateElement(selected.id,{stroke:event.target.value})} className="h-9 w-full rounded border border-slate-700 bg-slate-900"/></label>}</div></div>

            <label><FieldLabel>Opacity · {Math.round((selected.opacity ?? 1) * 100)}%</FieldLabel><input type="range" min="0.1" max="1" step="0.05" value={selected.opacity ?? 1} onChange={(event)=>updateElement(selected.id,{opacity:Number(event.target.value)})} className="w-full"/></label>
            <div className="grid grid-cols-2 gap-2"><button onClick={()=>updateElement(selected.id,{locked:!selected.locked})} className={`rounded-lg border px-3 py-2 text-xs ${selected.locked?'border-amber-700 text-amber-300':'border-slate-700'}`}>{selected.locked?'Unlock element':'Lock element'}</button><button onClick={()=>updateElement(selected.id,{hidden:!selected.hidden})} className="rounded-lg border border-slate-700 px-3 py-2 text-xs">{selected.hidden?'Show':'Hide'}</button></div>
          </div> : <div className="mt-6 rounded-xl border border-dashed border-slate-800 p-5 text-center text-xs leading-5 text-slate-600">Select an element on the canvas or in Layers to edit it.</div>}

          <div className="mt-7 border-t border-slate-800 pt-5"><FieldLabel>Canvas</FieldLabel><label><span className="mb-1 block text-[10px] text-slate-600">Background</span><input type="color" value={design.background} onChange={(event)=>setDesign((current)=>({...current,background:event.target.value}))} className="h-10 w-full rounded border border-slate-700 bg-slate-900"/></label><p className="mt-3 text-[10px] leading-4 text-slate-600">Brand defaults keep SC-Analytics coherent, but every layout remains manually editable. Attaching a visual never bypasses the existing human publication approval.</p></div>
        </aside>
      </div>
    </main>
  )
}
