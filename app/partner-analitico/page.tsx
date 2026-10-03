'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'PARTNER DATA & AI',
    title: 'Capacidad analítica y tecnológica especializada, sin construir todo el equipo internamente.',
    intro: 'Nos integramos como capacidad tecnológica y analítica externa, conservando contexto y activando la especialidad que necesitas en cada momento.',
    primary: 'Hablar del modelo partner',
    secondary: 'Ver cómo trabajamos',

    valueLabel: 'LO QUE CAMBIA',
    value: [
      'Un partner. Una responsabilidad clara.',
      'El contexto se conserva entre proyectos.',
      'Activamos especialistas cuando realmente hacen falta.',
      'Más capacidad especializada sin replicarla toda internamente.',
    ],

    fitLabel: 'PARA QUIÉN',
    fitTitle: 'Para empresas que quieren llegar más lejos con sus equipos, sin incorporar cada especialidad de Data & AI de forma permanente.',
    fits: [
      ['Empresas que quieren ampliar capacidad', 'Complementamos el equipo existente con especialización avanzada cuando aparece una necesidad concreta.'],
      ['Equipos de datos, tecnología u operaciones', 'Aportamos profundidad adicional en problemas que exigen capacidades específicas o experiencia especializada.'],
      ['Agencias y consultoras', 'Reforzamos la entrega técnica detrás de vuestra propuesta, manteniendo intacta la relación con el cliente final.'],
    ],

    modelLabel: 'CÓMO FUNCIONA',
    modelTitle: 'Aprendemos el contexto y aportamos valor donde más se necesita.',
    model: [
      ['01', 'Aprendemos el contexto', 'Entendemos negocio, sistemas y prioridades.'],
      ['02', 'Entramos donde hace falta', 'Activamos la capacidad adecuada para cada reto.'],
      ['03', 'Conservamos conocimiento', 'Cada proyecto acelera el siguiente.'],
      ['04', 'Seguimos aportando valor', 'La continuidad existe mientras siga siendo útil.'],
    ],

    exploreLabel: 'VALOREMOS EL ENCAJE',
    exploreTitle: 'Comprueba si nuestras organizaciones pueden trabajar bien juntas.',
    exploreLinks: [
      ['Cómo trabajamos', 'Nuestro método, de problema a impacto.', '/services'],
      ['Casos de éxito', 'Problemas y sistemas explicados con evidencia.', '/projects'],
      ['Conocimiento', 'Cómo pensamos antes de construir.', '/knowledge'],
    ],

    ctaTitle: 'Valoremos cómo encajaría SC-Analytics en vuestra organización.',
    ctaBody: 'Una primera conversación basta para definir necesidades, forma de colaboración y un posible siguiente paso.',
    cta: 'Valorar el modelo de colaboración',
  },

  ca: {
    eyebrow: 'PARTNER DATA & AI',
    title: 'Capacitat analítica i tecnològica especialitzada, sense construir tot l’equip internament.',
    intro: 'Ens integrem com a capacitat tecnològica i analítica externa, conservant context i activant l’especialitat que necessites en cada moment.',
    primary: 'Parlar del model partner',
    secondary: 'Veure com treballem',

    valueLabel: 'QUÈ CANVIA',
    value: [
      'Un partner. Una responsabilitat clara.',
      'El context es conserva entre projectes.',
      'Activem especialistes quan realment fan falta.',
      'Més capacitat especialitzada sense replicar-la tota internament.',
    ],

    fitLabel: 'PER A QUI',
    fitTitle: 'Per a empreses que volen arribar més lluny amb els seus equips, sense incorporar cada especialitat de Data & AI de manera permanent.',
    fits: [
      ['Empreses que volen ampliar capacitat', 'Complementem l’equip existent amb especialització avançada quan apareix una necessitat concreta.'],
      ['Equips de dades, tecnologia o operacions', 'Aportem profunditat addicional en problemes que exigeixen capacitats específiques o experiència especialitzada.'],
      ['Agències i consultores', 'Reforcem l’entrega tècnica darrere de la vostra proposta, mantenint intacta la relació amb el client final.'],
    ],

    modelLabel: 'COM FUNCIONA',
    modelTitle: 'Aprenem el context i aportem valor on més es necessita.',
    model: [
      ['01', 'Aprenem el context', 'Entenem negoci, sistemes i prioritats.'],
      ['02', 'Entrem on cal', 'Activem la capacitat adequada per a cada repte.'],
      ['03', 'Conservem coneixement', 'Cada projecte accelera el següent.'],
      ['04', 'Seguim aportant valor', 'La continuïtat existeix mentre segueixi sent útil.'],
    ],

    exploreLabel: 'VALOREM L’ENCAIX',
    exploreTitle: 'Comprova si les nostres organitzacions poden treballar bé juntes.',
    exploreLinks: [
      ['Com treballem', 'El nostre mètode, de problema a impacte.', '/services'],
      ['Casos d’èxit', 'Problemes i sistemes explicats amb evidència.', '/projects'],
      ['Coneixement', 'Com pensem abans de construir.', '/knowledge'],
    ],

    ctaTitle: 'Valorem com encaixaria SC-Analytics a la vostra organització.',
    ctaBody: 'Una primera conversa és suficient per definir necessitats, forma de col·laboració i un possible següent pas.',
    cta: 'Valorar el model de col·laboració',
  },

  en: {
    eyebrow: 'DATA & AI PARTNER',
    title: 'Specialist analytical and technology capability, without building the entire team in-house.',
    intro: 'We integrate as external technology and analytical capability, retaining context and activating the right specialism when needed.',
    primary: 'Discuss the partner model',
    secondary: 'See how we work',

    valueLabel: 'WHAT CHANGES',
    value: [
      'One partner. Clear accountability.',
      'Context is retained between projects.',
      'Specialists are activated when they are genuinely needed.',
      'More specialist capability without replicating it all in-house.',
    ],

    fitLabel: 'WHO IT IS FOR',
    fitTitle: 'For companies that want to take their teams further without permanently hiring every Data & AI specialism.',
    fits: [
      ['Companies looking to extend capability', 'We complement the existing team with advanced specialist depth when a concrete need appears.'],
      ['Data, technology or operations teams', 'We add depth when a problem requires specific capabilities or specialist experience.'],
      ['Agencies and consultancies', 'We strengthen the technical delivery behind your offer while preserving your client relationship.'],
    ],

    modelLabel: 'HOW IT WORKS',
    modelTitle: 'We learn the context and create value where it matters most.',
    model: [
      ['01', 'We learn the context', 'We understand the business, systems and priorities.'],
      ['02', 'We step in where needed', 'We activate the right capability for each challenge.'],
      ['03', 'We retain knowledge', 'Every project makes the next one faster.'],
      ['04', 'We keep creating value', 'Continuity exists only while it remains useful.'],
    ],

    exploreLabel: 'ASSESS THE FIT',
    exploreTitle: 'See whether our organisations are a strong fit for working together.',
    exploreLinks: [
      ['How we work', 'Our method, from problem to impact.', '/services'],
      ['Success stories', 'Problems and systems explained with evidence.', '/projects'],
      ['Knowledge', 'How we think before we build.', '/knowledge'],
    ],

    ctaTitle: 'Assess how SC-Analytics could fit into your organisation.',
    ctaBody: 'One first conversation is enough to define the need, the collaboration model and a possible next step.',
    cta: 'Assess the collaboration model',
  },
} as const

