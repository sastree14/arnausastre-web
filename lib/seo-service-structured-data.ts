import type { CommercialLocale } from '@/lib/seo-service-locales'

const site='https://www.sc-analytics.io'

/**
 * JSON-LD for a published commercial service without unsupported properties.
 *
 * Schema.org defines inLanguage on CreativeWork (including WebPage), not on
 * Service. Keeping page language on WebPage avoids misleading structured-data
 * validators and preserves a separate service entity.
 */
export function commercialServiceStructuredData(input:{
  slug:string
  headline:string
  description:string
  primaryKeyword:string
  locale:CommercialLocale
}){
  const url=`${site}/services/${input.slug}`
  const serviceId=`${url}#service`
  const webpageId=`${url}#webpage`
  const breadcrumbId=`${url}#breadcrumb`
  const serviceCategory=input.locale==='es'?'Servicios'
    :input.locale==='ca'?'Serveis':'Services'
  return {
    '@context':'https://schema.org',
    '@graph':[
      {
        '@type':'Service',
        '@id':serviceId,
        name:input.headline,
        description:input.description,
        serviceType:input.primaryKeyword,
        url,
        provider:{'@id':`${site}/#organization`},
      },
      {
        '@type':'WebPage',
        '@id':webpageId,
        url,
        name:input.headline,
        description:input.description,
        inLanguage:input.locale,
        isPartOf:{'@id':`${site}/#website`},
        mainEntity:{'@id':serviceId},
        breadcrumb:{'@id':breadcrumbId},
      },
      {
        '@type':'BreadcrumbList',
        '@id':breadcrumbId,
        itemListElement:[
          {'@type':'ListItem',position:1,name:serviceCategory,item:`${site}/services`},
          {'@type':'ListItem',position:2,name:input.headline,item:url},
        ],
      },
    ],
  }
}
