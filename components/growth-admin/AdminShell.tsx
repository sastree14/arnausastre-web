import Image from 'next/image'

export type OperatingModule = 'home' | 'content' | 'calendar' | 'approvals' | 'crm' | 'research' | 'analytics' | 'finance' | 'operations' | 'system'

const NAV: Array<{ key: OperatingModule; href: string; label: string; group?: string }> = [
  { key: 'home', href: '/growth-admin', label: 'Inicio' },
  { key: 'content', href: '/growth-admin/content', label: 'Contenido', group: 'Growth' },
  { key: 'calendar', href: '/growth-admin/calendar', label: 'Calendario' },
  { key: 'approvals', href: '/growth-admin/approvals', label: 'Aprobaciones' },
  { key: 'research', href: '/growth-admin/research', label: 'Research editorial' },
  { key: 'crm', href: '/growth-admin/crm', label: 'CRM y prospecting', group: 'Business' },
  { key: 'analytics', href: '/growth-admin/analytics', label: 'Analytics' },
  { key: 'finance', href: '/growth-admin/finance', label: 'Finanzas' },
  { key: 'operations', href: '/growth-admin/operations', label: 'Operaciones' },
  { key: 'system', href: '/growth-admin/system', label: 'Integraciones', group: 'System' },
]

function shouldShowGroup(index: number) {
  const group = NAV[index]?.group
  if (!group) return false
  for (let previous = index - 1; previous >= 0; previous -= 1) {
    if (NAV[previous].group) return NAV[previous].group !== group
  }
  return true
}

export default function AdminShell({ active, children, surface = 'dark' }: { active: OperatingModule; children: React.ReactNode; surface?: 'dark' | 'light' }) {
  const light = surface === 'light'
  return (
    <main className={`min-h-screen ${light ? 'bg-slate-50 text-slate-950' : 'bg-[#050816] text-slate-100'}`}>
      <div className="mx-auto grid max-w-[1880px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden min-h-screen border-r border-slate-800/80 bg-slate-950/95 p-6 lg:block">
          <div className="sticky top-6">
            <a href="/growth-admin" className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <Image src="/brand/logo-white.png" alt="SC-Analytics" width={210} height={70} className="h-14 w-48 object-contain object-left" priority />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Operating System · privado</p>
            </a>

            <a href="/growth-admin/visual-studio" className="mt-4 flex items-center justify-between rounded-xl border border-sky-900/60 bg-sky-950/30 px-4 py-3 text-sm font-semibold text-sky-200 transition hover:border-sky-700"><span>Visual Studio</span><span>→</span></a>

            <nav className="mt-7 space-y-1 text-sm">
              {NAV.map((item, index) => {
                const showGroup = shouldShowGroup(index)
                return <div key={item.key}>{showGroup && <p className="mb-2 mt-5 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-700">{item.group}</p>}<a href={item.href} className={`block rounded-lg px-3 py-2.5 transition ${active === item.key ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>{item.label}</a></div>
              })}
            </nav>

            <div className="mt-7 rounded-xl border border-violet-900/50 bg-violet-950/20 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">Regla del sistema</p><p className="mt-2 text-xs leading-5 text-slate-500">Investigar y preparar puede automatizarse. Publicar, contactar, cobrar o ejecutar una acción externa mantiene trazabilidad y control humano.</p></div>
          </div>
        </aside>
        <div className={`min-w-0 px-5 py-6 md:px-8 lg:px-10 lg:py-8 ${light ? 'bg-[#f8fafc]' : ''}`}>{children}</div>
      </div>
    </main>
  )
}
