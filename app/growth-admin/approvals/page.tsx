import { redirect } from 'next/navigation'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'

export default async function ApprovalsPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  redirect('/growth-admin/content?filter=review')
}
