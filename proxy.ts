import { NextResponse, type NextRequest } from 'next/server'
import { explicitLanguageForPath } from '@/lib/seo-service-locales'
import { isCrossOriginMutation, hasExcessiveContentLength } from '@/lib/security/request-guards'

/**
 * Enforce same-origin browser mutations before they reach administrative handlers.
 * Every administrative handler must still independently authorize its session.
 * GET OAuth callbacks and scheduled jobs are unaffected.
 */
export function proxy(request:NextRequest){
  const path=request.nextUrl.pathname
  if(request.method!=='GET'&&request.method!=='HEAD'&&request.method!=='OPTIONS'){
    const admin=path.startsWith('/api/growth-admin/')
    const contact=path==='/api/contact'
    const newsletter=path==='/api/newsletter/subscribe'
    if((admin||contact||newsletter)&&isCrossOriginMutation(request)){
      return new NextResponse('Cross-origin request rejected',{status:403})
    }
    if(admin&&hasExcessiveContentLength(request,1024*1024))
      return new NextResponse('Request body too large',{status:413})
    if(contact&&hasExcessiveContentLength(request,24*1024))
      return new NextResponse('Request body too large',{status:413})
    if(newsletter&&hasExcessiveContentLength(request,8*1024))
      return new NextResponse('Request body too large',{status:413})
  }
  const response=NextResponse.next()
  const locale=explicitLanguageForPath(path)
  if(locale)response.headers.set('Content-Language',locale)
  return response
}

export const config={
  matcher:['/services/:path*','/knowledge/:path*','/partner-analitico',
    '/api/growth-admin/:path*','/api/contact','/api/newsletter/subscribe'],
}
