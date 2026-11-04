#!/usr/bin/env python3
"""Safe, direct SEO editorial publishing for existing SC-Analytics service URLs.

Only reads approved drafts. A real Chromium preflight must PASS before DB write;
the verified version is then checked in production, else restored automatically.
Never touches CSS, JSX, site design, slugs, prices, or commercial conditions.
"""
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import time
from urllib.parse import urlencode

from PIL import Image, ImageChops
import requests
from playwright.sync_api import sync_playwright
import seo_visual_qa as qa

BASE='https://www.sc-analytics.io'

class Backend:
    def __init__(self):
        self.url=os.getenv('SUPABASE_URL','').rstrip('/')
        self.key=os.getenv('SUPABASE_SECRET_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY','')
        if not re.fullmatch(r'https://[a-z0-9-]+\.supabase\.co',self.url) or not self.key:
            raise RuntimeError('Missing/invalid server-only Supabase configuration')
    def request(self,method,resource,body=None,params=None):
        headers={'apikey':self.key,'Accept':'application/json','Cache-Control':'no-cache'}
        if self.key.startswith('eyJ'):headers['Authorization']='Bearer '+self.key
        response=requests.request(method,self.url+'/rest/v1/'+resource,headers=headers,
            params=params,json=body,timeout=25)
        if not response.ok:
            raise RuntimeError('Supabase request '+resource+' failed: HTTP '+str(response.status_code))
        return response.json() if response.content else None
    def rpc(self,name,**args):return self.request('POST','rpc/'+name,args)
    def page(self,slug):
        rows=self.request('GET','seo_pages',params={'tenant_id':'eq.sc-analytics',
            'slug':'eq.'+slug,'status':'eq.published','select':'slug,version,title,meta_description,h1,intro,sections,cta_title,cta_body','limit':'1'})
        if len(rows)!=1:raise RuntimeError('Missing or ambiguous service page')
        return rows[0]

def expected_record(before,patch):
    if set(patch)-qa.ALLOWED:raise RuntimeError('Patch includes forbidden keys')
    return {key:patch.get(key,before.get(key)) for key in qa.ALLOWED}

def verify_dom(page,expected):
    measure=page.evaluate(qa.MEASURE,{'elements':qa.ELEMENTS,'keys':qa.KEYS})
    if measure.get('fatal') or measure.get('issues'):raise RuntimeError('Layout or overflow regression')
    actual=page.evaluate("""() => {
      const s=[...document.querySelectorAll('main > section')], h=s[0],area=s[1],cta=s[3];
      return {h1:h?.querySelector('h1')?.textContent,
        intro:h?.querySelector('p.whitespace-pre-wrap')?.textContent,
        sections:[...(area?.querySelectorAll('article')||[])].map(x=>({
          heading:x.querySelector('h2')?.textContent,body:x.querySelector('p')?.textContent})),
        cta_title:cta?.querySelector('h2')?.textContent,
        cta_body:cta?.querySelector('h2')?.parentElement?.querySelector('p')?.textContent||'',
        meta_description:document.querySelector('meta[name=description]')?.content||'',
        title:document.title};
    }""")
    for name in ('h1','intro','sections','cta_title','cta_body','meta_description'):
        target=expected.get(name)
        if name=='cta_body' and target is None:target=''
        if actual.get(name)!=target:raise RuntimeError('Published DOM mismatch: '+name)
    if not actual.get('title','').startswith(expected['title']):
        raise RuntimeError('Published SEO title differs')

def compare_images(predicted,actual):
    with Image.open(predicted) as a,Image.open(actual) as b:
        if a.size!=b.size:raise RuntimeError('Published dimensions differ from predicted')
        diff=ImageChops.difference(a.convert('RGB'),b.convert('RGB')).convert('L')
        ratio=diff.point(lambda x:255 if x>24 else 0).histogram()[255]/(a.width*a.height)
        if ratio>0.015:raise RuntimeError('Screenshot drift above budget: '+format(ratio,'.2%'))

def postflight(url,expected,folder):
    errors=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            for name,(w,h) in qa.SIZES.items():
                page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1,reduced_motion='reduce')
                try:
                    for attempt in range(4):
                        try:
                            response=page.goto(url,wait_until='domcontentloaded',timeout=25000)
                            if response is None or response.status>=400:raise RuntimeError('Page HTTP error')
                            page.evaluate('() => document.fonts.ready.then(() => true)')
                            page.wait_for_timeout(250)
                            verify_dom(page,expected)
                            break
                        except Exception:
                            if attempt==3:raise
                            time.sleep(3)
                    path=folder/(name+'-published.png')
                    page.screenshot(path=str(path),full_page=True,animations='disabled')
                    compare_images(folder/(name+'-after.png'),path)
                except Exception as exc:
                    errors.append(name+': '+str(exc)[:200])
                finally:page.close()
        finally:browser.close()
    if errors:raise RuntimeError('Postflight failed: '+'; '.join(errors))

def main():
    backend=Backend()
    draft=backend.rpc('claim_seo_editorial_draft')
    if not draft:
        print('NO_OP: no editorial drafts awaiting visual QA')
        return 0
    draft_id=draft['draft_id']
    applied=False
    try:
        slug=draft['slug'];patch=draft['patch'];version=draft['baseline_version']
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',slug):
            raise RuntimeError('Unexpected URL slug')
        url=BASE+'/services/'+slug
        qa.validate(url,patch)
        baseline=backend.page(slug)
        if baseline['version']!=version:raise RuntimeError('Page changed since draft creation')
        expected=expected_record(baseline,patch)
        with tempfile.TemporaryDirectory(prefix='seo-editorial-qa-') as temp:
            folder=Path(temp)
            pre=qa.run(url,patch,folder)
            if pre['status']!='PASS':raise RuntimeError('Preflight failed: '+str(pre['screens']))
            reference=hashlib.sha256(json.dumps(
                {'draft':draft_id,'patch':patch,'preflight':pre},sort_keys=True).encode()).hexdigest()
            result=backend.rpc('publish_seo_editorial_draft',p_draft_id=draft_id,p_qa_reference=reference)
            applied=True
            postflight(url,expected,folder)
            ok=backend.rpc('complete_seo_editorial_draft',p_draft_id=draft_id,p_qa_reference=reference)
            if ok is not True:raise RuntimeError('Could not confirm validated publication')
            print(json.dumps({'state':'PUBLISHED','slug':slug,'version':result['new_version'],'draft_id':draft_id}))
            return 0
    except Exception as exc:
        reason=(type(exc).__name__+': '+str(exc))[:480]
        try:
            if applied:
                restored=backend.rpc('rollback_seo_editorial_draft',p_draft_id=draft_id,p_reason=reason)
                print(json.dumps({'state':'ROLLED_BACK','draft_id':draft_id,'restored_version':restored,'reason':reason}))
            else:
                backend.rpc('fail_seo_editorial_draft',p_draft_id=draft_id,p_reason=reason)
                print(json.dumps({'state':'BLOCKED','draft_id':draft_id,'reason':reason}))
        except Exception as rollback_error:
            print('CRITICAL: rollback did not complete for '+draft_id+' ('+type(rollback_error).__name__+')',file=sys.stderr)
        return 1

if __name__=='__main__':sys.exit(main())
