/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only'

import { randomUUID } from 'node:crypto'
import { queryGrowthRpc, upsertGrowthRow, insertGrowthRow } from '@/lib/supabase-growth'
import { ensureFinancePath, ensureSpreadsheet, exportDriveFile, financeGoogleReadiness, replaceSpreadsheetValues, uploadBinaryFile } from '@/lib/google-drive-finance'

export type PeriodKind='month'|'quarter'|'semester'|'year'
export type FinancePeriod={kind:PeriodKind;label:string;start:string;end:string;previousStart:string;previousEnd:string}
export type PeriodReport={period_start:string;period_end:string;invoiced:number|string;expenses:number|string;cash_in:number|string;cash_out:number|string;vat_output:number|string;vat_input:number|string;withholding:number|string}

function iso(date:Date){return date.toISOString().slice(0,10)}
function endOfMonth(year:number,monthZero:number){return new Date(Date.UTC(year,monthZero+1,0))}

export function resolveFinancePeriod(kind:PeriodKind,anchorInput?:string):FinancePeriod{
  const anchor=anchorInput?new Date(`${anchorInput.slice(0,10)}T12:00:00Z`):new Date()
  const y=anchor.getUTCFullYear(),m=anchor.getUTCMonth()
  if(kind==='month'){
    const start=new Date(Date.UTC(y,m,1)),end=endOfMonth(y,m)
    const prevStart=new Date(Date.UTC(y,m-1,1)),prevEnd=endOfMonth(prevStart.getUTCFullYear(),prevStart.getUTCMonth())
    return {kind,label:start.toLocaleDateString('es-ES',{month:'long',year:'numeric',timeZone:'UTC'}),start:iso(start),end:iso(end),previousStart:iso(prevStart),previousEnd:iso(prevEnd)}
  }
  if(kind==='quarter'){
    const q=Math.floor(m/3),start=new Date(Date.UTC(y,q*3,1)),end=endOfMonth(y,q*3+2)
    const prevStart=new Date(Date.UTC(y,q*3-3,1)),prevEnd=endOfMonth(prevStart.getUTCFullYear(),prevStart.getUTCMonth()+2)
    return {kind,label:`Q${q+1} ${y}`,start:iso(start),end:iso(end),previousStart:iso(prevStart),previousEnd:iso(prevEnd)}
  }
  if(kind==='semester'){
    const h=m<6?0:1,start=new Date(Date.UTC(y,h*6,1)),end=endOfMonth(y,h*6+5)
    const prevStart=new Date(Date.UTC(y,h*6-6,1)),prevEnd=endOfMonth(prevStart.getUTCFullYear(),prevStart.getUTCMonth()+5)
    return {kind,label:`S${h+1} ${y}`,start:iso(start),end:iso(end),previousStart:iso(prevStart),previousEnd:iso(prevEnd)}
  }
  const start=new Date(Date.UTC(y,0,1)),end=new Date(Date.UTC(y,11,31)),prevStart=new Date(Date.UTC(y-1,0,1)),prevEnd=new Date(Date.UTC(y-1,11,31))
  return {kind,label:String(y),start:iso(start),end:iso(end),previousStart:iso(prevStart),previousEnd:iso(prevEnd)}
}

export async function financePeriodReport(start:string,end:string){
  return queryGrowthRpc<PeriodReport>('finance_period_report',{p_start:start,p_end:end},{cacheSeconds:0})
}

export async function financePeriodComparison(period:FinancePeriod){
  const [current,previous]=await Promise.all([financePeriodReport(period.start,period.end),financePeriodReport(period.previousStart,period.previousEnd)])
  return {period,current,previous}
}

function n(value:unknown){return Number(value||0)}
function pct(current:unknown,previous:unknown){const p=n(previous);if(!p)return n(current)?null:0;return ((n(current)-p)/Math.abs(p))*100}

