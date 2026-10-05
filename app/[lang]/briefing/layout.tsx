import {pageMetadata} from '@/lib/site-metadata'
export async function generateMetadata(){return pageMetadata('/briefing',{"es": "Briefing de datos e IA", "ca": "Briefing de dades i IA", "en": "Data and AI briefing"},{"es": "Una selección de señales de datos e IA relevantes para el negocio.", "ca": "Una selecció de senyals de dades i IA rellevants per al negoci.", "en": "A selection of data and AI signals relevant to business."})}
export default function Layout({children}:{children:React.ReactNode}){return <>{children}</>}
