import { NextResponse } from 'next/server'
import { getContentItem, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow } from '@/lib/growth-admin'
import { deleteGrowthAsset, deleteGrowthRows } from '@/lib/supabase-growth'

type VisualRow={design_id:string;content_id?:string|null;asset_path?:string|null;is_template?:boolean}
export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData(),designId=String(form.get('design_id')||'').trim(),returnTo=String(form.get('return_to')||'/growth-admin/visual-studio')
  if(!designId)return new NextResponse('Missing design_id',{status:400})
  const design=(await queryGrowthTable<VisualRow>('visual_designs',{design_id:`eq.${designId}`,limit:'1'},{cacheSeconds:0}))[0];if(!design)return NextResponse.redirect(new URL(returnTo,request.url),303)
  if(design.content_id){const item=await getContentItem(design.content_id);if(item?.status==='published')return new NextResponse('Published visual cannot be deleted here',{status:409});if(item)await updateGrowthRow('content_items','content_id',design.content_id,{visual_path:'',visual_type:'none',visual_design_id:null,status:['approved','scheduled'].includes(item.status)?'needs_review':item.status,scheduled_at:['approved','scheduled'].includes(item.status)?null:item.scheduled_at})}
  if(design.asset_path)await deleteGrowthAsset(design.asset_path);await deleteGrowthRows('visual_designs',{design_id:`eq.${designId}`})
  const url=new URL(returnTo.startsWith('/')?returnTo:'/growth-admin/visual-studio',request.url);url.searchParams.set('deleted','1');return NextResponse.redirect(url,303)
}
