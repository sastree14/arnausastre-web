import type { SiteLanguage } from '@/lib/public-copy'
import { sc12BusinessOutcomeMetrics } from '@/lib/project-commercial-copy'

export default function BusinessScenarioStrip({
  label,
  headline,
  summary,
  lang,
}: {
  label: string
  headline: string
  summary: string
  lang: SiteLanguage
}) {
  return (
    <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
      <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1800px] py-8 sm:w-[calc(100%_-_48px)] lg:py-10">
        <div className="grid gap-[clamp(28px,4vw,64px)] lg:grid-cols-[minmax(0,.78fr)_minmax(520px,1.22fr)] lg:items-center">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7A7DFF]">{label}</p>
            <h2
              className="mt-3 max-w-xl text-[30px] leading-[1.08] text-white sm:text-[34px]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {headline}
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#DCE6EF]">{summary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {sc12BusinessOutcomeMetrics[lang].map((metric) => (
              <div
                key={metric.label}
                className="flex min-h-[142px] flex-col justify-center border border-[#5E86A8] bg-[#102033] px-5 py-5"
              >
                <p className="text-[34px] font-semibold leading-none tracking-[-0.02em] text-white">{metric.value}</p>
                <p className="mt-3 text-[12px] font-semibold uppercase leading-5 tracking-[0.1em] text-[#DCE6EF]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
