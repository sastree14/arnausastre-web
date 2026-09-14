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
      cache: 'force-cache',
      next: { revalidate: 60 },
    })
    if (!upstream.ok) return new NextResponse('Asset not found', { status: upstream.status })

    const body = await upstream.arrayBuffer()
    const headers: Record<string, string> = {
      'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
      // Private keeps protected assets out of shared/CDN caches, while the browser
      // can reuse thumbnails during normal CRM navigation instead of downloading
      // the same object dozens of times.
      'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
    }
    const etag = upstream.headers.get('etag')
    const lastModified = upstream.headers.get('last-modified')
    if (etag) headers.ETag = etag
    if (lastModified) headers['Last-Modified'] = lastModified

    return new NextResponse(body, { status: 200, headers })
  } catch (error) {
    console.error('Growth asset proxy failed', error)
    return new NextResponse('Asset store temporarily unavailable', { status: 503 })
  }
}
