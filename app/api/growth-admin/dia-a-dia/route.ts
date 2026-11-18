import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow } from '@/lib/growth-admin'

type DayTask = {
  id: string
  tenant_id: string
  title: string
  status: 'open' | 'waiting' | 'done' | 'archived'
  lane: 'today' | 'week' | 'waiting'
  followup_count: number
  waiting_until?: string|null
  contact_email?: string|null
  metadata?: Record<string, unknown> | null
}

const TENANT = 'sc-analytics'
const RETURN_TO = '/growth-admin/dia-a-dia'
const isDay = (raw: string) => /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(raw + 'T12:00:00Z'))
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
function daysAfter(raw: string, n: number): string {
  const date = new Date(raw + 'T12:00:00Z')
  date.setUTCDate(date.getUTCDate() + n)
  return date.toISOString().slice(0, 10)
}
function safeUrl(raw: string): string | null {
  if (!raw) return null
  try { const u = new URL(raw); return u.protocol === 'https:' ? u.toString() : null } catch { return null }
}
function resultRedirect(req: Request, result: string) {
  const url = new URL(RETURN_TO, req.url)
  url.searchParams.set('result', result)
  return NextResponse.redirect(url, 303)
}
function errorRedirect(req: Request, message: string) {
  const url = new URL(RETURN_TO, req.url)
  url.searchParams.set('error', message)
  return NextResponse.redirect(url, 303)
}
function numberIn(raw: FormDataEntryValue | null, fallback: number, min: number, max: number) {
  const n = Number(raw)
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback
}


