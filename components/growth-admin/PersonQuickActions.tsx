type Props = {
  personId: string
  companyId?: string | null
  currentStatus?: string | null
  returnTo?: string
}

const STATUS_LABELS: Record<string, string> = {
  candidate: 'Pendiente de clasificar',
  followed: 'Seguido',
  connection_requested: 'Invitación enviada',
  connected: 'Conectado',
  contacted: 'Mensaje enviado',
  replied: 'Ha respondido',
  follow_up: 'Follow-up',
  discovery_proposed: 'Discovery propuesta',
  discovery_booked: 'Discovery agendada',
  proposal_sent: 'Propuesta enviada',
  negotiation: 'Negociación',
  completed: 'Finalizado',
  not_interested: 'No interesado',
  discarded: 'Descartado',
}

export default function PersonQuickActions({ personId, companyId, currentStatus, returnTo = '/growth-admin/crm' }: Props) {
  return <div className="mt-4 border-t border-slate-100 pt-4">
    <form action="/api/growth-admin/crm-interaction" method="post" className="grid gap-2 sm:grid-cols-2">
      <input type="hidden" name="person_id" value={personId}/>
      <input type="hidden" name="company_id" value={companyId || ''}/>
      <input type="hidden" name="channel" value="linkedin"/>
      <input type="hidden" name="return_to" value={returnTo}/>
      <select name="kind" defaultValue="followed" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
        <optgroup label="Arnau · LinkedIn personal">
          <option value="followed">He seguido a esta persona</option>
          <option value="connection_requested">He enviado invitación</option>
          <option value="connected">Hemos conectado</option>
          <option value="message_sent">He enviado mensaje</option>
          <option value="replied">Me ha respondido</option>
          <option value="follow_up">Preparar follow-up</option>
        </optgroup>
        <optgroup label="Pipeline comercial">
          <option value="discovery_proposed">Discovery propuesta</option>
          <option value="discovery_booked">Discovery agendada</option>
          <option value="proposal_sent">Propuesta enviada</option>
          <option value="negotiation">En negociación</option>
          <option value="won">Oportunidad ganada</option>
          <option value="lost">Oportunidad perdida</option>
        </optgroup>
        <optgroup label="SC-Analytics · página">
          <option value="company_invite_sent">Invitado a seguir SC-Analytics</option>
        </optgroup>
        <optgroup label="Gestión">
          <option value="completed">Finalizar seguimiento</option>
          <option value="not_interested">No interesado</option>
          <option value="discarded">Descartar / archivar</option>
          <option value="note">Solo añadir nota</option>
        </optgroup>
      </select>
      <input name="next_action_at" type="datetime-local" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" aria-label="Próxima acción"/>
      <input name="content" placeholder="Mensaje, nota o contexto de esta acción..." className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 sm:col-span-2"/>
      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <span className="text-[10px] text-slate-400">Ahora: {STATUS_LABELS[currentStatus || 'candidate'] || currentStatus || 'Pendiente'}</span>
        <button className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">Guardar acción</button>
      </div>
    </form>
  </div>
}
