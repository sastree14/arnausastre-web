'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    eyebrow: 'POR QUÉ SC-ANALYTICS',
    title: 'Capacidad técnica con criterio de negocio y responsabilidad sobre el resultado.',
    intro: 'Combinamos capacidad técnica, criterio de negocio y una forma de trabajar pensada para generar confianza y resultados.',

    reasonsLabel: 'POR QUÉ CONSTRUIR CON NOSOTROS',
    reasonsTitle: 'Por qué trabajar con SC-Analytics.',
    reasons: [
      ['Comprender antes de construir', 'Empezamos por la decisión y el negocio. La tecnología viene después.'],
      ['La solución adecuada', 'Usamos la complejidad que aporta valor, no la que impresiona.'],
      ['Comunicación directa', 'Menos capas. Más claridad, contexto y responsabilidad.'],
      ['Contexto que se acumula', 'Cada proyecto hace que la siguiente decisión pueda resolverse mejor y más rápido.'],
    ],

    proofLabel: 'NUESTRO ESTÁNDAR',
    proofTitle: 'Ser rigurosos también significa saber cuándo no avanzar.',
    proofBody: 'Si no vemos un caso razonable, lo diremos. Preferimos una relación útil a un proyecto innecesariamente grande.',
    principles: [
      'Valor antes que tecnología',
      'Rigor cuantitativo',
      'Transparencia sobre límites y riesgos',
      'Sistemas preparados para operar',
      'Impacto empresarial medible y trazable',
    ],

    modelLabel: 'MODELO DE TRABAJO',
    modelTitle: 'Confianza, especialización y responsabilidad.',
    values: [
      ['Confianza', 'Cumplimos lo acordado.'],
      ['Transparencia', 'Decisiones y límites claros.'],
      ['Especialización', 'Profundidad técnica cuando aporta valor.'],
      ['Responsabilidad', 'Respondemos por el trabajo y el resultado.'],
    ],
    pathsLabel: 'SIGUIENTE PASO',
    pathsTitle: 'Elige cómo quieres avanzar.',
    paths: [
      ['Casos de éxito', 'Verlo aplicado.', '/projects'],
      ['Partner Data e IA', 'Conocer el modelo partner.', '/partner-analitico'],
      ['Proyecto individualizado', 'Hablar de una necesidad concreta.', '/contact?intent=problem'],
    ],

    ctaTitle: 'Si existe encaje entre vuestra forma de trabajar y la nuestra, definamos el primer paso.',
    ctaBody: 'La primera conversación sirve para entender la prioridad, valorar el encaje y acordar un siguiente paso razonable.',
    cta: 'Contacta con nosotros',
  },

  ca: {
    eyebrow: 'PER QUÈ SC-ANALYTICS',
    title: 'Capacitat tècnica amb criteri de negoci i responsabilitat sobre el resultat.',
    intro: 'Combinem capacitat tècnica, criteri de negoci i una manera de treballar pensada per generar confiança i resultats.',

    reasonsLabel: 'PER QUÈ CONSTRUIR AMB NOSALTRES',
    reasonsTitle: 'Per què treballar amb SC-Analytics.',
    reasons: [
      ['Comprendre abans de construir', 'Comencem per la decisió i el negoci. La tecnologia ve després.'],
      ['La solució adequada', 'Utilitzem la complexitat que aporta valor, no la que impressiona.'],
      ['Comunicació directa', 'Menys capes. Més claredat, context i responsabilitat.'],
      ['Context que s’acumula', 'Cada projecte fa que la següent decisió es pugui resoldre millor i més ràpid.'],
    ],

    proofLabel: 'EL NOSTRE ESTÀNDARD',
    proofTitle: 'Ser rigorosos també significa saber quan no avançar.',
    proofBody: 'Si no veiem un cas raonable, ho direm. Preferim una relació útil a un projecte innecessàriament gran.',
    principles: [
      'Valor abans que tecnologia',
      'Rigor quantitatiu',
      'Transparència sobre límits i riscos',
      'Sistemes preparats per operar',
      'Impacte empresarial mesurable i traçable',
    ],

    modelLabel: 'MODEL DE TREBALL',
    modelTitle: 'Confiança, especialització i responsabilitat.',
    values: [
      ['Confiança', 'Complim allò acordat.'],
      ['Transparència', 'Decisions i límits clars.'],
      ['Especialització', 'Profunditat tècnica quan aporta valor.'],
      ['Responsabilitat', 'Responem pel treball i pel resultat.'],
    ],
    pathsLabel: 'SEGÜENT PAS',
    pathsTitle: 'Tria com vols avançar.',
    paths: [
      ['Casos d’èxit', 'Veure-ho aplicat.', '/projects'],
      ['Partner Dades i IA', 'Conèixer el model partner.', '/partner-analitico'],
      ['Projecte individualitzat', 'Parlar d’una necessitat concreta.', '/contact?intent=problem'],
    ],

    ctaTitle: 'Si hi ha encaix entre la vostra manera de treballar i la nostra, definim el primer pas.',
    ctaBody: 'La primera conversa serveix per entendre la prioritat, valorar l’encaix i acordar un següent pas raonable.',
    cta: 'Contacta amb nosaltres',
  },

  en: {
    eyebrow: 'WHY SC-ANALYTICS',
    title: 'Technical capability with business judgment and accountability for the outcome.',
    intro: 'We combine technical capability, business judgment and a way of working designed to create trust and results.',

    reasonsLabel: 'WHY BUILD WITH US',
    reasonsTitle: 'Why work with SC-Analytics.',
    reasons: [
      ['Understand before building', 'We start with the decision and the business. Technology comes afterwards.'],
      ['The right solution', 'We use the complexity that creates value, not the complexity that impresses.'],
      ['Direct communication', 'Fewer layers. More clarity, context and accountability.'],
      ['Context compounds', 'Every project makes the next decision faster and better informed.'],
    ],

    proofLabel: 'OUR STANDARD',
    proofTitle: 'Rigor also means knowing when not to proceed.',
    proofBody: 'If we do not see a sensible case, we will say so. We prefer a useful relationship to an unnecessarily large project.',
    principles: [
      'Value before technology',
      'Quantitative rigor',
      'Transparency about limits and risks',
      'Systems built for real operations',
      'Measurable and traceable business impact',
    ],

    modelLabel: 'WORKING MODEL',
    modelTitle: 'Trust, specialist depth and accountability.',
    values: [
      ['Trust', 'We do what we agree.'],
      ['Transparency', 'Clear decisions and clear limits.'],
      ['Specialist depth', 'Technical depth when it creates value.'],
      ['Accountability', 'We own the work and the outcome.'],
    ],
    pathsLabel: 'NEXT STEP',
    pathsTitle: 'Choose how you want to move forward.',
    paths: [
      ['Success stories', 'See it applied.', '/projects'],
      ['Data and AI Partner', 'Explore the partner model.', '/partner-analitico'],
      ['Defined project', 'Discuss one concrete need.', '/contact?intent=problem'],
    ],

    ctaTitle: 'If there is a fit between the way you work and the way we work, define the first step with us.',
    ctaBody: 'The first conversation is enough to understand the priority, assess fit and agree a sensible next step.',
    cta: 'Contact us',
  },
} as const

