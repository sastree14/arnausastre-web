import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { ensureOperationsDriveStructure } from '@/lib/google-drive-operations'

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  try {
    await ensureOperationsDriveStructure()
    const url = new URL('/growth-admin/operations', request.url)
    url.searchParams.set('drive_ready', '1')
    url.hash = 'knowledge'
    return NextResponse.redirect(url, 303)
  } catch (error) {
    const url = new URL('/growth-admin/operations', request.url)
    url.searchParams.set('drive_error', error instanceof Error ? error.message : 'No se pudo preparar Google Drive')
    url.hash = 'knowledge'
    return NextResponse.redirect(url, 303)
  }
}
