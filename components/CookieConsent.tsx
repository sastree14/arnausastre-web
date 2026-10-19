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
  },
} as const

export default function CookieConsent() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const existing = readAnalyticsChoice()
    if (existing !== 'accepted') removeGoogleAnalyticsCookies()
    setOpen(existing === null)
    setAnalyticsEnabled(existing === 'accepted')
    setReady(true)

    const openSettings = () => {
      setAnalyticsEnabled(readAnalyticsChoice() === 'accepted')
      setCustom(true)
      setError(false)
      setOpen(true)
    }
    const syncTabs = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY) window.location.reload()
    }
    window.addEventListener('sc-open-cookie-settings', openSettings)
    window.addEventListener('storage', syncTabs)
    return () => {
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
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl border border-[#496C8A] bg-white p-5 text-[#0D1B2A] shadow-2xl sm:bottom-5 sm:p-6"
    >
      <h2 className="text-[20px] font-semibold">{custom ? t.preferences : t.title}</h2>
      {custom ? (
        <div className="mt-4 space-y-4">
          <div className="border border-slate-300 bg-slate-50 p-3">
            <p className="font-semibold">{t.essential}</p>
            <p className="mt-1 text-[14px] text-slate-700">{t.essentialDetail}</p>
          </div>
          <label className="flex cursor-pointer items-start gap-3 border border-slate-300 p-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#254A66]"
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
            <span>
              <strong className="block">{t.analytics}</strong>
              <span className="mt-1 block text-[14px] text-slate-700">{t.analyticsDetail}</span>
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => choose(analyticsEnabled ? 'accepted' : 'rejected')} className="min-h-11 flex-1 bg-[#0D1B2A] px-4 py-2 font-semibold text-white">
              {t.save}
            </button>
            <button type="button" onClick={() => setCustom(false)} className="min-h-11 flex-1 border border-[#0D1B2A] px-4 py-2 font-semibold">
              {t.back}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 text-[15px] leading-6 text-slate-700">{t.description}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => choose('rejected')} className="min-h-11 flex-1 border border-[#0D1B2A] bg-[#0D1B2A] px-3 py-2 text-[14px] font-semibold text-white">
              {t.reject}
            </button>
            <button type="button" onClick={() => choose('accepted')} className="min-h-11 flex-1 border border-[#0D1B2A] bg-[#0D1B2A] px-3 py-2 text-[14px] font-semibold text-white">
              {t.accept}
            </button>
            <button type="button" onClick={() => setCustom(true)} className="min-h-11 flex-1 border border-[#496C8A] px-3 py-2 text-[14px] font-semibold text-[#0D1B2A]">
              {t.configure}
            </button>
          </div>
        </>
      )}
      <Link href="/cookies" className="mt-3 inline-block text-[14px] font-medium text-[#254A66] underline underline-offset-2">
        {t.policy}
      </Link>
      {error && <p role="alert" className="mt-2 text-[14px] text-red-700">{t.error}</p>}
    </section>
  )
}
