import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow } from '@/lib/growth-admin'
import { deleteGrowthAsset, growthSupabaseHeaders, growthSupabaseUrl } from '@/lib/supabase-growth'

export const runtime = 'nodejs'
export const maxDuration = 30

const TENANT = 'sc-analytics'
const BUCKET = 'growth-assets'
const MAX_BYTES = 12 * 1024 * 1024
const TYPES: Record<string,string> = {
  'audio/webm':'webm',
  'audio/ogg':'ogg',
  'audio/mp4':'m4a',
  'audio/mpeg':'mp3',
  'audio/wav':'wav',
  'audio/x-m4a':'m4a',
  'audio/aac':'aac',
}
type Note = { id:string; tenant_id:string; audio_path:string|null }

function safeOrigin(request:Request) {
  const origin = request.headers.get('origin')
  return !origin || origin === new URL(request.url).origin
}
function dateKey() {
  return new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
}

export async function POST(request:Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  if (!safeOrigin(request)) return new NextResponse('Forbidden origin',{status:403})
  const form = await request.formData().catch(() => null)
  if (!form) return new NextResponse('Invalid form',{status:400})
  const title = String(form.get('title')||'').trim().slice(0,240)
  const body = String(form.get('body')||'').trim().slice(0,20000)
  const contactEmail = String(form.get('contact_email')||'').trim().slice(0,320)
  const meetingDate = String(form.get('meeting_date')||'')
  const taskTitle = String(form.get('task_title')||'').trim().slice(0,240)
  const taskDate = String(form.get('task_date')||'')
  const file = form.get('audio')
  if (!title) return NextResponse.json({error:'Pon un título a la nota'},{status:400})
  const isAudio = file instanceof File && file.size>0
  if (!isAudio && !body) return NextResponse.json({error:'Graba audio o escribe una nota'},{status:400})
  if (isAudio && file.size>MAX_BYTES) return NextResponse.json({error:'Audio demasiado largo (máximo 12 MB)'},{status:413})
  const type = isAudio ? String(file.type||'').split(';')[0].toLowerCase() : ''
  if (isAudio && !TYPES[type]) return NextResponse.json({error:'Formato de audio no admitido'},{status:415})
  const noteId = randomUUID()
  let audioPath:string|null = null
  try {
    if (isAudio) {
      const path = 'day-to-day/audio/' + noteId + '.' + TYPES[type]
      const upstream = await fetch(growthSupabaseUrl() + '/storage/v1/object/' + BUCKET + '/' + path, {
        method:'POST', cache:'no-store', headers:growthSupabaseHeaders({'Content-Type':type, 'x-upsert':'false'}),
        body:new Uint8Array(await file.arrayBuffer()),
      })
      if (!upstream.ok) throw new Error('Audio upload failed ' + upstream.status)
      audioPath = 'supabase://' + BUCKET + '/' + path
    }
    await insertGrowthRow('day_notes',{
      id:noteId,tenant_id:TENANT,title,body,
      meeting_date:/^\d{4}-\d{2}-\d{2}$/.test(meetingDate)?meetingDate:null,
      contact_email:contactEmail||null,
      audio_path:audioPath,
      transcription_state:isAudio?(body?'transcribed':'needs_text'):'none',
    })
    // A written, attributable post-meeting note is a verified interaction.
    // Audio without text stays a recording only; never infer commitments from it.
    if (contactEmail && body.trim()) {
      const eventDay=/^\d{4}-\d{2}-\d{2}$/.test(meetingDate)&&meetingDate<=dateKey()?meetingDate:dateKey()
      const relations=await queryGrowthTable<{id:string}>('day_relationships',{
        tenant_id:'eq.'+TENANT,contact_email:'eq.'+contactEmail.toLowerCase(),limit:'5'
      },{cacheSeconds:0}).catch(()=>[] as Array<{id:string}>)
      await Promise.all(relations.map(r=>updateGrowthRow('day_relationships','id',r.id,{
        status:'active',followup_count:0,last_interaction_on:eventDay,
        last_interaction_kind:'meeting',last_interaction_summary:body.slice(0,1200),
        last_verified_at:new Date().toISOString(),updated_at:new Date().toISOString(),
      })))
    }
    if (taskTitle) {
      await insertGrowthRow('day_tasks',{
        id:randomUUID(),tenant_id:TENANT,title:taskTitle,source:'meeting_note',source_key:noteId,
        details:body.slice(0,6000),status:'open',lane:'today',priority:2,
        scheduled_on:/^\d{4}-\d{2}-\d{2}$/.test(taskDate)?taskDate:dateKey(),
        contact_email:contactEmail||null,
        metadata:{note_id:noteId,created_from:'voice_note'},
      })
    }
    return NextResponse.json({ok:true,id:noteId,audio_saved:Boolean(audioPath),text_saved:Boolean(body),task_created:Boolean(taskTitle)})
  } catch (error) {
    console.error('Daily voice note failed',error)
    if(audioPath)await deleteGrowthAsset(audioPath).catch(()=>undefined)
    return NextResponse.json({error:'No se ha podido guardar la nota'},{status:503})
  }
}

export async function GET(request:Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const id = new URL(request.url).searchParams.get('id')||''
  if(!/^[0-9a-f-]{36}$/i.test(id))return new NextResponse('Invalid note',{status:400})
  const notes = await queryGrowthTable<Note>('day_notes',{id:'eq.'+id,tenant_id:'eq.'+TENANT,limit:'1'},{cacheSeconds:0})
  const ref=notes[0]?.audio_path
  if(!ref||!ref.startsWith('supabase://' + BUCKET + '/day-to-day/audio/'))return new NextResponse('Audio not found',{status:404})
  const key = ref.slice(('supabase://'+BUCKET+'/').length)
  if(!/^day-to-day\/audio\/[0-9a-f-]{36}\.(webm|ogg|m4a|mp3|wav|aac)$/i.test(key))return new NextResponse('Invalid audio path',{status:400})
  const upstream=await fetch(growthSupabaseUrl()+'/storage/v1/object/'+BUCKET+'/'+key,{
    headers:growthSupabaseHeaders(),cache:'no-store',
  })
  if(!upstream.ok)return new NextResponse('Audio unavailable',{status:upstream.status})
  const type=String(upstream.headers.get('content-type')||'').split(';')[0].toLowerCase()
  if(!TYPES[type])return new NextResponse('Unsupported audio type',{status:415})
  const bytes=await upstream.arrayBuffer()
  if(bytes.byteLength>MAX_BYTES)return new NextResponse('Audio too large',{status:413})
  return new NextResponse(bytes,{
    headers:{'Content-Type':type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'},
  })
}
