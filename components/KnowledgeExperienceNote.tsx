type Props = {
  locale: 'es' | 'ca' | 'en'
  note?: string
}

const LABEL = {
  es: 'DESDE LA PRÁCTICA',
  ca: 'DES DE LA PRÀCTICA',
  en: 'FROM PRACTICE',
} as const

export default function KnowledgeExperienceNote({ locale, note }: Props) {
  if (!note) return null
  return (
    <section className="border-y border-slate-300 bg-[#EAF0F6]">
      <div className="site-container py-9 lg:py-10">
        <div className="mx-auto max-w-[980px] border-l-4 border-[#4F46E5] bg-white px-7 py-7 md:px-9">
          <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#4F46E5]">{LABEL[locale]}</p>
          <p className="mt-3 text-[20px] leading-8 text-[#1D2B44]">{note}</p>
        </div>
      </div>
    </section>
  )
}
