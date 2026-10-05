import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { Badge } from '@/components/growth-admin/AdminUi'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const agents = [
  {
    name: 'Upwork Scout',
    role: 'Busca, filtra y prioriza oportunidades de Upwork según encaje, competencia, presupuesto y probabilidad real de conversión.',
    state: 'Especificación',
  },
  {
    name: 'Market & Partner Scout',
    role: 'Investiga empresas, decisores, partners y oportunidades comerciales sin mezclar este trabajo con el CRM editorial.',
    state: 'Especificación',
  },
  {
    name: 'Applications & Outreach',
    role: 'Prepara candidaturas, mensajes, adjuntos y siguientes acciones usando el perfil, portfolio y reglas comerciales vigentes.',
    state: 'Especificación',
  },
  {
    name: 'Editorial Operator',
    role: 'Trabaja sobre publicaciones ya existentes: consulta la pieza, modifica copy o metadatos cuando se lo pidas y deja el resultado guardado para el preview.',
    state: 'Especificación',
  },
  {
    name: 'Performance Analyst',
    role: 'Cruza métricas de LinkedIn y web con las publicaciones para detectar qué está funcionando y qué conviene cambiar.',
    state: 'Pendiente',
  },
]

export default async function AgentsPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')

  return (
    <AdminShell active="agents">
      <header className="overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 px-6 py-9 text-white md:px-10 md:py-11">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-300">AI Operations</p>
        <h1 className="mt-4 text-4xl leading-tight md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>
          Registro de agentes
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
          No hay otro chatbot dentro del CRM. Los agentes se invocan desde ChatGPT o Work y este módulo solo documenta qué agentes existen, qué hacen y qué estado operativo tienen.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <p className="text-xs font-semibold text-indigo-900">Principio operativo</p>
        <p className="mt-2 max-w-5xl text-sm leading-6 text-indigo-800">
          El chat es la interfaz. Las reglas del agente deben estar versionadas, y sus datos y resultados deben persistir fuera del historial del chat. Así puedes abrir una conversación nueva y volver a ejecutar el mismo trabajo sin depender de un hilo antiguo.
        </p>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        {agents.map((agent) => (
          <article key={agent.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600">Agente</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">{agent.name}</h2>
              </div>
              <Badge tone={agent.state === 'Especificación' ? 'violet' : 'slate'}>{agent.state}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{agent.role}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Qué persiste fuera del chat</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            ['Instrucciones', 'Objetivo, reglas, límites y criterios de decisión versionados.'],
            ['Herramientas', 'Conectores y acciones que el agente puede ejecutar cuando se le invoca.'],
            ['Estado', 'Datos, resultados y decisiones guardados en Supabase u otros sistemas fuente.'],
            ['Trazabilidad', 'Qué se hizo, con qué inputs y cuál fue el resultado final.'],
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
