import Link from 'next/link'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge, EmptyState, PageHeader, adminPanel } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { queryGrowthTable } from '@/lib/supabase-growth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Sector = { code: string; name: string; company_count: number | string }
type CompanyPerson = {
  name?: string
  role?: string
  linkedin_url?: string
  source_url?: string
  status?: string
}
type Company = {
  company_id: string
  name: string
  website: string
  sector: string
  commercial_sector_code: string
  country?: string
  industry?: string
  employee_range?: string
  employees_source_url?: string
  employees_as_of?: string
  activity_description?: string
  cnae_code?: string
  province?: string
  address_city?: string
  autonomous_community?: string
  legal_identifier?: string
  revenue_eur?: number | string | null
  revenue_year?: number | null
  revenue_source_url?: string
  general_email?: string
  general_email_source_url?: string
  phone?: string
  phone_source_url?: string
  linkedin_url?: string
  source_url?: string
  recommended_service?: string
  proposed_value?: string
  notes?: string
  brief?: string
  next_step?: string
  next_step_at?: string
  last_outbound_at?: string
  last_reply_at?: string
  visible_commercial_state: string
  research_checked_at?: string
  people?: CompanyPerson[] | null
}

const PAGE_SIZE = 36
const STATUS: Record<string, string> = {
  sin_contactar: 'Sin contactar',
  correo_enviado: 'Correo enviado',
  llamada_fria: 'Llamada fría',
  en_conversacion: 'En conversación',
  seguimiento_programado: 'Seguimiento programado',
  accion_vencida: 'Acción vencida',
  sin_respuesta_30d: 'Sin respuesta · 30 días',
  historial: 'Historial',
  contacted: 'Contactado',
  discovered: 'Investigación inicial',
  pendiente_clasificar: 'Por clasificar',
}
const STATUS_TONES = new Set(['en_conversacion', 'seguimiento_programado'])
const ATTENTION_TONES = new Set(['accion_vencida', 'sin_respuesta_30d'])

function safeUrl(value?: string | null) {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

function dateLabel(value?: string | null) {
  if (!value) return 'No consta'
  const d = new Date(value)
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' }) : 'No consta'
}

function euros(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n) : null
}

function hrefFor(sector: string, query: string, page = 1) {
  const params = new URLSearchParams()
  if (sector !== 'todos') params.set('sector', sector)
  if (query) params.set('q', query)
  if (page > 1) params.set('page', String(page))
  const suffix = params.toString()
  return '/growth-admin/tejido-empresarial' + (suffix ? '?' + suffix : '')
}

