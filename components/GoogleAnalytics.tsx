'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { COOKIE_CONSENT_EVENT, readAnalyticsChoice } from '@/lib/cookie-consent'
import { usePathname } from 'next/navigation'

const GA_MEASUREMENT_ID = 'G-3E1DK7935G'

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const refresh = () => setAllowed(readAnalyticsChoice() === 'accepted')
    refresh()
    window.addEventListener(COOKIE_CONSENT_EVENT, refresh)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, refresh)
  }, [])

  if (pathname.startsWith('/growth-admin') || !allowed) return null

  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
      `}
    </Script>
  </>
}
