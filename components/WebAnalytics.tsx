'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function track(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.('event', name, params)
}

export default function WebAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sentDepth = useRef(new Set<number>())

  useEffect(() => {
    if (!pathname || pathname.startsWith('/growth-admin')) return
    sentDepth.current = new Set()
    if (pathname.startsWith('/knowledge/')) {
      track('article_view', {
        page_path: pathname,
        content_slug: pathname.split('/').filter(Boolean).pop() || '',
      })
    }

    const onScroll = () => {
      if (!pathname.startsWith('/knowledge/')) return
      const documentHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const depth = Math.min(100, Math.round((window.scrollY / documentHeight) * 100))
      for (const threshold of [50, 90]) {
        if (depth >= threshold && !sentDepth.current.has(threshold)) {
          sentDepth.current.add(threshold)
          track(`article_${threshold}_percent`, { page_path: pathname })
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname, searchParams])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (pathname?.startsWith('/growth-admin')) return
      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a') as HTMLAnchorElement | null
      if (!anchor) return
      const href = anchor.href || ''
      const explicit = anchor.dataset.analyticsEvent
      if (explicit) {
        track(explicit, { link_url: href, link_text: anchor.textContent?.trim() || '' })
        return
      }
      if (/calendly\.com/i.test(href)) {
        track('calendly_open', { link_url: href, link_text: anchor.textContent?.trim() || '' })
      } else if (/linkedin\.com/i.test(href)) {
        track('linkedin_outbound', { link_url: href, link_text: anchor.textContent?.trim() || '' })
      } else {
        try {
          const url = new URL(href)
          if (url.origin === window.location.origin && url.pathname.startsWith('/contact')) {
            const intent = url.searchParams.get('intent') || ''
            track(intent === 'discovery' ? 'discovery_call_click' : 'contact_click', {
              link_url: href,
              link_text: anchor.textContent?.trim() || '',
              intent,
            })
          }
        } catch {
          // Ignore malformed/non-URL hrefs.
        }
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pathname])

  return null
}
