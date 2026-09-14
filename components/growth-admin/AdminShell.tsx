import Image from 'next/image'

export type OperatingModule = 'home' | 'content' | 'calendar' | 'approvals' | 'crm' | 'research' | 'analytics' | 'finance' | 'operations' | 'system'
type NavigationKey = OperatingModule | 'visual'

type NavigationItem = {
  key: NavigationKey
  href: string
  label: string
  group?: string
  description?: string
}

const NAV: NavigationItem[] = [
  { key: 'home', href: '/growth-admin', label: 'Overview', group: 'CRM', description: 'Centro de mando' },
  { key: 'crm', href: '/growth-admin/crm', label: 'Comercial y prospecting', description: 'Accounts, personas y pipeline' },
  { key: 'content', href: '/growth-admin/content', label: 'Contenido', group: 'CRM · Editorial', description: 'Posts y artículos' },
  { key: 'calendar', href: '/growth-admin/calendar', label: 'Calendario', description: 'Planificación editorial' },
  { key: 'approvals', href: '/growth-admin/approvals', label: 'Aprobaciones', description: 'Human-in-the-loop' },
  { key: 'research', href: '/growth-admin/research', label: 'Research y briefs', description: 'Editorial intelligence' },
  { key: 'visual', href: '/growth-admin/visual-studio', label: 'Visual Studio', description: 'Diseño de assets' },
  { key: 'analytics', href: '/growth-admin/analytics', label: 'Analytics', group: 'CRM · Intelligence', description: 'LinkedIn, web y atribución' },
  { key: 'finance', href: '/growth-admin/finance', label: 'Finanzas', group: 'CRM · Finance', description: 'Facturas, cobros y gastos' },
  { key: 'operations', href: '/growth-admin/operations', label: 'Operaciones', group: 'CRM · Operations', description: 'Proyectos y automatizaciones' },
  { key: 'system', href: '/growth-admin/system', label: 'Integraciones', group: 'System', description: 'Conectores y salud' },
]

function shouldShowGroup(index: number) {
  const group = NAV[index]?.group
  if (!group) return false
  for (let previous = index - 1; previous >= 0; previous -= 1) {
    if (NAV[previous].group) return NAV[previous].group !== group
  }
  return true
}

export default function AdminShell({ active, children, surface = 'light' }: { active: OperatingModule; children: React.ReactNode; surface?: 'dark' | 'light' }) {
  const light = surface === 'light'
  return (
    <main className={`min-h-screen ${light ? 'bg-slate-50 text-slate-950' : 'bg-[#050816] text-slate-100'}`}>
      <div className="mx-auto grid max-w-[1880px] lg:grid-cols-[292px_1fr]">
        <aside className="hidden min-h-screen border-r border-slate-800/80 bg-slate-950 p-6 lg:block">
          <div className="sticky top-6">
            <a href="/growth-admin" className="block rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700">
              <Image src="/brand/logo-white.png" alt="SC-Analytics" width={210} height={70} className="h-14 w-48 object-contain object-left" priority />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">CRM · Business Operating System</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Una única fuente de verdad para crecimiento, editorial, analytics, finanzas y operaciones.</p>
            </a>

            <nav className="mt-7 space-y-1 text-sm">
              {NAV.map((item, index) => {
                const showGroup = shouldShowGroup(index)
                const selected = active === item.key
                return (
                  <div key={item.key}>
                    {showGroup && <p className="mb-2 mt-6 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">{item.group}</p>}
                    <a href={item.href} className={`block rounded-xl px-3 py-2.5 transition ${selected ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
                      <span className="block font-medium">{item.label}</span>
                      {item.description && <span className={`mt-0.5 block text-[10px] leading-4 ${selected ? 'text-slate-500' : 'text-slate-600'}`}>{item.description}</span>}
                    </a>
                  </div>
                )
              })}
            </nav>

            <div className="mt-7 rounded-xl border border-indigo-900/50 bg-indigo-950/25 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300">Arquitectura CRM</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Editorial, medición, finanzas y operaciones son ramas del mismo CRM. Empresa, persona, contenido, oportunidad, proyecto e ingreso deben conservar relación y trazabilidad.</p>
            </div>
          </div>
        </aside>
        <div className={`min-w-0 px-5 py-6 md:px-8 lg:px-10 lg:py-8 ${light ? 'bg-[#f8fafc]' : ''}`}>{children}</div>
      </div>
    </main>
  )
}
