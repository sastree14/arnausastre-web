import {pageMetadata} from '@/lib/site-metadata'
export async function generateMetadata(){return pageMetadata('/privacy',{"es": "Privacidad y cookies", "ca": "Privacitat i cookies", "en": "Privacy and cookies"},{"es": "Información sobre datos de contacto, proveedores y preferencias de analítica.", "ca": "Informació sobre dades de contacte, proveïdors i preferències d’analítica.", "en": "Information on contact data, providers and analytics preferences."})}
export default function Layout({children}:{children:React.ReactNode}){return <>{children}</>}
