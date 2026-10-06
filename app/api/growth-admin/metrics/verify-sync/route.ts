import { NextResponse } from 'next/server'
import { syncMarketingMetrics } from '@/lib/google-marketing-analytics'

export const maxDuration = 60

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== 'preview') return new NextResponse('Not found', { status: 404 })
  const url = new URL(request.url)
  if (url.searchParams.get('token') !== 'be6fF_zqDSbNWYcqXazJ31ZKbyy48vMtrr2JOVR2nX4') {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const result = await syncMarketingMetrics(30)
  return NextResponse.json(result)
}
