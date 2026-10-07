import { summaryCountForPresentation, summaryGridClass, type KnowledgePresentationVariant } from '@/lib/knowledge-editorial'

type Props = {
  locale: 'es' | 'ca' | 'en'
  presentation: KnowledgePresentationVariant
  quick?: string[]
  sectionTitles?: string[]
  businessTitle?: string
  customItems?: string[]
}

const COPY = {
  es: {
    statement: ['LA TESIS EN 30 SEGUNDOS', 'Una idea que cambia cómo mirar el problema.'],
    duo: ['DOS LECTURAS', 'La comparación útil antes de elegir.'],
    triad: ['TRES CLAVES', 'Los criterios que ordenan la decisión.'],
    matrix: ['MAPA DEL PROBLEMA', 'Cuatro puntos para reconocer dónde falla.'],
    sequence: ['EL MARCO', 'La secuencia que convierte el análisis en acción.'],
    diagnostic: ['DIAGNÓSTICO RÁPIDO', 'Señales que merece la pena comprobar primero.'],
    evidence: ['QUÉ MIRAR', 'Tres evidencias para evaluar la decisión.'],
    architecture: ['CÓMO ENCAJA', 'Las piezas principales del sistema.'],
  },
  ca: {
    statement: ['LA TESI EN 30 SEGONS', 'Una idea que canvia com mirar el problema.'],
    duo: ['DUES LECTURES', 'La comparació útil abans de triar.'],
    triad: ['TRES CLAUS', 'Els criteris que ordenen la decisió.'],
    matrix: ['MAPA DEL PROBLEMA', 'Quatre punts per reconèixer on falla.'],
    sequence: ['EL MARC', 'La seqüència que converteix l’anàlisi en acció.'],
    diagnostic: ['DIAGNÒSTIC RÀPID', 'Senyals que val la pena comprovar primer.'],
    evidence: ['QUÈ MIRAR', 'Tres evidències per avaluar la decisió.'],
    architecture: ['COM ENCAIXA', 'Les peces principals del sistema.'],
  },
  en: {
    statement: ['THE THESIS IN 30 SECONDS', 'One idea that changes how to frame the problem.'],
    duo: ['TWO READINGS', 'The useful comparison before choosing.'],
    triad: ['THREE CRITERIA', 'The criteria that organise the decision.'],
    matrix: ['PROBLEM MAP', 'Four points that reveal where it breaks.'],
    sequence: ['THE FRAMEWORK', 'The sequence that turns analysis into action.'],
    diagnostic: ['QUICK DIAGNOSTIC', 'Signals worth checking first.'],
    evidence: ['WHAT TO LOOK AT', 'Three pieces of evidence for the decision.'],
    architecture: ['HOW IT FITS', 'The main pieces of the system.'],
  },
} as const

