import {redirect} from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import {Badge,PageHeader,adminButtonPrimary,adminButtonSecondary,adminInput,assetUrl,publicationLabel} from '@/components/growth-admin/AdminUi'
import ConfirmFormButton from '@/components/growth-admin/ConfirmFormButton'
import LinkedInPreview from '@/components/growth-admin/LinkedInPreview'
import GeneratedArticleContent from '@/components/GeneratedArticleContent'
import {getContentItem,isGrowthAdminAuthenticated,queryGrowthTable,type GrowthContentItem} from '@/lib/growth-admin'
import {getContentPublicationReadiness} from '@/lib/growth-approval'

export const dynamic='force-dynamic'
export const revalidate=0

type Props={params:Promise<{contentId:string}>;searchParams?:Promise<Record<string,string|string[]|undefined>>}

export default async function PublicationPreviewPage({params,searchParams}:Props){
  if(!(await isGrowthAdminAuthenticated()))redirect('/growth-admin/login')
  const{contentId}=await params
  const item=await getContentItem(contentId)
  const query=searchParams?await searchParams:{}
  if(!item)return <AdminShell active="content"><PageHeader eyebrow="Preview" title="Contenido no encontrado"/></AdminShell>

  const isLinkedInPost=item.content_type==='linkedin_post'
  const isLinkedInArticle=item.content_type==='linkedin_article'
  const isWebsiteArticle=item.content_type==='article'&&item.channel==='website'
  const articleFamily=isWebsiteArticle&&item.brief_id?await queryGrowthTable<GrowthContentItem>('content_items',{tenant_id:'eq.sc-analytics',brief_id:`eq.${item.brief_id}`,channel:'eq.website',content_type:'eq.article',order:'language.asc',limit:'10'},{cacheSeconds:0}):[]
  const articleLanguages=new Set(articleFamily.map(row=>String(row.language||'')))
  const articleFamilyComplete=['es','ca','en'].every(language=>articleLanguages.has(language))
  const image=assetUrl(item)
  const gate=await getContentPublicationReadiness(contentId)
  const issues=gate?.readiness.issues||[]
  const published=item.status==='published'
  const approved=['approved','scheduled','published'].includes(item.status)
  const returnTo=`/growth-admin/preview/${encodeURIComponent(item.content_id)}#decision`
  const strategy=item.visual_strategy||{}
  const tags=item.hashtags||[]

  return <AdminShell active="content">
    <PageHeader eyebrow="Preview de destino" title={item.title} description="Este es el punto canónico para editar, revisar, aprobar, publicar o retirar la pieza." actions={<><a href="/growth-admin/content" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300">Editorial</a><a href={`/growth-admin/visual-studio?content=${encodeURIComponent(item.content_id)}`} className="rounded-lg border border-sky-800 px-4 py-2.5 text-sm text-sky-300">Visual Studio</a></>}/>

    {(query.approved||query.edited||query.linkedin_article_published||query.linkedin_article_unpublished)&&<div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Cambios guardados correctamente.</div>}
    {query.manual_unpublish&&isLinkedInArticle&&published&&<div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Retirada manual necesaria.</strong> Abre el artículo en LinkedIn, elimínalo allí y después confirma la retirada en este CRM. No marcaremos la pieza como retirada antes de que tú lo confirmes.</div>}

    <div className="mb-5 flex flex-wrap gap-2"><Badge tone={isLinkedInPost?'blue':'violet'}>{publicationLabel(item)}</Badge><Badge>{(item.language||'—').toUpperCase()}</Badge><Badge>{item.publication_mode||'text_only'}</Badge>{item.visual_path&&<Badge tone="green">visual adjunto</Badge>}<Badge>{item.status}</Badge>{Boolean((item.critique as Record<string,unknown>|null)?.manual_edited_at)&&<Badge tone="violet">editado manualmente</Badge>}</div>

    {isWebsiteArticle&&articleFamily.length>1&&<section className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-indigo-700">Publicación web multilingüe</p><p className="mt-2 max-w-3xl text-xs leading-5 text-indigo-900">Este artículo se publica como una sola familia. Al aprobar y publicar una versión, el workflow publicará ES, CA y EN juntos siempre que las tres traducciones hayan superado la revisión automática. LinkedIn sigue siendo una publicación independiente en un único idioma.</p></div><Badge tone={articleFamilyComplete?'green':'amber'}>{articleFamilyComplete?'ES · CA · EN listos':'Faltan traducciones'}</Badge></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{['es','ca','en'].map(language=>{const variant=articleFamily.find(row=>row.language===language);return <a key={language} href={variant?`/growth-admin/preview/${variant.content_id}`:'#'} className={`rounded-xl border p-3 ${variant?'border-indigo-100 bg-white':'border-amber-200 bg-amber-50'}`}><div className="flex items-center justify-between"><span className="text-xs font-semibold">{language.toUpperCase()}</span><Badge tone={variant?.status==='needs_review'?'amber':variant?.status==='published'?'green':'slate'}>{variant?.status||'missing'}</Badge></div><p className="mt-2 line-clamp-2 text-[11px] leading-4 text-slate-500">{variant?.title||'Variante no generada'}</p></a>})}</div>{item.visual_path&&Boolean((item.visual_strategy as Record<string,unknown>|null)?.language_neutral)&&<p className="mt-3 text-[11px] text-indigo-700">El visual adjunto es neutro de idioma y se reutilizará en las tres versiones.</p>}</section>}

    {!published&&<section id="decision" className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form action="/api/growth-admin/content-edit" method="post" data-live-form="1" className="rounded-2xl border border-slate-200 bg-white p-5">
        <input type="hidden" name="content_id" value={item.content_id}/><input type="hidden" name="return_to" value={returnTo}/>
        <p className="text-sm font-semibold text-slate-950">Edición manual</p>
        <label className="mt-3 block text-xs font-semibold text-slate-600">Título de la publicación<input name="title" defaultValue={item.title} className={`mt-1 w-full ${adminInput}`}/></label>
        <label className="mt-3 block text-xs font-semibold text-slate-600">Texto<textarea name="body" defaultValue={item.body||''} className={`mt-1 min-h-64 w-full ${adminInput}`}/></label>
        {isLinkedInPost&&<div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">Pregunta abierta<input name="engagement_question" defaultValue={String(strategy.engagement_question||'')} placeholder="¿Cómo lo estáis resolviendo vosotros?" className={`mt-1 w-full ${adminInput}`}/></label>
          <label className="text-xs font-semibold text-slate-600">Hashtags<input name="hashtags" defaultValue={tags.join(' ')} placeholder="#DemandForecasting #SupplyChain" className={`mt-1 w-full ${adminInput}`}/></label>
          <label className="text-xs font-semibold text-slate-600 md:col-span-2">Hook visual<input name="visual_headline" defaultValue={String(strategy.visual_headline||'')} placeholder="Frase corta para detener el scroll" className={`mt-1 w-full ${adminInput}`}/></label>
          <label className="text-xs font-semibold text-slate-600">Apoyo visual<input name="visual_support" defaultValue={String(strategy.visual_support||'')} className={`mt-1 w-full ${adminInput}`}/></label>
          <label className="text-xs font-semibold text-slate-600">Tipo<select name="visual_type" defaultValue={String(strategy.visual_type||'statement')} className={`mt-1 w-full ${adminInput}`}><option value="statement">Statement</option><option value="metric">Métrica</option><option value="question">Pregunta</option><option value="comparison">Comparación</option><option value="process">Proceso</option><option value="illustration">Ilustración contextual</option></select></label>
          <label className="text-xs font-semibold text-slate-600 md:col-span-2">Concepto para ilustración<input name="illustration_concept" defaultValue={String(strategy.illustration_concept||'')} placeholder="Escena u objeto concreto; el generador no añadirá texto ni logos" className={`mt-1 w-full ${adminInput}`}/><span className="mt-1 block text-[10px] font-normal leading-4 text-slate-400">Puedes generar la ilustración directamente desde Visual Studio.</span></label>
          <label className="text-xs font-semibold text-slate-600">Tema<select name="visual_theme" defaultValue={String(strategy.theme||'dark')} className={`mt-1 w-full ${adminInput}`}><option value="dark">Oscuro · logo blanco</option><option value="light">Claro · logo oscuro</option></select></label>
        </div>}
        <button className={`mt-4 ${adminButtonSecondary}`}>Guardar cambios</button>
      </form>

      <div className="space-y-3">
        <div className={`rounded-2xl border p-4 ${issues.length?'border-amber-200 bg-amber-50':'border-emerald-200 bg-emerald-50'}`}><p className="text-xs font-semibold text-slate-900">Revisión automática (orientativa)</p>{issues.length?<><p className="mt-1 text-xs leading-5 text-amber-800">Son alertas, no bloqueos. Puedes corregirlas, pedir otra versión o aprobar igualmente.</p><ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-amber-800">{issues.map(issue=><li key={issue}>{issue}</li>)}</ul></>:<p className="mt-1 text-xs text-emerald-800">No hay alertas automáticas relevantes.</p>}</div>

        {!approved?<form action="/api/growth-admin/decide" method="post" data-live-form="1" className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4"><input type="hidden" name="content_id" value={item.content_id}/><input type="hidden" name="decision" value="approved"/><input type="hidden" name="manual_override" value="1"/><input type="hidden" name="return_to" value={returnTo}/><p className="text-xs font-semibold text-indigo-900">Decisión humana</p><p className="mt-1 text-[11px] leading-5 text-indigo-700">Tu aprobación tiene prioridad y queda trazada si existen alertas.</p><button className={`mt-3 w-full ${adminButtonPrimary}`}>Aprobar manualmente</button></form>:
          isLinkedInArticle?<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-semibold text-amber-900">Artículo LinkedIn · publicación manual</p><p className="mt-1 text-[11px] leading-5 text-amber-800">Copia el contenido en el editor de artículos de LinkedIn. Cuando esté publicado, pega aquí la URL final para cerrar el ciclo sin fingir una automatización que LinkedIn no ofrece.</p><form action="/api/growth-admin/linkedin-article-published" method="post" className="mt-3"><input type="hidden" name="content_id" value={item.content_id}/><input type="hidden" name="return_to" value={returnTo}/><input required type="url" name="external_post_url" placeholder="https://www.linkedin.com/..." className={`w-full ${adminInput}`}/><button className={`mt-2 w-full ${adminButtonPrimary}`}>Registrar como publicado</button></form></div>:
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-semibold text-emerald-900">Aprobada</p><p className="mt-1 text-[11px] text-emerald-800">Puedes publicarla ahora sin salir de esta pieza.</p><form action="/api/growth-admin/publish-now" method="post" className="mt-3"><input type="hidden" name="content_id" value={item.content_id}/><input type="hidden" name="return_to" value={returnTo}/><button className={`w-full ${adminButtonPrimary}`}>Publicar ahora</button></form></div>}

        <form action="/api/growth-admin/operator-task" method="post"><input type="hidden" name="action" value="rewrite_content"/><input type="hidden" name="content_id" value={item.content_id}/><input type="hidden" name="return_to" value={returnTo}/><button className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700">Proponer nueva versión con IA</button></form>
        <ConfirmFormButton action="/api/growth-admin/content-delete" fields={{content_id:item.content_id,return_to:'/growth-admin/content?filter=review'}} label="Eliminar borrador" message="¿Eliminar esta pieza del CRM? Esta acción elimina también relaciones editoriales asociadas a la pieza."/>
      </div>
    </section>}

    {published&&<section id="decision" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-5">
      <p className="text-sm font-semibold text-rose-900">Gestión de publicación activa</p>
      {isLinkedInArticle?<><p className="mt-2 text-xs leading-5 text-rose-800">Los artículos nativos de LinkedIn se publican y eliminan manualmente. El CRM conserva la URL y no marcará el artículo como retirado hasta que confirmes que ya lo has eliminado en LinkedIn.</p><div className="mt-4 flex flex-wrap gap-2">{item.external_post_url&&<a href={item.external_post_url} target="_blank" rel="noreferrer" className={adminButtonSecondary}>Abrir artículo en LinkedIn ↗</a>}<ConfirmFormButton action="/api/growth-admin/linkedin-article-unpublished" fields={{content_id:item.content_id,return_to:'/growth-admin/content#publications'}} label="Confirmar que ya lo retiré" message="Confirma solo si el artículo ya ha sido eliminado manualmente de LinkedIn. El CRM conservará la trazabilidad histórica."/></div></>:<><p className="mt-2 text-xs leading-5 text-rose-800">Puedes retirar la publicación directamente desde el CRM. La pieza se conserva internamente para mantener trazabilidad y métricas históricas.</p><div className="mt-4 flex flex-wrap gap-2"><ConfirmFormButton action="/api/growth-admin/operator-task" fields={{action:isLinkedInPost?'unpublish_linkedin':'unpublish_article',content_id:item.content_id,return_to:returnTo}} label={isLinkedInPost?'Retirar de LinkedIn':'Retirar de la web'} message={isLinkedInPost?'¿Eliminar el post original de LinkedIn y marcarlo como retirado en el CRM?':'¿Retirar este artículo de la web? Dejará de ser público cuando termine el workflow.'}/>{item.external_post_url&&<a href={item.external_post_url} target="_blank" rel="noreferrer" className={adminButtonSecondary}>Ver publicado</a>}</div></>}
    </section>}

    {isLinkedInPost?<section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-8"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Así se enviará al feed</p>{Boolean(strategy.visual_headline)&&<p className="text-xs text-indigo-700"><strong>Hook visual:</strong> {String(strategy.visual_headline)}</p>}</div><LinkedInPreview item={item}/></section>:<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-xs font-semibold uppercase text-amber-800">{isLinkedInArticle?'Preview de Artículo LinkedIn':'Preview privada web'}</div><GeneratedArticleContent variants={[{...item,body:item.body||'',status:item.status,visual_path:item.visual_path,published_at:item.published_at,created_at:item.created_at}]}/></section>}
    {!isLinkedInPost&&image&&<p className="mt-4 text-xs text-slate-600">El hero mostrado usa el mismo asset adjunto a la publicación.</p>}
  </AdminShell>
}
