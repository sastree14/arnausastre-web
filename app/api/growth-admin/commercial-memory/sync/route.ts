import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { syncCommercialGmail } from '@/lib/commercial-gmail'

export const maxDuration=60
export async function POST(request:Request) {
 if(!(await isGrowthAdminAuthenticated()))return NextResponse.json({error:'Unauthorized'},{status:401})
 const origin=request.headers.get('origin')
 if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Invalid origin'},{status:403})
 const body=await request.json().catch(()=>({}))
 try {return NextResponse.json(await syncCommercialGmail(Math.min(30,Math.max(1,Number(body.days)||14)),Math.min(100,Math.max(1,Number(body.limit)||40))))}
 catch{return NextResponse.json({error:'No se ha podido completar la revisión del correo.'},{status:503})}
}
