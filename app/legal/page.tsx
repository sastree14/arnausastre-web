'use client'

import Link from 'next/link'
import { useSiteLanguage } from '@/components/SiteLanguageProvider'

// These optional public fields must only be populated with details approved
// for PUBLIC disclosure by the proprietor. Never infer a home address or NIF.
const publicTaxId = process.env.NEXT_PUBLIC_LEGAL_TAX_ID?.trim()
const publicPostalAddress = process.env.NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS?.trim()

const COPY = {
  es: {
    title: 'Aviso legal',
    date: 'Última actualización: 19 de octubre de 2026',
    intro: 'Información del prestador de servicios y condiciones generales de utilización de sc-analytics.io.',
    identity: '1. Identificación del titular',
    name: 'Titular y responsable de la actividad',
    brand: 'Nombre comercial',
    role: 'Actividad',
    roleText: 'Consultoría de datos, matemáticas, analítica empresarial, optimización e inteligencia artificial.',
    condition: 'Forma jurídica',
    conditionText: 'Actividad profesional desarrollada por una persona física. SC-Analytics no es una sociedad mercantil inscrita.',
    email: 'Correo de contacto',
    address: 'Domicilio',
    tax: 'NIF',
    terms: '2. Condiciones de utilización',
    termsText: 'El acceso a este sitio es gratuito. El usuario se compromete a utilizar sus contenidos y formularios de manera lícita, sin perjudicar los derechos de terceros ni la seguridad del servicio. Los contenidos generales tienen carácter informativo y no constituyen por sí mismos una oferta contractual ni asesoramiento profesional individualizado.',
    intellectual: '3. Propiedad intelectual',
    intellectualText: 'Los textos, imágenes, gráficos y otros recursos del sitio pertenecen a sus respectivos titulares. Se prohíbe su reproducción o explotación no autorizada salvo los usos permitidos por la legislación aplicable. Las denominaciones o marcas de terceros se mencionan únicamente a efectos identificativos.',
    links: '4. Enlaces externos y disponibilidad',
    linksText: 'La web puede enlazar a servicios de terceros, como LinkedIn y Calendly, que disponen de sus propias condiciones y políticas. Se trabaja para mantener la información actualizada y la web disponible, pero pueden producirse interrupciones técnicas. Esta cláusula no limita los derechos que correspondan legalmente a los usuarios.',
    privacy: '5. Protección de datos y cookies',
    privacyText: 'El tratamiento de datos personales se explica en la política de privacidad. El uso de cookies o tecnologías equivalentes y sus opciones de consentimiento se describen en la política de cookies.',
    law: '6. Normativa aplicable',
    lawText: 'Este sitio se rige por la legislación española, sin perjuicio de los derechos imperativos que puedan corresponder a consumidores y usuarios conforme a la normativa aplicable.',
    privacyLink: 'Política de privacidad',
    cookieLink: 'Política de cookies',
  },
  ca: {
    title: 'Avís legal',
    date: 'Última actualització: 19 d’octubre de 2026',
    intro: 'Informació del prestador de serveis i condicions generals d’ús de sc-analytics.io.',
    identity: '1. Identificació del titular',
    name: 'Titular i responsable de l’activitat',
    brand: 'Nom comercial',
    role: 'Activitat',
    roleText: 'Consultoria de dades, matemàtiques, analítica empresarial, optimització i intel·ligència artificial.',
    condition: 'Forma jurídica',
    conditionText: 'Activitat professional desenvolupada per una persona física. SC-Analytics no és una societat mercantil inscrita.',
    email: 'Correu de contacte',
    address: 'Domicili',
    tax: 'NIF',
    terms: '2. Condicions d’ús',
    termsText: 'L’accés al lloc web és gratuït. L’usuari es compromet a fer-ne un ús lícit, respectant els drets de tercers i la seguretat del servei. El contingut és informatiu i no constitueix, per si mateix, una oferta contractual ni assessorament professional individualitzat.',
    intellectual: '3. Propietat intel·lectual',
    intellectualText: 'Els textos, imatges, gràfics i altres recursos pertanyen als seus titulars. Se’n prohibeix la reproducció o explotació no autoritzada excepte els usos legalment permesos. Les marques de tercers es mencionen només a efectes identificatius.',
    links: '4. Enllaços externs i disponibilitat',
    linksText: 'El web pot enllaçar a serveis de tercers, com LinkedIn o Calendly, subjectes a les seves polítiques. Es procura mantenir la informació actualitzada, tot i que hi pot haver interrupcions tècniques. Aquesta clàusula no limita els drets legalment reconeguts.',
    privacy: '5. Protecció de dades i galetes',
    privacyText: 'El tractament de dades personals s’explica a la política de privacitat. Les galetes i les opcions de consentiment s’expliquen a la política de galetes.',
    law: '6. Normativa aplicable',
    lawText: 'El web es regeix per la legislació espanyola, sens perjudici dels drets imperatius aplicables als consumidors i usuaris.',
    privacyLink: 'Política de privacitat',
    cookieLink: 'Política de galetes',
  },
  en: {
    title: 'Legal notice',
    date: 'Last updated: 19 October 2026',
    intro: 'Information about the service provider and terms for use of sc-analytics.io.',
    identity: '1. Provider identification',
    name: 'Proprietor and controller',
    brand: 'Trading name',
    role: 'Business activity',
    roleText: 'Data, mathematics, business analytics, optimisation and artificial intelligence consulting.',
    condition: 'Legal form',
    conditionText: 'Professional activity carried out by an individual. SC-Analytics is not an incorporated or registered company.',
    email: 'Contact email',
    address: 'Postal address',
    tax: 'Tax identification number',
    terms: '2. Terms of website use',
    termsText: 'Access to this website is free of charge. Visitors must use it lawfully and respect third-party rights and service security. General website material is for information only and does not itself constitute a contractual offer or individual professional advice.',
    intellectual: '3. Intellectual property',
    intellectualText: 'Text, images, graphics and other materials belong to their respective owners. Unauthorised reproduction or commercial use is prohibited except as permitted by applicable law. Third-party names and marks are used for identification only.',
    links: '4. External links and availability',
    linksText: 'We may link to third-party services such as LinkedIn or Calendly, which have separate terms and policies. We aim to maintain accurate information and availability, but technical interruptions may occur. This does not limit visitors’ statutory rights.',
    privacy: '5. Privacy and cookies',
    privacyText: 'Personal data processing is explained in the privacy policy. Cookies and consent controls are explained in the cookie policy.',
    law: '6. Applicable law',
    lawText: 'Spanish law applies, without prejudice to any mandatory consumer or user protections applicable in the relevant jurisdiction.',
    privacyLink: 'Privacy policy',
    cookieLink: 'Cookie policy',
  },
} as const

