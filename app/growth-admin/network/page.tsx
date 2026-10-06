import { redirect } from 'next/navigation'
import CommercialProspectingWorkspace from '@/components/growth-admin/CommercialProspectingWorkspace'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NetworkPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  return <CommercialProspectingWorkspace mode="network" searchParams={searchParams}/>
}
