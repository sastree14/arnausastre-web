export default function GrowthAdminLoading() {
  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-950">
      <div className="sticky top-0 z-50 h-[78px] border-b border-slate-200 bg-white/95" />
      <div className="mx-auto max-w-[1780px] px-5 py-6 md:px-8 lg:py-8">
        <div className="animate-pulse">
          <div className="h-44 rounded-[2rem] bg-slate-900" />
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {[0,1,2,3].map((item) => <div key={item} className="h-64 rounded-[1.75rem] border border-slate-200 bg-white"><div className="h-1.5 rounded-t-[1.75rem] bg-slate-200"/><div className="space-y-4 p-6"><div className="h-3 w-24 rounded bg-slate-100"/><div className="h-8 w-40 rounded bg-slate-100"/><div className="h-4 w-3/4 rounded bg-slate-100"/><div className="grid grid-cols-4 gap-3 pt-4">{[0,1,2,3].map((metric)=><div key={metric} className="h-16 rounded-xl bg-slate-50"/>)}</div></div></div>)}
          </div>
        </div>
      </div>
    </main>
  )
}