const valuePalette = [
  { bg: '#F4F1EA', border: '#CBD5E1', text: '#0D1B2A', number: '#254A66' },
  { bg: '#EAF0F6', border: '#CBD5E1', text: '#0D1B2A', number: '#254A66' },
  { bg: '#254A66', border: '#254A66', text: '#FFFFFF', number: '#EAF0F6' },
  { bg: '#F4F1EA', border: '#CBD5E1', text: '#0D1B2A', number: '#254A66' },
]

export default function AboutPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container py-16 text-center md:py-20">
          <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">{t.eyebrow}</p>
          <h1 className="mx-auto mt-5 max-w-5xl text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-[19px] leading-8 text-[#EAF0F6]">{t.intro}</p>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="site-container py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.reasonsLabel}</p>
            <h2 className="max-w-3xl text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.reasonsTitle}</h2>
          </div>

          <div className="mt-8 grid border-l border-t border-slate-300 md:grid-cols-2">
            {t.reasons.map(([title, body], index) => (
              <article key={title} className={`min-h-[210px] border-b border-r border-slate-300 p-7 ${index === 0 || index === 3 ? 'bg-[#F4F1EA]' : 'bg-white'}`}>
                <p className="font-mono text-[14px] text-[#254A66]">0{index + 1}</p>
                <h3 className="mt-4 text-[24px] font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 max-w-xl text-[17px] leading-7 text-slate-700">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#FAFAF7]">
        <div className="site-container grid gap-10 py-14 md:py-16 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.proofLabel}</p>
            <h2 className="mt-4 max-w-xl text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.proofTitle}</h2>
            <p className="mt-5 max-w-xl text-[17px] leading-7 text-slate-700">{t.proofBody}</p>
          </div>

          <div className="border-y border-slate-400">
            {t.principles.map((item, index) => (
              <div key={item} className="grid min-h-[76px] grid-cols-[66px_1fr] items-center gap-5 border-b border-slate-300 py-4 last:border-b-0">
                <span className="font-mono text-[16px] font-semibold text-[#254A66]">0{index + 1}</span>
                <p className="text-[19px] font-semibold leading-7 text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="site-container py-14 md:py-16">
          <div className="grid gap-7 lg:grid-cols-[190px_1fr] lg:gap-10">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#254A66]">{t.modelLabel}</p>
            <div>
              <h2 className="max-w-4xl text-[34px] leading-[1.07] sm:text-[40px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.modelTitle}</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {t.values.map(([title], index) => {
              const palette = valuePalette[index]
              return (
                <article
                  key={title}
                  className="grid min-h-[155px] grid-rows-[auto_1fr] border p-6"
                  style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                >
                  <span className="font-mono text-[14px] font-semibold" style={{ color: palette.number }}>0{index + 1}</span>
                  <div className="flex items-center">
                    <h3 className="text-[24px] font-semibold leading-7" style={{ color: palette.text }}>{title}</h3>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="site-container py-12 md:py-14">
          <div className="max-w-4xl">
            <p className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{t.pathsLabel}</p>
            <h3 className="mt-3 max-w-3xl text-[32px] leading-[1.08] text-white sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.pathsTitle}</h3>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {t.paths.map(([title, body, href], index) => (
              <Link
                key={href}
                href={href}
                className={`group relative flex min-h-[205px] flex-col justify-between border p-7 text-[#0D1B2A] transition duration-200 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-xl active:scale-[1.005] ${index === 0 ? 'border-[#CBD5E1] bg-[#F4F1EA]' : index === 1 ? 'border-[#CBD5E1] bg-[#EAF0F6]' : 'border-[#CBD5E1] bg-[#F4F1EA]'}`}
              >
                <div>
                  <h3 className="text-[28px] leading-[1.1]" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                  <p className="mt-4 max-w-[28ch] text-[15px] leading-6 text-slate-700">{body}</p>
                </div>
                <span className="mt-8 text-[16px] font-semibold text-[#254A66]">
                  {lang === 'es' ? 'Explorar' : lang === 'ca' ? 'Explorar' : 'Explore'} <span className="inline-block transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-[#F4F1EA]">
        <div className="site-container flex flex-col gap-6 py-11 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-4xl text-[32px] leading-[1.08] sm:text-[38px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.ctaTitle}</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-7 text-slate-700">{t.ctaBody}</p>
          </div>
          <Link href="/contact?intent=discovery" className="inline-flex shrink-0 bg-[#0D1B2A] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#254A66]">{t.cta} →</Link>
        </div>
      </section>
    </main>
  )
}
