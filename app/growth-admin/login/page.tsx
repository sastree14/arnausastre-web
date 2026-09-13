import Image from 'next/image'

export default function GrowthAdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3">
          <Image src="/brand/Monograma-simple.png" alt="SC-Analytics" width={44} height={44} className="h-10 w-10 rounded-lg" priority />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">SC-Analytics</p>
            <p className="text-sm text-slate-300">Internal systems</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-violet-800/60 bg-violet-950/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Private area</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">This is the internal SC-Analytics control center. Public website visitors do not have access to the information behind this login.</p>
        </div>

        <h1 className="mt-8 text-3xl font-semibold">Control Center</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Approve content, review agents, schedule publication and manage the operating queue from one place.</p>

        <form action="/api/growth-admin/login" method="post" className="mt-8 space-y-4">
          <label className="block text-sm text-slate-300" htmlFor="token">Admin access token</label>
          <input id="token" name="token" type="password" required autoComplete="current-password" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-violet-500" />
          <button className="w-full rounded-lg bg-white py-3 font-semibold text-slate-950 transition hover:bg-slate-100" type="submit">Open Control Center</button>
        </form>

        <a href="/" className="mt-6 block text-center text-xs text-slate-600 transition hover:text-slate-400">← Return to public website</a>
      </div>
    </main>
  )
}
