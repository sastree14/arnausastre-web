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

  const blocked = params.get('blocked')
  if (blocked) feedback.push({ tone: 'amber', title: 'La publicación todavía no se puede aprobar', detail: `Falta resolver: ${blocked}. La pieza permanece en revisión; corrige esos puntos y vuelve a aprobar.` })
  if (params.get('changes_requested')) feedback.push({ tone: 'amber', title: 'Cambios solicitados', detail: 'La pieza permanece en la cola editorial como “needs_review”. Puedes editar el visual o ejecutar “Reescribir y revalidar”; no se ha descartado ni perdido.' })
  if (params.get('editorial_decision')) feedback.push({ tone: 'green', title: 'Publicación aprobada', detail: 'La aprobación está guardada. El siguiente paso es programarla o usar “Publicar ahora”; aprobar por sí solo no publica.' })
  if (params.get('scheduled')) feedback.push({ tone: 'green', title: 'Publicación programada', detail: 'La nueva fecha se ha guardado. Conservas la misma vista del calendario y la pieza sigue enlazada a su workflow editorial.' })
  if (params.get('unscheduled')) feedback.push({ tone: 'amber', title: 'Fecha eliminada', detail: 'La publicación ya no tiene fecha programada. La aprobación se conserva y puedes volver a programarla o publicarla manualmente.' })

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
    const candidates = Number(gmailCandidates || 0)
    const messages = Number(params.get('gmail_messages') || 0)
    const errors = Number(params.get('gmail_errors') || 0)
    feedback.push({ tone: errors ? 'amber' : 'green', title: 'Escaneo de Gmail completado', detail: `${messages} mensaje${messages === 1 ? '' : 's'} revisado${messages === 1 ? '' : 's'} · ${candidates} candidato${candidates === 1 ? '' : 's'} de gasto detectado${candidates === 1 ? '' : 's'}${errors ? ` · ${errors} error${errors === 1 ? '' : 'es'} parcial${errors === 1 ? '' : 'es'}` : ''}. Los candidatos siguen pendientes de confirmación humana.` })
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

  const closure = params.get('closure')
  if (closure === 'generated') feedback.push({ tone: 'green', title: 'Cierre generado', detail: 'El cierre del periodo se ha generado correctamente en Sheet y PDF.' })
  if (closure === 'failed') feedback.push({ tone: 'rose', title: 'No se pudo generar el cierre', detail: 'Los datos del informe siguen intactos. Revisa Google/Drive y vuelve a intentarlo.' })
  const registerSync = params.get('register_sync')
  if (registerSync) feedback.push({ tone: registerSync === 'ok' ? 'green' : 'amber', title: 'Sincronización de libros finalizada', detail: registerSync === 'ok' ? 'Los libros financieros se han actualizado.' : 'No había cambios nuevos que escribir; los libros existentes se conservan.' })

  const reconciliation = params.get('reconciliation')
  if (reconciliation) {
    const map: Record<string, Feedback> = {
      confirmed: { tone: 'green', title: 'Conciliación confirmada', detail: 'El movimiento bancario se ha vinculado y contabilizado; si completaba el importe, la factura o gasto se ha marcado como pagado.' },
      rejected: { tone: 'amber', title: 'Conciliación rechazada', detail: 'El movimiento vuelve a quedar sin conciliar y no se contabiliza como match.' },
      already_confirmed: { tone: 'amber', title: 'Conciliación ya confirmada', detail: 'No se ha contabilizado una segunda vez.' },
      payment_missing: { tone: 'rose', title: 'No se pudo confirmar la conciliación', detail: 'Falta el movimiento de pago asociado; revisa la transacción antes de repetir el proceso.' },
    }
    if (map[reconciliation]) feedback.push(map[reconciliation])
  }

  const revolutConnected = params.get('revolut_connected')
  if (revolutConnected !== null) {
    const count = Number(revolutConnected || 0)
    feedback.push({ tone: 'green', title: 'Revolut conectado', detail: `${count} cuenta${count === 1 ? '' : 's'} detectada${count === 1 ? '' : 's'} y guardada${count === 1 ? '' : 's'}.` })
  }
  const revolutSynced = params.get('revolut_synced')
  if (revolutSynced !== null) {
    const count = Number(revolutSynced || 0)
    const reconciliations = Number(params.get('reconciliations') || 0)
    feedback.push({ tone: 'green', title: 'Banco sincronizado', detail: `${count} movimiento${count === 1 ? '' : 's'} sincronizado${count === 1 ? '' : 's'} · ${reconciliations} conciliación${reconciliations === 1 ? '' : 'es'} propuesta${reconciliations === 1 ? '' : 's'}. Revisa antes de contabilizar.` })
  }
  const revolutError = params.get('revolut_error')
  if (revolutError) feedback.push({ tone: 'rose', title: 'Revolut necesita atención', detail: `La conexión o sincronización no se completó: ${revolutError}.` })

  if (!feedback.length) return null
  return <div className="mx-auto max-w-[1780px] space-y-2 px-5 pt-4 md:px-8">
    {feedback.map((item, index) => <div key={`${item.title}-${index}`} className={`rounded-2xl border px-5 py-4 text-sm ${tones[item.tone]}`}><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 opacity-80">{item.detail}</p></div>)}
  </div>
}
