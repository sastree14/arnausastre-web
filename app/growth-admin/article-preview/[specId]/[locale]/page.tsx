import { notFound, redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, PageHeader } from '@/components/growth-admin/AdminUi'
import GeneratedKnowledgeArticleGoldStandard from '@/components/GeneratedKnowledgeArticleGoldStandard'
import { getBankArticle, toPreviewVariants, type ArticleBankLanguage } from '@/lib/article-bank'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
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
        </div>
        <p className="mt-3 text-xs leading-5 text-indigo-900">
          Flujo correcto: preview privado → revisión humana → estado aprobado/programado en Supabase → publicación automática de las tres variantes → la ruta pública empieza a existir para Google. No hace falta publicar y ocultar.
        </p>
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
