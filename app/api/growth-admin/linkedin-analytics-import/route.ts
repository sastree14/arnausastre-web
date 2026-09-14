import { randomUUID } from 'node:crypto'
import ExcelJS from 'exceljs'
import { NextResponse } from 'next/server'
import { getRecentContent, insertGrowthRow, isGrowthAdminAuthenticated } from '@/lib/growth-admin'

const ALIASES: Record<string, string[]> = {
  date: ['date','fecha','day','día','dia'],
  url: ['post url','posturl','url','content url','publication url','post link','permalink'],
  postId: ['post id','postid','content id','publication id','urn'],
  impressions: ['impressions','impression','impresiones'],
  reach: ['reach','members reached','unique impressions','uniqueimpressions','alcance','miembros alcanzados'],
  reactions: ['reactions','reaction','likes','reacciones'],
  comments: ['comments','comment','comentarios'],
  reposts: ['reposts','repost','shares','share','compartidos','republicaciones'],
  saves: ['saves','save','guardados'],
  sends: ['sends','send','sent via linkedin','envíos','envios'],
  clicks: ['clicks','click','link clicks','clics'],
  profileViews: ['profile views','profileviews','profile viewers','visitas al perfil'],
  followersGained: ['followers gained','new followers','follows','seguidores obtenidos','nuevos seguidores'],
}

function norm(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
}

function cellValue(value: ExcelJS.CellValue): unknown {
  if (value && typeof value === 'object' && 'text' in value) return value.text
  if (value && typeof value === 'object' && 'result' in value) return value.result
  if (value && typeof value === 'object' && 'richText' in value) return value.richText.map((part)=>part.text).join('')
  return value
}

function findColumn(headers: string[], key: string) {
  const aliases = ALIASES[key].map(norm)
  return headers.findIndex((header) => aliases.includes(norm(header)))
}

function number(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(String(value ?? '').replace(/[^0-9.,-]/g,'').replace(/,/g,''))
  return Number.isFinite(parsed) ? parsed : 0
}

function dateValue(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0,10)
  const raw = String(value ?? '').trim()
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0,10) : parsed.toISOString().slice(0,10)
}

function extractPostId(url: string, explicit: string) {
  if (explicit) return explicit
  const decoded = decodeURIComponent(url)
  const urn = decoded.match(/urn:li:(?:share|ugcPost):\d+/i)?.[0]
  return urn || ''
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const file = form.get('file')
  const accountType = String(form.get('account_type') || '')
  const reportType = String(form.get('report_type') || 'content')
  if (!(file instanceof File)) return new NextResponse('Missing XLSX file', { status: 400 })
  if (!['arnau','sc_analytics'].includes(accountType)) return new NextResponse('Invalid account type', { status: 400 })
  if (file.size > 12_000_000) return new NextResponse('File too large', { status: 413 })
  if (!/\.(xlsx|xls)$/i.test(file.name)) return new NextResponse('Upload an official LinkedIn XLS/XLSX export', { status: 400 })

  const workbook = new ExcelJS.Workbook()
  try {
    await workbook.xlsx.load(Buffer.from(await file.arrayBuffer()))
  } catch {
    return new NextResponse('Could not read workbook. Export as XLSX from LinkedIn and retry.', { status: 400 })
  }

  const content = await getRecentContent()
  const importId = `liimport_${randomUUID().replaceAll('-','').slice(0,12)}`
  const sheetMeta: Array<{name:string;headers:string[];rows:number}> = []
  let imported = 0
  let minDate = ''
  let maxDate = ''

  for (const sheet of workbook.worksheets) {
    let headerRow = 0
    let headers: string[] = []
    let bestScore = -1
    for (let rowNum=1; rowNum<=Math.min(sheet.rowCount,20); rowNum++) {
      const values = sheet.getRow(rowNum).values as ExcelJS.CellValue[]
      const candidate = values.slice(1).map((v)=>String(cellValue(v) ?? '').trim())
      const score = candidate.filter((header)=>Object.values(ALIASES).some((aliases)=>aliases.map(norm).includes(norm(header)))).length
      if (score > bestScore && candidate.filter(Boolean).length >= 2) { bestScore=score; headerRow=rowNum; headers=candidate }
    }
    if (!headerRow) continue
    sheetMeta.push({name:sheet.name,headers:headers.filter(Boolean).slice(0,80),rows:Math.max(0,sheet.rowCount-headerRow)})

    const idx = Object.fromEntries(Object.keys(ALIASES).map((key)=>[key,findColumn(headers,key)])) as Record<string,number>
    const hasPostMetric = ['impressions','reach','reactions','comments','reposts','saves','sends','clicks','profileViews','followersGained'].some((key)=>idx[key]>=0)
    if (!hasPostMetric) continue

    for (let rowNum=headerRow+1; rowNum<=sheet.rowCount; rowNum++) {
      const row = sheet.getRow(rowNum)
      const values = (row.values as ExcelJS.CellValue[]).slice(1).map(cellValue)
      if (!values.some((value)=>String(value ?? '').trim())) continue
      const get=(key:string)=>idx[key]>=0?values[idx[key]]:null
      const metrics = {
        impressions:number(get('impressions')), reach:number(get('reach')), reactions:number(get('reactions')),
        comments:number(get('comments')), reposts:number(get('reposts')), saves:number(get('saves')), sends:number(get('sends')),
        clicks:number(get('clicks')), profile_views:number(get('profileViews')), followers_gained:number(get('followersGained')),
      }
      if (!Object.values(metrics).some((value)=>value!==0)) continue
      const externalUrl=String(get('url') ?? '').trim()
      const externalId=extractPostId(externalUrl,String(get('postId') ?? '').trim())
      const snapshotDate=dateValue(get('date'))
      minDate=!minDate||snapshotDate<minDate?snapshotDate:minDate
      maxDate=!maxDate||snapshotDate>maxDate?snapshotDate:maxDate
      const matched = content.find((item)=>
        (externalId && item.external_post_id===externalId)
        || (externalUrl && item.external_post_url===externalUrl)
        || (externalId && String(item.external_post_url||'').includes(externalId))
      )
      await insertGrowthRow('linkedin_post_metrics', {
        tenant_id:'sc-analytics', import_id:importId, account_type:accountType, content_id:matched?.content_id||null,
        external_post_id:externalId, external_post_url:externalUrl, snapshot_date:snapshotDate, ...metrics,
        metadata:{sheet:sheet.name,row:rowNum}, created_at:new Date().toISOString(),
      })
      imported += 1
    }
  }

  await insertGrowthRow('linkedin_analytics_imports', {
    import_id:importId, tenant_id:'sc-analytics', account_type:accountType, report_type:reportType,
    period_start:minDate||null, period_end:maxDate||null, source_filename:file.name, rows_imported:imported,
    metadata:{sheets:sheetMeta}, imported_at:new Date().toISOString(),
  })
  const url = new URL('/growth-admin/analytics',request.url)
  url.searchParams.set('imported',String(imported))
  url.searchParams.set('import_id',importId)
  return NextResponse.redirect(url,303)
}
