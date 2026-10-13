import CommercialAcquisitionWorkspace from '@/components/growth-admin/CommercialAcquisitionWorkspace'
import CommercialViewRefresh from '@/components/growth-admin/CommercialViewRefresh'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
export const dynamic='force-dynamic'
export const revalidate=0
export default async function CrmPage(){
  if(!(await isGrowthAdminAuthenticated()))redirect('/growth-admin/login')
  return <AdminShell active="crm"><CommercialAcquisitionWorkspace/><CommercialViewRefresh/></AdminShell>
}
