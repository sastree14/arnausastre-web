import { NextResponse } from 'next/server'
import { exchangeRevolutCode, saveInitialRevolutConnection } from '@/lib/revolut-finance'

export async function GET(request: Request) {
  const url=new URL(request.url)
  const code=url.searchParams.get('code')||''
  const error=url.searchParams.get('error')||''
  if(error) return NextResponse.redirect(new URL(`/growth-admin/finance/integrations?revolut_error=${encodeURIComponent(error)}`,request.url))
  if(!code) return new NextResponse('Missing Revolut authorization code',{status:400})
  try{
    const token=await exchangeRevolutCode(code)
    const accounts=await saveInitialRevolutConnection(token)
    return NextResponse.redirect(new URL(`/growth-admin/finance/integrations?revolut_connected=${accounts.length}`,request.url))
  }catch(error){
    console.error('Revolut callback failed',error)
    const message=error instanceof Error?error.message:String(error)
    return NextResponse.redirect(new URL(`/growth-admin/finance/integrations?revolut_error=${encodeURIComponent(message)}`,request.url))
  }
}
