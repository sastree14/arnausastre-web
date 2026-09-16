import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated, queryGrowthTable, type GrowthContentItem, type GrowthTask } from '@/lib/growth-admin'

type RunResult = {
  href: string
  label: string
  description?: string
}

function firstString(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.find((entry) => typeof entry === 'string' && entry.trim()) || ''
}

function firstObject(value: unknown): Record<string, unknown> | null {
  if (!Array.isArray(value)) return null
  const row = value.find((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
  return row ? row as Record<string, unknown> : null
}

async function contentForBrief(briefId: string) {
  if (!briefId) return null
  const rows = await queryGrowthTable<GrowthContentItem>('content_items', {
    tenant_id: 'eq.sc-analytics',
    brief_id: `eq.${briefId}`,
    order: 'created_at.desc',
    limit: '1',
  }, { cacheSeconds: 0 })
  return rows[0] || null
}

async function taskResult(task: GrowthTask): Promise<RunResult | null> {
  const inputs = task.inputs || {}
  const outputs = task.outputs || {}
  const contentId = String(inputs.content_id || '').trim()

  switch (task.type) {
    case 'OPERATOR_EDITORIAL_PROPOSALS':
      return {
        href: '/growth-admin/content',
        label: 'Elegir propuesta',
        description: 'Las nuevas direcciones editoriales ya están disponibles. El siguiente paso es escoger una.',
      }
    case 'OPERATOR_EDITORIAL_RUN': {
      const briefId = firstString(outputs.brief_ids)
      const item = await contentForBrief(briefId)
      if (item) {
        return {
          href: `/growth-admin/preview/${encodeURIComponent(item.content_id)}`,
          label: 'Revisar publicación',
          description: 'Research, copy y validación han terminado. Continúa con la revisión de la pieza generada.',
        }
      }
      return {
        href: '/growth-admin/content?filter=review',
        label: 'Revisar publicaciones',
        description: 'El desarrollo editorial ha terminado. Continúa desde la cola de revisión.',
      }
    }
    case 'OPERATOR_EDITORIAL_URL': {
      const variant = firstObject(outputs.variants)
      const generatedContentId = String(variant?.content_id || '').trim()
      if (generatedContentId) {
        return {
          href: `/growth-admin/preview/${encodeURIComponent(generatedContentId)}`,
          label: 'Revisar publicación',
          description: 'La fuente ya se ha convertido en una pieza editorial.',
        }
      }
      return { href: '/growth-admin/content?filter=review', label: 'Revisar contenido' }
    }
    case 'OPERATOR_REWRITE_CONTENT':
      return contentId
        ? { href: `/growth-admin/preview/${encodeURIComponent(contentId)}`, label: 'Revisar reescritura', description: 'La pieza se ha reescrito y revalidado.' }
        : { href: '/growth-admin/content?filter=review', label: 'Revisar contenido' }
    case 'OPERATOR_PROSPECT': {
      const partner = String(inputs.mode || '') === 'partner'
      return {
        href: partner ? '/growth-admin/partners' : '/growth-admin/crm',
        label: partner ? 'Trabajar partners' : 'Trabajar clientes',
        description: partner ? 'La búsqueda ha terminado. El siguiente paso es revisar decisores y outreach.' : 'La búsqueda ha terminado. El siguiente paso es revisar empresas, decisores y outreach.',
      }
    }
    case 'OPERATOR_COMMERCIAL_SIGNALS':
      return { href: '/growth-admin/intelligence', label: 'Revisar señales', description: 'Las señales comerciales ya están actualizadas y listas para priorizar.' }
    case 'OPERATOR_COMPETITOR_DISCOVER':
      return { href: '/growth-admin/competition', label: 'Revisar competidores', description: 'Los nuevos comparables ya están en el radar. Decide cuáles monitorizar.' }
    case 'OPERATOR_COMPETITOR_REFRESH':
    case 'OPERATOR_COMPETITOR_REFRESH_ALL':
      return { href: '/growth-admin/competition', label: 'Revisar movimientos', description: 'La inteligencia competitiva ya está actualizada.' }
    case 'OPERATOR_PUBLISH_LINKEDIN':
    case 'OPERATOR_PUBLISH_ARTICLE':
      return contentId
        ? { href: `/growth-admin/preview/${encodeURIComponent(contentId)}`, label: 'Ver publicación', description: 'El proceso de publicación ha terminado.' }
        : { href: '/growth-admin/content?filter=published', label: 'Ver publicadas' }
    default:
      return { href: '/growth-admin/operations', label: 'Ver ejecución', description: 'Consulta input, output y trazabilidad del proceso.' }
  }
}

export async function GET(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const taskId = new URL(request.url).searchParams.get('task_id')?.trim() || ''
  if (!taskId) return NextResponse.json({ error: 'Missing task_id' }, { status: 400 })

  const rows = await queryGrowthTable<GrowthTask>('tasks', {
    tenant_id: 'eq.sc-analytics',
    task_id: `eq.${taskId}`,
    limit: '1',
  }, { cacheSeconds: 0 })
  const task = rows[0]
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  return NextResponse.json({
    task: {
      task_id: task.task_id,
      type: task.type,
      status: task.status,
      inputs: task.inputs || {},
      outputs: task.outputs || {},
      created_at: task.created_at || null,
    },
    result: await taskResult(task),
  })
}
