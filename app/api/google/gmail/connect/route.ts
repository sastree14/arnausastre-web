import { NextRequest, NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export async function GET(request: NextRequest) {
  if (!(await isGrowthAdminAuthenticated())) return NextResponse.redirect(new URL('/growth-admin/login', request.url))
  const target = new URL('/api/growth-admin/google/connect', request.url)
  target.searchParams.set('account', 'personal')
  target.searchParams.set('return_to', '/growth-admin/inbox')
  return NextResponse.redirect(target)
}
