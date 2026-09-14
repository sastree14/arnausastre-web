type Props = {
  personId: string
  companyId?: string | null
  currentStatus?: string | null
}

const quickActions = [
  { kind: 'followed', label: 'Seguido' },
  { kind: 'connection_requested', label: 'Solicitud enviada' },
  { kind: 'connected', label: 'Conectado' },
  { kind: 'message_sent', label: 'Mensaje enviado' },
  { kind: 'replied', label: 'Ha respondido' },
]

function HiddenFields({ personId, companyId, kind }: { personId: string; companyId?: string | null; kind: string }) {
  return <>
    <input type="hidden" name="person_id" value={personId}/>
    <input type="hidden" name="company_id" value={companyId || ''}/>
    <input type="hidden" name="kind" value={kind}/>
    <input type="hidden" name="channel" value="linkedin"/>
    <input type="hidden" name="return_to" value="/growth-admin/crm"/>
  </>
}

export default function PersonQuickActions({ personId, companyId, currentStatus }: Props) {
  return <div className="mt-4 border-t border-slate-100 pt-4">
    <div className="flex flex-wrap gap-2">
      {quickActions.map((action)=><form key={action.kind} action="/api/growth-admin/crm-interaction" method="post">
        <HiddenFields personId={personId} companyId={companyId} kind={action.kind}/>
        <button className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700">{action.label}</button>
      </form>)}
    </div>

    <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70">
      <summary className="cursor-pointer select-none px-3 py-2 text-[11px] font-semibold text-slate-600">Registrar nota, follow-up o cambio comercial</summary>
      <form action="/api/growth-admin/crm-interaction" method="post" className="grid gap-2 border-t border-slate-200 p-3 sm:grid-cols-2">
        <input type="hidden" name="person_id" value={personId}/>
        <input type="hidden" name="company_id" value={companyId || ''}/>
        <input type="hidden" name="channel" value="linkedin"/>
        <input type="hidden" name="return_to" value="/growth-admin/crm"/>
        <select name="kind" defaultValue="note" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          <option value="note">Nota</option>
          <option value="follow_up">Follow-up pendiente</option>
          <option value="discovery_proposed">Discovery propuesta</option>
          <option value="discovery_booked">Discovery agendada</option>
          <option value="company_invite_sent">Invitado a seguir SC-Analytics</option>
          <option value="not_interested">No interesado</option>
          <option value="discarded">Descartar</option>
        </select>
        <input name="next_action_at" type="datetime-local" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" aria-label="Próxima acción"/>
        <input name="content" placeholder="Nota, mensaje o contexto..." className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 sm:col-span-2"/>
        <div className="flex items-center justify-between gap-3 sm:col-span-2">
          <span className="text-[10px] text-slate-400">Estado actual: {currentStatus || 'candidate'}</span>
          <button className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">Guardar en CRM</button>
        </div>
      </form>
    </details>
  </div>
}
