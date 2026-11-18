'use client'

import { useState, type ReactNode } from 'react'

type Section = 'tareas' | 'reuniones' | 'clientes' | 'editorial'

export default function DailyWorkspaceTabs({tasks,meetings,clients,editorial}:{tasks:ReactNode;meetings:ReactNode;clients:ReactNode;editorial:ReactNode}) {
  const [selected,setSelected] = useState<Section>('tareas')
  const tabs: {id:Section;label:string;hint:string}[] = [
    {id:'tareas',label:'Tareas',hint:'Hoy, mañana y próximos días'},
    {id:'reuniones',label:'Reuniones',hint:'Agenda y horarios'},
    {id:'clientes',label:'Clientes y colaboradores',hint:'Relaciones comerciales y equipo'},
    {id:'editorial',label:'Editorial y medios',hint:'Redacciones, artículos y propuestas'},
  ]
  return <div>
    <div className="mb-6 grid gap-2 sm:grid-cols-4" role="tablist" aria-label="Secciones del día a día">
      {tabs.map(t=><button key={t.id} id={'tab-day-'+t.id} type="button" role="tab"
        aria-selected={selected===t.id}
        aria-controls={'panel-day-'+t.id}
        onClick={()=>setSelected(t.id)}
        className={'rounded-xl border px-4 py-3 text-left transition '+(selected===t.id?'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-sm':'border-slate-200 bg-white text-slate-700 hover:border-slate-300')}>
        <span className="block text-sm font-semibold">{t.label}</span>
        <span className={'mt-1 block text-xs '+(selected===t.id?'text-indigo-700':'text-slate-500')}>{t.hint}</span>
      </button>)}
    </div>
    <section id="panel-day-tareas" role="tabpanel" aria-labelledby="tab-day-tareas" hidden={selected!=='tareas'}>{tasks}</section>
    <section id="panel-day-reuniones" role="tabpanel" aria-labelledby="tab-day-reuniones" hidden={selected!=='reuniones'}>{meetings}</section>
    <section id="panel-day-clientes" role="tabpanel" aria-labelledby="tab-day-clientes" hidden={selected!=='clientes'}>{clients}</section>
    <section id="panel-day-editorial" role="tabpanel" aria-labelledby="tab-day-editorial" hidden={selected!=='editorial'}>{editorial}</section>
  </div>
}
