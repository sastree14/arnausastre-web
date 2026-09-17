'use client'

export default function PrintButton({ label = 'Imprimir / guardar PDF' }: { label?: string }) {
  return <button type="button" onClick={() => window.print()} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white print:hidden">{label}</button>
}
