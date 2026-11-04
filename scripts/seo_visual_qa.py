#!/usr/bin/env python3
"""Read-only pre-publication visual gate for /services/[slug] editorial drafts.

No writes to Supabase, Vercel, or GitHub. Draft text is simulated on the
published page in Chromium, with its actual DOM and existing CSS.
"""
import argparse, json, re, sys
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

SIZES={'mobile':(375,812),'tablet':(768,1024),'desktop':(1440,900)}
ALLOWED={'title','meta_description','h1','intro','sections','cta_title','cta_body'}
KEYS=('fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textAlign',
      'color','backgroundColor','borderColor','borderWidth','borderRadius',
      'paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop',
      'marginRight','marginBottom','marginLeft','display','gridTemplateColumns',
      'columnGap','rowGap','justifyContent','alignItems')
ELEMENTS={
 'h1':'main > section:nth-of-type(1) h1',
 'intro':'main > section:nth-of-type(1) p.whitespace-pre-wrap',
 'h2':'main > section:nth-of-type(2) article:first-of-type h2',
 'body':'main > section:nth-of-type(2) article:first-of-type p',
 'cta':'main > section:nth-of-type(4) h2',
 'actions':'main > section:nth-of-type(3) .grid > a:first-of-type',
}

MEASURE=r"""
({elements,keys}) => {
 const main=document.querySelector('main'), issues=[];
 if(!main||main.querySelectorAll(':scope > section').length!==4)
   return {fatal:'unexpected public page template'};
 const styles={};
 for(const [name,selector] of Object.entries(elements)){
   const el=document.querySelector(selector);
   if(!el)return {fatal:'missing selector '+name};
   const s=getComputedStyle(el);
   styles[name]=Object.fromEntries(keys.map(k=>[k,s[k]]));
 }
 const width=window.innerWidth;
 if(document.documentElement.scrollWidth>width+2)
   issues.push('page horizontal overflow');
 for(const el of main.querySelectorAll('h1,h2,h3,p,a')){
   const s=getComputedStyle(el),r=el.getBoundingClientRect();
   if(s.display==='none'||s.visibility==='hidden'||!r.width||!r.height)continue;
   if(r.left < -2 || r.right > width+2)
     issues.push('element outside viewport: '+el.tagName);
   const range=document.createRange();range.selectNodeContents(el);
   const t=range.getBoundingClientRect();
   if(t.width && (t.left<r.left-5||t.right>r.right+5))
     issues.push('text outside container: '+el.tagName+' '+el.textContent.slice(0,50));
   if(['hidden','clip'].includes(s.overflowY)&&el.scrollHeight>el.clientHeight+3)
     issues.push('clipped text: '+el.tagName);
 }
 const rows=[...main.querySelectorAll('section:nth-of-type(2) article')];
 for(let i=1;i<rows.length;i++){
   if(rows[i].getBoundingClientRect().top < rows[i-1].getBoundingClientRect().bottom-2)
     issues.push('service section overlap: '+i);
 }
 const cards=[...main.querySelectorAll('section:nth-of-type(3) .grid > a')];
 if(cards.length!==3)issues.push('expected 3 action cards, got '+cards.length);
 for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){
   const a=cards[i].getBoundingClientRect(),b=cards[j].getBoundingClientRect();
   if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>3 &&
      Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>3)
     issues.push('overlapping action cards');
 }
 return {styles,issues:issues.slice(0,40),sectionCount:rows.length};
}
"""

INJECT=r"""
draft => {
 const sections=[...document.querySelectorAll('main > section')];
 if(sections.length!==4)throw Error('template changed');
 const hero=sections[0],content=sections[1],cta=sections[3];
 const h1=hero.querySelector('h1'),intro=hero.querySelector('p.whitespace-pre-wrap');
 const row=content.querySelector('article'),h2=cta.querySelector('h2');
 if(!h1||!intro||!row||!h2)throw Error('missing template nodes');
 if('h1' in draft){
   h1.textContent=draft.h1;
   const crumb=hero.querySelector('[aria-current=page]');
   if(crumb)crumb.textContent=draft.h1;
 }
 if('intro' in draft)intro.textContent=draft.intro;
 if('cta_title' in draft)h2.textContent=draft.cta_title;
 if('cta_body' in draft){
   const parent=h2.parentElement;
   let p=parent.querySelector('p');
   if(!p&&draft.cta_body){
     p=document.createElement('p');
     p.className='mt-4 text-[16px] leading-8 text-[#EAF0F6]';
     parent.appendChild(p);
   }
   if(p){if(draft.cta_body)p.textContent=draft.cta_body;else p.remove();}
 }
 if('sections' in draft){
   const wrapper=row.parentElement, templates=[...wrapper.children].filter(n=>n.tagName==='ARTICLE');
   if(!templates.length)throw Error('no service row template');
   const output=draft.sections.map((s,i)=>{
     const n=(templates[i%2]||templates[0]).cloneNode(true);
     const title=n.querySelector('h2'),body=n.querySelector('p');
     if(!title||!body)throw Error('bad row template');
     n.classList.remove('bg-white','bg-[#EAF0F6]');
     n.classList.add(i%2===0?'bg-white':'bg-[#EAF0F6]');
     title.textContent=s.heading;body.textContent=s.body;return n;
   });
   wrapper.replaceChildren(...output);
 }
 if('title' in draft)document.title=draft.title;
 if('meta_description' in draft){
   const el=document.querySelector('meta[name=description]');if(el)el.content=draft.meta_description;
 }
 return true;
}
"""

