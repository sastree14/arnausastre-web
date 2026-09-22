import type { Metadata } from 'next'
export const metadata:Metadata={
  title:'Partner analítico externo | Data, IA y Analytics',
  description:'Capacidad externa de Data Science, IA, forecasting, optimización, automatización y analytics sin construir un departamento interno completo.',
  keywords:['partner analítico','external analytics partner','data science as a service','consultoría data science','consultoría inteligencia artificial','analytics partner','AI consulting Spain'],
  alternates:{canonical:'/partner-analitico'},
  openGraph:{title:'SC-Analytics · Partner analítico externo',description:'Capacidad especialista de Data e IA que conserva contexto y entra cuando el negocio lo necesita.',url:'https://sc-analytics.io/partner-analitico',type:'website'}
}
export default function Layout({children}:{children:React.ReactNode}){return <>{children}</>}
