import { NextResponse } from 'next/server'
import { createGrowthAdminSession, growthAdminCookieName } from '@/lib/growth-admin'

export async function POST(request: Request) {
  const form = await request.formData()
  const submitted = String(form.get('token') || '')
  const expected = (process.env.GROWTH_ADMIN_TOKEN || '').trim()

  if (!expected || submitted !== expected) return new NextResponse('Unauthorized', { status: 401 })

  const session = createGrowthAdminSession()
  const response = NextResponse.redirect(new URL('/growth-admin', request.url), 303)
  response.cookies.set(growthAdminCookieName(), session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: session.maxAge,
  })
  return response
}
