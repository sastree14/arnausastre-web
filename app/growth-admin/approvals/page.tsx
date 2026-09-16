import { redirect } from 'next/navigation'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'

export default async function ApprovalsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=await searchParams
  const next=new URLSearchParams({filter:'review'})
  if(typeof params.blocked==='string'&&params.blocked.trim()) next.set('blocked',params.blocked)
  redirect(`/growth-admin/content?${next.toString()}`)
}
