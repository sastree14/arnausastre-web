'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const internal = pathname.startsWith('/growth-admin')

  if (internal) return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
