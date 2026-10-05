import {notFound} from 'next/navigation'
import {LANGUAGES} from '@/lib/site-routing'
export default async function Layout({children,params}:{children:React.ReactNode;params:Promise<{lang:string}>}){const {lang}=await params;if(!LANGUAGES.includes(lang as typeof LANGUAGES[number]))notFound();return <>{children}</>}
