'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type TaskSnapshot = {
  task_id: string
  type: string
  status: string
  inputs?: Record<string, unknown>
  outputs?: Record<string, unknown>
  created_at?: string | null
}

type RunResult = {
  href: string
  label: string
  description?: string
}

type StatusPayload = {
  task: TaskSnapshot
  result?: RunResult | null
}

type TrackedRun = {
  taskId: string
  dispatchOk?: boolean
  dispatchReason?: string
  task?: TaskSnapshot
  result?: RunResult | null
  lastSeenAt: number
}

const ACTIVE = new Set(['queued', 'pending', 'running'])
const STORAGE_KEY = 'sc-growth-operator-runs-v2'
const MAX_TRACKED = 6

function processName(task?: TaskSnapshot) {
  const names: Record<string, string> = {
    OPERATOR_EDITORIAL_PROPOSALS: 'Propuestas editoriales',
    OPERATOR_EDITORIAL_RUN: 'Desarrollo de publicación',
    OPERATOR_EDITORIAL_URL: 'Contenido desde fuente',
    OPERATOR_REWRITE_CONTENT: 'Reescritura y validación',
    OPERATOR_PROSPECT: 'Prospección comercial',
    OPERATOR_COMMERCIAL_SIGNALS: 'Inteligencia comercial',
    OPERATOR_COMPETITOR_DISCOVER: 'Descubrimiento de competencia',
    OPERATOR_COMPETITOR_REFRESH: 'Actualización de competidor',
    OPERATOR_COMPETITOR_REFRESH_ALL: 'Actualización de monitorizadas',
    OPERATOR_PUBLISH_LINKEDIN: 'Publicación en LinkedIn',
    OPERATOR_PUBLISH_ARTICLE: 'Publicación de artículo',
  }
  return names[task?.type || ''] || 'Proceso automático'
}

function detail(task?: TaskSnapshot) {
  const inputs = task?.inputs || {}
  if (task?.type === 'OPERATOR_EDITORIAL_RUN') return String(inputs.theme_hint || 'Research → copy → validación')
  if (task?.type === 'OPERATOR_EDITORIAL_PROPOSALS') return String(inputs.focus || 'Búsqueda de nuevas oportunidades editoriales')
  if (task?.type === 'OPERATOR_PROSPECT') return `${inputs.mode === 'partner' ? 'Partners' : 'Clientes'} · hasta ${inputs.limit || 10}`
  if (task?.type === 'OPERATOR_COMPETITOR_DISCOVER') return String(inputs.focus || 'Búsqueda abierta de competidores')
  return ''
}

function statusLabel(status?: string) {
  if (status === 'queued' || status === 'pending') return 'En cola'
  if (status === 'running') return 'Ejecutando'
  if (status === 'completed' || status === 'done' || status === 'executed') return 'Completado'
  if (status === 'failed') return 'Fallido'
  return status || 'Preparando'
}

function loadStored(): TrackedRun[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(0, MAX_TRACKED) : []
  } catch {
    return []
  }
}

function storeRuns(runs: TrackedRun[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(runs.slice(0, MAX_TRACKED)))
  } catch {
    // The tracker remains functional for the current page even if storage is unavailable.
  }
}

