'use client'

import { usePathname } from 'next/navigation'

export default function ControlCenterQuickNav() {
  const pathname = usePathname()
  if (pathname !== '/growth-admin') return null

  return (
    <a
      href="/growth-admin/visual-studio"
      className="fixed bottom-6 right-6 z-[80] inline-flex items-center gap-2 rounded-full border border-sky-700/70 bg-sky-950 px-5 py-3 text-sm font-semibold text-sky-100 shadow-2xl shadow-black/30 transition hover:border-sky-400 hover:bg-sky-900"
      aria-label="Open Visual Studio"
    >
      <span className="text-base">✦</span>
      Visual Studio
    </a>
  )
}
