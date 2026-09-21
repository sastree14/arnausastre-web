import type { MetricsComparisonBundle, MetricsPeriodKind, MetricsTrendKey, PeriodMetrics, PeriodOption } from '@/lib/metrics-periods'
import { adminPanel } from '@/components/growth-admin/AdminUi'

const TREND_OPTIONS:Array<{key:MetricsTrendKey;label:string;format:'number'|'euro'}>=[
  {key:'sessions',label:'Sesiones web',format:'number'},
  {key:'page_views',label:'Page views',format:'number'},
  {key:'seo_clicks',label:'Clicks SEO',format:'number'},
  {key:'seo_impressions',label:'Impresiones SEO',format:'number'},
  {key:'opportunities',label:'Oportunidades creadas',format:'number'},
  {key:'meetings',label:'Reuniones',format:'number'},
  {key:'invoiced',label:'Facturado',format:'euro'},
  {key:'collected',label:'Cobrado',format:'euro'},
  {key:'spent',label:'Gasto',format:'euro'},
]

const n=(value:unknown)=>Number(value||0)
const number=(value:unknown)=>n(value).toLocaleString('es-ES',{maximumFractionDigits:1})
const euro=(value:unknown)=>`${n(value).toLocaleString('es-ES',{maximumFractionDigits:0})} €`
const pct=(value:number|null,digits=1)=>value===null?'—':`${(value*100).toFixed(digits)}%`

function delta(a:number,b:number){
  if(a===b)return {label:'= 0%',direction:'flat'}
  if(b===0)return {label:a>0?'↗ nuevo':'—',direction:a>0?'up':'flat'}
  const value=(a-b)/Math.abs(b)
  return {label:`${value>0?'↗':'↘'} ${value>0?'+':''}${(value*100).toFixed(1)}%`,direction:value>0?'up':'down'}
}

function CompareCard({label,a,b,formatter=number}:{label:string;a:number;b:number;formatter?:(value:unknown)=>string}){
  const d=delta(a,b)
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
    <div className="flex items-start justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${d.direction==='up'?'bg-emerald-50 text-emerald-700':d.direction==='down'?'bg-rose-50 text-rose-700':'bg-slate-100 text-slate-500'}`}>{d.label}</span></div>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div><p className="text-[10px] text-slate-400">Periodo A</p><p className="mt-1 text-xl font-semibold text-slate-950">{formatter(a)}</p></div>
      <div><p className="text-[10px] text-slate-400">Periodo B</p><p className="mt-1 text-xl font-semibold text-slate-500">{formatter(b)}</p></div>
    </div>
  </div>
}