def validate(url,draft,local=False):
    u=urlparse(url);host=(u.hostname or '').lower()
    if u.scheme not in ('https','http') or u.username or u.password:
        raise ValueError('Invalid URL')
    if u.scheme!='https' and not (local and host in {'localhost','127.0.0.1'}):
        raise ValueError('HTTPS required')
    if host not in {'www.sc-analytics.io','sc-analytics.io'} and not host.endswith('.vercel.app') and not (local and host in {'localhost','127.0.0.1'}):
        raise ValueError('Unrecognized target host')
    if not re.fullmatch(r'/services/[a-z0-9-]+/?',u.path):
        raise ValueError('Target a service detail page')
    if not isinstance(draft,dict) or not draft or set(draft)-ALLOWED:
        raise ValueError('Invalid draft fields')
    for k,v in draft.items():
        if k=='sections':
            if not isinstance(v,list) or not 1<=len(v)<=25:raise ValueError('Invalid sections')
            for item in v:
                if (not isinstance(item,dict) or set(item)!={'heading','body'}
                    or not all(isinstance(item[x],str) and item[x].strip() for x in ('heading','body'))):
                    raise ValueError('Invalid section content')
        elif not isinstance(v,str) or (not v.strip() and k!='cta_body'):
            raise ValueError('Invalid text field '+k)

def run(url,draft,out,browser_exec=None):
    out.mkdir(parents=True,exist_ok=True)
    report={'status':'FAIL','url':url,'mode':'read-only DOM draft simulation','screens':{}}
    with sync_playwright() as pw:
        kwargs={'executable_path':browser_exec} if browser_exec else {}
        browser=pw.chromium.launch(headless=True,**kwargs)
        try:
            for screen,(w,h) in SIZES.items():
                page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1,reduced_motion='reduce')
                errors=[]
                try:
                    response=page.goto(url,wait_until='domcontentloaded',timeout=25000)
                    if not response or response.status>=400:raise RuntimeError('HTTP failure')
                    page.evaluate('document.fonts.ready')
                    page.wait_for_timeout(250)
                    before=page.evaluate(MEASURE,{'elements':ELEMENTS,'keys':KEYS})
                    if before.get('fatal') or before.get('issues'):
                        raise RuntimeError('Baseline failed: '+str(before.get('fatal') or before.get('issues')))
                    page.screenshot(path=str(out/f'{screen}-before.png'),full_page=True,animations='disabled')
                    if 'sections' in draft and len(draft['sections'])<before['sectionCount']:
                        raise RuntimeError('Section removal needs separate review')
                    page.evaluate(INJECT,draft)
                    page.evaluate('document.fonts.ready')
                    after=page.evaluate(MEASURE,{'elements':ELEMENTS,'keys':KEYS})
                    if after.get('fatal'):errors.append(after['fatal'])
                    else:
                        if after['styles']!=before['styles']:errors.append('CSS/computed style drift')
                        errors.extend(after['issues'])
                        if 'sections' in draft and after['sectionCount']!=len(draft['sections']):
                            errors.append('Incorrect section count')
                        bg=page.evaluate("() => [...document.querySelectorAll('main > section:nth-of-type(2) article')].map(n=>getComputedStyle(n).backgroundColor)")
                        if any(v!=bg[i%2] for i,v in enumerate(bg)):
                            errors.append('Alternating section background regression')
                    page.screenshot(path=str(out/f'{screen}-after.png'),full_page=True,animations='disabled')
                except Exception as e:
                    errors.append(str(e)[:500])
                report['screens'][screen]={'status':'PASS' if not errors else 'FAIL','issues':errors}
                page.close()
        finally:
            browser.close()
    report['status']='PASS' if len(report['screens'])==3 and all(x['status']=='PASS' for x in report['screens'].values()) else 'FAIL'
    (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    return report

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--url',required=True)
    parser.add_argument('--draft',type=Path,required=True)
    parser.add_argument('--out',type=Path,default=Path('/tmp/sc-analytics-visual-qa'))
    parser.add_argument('--browser-executable',default=None)
    parser.add_argument('--allow-local',action='store_true')
    args=parser.parse_args()
    try:
        draft=json.loads(args.draft.read_text(encoding='utf-8'))
        validate(args.url,draft,args.allow_local)
        report=run(args.url,draft,args.out,args.browser_executable)
        print(json.dumps({'status':report['status'],'report':str(args.out/'report.json'),'screens':report['screens']},ensure_ascii=False))
        return 0 if report['status']=='PASS' else 1
    except Exception as e:
        print(json.dumps({'status':'FAIL','error':str(e)},ensure_ascii=False),file=sys.stderr)
        return 2

if __name__=='__main__':sys.exit(main())
