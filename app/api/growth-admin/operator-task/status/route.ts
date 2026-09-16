import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated, queryGrowthTable, type GrowthTask } from '@/lib/growth-admin'

type RunResult = {
  href: string
  label: string
  description?: string
}

function firstString(value: unknown): string {
  if (!Array.isArray(value)) return ''
  return value.find((entry) => typeof entry === 'string' && entry.trim()) || ''
}

function taskResult(task: GrowthTask): RunResult | null {
  const inputs = task.inputs || {}
  const outputs = task.outputs || {}
  const contentId = String(inputs.content_id || '').trim()

  switch (task.type) {
    case 'OPERATOR_EDITORIAL_PROPOSALS':
      return {
        href: '/growth-admin/content#editorial-planner',
        label: 'Ver propuestas',
        description: 'Las nuevas direcciones editoriales ya están disponibles.',
      }
    case 'OPERATOR_EDITORIAL_RUN': {
      const briefId = firstString(outputs.brief_ids)
      if (briefId) {
        return {
          href: `/growth-admin/content?filter=review&brief=${encodeURIComponent(briefId)}#publication-workspace`,
          label: 'Ver publicación',
          description: 'Revisa canales, copy, visual y aprobación en un único sitio.',
        }
      }
      return {
        href: '/growth-admin/content?filter=review#publication-workspace',
        label: 'Ver publicaciones',
      }
    }
    case 'OPERATOR_EDITORIAL_URL': {
      const brief = outputs.brief as Record<string, unknown> | undefined
      const briefId = String(brief?.brief_id || '').trim()
      if (briefId) {
        return {
          href: `/growth-admin/content?filter=review&brief=${encodeURIComponent(briefId)}#publication-workspace`,
          label: 'Ver publicación',
        }
      }
      return { href: '/growth-admin/content?filter=review', label: 'Ver publicaciones' }
    }
    case 'OPERATOR_REWRITE_CONTENT':
      return contentId
        ? { href: `/growth-admin/preview/${encodeURIComponent(contentId)}`, label: 'Ver publicación', description: 'La pieza se ha reescrito y revalidado.' }
        : { href: '/growth-admin/content?filter=review', label: 'Ver contenido' }
    case 'OPERATOR_PROSPECT':
      return { href: '/growth-admin/commercial', label: 'Ver prospectos', description: 'La investigación comercial ha terminado.' }
    case 'OPERATOR_COMMERCIAL_SIGNALS':
      return { href: '/growth-admin/intelligence', label: 'Ver señales', description: 'Las señales comerciales ya están actualizadas.' }
    case 'OPERATOR_COMPETITOR_DISCOVER':
    case 'OPERATOR_COMPETITOR_REFRESH':
    case 'OPERATOR_COMPETITOR_REFRESH_ALL':
      return { href: '/growth-admin/competition', label: 'Ver competencia', description: 'La inteligencia competitiva ya está actualizada.' }
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
    result: taskResult(task),
  })
}