function RateCard({label,a,b,lowerIsBetter=false}:{label:string;a:number|null;b:number|null;lowerIsBetter?:boolean}){
  const aNum=a??0,bNum=b??0,d=a===null||b===null?{label:'—',direction:'flat'}:delta(lowerIsBetter?-aNum:aNum,lowerIsBetter?-bNum:bNum)
  return <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex items-start justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${d.direction==='up'?'bg-emerald-50 text-emerald-700':d.direction==='down'?'bg-rose-50 text-rose-700':'bg-slate-100 text-slate-500'}`}>{d.label}</span></div>
    <div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-[10px] text-slate-400">Periodo A</p><p className="mt-1 text-xl font-semibold text-slate-950">{pct(a,2)}</p></div><div><p className="text-[10px] text-slate-400">Periodo B</p><p className="mt-1 text-xl font-semibold text-slate-500">{pct(b,2)}</p></div></div>
  </div>
}

function trendFormat(key:MetricsTrendKey,value:number){
  return ['invoiced','collected','spent'].includes(key)?euro(value):number(value)
}

function TrendChart({bundle}:{bundle:MetricsComparisonBundle}){
  const width=920,height=280,left=54,right=28,top=24,bottom=54
  const values=bundle.series.map(item=>item.value)
  const max=Math.max(...values,1)
  const usableW=width-left-right,usableH=height-top-bottom
  const points=bundle.series.map((item,index)=>{
    const x=left+(bundle.series.length<=1?usableW/2:index*usableW/(bundle.series.length-1))
    const y=top+usableH-(item.value/max)*usableH
    return {...item,x,y}
  })
  const polyline=points.map(point=>`${point.x},${point.y}`).join(' ')
  const selected=TREND_OPTIONS.find(item=>item.key===bundle.trendMetric)||TREND_OPTIONS[0]
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">Evolución</p><h3 className="mt-1 text-lg font-semibold text-slate-950">{selected.label}</h3></div>
      <p className="text-xs text-slate-500">{bundle.kind==='month'?'Últimos 12 meses':bundle.kind==='quarter'?'Últimos 8 trimestres':'Últimos 5 años'}</p>
    </div>
    <div className="mt-3 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[720px] w-full" role="img" aria-label={`Evolución de ${selected.label}`}>
        {[0,.25,.5,.75,1].map((fraction)=>{
          const y=top+usableH-fraction*usableH
          return <g key={fraction}><line x1={left} x2={width-right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1"/><text x={left-10} y={y+4} textAnchor="end" fontSize="10" fill="#94a3b8">{trendFormat(bundle.trendMetric,max*fraction)}</text></g>
        })}
        <polyline points={polyline} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
        {points.map(point=><g key={point.key}><circle cx={point.x} cy={point.y} r="4.5" fill="#4f46e5"/><text x={point.x} y={height-25} textAnchor="middle" fontSize="10" fill="#64748b">{point.label.replace(/\s\d{4}$/,'').slice(0,8)}</text><text x={point.x} y={Math.max(14,point.y-10)} textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155">{trendFormat(bundle.trendMetric,point.value)}</text></g>)}
      </svg>
    </div>
  </div>
}

function periodSelect(name:string,value:string,options:PeriodOption[]){
  return <select name={name} defaultValue={value} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800">{options.map(option=><option key={option.key} value={option.key}>{option.label}</option>)}</select>
}

export default function MetricsPeriodComparison({bundle,options}:{bundle:MetricsComparisonBundle;options:PeriodOption[]}){
  const engagementA=bundle.a.sessions>0?bundle.a.engaged_sessions/bundle.a.sessions:null
  const engagementB=bundle.b.sessions>0?bundle.b.engaged_sessions/bundle.b.sessions:null
  return <section className="mt-8">
    <div className={`${adminPanel} p-5 md:p-6`}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">Comparador temporal</p><h2 className="mt-2 text-2xl font-semibold text-slate-950">Mes contra mes, trimestre contra trimestre o año contra año</h2><p className="mt-2 text-sm leading-6 text-slate-500">Selecciona dos periodos independientes. Los KPIs de flujo se recalculan para cada ventana y el gráfico mantiene contexto histórico para ver tendencia, no solo una fotografía puntual.</p></div>
        <form action="/growth-admin/metrics" method="get" className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[140px_180px_180px_190px_auto]">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Vista<select name="period_kind" defaultValue={bundle.kind} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"><option value="month">Mensual</option><option value="quarter">Trimestral</option><option value="year">Anual</option></select></label>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Periodo A{periodSelect('period_a',bundle.periodA.key,options)}</label>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Periodo B{periodSelect('period_b',bundle.periodB.key,options)}</label>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Gráfico<select name="trend_metric" defaultValue={bundle.trendMetric} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800">{TREND_OPTIONS.map(item=><option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
          <button className="self-end rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">Comparar</button>
        </form>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500"><span className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700"><strong>A:</strong> {bundle.periodA.label}</span><span className="rounded-full bg-slate-100 px-3 py-1.5"><strong>B:</strong> {bundle.periodB.label}</span>{!bundle.webHistoryAvailable&&<span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">GA4 histórico aparecerá tras la próxima sincronización con el nuevo esquema diario.</span>}</div>
    </div>

    <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
      <TrendChart bundle={bundle}/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <CompareCard label="Sesiones web" a={bundle.a.sessions} b={bundle.b.sessions}/>
        <CompareCard label="Clicks SEO" a={bundle.a.seo_clicks} b={bundle.b.seo_clicks}/>
        <CompareCard label="Facturado" a={bundle.a.invoiced} b={bundle.b.invoiced} formatter={euro}/>
      </div>
    </div>

    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <CompareCard label="Page views" a={bundle.a.page_views} b={bundle.b.page_views}/>
      <RateCard label="Engagement web" a={engagementA} b={engagementB}/>
      <CompareCard label="Impresiones SEO" a={bundle.a.seo_impressions} b={bundle.b.seo_impressions}/>
      <CompareCard label="Oportunidades" a={bundle.a.opportunities} b={bundle.b.opportunities}/>
      <CompareCard label="Reuniones" a={bundle.a.meetings} b={bundle.b.meetings}/>
      <CompareCard label="Cobrado" a={bundle.a.collected} b={bundle.b.collected} formatter={euro}/>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <CompareCard label="Key events" a={bundle.a.key_events} b={bundle.b.key_events}/>
      <CompareCard label="Discovery intent" a={bundle.a.discovery_clicks} b={bundle.b.discovery_clicks}/>
      <CompareCard label="Bookings atribuidos" a={bundle.a.bookings} b={bundle.b.bookings}/>
      <CompareCard label="Gasto" a={bundle.a.spent} b={bundle.b.spent} formatter={euro}/>
    </div>
  </section>
}
