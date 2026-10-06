'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'PARTNER DATA E IA',
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
    fitTitle: 'Tres formas de incorporar capacidad especializada.',
    fits: [
      ['Empresas que quieren ampliar capacidad', 'Especialización adicional para iniciativas concretas.'],
      ['Equipos con retos técnicos específicos', 'Aportamos profundidad en datos, IA, modelado o automatización cuando el reto lo exige.'],
      ['Agencias y consultoras', 'Complementamos vuestra propuesta con capacidad técnica especializada cuando el proyecto lo requiere.'],
    ],

    modelLabel: 'CÓMO FUNCIONA',
    modelTitle: 'Capacidad especializada con continuidad y contexto.',
    model: [
      ['01', 'Entendemos vuestro contexto'],
      ['02', 'Activamos la especialidad adecuada'],
      ['03', 'Conservamos el conocimiento'],
      ['04', 'Aportamos valor de forma continua'],
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
    eyebrow: 'PARTNER DADES I IA',
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
    fitTitle: 'Tres maneres d’incorporar capacitat especialitzada.',
    fits: [
      ['Empreses que volen ampliar capacitat', 'Especialització addicional per a iniciatives concretes.'],
      ['Equips amb reptes tècnics específics', 'Aportem profunditat en dades, IA, modelatge o automatització quan el repte ho exigeix.'],
      ['Agències i consultores', 'Complementem la vostra proposta amb capacitat tècnica especialitzada quan el projecte ho requereix.'],
    ],

    modelLabel: 'COM FUNCIONA',
    modelTitle: 'Capacitat especialitzada amb continuïtat i context.',
    model: [
      ['01', 'Entenem el vostre context'],
      ['02', 'Activem l’especialitat adequada'],
      ['03', 'Conservem el coneixement'],
      ['04', 'Aportem valor de manera contínua'],
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
    eyebrow: 'DATA AND AI PARTNER',
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
    fitTitle: 'Three ways to bring in specialist capability.',
    fits: [
      ['Companies looking to extend capability', 'Additional specialist depth for concrete initiatives.'],
      ['Teams facing specific technical challenges', 'We add depth in data, AI, modelling or automation when the challenge requires it.'],
      ['Agencies and consultancies', 'We complement your offer with specialist technical capability when a project requires it.'],
    ],

    modelLabel: 'HOW IT WORKS',
    modelTitle: 'Specialist capability with continuity and context.',
    model: [
      ['01', 'We understand your context'],
      ['02', 'We activate the right specialism'],
      ['03', 'We retain the knowledge'],
      ['04', 'We keep creating value'],
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

const fitPalette = [
  { bg: '#F4F1EA', border: '#CBD5E1' },
  { bg: '#EAF0F6', border: '#CBD5E1' },
  { bg: '#EAF0F6', border: '#CBD5E1' },
]

const modelPalette = [
  { bg: '#F4F1EA', border: '#CBD5E1' },
  { bg: '#EAF0F6', border: '#CBD5E1' },
  { bg: '#F4F1EA', border: '#CBD5E1' },
  { bg: '#EAF0F6', border: '#CBD5E1' },
]

export default function AnalyticalPartnerPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-white text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container grid gap-12 py-16 md:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
            <h1 className="mx-auto mt-5 max-w-5xl text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact?intent=partner" className="bg-white px-5 py-3 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#EAF0F6]">{t.primary}</Link>
              <Link href="/services" className="border border-[#7F9BB5] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/5">{t.secondary}</Link>
            </div>
          </div>

          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.valueLabel}</p>
            <div className="mt-5 border-t border-[#496C8A]">
              {t.value.map((item, index) => (
                <div key={item} className="grid min-h-[78px] grid-cols-[48px_1fr] items-center gap-4 border-b border-[#496C8A] py-4">
                  <span className="font-mono text-[14px] font-semibold text-[#7A7DFF]">0{index + 1}</span>
                  <p className="text-[17px] font-semibold leading-7 text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="site-container py-14 md:py-16">
          <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.fitLabel}</p>
          <h2 className="mt-4 max-w-6xl text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.fitTitle}</h2>

          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            {t.fits.map(([title, body], index) => {
              const palette = fitPalette[index]
              return (
                <article
                  key={title}
                  className="flex min-h-[220px] flex-col border p-7"
                  style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                >
                  <p className="font-mono text-[14px] font-semibold text-[#254A66]">0{index + 1}</p>
                  <h3 className="mt-5 max-w-[24ch] text-[27px] font-semibold leading-[1.12] text-[#0D1B2A]">{title}</h3>
                  <p className="mt-auto max-w-[32ch] pt-8 text-[15px] leading-6 text-slate-700">{body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="site-container py-16 md:py-20">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.modelLabel}</p>
            <h2 className="mx-auto mt-4 max-w-4xl text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelTitle}</h2>
          </div>

          <div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {t.model.map(([number, title], index) => {
              const palette = modelPalette[index]
              return (
                <article
                  key={number}
                  className="grid min-h-[180px] grid-rows-[auto_1fr] border p-6"
                  style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                >
                  <span className="font-mono text-[14px] font-semibold text-[#254A66]">{number}</span>
                  <div className="flex items-center justify-center px-2 text-center">
                    <h3 className="max-w-[18ch] text-[22px] font-semibold leading-7 text-[#0D1B2A]">{title}</h3>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="site-container py-14 md:py-16">
          <div className="text-center">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.exploreLabel}</p>
            <h2 className="mx-auto mt-3 max-w-4xl text-[34px] leading-[1.06] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.exploreTitle}</h2>
          </div>

          <div className="mt-8 grid border-l border-t border-slate-300 md:grid-cols-3">
            {t.exploreLinks.map(([title, body, href], index) => (
              <Link
                key={href}
                href={href}
                className={`group flex min-h-[220px] flex-col justify-between border-b border-r border-slate-300 p-7 transition ${index === 0 ? 'bg-[#F4F1EA] hover:bg-[#F4F1EA]' : index === 1 ? 'bg-[#EAF0F6] hover:bg-[#EAF0F6]' : 'bg-[#F4F1EA] hover:bg-[#F4F1EA]'}`}
              >
                <div>
                  <h3 className="text-[28px] leading-[1.1] text-slate-950" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                  <p className="mt-4 max-w-[30ch] text-[16px] leading-7 text-slate-600">{body}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-[16px] font-semibold text-[#254A66]">
                  {lang === 'es' ? 'Explorar' : lang === 'ca' ? 'Explorar' : 'Explore'} <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="site-container flex flex-col gap-7 py-11 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-4xl text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-7 text-slate-700">{t.ctaBody}</p>
          </div>
          <Link href="/contact?intent=partner" className="inline-flex shrink-0 bg-[#0D1B2A] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#254A66]">{t.cta} →</Link>
        </div>
      </section>
    </main>
  )
}
