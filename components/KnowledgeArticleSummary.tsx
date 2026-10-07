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
  es: { label: 'LA TESIS EN 30 SEGUNDOS', title: 'Las ideas que necesitas antes de entrar en detalle.' },
  ca: { label: 'LA TESI EN 30 SEGONS', title: 'Les idees que necessites abans d’entrar en detall.' },
  en: { label: 'THE THESIS IN 30 SECONDS', title: 'The ideas you need before going into detail.' },
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
  if (presentation === 'statement') return unique([businessTitle, quick[0]]).slice(0, 1)
  if (presentation === 'duo') return unique([...quick, ...sectionTitles]).slice(0, 2)
  if (presentation === 'matrix' || presentation === 'diagnostic' || presentation === 'architecture') {
    return unique([...sectionTitles, ...quick]).slice(0, count)
  }
  if (presentation === 'sequence') return unique([...quick, ...sectionTitles]).slice(0, count)
  return unique([...quick, ...sectionTitles]).slice(0, count)
}

export default function KnowledgeArticleSummary(props: Props) {
  const t = COPY[props.locale]
  const items = itemsFor(props)
  if (!items.length) return null
  const statement = items.length === 1

  return (
    <section className="border-b border-slate-300 bg-[#F4F1EA]">
      <div className="site-container py-8 text-center lg:py-10">
        <p className="text-[14px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{t.label}</p>
        <h2 className="mx-auto mt-3 max-w-4xl text-[29px] leading-tight text-slate-950 sm:text-[33px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h2>

        {statement ? (
          <div className="mx-auto mt-7 max-w-[1120px] border border-slate-300 bg-white px-7 py-9 md:px-12 md:py-11">
            <p className="mx-auto max-w-[34ch] text-[28px] font-semibold leading-[1.14] text-[#1D2B44] sm:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>{items[0]}</p>
          </div>
        ) : (
          <div className={`mx-auto mt-7 grid max-w-[1240px] border-l border-t border-slate-300 ${summaryGridClass(items.length)}`}>
            {items.map((text, index) => (
              <div
                key={`${index}-${text}`}
                className={`flex min-h-[142px] flex-col items-center justify-center border-b border-r border-slate-300 px-6 py-6 ${index % 3 === 1 ? 'bg-[#EAF0F6]' : 'bg-white'}`}
              >
                <p className="font-mono text-[13px] font-semibold text-[#4F46E5]">{String(index + 1).padStart(2, '0')}</p>
                <h3 className="mt-3 max-w-[28ch] text-[21px] font-semibold leading-7 text-slate-950 sm:text-[23px]">{text}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
