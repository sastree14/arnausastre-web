'use client'

import { useEffect } from 'react'

export default function ClientRedirect({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href)
  }, [href])

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 py-20">
      <p className="text-center text-sm text-slate-600">
        Redirecting… <a className="underline" href={href}>Continue</a>
      </p>
    </main>
  )
}
