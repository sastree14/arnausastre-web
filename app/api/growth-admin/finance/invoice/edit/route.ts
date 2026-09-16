/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isGrowthAdminAuthenticated } from '@/lib/growth-admin'
import { insertGrowthRow, queryGrowthTable, updateGrowthRow } from '@/lib/supabase-growth'
import { calculateInvoiceAmounts, suggestTaxTreatment } from '@/lib/finance-tax'
import { recordFinanceAudit } from '@/lib/finance-audit'

type Row=Record<string,any>
const text=(form:FormData,name:string,fallback='')=>String(form.get(name)||fallback).trim()
const num=(form:FormData,name:string,fallback=0)=>{const value=Number(String(form.get(name)??fallback).replace(',','.'));return Number.isFinite(value)?Math.round(value*100)/100:fallback}

export async function POST(request:Request){
  if(!(await isGrowthAdminAuthenticated())) return new NextResponse('Unauthorized',{status:401})
  const form=await request.formData()
  const invoiceId=text(form,'invoice_id')
  if(!invoiceId) return new NextResponse('Missing invoice_id',{status:400})
  const rows=await queryGrowthTable<Row>('finance_invoices',{tenant_id:'eq.sc-analytics',invoice_id:`eq.${invoiceId}`,limit:'1'},{cacheSeconds:0})
  const invoice=rows[0]
  if(!invoice) return new NextResponse('Invoice not found',{status:404})
  if(invoice.issued_at||['issued','paid','rectified'].includes(String(invoice.status||''))) return new NextResponse('Issued invoices cannot be edited; create a rectification', {status:409})

  const counterpartyId=text(form,'counterparty_id',String(invoice.counterparty_id||''))
  const counterparties=counterpartyId?await queryGrowthTable<Row>('finance_counterparties',{tenant_id:'eq.sc-analytics',counterparty_id:`eq.${counterpartyId}`,limit:'1'},{cacheSeconds:0}):[]
  const c=counterparties[0]||{}
  const subtotal=num(form,'subtotal',Number(invoice.subtotal||0))
  const country=(text(form,'recipient_country_code',String(invoice.recipient_country_code||c.country_code||''))).toUpperCase()
  const taxProfile=text(form,'tax_profile',String(invoice.tax_profile||c.tax_profile||''))
  const suggested=suggestTaxTreatment({countryCode:country,vatId:String(c.vat_id||''),taxProfile,withholdingRate:num(form,'withholding_rate',Number(invoice.withholding_rate||0))})
  const vatRate=form.has('vat_rate')?num(form,'vat_rate'):Number(invoice.vat_rate??suggested.vatRate)
  const withholdingRate=form.has('withholding_rate')?num(form,'withholding_rate'):Number(invoice.withholding_rate??suggested.withholdingRate)
  const amounts=calculateInvoiceAmounts(subtotal,vatRate,withholdingRate)
  const currency=text(form,'currency',String(invoice.currency||c.currency||'EUR'))
  const fxRate=num(form,'fx_rate',Number(invoice.fx_rate||0))||null
  const concept=text(form,'concept',String(invoice.metadata?.concept||'Servicios profesionales'))
  const changes={
    counterparty_id:counterpartyId||null, company_id:c.company_id||invoice.company_id||null, project_id:text(form,'project_id',String(invoice.project_id||''))||null,
    issue_date:text(form,'issue_date',String(invoice.issue_date||''))||null,due_date:text(form,'due_date',String(invoice.due_date||''))||null,currency,
    subtotal:amounts.subtotal,tax:amounts.tax,total:amounts.total,recipient_legal_name:text(form,'recipient_legal_name',String(c.legal_name||invoice.recipient_legal_name||''))||null,
    recipient_tax_id:text(form,'recipient_tax_id',String(c.tax_id||c.vat_id||invoice.recipient_tax_id||''))||null,recipient_country_code:country||null,
    tax_profile:suggested.profile,tax_rule_key:suggested.ruleKey,tax_notes:suggested.note,vat_rate:vatRate,withholding_rate:withholdingRate,withholding_amount:amounts.withholding,
    amount_eur:currency==='EUR'?amounts.total:(fxRate?Math.round(amounts.total*fxRate*100)/100:null),fx_rate:fxRate,fx_date:text(form,'fx_date',String(invoice.fx_date||''))||null,
    notes:text(form,'notes',String(invoice.notes||''))||null,status:'draft',review_status:'pending_review',reviewed_at:null,metadata:{...(invoice.metadata||{}),concept,tax_review_required:true},updated_at:new Date().toISOString(),
  }
  const updated=await updateGrowthRow<Row>('finance_invoices','invoice_id',invoiceId,changes)
  const lineRows=await queryGrowthTable<Row>('finance_invoice_lines',{tenant_id:'eq.sc-analytics',invoice_id:`eq.${invoiceId}`,order:'position.asc',limit:'1'},{cacheSeconds:0})
  if(lineRows[0]) await updateGrowthRow('finance_invoice_lines','line_id',String(lineRows[0].line_id),{description:concept,quantity:1,unit_price:amounts.subtotal,vat_rate:vatRate,line_subtotal:amounts.subtotal,line_tax:amounts.tax,line_total:amounts.subtotal+amounts.tax})
  else await insertGrowthRow('finance_invoice_lines',{line_id:`line_${randomUUID().replaceAll('-','').slice(0,16)}`,tenant_id:'sc-analytics',invoice_id:invoiceId,position:1,description:concept,quantity:1,unit_price:amounts.subtotal,vat_rate:vatRate,line_subtotal:amounts.subtotal,line_tax:amounts.tax,line_total:amounts.subtotal+amounts.tax,created_at:new Date().toISOString()})
  await recordFinanceAudit({entityType:'invoice',entityId:invoiceId,action:'draft_edited',before:invoice,after:updated})
  return NextResponse.redirect(new URL('/growth-admin/finance/invoices?invoice_updated=1',request.url),303)
}