type JsonAction = {
  id?:string
  action?:string
  status?:string
  waiting_until?:string|null
}
async function handleInlineChange(request:Request, todayDate:string) {
  const input=await request.json().catch(()=>null) as JsonAction|null
  if(!input||!input.id||!/^[0-9a-f-]{36}$/i.test(input.id))return NextResponse.json({error:'Identificador de tarea inválido'},{status:400})
  const match=await queryGrowthTable<DayTask>('day_tasks',{id:'eq.'+input.id,tenant_id:'eq.'+TENANT,limit:'1'},{cacheSeconds:0})
  const task=match[0]
  if(!task)return NextResponse.json({error:'No se ha encontrado la tarea'},{status:404})
  const now=new Date().toISOString()
  const changes:Record<string,unknown>={updated_at:now}
  if(input.action==='status_change') {
    const status=String(input.status||'')
    if(!['open','in_progress','waiting','done','archived'].includes(status))return NextResponse.json({error:'Estado no permitido'},{status:400})
    changes.status=status
    changes.completed_at=['done','archived'].includes(status)?now:null
    if(status==='waiting') {
      changes.lane='waiting'
      changes.scheduled_on=null
      changes.waiting_until=input.waiting_until&&isDay(input.waiting_until)?input.waiting_until:(task.status==='waiting'&&'waiting_until' in task&&typeof task.waiting_until==='string'?task.waiting_until:daysAfter(todayDate,7))
    } else if(status==='open'||status==='in_progress') {
      if(task.status==='waiting'||task.status==='done'||task.status==='archived') {
        changes.lane='today'
        changes.scheduled_on=todayDate
      }
      changes.waiting_until=null
    }
  } else if(input.action==='followup_sent') {
    if(task.status!=='waiting'||task.followup_count>=2) return NextResponse.json({error:'No se puede registrar otro seguimiento'},{status:409})
    if(!('waiting_until' in task)||!task.waiting_until||String(task.waiting_until)>todayDate) return NextResponse.json({error:'Todavía no ha vencido esta espera'},{status:409})
    const next=task.followup_count+1
    changes.followup_count=next
    changes.last_outbound_at=now
    changes.waiting_until=next>=2?null:(input.waiting_until&&isDay(input.waiting_until)?input.waiting_until:daysAfter(todayDate,7))
    if(next>=2){changes.status='archived';changes.completed_at=now}
    changes.metadata={...(task.metadata||{}),last_followup_at:now,closed_after_two_followups:next>=2}
    if(next>=2&&'contact_email' in task&&task.contact_email) {
      const matches=await queryGrowthTable<{id:string}>('day_relationships',{tenant_id:'eq.'+TENANT,contact_email:'eq.'+String(task.contact_email),limit:'4'},{cacheSeconds:0})
      await Promise.all(matches.map(m=>updateGrowthRow('day_relationships','id',m.id,{status:'dormant',followup_count:2,next_review_on:null,updated_at:now})))
    }
  } else if(input.action==='reply_received') {
    if(task.status!=='waiting')return NextResponse.json({error:'Esta tarea no está en espera'},{status:409})
    changes.status='open';changes.lane='today';changes.scheduled_on=todayDate;changes.waiting_until=null
    changes.followup_count=0;changes.last_inbound_at=now;changes.completed_at=null
    changes.metadata={...(task.metadata||{}),active_conversation:true,last_reply_at:now}
    if('contact_email' in task&&task.contact_email){
      const matches=await queryGrowthTable<{id:string}>('day_relationships',{tenant_id:'eq.'+TENANT,contact_email:'eq.'+String(task.contact_email),limit:'4'},{cacheSeconds:0})
      await Promise.all(matches.map(m=>updateGrowthRow('day_relationships','id',m.id,{
        status:'active',followup_count:0,last_interaction_on:todayDate,last_interaction_kind:'email',
        last_interaction_summary:'Respuesta registrada desde Día a día',next_review_on:null,updated_at:now,
      })))
    }
  }else return NextResponse.json({error:'Acción no permitida'},{status:400})
  const updated=await updateGrowthRow<DayTask>('day_tasks','id',input.id,changes)
  if(!updated)return NextResponse.json({error:'No se ha podido guardar la tarea'},{status:503})
  return NextResponse.json({ok:true,task:updated})
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return new NextResponse('Forbidden origin', { status: 403 })
  if((request.headers.get('content-type')||'').includes('application/json')){
    try{return await handleInlineChange(request,today())}
    catch(error){console.error('Daily inline update failed',error);return NextResponse.json({error:'Error al guardar el cambio'},{status:503})}
  }
  const data = await request.formData()
  const action = String(data.get('action') || '').trim()
  const date = today()

  try {
    if (action === 'settings') {
      const meetingMinutesRaw = numberIn(data.get('meeting_minutes'), 30, 15, 60)
      const meetingMinutes = [15, 20, 30, 45, 60].includes(meetingMinutesRaw) ? meetingMinutesRaw : 30
      await updateGrowthRow('day_settings', 'tenant_id', TENANT, {
        max_meetings_per_day: numberIn(data.get('max_meetings'), 3, 1, 10),
        max_tasks_per_day: numberIn(data.get('max_tasks'), 6, 1, 20),
        default_meeting_minutes: meetingMinutes,
        updated_at: new Date().toISOString(),
      })
      return resultRedirect(request, 'settings')
    }

    if (action === 'create') {
      const title = String(data.get('title') || '').trim().slice(0, 240)
      if (!title) return errorRedirect(request, 'Introduce un título')
      const laneRaw = String(data.get('lane') || 'today')
      const lane = laneRaw === 'week' || laneRaw === 'waiting' ? laneRaw : 'today'
      const scheduledRaw = String(data.get('scheduled_on') || '').trim()
      const dueRaw = String(data.get('due_on') || '').trim()
      const waitRaw = String(data.get('waiting_until') || '').trim()
      const scheduled_on = isDay(scheduledRaw) ? scheduledRaw : lane === 'today' ? date : null
      const due_on = isDay(dueRaw) ? dueRaw : null
      const waiting_until = lane === 'waiting' ? (isDay(waitRaw) ? waitRaw : daysAfter(date, 7)) : null
      await insertGrowthRow('day_tasks', {
        id: randomUUID(), tenant_id: TENANT, title,
        details: String(data.get('details') || '').trim().slice(0, 6000),
        status: lane === 'waiting' ? 'waiting' : 'open', lane,
        priority: numberIn(data.get('priority'), 2, 1, 3),
        scheduled_on, due_on, waiting_until,
        contact_email: String(data.get('contact_email') || '').trim().slice(0, 320) || null,
        related_url: safeUrl(String(data.get('related_url') || '')),
        related_document_url: safeUrl(String(data.get('related_document_url') || '')),
        source: 'manual',
        metadata: { created_from: 'day_to_day_dashboard' },
      })
      return resultRedirect(request, 'created')
    }

    const id = String(data.get('id') || '').trim()
    if (!/^[a-f0-9-]{36}$/i.test(id)) return errorRedirect(request, 'Tarea no válida')
    const rows = await queryGrowthTable<DayTask>('day_tasks', { id: 'eq.' + id, tenant_id: 'eq.' + TENANT, limit: '1' }, { cacheSeconds: 0 })
    const task = rows[0]
    if (!task) return errorRedirect(request, 'Tarea no encontrada')
    const now = new Date().toISOString()

    if (action === 'done') {
      await updateGrowthRow('day_tasks', 'id', id, { status: 'done', completed_at: now, updated_at: now })
    } else if (action === 'reopen') {
      await updateGrowthRow('day_tasks', 'id', id, { status: 'open', lane: 'today', scheduled_on: date, completed_at: null, updated_at: now })
    } else if (action === 'tomorrow') {
      await updateGrowthRow('day_tasks', 'id', id, { status: 'open', lane: 'today', scheduled_on: daysAfter(date, 1), completed_at: null, updated_at: now })
    } else if (action === 'wait') {
      const untilRaw = String(data.get('waiting_until') || '')
      await updateGrowthRow('day_tasks', 'id', id, { status: 'waiting', lane: 'waiting', scheduled_on: null, waiting_until: isDay(untilRaw) ? untilRaw : daysAfter(date, 7), completed_at: null, updated_at: now })
    } else if (action === 'followup_sent') {
      if (task.status !== 'waiting') return errorRedirect(request, 'Esta tarea no está en espera')
      const n = Math.min(2, Number(task.followup_count || 0) + 1)
      const closed = n >= 2
      await updateGrowthRow('day_tasks', 'id', id, {
        followup_count: n, status: closed ? 'archived' : 'waiting',
        waiting_until: closed ? null : daysAfter(date, 7),
        scheduled_on: null, last_outbound_at: now, updated_at: now,
        metadata: { ...(task.metadata || {}), active_conversation: false, last_followup_at: now, closed_after_two_followups: closed },
      })
    } else if (action === 'reply_received') {
      await updateGrowthRow('day_tasks', 'id', id, {
        status: 'open', lane: 'today', scheduled_on: date,
        waiting_until: null, followup_count: 0, last_inbound_at: now,
        updated_at: now, completed_at: null,
        metadata: { ...(task.metadata || {}), active_conversation: true, reactivated_on: now },
      })
    } else if (action === 'archive') {
      await updateGrowthRow('day_tasks', 'id', id, { status: 'archived', completed_at: now, updated_at: now })
    } else {
      return errorRedirect(request, 'Acción no admitida')
    }
    return resultRedirect(request, action)
  } catch (error) {
    console.error('Day-to-day action failed', error)
    return errorRedirect(request, 'No se ha podido guardar el cambio')
  }
}
