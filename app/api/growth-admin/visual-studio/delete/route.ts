import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { growthSupabaseHeaders, growthSupabaseUrl } from '@/lib/supabase-growth'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const designId = String(form.get('design_id') || '').trim()
  if (!designId) return new NextResponse('Missing design_id', { status: 400 })

  const url = new URL(`${growthSupabaseUrl()}/rest/v1/visual_designs`)
  url.searchParams.set('design_id', `eq.${designId}`)
  const response = await fetch(url, {
    method: 'DELETE',
    headers: growthSupabaseHeaders({ Prefer: 'return=minimal' }),
    cache: 'no-store',
  })
  if (!response.ok) return new NextResponse(`Could not delete design: ${await response.text()}`, { status: 502 })

  const returnTo = String(form.get('return_to') || '/growth-admin/visual-studio')
  const target = new URL(returnTo.startsWith('/') ? returnTo : '/growth-admin/visual-studio', request.url)
  target.searchParams.set('deleted', designId)
  return NextResponse.redirect(target, 303)
}
