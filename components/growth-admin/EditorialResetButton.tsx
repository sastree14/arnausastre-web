'use client'

export default function EditorialResetButton() {
  return <form
    action="/api/growth-admin/editorial-reset"
    method="post"
    onSubmit={(event) => {
      const ok = window.confirm('¿Empezar de cero en la interfaz editorial? El histórico anterior y el contenido ya publicado se conservarán fuera del workspace para no romper nada.')
      if (!ok) event.preventDefault()
    }}
  >
    <button className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
      Reiniciar workspace
    </button>
  </form>
}
