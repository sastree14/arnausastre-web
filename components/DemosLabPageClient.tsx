'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const sectors = [
  ['SC01','Logística y transporte','Logística i transport','Logistics & transport','Rutas, flota, incidencias y margen','Rutes, flota, incidències i marge','Routes, fleet, disruptions and margin'],
  ['SC02','Distribución mayorista','Distribució majorista','Wholesale distribution','Inventarios y reposición','Inventaris i reposició','Inventory and replenishment'],
  ['SC03','Industria manufacturera','Indústria manufacturera','Manufacturing','Producción y recursos','Producció i recursos','Production and resources'],
  ['SC04','Alimentación y bebidas','Alimentació i begudes','Food & beverage','Demanda y caducidad','Demanda i caducitat','Demand and shelf life'],
  ['SC05','Farmacéutico y químico','Farmacèutic i químic','Pharma & chemicals','Lotes y trazabilidad','Lots i traçabilitat','Batches and traceability'],
  ['SC06','Restauración organizada','Restauració organitzada','Restaurant groups','Turnos y costes','Torns i costos','Staffing and costs'],
  ['SC07','Hoteles y alojamientos','Hotels i allotjaments','Hotels & accommodation','Ocupación y personal','Ocupació i personal','Occupancy and staffing'],
  ['SC08','Retail y e-commerce','Retail i comerç electrònic','Retail & e-commerce','Márgenes y devoluciones','Marges i devolucions','Margins and returns'],
  ['SC09','Clínicas y centros sanitarios','Clíniques i centres sanitaris','Healthcare clinics','Agendas y capacidad','Agendes i capacitat','Scheduling and capacity'],
  ['SC10','Construcción e instalaciones','Construcció i instal·lacions','Construction & installation','Costes y recursos','Costos i recursos','Costs and resources'],
  ['SC11','Inmobiliario y gestión de activos','Immobiliari i gestió d’actius','Real estate & asset management','Vacancia y rentabilidad','Vacància i rendibilitat','Vacancy and returns'],
  ['SC12','Servicios financieros y seguros','Serveis financers i assegurances','Finance & insurance','Riesgo y siniestros','Risc i sinistres','Risk and claims'],
  ['SC13','Consultorías y servicios profesionales','Consultories i serveis professionals','Consulting & professional services','Proyectos y capacidad','Projectes i capacitat','Projects and capacity'],
  ['SC14','Servicios y mantenimiento','Serveis i manteniment','Field services & maintenance','Técnicos y repuestos','Tècnics i recanvis','Technicians and parts'],
  ['SC15','Tecnología, software y SaaS','Tecnologia, software i SaaS','Technology, software & SaaS','Retención y producto','Retenció i producte','Retention and product'],
  ['SC16','Educación y formación','Educació i formació','Education & training','Horarios y recursos','Horaris i recursos','Schedules and resources'],
  ['SC17','Energía y servicios industriales','Energia i serveis industrials','Energy & industrial services','Consumo y equipos','Consum i equips','Usage and equipment'],
  ['SC18','Turismo, ocio y eventos','Turisme, oci i esdeveniments','Tourism, leisure & events','Demanda y aforo','Demanda i aforament','Demand and capacity'],
] as const

const services = [
  ['/predictive-models/','Predicción y machine learning','Predicció i machine learning','Predictive intelligence'],
  ['/optimization/','Optimización matemática','Optimització matemàtica','Mathematical optimisation'],
  ['/automation-ai/','Automatización e IA','Automatització i IA','Automation & AI'],
  ['/modelling-scenarios/','Modelización y escenarios','Modelització i escenaris','Modelling & scenarios'],
  ['/simulations/','Simulación y riesgo','Simulació i risc','Simulation & risk'],
  ['/bi-reporting/','Business intelligence y reporting','Business intelligence i reporting','BI & reporting'],
  ['/custom-apps/','Aplicaciones empresariales','Aplicacions empresarials','Custom business applications']
] as const

