import { redirect } from 'next/navigation'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'

export default async function ApprovalsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  const params=await searchParams
  const next=new URLSearchParams({filter:'review'})
  for(const key of ['blocked','editorial_decision','changes_requested']){
    const value=params[key]
    if(typeof value==='string'&&value.trim()) next.set(key,value)
  }
  redirect(`/growth-admin/content?${next.toString()}`)
}
