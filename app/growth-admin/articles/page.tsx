import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, PageHeader, adminPanel } from '@/components/growth-admin/AdminUi'
import { ARTICLE_BANK } from '@/lib/article-bank'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { fallbackServiceForArticle, KNOWLEDGE_GOLD_STANDARD_IDS, KNOWLEDGE_SERVICES, publicationOrderForSequence } from '@/lib/knowledge-editorial'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> }

function textParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

export default async function KnowledgeBankReviewPage({ searchParams }: Props) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params = searchParams ? await searchParams : {}
  const q = textParam(params.q).trim().toLowerCase()
  const cluster = textParam(params.cluster)
  const family = textParam(params.family)

  const clusters = [...new Set(ARTICLE_BANK.map(article => article.cluster || ''))].filter(Boolean)
  const families = [...new Set(ARTICLE_BANK.map(article => article.content_family || ''))].filter(Boolean)

  const rows = ARTICLE_BANK
    .filter(article => !q || [
      article.spec_id,
      article.variants.es?.title,
      article.variants.en?.title,
      article.variants.ca?.title,
      article.cluster,
      article.content_family,
      article.primary_keyword,
    ].some(value => String(value || '').toLowerCase().includes(q)))
    .filter(article => !cluster || article.cluster === cluster)
    .filter(article => !family || article.content_family === family)
    .sort((a, b) => publicationOrderForSequence(a.sequence) - publicationOrderForSequence(b.sequence))

  return (
    <AdminShell active="content">
      <PageHeader
        eyebrow="Knowledge · Revisión privada"
        title="Banco editorial · 200 artículos"
        description="Aquí puedes revisar visualmente todo el banco canónico sin publicar nada. El preview usa exactamente el mismo renderer que la web pública, pero no expone estas páginas a Google ni cambia estados en Supabase."
        actions={
          <>
            <a href="/growth-admin/content" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white">Biblioteca</a>
            <a href="/growth-admin/calendar" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Calendario</a>
          </>
        }
      />

      <section className="mb-6 grid gap-3 md:grid-cols-4">
        {[
          ['Familias', ARTICLE_BANK.length, '200 artículos canónicos'],
          ['Idiomas', ARTICLE_BANK.length * 3, 'ES · CA · EN'],
          ['Gold standard', ARTICLE_BANK.filter(article => KNOWLEDGE_GOLD_STANDARD_IDS.has(article.spec_id)).length, 'Referencias internas'],
          ['Mostrados', rows.length, 'Después de filtros'],
        ].map(([label, value, note]) => (
          <div key={String(label)} className={`${adminPanel} p-5`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{note}</p>
          </div>
        ))}
      </section>

      <form className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_260px_240px_auto]">
        <input name="q" defaultValue={textParam(params.q)} placeholder="Buscar título, tema o keyword" className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
        <select name="cluster" defaultValue={cluster} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
          <option value="">Todos los clusters</option>
          {clusters.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
        <select name="family" defaultValue={family} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
          <option value="">Todas las familias</option>
          {families.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
        <button className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Filtrar</button>
      </form>

      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map(article => {
          const order = publicationOrderForSequence(article.sequence)
          const serviceKey = fallbackServiceForArticle({ cluster: article.cluster, specId: article.spec_id })
          const service = KNOWLEDGE_SERVICES[serviceKey]
          const gold = KNOWLEDGE_GOLD_STANDARD_IDS.has(article.spec_id)
          return (
            <article key={article.spec_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="violet">{article.spec_id}</Badge>
                <Badge>orden {String(order).padStart(3, '0')}</Badge>
                {gold && <Badge tone="green">gold standard</Badge>}
                <Badge>{article.content_family || 'article'}</Badge>
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">{article.variants.es?.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{article.cluster} · {service.labels.es}</p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{article.variants.es?.excerpt}</p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {(['es','ca','en'] as const).map(locale => (
                  <a
                    key={locale}
                    href={`/growth-admin/article-preview/${encodeURIComponent(article.spec_id)}/${locale}`}
                    className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
                  >
                    Preview {locale.toUpperCase()}
                  </a>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </AdminShell>
  )
}