const modelPalette = [
  { bg: '#F7F1E8', border: '#DDCFBD' },
  { bg: '#F2ECF7', border: '#D7C8E3' },
  { bg: '#EAF3F8', border: '#C8DCE8' },
  { bg: '#EDF4EE', border: '#C9D9CD' },
]

export default function AnalyticalPartnerPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mt-5 max-w-5xl text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mt-6 max-w-3xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact?intent=partner" className="bg-white px-5 py-3 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{t.primary}</Link>
              <Link href="/services" className="border border-[#7F9BB5] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/5">{t.secondary}</Link>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.valueLabel}</p>
            <div className="mt-5 border-t border-[#496C8A]">
              {t.value.map((item, index) => (
                <div key={item} className="grid min-h-[78px] grid-cols-[48px_1fr] items-center gap-4 border-b border-[#496C8A] py-4">
                  <span className="font-mono text-[13px] font-semibold text-[#8E91FF]">0{index + 1}</span>
                  <p className="text-[17px] font-semibold leading-7 text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.fitLabel}</p>
          <h2 className="mt-4 max-w-6xl text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.fitTitle}</h2>

          <div className="mt-8 grid border-l border-t border-slate-300 lg:grid-cols-3">
            {t.fits.map(([title, body], index) => (
              <article key={title} className={`min-h-[245px] border-b border-r border-slate-300 p-7 ${index === 1 ? 'bg-[#F4F1EA]' : 'bg-white'}`}>
                <p className="font-mono text-[13px] font-semibold text-indigo-700">0{index + 1}</p>
                <h3 className="mt-5 text-[25px] font-semibold leading-8 text-slate-950">{title}</h3>
                <p className="mt-4 text-[17px] leading-7 text-slate-700">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.modelLabel}</p>
              <h2 className="mt-4 text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelTitle}</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {t.model.map(([number, title, body], index) => {
                const palette = modelPalette[index]
                return (
                  <article
                    key={number}
                    className="min-h-[185px] border p-6"
                    style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[14px] font-semibold text-indigo-700">{number}</span>
                      <span className="h-px flex-1" style={{ backgroundColor: palette.border }} />
                    </div>
                    <h3 className="mt-6 text-[24px] font-semibold leading-8 text-[#1D2B44]">{title}</h3>
                    <p className="mt-3 text-[17px] leading-7 text-slate-700">{body}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-indigo-700">{t.exploreLabel}</p>
            <h2 className="mx-auto mt-3 max-w-4xl text-[34px] leading-[1.06] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
          </div>

          <div className="mt-8 grid border-l border-t border-slate-300 md:grid-cols-3">
            {t.exploreLinks.map(([title, body, href], index) => (
              <Link
                key={href}
                href={href}
                className={`group flex min-h-[220px] flex-col justify-between border-b border-r border-slate-300 p-7 transition ${index === 1 ? 'bg-[#F4F1EA]' : index === 2 ? 'bg-[#EAF0F6]' : 'bg-white'} hover:bg-[#F7F7F3]`}
              >
                <div>
                  <h3 className="text-[28px] leading-[1.1] text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                  <p className="mt-4 max-w-[30ch] text-[16px] leading-7 text-slate-600">{body}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-[16px] font-semibold text-indigo-700">
                  {lang === 'es' ? 'Explorar' : lang === 'ca' ? 'Explorar' : 'Explore'} <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 py-11 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-4xl text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-7 text-slate-700">{t.ctaBody}</p>
          </div>
          <Link href="/contact?intent=partner" className="inline-flex shrink-0 bg-slate-950 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-slate-800">{t.cta} →</Link>
        </div>
      </section>
    </main>
  )
}