export function reportComparisonRows(current:PeriodReport,previous:PeriodReport){
  return [
    ['Facturado',n(current.invoiced),n(previous.invoiced),pct(current.invoiced,previous.invoiced)],
    ['Gastos',n(current.expenses),n(previous.expenses),pct(current.expenses,previous.expenses)],
    ['Resultado',n(current.invoiced)-n(current.expenses),n(previous.invoiced)-n(previous.expenses),pct(n(current.invoiced)-n(current.expenses),n(previous.invoiced)-n(previous.expenses))],
    ['Cobros',n(current.cash_in),n(previous.cash_in),pct(current.cash_in,previous.cash_in)],
    ['Pagos',n(current.cash_out),n(previous.cash_out),pct(current.cash_out,previous.cash_out)],
    ['IVA repercutido',n(current.vat_output),n(previous.vat_output),pct(current.vat_output,previous.vat_output)],
    ['IVA soportado',n(current.vat_input),n(previous.vat_input),pct(current.vat_input,previous.vat_input)],
    ['IVA estimado',n(current.vat_output)-n(current.vat_input),n(previous.vat_output)-n(previous.vat_input),pct(n(current.vat_output)-n(current.vat_input),n(previous.vat_output)-n(previous.vat_input))],
    ['Retenciones',n(current.withholding),n(previous.withholding),pct(current.withholding,previous.withholding)],
  ]
}

export async function saveTaxPeriod(period:FinancePeriod,report:PeriodReport){
  const id=`tax_${period.kind}_${period.start}_${period.end}`.replace(/[^a-zA-Z0-9_-]/g,'')
  return upsertGrowthRow('finance_tax_periods',{
    tax_period_id:id,tenant_id:'sc-analytics',period_type:period.kind,period_start:period.start,period_end:period.end,status:'open',vat_output:n(report.vat_output),vat_input:n(report.vat_input),withholding_total:n(report.withholding),estimated_vat_payable:n(report.vat_output)-n(report.vat_input),metadata:{label:period.label,calculated_at:new Date().toISOString()},updated_at:new Date().toISOString(),created_at:new Date().toISOString(),
  },'tenant_id,period_type,period_start,period_end')
}

export async function generateFinanceClosure(period:FinancePeriod){
  const readiness=financeGoogleReadiness()
  if(!readiness.configured) throw new Error(`Google Finance integration is not configured: ${readiness.missing.join(', ')}`)
  const {current,previous}=await financePeriodComparison(period)
  await saveTaxPeriod(period,current)
  const year=period.start.slice(0,4)
  const folder=await ensureFinancePath(['04 Cierres',year])
  const name=`Cierre ${period.label}`
  const sheet=await ensureSpreadsheet(folder.id,name)
  const rows=[
    ['SC-Analytics · Cierre financiero',period.label,'','',''],
    ['Periodo',period.start,period.end,'',''],
    ['Métrica','Periodo actual','Periodo anterior','Variación %','Nota'],
    ...reportComparisonRows(current,previous).map(([label,now,before,change])=>[label,now,before,change===null?'n/a':change,'']),
    ['','','','',''],
    ['Aviso','Control empresarial interno; revisar tratamiento fiscal y deducibilidad antes de declaraciones oficiales.','','',''],
  ]
  await replaceSpreadsheetValues(sheet.id,'Cierre',rows)
  const pdfBytes=await exportDriveFile(sheet.id,'application/pdf')
  const pdf=await uploadBinaryFile(folder.id,`${name}.pdf`,'application/pdf',pdfBytes)
  await insertGrowthRow('finance_documents',{document_id:`document_${randomUUID().replaceAll('-','').slice(0,16)}`,tenant_id:'sc-analytics',entity_type:'tax_period',entity_id:`${period.kind}:${period.start}:${period.end}`,document_type:'closure_pdf',drive_file_id:pdf.id,drive_url:pdf.webViewLink||'',file_name:pdf.name||`${name}.pdf`,mime_type:'application/pdf',editable:false,version_no:1,metadata:{sheet_id:sheet.id,period},created_at:new Date().toISOString()})
  return {sheet,pdf,current,previous}
}
