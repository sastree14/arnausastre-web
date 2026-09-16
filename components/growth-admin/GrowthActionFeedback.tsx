'use client'

import { useSearchParams } from 'next/navigation'

type Feedback = { tone: 'green' | 'amber' | 'rose'; title: string; detail: string }

const tones = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  rose: 'border-rose-200 bg-rose-50 text-rose-800',
}

export default function GrowthActionFeedback() {
  const params = useSearchParams()
  const feedback: Feedback[] = []

  const calendlySync = params.get('calendly_sync')
  if (calendlySync !== null) {
    const meetings = Number(calendlySync || 0)
    const people = Number(params.get('calendly_people') || 0)
    const opportunities = Number(params.get('calendly_opportunities') || 0)
    const webhook = params.get('calendly_webhook') || 'unknown'
    const warning = params.get('calendly_warning') === '1'
    const webhookReady = webhook === 'created' || webhook === 'existing'
    feedback.push({
      tone: warning || !webhookReady ? 'amber' : 'green',
      title: 'Calendly sincronizado',
      detail: `${meetings} reunión${meetings === 1 ? '' : 'es'} revisada${meetings === 1 ? '' : 's'} · ${people} contacto${people === 1 ? '' : 's'} vinculado${people === 1 ? '' : 's'} · ${opportunities} oportunidad${opportunities === 1 ? '' : 'es'} vinculada${opportunities === 1 ? '' : 's'}. Webhook: ${webhookReady ? 'activo' : warning ? 'requiere revisión' : webhook}.`,
    })
  }

  if (params.get('google_connected') === '1') feedback.push({ tone: 'green', title: 'Google conectado', detail: 'La autorización se ha guardado. Los módulos que usan Drive, Gmail, GA4 o Search Console pueden comprobar ahora sus permisos reales.' })
  const googleError = params.get('google_error')
  if (googleError) feedback.push({ tone: 'rose', title: 'Google necesita atención', detail: `La autorización o sincronización no se completó: ${googleError}. Revisa Configuración e integraciones antes de repetir el proceso.` })

  const gmailCandidates = params.get('gmail_candidates')
  if (gmailCandidates !== null) {
    const messages = Number(params.get('gmail_messages') || 0)
    const errors = Number(params.get('gmail_errors') || 0)
    feedback.push({ tone: errors ? 'amber' : 'green', title: 'Escaneo de Gmail completado', detail: `${messages} mensaje${messages === 1 ? '' : 's'} revisado${messages === 1 ? '' : 's'} · ${Number(gmailCandidates || 0)} candidato${Number(gmailCandidates || 0) === 1 ? '' : 's'} de gasto detectado${Number(gmailCandidates || 0) === 1 ? '' : 's'}${errors ? ` · ${errors} error${errors === 1 ? '' : 'es'} parcial${errors === 1 ? '' : 'es'}` : ''}. Los candidatos siguen pendientes de confirmación humana.` })
  }

  const invoiceIssued = params.get('invoice_issued')
  if (invoiceIssued) feedback.push({ tone: 'green', title: 'Factura emitida', detail: `${invoiceIssued} se ha emitido y sus documentos se han generado. La factura ya queda tratada como registro inmutable.` })
  if (params.get('invoice_already_issued') === '1') feedback.push({ tone: 'amber', title: 'Factura ya emitida', detail: 'No se ha vuelto a emitir ni se ha generado una segunda numeración.' })
  const invoiceError = params.get('invoice_error')
  if (invoiceError) {
    const messages: Record<string, string> = {
      review_required: 'Haz primero el doble check de la factura.',
      issuer_settings: 'Completa razón social, NIF y dirección fiscal antes de emitir.',
      google_not_configured: 'Configura Google Drive/Sheets para poder generar los documentos de emisión.',
      generation_failed: 'La generación de documentos falló. La factura no se ha marcado como emitida.',
    }
    feedback.push({ tone: 'rose', title: 'No se ha podido emitir la factura', detail: messages[invoiceError] || invoiceError })
  }

  const revolutConnected = params.get('revolut_connected')
  if (revolutConnected !== null) feedback.push({ tone: 'green', title: 'Revolut conectado', detail: `${Number(revolutConnected || 0)} cuenta${Number(revolutConnected || 0) === 1 ? '' : 's'} detectada${Number(revolutConnected || 0) === 1 ? '' : 's'} y guardada${Number(revolutConnected || 0) === 1 ? '' : 's'}.` })
  const revolutSynced = params.get('revolut_synced')
  if (revolutSynced !== null) feedback.push({ tone: 'green', title: 'Banco sincronizado', detail: `${Number(revolutSynced || 0)} movimiento${Number(revolutSynced || 0) === 1 ? '' : 's'} sincronizado${Number(revolutSynced || 0) === 1 ? '' : 's'} · ${Number(params.get('reconciliations') || 0)} conciliación${Number(params.get('reconciliations') || 0) === 1 ? '' : 'es'} propuesta${Number(params.get('reconciliations') || 0) === 1 ? '' : 's'}. Revisa antes de contabilizar.` })
  const revolutError = params.get('revolut_error')
  if (revolutError) feedback.push({ tone: 'rose', title: 'Revolut necesita atención', detail: `La conexión o sincronización no se completó: ${revolutError}.` })

  if (!feedback.length) return null
  return <div className="mx-auto max-w-[1780px] space-y-2 px-5 pt-4 md:px-8">
    {feedback.map((item, index) => <div key={`${item.title}-${index}`} className={`rounded-2xl border px-5 py-4 text-sm ${tones[item.tone]}`}><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 opacity-80">{item.detail}</p></div>)}
  </div>
}