const content = {
  es: {
    kicker:'SC-ANALYTICS · DEMOSTRACIONES INTERACTIVAS',
    title:'Descubre el problema. Explora las decisiones.',
    intro:'Modelos analíticos y sistemas de decisión a medida explicados mediante demostraciones interactivas. Empieza por tu industria o explora nuestras capacidades.',
    explore:'Explorar demos disponibles', sectorsTitle:'Explora por industria',
    sectorsIntro:'Estamos desarrollando experiencias específicas por sector. Las que aún no están disponibles se identifican claramente.',
    pilot:'Piloto en desarrollo', upcoming:'Próximamente', related:'Ver demo de optimización relacionada',
    servicesTitle:'Explora por capacidad técnica', servicesIntro:'Estas siete familias ya cuentan con ejemplos públicos que puedes probar.',
    open:'Abrir demo interactiva', fullCatalog:'Ver catálogo técnico completo',
    note:'Todas las cifras de las demos son ilustrativas y sintéticas; no son resultados reales de clientes.',
    contactTitle:'¿Qué decisión te gustaría explorar con los datos de tu empresa?',
    contactCopy:'En SC-Analytics diseñamos soluciones a medida. Si alguna situación te interesa, podemos intercambiar perspectivas sobre qué necesitaría un sistema adaptado a tus procesos.',
    contact:'Comentar mi caso', linkedin:'Seguir SC-Analytics en LinkedIn',
  },
  ca: {
    kicker:'SC-ANALYTICS · DEMOSTRACIONS INTERACTIVES',
    title:'Descobreix el problema. Explora les decisions.',
    intro:'Models analítics i sistemes de decisió a mida explicats amb demostracions interactives. Comença pel teu sector o explora les nostres capacitats.',
    explore:'Explorar demos disponibles',sectorsTitle:'Explora per indústria',
    sectorsIntro:'Estem desenvolupant experiències específiques per sector. Les que encara no estan disponibles estan clarament identificades.',
    pilot:'Pilot en desenvolupament',upcoming:'Properament',related:'Veure demo d’optimització relacionada',
    servicesTitle:'Explora per capacitat tècnica',servicesIntro:'Aquestes set famílies ja tenen exemples públics que pots provar.',
    open:'Obrir demo interactiva',fullCatalog:'Veure catàleg tècnic complet',
    note:'Totes les xifres de les demos són il·lustratives i sintètiques; no són resultats reals de clients.',
    contactTitle:'Quina decisió t’agradaria explorar amb les dades de la teva empresa?',
    contactCopy:'A SC-Analytics dissenyem solucions a mida. Si t’interessa alguna situació, podem intercanviar punts de vista sobre què necessitaria un sistema adaptat als teus processos.',
    contact:'Comentar el meu cas',linkedin:'Seguir SC-Analytics a LinkedIn',
  },
  en: {
    kicker:'SC-ANALYTICS · INTERACTIVE DEMONSTRATIONS',
    title:'Understand the problem. Explore the decision.',
    intro:'Tailored analytical models and decision systems explained through interactive demonstrations. Start with your industry or explore our capabilities.',
    explore:'Explore available demos',sectorsTitle:'Explore by industry',
    sectorsIntro:'We are developing industry-specific experiences. Those not yet available are clearly marked.',
    pilot:'Pilot in development',upcoming:'Coming soon',related:'Try a related optimisation demo',
    servicesTitle:'Explore by technical capability',servicesIntro:'These seven families already have public working examples.',
    open:'Open interactive demo',fullCatalog:'View full technical catalog',
    note:'All demo figures are illustrative and synthetic, not verified client outcomes.',
    contactTitle:'Which decision would you explore using your own business data?',
    contactCopy:'SC-Analytics builds tailored solutions. If a scenario resonates, we welcome a conversation about what a system for your own processes might require.',
    contact:'Discuss my case',linkedin:'Follow SC-Analytics on LinkedIn',
  }
} as const

const hub = 'https://sastree14.github.io/demos-sc_analytics'

