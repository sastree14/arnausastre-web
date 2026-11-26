'use client'

import { useState } from 'react'

/**
 * A full document reload is intentional: router.refresh() preserves mounted
 * client components, many of which fetch their own CMI data only on mount.
 * Reloading re-runs both server data loaders and client-side fetches.
 * This only reads persisted CMI data; it does not import external services.
 */
export default function CMIRefreshButton() {
  const [refreshing, setRefreshing] = useState(false)
  return (
    <button
      type="button"
      disabled={refreshing}
      aria-label="Actualizar todos los datos del CMI"
      title="Volver a consultar tareas, contactos, reuniones y métricas guardadas"
      onClick={() => { setRefreshing(true); window.location.reload() }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800 transition hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-wait disabled:opacity-60"
    >
      <span aria-hidden="true">↻</span>
      {refreshing ? 'Actualizando…' : 'Actualizar CMI'}
    </button>
  )
}
