'use client'

import { useState } from 'react'

export default function CopyButton({ text, label = 'Copiar mensaje' }: { text: string; label?: string }) {
  const [copied,setCopied] = useState(false)
  return <button type="button" onClick={async()=>{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1500)}} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500">{copied?'Copiado ✓':label}</button>
}
