import { redirect } from 'next/navigation'
import AdminShell from '@/components/growth-admin/AdminShell'
import CommercialMemoryWorkspace from '@/components/growth-admin/CommercialMemoryWorkspace'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function CommercialMemoryPage() {
  if (!(await isGrowthAdminAuthenticated())) redirect('/growth-admin/login')
  return <AdminShell active="commercial-memory"><CommercialMemoryWorkspace /></AdminShell>
}
