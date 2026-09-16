import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { importBankStatement } from '@/lib/finance-bank-import'

export const maxDuration = 60

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  try {
    const form = await request.formData()
    const file = form.get('statement')
    if (!(file instanceof File)) return new NextResponse('Falta el extracto bancario', { status: 400 })
    const result = await importBankStatement(file.name, file.type, Buffer.from(await file.arrayBuffer()))
    const url = new URL('/growth-admin/finance/cash', request.url)
    url.searchParams.set('bank_import', 'ok')
    url.searchParams.set('parsed', String(result.parsed))
    url.searchParams.set('inserted', String(result.inserted))
    url.searchParams.set('skipped', String(result.skipped))
    url.searchParams.set('proposed', String(result.proposed))
    return NextResponse.redirect(url, 303)
  } catch (error) {
    console.error('Bank statement import failed', error)
    const url = new URL('/growth-admin/finance/cash', request.url)
    url.searchParams.set('bank_import', 'error')
    url.searchParams.set('message', error instanceof Error ? error.message : String(error))
    return NextResponse.redirect(url, 303)
  }
}
