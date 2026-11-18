import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { PageHeader, adminPanel } from '@/components/growth-admin/AdminUi'
import { getGmailConnections } from '@/lib/growth-integrations'
import { isGrowthAdminAuthenticated, queryGrowthTable } from '@/lib/growth-admin'

export const dynamic='force-dynamic'
export const revalidate=0
type Favourite={
  id:string;account_email:string;thread_id:string;relationship_id?:string|null;
  contact_email:string;contact_name:string;subject:string;last_message_on:string|null;
  has_star:boolean;has_user_reply:boolean;is_business:boolean;eligible:boolean;
  last_direction:string;thread_url:string|null;reviewed_at:string
}
type Relationship={id:string;status:string;role:string}
type Connection={provider_subject:string;metadata?:Record<string,unknown>}
const safeLink=(raw:string|null|undefined)=>{
  if(!raw)return ''
  try{const u=new URL(raw);return u.protocol==='https:'&&u.hostname==='mail.google.com'?raw:''}catch{return ''}
}
function formatted(date:string|null|undefined){
  if(!date)return 'Sin fecha'
  const d=new Date(date+'T12:00:00Z')
  return Number.isNaN(d.getTime())?'Sin fecha':new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(d)
}
function isRecentReview(value:string,hours:number){const stamp=Date.parse(value);return Number.isFinite(stamp)&&Date.now()-stamp<=hours*60*60*1000}

export default async function InboxPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  if(!(await isGrowthAdminAuthenticated()))redirect('/growth-admin/login')
  const params=await searchParams
  const account=typeof params.account==='string'?params.account:''
  const [messages,relationships,connections]=await Promise.all([
    queryGrowthTable<Favourite>('day_favorite_threads',{tenant_id:'eq.sc-analytics',order:'last_message_on.desc',limit:'500'},{cacheSeconds:0}).catch(()=>[] as Favourite[]),
    queryGrowthTable<Relationship>('day_relationships',{tenant_id:'eq.sc-analytics',limit:'100'},{cacheSeconds:0}).catch(()=>[] as Relationship[]),
    getGmailConnections().catch(()=>[] as Connection[]),
  ])
  const related=new Map(relationships.map(x=>[x.id,x]))
  const isEligible=(row:Favourite)=>{
    if(!row.has_star||!row.has_user_reply||!row.is_business||!row.eligible)return false
    const r=row.relationship_id?related.get(row.relationship_id):null
    return !r||((r.status==='active'||r.status==='waiting')&&r.role!=='worker')
  }
  const eligible=messages.filter(isEligible).sort((a,b)=>
    (b.last_message_on||'').localeCompare(a.last_message_on||'')||
    (b.reviewed_at||'').localeCompare(a.reviewed_at||''))
  const distinct=new Map<string,Favourite>()
  for(const row of eligible){
    const key=(row.relationship_id||row.contact_email||row.id).toLowerCase()
    if(!distinct.has(key))distinct.set(key,row)
  }
  const visible=[...distinct.values()].filter(x=>!account||x.account_email===account)
  const latest=messages.reduce((max,row)=>row.reviewed_at>max?row.reviewed_at:max,'')
  const fresh=Boolean(latest)&&isRecentReview(latest,36)
  const states=connections.filter(c=>c.provider_subject?.includes('@')).map(c=>{
    const sync=(c.metadata?.gmail_sync||{}) as Record<string,unknown>
    const error=String(sync.last_error||'')
    const last=String(sync.last_success_at||'')
    return {account:c.provider_subject,error,last}
  })
  return <AdminShell active="inbox">
    <PageHeader eyebrow="Operaciones · Clientes y colaboradores" title="Conversaciones favoritas" description="Solo hilos destacados en Gmail, con respuesta tuya y relación profesional real. Un único hilo —el más reciente— por interlocutor. Sin alertas, prospectos ignorados ni contactos rechazados."/>
    {!fresh&&<div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Revisión de favoritos pendiente de actualizar</p>
      <p className="mt-1 text-xs leading-5">Mostramos únicamente conversaciones contrastadas en la última revisión. No se añaden mensajes sin verificar y las estrellas nuevas o retiradas no serán visibles hasta la siguiente sincronización real. El buzón general antiguo queda oculto.</p>
    </div>}
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div className={adminPanel+' p-4'}><p className="text-xs text-slate-500">Conversaciones elegibles</p><p className="mt-1 text-3xl font-semibold text-slate-950">{distinct.size}</p></div>
      <div className={adminPanel+' p-4'}><p className="text-xs text-slate-500">Cuentas</p><p className="mt-1 text-lg font-semibold text-slate-950">Personal y corporativa</p></div>
      <div className={adminPanel+' p-4'}><p className="text-xs text-slate-500">Última comprobación</p><p className="mt-1 text-sm font-semibold text-slate-950">{latest?new Intl.DateTimeFormat('es-ES',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Madrid'}).format(new Date(latest)):'Sin revisión'}</p></div>
    </div>
    <div className="mb-5 flex flex-wrap gap-2">
      {[['','Ambas cuentas'],['arnau.sastre@sc-analytics.io','SC-Analytics'],['arnau.sastre@gmail.com','Gmail personal']].map(([value,label])=><a key={value} href={'/growth-admin/inbox'+(value?'?account='+encodeURIComponent(value):'')} className={'rounded-full border px-3 py-2 text-xs font-semibold '+(account===value?'border-slate-900 bg-slate-950 text-white':'border-slate-200 bg-white text-slate-700')}>{label}</a>)}
    </div>
    <section className="grid gap-3 lg:grid-cols-2">
      {visible.length?visible.map(m=><article key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="text-base font-semibold text-slate-950">{m.contact_name||m.contact_email}</h2><span className="text-xs text-slate-500">{formatted(m.last_message_on)}</span></div>
        <p className="mt-1 text-xs text-slate-500">{m.contact_email} · {m.account_email=== 'arnau.sastre@gmail.com'?'Personal':'Corporativo'}</p>
        <p className="mt-3 text-sm text-slate-700">{m.subject}</p>
        <p className="mt-2 text-xs text-slate-500">Último mensaje: {m.last_direction==='inbound'?'Recibido':m.last_direction==='outbound'?'Enviado':'Sin dirección verificada'}</p>
        {safeLink(m.thread_url)&&<a href={m.thread_url||''} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-indigo-700 underline">Abrir conversación en Gmail</a>}
      </article>):<div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">No hay conversaciones favoritas y respondidas verificadas para esta selección. No mostramos mensajes generales para rellenar el buzón.</div>}
    </section>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">Sincronización del CMI</h2>
      <p className="mt-1 text-xs text-slate-500">Esta pantalla usa la lista curada de conversaciones, no la bandeja histórica de 2026. La conexión directa de ChatGPT puede revisar Gmail; la sincronización del CMI requiere autorización válida.</p>
      {states.map(s=><p key={s.account} className="mt-2 text-xs text-slate-600">{s.account}: última sincronización {s.last?new Date(s.last).toLocaleDateString('es-ES'):'no disponible'}{s.error?' · hay una incidencia pendiente':''}</p>)}
      <div className="mt-3 flex flex-wrap gap-2">
        <a href="/api/growth-admin/google/connect?account=personal&return_to=/growth-admin/inbox" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Reautorizar Gmail personal</a>
        <a href="/api/growth-admin/google/connect?account=corporate&return_to=/growth-admin/inbox" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Reautorizar SC-Analytics</a>
      </div>
    </section>
  </AdminShell>
}
