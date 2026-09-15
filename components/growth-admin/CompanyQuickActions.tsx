type Props = {
  companyId: string
  currentStatus?: string | null
}

export default function CompanyQuickActions({ companyId, currentStatus }: Props) {
  return <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
    <form action="/api/growth-admin/crm-interaction" method="post" className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <input type="hidden" name="company_id" value={companyId}/>
      <input type="hidden" name="channel" value="crm"/>
      <input type="hidden" name="return_to" value="/growth-admin/crm"/>
      <select name="kind" defaultValue="company_researching" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
        <option value="company_researching">Investigar empresa</option>
        <option value="company_followed">Empresa seguida</option>
        <option value="company_contact_identified">Contacto identificado</option>
        <option value="company_contacted">Empresa contactada</option>
        <option value="company_completed">Finalizar seguimiento</option>
        <option value="company_discarded">Descartar / archivar</option>
        <option value="company_note">Añadir nota</option>
      </select>
      <button className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">Guardar</button>
      <input name="content" placeholder="Nota o contexto de la acción..." className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 sm:col-span-2"/>
    </form>

    <details className="rounded-xl border border-indigo-100 bg-indigo-50/50">
      <summary className="cursor-pointer select-none px-3 py-2 text-[11px] font-semibold text-indigo-700">Añadir CEO / decisor / contacto</summary>
      <form action="/api/growth-admin/crm-person" method="post" className="grid gap-2 border-t border-indigo-100 p-3 sm:grid-cols-2">
        <input type="hidden" name="company_id" value={companyId}/>
        <input type="hidden" name="return_to" value="/growth-admin/crm"/>
        <input name="name" required placeholder="Nombre y apellidos" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"/>
        <input name="role" defaultValue="CEO / Founder" placeholder="Cargo" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"/>
        <input name="linkedin_url" placeholder="URL de LinkedIn (opcional)" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 sm:col-span-2"/>
        <input name="evidence" placeholder="Fuente, descripción o por qué creemos que es el decisor" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 sm:col-span-2"/>
        <div className="flex items-center justify-between gap-3 sm:col-span-2">
          <span className="text-[10px] text-slate-400">Estado empresa: {currentStatus || 'candidate'}</span>
          <button className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700">Guardar contacto</button>
        </div>
      </form>
    </details>
  </div>
}
