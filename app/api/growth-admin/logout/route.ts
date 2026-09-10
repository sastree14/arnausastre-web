import { NextResponse } from 'next/server'
import { growthAdminCookieName } from '@/lib/growth-admin'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/growth-admin/login', request.url), 303)
  response.cookies.set(growthAdminCookieName(), '', { httpOnly: true, path: '/', maxAge: 0 })
  return response
}
