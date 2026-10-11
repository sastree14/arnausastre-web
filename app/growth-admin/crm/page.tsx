import { redirect } from 'next/navigation'
import CommercialOverview from '@/components/growth-admin/CommercialOverview'
import AdminShell from '@/components/growth-admin/AdminShell'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CrmPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  void searchParams
  return <AdminShell active="crm"><CommercialOverview /></AdminShell>
}
