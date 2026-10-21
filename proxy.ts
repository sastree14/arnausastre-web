import { NextResponse, type NextRequest } from 'next/server'
import { explicitLanguageForPath } from '@/lib/seo-service-locales'

/**
 * Provide an explicit Content-Language HTTP response header on language-specific
 * routes. The root layout remains static to preserve homepage performance.
 * SiteLanguageProvider synchronizes document.documentElement.lang on hydration
 * and client navigation for accessibility; hreflang/canonical stay in metadata.
 */
export function proxy(request:NextRequest){
  const response=NextResponse.next()
  const locale=explicitLanguageForPath(request.nextUrl.pathname)
  if(locale)response.headers.set('Content-Language',locale)
  return response
}

export const config={
  matcher:['/services/:path*','/knowledge/:path*','/partner-analitico'],
}
