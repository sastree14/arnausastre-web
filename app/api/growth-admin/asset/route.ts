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
  // Keep this authenticated proxy bound to a single storage object, not a
  // user-controlled URL or an unexpected traversal through the storage API.
  const segments=key.split('/')
  if(!key||key.length>900||segments.some(segment=>!segment||segment==='.'||segment==='..')||
     /[\\\\\u0000-\u001F\u007F?#]/.test(key) || /%(?:2e|2f|5c)/i.test(key))
    return new NextResponse('Invalid asset path',{status:400})
  const safeObjectPath=segments.map(encodeURIComponent).join('/')
  if (bucket !== (process.env.SUPABASE_ASSET_BUCKET || 'growth-assets')) {
    return new NextResponse('Asset bucket not allowed', { status: 403 })
  }

  try {
    const upstream = await fetch(`${growthSupabaseUrl()}/storage/v1/object/${encodeURIComponent(bucket)}/${safeObjectPath}`, {
      headers: growthSupabaseHeaders(),
      cache: 'force-cache',
      next: { revalidate: 60 },
    })
    if (!upstream.ok) return new NextResponse('Asset not found', { status: upstream.status })

    // Refuse active content on our application's own origin.
    const contentType=(upstream.headers.get('content-type')||'').split(';')[0].toLowerCase()
    if(!['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(contentType))
      return new NextResponse('Unsupported asset content type',{status:415})
    const declared=Number(upstream.headers.get('content-length')||'0')
    if(declared>12*1024*1024)return new NextResponse('Asset too large',{status:413})
    const body = await upstream.arrayBuffer()
    if(body.byteLength>12*1024*1024)return new NextResponse('Asset too large',{status:413})
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'X-Content-Type-Options':'nosniff',
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
