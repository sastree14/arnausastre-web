import type { Metadata } from 'next'

export const metadata:Metadata={
  title:'SC-Analytics Briefing | Data, AI, sectors and business signals',
  description:'A concise SC-Analytics newsletter on Data, AI, sectors, companies, public cases and business signals worth understanding.',
  keywords:['data AI newsletter','newsletter inteligencia artificial empresas','newsletter data science','analytics newsletter','business AI insights','SC-Analytics Briefing'],
  alternates:{canonical:'/briefing'},
  openGraph:{title:'SC-Analytics Briefing',description:'Useful Data & AI signals, sectors, companies and public cases — selected for business relevance.',url:'https://sc-analytics.io/briefing',type:'website'}
}
export default function Layout({children}:{children:React.ReactNode}){return <>{children}</>}
