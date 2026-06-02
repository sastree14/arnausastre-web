'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BarChart3, Network, TrendingUp, Target, Workflow } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import { useRevealChildren } from '@/hooks/useScrollAnimation'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealChildren()
  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  )
}

function HeroReveal({ children }: { children: React.ReactNode }) {
  const ref = useRevealChildren()
  return <div ref={ref}>{children}</div>
}

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function DisciplineCard({ icon, name, desc, tags }: { icon: React.ReactNode; name: string; desc: string; tags: string }) {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="h-0.5 bg-indigo-500" />
      <div className="p-5 flex flex-col gap-3.5">
        {/* Icon + name on same line */}
        <div className="flex items-center gap-2.5">
          <span className="text-indigo-500 flex-shrink-0">{icon}</span>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-900 leading-tight">{name}</p>
        </div>
        {/* Description — larger and clearer */}
        <p className="text-sm leading-6 text-slate-700" style={{ fontFamily: 'var(--font-playfair)' }}>{desc}</p>
        {/* Tags */}
        <p className="text-xs leading-5 text-slate-400 border-t border-slate-100 pt-3">{tags}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { lang } = useLanguage()
  const t = translations[lang].home

  return (
    <main className="bg-slate-50 text-slate-900 page-enter">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* LEFT — text */}
            <HeroReveal>
              <div>
                <h1
                  className="reveal text-5xl leading-[1.1] md:text-6xl text-white"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {t.heroTitle}
                  <br />
                  <span className="italic text-slate-300">{t.heroTitleLine2}</span>
                </h1>

                <div className="reveal reveal-delay-1 mt-8 border-l-2 border-indigo-500 pl-5 space-y-2">
                  <p className="text-base font-semibold text-white">{t.heroSubL1}</p>
                  <p className="text-base text-slate-300">{t.heroSubL2}</p>
                  <p className="text-base text-slate-400">{t.heroSubL3}</p>
                </div>

                <div className="reveal reveal-delay-3 mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/about"
                    className="rounded-md bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  >
                    {t.heroCta1}
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {t.heroCta2}
                  </Link>
                </div>
              </div>
            </HeroReveal>

            {/* RIGHT — white logo on transparent background */}
            <div className="hidden lg:flex items-center justify-center">
              <Image
                src="/brand/logo-white.png"
                alt="SC-Analytics"
                width={1536}
                height={1024}
                className="w-[36rem] h-auto"
                style={{ opacity: 0.72 }}
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. THE CHALLENGE ────────────────────────────────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-20">

          {/* Two-column header */}
          <div className="grid gap-16 lg:grid-cols-2 lg:items-stretch">

            {/* Left — title + highlighted sentence + list + statements */}
            <div className="flex flex-col gap-8 justify-between">
              <h2
                className="reveal text-4xl leading-tight text-slate-900"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.problemTitle}
              </h2>

              {/* Highlighted sentence */}
              <div className="reveal reveal-delay-1 border-l-4 border-indigo-500 pl-5">
                <p className="text-lg font-semibold text-slate-800 leading-snug" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {t.probHighlight}
                </p>
              </div>

              {/* Executive list */}
              <div className="reveal reveal-delay-2">
                <p className="text-sm uppercase tracking-[0.14em] text-slate-400 font-medium mb-4">
                  {t.probListIntro}
                </p>
                <ul className="space-y-2.5">
                  {[t.probItem1, t.probItem2, t.probItem3, t.probItem4, t.probItem5, t.probItem6, t.probItem7].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 text-sm leading-6">
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Statements */}
              <div className="reveal reveal-delay-3 space-y-4">
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-5 py-4">
                  <p className="text-sm leading-7 text-slate-700">{t.problemSt1}</p>
                </div>
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-5 py-4">
                  <p className="text-sm leading-7 font-semibold text-slate-800">{t.problemSt2}</p>
                </div>
              </div>
            </div>

            {/* Right — 6 challenge cards, 2-col grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Card 1 */}
              <div className="reveal reveal-delay-1 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="1" y="1" width="7" height="7" rx="1" stroke="#64748b" strokeWidth="1.4"/>
                    <rect x="10" y="1" width="7" height="7" rx="1" stroke="#64748b" strokeWidth="1.4"/>
                    <rect x="1" y="10" width="7" height="7" rx="1" stroke="#64748b" strokeWidth="1.4"/>
                    <rect x="10" y="10" width="7" height="7" rx="1" stroke="#64748b" strokeWidth="1.4"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{t.prob1Title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.prob1Desc}</p>
              </div>

              {/* Card 2 */}
              <div className="reveal reveal-delay-2 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="9" cy="5" r="3" stroke="#64748b" strokeWidth="1.4"/>
                    <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{t.prob2Title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.prob2Desc}</p>
              </div>

              {/* Card 3 */}
              <div className="reveal reveal-delay-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <line x1="2" y1="5" x2="16" y2="5" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="6" cy="5" r="2" fill="white" stroke="#64748b" strokeWidth="1.4"/>
                    <line x1="2" y1="13" x2="16" y2="13" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="12" cy="13" r="2" fill="white" stroke="#64748b" strokeWidth="1.4"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{t.prob3Title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.prob3Desc}</p>
              </div>

              {/* Card 4 */}
              <div className="reveal reveal-delay-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M9 2L16 15H2L9 2Z" stroke="#64748b" strokeWidth="1.4" strokeLinejoin="round"/>
                    <line x1="9" y1="7" x2="9" y2="11" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="9" cy="13" r="0.7" fill="#64748b"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{t.prob4Title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.prob4Desc}</p>
              </div>

              {/* Card 5 */}
              <div className="reveal reveal-delay-1 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="2" y="10" width="3" height="6" rx="0.5" stroke="#64748b" strokeWidth="1.4"/>
                    <rect x="7.5" y="6" width="3" height="10" rx="0.5" stroke="#64748b" strokeWidth="1.4"/>
                    <rect x="13" y="2" width="3" height="14" rx="0.5" stroke="#64748b" strokeWidth="1.4"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{t.prob5Title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.prob5Desc}</p>
              </div>

              {/* Card 6 */}
              <div className="reveal reveal-delay-2 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="4" cy="9" r="2" stroke="#64748b" strokeWidth="1.4"/>
                    <circle cx="14" cy="4" r="2" stroke="#64748b" strokeWidth="1.4"/>
                    <circle cx="14" cy="14" r="2" stroke="#64748b" strokeWidth="1.4"/>
                    <line x1="6" y1="8.3" x2="12" y2="5" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="6" y1="9.7" x2="12" y2="13" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{t.prob6Title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.prob6Desc}</p>
              </div>

              {/* Card 7 — Untapped opportunities */}
              <div className="reveal reveal-delay-3 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="5" stroke="#64748b" strokeWidth="1.4"/>
                    <line x1="12" y1="12" x2="16" y2="16" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="8" y1="5.5" x2="8" y2="10.5" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{t.prob7Title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.prob7Desc}</p>
              </div>

            </div>
          </div>


        </div>
      </Section>

      {/* ── 3. NO EMPEZAMOS POR LA TECNOLOGÍA ──────────────────────────── */}
      <Section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24">

          {/* Title + intro */}
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start mb-20">
            <div>
              <h2
                className="text-4xl md:text-5xl leading-tight text-white"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t.noTechTitle1}<br />
                <span className="italic text-slate-300">{t.noTechTitle2}</span>
              </h2>
            </div>
            <div className="space-y-10">
              {([
                { label: t.noTechL1, body: t.noTechP1, delay: '' },
                { label: t.noTechL2, body: t.noTechP2, delay: 'reveal-delay-1' },
                { label: t.noTechL3, body: t.noTechP3, delay: 'reveal-delay-2' },
              ] as { label: string; body: string; delay: string }[]).map((item) => (
                <div key={item.label} className="flex gap-5">
                  <div className="mt-1 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <polyline points="4,12 9,17 20,6" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-snug">{item.label}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Four blocks */}
          <div className="grid gap-px bg-slate-700 border border-slate-700 rounded-2xl overflow-hidden md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                num: '01', title: t.noTechB1Title, desc: t.noTechB1Desc,
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="6" stroke="#818cf8" strokeWidth="1.5"/>
                    <line x1="14.5" y1="14.5" x2="19" y2="19" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )
              },
              {
                num: '02', title: t.noTechB2Title, desc: t.noTechB2Desc,
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="16" height="12" rx="2" stroke="#818cf8" strokeWidth="1.5"/>
                    <line x1="7" y1="19" x2="15" y2="19" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="11" y1="15" x2="11" y2="19" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="7" y1="8" x2="15" y2="8" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round"/>
                    <line x1="7" y1="11" x2="12" y2="11" stroke="#818cf8" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                )
              },
              {
                num: '03', title: t.noTechB3Title, desc: t.noTechB3Desc,
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <path d="M4 17L8 13L11 16L15 9L18 12" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="3" width="16" height="16" rx="2" stroke="#818cf8" strokeWidth="1.5"/>
                  </svg>
                )
              },
              {
                num: '04', title: t.noTechB4Title, desc: t.noTechB4Desc,
                icon: (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <path d="M11 4v3M11 15v3M4 11H7M15 11h3" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="11" cy="11" r="4" stroke="#818cf8" strokeWidth="1.5"/>
                    <circle cx="11" cy="11" r="1.5" fill="#818cf8"/>
                  </svg>
                )
              },
            ].map((block, i) => (
              <div
                key={block.num}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} bg-slate-800 p-8 flex flex-col gap-5`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-4xl font-light text-slate-700"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    {block.num}
                  </span>
                  {block.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{block.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{block.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Section>

      {/* ── 4. DIFFERENT APPROACHES — hub and spoke ─────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-24">

          {/* Centred header */}
          <div className="reveal text-center max-w-3xl mx-auto mb-16">
            <h2
              className="text-4xl md:text-5xl leading-tight text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.approachTitle}
            </h2>
            <p className="mt-6 text-base font-medium text-slate-700">{t.approachSub}</p>
            <p className="mt-2 text-sm leading-7 text-slate-500 max-w-xl mx-auto">{t.approachSub2}</p>
          </div>

          {/* ── Desktop hub-and-spoke diagram ── */}
          <div className="reveal hidden lg:block">
            <div
              className="relative mx-auto"
              style={{ maxWidth: '900px', aspectRatio: '900 / 800' }}
            >
              {/* SVG connecting lines — hub at (450,300), 4 equal rows of 200px */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 900 800"
                preserveAspectRatio="none"
                fill="none"
              >
                {/* hub centre (450,300) → top — Modelización (450,100) */}
                <line x1="450" y1="300" x2="450" y2="100" stroke="#cbd5e1" strokeWidth="1" />
                {/* hub → left — Visualización (150,300) */}
                <line x1="450" y1="300" x2="150" y2="300" stroke="#cbd5e1" strokeWidth="1" />
                {/* hub → right — Forecasting (750,300) */}
                <line x1="450" y1="300" x2="750" y2="300" stroke="#cbd5e1" strokeWidth="1" />
                {/* hub → bottom-left — Optimización (150,700) — row 4, no overlap */}
                <line x1="450" y1="300" x2="150" y2="700" stroke="#cbd5e1" strokeWidth="1" />
                {/* hub → bottom-right — Automatización (750,700) — row 4, no overlap */}
                <line x1="450" y1="300" x2="750" y2="700" stroke="#cbd5e1" strokeWidth="1" />
              </svg>

              {/* 3×4 grid — row 3 is spacer so diagonals clear the middle cards */}
              <div
                className="absolute inset-0 grid grid-cols-3"
                style={{ gridTemplateRows: '1fr 1fr 0.4fr 1fr' }}
              >
                {/* Row 1: empty · MODELIZACIÓN · empty */}
                <div />
                <div className="flex items-center justify-center p-4">
                  <DisciplineCard icon={<Network size={20} />} name={t.appr2Name} desc={t.appr2Desc} tags={t.appr2Tags} />
                </div>
                <div />

                {/* Row 2: VISUALIZACIÓN · HUB · FORECASTING */}
                <div className="flex items-center justify-center p-4">
                  <DisciplineCard icon={<BarChart3 size={20} />} name={t.appr1Name} desc={t.appr1Desc} tags={t.appr1Tags} />
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-center rounded-full border-2 border-indigo-300 bg-slate-900 shadow-lg" style={{ width: '148px', height: '148px' }}>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-white leading-tight whitespace-pre-line">{t.approachHubTitle}</p>
                    <div className="mt-2 h-px w-10 bg-indigo-400" />
                    <p className="mt-2 text-[10px] tracking-widest text-indigo-300 uppercase">{t.approachHubSub}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center p-4">
                  <DisciplineCard icon={<TrendingUp size={20} />} name={t.appr3Name} desc={t.appr3Desc} tags={t.appr3Tags} />
                </div>

                {/* Row 3: empty spacer — gives diagonals room to clear row 2 cards */}
                <div /><div /><div />

                {/* Row 4: OPTIMIZACIÓN · empty · AUTOMATIZACIÓN */}
                <div className="flex items-center justify-center p-4">
                  <DisciplineCard icon={<Target size={20} />} name={t.appr4Name} desc={t.appr4Desc} tags={t.appr4Tags} />
                </div>
                <div />
                <div className="flex items-center justify-center p-4">
                  <DisciplineCard icon={<Workflow size={20} />} name={t.appr5Name} desc={t.appr5Desc} tags={t.appr5Tags} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile fallback ── */}
          <div className="lg:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="sm:col-span-2 flex justify-center mb-2">
              <div className="flex flex-col items-center justify-center text-center rounded-full border-2 border-indigo-300 bg-slate-900" style={{ width: '120px', height: '120px' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white leading-tight whitespace-pre-line">{t.approachHubTitle}</p>
                <div className="mt-1.5 h-px w-8 bg-indigo-400" />
                <p className="mt-1.5 text-[9px] tracking-widest text-indigo-300 uppercase">{t.approachHubSub}</p>
              </div>
            </div>
            {([
              { icon: <BarChart3 size={18} />, name: t.appr1Name, desc: t.appr1Desc, tags: t.appr1Tags },
              { icon: <Network size={18} />, name: t.appr2Name, desc: t.appr2Desc, tags: t.appr2Tags },
              { icon: <TrendingUp size={18} />, name: t.appr3Name, desc: t.appr3Desc, tags: t.appr3Tags },
              { icon: <Target size={18} />, name: t.appr4Name, desc: t.appr4Desc, tags: t.appr4Tags },
              { icon: <Workflow size={18} />, name: t.appr5Name, desc: t.appr5Desc, tags: t.appr5Tags },
            ] as { icon: React.ReactNode; name: string; desc: string; tags: string }[]).map((card) => (
              <DisciplineCard key={card.name} icon={card.icon} name={card.name} desc={card.desc} tags={card.tags} />
            ))}
          </div>

          {/* Centred bottom statement */}
          <div className="reveal mt-20 pt-12 border-t border-slate-200 text-center">
            <p className="mx-auto max-w-2xl text-lg leading-9 text-slate-700 italic" style={{ fontFamily: 'var(--font-playfair)' }}>
              &ldquo;{t.approachNote}&rdquo;
            </p>
          </div>

        </div>
      </Section>

      {/* ── 5. PHILOSOPHY ────────────────────────────────────────────── */}
      <Section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24">

          {/* Centered header */}
          <div className="reveal text-center max-w-3xl mx-auto mb-12">
            <h2
              className="text-4xl md:text-5xl leading-tight text-white"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.philTitle}
            </h2>
          </div>

          {/* Four cards */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {([
              { num: '01', title: t.phil1Title, desc: t.phil1Desc },
              { num: '02', title: t.phil2Title, desc: t.phil2Desc },
              { num: '03', title: t.phil3Title, desc: t.phil3Desc },
              { num: '04', title: t.phil4Title, desc: t.phil4Desc },
            ] as { num: string; title: string; desc: string }[]).map((card, i) => (
              <div
                key={card.num}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} rounded-2xl border border-slate-700 bg-slate-800 p-8 card-lift flex flex-col`}
              >
                <span
                  className="text-3xl font-light text-slate-600 mb-4"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {card.num}
                </span>
                <div className="mb-4 h-px w-8 bg-indigo-400" />
                <h3 className="text-base font-semibold text-white leading-snug">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{card.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </Section>

      {/* ── 6. USE CASES ─────────────────────────────────────────────── */}
      <Section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-24">

          {/* Centered header */}
          <div className="reveal text-center max-w-3xl mx-auto mb-16">
            <h2
              className="text-4xl md:text-5xl leading-tight text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.useCasesTitle}
            </h2>
            <div className="mt-6">
              <p className="text-base font-medium text-slate-700">{t.useCasesSub1}</p>
              <p className="mt-2 text-sm text-slate-500">{t.useCasesSub2}</p>
            </div>
          </div>

          {/* Desktop: 2×3 horizontal flow with arrows */}
          <div className="reveal hidden lg:block space-y-10">
            {/* Row 1: 01 → 02 → 03 */}
            <div className="flex items-start">
              {([
                { num: '01', title: t.useCase1Title, desc: t.useCase1Desc },
                { num: '02', title: t.useCase2Title, desc: t.useCase2Desc },
                { num: '03', title: t.useCase3Title, desc: t.useCase3Desc },
              ] as { num: string; title: string; desc: string }[]).map((item, i) => (
                <div key={item.num} className="flex flex-1 items-start min-w-0">
                  <div className="flex-1 text-center px-6 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 mb-3">{item.num}</p>
                    <div className="mb-3 h-px w-8 bg-indigo-300 mx-auto" />
                    <p className="text-base font-semibold text-slate-900 leading-snug">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="flex-shrink-0 flex items-start pt-7 text-slate-300">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M1 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Row 2: 04 → 05 → 06 */}
            <div className="flex items-start pt-6 border-t border-slate-100">
              {([
                { num: '04', title: t.useCase4Title, desc: t.useCase4Desc },
                { num: '05', title: t.useCase5Title, desc: t.useCase5Desc },
                { num: '06', title: t.useCase6Title, desc: t.useCase6Desc },
              ] as { num: string; title: string; desc: string }[]).map((item, i) => (
                <div key={item.num} className="flex flex-1 items-start min-w-0">
                  <div className="flex-1 text-center px-6 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600 mb-3">{item.num}</p>
                    <div className="mb-3 h-px w-8 bg-indigo-300 mx-auto" />
                    <p className="text-base font-semibold text-slate-900 leading-snug">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="flex-shrink-0 flex items-start pt-7 text-slate-300">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M1 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: vertical list */}
          <div className="lg:hidden divide-y divide-slate-200">
            {([
              { num: '01', title: t.useCase1Title, desc: t.useCase1Desc },
              { num: '02', title: t.useCase2Title, desc: t.useCase2Desc },
              { num: '03', title: t.useCase3Title, desc: t.useCase3Desc },
              { num: '04', title: t.useCase4Title, desc: t.useCase4Desc },
              { num: '05', title: t.useCase5Title, desc: t.useCase5Desc },
              { num: '06', title: t.useCase6Title, desc: t.useCase6Desc },
            ] as { num: string; title: string; desc: string }[]).map((item) => (
              <div key={item.num} className="flex gap-5 items-start py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 mt-0.5 flex-shrink-0 w-6">{item.num}</p>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Centered CTA */}
          <div className="mt-14 flex justify-center reveal">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-7 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
            >
              {t.useCasesCta}
            </Link>
          </div>

        </div>
      </Section>

      {/* ── 7. WHAT YOUR DATA ALREADY KNOWS ──────────────────────────── */}
      <Section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24">

          {/* Centered header */}
          <div className="reveal text-center max-w-3xl mx-auto mb-16">
            <h2
              className="text-4xl md:text-5xl leading-tight text-white"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.dataTitle}
            </h2>
            <div className="mt-6 max-w-xl mx-auto">
              <p className="text-base font-medium text-slate-300 leading-7">{t.dataSub1}</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">{t.dataSub2}</p>
            </div>
          </div>

          {/* Desktop: conceptual cross map */}
          <div className="reveal hidden lg:block relative max-w-3xl mx-auto" style={{ height: '520px' }}>
            {/* SVG lines — contained within center cell only, never cross concept boxes */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 768 520"
              preserveAspectRatio="none"
              fill="none"
            >
              <line x1="384" y1="260" x2="256" y2="260" stroke="#334155" strokeWidth="1" />
              <line x1="384" y1="260" x2="512" y2="260" stroke="#334155" strokeWidth="1" />
              <line x1="384" y1="260" x2="384" y2="173" stroke="#334155" strokeWidth="1" />
              <line x1="384" y1="260" x2="384" y2="347" stroke="#334155" strokeWidth="1" />
              <circle cx="384" cy="260" r="5" fill="#6366f1" />
              <circle cx="384" cy="260" r="9" fill="none" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.25" />
            </svg>

            {/* 3×3 grid overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {/* Row 1: empty · top box · empty */}
              <div />
              <div className="flex items-center justify-center p-3">
                <div className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-400 mb-2">02</p>
                  <p className="text-sm font-semibold text-white leading-snug">{t.data2Title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{t.data2Desc}</p>
                </div>
              </div>
              <div />

              {/* Row 2: left box · center (dot only) · right box */}
              <div className="flex items-center justify-center p-3">
                <div className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-4 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-400 mb-2">01</p>
                  <p className="text-sm font-semibold text-white leading-snug">{t.data1Title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{t.data1Desc}</p>
                </div>
              </div>
              <div />
              <div className="flex items-center justify-center p-3">
                <div className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-400 mb-2">04</p>
                  <p className="text-sm font-semibold text-white leading-snug">{t.data4Title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{t.data4Desc}</p>
                </div>
              </div>

              {/* Row 3: empty · bottom box · empty */}
              <div />
              <div className="flex items-center justify-center p-3">
                <div className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-400 mb-2">03</p>
                  <p className="text-sm font-semibold text-white leading-snug">{t.data3Title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{t.data3Desc}</p>
                </div>
              </div>
              <div />
            </div>
          </div>

          {/* Mobile: 2×2 grid */}
          <div className="reveal lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-5">
            {([
              { num: '01', title: t.data1Title, desc: t.data1Desc },
              { num: '02', title: t.data2Title, desc: t.data2Desc },
              { num: '03', title: t.data3Title, desc: t.data3Desc },
              { num: '04', title: t.data4Title, desc: t.data4Desc },
            ] as { num: string; title: string; desc: string }[]).map((card) => (
              <div key={card.num} className="rounded-2xl border border-slate-700 bg-slate-800 p-7 flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-400 mb-3">{card.num}</p>
                <div className="mb-3 h-px w-6 bg-indigo-500" />
                <p className="text-sm font-semibold text-white leading-snug">{card.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{card.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </Section>

      {/* ── 8. FINAL CTA ────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <div className="max-w-3xl">
            <h2
              className="text-4xl md:text-5xl leading-tight text-slate-900"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t.ctaTitle}
              <br />
              <span className="italic text-slate-600">{t.ctaTitle2}</span>
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600">
              {t.ctaSub}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
              {t.ctaSub2}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/contact"
                className="inline-block rounded-md bg-slate-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {t.ctaBtn}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
              >
                {t.ctaSecondary}
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
