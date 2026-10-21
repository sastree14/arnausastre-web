import { NextResponse, type NextRequest } from 'next/server'
import { explicitLanguageForPath } from '@/lib/seo-service-locales'

/**
 * Provide the language of an explicit localized route to the root layout
 * without changing its URL, visual design, cookies or caching policy.
 *
 * The header is internal request state, not returned to the browser.
 * Never use it for authorization.
 */
export function proxy(request: NextRequest) {
  const language=explicitLanguageForPath(request.nextUrl.pathname)
  if (!language) return NextResponse.next()
  const requestHeaders=new Headers(request.headers)
  requestHeaders.set('x-sc-document-language',language)
  return NextResponse.next({request:{headers:requestHeaders}})
}

export const config={
  matcher:['/services/:path*','/knowledge/:path*','/partner-analitico'],
}
