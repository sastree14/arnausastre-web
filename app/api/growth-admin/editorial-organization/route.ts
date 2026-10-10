import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { mutateGrowthRpc } from '@/lib/supabase-growth'

export async function POST(request: Request) {
  if (!await isGrowthAdminAuthenticated()) return new NextResponse('Unauthorized', { status: 401 })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return new NextResponse('Invalid origin', { status: 403 })
  const form = await request.formData()
  const organizationId = String(form.get('organization_id') || '').trim()
  if (!/^\d{1,20}$/.test(organizationId)) return new NextResponse('Enter the numeric LinkedIn organization ID', { status: 400 })
  await mutateGrowthRpc('editorial_set_organization', { p_organization_id: organizationId })
  return NextResponse.redirect(new URL('/growth-admin/calendar', request.url), 303)
}
