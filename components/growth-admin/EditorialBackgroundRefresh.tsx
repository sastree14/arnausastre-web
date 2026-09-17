'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const EDITORIAL_PATHS = ['/growth-admin/content', '/growth-admin/calendar', '/growth-admin/preview']

export default function EditorialBackgroundRefresh() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!EDITORIAL_PATHS.some((prefix) => pathname.startsWith(prefix))) return
    let timer: ReturnType<typeof setInterval> | null = null
    const refresh = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    timer = setInterval(refresh, 10000)
    const onVisibility = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      if (timer) clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [pathname, router])

  return null
}
