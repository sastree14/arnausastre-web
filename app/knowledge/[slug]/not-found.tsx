import Link from 'next/link'

export default function KnowledgeArticleNotFound() {
  return (
    <main className="bg-[#FAFAF7] text-slate-950">
      <section className="border-b border-[#496C8A] bg-[#0D1B2A] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7A7DFF]">SC-ANALYTICS KNOWLEDGE</p>
          <h1 className="mt-5 max-w-4xl text-[44px] leading-[1.04] tracking-[-0.03em] sm:text-[56px]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Este análisis todavía no está disponible.
          </h1>
          <p className="mt-6 max-w-3xl text-[17px] leading-8 text-[#EAF0F6]">
            Puede que el contenido se esté preparando, haya cambiado de ruta o todavía no esté publicado. La navegación principal sigue disponible.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-300 bg-white">
        <div className="mx-auto grid max-w-6xl gap-7 px-6 py-10 lg:grid-cols-[190px_1fr] lg:gap-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">SIGUE EXPLORANDO</p>
          <div className="grid border-t border-slate-300 md:grid-cols-3 md:divide-x md:divide-slate-300">
            {[
              ['Volver a conocimiento', '/knowledge'],
              ['Explorar casos', '/projects'],
              ['Cómo trabajamos', '/services'],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="group flex items-center justify-between border-b border-slate-300 py-4 text-[13px] font-semibold text-slate-900 md:px-5 md:first:pl-0">
                {label}<span className="text-indigo-700 transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
