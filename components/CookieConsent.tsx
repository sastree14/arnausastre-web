'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'
import {
  COOKIE_CONSENT_KEY,
  readAnalyticsChoice,
  removeGoogleAnalyticsCookies,
  saveAnalyticsChoice,
  type AnalyticsChoice,
} from '@/lib/cookie-consent'

const COPY = {
  es: {
    title: 'Tu privacidad en SC-Analytics',
    description: 'Usamos almacenamiento necesario para el funcionamiento y las preferencias de la web. Solo con tu permiso utilizamos Google Analytics para medir visitas e interacciones.',
    accept: 'Aceptar analítica',
    reject: 'Rechazar analítica',
    configure: 'Configurar',
    policy: 'Política de cookies',
    preferences: 'Preferencias de cookies',
    essential: 'Técnicas y preferencias necesarias',
    essentialDetail: 'Necesarias para recordar el idioma y la elección sobre cookies. Siempre activas.',
    analytics: 'Estadísticas de Google Analytics',
    analyticsDetail: 'Medición de visitas, artículos y clics para mejorar la web. Desactivadas por defecto.',
    save: 'Guardar preferencias',
    back: 'Volver',
    error: 'No se pudo guardar tu elección. La analítica seguirá desactivada.',
    readDetails: 'Ver información sobre cookies',
    hideDetails: 'Ocultar información',
    fullPolicy: 'Consultar la política completa',
    shortIntro: 'Información sobre las tecnologías utilizadas, sus finalidades y duración:',
    technicalTitle: 'Necesarias · sc_site_lang, lang',
    technicalText: 'Almacenamiento local de SC-Analytics para recordar el idioma. Persisten hasta que cambies o borres la preferencia.',
    choiceTitle: 'Consentimiento · sc_cookie_consent_v1',
    choiceText: 'Almacenamiento local de SC-Analytics que conserva tu elección hasta 180 días.',
    metricsTitle: 'Analíticas · _ga, _ga_3E1DK7935G',
    metricsText: 'Cookies de Google Analytics para medir sesiones y visitas, solo si aceptas. Pueden durar hasta 24 meses.',
    transfers: 'Google puede tratar datos fuera del Espacio Económico Europeo, con las garantías correspondientes. Puedes retirar el consentimiento en cualquier momento.',
    close: 'Cerrar preferencias de cookies',
  },
  ca: {
    title: 'La teva privacitat a SC-Analytics',
    description: 'Fem servir emmagatzematge necessari per al funcionament i les preferències del web. Només amb el teu permís fem servir Google Analytics per mesurar visites i interaccions.',
    accept: 'Acceptar analítica',
    reject: 'Rebutjar analítica',
    configure: 'Configurar',
    policy: 'Política de galetes',
    preferences: 'Preferències de galetes',
    essential: 'Tècniques i preferències necessàries',
    essentialDetail: "Necessàries per recordar l'idioma i la tria sobre les galetes. Sempre actives.",
    analytics: 'Estadístiques de Google Analytics',
    analyticsDetail: 'Mesura de visites, articles i clics per millorar el web. Desactivades per defecte.',
    save: 'Desar preferències',
    back: 'Tornar',
    error: "No s'ha pogut desar la tria. L'analítica continuarà desactivada.",
    readDetails: 'Veure informació sobre les galetes',
    hideDetails: 'Amagar informació',
    fullPolicy: 'Consultar la política completa',
    shortIntro: 'Informació sobre les tecnologies utilitzades, finalitats i durada:',
    technicalTitle: 'Necessàries · sc_site_lang, lang',
    technicalText: "Emmagatzematge local de SC-Analytics per recordar l'idioma. Persisteix fins que canviïs o esborris la preferència.",
    choiceTitle: 'Consentiment · sc_cookie_consent_v1',
    choiceText: 'Emmagatzematge local de SC-Analytics que conserva la tria fins a 180 dies.',
    metricsTitle: 'Analítiques · _ga, _ga_3E1DK7935G',
    metricsText: 'Galetes de Google Analytics per mesurar sessions i visites, només si acceptes. Poden durar fins a 24 mesos.',
    transfers: 'Google pot tractar dades fora de l’Espai Econòmic Europeu, amb les garanties corresponents. Pots retirar el consentiment quan vulguis.',
    close: 'Tancar preferències de galetes',
  },
  en: {
    title: 'Your privacy at SC-Analytics',
    description: 'We use essential storage for site operation and preferences. Only with your permission do we use Google Analytics to measure visits and interactions.',
    accept: 'Accept analytics',
    reject: 'Reject analytics',
    configure: 'Settings',
    policy: 'Cookie policy',
    preferences: 'Cookie preferences',
    essential: 'Essential storage and preferences',
    essentialDetail: 'Needed to remember your language and cookie preference. Always active.',
    analytics: 'Google Analytics statistics',
    analyticsDetail: 'Measures visits, article readership and clicks to improve the site. Off by default.',
    save: 'Save preferences',
    back: 'Back',
    error: 'Your preference could not be stored. Analytics will remain disabled.',
    readDetails: 'View cookie information',
    hideDetails: 'Hide information',
    fullPolicy: 'Read the full cookie policy',
    shortIntro: 'Information about the technologies used, their purposes and duration:',
    technicalTitle: 'Essential · sc_site_lang, lang',
    technicalText: 'SC-Analytics local storage to remember your language. Stored until you change or remove the preference.',
    choiceTitle: 'Consent · sc_cookie_consent_v1',
    choiceText: 'SC-Analytics local storage that retains your choice for up to 180 days.',
    metricsTitle: 'Analytics · _ga, _ga_3E1DK7935G',
    metricsText: 'Google Analytics cookies for visits and sessions, only when accepted. They can last up to 24 months.',
    transfers: 'Google may process data outside the European Economic Area with applicable safeguards. You can withdraw consent at any time.',
    close: 'Close cookie preferences',
  },
} as const

