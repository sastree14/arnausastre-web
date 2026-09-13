import { NextResponse } from 'next/server'
import { fetchGrowthAsset } from '@/lib/growth-assets'
import { queryGrowthTable } from '@/lib/supabase-growth'
import { isPublicGeneratedArticleNow, type PublicGeneratedArticle } from '@/lib/public-growth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const contentId = new URL(request.url).searchParams.get('content_id') || ''
  if (!contentId) return new NextResponse('Missing content id', { status: 400 })

  try {
    const rows = await queryGrowthTable<PublicGeneratedArticle>('content_items', {
      content_id: `eq.${contentId}`,
      content_type: 'eq.article',
      limit: '1',
    })
    const article = rows[0]
    if (!article || !isPublicGeneratedArticleNow(article)) return new NextResponse('Not found', { status: 404 })
    if (!article.visual_path?.startsWith('supabase://')) return new NextResponse('No visual', { status: 404 })

    const upstream = await fetchGrowthAsset(article.visual_path)
    return new NextResponse(await upstream.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('Public article visual unavailable', error)
    return new NextResponse('Not found', { status: 404 })
  }
}
