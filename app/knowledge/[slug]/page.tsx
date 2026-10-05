import {redirect} from 'next/navigation'
import {requestLanguage} from '@/lib/site-metadata'
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const lang=await requestLanguage();redirect(`/knowledge/${slug}/${lang}`)}
