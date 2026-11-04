"""Chromium QA for localized /knowledge articles. No public writes.

Runs the real React component in an authenticated read-only draft preview;
the same layout is compared to the published URL in 3 viewports.
"""
import re
import time
from pathlib import Path
from urllib.parse import quote
from playwright.sync_api import sync_playwright
import seo_visual_qa as service_qa

BASE='https://www.sc-analytics.io'
SIZES=service_qa.SIZES
STYLE_KEYS=service_qa.KEYS

MEASURE=r"""
keys => {
 const main=document.querySelector('main[lang]'), root=document.querySelector('[data-knowledge-article-body]');
 if(!main||!root||!main.querySelector('h1'))return {fatal:'Article GoldStandard template absent'};
 const search={
   main:main, heading:main.querySelector('h1'), article:root,
   paragraph:root.querySelector('p'), section:root.querySelector('section'),
   sectionHeading:root.querySelector('section h2'),
   navigation:main.querySelector('aside'), card:main.querySelector('.grid > div'),
 };
 const styles={};
 for(const [name,el] of Object.entries(search)){
   if(!el)continue;
   const st=getComputedStyle(el);
   styles[name]=Object.fromEntries(keys.map(k=>[k,st[k]]));
 }
 const issues=[];
 const vw=window.innerWidth;
 if(document.documentElement.scrollWidth>vw+2)issues.push('horizontal page overflow');
 for(const el of main.querySelectorAll('h1,h2,h3,p,a,summary')){
   const st=getComputedStyle(el),rect=el.getBoundingClientRect();
   if(st.display==='none'||st.visibility==='hidden'||!rect.width||!rect.height)continue;
   if(rect.left < -4 || rect.right>vw+4)
     issues.push('element outside screen: '+el.tagName);
   if(['hidden','clip'].includes(st.overflowY)&&el.scrollHeight>el.clientHeight+3)
     issues.push('clipped text: '+el.tagName);
 }
 const sections=[...root.querySelectorAll(':scope > section')];
 for(let i=1;i<sections.length;i++){
   if(sections[i].getBoundingClientRect().top<sections[i-1].getBoundingClientRect().bottom-3)
     issues.push('overlap in content sections');
 }
 const h1=main.querySelector('h1').textContent.trim();
 const articleText=root.textContent.replace(/\s+/g,' ').trim();
 return {styles,issues:issues.slice(0,50),h1,articleText,sectionCount:sections.length,lang:main.getAttribute('lang')};
}
"""

def article_url(slug,locale):
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,180}',slug):raise ValueError('Unexpected article slug')
    if locale not in ('es','en','ca'):raise ValueError('Unexpected language')
    return BASE+'/knowledge/'+quote(slug,safe='')+'/'+locale

def preview_url(content_id,draft_id):
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,180}',content_id):raise ValueError('Bad content_id')
    if not re.fullmatch(r'[a-fA-F0-9-]{36}',draft_id):raise ValueError('Bad draft_id')
    return BASE+'/internal/seo-preview/knowledge/'+content_id+'?draft='+draft_id

def assert_layout(measured):
    if measured.get('fatal') or measured.get('issues'):
        raise RuntimeError('Visual or layout problem: '+str(measured.get('fatal') or measured.get('issues')))
    if not measured.get('styles',{}).get('sectionHeading'):
        raise RuntimeError('Article must contain a structured section')

def assert_content(measured,article):
    if measured.get('h1')!=article['title']:
        raise RuntimeError('Article headline does not match the draft')
    if measured.get('lang')!=article['language']:
        raise RuntimeError('Wrong article language')
    body=article['body'].replace('**','').replace('#','')
    first=next((re.sub(r'\s+',' ',line).strip() for line in body.splitlines()
                if len(line.strip())>=48 and not line.lstrip().startswith('|')),None)
    if first and first[:45] not in measured['articleText']:
        raise RuntimeError('Rendered article body did not match the expected content')

def load(page,url):
    resp=page.goto(url,wait_until='domcontentloaded',timeout=30000)
    if resp is None or resp.status>=400:
        label='private-preview' if '/internal/seo-preview/' in url else 'public-article'
        raise RuntimeError('HTTP '+str(resp.status if resp else 'none')+' loading '+label)
    page.evaluate('() => document.fonts.ready.then(() => true)')
    page.wait_for_timeout(300)
    return page.evaluate(MEASURE,STYLE_KEYS)

def gate(slug,locale,content_id,draft_id,preview_token,expected,out):
    out.mkdir(parents=True,exist_ok=True)
    public=article_url(slug,locale)
    url=preview_url(content_id,draft_id)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            results={}
            for name,(width,height) in SIZES.items():
                ctx=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,reduced_motion='reduce')
                try:
                    before=ctx.new_page()
                    base=load(before,public)
                    assert_layout(base)
                    if base['lang']!=locale:raise RuntimeError('Public language differs')
                    before.locator('main[lang]').screenshot(path=str(out/(name+'-before.png')),animations='disabled')
                    before.close()
                    draftpage=ctx.new_page()
                    def sign_request(route):
                        headers=dict(route.request.headers)
                        headers['x-sc-seo-preview-token']=preview_token
                        route.continue_(headers=headers)
                    draftpage.route('**/internal/seo-preview/knowledge/**',sign_request)
                    draft=load(draftpage,url)
                    assert_layout(draft)
                    assert_content(draft,expected)
                    for element,styles in base['styles'].items():
                        if element in draft['styles'] and draft['styles'][element]!=styles:
                            raise RuntimeError('Existing visual token changed: '+element)
                    draftpage.locator('main[lang]').screenshot(path=str(out/(name+'-after.png')),animations='disabled')
                    draftpage.close()
                    results[name]={'status':'PASS','before_sections':base['sectionCount'],'after_sections':draft['sectionCount']}
                finally:ctx.close()
            return results
        finally:browser.close()

def verify_published(slug,locale,expected,out):
    public=article_url(slug,locale)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        try:
            for name,(width,height) in SIZES.items():
                ctx=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,reduced_motion='reduce')
                try:
                    page=ctx.new_page()
                    for attempt in range(11):
                        try:
                            actual=load(page,public)
                            assert_layout(actual)
                            assert_content(actual,expected)
                            break
                        except Exception:
                            if attempt==10:raise
                            time.sleep(5)
                    path=out/(name+'-published.png')
                    page.locator('main[lang]').screenshot(path=str(path),animations='disabled')
                    from seo_editorial_autopublish import compare_images
                    compare_images(out/(name+'-after.png'),path)
                    page.close()
                finally:ctx.close()
        finally:browser.close()
