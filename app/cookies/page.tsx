'use client'

import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const COPY = {
  es: {
    title: 'Política de cookies',
    updated: 'Revisión técnica: 19 de octubre de 2026',
    intro: 'SC-Analytics utiliza almacenamiento local para recordar preferencias de navegación y, únicamente si el visitante lo autoriza, cookies de Google Analytics para medir el uso de la web.',
    inventory: 'Inventario de tecnologías',
    tableName: 'Nombre', tableProvider: 'Responsable', tablePurpose: 'Finalidad', tableRetention: 'Duración estimada',
    technical: 'Idioma de navegación', decision: 'Preferencia de consentimiento', stats: 'Medición de sesiones y visitantes',
    session: 'Persistente hasta cambio o eliminación', halfYear: 'Hasta 180 días', twoYears: 'Hasta 24 meses',
    necessary: 'Almacenamiento necesario y de preferencias',
    necessaryText: 'Se utilizan sc_site_lang y lang para recordar el idioma de navegación; sc_cookie_consent_v1 guarda la elección sobre analítica durante un máximo de 180 días a efectos de validez del consentimiento. Estas preferencias no se utilizan para publicidad.',
    analytical: 'Cookies analíticas sujetas a consentimiento',
    analyticalText: 'Si aceptas, se carga Google Analytics 4 (identificador G-3E1DK7935G). Puede utilizar _ga y _ga_3E1DK7935G, entre otras cookies propias de Google Analytics, para distinguir visitas y sesiones. Su duración habitual puede alcanzar hasta 24 meses según la configuración del proveedor.',
    purpose: 'Medimos páginas vistas, consultas de artículos, profundidad de lectura y clics hacia contacto, LinkedIn o reservas. No activamos estas etiquetas antes de obtener autorización.',
    change: 'Retirar o modificar tu consentimiento',
    changeText: 'Puedes reabrir las preferencias desde el enlace «Configurar cookies» del pie de página en cualquier momento. Si retiras el consentimiento, se detiene la analítica y se intentan eliminar las cookies analíticas accesibles.',
    provider: 'Proveedor y más información',
    providerText: 'Google Analytics es un servicio de Google. El tratamiento puede implicar transferencias internacionales sujetas a sus garantías contractuales. Consulta la información del proveedor:',
  },
  ca: {
    title: 'Política de galetes',
    updated: 'Revisió tècnica: 19 d’octubre de 2026',
    intro: 'SC-Analytics fa servir emmagatzematge local per recordar preferències de navegació i, només si el visitant ho autoritza, galetes de Google Analytics per mesurar l’ús del web.',
    inventory: 'Inventari de tecnologies',
    tableName: 'Nom', tableProvider: 'Responsable', tablePurpose: 'Finalitat', tableRetention: 'Durada estimada',
    technical: 'Idioma de navegació', decision: 'Preferència de consentiment', stats: 'Mesura de sessions i visitants',
    session: 'Persistent fins a canvi o eliminació', halfYear: 'Fins a 180 dies', twoYears: 'Fins a 24 mesos',
    necessary: 'Emmagatzematge necessari i de preferències',
    necessaryText: 'Es fan servir sc_site_lang i lang per recordar l’idioma de navegació; sc_cookie_consent_v1 desa la tria sobre analítica durant un màxim de 180 dies a efectes de validesa del consentiment. No fem servir aquestes preferències per a publicitat.',
    analytical: 'Galetes analítiques subjectes a consentiment',
    analyticalText: 'Si acceptes, es carrega Google Analytics 4 (identificador G-3E1DK7935G). Pot utilitzar _ga i _ga_3E1DK7935G, entre altres galetes pròpies de Google Analytics, per distingir visites i sessions. La durada habitual pot arribar fins a 24 mesos segons la configuració del proveïdor.',
    purpose: 'Mesurem visualitzacions, lectures d’articles, profunditat de lectura i clics a contacte, LinkedIn o reserves. No activem aquestes etiquetes abans de rebre autorització.',
    change: 'Retirar o modificar el consentiment',
    changeText: 'Pots tornar a obrir les preferències des de l’enllaç «Configurar galetes» del peu de pàgina en qualsevol moment. Si retires el consentiment, s’atura l’analítica i s’intenten eliminar les galetes analítiques accessibles.',
    provider: 'Proveïdor i més informació',
    providerText: 'Google Analytics és un servei de Google. El tractament pot comportar transferències internacionals subjectes a les seves garanties contractuals. Consulta la informació del proveïdor:',
  },
  en: {
    title: 'Cookie policy',
    updated: 'Technical review: 19 October 2026',
    intro: 'SC-Analytics uses local storage to remember browsing preferences and, only when a visitor authorises it, Google Analytics cookies to measure website use.',
    inventory: 'Technology inventory',
    tableName: 'Name', tableProvider: 'Provider', tablePurpose: 'Purpose', tableRetention: 'Expected lifetime',
    technical: 'Website language preference', decision: 'Consent preference', stats: 'Session and visitor measurement',
    session: 'Persistent until changed or deleted', halfYear: 'Up to 180 days', twoYears: 'Up to 24 months',
    necessary: 'Essential and preference storage',
    necessaryText: 'sc_site_lang and lang remember the site language; sc_cookie_consent_v1 stores the analytics choice for up to 180 days for consent validity. These preferences are not used for advertising.',
    analytical: 'Analytics cookies requiring consent',
    analyticalText: 'If you opt in, Google Analytics 4 (measurement ID G-3E1DK7935G) loads. It may use _ga and _ga_3E1DK7935G, among other Google Analytics cookies, to distinguish visitors and sessions. Their usual lifetime can be up to 24 months depending on provider settings.',
    purpose: 'We measure page views, article readership, reading depth and clicks to contact, LinkedIn or bookings. These tags are not enabled before consent.',
    change: 'Withdraw or change consent',
    changeText: 'You can reopen preferences using the “Cookie settings” link in the footer at any time. If you withdraw consent, analytics stops and accessible analytics cookies are removed where possible.',
    provider: 'Provider and further information',
    providerText: 'Google Analytics is provided by Google. Processing may involve international transfers covered by Google’s contractual safeguards. See the provider’s information:',
  },
} as const

