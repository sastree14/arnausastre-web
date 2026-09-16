import Link from 'next/link'

type Item = { key: string; href: string; label: string; description: string }

const COMMERCIAL: Item[] = [
  { key: 'commercial', href: '/growth-admin/commercial', label: 'Resumen', description: 'Pipeline y agenda' },
  { key: 'crm', href: '/growth-admin/crm', label: 'Clientes', description: 'Cuentas y decisores' },
  { key: 'partners', href: '/growth-admin/partners', label: 'Partners', description: 'Canales y referrals' },
  { key: 'deal-desk', href: '/growth-admin/deal-desk', label: 'Deal Desk', description: 'De interés a propuesta' },
  { key: 'intelligence', href: '/growth-admin/intelligence', label: 'Señales', description: 'Por qué contactar ahora' },
  { key: 'competition', href: '/growth-admin/competition', label: 'Competencia', description: 'Radar y movimientos' },
  { key: 'content', href: '/growth-admin/content', label: 'Editorial', description: 'Crear y revisar' },
  { key: 'calendar', href: '/growth-admin/calendar', label: 'Calendario', description: 'Programar y publicar' },
]

const METRICS: Item[] = [
  { key: 'metrics', href: '/growth-admin/metrics', label: 'Resumen', description: 'KPIs integrados' },
  { key: 'analytics', href: '/growth-admin/analytics', label: 'Analytics', description: 'Detalle por fuente' },
]

const OPERATIONS: Item[] = [
  { key: 'operations', href: '/growth-admin/operations', label: 'Operaciones', description: 'Delivery y workflows' },
  { key: 'system', href: '/growth-admin/system', label: 'Sistema', description: 'Integraciones y salud' },
]

export default function SectorSubnav({ sector, active }: { sector: string | null; active: string }) {
  const items = sector === 'commercial' ? COMMERCIAL : sector === 'metrics' ? METRICS : sector === 'operations' ? OPERATIONS : []
  if (!items.length) return null

  return <nav aria-label="Navegación del área" className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
    <div className="flex min-w-max gap-1.5">
      {items.map((item) => {
        const selected = active === item.key
        return <Link key={item.key} href={item.href} prefetch={false} className={`rounded-xl border px-3 py-2.5 transition ${selected ? 'border-slate-900 bg-slate-950 text-white shadow-sm' : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'}`}>
          <span className="block text-xs font-semibold">{item.label}</span>
          <span className={`mt-0.5 block text-[9px] ${selected ? 'text-slate-300' : 'text-slate-400'}`}>{item.description}</span>
        </Link>
      })}
    </div>
  </nav>
}
