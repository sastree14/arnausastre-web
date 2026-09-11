import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { growthSupabaseHeaders, growthSupabaseUrl } from '@/lib/supabase-growth'

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

  try {
    const upstream = await fetch(`${growthSupabaseUrl()}/storage/v1/object/${bucket}/${key}`, {
      headers: growthSupabaseHeaders(),
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
  } catch (error) {
    console.error('Growth asset proxy failed', error)
    return new NextResponse('Asset store not configured', { status: 500 })
  }
}
