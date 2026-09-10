export default function GrowthAdminLoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-slate-700 bg-slate-900 p-8 rounded-xl">
        <p className="text-xs tracking-[0.25em] text-slate-400 mb-3">SC-ANALYTICS</p>
        <h1 className="text-2xl font-semibold mb-2">Growth Agent</h1>
        <p className="text-sm text-slate-400 mb-8">Private approval console</p>
        <form action="/api/growth-admin/login" method="post" className="space-y-4">
          <label className="block text-sm text-slate-300" htmlFor="token">Admin token</label>
          <input
            id="token"
            name="token"
            type="password"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-slate-500"
          />
          <button className="w-full rounded-lg bg-slate-100 text-slate-950 py-3 font-medium hover:bg-white" type="submit">
            Open console
          </button>
        </form>
      </div>
    </main>
  )
}