export default function DemosLabPageClient() {
  const { lang } = useSiteLanguage()
  const t = content[lang]
  const [mode,setMode] = useState<'industries'|'services'>('industries')
  const [released,setReleased] = useState<string[]>([])
  useEffect(() => {
    const controller = new AbortController()
    fetch(hub+'/industry-lab/releases.json',{signal:controller.signal})
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (Array.isArray(data?.publicSectors)) setReleased(data.publicSectors) })
      .catch(() => {})
    return () => controller.abort()
  },[])
  const request = {es:'Solicitar una demo de este sector',ca:'Demanar una demo d’aquest sector',en:'Request a sector walkthrough'}[lang]
  const ix = lang === 'es' ? 1 : lang === 'ca' ? 2 : 3
  const descIx = lang === 'es' ? 4 : lang === 'ca' ? 5 : 6
  return (
    <main className="bg-[#F7F9F7] text-[#0D1B2A]">
      <section className="bg-[#0D1B2A] px-6 py-20 text-white sm:py-24">
        <div className="site-container">
          <p className="text-xs font-semibold tracking-[.18em] text-[#B6D9CA]">{t.kicker}</p>
          <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-tight tracking-tight sm:text-6xl">{t.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#C7D4DC]">{t.intro}</p>
          <a href="#catalogo" className="mt-7 inline-block bg-[#DCEBE0] px-6 py-3 font-semibold text-[#153D31] hover:bg-[#BED9C5]">{t.explore}</a>
        </div>
      </section>
      <section id="catalogo" className="site-container px-6 py-16">
        <div className="mb-10 flex flex-wrap gap-3">
          <button type="button" onClick={() => setMode('industries')} aria-pressed={mode==='industries'} className={mode==='industries'?'bg-[#143E38] px-5 py-3 text-sm font-semibold text-white':'border border-[#BACCC0] px-5 py-3 text-sm text-[#274238]'}>{t.sectorsTitle}</button>
          <button type="button" onClick={() => setMode('services')} aria-pressed={mode==='services'} className={mode==='services'?'bg-[#143E38] px-5 py-3 text-sm font-semibold text-white':'border border-[#BACCC0] px-5 py-3 text-sm text-[#274238]'}>{t.servicesTitle}</button>
        </div>
        {mode==='industries' ? (
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl">{t.sectorsTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{t.sectorsIntro}</p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectors.map((s)=>{
                const pilot=s[0]==='SC01'
                return <article key={s[0]} className={'flex min-h-48 flex-col border bg-white p-6 '+(pilot?'border-[#6BA48A]':'border-[#DDE5DF]')}>
                  <span className="text-xs font-bold tracking-wider text-[#44856A]">{s[0]}</span>
                  <h3 className="mt-2 text-lg font-semibold leading-6">{s[ix]}</h3>
                  <p className="mt-2 text-sm text-slate-600">{s[descIx]}</p>
                  <span className="mt-auto pt-5 text-xs font-semibold text-slate-500">{released.includes(s[0])?t.open:t.upcoming}</span>
                  {released.includes(s[0]) ? <a href={hub+'/industry-lab/experience.html?sector='+s[0]+'&lang='+lang} target="_blank" rel="noopener noreferrer" className="mt-3 text-xs font-semibold text-[#24644E] underline underline-offset-4">{t.open}</a> : <Link className="mt-3 text-xs font-semibold text-[#24644E] underline underline-offset-4" href={'/contact?intent=problem&sector='+s[0]}>{request}</Link>}
                </article>
              })}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl">{t.servicesTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{t.servicesIntro}</p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s)=><article key={s[0]} className="flex min-h-40 flex-col border border-[#DDE5DF] bg-white p-6">
                <h3 className="text-lg font-semibold">{s[ix]}</h3>
                <a href={hub+s[0]} target="_blank" rel="noopener noreferrer" className="mt-auto pt-6 text-sm font-semibold text-[#24644E] underline underline-offset-4">{t.open}</a>
              </article>)}
            </div>
          </div>
        )}
        <p className="mt-6 text-xs text-slate-500">{t.note}</p>
        <a href={hub+'/'} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-sm font-semibold text-[#1C5945] underline underline-offset-4">{t.fullCatalog}</a>
      </section>
      <section className="bg-[#EAF2EC] px-6 py-16">
        <div className="site-container">
          <h2 className="max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">{t.contactTitle}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">{t.contactCopy}</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/contact?intent=problem" className="bg-[#143E38] px-5 py-3 text-sm font-semibold text-white">{t.contact}</Link>
            <a href="https://www.linkedin.com/company/sc-analytics/" target="_blank" rel="noopener noreferrer" className="border border-[#143E38] px-5 py-3 text-sm font-semibold text-[#143E38]">{t.linkedin}</a>
          </div>
        </div>
      </section>
    </main>
  )
}
