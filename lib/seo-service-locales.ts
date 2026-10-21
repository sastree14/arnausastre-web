/**
 * Curated correspondence of EXISTING English and intended localized commercial
 * landing pages. Localized pages need editorial content and 'published' status
 * in Supabase before they can be exposed in hreflang/sitemaps.
 *
 * The public page component and CSS are shared by every language.
 */
export const SERVICE_LANGUAGE_GROUPS = {
  'consulting': {en:'data-science-consulting',es:'consultoria-datos',ca:'consultoria-dades'},
  'forecasting': {en:'demand-forecasting',es:'prediccion-demanda',ca:'previsio-demanda'},
  'ai-automation': {en:'ai-automation',es:'automatizacion-ia-empresas',ca:'consultoria-intelligencia-artificial'},
  'optimization': {en:'operations-research',es:'optimizacion-operaciones',ca:'optimitzacio-empresarial'},
  'inventory': {en:'inventory-optimization',es:'optimizacion-inventario'},
  'business-intelligence': {en:'business-intelligence',es:'analitica-datos-empresas'},
} as const satisfies Record<string,Partial<Record<'en'|'es'|'ca',string>>>

export type CommercialLocale='en'|'es'|'ca'

const localeForSlug = new Map<string,CommercialLocale>()
const groupForSlug = new Map<string,Record<string,string>>()
for(const group of Object.values(SERVICE_LANGUAGE_GROUPS)){
  const translated=group as Record<string,string>
  for(const [locale,slug] of Object.entries(translated)){
    if(localeForSlug.has(slug))throw new Error('Duplicate commercial SEO locale slug: '+slug)
    localeForSlug.set(slug,locale as CommercialLocale)
    groupForSlug.set(slug,translated)
  }
}
export function serviceLocaleForSlug(slug:string):CommercialLocale{
  return localeForSlug.get(slug)||'en'
}
export function serviceGroupForSlug(slug:string):Record<string,string>|null{
  return groupForSlug.get(slug)||null
}
export function languageAlternatesForPublishedSlugs(slug:string,published:Set<string>):
  Partial<Record<CommercialLocale,string>> {
  const group=serviceGroupForSlug(slug)
  if(!group)return {}
  const output:Partial<Record<CommercialLocale,string>>={}
  for(const [language,peerSlug] of Object.entries(group))
    if(published.has(peerSlug))output[language as CommercialLocale]=
      'https://www.sc-analytics.io/services/'+peerSlug
  return output
}
