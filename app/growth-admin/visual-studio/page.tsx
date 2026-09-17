import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { assetUrl, publicationLabel } from '@/components/growth-admin/AdminUi'
import ConfirmFormButton from '@/components/growth-admin/ConfirmFormButton'
import VisualStudioClientV3 from '@/components/visual-studio/VisualStudioClientV3'
import { isGrowthAdminAuthenticated, queryGrowthTable } from '@/lib/growth-admin'
import { getWorkspaceContent } from '@/lib/editorial-workspace'
import type { PublicationMode, VisualFormatKey } from '@/lib/brand-system'
import { createDesignFromTemplate, type VisualDesign, type VisualStudioContentSeed, type VisualTemplateKey } from '@/lib/visual-studio'

type VisualDesignRow = {
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

export const dynamic = 'force-dynamic'

function safeReturnTo(value?: string) {
  if (!value || !value.startsWith('/growth-admin')) return '/growth-admin/content#publications'
  return value
}

function adaptSavedDesignToContent(row: VisualDesignRow, seed?: VisualStudioContentSeed): VisualDesignRow {
  if (!seed || !row.design_json?.elements?.length) return { ...row, content_id: null }
  const generated = createDesignFromTemplate(row.template_key, row.format_key, { ...seed, publication_mode: row.publication_mode })
  const byRole = new Map(generated.elements.filter((item) => item.role).map((item) => [item.role, item]))
  const byId = new Map(generated.elements.map((item) => [item.id, item]))
  const elements = row.design_json.elements.map((element) => {
    const source = (element.role ? byRole.get(element.role) : undefined) || byId.get(element.id)
    if (!source) return element
    if (element.kind === 'text' || element.kind === 'tag') return { ...element, text: source.text || '' }
    if (element.kind === 'metric') return { ...element, value: source.value || '', label: source.label || '' }
    if (element.kind === 'logo' && element.role === 'brand') return { ...source, id: element.id, role: 'brand', locked: true }
    return element
  })
  return {
    ...row,
    content_id: null,
    design_json: {
      ...row.design_json,
      designId: undefined,
      name: `${row.name} · plantilla`,
      publicationMode: row.publication_mode,
      elements,
    },
  }
}

export default async function VisualStudioPage({ searchParams }: { searchParams?: Promise<{ content?: string; deleted?: string; return_to?: string }> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = searchParams ? await searchParams : undefined
  const [contentRows, savedDesignRows] = await Promise.all([
    getWorkspaceContent(),
    queryGrowthTable<VisualDesignRow>('visual_designs', { order: 'updated_at.desc', limit: '100' }),
  ])

  const selectable = contentRows
    .filter((item) => ['linkedin_post', 'linkedin_article', 'article', 'web_article'].includes(item.content_type))
    .filter((item) => !['rejected', 'failed', 'superseded_test'].includes(item.status))
  const labels = new Map(selectable.map((item) => [item.content_id, publicationLabel(item)]))
  const content: VisualStudioContentSeed[] = selectable.map((item) => ({
    content_id: item.content_id,
    title: item.title,
    body: item.body,
    channel: item.channel,
    content_type: item.content_type,
    language: item.language,
    content_family: item.content_family,
    visual_type: item.visual_type,
    visual_path: assetUrl(item) || item.visual_path,
    publication_mode: item.publication_mode,
    hashtags: item.hashtags || [],
    visual_strategy: item.visual_strategy || {},
  }))
  const activeSeed = content.find((item) => item.content_id === params?.content) || content[0]
  const savedDesigns = savedDesignRows.map((row) => adaptSavedDesignToContent(row, activeSeed))
  const returnTo = safeReturnTo(params?.return_to)
  const concept = String(activeSeed?.visual_strategy?.illustration_concept || '')
  const theme = String(activeSeed?.visual_strategy?.theme || 'dark') === 'light' ? 'light' : 'dark'

  return <AdminShell active="visual">
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Biblioteca visual</p>
          <p className="mt-1 text-sm text-slate-600">Visual Studio V3 mantiene la publicación seleccionada, adapta las plantillas a su copy real y muestra el resultado final en vivo antes de adjuntarlo.</p>
          {Boolean(activeSeed?.visual_strategy?.visual_headline) && <p className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-800"><strong>Hook sugerido:</strong> {String(activeSeed?.visual_strategy?.visual_headline || '')}</p>}
          {!activeSeed && <p className="mt-2 text-xs font-semibold text-amber-700">Genera una pieza editorial para empezar a diseñar.</p>}
          {params?.deleted && <p className="mt-2 text-xs font-semibold text-emerald-700">Diseño eliminado correctamente.</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          {content.length > 0 && <form action="/growth-admin/visual-studio" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input type="hidden" name="return_to" value={returnTo}/>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cambiar publicación
              <select name="content" defaultValue={activeSeed?.content_id || ''} className="mt-1 block max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                {content.map((item) => <option key={item.content_id} value={item.content_id}>{labels.get(item.content_id) || 'Publicación'} · {(item.language || '—').toUpperCase()} · {item.title.slice(0, 70)}</option>)}
              </select>
            </label>
            <button className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">Cargar</button>
          </form>}
          {activeSeed ? <a href={`/growth-admin/preview/${encodeURIComponent(activeSeed.content_id)}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">Ver publicación</a> : <a href="/growth-admin/content" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">Editorial</a>}
        </div>
      </div>

      {activeSeed && <details className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
        <summary className="cursor-pointer text-xs font-semibold text-sky-900">Generar ilustración contextual con IA</summary>
        <form action="/api/growth-admin/operator-task" method="post" className="mt-3 grid gap-3 lg:grid-cols-[1fr_140px_auto]">
          <input type="hidden" name="action" value="generate_visual"/>
          <input type="hidden" name="content_id" value={activeSeed.content_id}/>
          <input type="hidden" name="return_to" value={`/growth-admin/visual-studio?content=${encodeURIComponent(activeSeed.content_id)}&return_to=${encodeURIComponent(returnTo)}`}/>
          <label className="text-[11px] font-semibold text-sky-900">Concepto visual
            <input name="concept" defaultValue={concept} placeholder="Déjalo vacío para que la IA proponga una escena concreta" className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-slate-800"/>
          </label>
          <label className="text-[11px] font-semibold text-sky-900">Tema
            <select name="theme" defaultValue={theme} className="mt-1 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-slate-800"><option value="dark">Oscuro</option><option value="light">Claro</option></select>
          </label>
          <button className="self-end rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white">Generar imagen IA</button>
        </form>
        <p className="mt-2 text-[10px] leading-4 text-sky-700">La imagen se genera sin texto ni logos; después el sistema compone el branding real de SC-Analytics y la adjunta a esta publicación.</p>
      </details>}

      {savedDesignRows.length > 0 && <details className="mt-4">
        <summary className="cursor-pointer text-xs font-semibold text-slate-700">Gestionar diseños guardados ({savedDesignRows.length})</summary>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {savedDesignRows.slice(0, 30).map((item) => <div key={item.design_id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{item.name}</p><p className="mt-1 text-[10px] text-slate-400">{item.template_key} · {item.format_key} · {item.status || 'draft'}</p></div>
            <ConfirmFormButton action="/api/growth-admin/visual-studio/delete" fields={{ design_id: item.design_id, return_to: activeSeed ? `/growth-admin/visual-studio?content=${activeSeed.content_id}&return_to=${encodeURIComponent(returnTo)}` : '/growth-admin/visual-studio' }} label="Eliminar" message="¿Eliminar este diseño guardado? Si está adjunto a una publicación, el CRM mantendrá la publicación pero retirará la referencia visual cuando corresponda."/>
          </div>)}
        </div>
      </details>}
    </div>

    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <VisualStudioClientV3 key={`${activeSeed?.content_id || 'none'}:${activeSeed?.visual_path || 'none'}`} content={content} savedDesigns={savedDesigns} initialContentId={activeSeed?.content_id} returnTo={returnTo}/>
    </div>
  </AdminShell>
}
