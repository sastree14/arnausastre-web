import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const agents = [
  {
    name: 'Editorial Planner',
    role: 'Decidir qué pieza toca desarrollar y con qué objetivo.',
    status: 'Diseño',
  },
  {
    name: 'Editorial Reviewer',
    role: 'Revisar copy, visual, formato y readiness antes de publicación.',
    status: 'Diseño',
  },
  {
    name: 'Publishing Operator',
    role: 'Programar, publicar y registrar el resultado cuando la pieza esté aprobada.',
    status: 'Diseño',
  },
  {
    name: 'Performance Analyst',
    role: 'Leer métricas y devolver aprendizaje al siguiente ciclo editorial.',
    status: 'Pendiente',
  },
]

export default async function AgentsPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  return (
    <AdminShell active="agents">
      <header className="overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 px-6 py-9 text-white md:px-10 md:py-11">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">AI Operations</p>
        <h1 className="mt-4 text-4xl leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>
          Agentes
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
          Este espacio será el panel de control de agentes persistentes. Los chats sirven para dirigirlos y diseñarlos; el estado, las reglas y la ejecución deben vivir fuera del chat.
        </p>
      </header>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        {agents.map((agent) => (
          <article key={agent.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">Agente</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{agent.name}</h2>
              </div>
              <Badge tone={agent.status === 'Diseño' ? 'violet' : 'slate'}>{agent.status}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{agent.role}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Arquitectura objetivo</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            ['Instrucciones', 'Qué sabe hacer y qué límites tiene.'],
            ['Herramientas', 'GitHub, Supabase, Gmail, web, APIs y workers autorizados.'],
            ['Estado', 'Memoria operativa y resultados persistidos en base de datos.'],
            ['Triggers', 'Acción humana, horarios o eventos que disparan cada ejecución.'],
          ].map(([title, body], index) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold text-indigo-600">0{index + 1}</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{title}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  )
}
