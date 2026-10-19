'use client'

export type AnalyticsChoice = 'accepted' | 'rejected'

export const COOKIE_CONSENT_KEY = 'sc_cookie_consent_v1'
export const COOKIE_CONSENT_EVENT = 'sc-cookie-consent-change'
// Re-ask for consent after six months, or sooner if purposes/providers change.
const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000

export function readAnalyticsChoice(): AnalyticsChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') return null
    const record = parsed as { choice?: unknown; timestamp?: unknown }
    if ((record.choice !== 'accepted' && record.choice !== 'rejected')
      || typeof record.timestamp !== 'number'
      || record.timestamp > Date.now()
      || Date.now() - record.timestamp > CONSENT_MAX_AGE_MS) return null
    return record.choice
  } catch {
    return null
  }
}

export function saveAnalyticsChoice(choice: AnalyticsChoice): boolean {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      choice,
      timestamp: Date.now(),
    }))
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
    return true
  } catch {
    // Fail closed: if the browser cannot save the preference, GA must stay off.
    return false
  }
}

export function removeGoogleAnalyticsCookies() {
  // Best-effort cleanup of accessible GA cookies. Google tags are also disabled
  // and the page reloads on revocation to stop already-initialized scripts.
  const names = document.cookie.split(';')
    .map((entry) => entry.trim().split('=')[0])
    .filter((name) => /^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name))

  const domains = ['', 'sc-analytics.io', '.sc-analytics.io']
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' +
        (domain ? '; domain=' + domain : '')
    }
  }
}
