import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { mutateGrowthRpc } from '@/lib/supabase-growth'

export async function POST(request: Request) {
  if (!await isGrowthAdminAuthenticated()) return new NextResponse('Unauthorized', { status: 401 })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return new NextResponse('Invalid origin', { status: 403 })
  const form = await request.formData()
  const contentId = String(form.get('content_id') || 'P148')
  if (!/^P\d{3}$/.test(contentId)) return new NextResponse('Invalid publication', { status: 400 })
  const id = await mutateGrowthRpc<number>('editorial_request_tick', { p_dry_run: true, p_content_id: contentId })
  const url = new URL('/growth-admin/calendar', request.url)
  url.searchParams.set('test_request', String(id))
  return NextResponse.redirect(url, 303)
}
