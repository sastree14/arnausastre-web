import type { SiteLanguage } from '@/lib/public-copy'
import { sc12BusinessOutcomeMetrics } from '@/lib/project-commercial-copy'

export default function BusinessScenarioStrip({
  label,
  headline,
  summary,
  note,
  lang,
}: {
  label: string
  headline: string
  summary: string
  note: string
  lang: SiteLanguage
}) {
  return (
    <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{label}</p>
            <h2 className="mt-3 max-w-2xl text-[30px] leading-[1.08] text-white sm:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {headline}
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-6 text-[#A8BACB]">{summary}</p>
          </div>

          <div className="grid border-y border-[#5E86A8] sm:grid-cols-3 sm:divide-x sm:divide-[#5E86A8]">
            {sc12BusinessOutcomeMetrics[lang].map((metric) => (
              <div key={metric.label} className="border-b border-[#5E86A8] px-5 py-5 last:border-b-0 sm:border-b-0">
                <p className="text-[32px] font-semibold leading-none text-white">{metric.value}</p>
                <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#A8BACB]">{metric.label}</p>
                <p className="mt-2 text-[13px] leading-5 text-[#7F9BB5]">{metric.note}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 border-t border-[#496C8A] pt-4 text-[12px] leading-5 text-[#7F9BB5]">{note}</p>
      </div>
    </section>
  )
}
