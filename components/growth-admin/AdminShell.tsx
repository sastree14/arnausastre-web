import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import GrowthActionFeedback from '@/components/growth-admin/GrowthActionFeedback'
import OperatorRunTracker from '@/components/growth-admin/OperatorRunTracker'
import SectorSubnav from '@/components/growth-admin/SectorSubnav'

export type OperatingModule = 'home' | 'commercial' | 'content' | 'calendar' | 'approvals' | 'crm' | 'partners' | 'deal-desk' | 'intelligence' | 'competition' | 'research' | 'visual' | 'metrics' | 'analytics' | 'finance' | 'operations' | 'system'

type Sector = 'commercial' | 'finance' | 'metrics' | 'operations'

const SECTORS: Array<{ key: Sector; href: string; label: string; description: string; dot: string; active: string }> = [
  { key: 'commercial', href: '/growth-admin/commercial', label: 'Comercial', description: 'Pipeline, mercado y editorial', dot: 'bg-indigo-500', active: 'border-indigo-300 bg-indigo-50 text-indigo-800' },
  { key: 'finance', href: '/growth-admin/finance', label: 'Finanzas', description: 'Caja, facturación y rentabilidad', dot: 'bg-emerald-500', active: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { key: 'metrics', href: '/growth-admin/metrics', label: 'Métricas', description: 'LinkedIn, web, SEO y atribución', dot: 'bg-amber-500', active: 'border-amber-300 bg-amber-50 text-amber-900' },
  { key: 'operations', href: '/growth-admin/operations', label: 'Operaciones', description: 'Delivery, knowledge y sistema', dot: 'bg-violet-500', active: 'border-violet-300 bg-violet-50 text-violet-800' },
]

function activeSector(active: OperatingModule): Sector | null {
  if (['commercial', 'crm', 'partners', 'deal-desk', 'intelligence', 'competition', 'content', 'calendar', 'approvals', 'research', 'visual'].includes(active)) return 'commercial'
  if (['metrics', 'analytics'].includes(active)) return 'metrics'
  if (active === 'finance') return 'finance'
  if (['operations', 'system'].includes(active)) return 'operations'
  return null
}

export default function AdminShell({ active, children }: { active: OperatingModule; children: React.ReactNode; surface?: 'dark' | 'light' }) {
  const sector = activeSector(active)
  const crmReturnTo = active === 'partners' ? '/growth-admin/partners' : '/growth-admin/crm'
  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur">
        <div className="mx-auto flex max-w-[1780px] flex-col gap-3 px-5 py-3 md:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/growth-admin" prefetch={false} className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950">
                <Image src="/brand/logo-white.png" alt="SC-Analytics" width={96} height={40} className="h-8 w-9 object-contain" priority />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-950">SC-Analytics</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Cuadro de Mando Integral</span>
              </span>
            </Link>
            <Link href="/growth-admin" prefetch={false} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 xl:hidden">Inicio</Link>
          </div>

          <nav className="grid flex-1 grid-cols-2 gap-2 xl:mx-8 xl:max-w-4xl xl:grid-cols-4">
            {SECTORS.map((item) => {
              const selected = sector === item.key
              return <Link key={item.key} href={item.href} prefetch={false} className={`rounded-xl border px-3 py-2.5 transition hover:-translate-y-0.5 hover:shadow-sm ${selected ? item.active : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                <span className="flex items-center gap-2 text-xs font-semibold"><span className={`h-2.5 w-2.5 rounded-sm ${item.dot}`} />{item.label}</span>
                <span className={`mt-1 hidden text-[9px] leading-4 md:block ${selected ? 'text-current opacity-70' : 'text-slate-400'}`}>{item.description}</span>
              </Link>
            })}
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            {(active === 'crm' || active === 'partners') && <form action="/api/growth-admin/calendly-sync" method="post"><input type="hidden" name="return_to" value={crmReturnTo}/><button className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">Sincronizar Calendly</button></form>}
            <Link href="/growth-admin" prefetch={false} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cuadro integral</Link>
            <Link href="/growth-admin/system" prefetch={false} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Sistema</Link>
            <form action="/api/growth-admin/logout" method="post"><button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50">Salir</button></form>
          </div>
        </div>
      </header>

      <Suspense fallback={null}><OperatorRunTracker /></Suspense>

      {sector && sector !== 'finance' && <div className="mx-auto max-w-[1780px] px-5 pt-4 md:px-8"><SectorSubnav sector={sector} active={active} /></div>}
      <Suspense fallback={null}><div className="mx-auto max-w-[1780px] px-5 pt-4 md:px-8"><GrowthActionFeedback /></div></Suspense>

      <div className="mx-auto max-w-[1780px] px-5 py-6 md:px-8 lg:py-8">{children}</div>
    </main>
  )
}
