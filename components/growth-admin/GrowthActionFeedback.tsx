'use client'

import { useSearchParams } from 'next/navigation'

export default function GrowthActionFeedback() {
  const params = useSearchParams()
  const calendlySync = params.get('calendly_sync')
  if (calendlySync === null) return null

  const meetings = Number(calendlySync || 0)
  const people = Number(params.get('calendly_people') || 0)
  const opportunities = Number(params.get('calendly_opportunities') || 0)
  const webhook = params.get('calendly_webhook') || 'unknown'
  const warning = params.get('calendly_warning') === '1'
  const webhookReady = webhook === 'created' || webhook === 'existing'

  return <div className={`rounded-2xl border px-5 py-4 text-sm ${warning || !webhookReady ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">Calendly sincronizado</p>
        <p className="mt-1 text-xs leading-5 opacity-80">{meetings} reunión{meetings === 1 ? '' : 'es'} revisada{meetings === 1 ? '' : 's'} · {people} contacto{people === 1 ? '' : 's'} vinculado{people === 1 ? '' : 's'} · {opportunities} oportunidad{opportunities === 1 ? '' : 'es'} vinculada{opportunities === 1 ? '' : 's'}.</p>
      </div>
      <span className="shrink-0 rounded-full border border-current/20 bg-white/50 px-2.5 py-1 text-[10px] font-semibold">Webhook: {webhookReady ? 'activo' : warning ? 'revisar' : webhook}</span>
    </div>
    {warning && <p className="mt-2 text-xs leading-5">La sincronización de datos terminó, pero la configuración automática del webhook requiere revisión en Sistema.</p>}
  </div>
}
