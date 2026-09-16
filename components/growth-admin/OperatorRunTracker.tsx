'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  if (task?.type === 'OPERATOR_COMMERCIAL_SIGNALS') return `Hasta ${inputs.limit || 12} señales comerciales`
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
    // Keep the tracker usable even when browser storage is unavailable.
  }
}

function dispatchBlocked(run: TrackedRun) {
  const status = run.task?.status || 'queued'
  return run.dispatchOk === false && ['queued', 'pending'].includes(status)
}

function traceHref(taskId: string) {
  const encoded = encodeURIComponent(taskId)
  return `/growth-admin/operations?task=${encoded}#task-${encoded}`
}

export default function OperatorRunTracker() {
  const searchParams = useSearchParams()
  const queued = searchParams.get('queued') || ''
  const dispatched = searchParams.get('dispatched')
  const dispatchReason = searchParams.get('dispatch_reason') || ''
  const [runs, setRuns] = useState<TrackedRun[]>([])
  const [expanded, setExpanded] = useState(false)
  const runsRef = useRef<TrackedRun[]>([])
  const hydratedRef = useRef(false)
  const lastParamSignature = useRef('')

  const commitRuns = useCallback((updater: (current: TrackedRun[]) => TrackedRun[]) => {
    setRuns((current) => {
      const next = updater(current).slice(0, MAX_TRACKED)
      runsRef.current = next
      storeRuns(next)
      return next
    })
  }, [])

  useEffect(() => {
    const stored = loadStored()
    runsRef.current = stored
    setRuns(stored)
    hydratedRef.current = true
  }, [])

  useEffect(() => {
    if (!hydratedRef.current || !queued) return
    const signature = `${queued}:${dispatched || ''}:${dispatchReason}`
    if (signature === lastParamSignature.current) return
    lastParamSignature.current = signature

    commitRuns((current) => {
      const existing = current.find((run) => run.taskId === queued)
      const nextRun: TrackedRun = {
        ...existing,
        taskId: queued,
        dispatchOk: dispatched === null ? existing?.dispatchOk : dispatched === '1',
        dispatchReason: dispatchReason || existing?.dispatchReason,
        lastSeenAt: Date.now(),
      }
      return [nextRun, ...current.filter((run) => run.taskId !== queued)]
    })
    setExpanded(true)
  }, [queued, dispatched, dispatchReason, commitRuns])

  const refresh = useCallback(async (includeRecent = false) => {
    const current = runsRef.current
    const candidates = current.filter((run, index) => includeRecent ? index < 3 || !run.task || ACTIVE.has(run.task.status) : !run.task || ACTIVE.has(run.task.status))
    if (!candidates.length) return

    const updates = await Promise.all(candidates.map(async (run) => {
      try {
        const response = await fetch(`/api/growth-admin/operator-task/status?task_id=${encodeURIComponent(run.taskId)}`, { cache: 'no-store' })
        if (!response.ok) return null
        const payload = await response.json() as StatusPayload
        return { taskId: run.taskId, payload }
      } catch {
        return null
      }
    }))

    const valid = updates.filter(Boolean) as Array<{ taskId: string; payload: StatusPayload }>
    if (!valid.length) return

    commitRuns((state) => state.map((run) => {
      const update = valid.find((row) => row.taskId === run.taskId)
      return update ? { ...run, task: update.payload.task, result: update.payload.result, lastSeenAt: Date.now() } : run
    }))
  }, [commitRuns])

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(true), 150)
    const timer = window.setInterval(() => void refresh(false), 2500)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(timer)
    }
  }, [refresh])

  const activeCount = runs.filter((run) => !dispatchBlocked(run) && (!run.task || ACTIVE.has(run.task.status))).length
  const failedCount = runs.filter((run) => run.task?.status === 'failed' || dispatchBlocked(run)).length
  const latest = runs[0]
  const latestCompleted = latest?.task && !ACTIVE.has(latest.task.status) && latest.task.status !== 'failed'
  const visibleRuns = runs.slice(0, expanded ? MAX_TRACKED : 1)

  function dismiss(taskId: string) {
    commitRuns((current) => current.filter((run) => run.taskId !== taskId))
  }

  async function retry(run: TrackedRun) {
    let retryDispatched = false
    let reason = 'request_failed'
    try {
      const response = await fetch('/api/growth-admin/operator-task/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: run.taskId }),
      })
      if (response.ok) {
        const payload = await response.json() as { dispatched?: boolean; reason?: string }
        retryDispatched = payload.dispatched === true
        reason = payload.reason || (retryDispatched ? 'ok' : 'dispatch_failed')
      }
    } catch {
      retryDispatched = false
    }

    commitRuns((current) => current.map((item) => item.taskId === run.taskId ? {
      ...item,
      dispatchOk: retryDispatched,
      dispatchReason: retryDispatched ? '' : reason,
      task: item.task ? { ...item.task, status: 'queued', outputs: {} } : item.task,
      result: null,
      lastSeenAt: Date.now(),
    } : item))
    setExpanded(true)
    if (retryDispatched) window.setTimeout(() => void refresh(false), 700)
  }

  if (!runs.length) {
    return <div className="sticky top-[145px] z-40 border-b border-slate-200 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur md:top-[136px] xl:top-[73px]">
      <div className="mx-auto flex max-w-[1780px] items-center justify-between gap-4 px-5 py-2.5 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300" />
          <div className="min-w-0"><p className="text-xs font-semibold text-slate-800">Procesos del CRM · ninguno activo</p><p className="truncate text-[10px] text-slate-500">Los workflows que lances aparecerán aquí y te indicarán el siguiente paso.</p></div>
        </div>
        <a href="/growth-admin/operations" className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">Historial</a>
      </div>
    </div>
  }

  return <div className="sticky top-[145px] z-40 border-b border-slate-200 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur md:top-[136px] xl:top-[73px]">
    <div className="mx-auto max-w-[1780px] px-5 py-2.5 md:px-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => setExpanded((value) => !value)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${failedCount ? 'bg-rose-500' : activeCount ? 'animate-pulse bg-indigo-500' : 'bg-emerald-500'}`} />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">{activeCount ? `${activeCount} proceso${activeCount === 1 ? '' : 's'} ejecutándose` : failedCount ? `${failedCount} proceso${failedCount === 1 ? '' : 's'} requiere atención` : latestCompleted ? `${processName(latest.task)} · completado` : 'Procesos del CRM'}</p>
              <p className="truncate text-[10px] text-slate-500">Puedes seguir trabajando: los workflows continúan aunque cambies de pantalla.</p>
            </div>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setExpanded((value) => !value)} className="text-[10px] font-semibold text-indigo-600">{expanded ? 'Ocultar' : 'Ver procesos'}</button>
            <a href="/growth-admin/operations" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">Historial</a>
          </div>
        </div>

        {expanded && <div className="grid gap-2 pb-1 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleRuns.map((run) => {
            const status = run.task?.status || 'queued'
            const blocked = dispatchBlocked(run)
            const failed = status === 'failed' || blocked
            const active = ACTIVE.has(status) && !blocked
            const error = typeof run.task?.outputs?.error === 'string' ? run.task.outputs.error : ''
            return <div key={run.taskId} className={`rounded-xl border px-4 py-3 ${failed ? 'border-rose-200 bg-rose-50' : active ? 'border-indigo-200 bg-indigo-50/70' : 'border-emerald-200 bg-emerald-50/70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${failed ? 'bg-rose-100 text-rose-700' : active ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>{blocked ? 'No lanzado' : statusLabel(status)}</span>
                    <span className="text-[9px] text-slate-400">{run.taskId}</span>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-slate-900">{processName(run.task)}</p>
                  {detail(run.task) && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-600">{detail(run.task)}</p>}
                  {active && <p className="mt-1 text-[10px] leading-4 text-slate-500">Workflow en marcha. No hace falta permanecer en esta pantalla.</p>}
                  {blocked && <p className="mt-1 text-[10px] leading-4 text-rose-700">GitHub Actions no se pudo disparar{run.dispatchReason ? ` (${run.dispatchReason})` : ''}. La tarea está guardada: puedes relanzarla ahora o dejar que el barrido automático la recupere.</p>}
                  {error && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-rose-700">{error}</p>}
                  {!active && !failed && run.result?.description && <p className="mt-1 text-[10px] leading-4 text-emerald-800">{run.result.description}</p>}
                </div>
                <button type="button" onClick={() => dismiss(run.taskId)} className="text-xs text-slate-400 hover:text-slate-700" aria-label="Ocultar proceso">×</button>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {!active && !failed && run.result && <a href={run.result.href} className="rounded-lg bg-slate-950 px-3 py-2 text-[10px] font-semibold text-white">{run.result.label} →</a>}
                {failed && <button type="button" onClick={() => void retry(run)} className="rounded-lg bg-rose-600 px-3 py-2 text-[10px] font-semibold text-white">Reintentar workflow</button>}
                <a href={traceHref(run.taskId)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600">Trazabilidad</a>
              </div>
            </div>
          })}
        </div>}
      </div>
    </div>
  </div>
}
