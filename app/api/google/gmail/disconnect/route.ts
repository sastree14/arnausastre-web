import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { disconnectGmail } from '@/lib/growth-integrations'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const email = String(form.get('email') || '').trim().toLowerCase()
  if (!email) return new NextResponse('Missing email', { status: 400 })
  await disconnectGmail(email)
  return NextResponse.redirect(new URL('/growth-admin/inbox?gmail=disconnected', request.url), 303)
}
