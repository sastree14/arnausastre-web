import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import VisualStudioClientV2 from '@/components/visual-studio/VisualStudioClientV2'
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

function adaptSavedDesignToContent(row: VisualDesignRow, seed?: VisualStudioContentSeed): VisualDesignRow {
  if (!seed || !row.design_json?.elements?.length) return { ...row, content_id: null }
  const generated = createDesignFromTemplate(row.template_key, row.format_key, { ...seed, publication_mode: row.publication_mode })
  const generatedByRole = new Map(generated.elements.filter((item) => item.role).map((item) => [item.role, item]))
  const generatedById = new Map(generated.elements.map((item) => [item.id, item]))

  const elements = row.design_json.elements.map((element) => {
    const source = (element.role ? generatedByRole.get(element.role) : undefined) || generatedById.get(element.id)
    if (!source) return element
    if (element.kind === 'text' || element.kind === 'tag') return { ...element, text: source.text || '' }
    if (element.kind === 'metric') return { ...element, value: source.value || '', label: source.label || '' }
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

export default async function VisualStudioPage({ searchParams }: { searchParams?: Promise<{ content?: string; deleted?: string }> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const params = searchParams ? await searchParams : undefined
  const [contentRows, savedDesignRows] = await Promise.all([
    getWorkspaceContent(),
    queryGrowthTable<VisualDesignRow>('visual_designs', { order: 'updated_at.desc', limit: '100' }),
  ])

  const content: VisualStudioContentSeed[] = contentRows
    .filter((item) => ['linkedin_post', 'article'].includes(item.content_type))
    .filter((item) => !['rejected', 'failed', 'superseded_test'].includes(item.status))
    .map((item) => ({
      content_id: item.content_id,
      title: item.title,
      body: item.body,
      channel: item.channel,
      content_type: item.content_type,
      language: item.language,
      content_family: item.content_family,
      visual_type: item.visual_type,
      visual_path: item.visual_path,
      publication_mode: item.publication_mode,
    }))

  const activeSeed = content.find((item) => item.content_id === params?.content) || content[0]
  const savedDesigns = savedDesignRows.map((row) => adaptSavedDesignToContent(row, activeSeed))
  const studioContent = activeSeed ? [activeSeed] : []

  return <AdminShell active="visual">
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Biblioteca visual</p>
          <p className="mt-1 text-sm text-slate-600">Los diseños guardados se reutilizan como <strong>plantillas</strong>: conservan composición y estilo, pero reciben el texto de la publicación seleccionada. Ya no arrastran el copy antiguo.</p>
          {!activeSeed && <p className="mt-2 text-xs font-semibold text-amber-700">El workspace editorial está vacío. Genera una nueva pieza para volver a trabajar con plantillas; los diseños guardados se han conservado.</p>}
          {params?.deleted && <p className="mt-2 text-xs font-semibold text-emerald-700">Diseño eliminado correctamente.</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          {content.length > 0 && <form action="/growth-admin/visual-studio" method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cambiar publicación
              <select name="content" defaultValue={activeSeed?.content_id || ''} className="mt-1 block max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                {content.map((item) => <option key={item.content_id} value={item.content_id}>{item.content_type === 'article' ? 'Artículo' : 'LinkedIn'} · {(item.language || '—').toUpperCase()} · {item.title.slice(0, 70)}</option>)}
              </select>
            </label>
            <button className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">Cargar</button>
          </form>}
          <a href="/growth-admin/content" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">← Editorial</a>
        </div>
      </div>
      {savedDesignRows.length > 0 && <details className="mt-4"><summary className="cursor-pointer text-xs font-semibold text-slate-700">Gestionar diseños guardados ({savedDesignRows.length})</summary><div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">{savedDesignRows.slice(0, 30).map((item) => <div key={item.design_id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{item.name}</p><p className="mt-1 text-[10px] text-slate-400">{item.template_key} · {item.format_key} · {item.status || 'draft'}</p></div><form action="/api/growth-admin/visual-studio/delete" method="post"><input type="hidden" name="design_id" value={item.design_id}/><input type="hidden" name="return_to" value={activeSeed ? `/growth-admin/visual-studio?content=${encodeURIComponent(activeSeed.content_id)}` : '/growth-admin/visual-studio'}/><button className="rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-rose-700">Eliminar</button></form></div>)}</div></details>}
    </div>
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]"><VisualStudioClientV2 content={studioContent} savedDesigns={savedDesigns} initialContentId={activeSeed?.content_id} /></div>
  </AdminShell>
}