function Detail({ label, value, source }: { label: string; value?: string | null; source?: string | null }) {
  const verifiedSource = safeUrl(source)
  return <div className="min-w-0 border-b border-slate-100 py-2">
    <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</dt>
    <dd className="mt-1 break-words text-sm text-slate-800">{value?.trim() || <span className="text-slate-400">Pendiente de investigación</span>}</dd>
    {verifiedSource && <a href={verifiedSource} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-all text-[11px] font-medium text-indigo-700 hover:underline">Fuente publicada ↗</a>}
  </div>
}

export default async function TejidoEmpresarialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  const params = await searchParams
  const first = (value: string | string[] | undefined) => typeof value === 'string' ? value : (value?.[0] || '')
  const selectedRaw = first(params.sector).toUpperCase()
  const selected = /^SC(0[1-9]|1[0-8])$/.test(selectedRaw) ? selectedRaw : 'todos'
  const query = first(params.q).trim().replace(/[(),.*%]/g, '').slice(0, 90)
  const parsedPage = Number(first(params.page))
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 10000) : 1

  let sectors: Sector[] = []
  let companies: Company[] = []
  let error: string | null = null

  try {
    sectors = await queryGrowthTable<Sector>('crm_sector_company_counts_v', { order: 'code.asc', limit: '18' }, { cacheSeconds: 0, timeoutMs: 9000 })
    const filters: Record<string, string> = {
      order: 'name.asc', limit: String(PAGE_SIZE + 1), offset: String((page - 1) * PAGE_SIZE),
    }
    if (selected !== 'todos') filters.commercial_sector_code = 'eq.' + selected
    if (query) filters.name = 'ilike.*' + query + '*'
    companies = await queryGrowthTable<Company>('crm_sector_company_fiches_v', filters, { cacheSeconds: 0, timeoutMs: 12000 })
  } catch {
    error = 'No se han podido consultar las fichas ahora mismo. Los datos del CRM no se han modificado.'
  }

  const total = sectors.reduce((n, s) => n + Number(s.company_count || 0), 0)
  const shown = companies.slice(0, PAGE_SIZE)
  const more = companies.length > PAGE_SIZE

  return <AdminShell active="business-fabric">
    <PageHeader
      eyebrow="Comercial · Prospección sectorial"
      title="Tejido empresarial"
      description="Empresas españolas investigadas y guardadas por sector. Cada ficha distingue datos acreditados, contactos, responsables y estado real de la relación comercial."
      actions={<Link href="/growth-admin/network" className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">Red profesional</Link>}
    />

    <section className="mb-8 grid gap-3 sm:grid-cols-3">
      <div className={adminPanel + ' p-5'}><p className="text-xs text-slate-500">Sectores definidos</p><p className="mt-2 text-3xl font-semibold text-slate-950">{sectors.length || 18}</p></div>
      <div className={adminPanel + ' p-5'}><p className="text-xs text-slate-500">Empresas en catálogo curado</p><p className="mt-2 text-3xl font-semibold text-slate-950">{total.toLocaleString('es-ES')}</p></div>
      <div className={adminPanel + ' p-5'}><p className="text-xs text-slate-500">Fuente y validación</p><p className="mt-2 text-sm font-semibold text-slate-950">Sin fichas inventadas</p><p className="mt-1 text-xs text-slate-500">Las empresas nuevas aparecen al verificarlas y guardarlas.</p></div>
    </section>

    <section aria-label="Seleccionar sector" className="mb-6">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Explorar por industria</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {sectors.map((sector) => <Link key={sector.code} href={hrefFor(sector.code, query)} prefetch={false}
          className={'rounded-xl border p-3 transition hover:border-indigo-300 ' + (selected === sector.code ? 'border-indigo-400 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700')}>
          <p className="text-[10px] font-semibold tracking-wide text-slate-400">{sector.code}</p>
          <p className="mt-1 text-xs font-semibold leading-5">{sector.name}</p>
          <p className="mt-2 text-xl font-semibold">{Number(sector.company_count || 0).toLocaleString('es-ES')}</p>
        </Link>)}
      </div>
    </section>

    <section className={adminPanel + ' p-4 sm:p-5'}>
      <form method="get" action="/growth-admin/tejido-empresarial" className="flex flex-col gap-3 md:flex-row">
        <label className="flex-1 text-xs font-semibold text-slate-600">
          Buscar empresa
          <input name="q" type="search" defaultValue={query} placeholder="Nombre de empresa…" maxLength={90}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
        </label>
        <label className="min-w-52 text-xs font-semibold text-slate-600">
          Sector
          <select name="sector" defaultValue={selected} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
            <option value="todos">Todos los sectores</option>
            {sectors.map((s) => <option key={s.code} value={s.code}>{s.code} · {s.name}</option>)}
          </select>
        </label>
        <button type="submit" className="self-end rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Filtrar</button>
      </form>

      {error && <div role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>}
      {!error && <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">{shown.length} fichas en esta página · página {page}</p>
        <p className="text-xs text-slate-500">Solo empresas con sector y web acreditada</p>
      </div>}

      {!error && shown.length === 0 && <div className="mt-5"><EmptyState>
        Aún no hay empresas verificadas para este filtro. El catálogo empieza vacío y se incorporarán compañías investigadas con una fuente y web oficial, sin recuperar el censo descartado.
      </EmptyState></div>}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {shown.map((company) => {
          const website = safeUrl(company.website)
          const linkedIn = safeUrl(company.linkedin_url)
          const status = company.visible_commercial_state || 'pendiente_clasificar'
          const persons = Array.isArray(company.people) ? company.people : []
          const money = euros(company.revenue_eur)
          return <article key={company.company_id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">{company.commercial_sector_code} · {company.sector}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">{company.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{[company.address_city, company.province, company.country === 'ES' ? 'España' : company.country].filter(Boolean).join(' · ') || 'Ubicación por documentar'}</p>
              </div>
              <Badge tone={ATTENTION_TONES.has(status) ? 'amber' : STATUS_TONES.has(status) ? 'green' : 'slate'}>{STATUS[status] || status.replaceAll('_', ' ')}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">{company.activity_description || company.industry || 'Actividad pendiente de descripción verificada.'}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {website && <a href={website} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 font-semibold text-indigo-700">Web oficial ↗</a>}
              {linkedIn && <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700">LinkedIn ↗</a>}
              {company.phone && <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700">{company.phone}</span>}
              {company.general_email && <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700">{company.general_email}</span>}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-200 py-3">
              <div><p className="text-[10px] uppercase tracking-wide text-slate-400">Tamaño</p><p className="mt-1 text-xs font-medium text-slate-800">{company.employee_range || 'Por investigar'}</p></div>
              <div><p className="text-[10px] uppercase tracking-wide text-slate-400">Facturación</p><p className="mt-1 text-xs font-medium text-slate-800">{money ? money + (company.revenue_year ? ' · ' + company.revenue_year : '') : 'Por investigar'}</p></div>
            </div>
            <details className="group mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-indigo-700 marker:text-indigo-500">Ver ficha completa y responsables</summary>
              <dl className="mt-3 grid gap-x-5 sm:grid-cols-2">
                <Detail label="CIF/NIF" value={company.legal_identifier}/>
                <Detail label="CNAE" value={company.cnae_code}/>
                <Detail label="Actividad" value={company.activity_description || company.industry} source={company.source_url}/>
                <Detail label="Dirección / provincia" value={[company.address_city, company.province, company.autonomous_community].filter(Boolean).join(', ')}/>
                <Detail label="Empleados" value={company.employee_range ? company.employee_range + (company.employees_as_of ? ' · ' + dateLabel(company.employees_as_of) : '') : null} source={company.employees_source_url}/>
                <Detail label="Facturación (año)" value={money ? money + (company.revenue_year ? ' · ' + company.revenue_year : ' · año pendiente') : null} source={company.revenue_source_url}/>
                <Detail label="Email corporativo" value={company.general_email} source={company.general_email_source_url}/>
                <Detail label="Teléfono corporativo" value={company.phone} source={company.phone_source_url}/>
                <Detail label="Servicio potencial SC-Analytics" value={company.recommended_service}/>
                <Detail label="Próxima acción" value={company.next_step ? company.next_step + (company.next_step_at ? ' · ' + dateLabel(company.next_step_at) : '') : null}/>
                <Detail label="Último contacto saliente" value={company.last_outbound_at ? dateLabel(company.last_outbound_at) : null}/>
                <Detail label="Última respuesta" value={company.last_reply_at ? dateLabel(company.last_reply_at) : null}/>
                <Detail label="Última revisión de fuentes" value={company.research_checked_at ? dateLabel(company.research_checked_at) : null}/>
              </dl>
              <div className="mt-4 border-t border-slate-200 pt-3">
                <h4 className="text-sm font-semibold text-slate-950">Responsables profesionales</h4>
                {persons.length === 0 ? <p className="mt-2 text-xs text-slate-500">CEO, CFO y responsables operativos pendientes de identificar con fuentes públicas.</p> :
                <ul className="mt-2 space-y-2">{persons.map((person, index) => <li key={index} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                  <span className="font-semibold">{person.name}</span> · {person.role || 'Cargo por verificar'}
                  <div className="mt-1 flex gap-3 text-xs">
                    {safeUrl(person.source_url) && <a href={safeUrl(person.source_url)!} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">Fuente pública ↗</a>}
                    {safeUrl(person.linkedin_url) && <a href={safeUrl(person.linkedin_url)!} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">Perfil LinkedIn ↗</a>}
                  </div>
                </li>)}</ul>}
              </div>
              {(company.brief || company.proposed_value || company.notes) && <div className="mt-4 border-t border-slate-200 pt-3 text-sm leading-6 text-slate-700">
                <h4 className="font-semibold">Contexto comercial</h4>
                <p className="mt-1 whitespace-pre-wrap">{company.brief || company.proposed_value || company.notes}</p>
              </div>}
              {safeUrl(company.source_url) && <a href={safeUrl(company.source_url)!} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-indigo-700 hover:underline">Ver fuente de identificación ↗</a>}
            </details>
          </article>
        })}
      </div>

      {!error && (page > 1 || more) && <nav aria-label="Paginación" className="mt-6 flex justify-between border-t border-slate-100 pt-4 text-sm">
        {page > 1 ? <Link href={hrefFor(selected, query, page - 1)} prefetch={false} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700">← Anterior</Link> : <span />}
        {more && <Link href={hrefFor(selected, query, page + 1)} prefetch={false} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700">Siguiente →</Link>}
      </nav>}
    </section>
    <p className="mt-5 pb-6 text-xs leading-6 text-slate-500">Esta sección no inventa empresas ni responsables. Las fichas se completan gradualmente con fuentes verificables; una conexión LinkedIn no implica contacto comercial realizado.</p>
  </AdminShell>
}
