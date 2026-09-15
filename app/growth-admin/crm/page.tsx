import { redirect } from 'next/navigation'
import CommercialProspectingWorkspace from '@/components/growth-admin/CommercialProspectingWorkspace'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'

export default async function CrmPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  return <CommercialProspectingWorkspace mode="lead" searchParams={searchParams}/>
}
