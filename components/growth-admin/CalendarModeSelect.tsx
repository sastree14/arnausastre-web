'use client'
import { useRouter } from 'next/navigation'

export default function CalendarModeSelect({ value }: { value: 'editorial' | 'meetings' }) {
  const router = useRouter()
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Calendario maestro</p>
      <p className="mt-1 text-sm text-slate-600">Selecciona qué agenda quieres consultar.</p></div>
    <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">Vista
      <select aria-label="Elegir calendario" className="min-w-64 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
        value={value} onChange={event => router.push(event.target.value === 'meetings' ? '/growth-admin/calendar?view=meetings' : '/growth-admin/calendar')}>
        <option value="meetings">Reuniones y actividad comercial</option>
        <option value="editorial">Publicaciones y artículos</option>
      </select>
    </label>
  </div>
}
