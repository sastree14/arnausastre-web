import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import CommercialAcquisitionWorkspace from '@/components/growth-admin/CommercialAcquisitionWorkspace'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
export const dynamic='force-dynamic'
export const revalidate=0
export default async function CommercialMemoryPage(){
 if(!(await isGrowthAdminAuthenticated()))redirect('/growth-admin/login')
 return <AdminShell active="commercial-memory"><CommercialAcquisitionWorkspace/></AdminShell>
}
