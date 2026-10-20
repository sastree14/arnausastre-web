'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

const INFO = {
  es: {
    title: 'Política de privacidad',
    date: 'Última actualización: 19 de octubre de 2026',
    lead: 'En esta política explicamos cómo se tratan los datos personales de quienes visitan SC-Analytics, envían una consulta, solicitan una reunión o se suscriben voluntariamente a contenidos.',
    items: [
      ['1. Responsable del tratamiento', 'Arnau Sastre Conde, profesional independiente que opera bajo la denominación comercial SC-Analytics (no constituida como sociedad mercantil). Contacto para privacidad y ejercicio de derechos: arnau.sastre@sc-analytics.io.'],
      ['2. Datos que tratamos', 'Nombre, correo electrónico, empresa, mensaje y datos facilitados voluntariamente en el formulario; información de reuniones y comunicaciones; datos de suscripción cuando corresponda; registros técnicos necesarios para la seguridad del sitio. Si aceptas las cookies analíticas, Google Analytics puede registrar identificadores en línea, páginas visitadas, procedencia de las sesiones e interacciones en la web. No solicitamos categorías especiales de datos. Evita incluir información confidencial o sensible en los formularios.'],
      ['3. Finalidades y bases jurídicas', 'Consultas y solicitudes de presupuesto o colaboración: gestionar la solicitud y las actuaciones precontractuales a petición del interesado (art. 6.1.b RGPD). Gestión de clientes y obligaciones profesionales, contables o fiscales: ejecución de contratos y cumplimiento de obligaciones legales (arts. 6.1.b y 6.1.c). Protección de la web, prevención del abuso y mantenimiento de los servicios: interés legítimo proporcional (art. 6.1.f). Suscripción a comunicaciones informativas y analítica mediante Google Analytics: consentimiento específico (art. 6.1.a), revocable en cualquier momento. No condicionamos la respuesta a una consulta a aceptar analítica ni newsletters.'],
      ['4. Destinatarios y encargados', 'Para operar los servicios podemos utilizar infraestructura web de Vercel, almacenamiento y CRM de Supabase, correo electrónico y servicios SMTP, Calendly para reservas, y Google Analytics únicamente cuando se consienta. Estos proveedores tratan los datos conforme a sus respectivos contratos, condiciones y funciones. No vendemos los datos personales de los visitantes. Podrán comunicarse a autoridades públicas cuando exista obligación legal.'],
      ['5. Transferencias internacionales', 'Los proveedores tecnológicos mencionados pueden prestar servicios o tratar determinados datos fuera del Espacio Económico Europeo. Cuando sea aplicable, se emplearán decisiones de adecuación, cláusulas contractuales tipo y demás garantías exigibles. El tratamiento mediante Google Analytics solo se activa tras el consentimiento de analítica. Los detalles de cada proveedor pueden consultarse en sus políticas.'],
      ['6. Conservación', 'Las consultas se conservan durante el tiempo necesario para responder y gestionar la relación comercial y, después, durante los plazos aplicables para atender responsabilidades legales o reclamaciones. La información contable y contractual se mantiene durante los plazos legales correspondientes. Las suscripciones se mantienen hasta la baja, sin perjuicio de conservar las evidencias necesarias para justificarla. Los plazos de los identificadores de Google Analytics se explican en la política de cookies y dependen de la configuración del servicio. Revisamos periódicamente la necesidad de mantener los datos.'],
      ['7. Derechos', 'Puedes solicitar acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad cuando procedan, dirigiéndote a arnau.sastre@sc-analytics.io. Puedes retirar cualquier consentimiento en cualquier momento sin afectar a la licitud de los tratamientos anteriores. Si consideras vulnerados tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).'],
      ['8. Carácter obligatorio y decisiones automatizadas', 'Los datos marcados como obligatorios en el formulario son necesarios para tramitar tu solicitud; si no se facilitan, no podremos responder adecuadamente. No se adoptan decisiones exclusivamente automatizadas con efectos jurídicos o equivalentes sobre los visitantes de esta web.'],
      ['9. Enlaces y cambios', 'Los enlaces a LinkedIn y Calendly llevan a servicios externos con sus propias condiciones de privacidad. Actualizaremos esta política cuando cambien las finalidades, los proveedores o los requisitos legales.'],
    ],
    cookies: 'Consulta también la política de cookies',
    legal: 'Consulta el aviso legal',
  },
  ca: {
    title: 'Política de privacitat',
    date: 'Última actualització: 19 d’octubre de 2026',
    lead: 'En aquesta política expliquem com tractem les dades personals de les persones que visiten SC-Analytics, envien una consulta, sol·liciten una reunió o se subscriuen voluntàriament als continguts.',
    items: [
      ['1. Responsable del tractament', 'Arnau Sastre Conde, professional independent que opera amb la denominació comercial SC-Analytics (no constituïda com a societat mercantil). Contacte per a privacitat i exercici de drets: arnau.sastre@sc-analytics.io.'],
      ['2. Dades que tractem', 'Nom, correu electrònic, empresa, missatge i dades facilitades voluntàriament en el formulari; informació de reunions i comunicacions; dades de subscripció, quan correspongui; registres tècnics necessaris per a la seguretat del web. Si acceptes les galetes analítiques, Google Analytics pot registrar identificadors en línia, pàgines visitades, procedència de sessions i interaccions. No sol·licitem categories especials de dades. Evita incloure informació confidencial o sensible als formularis.'],
      ['3. Finalitats i bases jurídiques', 'Consultes i peticions de pressupost o col·laboració: gestió de la sol·licitud i mesures precontractuals a petició de la persona interessada (art. 6.1.b RGPD). Gestió de clients i obligacions professionals, comptables o fiscals: execució de contractes i obligacions legals (arts. 6.1.b i 6.1.c). Seguretat i prevenció d’abusos: interès legítim proporcionat (art. 6.1.f). Butlletins i Google Analytics: consentiment específic (art. 6.1.a), que es pot retirar. No condicionem les respostes a l’acceptació d’analítica o butlletins.'],
      ['4. Destinataris i encarregats', 'Per operar els serveis podem utilitzar Vercel, Supabase (emmagatzematge i CRM), correu electrònic i serveis SMTP, Calendly per a reserves i Google Analytics només amb consentiment. Els proveïdors tracten les dades d’acord amb els seus respectius contractes i condicions. No venem les dades personals. Poden comunicar-se a autoritats quan existeixi una obligació legal.'],
      ['5. Transferències internacionals', 'Els proveïdors esmentats poden prestar serveis o tractar dades fora de l’Espai Econòmic Europeu. Quan escaigui, s’aplicaran decisions d’adequació, clàusules contractuals tipus i altres garanties exigibles. Google Analytics només s’activa després del consentiment analític.'],
      ['6. Conservació', 'Conservem les consultes el temps necessari per respondre i gestionar la relació comercial i, posteriorment, durant els terminis aplicables per responsabilitats o reclamacions. Les dades comptables i contractuals es conserven durant els terminis legals. Les subscripcions duren fins a la baixa, sense perjudici de conservar les proves necessàries. Els identificadors de Google Analytics es descriuen a la política de galetes. Revisem periòdicament la necessitat de conservar les dades.'],
      ['7. Drets', 'Pots demanar accés, rectificació, supressió, oposició, limitació i portabilitat quan correspongui escrivint a arnau.sastre@sc-analytics.io. Pots retirar el consentiment en qualsevol moment. També pots reclamar davant l’Agència Espanyola de Protecció de Dades (www.aepd.es).'],
      ['8. Obligatorietat i decisions automatitzades', 'Els camps obligatoris del formulari són necessaris per tramitar la sol·licitud. No prenem decisions exclusivament automatitzades amb efectes jurídics o equivalents sobre els visitants del web.'],
      ['9. Enllaços i modificacions', 'LinkedIn i Calendly són serveis externs amb les seves pròpies polítiques. Actualitzarem aquest text quan canviïn les finalitats, els proveïdors o la normativa.'],
    ],
    cookies: 'Consulta també la política de galetes',
    legal: 'Consulta l’avís legal',
  },
  en: {
    title: 'Privacy policy',
    date: 'Last updated: 19 October 2026',
    lead: 'This policy explains how we process personal data when you browse SC-Analytics, submit an enquiry, request a meeting or voluntarily subscribe to content.',
    items: [
      ['1. Data controller', 'Arnau Sastre Conde, an independent professional trading as SC-Analytics (not incorporated as a company). Privacy contact and rights requests: arnau.sastre@sc-analytics.io.'],
      ['2. Personal data processed', 'Name, email address, company, message and information voluntarily provided via forms; meeting and correspondence details; subscription information where applicable; technical records necessary for website security. When analytics cookies are accepted, Google Analytics may collect online identifiers, visited pages, session sources and site interactions. Please do not submit sensitive or confidential information in our forms.'],
      ['3. Purposes and lawful bases', 'Enquiries and service or partnership requests: handling your request and pre-contractual steps taken at your request (GDPR Art. 6(1)(b)). Client administration and legal, accounting or tax duties: contractual necessity and legal obligation (Arts. 6(1)(b) and (c)). Site security, abuse prevention and continuity: proportionate legitimate interests (Art. 6(1)(f)). Optional newsletter and Google Analytics: separate, withdrawable consent (Art. 6(1)(a)). You need not accept analytics or marketing to contact us.'],
      ['4. Recipients and processors', 'Service providers may include Vercel (website infrastructure), Supabase (storage and CRM), email and SMTP services, Calendly (meeting bookings) and Google Analytics (only with consent). Each acts under its relevant contractual terms and processing arrangements. We do not sell visitor personal data. Information may be disclosed to public authorities when legally required.'],
      ['5. International transfers', 'These technology providers may process some information outside the European Economic Area. Where applicable, transfers rely on adequacy decisions, standard contractual clauses or other valid safeguards. Google Analytics is activated only after analytics consent. Consult each provider’s policy for details.'],
      ['6. Data retention', 'Enquiries are retained as long as needed to respond and manage the business relationship and subsequently for applicable limitation or legal retention periods. Contractual and accounting records follow statutory retention rules. Subscriptions last until cancellation, while minimal evidence of consent or cancellation may be retained as needed. Google Analytics identifier lifetimes are discussed in our cookie policy and depend on configuration. We periodically review whether data is still needed.'],
      ['7. Your rights', 'You may request access, correction, erasure, objection, restriction or portability where applicable by writing to arnau.sastre@sc-analytics.io. You may withdraw consent at any time, without affecting prior lawful processing. You may also complain to the Spanish Data Protection Authority (www.aepd.es).'],
      ['8. Required fields and automated decisions', 'Fields marked as required are needed to handle your enquiry. We do not make solely automated decisions with legal or similarly significant effects on website visitors.'],
      ['9. External links and changes', 'LinkedIn and Calendly are separate services with their own privacy policies. This document will be updated as purposes, providers or legal requirements change.'],
    ],
    cookies: 'Read the cookie policy',
    legal: 'Read the legal notice',
  },
} as const

export default function PrivacyPage() {
  const { lang } = useSiteLanguage()
  const t = INFO[lang]
  return (
    <main className="bg-[#F7F9FC] text-[#0D1B2A]">
      <article className="site-container mx-auto max-w-[940px] py-9 md:py-12">
        <h1 className="text-[29px] font-semibold tracking-tight md:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
        <p className="mt-1 text-[11px] text-slate-500">{t.date}</p>
        <p className="mt-4 text-[13px] leading-6 text-slate-700">{t.lead}</p>
        {t.items.map(([title, body]) => (
          <section key={title} className="mt-6">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-700">{body}</p>
          </section>
        ))}
        <nav className="mt-7 flex flex-col gap-2 border-t border-slate-200 pt-4 text-[12px] font-medium text-[#254A66]">
          <Link className="underline underline-offset-4" href="/cookies">{t.cookies}</Link>
          <Link className="underline underline-offset-4" href="/legal">{t.legal}</Link>
        </nav>
      </article>
    </main>
  )
}
