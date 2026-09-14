'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const GA_MEASUREMENT_ID = 'G-3E1DK7935G'

export default function GoogleAnalytics() {
  const pathname = usePathname()
  if (pathname.startsWith('/growth-admin')) return null

  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: true });
      `}
    </Script>
  </>
}
