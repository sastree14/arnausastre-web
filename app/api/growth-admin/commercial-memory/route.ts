import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getCommercialMemory, updateCommercialMemory } from '@/lib/commercial-memory'

export const dynamic = 'force-dynamic'
export async function GET(request:Request) {
  if (!(await isGrowthAdminAuthenticated())) return NextResponse.json({error:'Unauthorized'},{status:401})
  try {
    const id = new URL(request.url).searchParams.get('company_id') || undefined
    return NextResponse.json({...await getCommercialMemory(id),configured:true},{headers:{'Cache-Control':'no-store'}})
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
