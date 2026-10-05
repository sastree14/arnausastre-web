import {pageMetadata} from '@/lib/site-metadata'
export async function generateMetadata(){return pageMetadata('/legal',{"es": "Información legal", "ca": "Informació legal", "en": "Legal information"},{"es": "Responsable de la web y condiciones del contenido de SC-Analytics.", "ca": "Responsable del web i condicions del contingut de SC-Analytics.", "en": "Website operator and SC-Analytics content terms."})}
export default function Layout({children}:{children:React.ReactNode}){return <>{children}</>}
