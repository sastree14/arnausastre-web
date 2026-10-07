import { notFound, redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, PageHeader } from '@/components/growth-admin/AdminUi'
import GeneratedKnowledgeArticleGoldStandard from '@/components/GeneratedKnowledgeArticleGoldStandard'
import { getBankArticle, toPreviewVariants, type ArticleBankLanguage } from '@/lib/article-bank'
import { isGrowthAdminAuthenticated, queryGrowthTable, type GrowthContentItem } from '@/lib/growth-admin'
import { fallbackServiceForArticle, KNOWLEDGE_GOLD_STANDARD_IDS, KNOWLEDGE_SERVICES, presentationForArticle, publicationOrderForSequence } from '@/lib/knowledge-editorial'

export const metadata = { robots: { index: false, follow: false } }

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ specId: string; locale: string }> }
const SUPPORTED = new Set<ArticleBankLanguage>(['es','ca','en'])

export default async function ArticleBankPreviewPage({ params }: Props) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const { specId, locale: rawLocale } = await params
  if (!SUPPORTED.has(rawLocale as ArticleBankLanguage)) notFound()
  const locale = rawLocale as ArticleBankLanguage
  const article = getBankArticle(decodeURIComponent(specId))
  if (!article) notFound()

  const variants = toPreviewVariants(article)
  const materializedFamily = await queryGrowthTable<GrowthContentItem>('content_items', {
    tenant_id: 'eq.sc-analytics',
    content_type: 'eq.article',
    channel: 'eq.website',
    brief_id: `eq.${article.slug}`,
    limit: '10',
  }, { cacheSeconds: 0 }).catch(() => [])
  const familyByLanguage = new Map(materializedFamily.map(row => [String(row.language || ''), row]))
  const familyApproved = ['es','ca','en'].every(language => familyByLanguage.get(language)?.status === 'approved')
  const familyScheduled = ['es','ca','en'].every(language => familyByLanguage.get(language)?.status === 'scheduled')
  const familyPublished = ['es','ca','en'].every(language => familyByLanguage.get(language)?.status === 'published')
  const scheduleItem = familyByLanguage.get('es') || materializedFamily[0]
  const familyScheduledAt = scheduleItem?.scheduled_at || null
  const order = publicationOrderForSequence(article.sequence)
  const serviceKey = fallbackServiceForArticle({ cluster: article.cluster, specId: article.spec_id })
  const service = KNOWLEDGE_SERVICES[serviceKey]
  const presentation = presentationForArticle(article.content_family, article.spec_id)

  return (
    <AdminShell active="content">
      <PageHeader
        eyebrow="Knowledge · Preview canónica"
        title={article.variants[locale]?.title || article.variants.es.title}
        description="Preview privada. Esta página no publica, no indexa y no modifica el estado editorial. Sirve para validar el resultado final antes de programar la familia ES · CA · EN."
        actions={
          <>
            <a href="/growth-admin/articles" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white">Volver al banco</a>
            {(['es','ca','en'] as const).map(language => (
              <a
                key={language}
                href={`/growth-admin/article-preview/${encodeURIComponent(article.spec_id)}/${language}`}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${language === locale ? 'bg-white text-slate-950' : 'border border-slate-700 text-white'}`}
              >
                {language.toUpperCase()}
              </a>
            ))}
          </>
        }
      />

      <section className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone="violet">{article.spec_id}</Badge>
          <Badge>orden editorial {String(order).padStart(3,'0')}</Badge>
          <Badge>{presentation}</Badge>
          <Badge>{article.content_family || 'article'}</Badge>
          <Badge>{service.labels.es}</Badge>
          {KNOWLEDGE_GOLD_STANDARD_IDS.has(article.spec_id) && <Badge tone="green">gold standard</Badge>}
          {familyPublished ? <Badge tone="green">publicada</Badge> : familyScheduled ? <Badge tone="blue">programada</Badge> : familyApproved ? <Badge tone="green">familia aprobada</Badge> : <Badge tone="amber">pendiente de revisión</Badge>}
        </div>
        <p className="mt-3 text-xs leading-5 text-indigo-900">
          Flujo correcto: preview privado → revisión humana → aprobación de la familia ES · CA · EN → programación → publicación automática. La ruta pública no existe hasta publicar; no hace falta publicar y ocultar.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {(['es','ca','en'] as const).map(language => {
            const row = familyByLanguage.get(language)
            return (
              <div key={language} className="rounded-xl border border-indigo-100 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900">{language.toUpperCase()}</span>
                  <Badge tone={row?.status === 'published' || row?.status === 'approved' ? 'green' : row?.status === 'scheduled' ? 'blue' : 'amber'}>
                    {row?.status || 'sin materializar'}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-slate-500">{row?.title || article.variants[language]?.title}</p>
              </div>
            )
          })}
        </div>

        {!familyPublished && !familyScheduled && (
          <div className="mt-4 flex flex-wrap gap-2">
            <form action="/api/growth-admin/knowledge-family-decision" method="post">
              <input type="hidden" name="spec_id" value={article.spec_id} />
              <input type="hidden" name="decision" value="approved" />
              <input type="hidden" name="return_to" value={`/growth-admin/article-preview/${encodeURIComponent(article.spec_id)}/${locale}`} />
              <button className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                Aprobar familia ES · CA · EN
              </button>
            </form>
            <form action="/api/growth-admin/knowledge-family-decision" method="post">
              <input type="hidden" name="spec_id" value={article.spec_id} />
              <input type="hidden" name="decision" value="changes_requested" />
              <input type="hidden" name="return_to" value={`/growth-admin/article-preview/${encodeURIComponent(article.spec_id)}/${locale}`} />
              <button className="rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-50">
                Marcar para cambios
              </button>
            </form>
          </div>
        )}

        {familyApproved && scheduleItem && (
          <form action="/api/growth-admin/schedule" method="post" className="mt-4 grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <input type="hidden" name="content_id" value={scheduleItem.content_id} />
            <label className="text-xs font-semibold text-emerald-950">
              Programar esta familia
              <input required type="datetime-local" name="scheduled_at" className="mt-1 block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-sm text-slate-900" />
            </label>
            <button className="rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900">
              Programar ES · CA · EN
            </button>
          </form>
        )}

        {familyScheduled && familyScheduledAt && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-5 text-blue-900">
            Familia programada para <strong>{new Date(familyScheduledAt).toLocaleString('es-ES')}</strong>. El publisher la hará pública cuando llegue ese momento.
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
          Preview privada · no indexable
        </div>
        <GeneratedKnowledgeArticleGoldStandard variants={variants} forcedLanguage={locale} />
      </section>
    </AdminShell>
  )
}
