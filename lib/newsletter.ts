import 'server-only'

import { randomUUID } from 'node:crypto'
import nodemailer from 'nodemailer'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'

export type NewsletterLanguage='es'|'ca'|'en'
export type NewsletterSubscriber={
  subscriber_id:string
  tenant_id:string
  email:string
  name?:string|null
  company?:string|null
  language:NewsletterLanguage
  interests?:string[]
  source_path?:string|null
  status:string
  unsubscribe_token:string
  last_sent_at?:string|null
  created_at?:string
  updated_at?:string
}

type Article={
  content_id:string
  brief_id?:string
  title:string
  body:string
  language?:string
  status:string
  published_at?:string|null
}

function smtpTransport(){
  const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASSWORD,SMTP_SECURE}=process.env
  if(!SMTP_HOST||!SMTP_PORT||!SMTP_USER||!SMTP_PASSWORD)return null
  return nodemailer.createTransport({
    host:SMTP_HOST,
    port:Number(SMTP_PORT),
    secure:SMTP_SECURE?SMTP_SECURE==='true':Number(SMTP_PORT)===465,
    auth:{user:SMTP_USER,pass:SMTP_PASSWORD},
  })
}

function escapeHtml(value:string){
  return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
}

function plainExcerpt(value:string,max=220){
  const clean=String(value||'').replace(/^#{1,6}\s+/gm,'').replace(/^[-*]\s+/gm,'').replace(/[\*_\`]/g,'').replace(/\s+/g,' ').trim()
  return clean.length<=max?clean:`${clean.slice(0,max-1).trim()}…`
}

const WELCOME={
  es:{subject:'Bienvenido a SC-Analytics Briefing',title:'Ya estás dentro.',body:'Recibirás una selección breve de análisis, sectores, empresas, proyectos y señales relevantes sobre Data, IA y decisiones empresariales. Solo enviaremos algo cuando merezca la pena leerlo.',bye:'Puedes darte de baja en cualquier momento.'},
  ca:{subject:'Benvingut a SC-Analytics Briefing',title:'Ja hi ets.',body:'Rebràs una selecció breu d’anàlisis, sectors, empreses, projectes i senyals rellevants sobre dades, IA i decisions empresarials. Només enviarem alguna cosa quan valgui la pena llegir-la.',bye:'Et pots donar de baixa en qualsevol moment.'},
  en:{subject:'Welcome to SC-Analytics Briefing',title:'You’re in.',body:'You will receive a concise selection of analysis, sectors, companies, projects and useful signals around Data, AI and business decisions. We only send something when it is worth reading.',bye:'You can unsubscribe at any time.'},
} as const

const DIGEST={
  es:{subject:'SC-Analytics Briefing · nuevas ideas y casos',intro:'Una selección breve de contenido nuevo de SC-Analytics.'},
  ca:{subject:'SC-Analytics Briefing · noves idees i casos',intro:'Una selecció breu de contingut nou de SC-Analytics.'},
  en:{subject:'SC-Analytics Briefing · new ideas and cases',intro:'A concise selection of new SC-Analytics material.'},
} as const

export async function subscribeNewsletter(input:{email:string;name?:string;company?:string;language?:NewsletterLanguage;interests?:string[];sourcePath?:string}){
  const email=String(input.email||'').trim().toLowerCase()
  const language:NewsletterLanguage=['es','ca','en'].includes(String(input.language))?input.language as NewsletterLanguage:'es'
  const interests=(input.interests||[]).map(v=>String(v).trim()).filter(Boolean).slice(0,12)
  const now=new Date().toISOString()
  const existing=(await queryGrowthTable<NewsletterSubscriber>('newsletter_subscribers',{tenant_id:'eq.sc-analytics',email:`eq.${email}`,limit:'1'},{cacheSeconds:0}))[0]
  let row:NewsletterSubscriber|null=null
  if(existing){
    row=await updateGrowthRow<NewsletterSubscriber>('newsletter_subscribers','subscriber_id',existing.subscriber_id,{
      name:String(input.name||existing.name||'').trim()||null,
      company:String(input.company||existing.company||'').trim()||null,
      language,
      interests,
      source_path:String(input.sourcePath||existing.source_path||'').slice(0,500)||null,
      status:'active',
      consent_version:'2026-09',
      consent_at:now,
      updated_at:now,
    })
  }else{
    row=await insertGrowthRow<NewsletterSubscriber>('newsletter_subscribers',{
      subscriber_id:`sub_${randomUUID().replaceAll('-','').slice(0,16)}`,
      tenant_id:'sc-analytics',
      email,
      name:String(input.name||'').trim()||null,
      company:String(input.company||'').trim()||null,
      language,
      interests,
      source_path:String(input.sourcePath||'').slice(0,500)||null,
      status:'active',
      consent_version:'2026-09',
      consent_at:now,
      unsubscribe_token:randomUUID().replaceAll('-',''),
      created_at:now,
      updated_at:now,
    })
  }
  if(row){
    await Promise.allSettled([
      sendWelcome(row).catch(error=>console.error('Newsletter welcome email failed',error)),
      sendOwnerSubscriptionNotification(row,{isNew:!existing}).catch(error=>console.error('Newsletter owner notification failed',error)),
    ])
  }
  return row
}

async function sendOwnerSubscriptionNotification(subscriber:NewsletterSubscriber,{isNew}:{isNew:boolean}){
  const transporter=smtpTransport()
  if(!transporter)return
  const from=process.env.SMTP_USER!
  const to=process.env.NEWSLETTER_NOTIFY_EMAIL||process.env.CONTACT_TO_EMAIL||'arnau.sastre@sc-analytics.io'
  const interests=(subscriber.interests||[]).join(', ')||'—'
  const name=subscriber.name||'—'
  const company=subscriber.company||'—'
  const source=subscriber.source_path||'web'
  const state=isNew?'Nueva suscripción':'Suscripción reactivada/actualizada'
  await transporter.sendMail({
    from:`"SC-Analytics website" <${from}>`,
    to,
    replyTo:subscriber.email,
    subject:`[SC-Analytics Briefing] ${state}: ${subscriber.email}`,
    text:`${state}\n\nNombre: ${name}\nEmpresa: ${company}\nEmail: ${subscriber.email}\nIdioma: ${subscriber.language.toUpperCase()}\nIntereses: ${interests}\nOrigen: ${source}\n\nEl suscriptor ya está guardado en CRM > Comercial > Audiencia propia.`,
    html:`<div style="font-family:Arial,sans-serif;max-width:620px;color:#0f172a"><p style="font-size:12px;letter-spacing:.12em;color:#4f46e5;font-weight:700">SC-ANALYTICS BRIEFING</p><h2>${escapeHtml(state)}</h2><p><strong>Nombre:</strong> ${escapeHtml(name)}</p><p><strong>Empresa:</strong> ${escapeHtml(company)}</p><p><strong>Email:</strong> <a href="mailto:${escapeHtml(subscriber.email)}">${escapeHtml(subscriber.email)}</a></p><p><strong>Idioma:</strong> ${escapeHtml(subscriber.language.toUpperCase())}</p><p><strong>Intereses:</strong> ${escapeHtml(interests)}</p><p><strong>Origen:</strong> ${escapeHtml(source)}</p><p style="margin-top:24px;color:#64748b">Ya aparece en CRM → Comercial → Audiencia propia.</p></div>`,
  })
}

async function sendWelcome(subscriber:NewsletterSubscriber){
  const transporter=smtpTransport()
  if(!transporter)return
  const copy=WELCOME[subscriber.language]||WELCOME.es
  const from=process.env.SMTP_USER!
  const unsubscribe=`https://sc-analytics.io/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`
  await transporter.sendMail({
    from:`"SC-Analytics" <${from}>`,
    to:subscriber.email,
    subject:copy.subject,
    text:`${copy.title}\n\n${copy.body}\n\n${copy.bye}\n${unsubscribe}`,
    html:`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#0f172a"><p style="font-size:12px;letter-spacing:.12em;color:#4f46e5;font-weight:700">SC-ANALYTICS BRIEFING</p><h1 style="font-family:Georgia,serif;font-weight:500">${escapeHtml(copy.title)}</h1><p style="line-height:1.7">${escapeHtml(copy.body)}</p><p style="margin-top:28px;font-size:12px;color:#64748b">${escapeHtml(copy.bye)} <a href="${unsubscribe}">Unsubscribe</a></p></div>`,
  })
}

function chooseVariant(group:Article[],lang:NewsletterLanguage){
  return group.find(x=>x.language===lang)||group.find(x=>x.language==='es')||group.find(x=>x.language==='en')||group[0]
}

export async function sendNewsletterDigest(opts:{force?:boolean;subscriberLimit?:number}={}){
  const subscribers=await queryGrowthTable<NewsletterSubscriber>('newsletter_subscribers',{tenant_id:'eq.sc-analytics',status:'eq.active',order:'created_at.asc',limit:String(opts.subscriberLimit||200)},{cacheSeconds:0})
  const articles=(await queryGrowthTable<Article>('content_items',{tenant_id:'eq.sc-analytics',channel:'eq.website',content_type:'eq.article',status:'eq.published',order:'published_at.desc',limit:'300'},{cacheSeconds:0})).filter(a=>a.published_at)
  const groups=new Map<string,Article[]>()
  articles.forEach(article=>{const key=article.brief_id||article.content_id;groups.set(key,[...(groups.get(key)||[]),article])})
  const now=new Date()
  let sent=0,failed=0,skipped=0
  const refs=new Set<string>()
  const transporter=smtpTransport()
  if(!transporter)return{sent:0,failed:0,skipped:subscribers.length,reason:'smtp_not_configured'}
  for(const subscriber of subscribers){
    const baseline=subscriber.last_sent_at?new Date(subscriber.last_sent_at):new Date(now.getTime()-8*24*60*60*1000)
    const allGroups=[...groups.entries()]
    const fresh=allGroups.filter(([,variants])=>variants.some(v=>v.published_at&&new Date(v.published_at)>baseline)).slice(0,6)
    if(!fresh.length&&!opts.force){skipped+=1;continue}
    const sourceGroups=fresh.length?fresh:allGroups.slice(0,6)
    const selected=sourceGroups.map(([key,variants])=>({key,item:chooseVariant(variants,subscriber.language)})).filter(x=>x.item)
    if(!selected.length){skipped+=1;continue}
    const copy=DIGEST[subscriber.language]||DIGEST.es
    const unsubscribe=`https://sc-analytics.io/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`
    const textItems=selected.map(({key,item},i)=>`${i+1}. ${item.title}\nhttps://sc-analytics.io/knowledge/${key}/${subscriber.language}\n${plainExcerpt(item.body)}`).join('\n\n')
    const htmlItems=selected.map(({key,item})=>`<div style="padding:18px 0;border-top:1px solid #e2e8f0"><h2 style="font-family:Georgia,serif;font-weight:500;font-size:21px;margin:0 0 8px"><a style="color:#0f172a;text-decoration:none" href="https://sc-analytics.io/knowledge/${encodeURIComponent(key)}/${subscriber.language}">${escapeHtml(item.title)}</a></h2><p style="line-height:1.65;color:#475569;margin:0">${escapeHtml(plainExcerpt(item.body))}</p></div>`).join('')
    try{
      await transporter.sendMail({
        from:`"SC-Analytics" <${process.env.SMTP_USER}>`,
        to:subscriber.email,
        subject:copy.subject,
        text:`${copy.intro}\n\n${textItems}\n\nUnsubscribe: ${unsubscribe}`,
        html:`<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#0f172a"><p style="font-size:12px;letter-spacing:.12em;color:#4f46e5;font-weight:700">SC-ANALYTICS BRIEFING</p><p style="line-height:1.7;color:#475569">${escapeHtml(copy.intro)}</p>${htmlItems}<p style="margin-top:30px;font-size:12px;color:#94a3b8"><a href="${unsubscribe}">Unsubscribe</a></p></div>`,
      })
      selected.forEach(({key})=>refs.add(key))
      await updateGrowthRow('newsletter_subscribers','subscriber_id',subscriber.subscriber_id,{last_sent_at:now.toISOString(),updated_at:now.toISOString()})
      sent+=1
    }catch(error){
      console.error('Newsletter digest delivery failed',{subscriber:subscriber.subscriber_id,error})
      failed+=1
    }
  }
  await insertGrowthRow('newsletter_campaigns',{
    campaign_id:`campaign_${randomUUID().replaceAll('-','').slice(0,16)}`,
    tenant_id:'sc-analytics',
    campaign_type:'digest',
    subject:'SC-Analytics Briefing',
    content_refs:[...refs],
    recipients_count:subscribers.length,
    sent_count:sent,
    failed_count:failed,
    status:failed?'completed_with_errors':'completed',
    metadata:{forced:Boolean(opts.force),skipped},
    created_at:now.toISOString(),
    sent_at:now.toISOString(),
  }).catch(()=>null)
  return{sent,failed,skipped,content_refs:[...refs]}
}
