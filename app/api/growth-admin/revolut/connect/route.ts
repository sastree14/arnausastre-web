import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { revolutAuthorizationUrl } from '@/lib/revolut-finance'

export async function GET(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  try { return NextResponse.redirect(revolutAuthorizationUrl()) }
  catch(error){
    const message=error instanceof Error?error.message:String(error)
    return NextResponse.redirect(new URL(`/growth-admin/finance/integrations?revolut_error=${encodeURIComponent(message)}`,request.url))
  }
}
