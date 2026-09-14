import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, PageHeader, assetUrl } from '@/components/growth-admin/AdminUi'
import LinkedInPreview from '@/components/growth-admin/LinkedInPreview'
import GeneratedArticleContent from '@/components/GeneratedArticleContent'
import { getContentItem, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ contentId: string }> }

export default async function PublicationPreviewPage({ params }: Props) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const { contentId } = await params
  const item = await getContentItem(contentId)
  if (!item) return <AdminShell active="content"><PageHeader eyebrow="Preview" title="Contenido no encontrado"/><a href="/growth-admin/content" className="text-sky-300">← Volver a contenido</a></AdminShell>

  const isLinkedIn = item.content_type === 'linkedin_post'
  const image = assetUrl(item)
  return <AdminShell active="content">
    <PageHeader
      eyebrow="Preview de destino"
      title={item.title}
      description="Esta pantalla usa el mismo comportamiento de publicación que el destino final. Nada de lo que ves aquí se publica por abrir la preview."
      actions={<><a href="/growth-admin/content" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300">← Contenido</a><a href={`/growth-admin/visual-studio?content=${encodeURIComponent(item.content_id)}`} className="rounded-lg border border-sky-800 px-4 py-2.5 text-sm text-sky-300">Editar visual</a></>}
    />

    <div className="mb-6 flex flex-wrap gap-2"><Badge tone={isLinkedIn ? 'blue' : 'violet'}>{isLinkedIn ? 'LinkedIn' : 'Web'}</Badge><Badge>{(item.language || '—').toUpperCase()}</Badge><Badge>{item.publication_mode || 'text_only'}</Badge>{item.visual_path && <Badge tone="green">visual adjunto</Badge>}<Badge>{item.status}</Badge></div>

    {isLinkedIn ? <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 md:p-8"><p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Así se enviará al feed</p><LinkedInPreview item={item}/></section> : <section className="overflow-hidden rounded-2xl border border-slate-800 bg-white"><div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">PREVIEW PRIVADA · este artículo todavía no es público por abrir esta pantalla</div><GeneratedArticleContent variants={[{...item, body: item.body || '', status: item.status, visual_path: item.visual_path, published_at: item.published_at, created_at: item.created_at}]} /></section>}

    {!isLinkedIn && image && <p className="mt-4 text-xs text-slate-600">El hero mostrado arriba se sirve desde el mismo asset adjunto a la publicación.</p>}
  </AdminShell>
}
