import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { insertGrowthRow, isGrowthAdminAuthenticated, queryGrowthTable, updateGrowthRow } from '@/lib/growth-admin'

function outreachAngle(role: string, industry: string) {
  const normalized = role.toLowerCase()
  if (/ceo|founder|owner|managing|director general/.test(normalized)) return 'Decisión, crecimiento y escalabilidad'
  if (/operations|supply|logistic|planning|inventory|procurement/.test(normalized)) return 'Eficiencia operativa, forecasting y optimización'
  if (/cfo|finance|financial|controller|risk/.test(normalized)) return 'Visibilidad financiera, riesgo y calidad de decisión'
  if (/data|analytics|ai|technology|cto|cio|it /.test(`${normalized} `)) return 'Capacidad data/AI, automatización e integración'
  if (/sales|marketing|growth|commercial/.test(normalized)) return 'Forecasting comercial, segmentación y automatización'
  return industry ? `Mejora de decisiones en ${industry}` : 'Mejora de decisiones y procesos con Data/AI'
}

function recommendedMessage(name: string, role: string, companyName: string, industry: string, scoreReason: string) {
  const firstName = name.split(/\s+/)[0] || name
  const context = (scoreReason || '').trim().replace(/\s+/g, ' ').slice(0, 180)
  const roleLower = role.toLowerCase()
  let value = 'identificar oportunidades concretas de mejora en decisiones, procesos, automatización y analítica'
  if (/operations|supply|logistic|planning|inventory|procurement/.test(roleLower)) value = 'detectar mejoras en forecasting, planificación, inventario y eficiencia operativa'
  else if (/cfo|finance|financial|controller|risk/.test(roleLower)) value = 'mejorar forecasting, reporting, control y toma de decisiones financieras'
  else if (/data|analytics|ai|technology|cto|cio|it /.test(`${roleLower} `)) value = 'acelerar iniciativas Data/AI y automatización sin añadir complejidad innecesaria'
  else if (/ceo|founder|owner|managing|director general/.test(roleLower)) value = 'detectar cuellos de botella y oportunidades de escalabilidad con Data, AI y optimización'

  const observation = context ? ` He visto una señal que me llamó la atención: ${context}` : ''
  return `Hola ${firstName}, he estado revisando ${companyName}${industry ? ` dentro de ${industry}` : ''}.${observation} Desde SC-Analytics trabajamos precisamente en ${value}. Si te encaja, podemos hacer una discovery call sin coste para entender el contexto y ver si hay alguna oportunidad real de mejora. Si no vemos valor claro, te lo diría directamente.`
}

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })

  const form = await request.formData()
  const companyId = String(form.get('company_id') || '').trim()
  const name = String(form.get('name') || '').trim()
  const role = String(form.get('role') || 'CEO / Founder').trim()
  const linkedinUrl = String(form.get('linkedin_url') || '').trim()
  const evidence = String(form.get('evidence') || '').trim()

  if (!companyId || !name) return new NextResponse('company_id and name are required', { status: 400 })

  const companies = await queryGrowthTable<Record<string, unknown>>('companies', { company_id: `eq.${companyId}`, limit: '1' }, { cacheSeconds: 0 })
  const company = companies[0]
  if (!company) return new NextResponse('Company not found', { status: 404 })

  const existing = await queryGrowthTable<Record<string, unknown>>('people', {
    company_id: `eq.${companyId}`,
    name: `eq.${name}`,
    limit: '1',
  }, { cacheSeconds: 0 })

  const companyName = String(company.name || '')
  const industry = String(company.industry || '')
  const scoreReason = String(company.score_reason || '')
  const message = recommendedMessage(name, role, companyName, industry, scoreReason)
  const angle = outreachAngle(role, industry)
  const now = new Date().toISOString()
  let personId = ''

  if (existing[0]) {
    personId = String(existing[0].person_id || '')
    await updateGrowthRow('people', 'person_id', personId, {
      role,
      linkedin_url: linkedinUrl || existing[0].linkedin_url || '',
      evidence: evidence || existing[0].evidence || '',
      recommended_message: message,
      outreach_angle: angle,
      status: existing[0].status === 'discarded' ? 'candidate' : (existing[0].status || 'candidate'),
      completed_at: null,
    })
  } else {
    personId = `person_${randomUUID().replaceAll('-', '').slice(0, 12)}`
    await insertGrowthRow('people', {
      person_id: personId,
      tenant_id: 'sc-analytics',
      company_id: companyId,
      name,
      role,
      linkedin_url: linkedinUrl,
      public_source_url: '',
      relevance_score: Number(company.score || 0),
      status: 'candidate',
      evidence,
      notes: '',
      recommended_message: message,
      outreach_angle: angle,
      created_at: now,
    })
  }

  await insertGrowthRow('interactions', {
    interaction_id: `interaction_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    tenant_id: 'sc-analytics',
    company_id: companyId,
    person_id: personId,
    channel: 'crm',
    direction: 'internal',
    kind: 'company_contact_identified',
    content: `Contacto añadido manualmente: ${name} · ${role}`,
    occurred_at: now,
    next_action_at: null,
  })

  await updateGrowthRow('companies', 'company_id', companyId, { status: 'contact_identified', completed_at: null })

  const returnTo = String(form.get('return_to') || '/growth-admin/crm')
  const url = new URL(returnTo.startsWith('/') ? returnTo : '/growth-admin/crm', request.url)
  url.searchParams.set('person_saved', personId)
  return NextResponse.redirect(url, 303)
}
