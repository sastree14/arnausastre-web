const base = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const dbHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };
async function db(path: string, method = 'GET', body?: unknown) {
  const r = await fetch(`${base}/rest/v1/${path}`, { method, headers: dbHeaders, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(`Database operation failed (${r.status})`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}
const rpc = (name: string, body: unknown = {}) => db(`rpc/${name}`, 'POST', body);
function decode64(value: string) {
  const normalized = value.replace(/-/g,'+').replace(/_/g,'/');
  return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,'=')), c=>c.charCodeAt(0));
}
async function decrypt(cipher: string, rawKey: string) {
  const [version, iv, tag, ciphertext] = cipher.split('.');
  if(version !== 'v1') throw new Error('Unsupported encrypted connection');
  const key=await crypto.subtle.importKey('raw',decode64(rawKey),'AES-GCM',false,['decrypt']);
  const ct=decode64(ciphertext), t=decode64(tag), bytes=new Uint8Array(ct.length+t.length);
  bytes.set(ct);bytes.set(t,ct.length);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode64(iv),tagLength:128},key,bytes));
}
function assetRefs(item: Record<string, any>): string[] {
  const slides=item.visual_strategy?.slides;
  const refs=Array.isArray(slides)?slides.map(s=>s.asset_ref):[item.visual_path];
  if(!refs.length || refs.length>20 || refs.some(r=>typeof r!=='string'||!/^supabase:\/\/growth-assets\/editorial\/approved-2026-10\/P\d{3}\/slide-\d{2}\.png$/.test(r))) throw new Error('Incomplete ordered image collection');
  if(new Set(refs).size!==refs.length) throw new Error('Repeated image in collection');
  return refs;
}
function commentary(item: Record<string, any>) {
  // Figma-approved copy already includes its hashtags and paragraph spacing.
  const text=String(item.body||'');
  if(!text.trim() || text.length>3000) throw new Error('Approved copy exceeds LinkedIn limits or is empty');
  return text;
}
async function upload(ref: string, author: string, headers: Record<string,string>) {
  const imageResponse=await fetch(`${base}/storage/v1/object/${ref.slice('supabase://'.length)}`,{headers:dbHeaders});
  if(!imageResponse.ok) throw new Error('Approved image is missing from storage');
  const image=await imageResponse.arrayBuffer();
  const init=await fetch('https://api.linkedin.com/rest/images?action=initializeUpload',{method:'POST',headers,body:JSON.stringify({initializeUploadRequest:{owner:author}})});
  if(!init.ok) throw new Error(`LinkedIn image authorization failed (${init.status})`);
  const {value}=await init.json();
  if(!value?.uploadUrl||!value?.image) throw new Error('Incomplete LinkedIn upload response');
  const put=await fetch(value.uploadUrl,{method:'PUT',headers:{Authorization:headers.Authorization},body:image});
  if(!put.ok) throw new Error(`LinkedIn image upload failed (${put.status})`);
  for(let attempt=0;attempt<30;attempt++) {
    const check=await fetch(`https://api.linkedin.com/rest/images/${encodeURIComponent(value.image)}`,{headers});
    if(check.ok) {
      const state=(await check.json()).status;
      if(state==='AVAILABLE') return value.image;
      if(state==='PROCESSING_FAILED') throw new Error('LinkedIn rejected image processing');
    } else if(check.status===403) {
      // Some write-only member permissions cannot read Images; upload already succeeded.
      return value.image;
    } else throw new Error(`LinkedIn image status failed (${check.status})`);
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  throw new Error('LinkedIn image processing did not finish');
}
async function runLog(status: string, detail: Record<string,unknown>) {
  await db('editorial_worker_runs','POST',{status,detail});
}
Deno.serve(async(req: Request)=>{
  const capability=req.headers.get('x-editorial-capability')||'';
  if(!capability||!await rpc('editorial_worker_authorized',{p_name:'publisher',p_token:capability})) return new Response('Unauthorized',{status:401});
  let claimed: any=null, requestSent=false;
  try {
    const input=await req.json().catch(()=>({}));
    const creds=await rpc('editorial_worker_credentials');
    const connection=creds?.connection, config=creds?.config||{};
    const blocks=[];
    if(!creds?.encryption_key) blocks.push('Worker encryption key is not configured');
    if(!connection || connection.metadata?.disconnected) blocks.push('LinkedIn is disconnected');
    if(connection?.token_expires_at && Date.parse(connection.token_expires_at)<=Date.now()) blocks.push('LinkedIn token expired; reconnect in CMI');
    const jobs=await db('editorial_publication_jobs?state=in.(scheduled,reserved,failed)&select=content_id&limit=200');
    const items=jobs.length?await db(`content_items?content_id=in.(${jobs.map((j:any)=>j.content_id).join(',')})&select=content_id,channel`):[];
    if(items.some((c:any)=>c.channel==='sc_analytics_linkedin')) {
      if(!config.organization_id) blocks.push('SC-Analytics organization ID is not configured');
      if(!connection?.scopes?.includes('w_organization_social')) blocks.push('LinkedIn requires w_organization_social to publish on the SC-Analytics page');
    }
    if(blocks.length) {
      await runLog('blocked',{reasons:blocks,checked:jobs.length});
      return Response.json({status:'blocked',reasons:blocks});
    }
    const token=await decrypt(connection.access_token_ciphertext,creds.encryption_key);
    const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json','Linkedin-Version':config.api_version||'202608','X-Restli-Protocol-Version':'2.0.0'};
    if(input.dry_run) {
      const id=String(input.content_id||'P148');
      if(!/^P\d{3}$/.test(id)) return new Response('Invalid publication',{status:400});
      const [item]=await db(`content_items?content_id=eq.${id}&limit=1`);
      if(!item) throw new Error('Publication not found');
      const refs=assetRefs(item),text=commentary(item);
      for(const ref of refs) {
        const r=await fetch(`${base}/storage/v1/object/${ref.slice('supabase://'.length)}`,{headers:dbHeaders,method:'HEAD'});
        if(!r.ok) throw new Error('Test image is missing');
      }
      await runLog('dry_run',{content_id:id,images:refs.length,characters:text.length,public_post_created:false});
      return Response.json({status:'dry_run',content_id:id,images:refs.length,characters:text.length,public_post_created:false});
    }
    claimed=await rpc('editorial_claim_due',{p_content_id:input.content_id||null});
    if(!claimed) {
      await runLog('idle',{due:0});
      return Response.json({status:'idle'});
    }
    const item=claimed.item, refs=assetRefs(item),text=commentary(item);
    const author=item.channel==='sc_analytics_linkedin'?`urn:li:organization:${config.organization_id}`:connection.metadata.person_urn;
    if(!author) throw new Error('Publication author is missing');
    const images=[];
    for(let i=0;i<refs.length;i++) images.push({id:await upload(refs[i],author,headers),altText:`${item.title} · ${i+1}/${refs.length}`.slice(0,120)});
    const [current]=await db(`content_items?content_id=eq.${item.content_id}&limit=1`);
    const approvals=await db(`approvals?target_id=eq.${item.content_id}&action_type=eq.publish_editorial&status=eq.approved&select=approval_id`);
    if(!current || !approvals.length || !['approved','scheduled'].includes(current.status) || current.body!==item.body || current.scheduled_at!==item.scheduled_at || JSON.stringify(assetRefs(current))!==JSON.stringify(refs)) throw new Error('Publication changed during preparation; review before publishing');
    const payload={author,commentary:text,visibility:'PUBLIC',distribution:{feedDistribution:'MAIN_FEED',targetEntities:[],thirdPartyDistributionChannels:[]},lifecycleState:'PUBLISHED',isReshareDisabledByAuthor:false,content:images.length===1?{media:images[0]}:{multiImage:{images}}};
    await db(`editorial_publication_jobs?content_id=eq.${item.content_id}&claim_id=eq.${claimed.claim_id}`,'PATCH',{request_sent_at:new Date().toISOString()});
    requestSent=true;
    const response=await fetch('https://api.linkedin.com/rest/posts',{method:'POST',headers,body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});
    if(!response.ok) {
      requestSent=response.status>=500 || response.status===408;
      throw new Error(`LinkedIn rejected publication (${response.status})`);
    }
    const postId=response.headers.get('x-restli-id');
    if(!postId) throw new Error('LinkedIn accepted publication without a post ID; inspect before retrying');
    await rpc('editorial_finish_job',{p_content_id:item.content_id,p_claim:claimed.claim_id,p_state:'published',p_post_id:postId,p_error:null});
    await runLog('published',{content_id:item.content_id,images:images.length,post_id:postId});
    return Response.json({status:'published',content_id:item.content_id,post_id:postId});
  } catch(e) {
    const error=String(e).slice(0,400);
    if(claimed) await rpc('editorial_finish_job',{p_content_id:claimed.item.content_id,p_claim:claimed.claim_id,p_state:requestSent?'uncertain':'failed',p_post_id:null,p_error:error}).catch(()=>{});
    await runLog(requestSent?'uncertain':'failed',{content_id:claimed?.item?.content_id,error});
    return Response.json({status:requestSent?'uncertain':'failed',error},{status:500});
  }
});