export default function CookieConsent() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const [policyExpanded, setPolicyExpanded] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const existing = readAnalyticsChoice()
    if (existing !== 'accepted') removeGoogleAnalyticsCookies()
    // Defer React state initialization from the external consent store to
    // the next task. This avoids synchronous effect-triggered state cascades.
    const initialSync = window.setTimeout(() => {
      setOpen(existing === null)
      setAnalyticsEnabled(existing === 'accepted')
      setReady(true)
    }, 0)

    const openSettings = () => {
      setAnalyticsEnabled(readAnalyticsChoice() === 'accepted')
      setCustom(true)
      setPolicyExpanded(false)
      setError(false)
      setOpen(true)
    }
    const syncTabs = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY) window.location.reload()
    }
    window.addEventListener('sc-open-cookie-settings', openSettings)
    window.addEventListener('storage', syncTabs)
    return () => {
      window.clearTimeout(initialSync)
      window.removeEventListener('sc-open-cookie-settings', openSettings)
      window.removeEventListener('storage', syncTabs)
    }
  }, [])

  const choose = (choice: AnalyticsChoice) => {
    const previous = readAnalyticsChoice()
    if (!saveAnalyticsChoice(choice)) {
      setError(true)
      return
    }
    if (choice === 'rejected') removeGoogleAnalyticsCookies()
    setAnalyticsEnabled(choice === 'accepted')
    setCustom(false)
    setPolicyExpanded(false)
    setError(false)
    setOpen(false)

    // Revocation must also terminate any Google tag already executing.
    if (previous === 'accepted' && choice === 'rejected') window.location.reload()
  }

  if (!ready || !open) return null

  return (
    <section
      role="dialog"
      aria-label={custom ? t.preferences : t.title}
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-h-[min(76dvh,590px)] max-w-[660px] overflow-y-auto overscroll-contain border border-[#B8C9D8] bg-white p-4 text-[#0D1B2A] shadow-[0_12px_40px_rgba(13,27,42,0.19)] sm:bottom-5 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[16px] font-semibold leading-6">{custom ? t.preferences : t.title}</h2>
        {readAnalyticsChoice() !== null && (
          <button
            type="button"
            aria-label={t.close}
            onClick={() => { setOpen(false); setCustom(false); setPolicyExpanded(false) }}
            className="shrink-0 rounded p-1 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#254A66]"
          >✕</button>
        )}
      </div>
      {custom ? (
        <div className="mt-3 space-y-2.5">
          <div className="border border-slate-300 bg-slate-50 p-2.5 text-[13px] leading-5">
            <p className="font-semibold">{t.essential}</p>
            <p className="mt-1 text-[12px] leading-5 text-slate-700">{t.essentialDetail}</p>
          </div>
          <label className="flex cursor-pointer items-start gap-3 border border-slate-300 p-2.5 text-[13px] leading-5">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#254A66]"
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
            <span>
              <strong className="block">{t.analytics}</strong>
              <span className="mt-1 block text-[14px] text-slate-700">{t.analyticsDetail}</span>
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => choose(analyticsEnabled ? 'accepted' : 'rejected')} className="min-h-11 flex-1 bg-[#0D1B2A] px-4 py-2 text-[13px] font-semibold text-white">
              {t.save}
            </button>
            <button type="button" onClick={() => setCustom(false)} className="min-h-11 flex-1 border border-[#0D1B2A] px-4 py-2 text-[13px] font-semibold">
              {t.back}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[13px] leading-5 text-slate-700">{t.description}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => choose('rejected')} className="min-h-11 flex-1 border border-[#0D1B2A] bg-[#0D1B2A] px-3 py-2 text-[13px] font-semibold text-white">
              {t.reject}
            </button>
            <button type="button" onClick={() => choose('accepted')} className="min-h-11 flex-1 border border-[#0D1B2A] bg-[#0D1B2A] px-3 py-2 text-[14px] font-semibold text-white">
              {t.accept}
            </button>
            <button type="button" onClick={() => setCustom(true)} className="min-h-11 flex-1 border border-[#496C8A] px-3 py-2 text-[13px] font-semibold text-[#0D1B2A]">
              {t.configure}
            </button>
          </div>
        </>
      )}
      <div className="mt-3 border-t border-slate-200 pt-2">
        <button
          type="button"
          aria-expanded={policyExpanded}
          aria-controls="sc-cookie-details"
          onClick={() => setPolicyExpanded((value) => !value)}
          className="inline-flex min-h-8 items-center gap-2 text-left text-[12px] font-semibold text-[#254A66] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#254A66]"
        >
          {policyExpanded ? t.hideDetails : t.readDetails}
          <span aria-hidden="true">{policyExpanded ? '▴' : '▾'}</span>
        </button>
        {policyExpanded && (
          <div id="sc-cookie-details" className="mt-2 border border-slate-200 bg-[#F7F9FC] p-3 text-[12px] leading-5 text-slate-700">
            <p className="mb-2">{t.shortIntro}</p>
            <dl className="space-y-2">
              <div><dt className="font-semibold text-[#0D1B2A]">{t.technicalTitle}</dt><dd>{t.technicalText}</dd></div>
              <div><dt className="font-semibold text-[#0D1B2A]">{t.choiceTitle}</dt><dd>{t.choiceText}</dd></div>
              <div><dt className="font-semibold text-[#0D1B2A]">{t.metricsTitle}</dt><dd>{t.metricsText}</dd></div>
            </dl>
            <p className="mt-2">{t.transfers}</p>
            <Link href="/cookies" className="mt-2 inline-block font-semibold text-[#254A66] underline underline-offset-2">
              {t.fullPolicy} ↗
            </Link>
          </div>
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-[14px] text-red-700">{t.error}</p>}
    </section>
  )
}
