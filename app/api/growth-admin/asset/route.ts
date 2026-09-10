import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export async function GET(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const url = new URL(request.url)
  const ref = url.searchParams.get('ref') || ''
  if (!ref.startsWith('supabase://')) return new NextResponse('Unsupported asset reference', { status: 400 })

  const rest = ref.slice('supabase://'.length)
  const slash = rest.indexOf('/')
  if (slash <= 0) return new NextResponse('Malformed asset reference', { status: 400 })
  const bucket = rest.slice(0, slash)
  const key = rest.slice(slash + 1)
  if (bucket !== (process.env.SUPABASE_ASSET_BUCKET || 'growth-assets')) {
    return new NextResponse('Asset bucket not allowed', { status: 403 })
  }

  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceKey) return new NextResponse('Asset store not configured', { status: 500 })

  const upstream = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${key}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    cache: 'no-store',
  })
  if (!upstream.ok) return new NextResponse('Asset not found', { status: upstream.status })

  const body = await upstream.arrayBuffer()
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
      'Cache-Control': 'private, no-store',
    },
  })
}
