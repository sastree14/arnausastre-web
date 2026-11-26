import { getCrmBundle } from '@/lib/growth-admin-performance'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getCommercialMemory, updateCommercialMemory } from '@/lib/commercial-memory'

export const dynamic = 'force-dynamic'
export async function GET(request:Request) {
  if (!(await isGrowthAdminAuthenticated())) return NextResponse.json({error:'Unauthorized'},{status:401})
  try {
    const id = new URL(request.url).searchParams.get('company_id') || undefined
    // The general memory snapshot caps each collection at 500 records.
    // Fetch lightweight person fields separately so the professional network
    // shows every saved LinkedIn invitation, including unassigned contacts.
    const [memory,crm,signalsResult,peopleResult]=await Promise.all([
      getCommercialMemory(id),
      getCrmBundle(),
      queryGrowthTable<Record<string,unknown>>('commercial_signals',{tenant_id:'eq.sc-analytics',order:'observed_at.desc',limit:'500'},{cacheSeconds:0,timeoutMs:10000}).then(data=>({data,error:false})).catch(()=>({data:[],error:true})),
      queryGrowthTable<{person_id:string;company_id?:string|null;name:string;role:string;email?:string;linkedin_url?:string;linkedin_status?:string}>('people',{
        select:'person_id,company_id,name,role,email,linkedin_url,linkedin_status,linkedin_status_source,linkedin_status_at,contact_reason,source,updated_at',
        tenant_id:'eq.sc-analytics',
        ...(id?{company_id:'eq.'+id}:{}),
        order:'updated_at.desc',
        limit:'1000',
      },{cacheSeconds:0,timeoutMs:10000}).then(data=>({data,error:false})).catch(()=>({data:[],error:true})),
    ])
    const people=peopleResult.error?memory.people:peopleResult.data.map(person=>({...person,id:person.person_id}))
    return NextResponse.json({...memory,people,people_error:peopleResult.error,opportunities:crm.opportunities,meetings:crm.meetings,commercial_signals:signalsResult.data,signals_error:signalsResult.error,configured:true},{headers:{'Cache-Control':'no-store'}})
  } catch { return NextResponse.json({error:'No se ha podido cargar el historial comercial.'},{status:503}) }
}
export async function POST(request:Request) {
  if (!(await isGrowthAdminAuthenticated())) return NextResponse.json({error:'Unauthorized'},{status:401})
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({error:'Invalid origin'},{status:403})
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body) || JSON.stringify(body).length > 100000) return NextResponse.json({error:'Invalid payload'},{status:400})
    return NextResponse.json(await updateCommercialMemory(body))
  } catch (error) {
    console.error('Commercial memory mutation failed',error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({error:'No se ha guardado. Comprueba la empresa, los campos y el estado seleccionado.'},{status:400})
  }
}
