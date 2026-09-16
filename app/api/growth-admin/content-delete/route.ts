import { NextResponse } from 'next/server'
import { getContentItem, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow } from '@/lib/growth-admin'
import { deleteGrowthAsset, deleteGrowthRows } from '@/lib/supabase-growth'

type VisualRow={design_id:string;content_id?:string|null;asset_path?:string|null;is_template?:boolean}
export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated()))return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData(),contentId=String(form.get('content_id')||'').trim(),returnTo=String(form.get('return_to')||'/growth-admin/content?filter=review')
  if(!contentId)return new NextResponse('Missing content_id',{status:400});const item=await getContentItem(contentId);if(!item)return new NextResponse('Content not found',{status:404});if(item.status==='published')return new NextResponse('Published content is retained for URL and metrics integrity',{status:409})
  const designs=await queryGrowthTable<VisualRow>('visual_designs',{content_id:`eq.${contentId}`,limit:'100'},{cacheSeconds:0})
  for(const design of designs){if(design.is_template){await updateGrowthRow('visual_designs','design_id',design.design_id,{content_id:null})}else{if(design.asset_path)await deleteGrowthAsset(design.asset_path);await deleteGrowthRows('visual_designs',{design_id:`eq.${design.design_id}`})}}
  if(item.visual_path&&!designs.some(row=>row.is_template&&row.asset_path===item.visual_path))await deleteGrowthAsset(item.visual_path)
  await deleteGrowthRows('approvals',{target_id:`eq.${contentId}`});await deleteGrowthRows('content_items',{content_id:`eq.${contentId}`})
  const url=new URL(returnTo.startsWith('/')?returnTo:'/growth-admin/content',request.url);url.searchParams.set('deleted','1');return NextResponse.redirect(url,303)
}