export default function CookiesPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]

  return (
    <main className="bg-[#F7F9FC] text-[#0D1B2A]">
      <article className="site-container max-w-4xl py-14 md:py-20">
        <h1 className="text-[40px] md:text-[52px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
        <p className="mt-2 text-[14px] text-slate-600">{t.updated}</p>
        <p className="mt-7 text-[17px] leading-8">{t.intro}</p>
        <h2 className="mt-9 text-[25px] font-semibold">{t.inventory}</h2>
        <div className="mt-4 overflow-x-auto border border-slate-300 bg-white">
          <table className="w-full min-w-[630px] text-left text-[14px] leading-6">
            <thead className="bg-[#0D1B2A] text-white">
              <tr>
                <th scope="col" className="px-4 py-3">{t.tableName}</th>
                <th scope="col" className="px-4 py-3">{t.tableProvider}</th>
                <th scope="col" className="px-4 py-3">{t.tablePurpose}</th>
                <th scope="col" className="px-4 py-3">{t.tableRetention}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr><td className="px-4 py-3 font-mono">sc_site_lang / lang</td><td className="px-4 py-3">SC-Analytics</td><td className="px-4 py-3">{t.technical}</td><td className="px-4 py-3">{t.session}</td></tr>
              <tr><td className="px-4 py-3 font-mono">sc_cookie_consent_v1</td><td className="px-4 py-3">SC-Analytics</td><td className="px-4 py-3">{t.decision}</td><td className="px-4 py-3">{t.halfYear}</td></tr>
              <tr><td className="px-4 py-3 font-mono">_ga / _ga_3E1DK7935G</td><td className="px-4 py-3">Google</td><td className="px-4 py-3">{t.stats}</td><td className="px-4 py-3">{t.twoYears}</td></tr>
            </tbody>
          </table>
        </div>
        <h2 className="mt-9 text-[25px] font-semibold">{t.necessary}</h2>
        <p className="mt-3 text-[16px] leading-7">{t.necessaryText}</p>
        <h2 className="mt-9 text-[25px] font-semibold">{t.analytical}</h2>
        <p className="mt-3 text-[16px] leading-7">{t.analyticalText}</p>
        <p className="mt-3 text-[16px] leading-7">{t.purpose}</p>
        <h2 className="mt-9 text-[25px] font-semibold">{t.change}</h2>
        <p className="mt-3 text-[16px] leading-7">{t.changeText}</p>
        <h2 className="mt-9 text-[25px] font-semibold">{t.provider}</h2>
        <p className="mt-3 text-[16px] leading-7">{t.providerText}</p>
        <a className="mt-3 inline-block font-semibold underline underline-offset-4" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google Privacy Policy ↗
        </a>
      </article>
    </main>
  )
}
