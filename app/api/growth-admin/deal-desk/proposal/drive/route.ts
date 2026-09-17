import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { getDealDeskBundle } from '@/lib/growth-admin-performance'
import { createProposalDocument } from '@/lib/google-drive-operations'
import { updateGrowthRow } from '@/lib/supabase-growth'

type Row = Record<string, unknown>
const esc = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch] || ch))
const section = (title: string, value: unknown) => value ? `<h2>${esc(title)}</h2><p>${esc(value).replaceAll('\n','<br>')}</p>` : ''

export async function POST(request: Request) {
  if (!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized', { status: 401 })
  const form = await request.formData()
  const opportunityId = String(form.get('opportunity_id') || '').trim()
  if (!opportunityId) return new NextResponse('Missing opportunity_id', { status: 400 })
  try {
    const bundle = await getDealDeskBundle()
    const opportunity = bundle.opportunities.find((row) => row.opportunity_id === opportunityId)
    const workspace = bundle.workspaces.find((row) => String(row.opportunity_id) === opportunityId) as Row | undefined
    if (!opportunity || !workspace) throw new Error('Deal workspace not found')
    const proposal = (workspace.proposal || {}) as Row
    const company = bundle.companies.find((row) => String(row.company_id) === String(opportunity.company_id))
    const name = `Proposal · ${company?.name || opportunity.company_name || opportunity.name || opportunityId}`
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:900px;margin:40px auto}h1{font-size:32px}h2{font-size:18px;margin-top:28px}p{white-space:normal}small{color:#64748b}</style></head><body><small>SC-Analytics · Proposal</small><h1>${esc(proposal.objective || opportunity.name || name)}</h1><p><strong>Cliente:</strong> ${esc(company?.name || opportunity.company_name || '—')}</p>${section('Resumen ejecutivo',proposal.executive_summary)}${section('Objetivo',proposal.objective)}${section('Alcance',proposal.scope)}${section('Entregables',proposal.deliverables)}${section('Enfoque',proposal.approach)}${section('Fases y timing',proposal.timeline)}${section('Criterios de aceptación',proposal.acceptance_criteria)}${section('Fuera de alcance',proposal.exclusions)}${section('Supuestos',proposal.assumptions)}${section('Puntos abiertos',proposal.open_items)}</body></html>`
    const file = await createProposalDocument(name, html)
    const updatedProposal = { ...proposal, drive_file_id: file.id, drive_url: file.webViewLink || `https://docs.google.com/document/d/${file.id}/edit`, drive_saved_at: new Date().toISOString() }
    await updateGrowthRow('crm_deal_workspaces', 'opportunity_id', opportunityId, { proposal: updatedProposal, updated_at: new Date().toISOString() })
    const url = new URL('/growth-admin/deal-desk', request.url); url.searchParams.set('opportunity', opportunityId); url.searchParams.set('step','proposal'); url.searchParams.set('saved','proposal_drive'); url.hash='proposal'; return NextResponse.redirect(url,303)
  } catch (error) {
    const url = new URL('/growth-admin/deal-desk', request.url); url.searchParams.set('opportunity', opportunityId); url.searchParams.set('step','proposal'); url.searchParams.set('drive_error', error instanceof Error ? error.message : 'Drive export failed'); url.hash='proposal'; return NextResponse.redirect(url,303)
  }
}