function unique(values: Array<string | undefined | null>) {
  const seen = new Set<string>()
  return values
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .filter(value => {
      const key = value.toLocaleLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function itemsFor({ presentation, quick = [], sectionTitles = [], businessTitle = '', customItems = [] }: Omit<Props, 'locale'>) {
  if (customItems.length) return unique(customItems).slice(0, 8)

  const count = summaryCountForPresentation(presentation)
  if (presentation === 'statement') return unique([quick[0], sectionTitles[0], businessTitle]).slice(0, 1)
  if (presentation === 'duo') return unique([...quick, ...sectionTitles]).slice(0, 2)
  if (presentation === 'matrix' || presentation === 'diagnostic' || presentation === 'architecture') {
    return unique([...sectionTitles, ...quick]).slice(0, count)
  }
  if (presentation === 'sequence') {
    const sequenceCount = Math.min(6, Math.max(3, sectionTitles.length || count))
    return unique([...sectionTitles, ...quick]).slice(0, sequenceCount)
  }
  return unique([...quick, ...sectionTitles]).slice(0, count)
}

function number(index: number) {
  return String(index + 1).padStart(2, '0')
}

function Duo({ items }: { items: string[] }) {
  return (
    <div className="mx-auto mt-7 grid max-w-[1180px] border border-slate-300 md:grid-cols-2">
      {items.map((text, index) => (
        <div key={text} className={`min-h-[180px] p-7 text-left md:p-9 ${index === 0 ? 'bg-white' : 'border-t border-slate-300 bg-[#EAF0F6] md:border-l md:border-t-0'}`}>
          <p className="font-mono text-[13px] font-semibold text-[#4F46E5]">{index === 0 ? 'A' : 'B'}</p>
          <p className="mt-5 max-w-[28ch] text-[25px] font-semibold leading-[1.18] text-[#1D2B44]" style={{ fontFamily: 'var(--font-playfair)' }}>{text}</p>
        </div>
      ))}
    </div>
  )
}

function Sequence({ items }: { items: string[] }) {
  const backgrounds = ['bg-white', 'bg-[#F7F9FC]', 'bg-[#EEF3F8]', 'bg-[#E4ECF4]', 'bg-[#D9E5F0]', 'bg-[#CEDFEB]']
  return (
    <div className={`mx-auto mt-7 grid max-w-[1240px] border-l border-t border-slate-300 ${summaryGridClass(items.length)}`}>
      {items.map((text, index) => (
        <div key={text} className={`flex min-h-[156px] flex-col items-start border-b border-r border-slate-300 p-6 text-left ${backgrounds[Math.min(index, backgrounds.length - 1)]}`}>
          <p className="font-mono text-[13px] font-semibold text-[#4F46E5]">{number(index)}</p>
          <p className="mt-4 max-w-[28ch] text-[21px] leading-[1.16] text-[#1D2B44]" style={{ fontFamily: 'var(--font-playfair)' }}>{text}</p>
        </div>
      ))}
    </div>
  )
}

function Diagnostic({ items }: { items: string[] }) {
  return (
    <div className="mx-auto mt-7 grid max-w-[1180px] border-l border-t border-slate-300 md:grid-cols-2">
      {items.map((text, index) => (
        <div key={text} className="grid min-h-[132px] grid-cols-[74px_1fr] items-stretch border-b border-r border-slate-300 bg-white text-left">
          <div className="flex items-center justify-center border-r border-slate-300 bg-[#EAF0F6] font-mono text-[14px] font-semibold text-[#4F46E5]">{number(index)}</div>
          <div className="flex items-center px-6 py-5">
            <p className="text-[20px] leading-7 text-[#1D2B44]" style={{ fontFamily: 'var(--font-playfair)' }}>{text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Evidence({ items, locale }: { items: string[]; locale: 'es' | 'ca' | 'en' }) {
  const label = locale === 'es' ? 'Evidencia' : locale === 'ca' ? 'Evidència' : 'Evidence'
  return (
    <div className="mx-auto mt-7 grid max-w-[1180px] border-l border-t border-slate-300 md:grid-cols-3">
      {items.map((text, index) => (
        <div key={text} className="min-h-[164px] border-b border-r border-slate-300 bg-white text-left">
          <div className="h-1.5 bg-[#4F46E5]" />
          <div className="p-6">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label} {number(index)}</p>
            <p className="mt-4 text-[21px] font-semibold leading-7 text-[#1D2B44]">{text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Architecture({ items }: { items: string[] }) {
  return (
    <div className="mx-auto mt-7 grid max-w-[1040px] border-l border-t border-slate-300 md:grid-cols-2">
      {items.map((text, index) => (
        <div key={text} className={`grid min-h-[150px] grid-cols-[56px_1fr] border-b border-r border-slate-300 text-left ${index === 0 || index === 3 ? 'bg-white' : 'bg-[#F7F9FC]'}`}>
          <div className="flex items-start justify-center border-r border-slate-300 pt-7 font-mono text-[13px] font-semibold text-[#4F46E5]">{number(index)}</div>
          <div className="px-6 py-6">
            <p className="text-[21px] leading-7 text-[#1D2B44]" style={{ fontFamily: 'var(--font-playfair)' }}>{text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CardGrid({ items, presentation }: { items: string[]; presentation: KnowledgePresentationVariant }) {
  const matrix = presentation === 'matrix'
  return (
    <div className={`mx-auto mt-7 grid max-w-[1240px] border-l border-t border-slate-300 ${matrix ? 'md:grid-cols-2' : summaryGridClass(items.length)}`}>
      {items.map((text, index) => (
        <div
          key={`${index}-${text}`}
          className={`flex min-h-[142px] flex-col items-center justify-start border-b border-r border-slate-300 px-6 py-6 text-center ${matrix ? (index % 2 === 0 ? 'bg-white' : 'bg-[#F7F9FC]') : (index % 2 === 0 ? 'bg-white' : 'bg-[#F7F9FC]')}`}
        >
          <p className="font-mono text-[13px] font-semibold text-[#4F46E5]">{number(index)}</p>
          <h3 className="mt-4 max-w-[28ch] text-[21px] leading-7 text-slate-950 sm:text-[23px]" style={{ fontFamily: 'var(--font-playfair)' }}>{text}</h3>
        </div>
      ))}
    </div>
  )
}

export default function KnowledgeArticleSummary(props: Props) {
  const items = itemsFor(props)
  if (!items.length) return null
  const [label, title] = COPY[props.locale][props.presentation]

  return (
    <section className="border-b border-slate-300 bg-[#EAF0F6]">
      <div className="site-container py-8 text-center lg:py-10">
        <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{label}</p>
        <h2 className="mx-auto mt-3 max-w-4xl text-[29px] leading-tight text-slate-950 sm:text-[33px]" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h2>

        {props.presentation === 'statement' ? (
          <div className="mx-auto mt-7 max-w-[1120px] border border-slate-300 bg-white px-7 py-9 md:px-12 md:py-11">
            <p className="mx-auto max-w-[34ch] text-[28px] font-semibold leading-[1.14] text-[#1D2B44] sm:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>{items[0]}</p>
          </div>
        ) : props.presentation === 'duo' ? (
          <Duo items={items} />
        ) : props.presentation === 'sequence' ? (
          <Sequence items={items} />
        ) : props.presentation === 'diagnostic' ? (
          <Diagnostic items={items} />
        ) : props.presentation === 'evidence' ? (
          <Evidence items={items} locale={props.locale} />
        ) : props.presentation === 'architecture' ? (
          <Architecture items={items} />
        ) : (
          <CardGrid items={items} presentation={props.presentation} />
        )}
      </div>
    </section>
  )
}
