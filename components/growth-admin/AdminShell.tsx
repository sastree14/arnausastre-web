import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import EditorialBackgroundRefresh from '@/components/growth-admin/EditorialBackgroundRefresh'
import GrowthActionFeedback from '@/components/growth-admin/GrowthActionFeedback'
import LiveAdminForms from '@/components/growth-admin/LiveAdminForms'
import SupabaseRealtimeInvalidator from '@/components/growth-admin/SupabaseRealtimeInvalidator'

export type OperatingModule =
  | 'home'
  | 'commercial'
  | 'content'
  | 'calendar'
  | 'approvals'
  | 'crm'
  | 'partners'
  | 'network'
  | 'audience'
  | 'deal-desk'
  | 'intelligence'
  | 'competition'
  | 'research'
  | 'visual'
  | 'metrics'
  | 'analytics'
  | 'seo'
  | 'finance'
  | 'operations'
  | 'inbox'
  | 'system'

const PRIMARY_NAV = [
  { key: 'home', href: '/growth-admin', label: 'Revisión', description: 'Qué sale después' },
  { key: 'calendar', href: '/growth-admin/calendar', label: 'Calendario', description: 'Cuándo se publica' },
  { key: 'content', href: '/growth-admin/content?publication=all', label: 'Biblioteca', description: 'Todo el contenido' },
  { key: 'commercial', href: '/growth-admin/commercial', label: 'Comercial', description: 'Empresas y oportunidades' },
  { key: 'metrics', href: '/growth-admin/metrics', label: 'Métricas', description: 'Web, LinkedIn y negocio' },
  { key: 'operations', href: '/growth-admin/operations', label: 'Operaciones', description: 'Delivery y procesos' },
] as const

export default function AdminShell({
  active,
  children,
}: {
  active: OperatingModule
  children: React.ReactNode
  surface?: 'dark' | 'light'
}) {
  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-950">
      <SupabaseRealtimeInvalidator />
      <LiveAdminForms />
      <EditorialBackgroundRefresh />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1640px] flex-col gap-3 px-5 py-3 md:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/growth-admin" prefetch={false} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950">
                <Image
                  src="/brand/logo-white.png"
                  alt="SC-Analytics"
                  width={96}
                  height={40}
                  className="h-7 w-8 object-contain"
                  priority
                />
              </span>
              <span>
                <span className="block text-sm font-semibold">SC-Analytics</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  CMI
                </span>
              </span>
            </Link>
          </div>

          <nav className="grid flex-1 grid-cols-2 gap-2 xl:mx-10 xl:max-w-5xl xl:grid-cols-6">
            {PRIMARY_NAV.map((item) => {
              const selected = item.key === 'metrics' ? ['metrics', 'analytics', 'seo'].includes(active) : active === item.key
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  prefetch={false}
                  className={`rounded-xl border px-3 py-2.5 transition ${
                    selected
                      ? 'border-slate-900 bg-slate-950 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-semibold">{item.label}</span>
                  <span className={`mt-0.5 hidden text-[9px] md:block ${selected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {item.description}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/growth-admin/system"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500"
            >
              Sistema
            </Link>
            <form action="/api/growth-admin/logout" method="post">
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <Suspense fallback={null}>
        <GrowthActionFeedback />
      </Suspense>

      <div className="mx-auto max-w-[1640px] px-5 py-6 md:px-8 lg:py-8">{children}</div>
    </main>
  )
}