export default function OperatorRunTracker() {
  const searchParams = useSearchParams()
  const queued = searchParams.get('queued') || ''
  const dispatched = searchParams.get('dispatched')
  const dispatchReason = searchParams.get('dispatch_reason') || ''
  const [runs, setRuns] = useState<TrackedRun[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setRuns(loadStored())
  }, [])

  useEffect(() => {
    if (!queued) return
    setRuns((current) => {
      const existing = current.find((run) => run.taskId === queued)
      const next: TrackedRun = {
        ...existing,
        taskId: queued,
        dispatchOk: dispatched === null ? existing?.dispatchOk : dispatched === '1',
        dispatchReason: dispatchReason || existing?.dispatchReason,
        lastSeenAt: Date.now(),
      }
      const merged = [next, ...current.filter((run) => run.taskId !== queued)].slice(0, MAX_TRACKED)
      storeRuns(merged)
      return merged
    })
    setExpanded(true)
  }, [queued, dispatched, dispatchReason])

  const refresh = useCallback(async () => {
    const ids = runs.filter((run, index) => index < 3 || ACTIVE.has(run.task?.status || '')).map((run) => run.taskId)
    if (!ids.length) return
    const updates = await Promise.all(ids.map(async (taskId) => {
      try {
        const response = await fetch(`/api/growth-admin/operator-task/status?task_id=${encodeURIComponent(taskId)}`, { cache: 'no-store' })
        if (!response.ok) return null
        const payload = await response.json() as StatusPayload
        return { taskId, payload }
      } catch {
        return null
      }
    }))

    const valid = updates.filter(Boolean) as Array<{ taskId: string; payload: StatusPayload }>
    if (!valid.length) return
    setRuns((current) => {
      const next = current.map((run) => {
        const update = valid.find((row) => row.taskId === run.taskId)
        return update ? { ...run, task: update.payload.task, result: update.payload.result, lastSeenAt: Date.now() } : run
      })
      storeRuns(next)
      return next
    })
  }, [runs])

  useEffect(() => {
    if (!runs.length) return
    void refresh()
    const hasActive = runs.some((run) => !run.task || ACTIVE.has(run.task.status))
    if (!hasActive) return
    const timer = window.setInterval(() => void refresh(), 2500)
    return () => window.clearInterval(timer)
  }, [runs.length, refresh])

  const visibleRuns = useMemo(() => runs.slice(0, expanded ? MAX_TRACKED : 1), [runs, expanded])
  if (!runs.length) return null

  const activeCount = runs.filter((run) => !run.task || ACTIVE.has(run.task.status)).length
  const failedCount = runs.filter((run) => run.task?.status === 'failed' || run.dispatchOk === false).length
  const latest = runs[0]
  const latestCompleted = latest?.task && !ACTIVE.has(latest.task.status)

  function dismiss(taskId: string) {
    setRuns((current) => {
      const next = current.filter((run) => run.taskId !== taskId)
      storeRuns(next)
      return next
    })
  }

  async function retry(run: TrackedRun) {
    await fetch('/api/growth-admin/operator-task/retry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: run.taskId }),
    }).catch(() => undefined)
    setRuns((current) => current.map((item) => item.taskId === run.taskId ? {
      ...item,
      dispatchOk: true,
      dispatchReason: '',
      task: item.task ? { ...item.task, status: 'queued', outputs: {} } : item.task,
      lastSeenAt: Date.now(),
    } : item))
    setExpanded(true)
  }

  return <div className="sticky top-[73px] z-40 border-b border-slate-200 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur">
    <div className="mx-auto max-w-[1780px] px-5 py-2.5 md:px-8">
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between gap-4 text-left">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${failedCount ? 'bg-rose-500' : activeCount ? 'animate-pulse bg-indigo-500' : 'bg-emerald-500'}`} />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">{activeCount ? `${activeCount} proceso${activeCount === 1 ? '' : 's'} ejecutándose` : latestCompleted ? `${processName(latest.task)} · ${statusLabel(latest.task?.status)}` : 'Procesos del CRM'}</p>
              <p className="truncate text-[10px] text-slate-500">Puedes seguir trabajando: los workflows continúan aunque cambies de pantalla.</p>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-indigo-600">{expanded ? 'Ocultar' : 'Ver procesos'}</span>
        </button>

        {expanded && <div className="grid gap-2 pb-1 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleRuns.map((run) => {
            const status = run.task?.status || 'queued'
            const active = ACTIVE.has(status)
            const failed = status === 'failed' || run.dispatchOk === false
            const error = typeof run.task?.outputs?.error === 'string' ? run.task.outputs.error : ''
            return <div key={run.taskId} className={`rounded-xl border px-4 py-3 ${failed ? 'border-rose-200 bg-rose-50' : active ? 'border-indigo-200 bg-indigo-50/70' : 'border-emerald-200 bg-emerald-50/70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${failed ? 'bg-rose-100 text-rose-700' : active ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{run.dispatchOk === false ? 'No lanzado' : statusLabel(status)}</span>
                    <span className="text-[9px] text-slate-400">{run.taskId}</span>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-slate-900">{processName(run.task)}</p>
                  {detail(run.task) && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-600">{detail(run.task)}</p>}
                  {active && <p className="mt-1 text-[10px] leading-4 text-slate-500">El workflow está trabajando. No hace falta permanecer en esta pantalla.</p>}
                  {run.dispatchOk === false && <p className="mt-1 text-[10px] leading-4 text-rose-700">GitHub Actions no se pudo disparar{run.dispatchReason ? ` (${run.dispatchReason})` : ''}. La tarea sigue guardada y puedes relanzarla.</p>}
                  {error && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-rose-700">{error}</p>}
                  {!active && !failed && run.result?.description && <p className="mt-1 text-[10px] leading-4 text-emerald-800">{run.result.description}</p>}
                </div>
                <button type="button" onClick={() => dismiss(run.taskId)} className="text-xs text-slate-400 hover:text-slate-700" aria-label="Ocultar proceso">×</button>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {!active && !failed && run.result && <a href={run.result.href} className="rounded-lg bg-slate-950 px-3 py-2 text-[10px] font-semibold text-white">{run.result.label} →</a>}
                {failed && <button type="button" onClick={() => void retry(run)} className="rounded-lg bg-rose-600 px-3 py-2 text-[10px] font-semibold text-white">Reintentar workflow</button>}
                <a href="/growth-admin/operations" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600">Trazabilidad</a>
              </div>
            </div>
          })}
        </div>}
      </div>
    </div>
  </div>
}
