import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { disconnectLinkedIn } from '@/lib/growth-integrations'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) {
    return NextResponse.redirect(new URL('/growth-admin/login', request.url), 303)
  }
  await disconnectLinkedIn()
  return NextResponse.redirect(new URL('/growth-admin?linkedin=disconnected', request.url), 303)
}