export default function LegalPage() {
  const { lang } = useSiteLanguage()
  const t = COPY[lang]
  return (
    <main className="bg-[#F7F9FC] text-[#0D1B2A]">
      <article className="site-container mx-auto max-w-[940px] py-9 md:py-12">
        <h1 className="text-[29px] font-semibold tracking-tight md:text-[34px]" style={{ fontFamily: 'var(--font-playfair)' }}>{t.title}</h1>
        <p className="mt-1 text-[11px] text-slate-500">{t.date}</p>
        <p className="mt-4 text-[13px] leading-6 text-slate-700">{t.intro}</p>
        <section className="mt-6">
          <h2 className="text-[15px] font-semibold">{t.identity}</h2>
          <dl className="mt-3 grid gap-2 border border-slate-200 bg-white p-4 text-[12px] leading-5">
            <div><dt className="font-semibold">{t.name}</dt><dd>Arnau Sastre Conde</dd></div>
            <div><dt className="font-semibold">{t.brand}</dt><dd>SC-Analytics</dd></div>
            <div><dt className="font-semibold">{t.role}</dt><dd>{t.roleText}</dd></div>
            <div><dt className="font-semibold">{t.condition}</dt><dd>{t.conditionText}</dd></div>
            <div><dt className="font-semibold">{t.email}</dt><dd><a href="mailto:arnau.sastre@sc-analytics.io" className="text-[#254A66] underline">arnau.sastre@sc-analytics.io</a></dd></div>
            {publicTaxId && <div><dt className="font-semibold">{t.tax}</dt><dd>{publicTaxId}</dd></div>}
            {publicPostalAddress && <div><dt className="font-semibold">{t.address}</dt><dd>{publicPostalAddress}</dd></div>}
          </dl>
        </section>
        {[
          [t.terms,t.termsText],
          [t.intellectual,t.intellectualText],
          [t.links,t.linksText],
          [t.privacy,t.privacyText],
          [t.law,t.lawText],
        ].map(([title,body]) => (
          <section className="mt-6" key={title}>
            <h2 className="text-[15px] font-semibold">{title}</h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-700">{body}</p>
          </section>
        ))}
        <nav className="mt-7 flex flex-col gap-2 border-t border-slate-200 pt-4 text-[12px] font-medium text-[#254A66]">
          <Link href="/privacy" className="underline underline-offset-4">{t.privacyLink}</Link>
          <Link href="/cookies" className="underline underline-offset-4">{t.cookieLink}</Link>
        </nav>
      </article>
    </main>
  )
}
