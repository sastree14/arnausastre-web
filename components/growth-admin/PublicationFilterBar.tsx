'use client'
import { FormEvent } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Props = {
  publication: string
  channel: string
  query: string
  total: number
}

const selectClass = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700'

export default function PublicationFilterBar({ publication, channel, query, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (value === 'all' || !value) next.delete(name)
    else next.set(name, value)
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = new URLSearchParams(searchParams.toString())
    const value = String(data.get('q') || '').trim()
    if (value) next.set('q', value)
    else next.delete('q')
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Estado
            <select value={publication} onChange={(e) => update('publication', e.target.value)} className={`mt-1 block w-full ${selectClass}`}>
              <option value="all">Todas</option>
              <option value="upcoming">Pendientes</option>
              <option value="scheduled">Programadas</option>
              <option value="published">Publicadas</option>
            </select>
          </label>

          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Destino
            <select value={channel} onChange={(e) => update('channel', e.target.value)} className={`mt-1 block w-full ${selectClass}`}>
              <option value="all">Todos</option>
              <option value="linkedin">LinkedIn</option>
              <option value="website">Web</option>
            </select>
          </label>
        </div>

        <form onSubmit={search} className="flex min-w-0 flex-1 gap-2 xl:max-w-xl">
          <input name="q" defaultValue={query} placeholder="Buscar por título o texto" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Buscar</button>
        </form>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-500"><strong className="text-slate-800">{total}</strong> publicaciones.</p>
        <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="text-xs font-semibold text-indigo-700">
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}
