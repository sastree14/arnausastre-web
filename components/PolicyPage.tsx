"use client";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import { Hero } from "@/components/CommercialPrimitives";
import { tr } from "@/lib/commercial-content";
export default function PolicyPage({ legal = false }: { legal?: boolean }) {
  const { lang } = useSiteLanguage();
  const sections = legal
    ? [
        [
          tr(
            "Responsable y contacto",
            "Responsable i contacte",
            "Operator and contact",
          ),
          tr(
            "SC-Analytics es la marca utilizada por Arnau Sastre Conde. Para consultas sobre la web: arnau.sastre@sc-analytics.io.",
            "SC-Analytics és la marca utilitzada per Arnau Sastre Conde. Per a consultes sobre el web: arnau.sastre@sc-analytics.io.",
            "SC-Analytics is the brand used by Arnau Sastre Conde. Website enquiries: arnau.sastre@sc-analytics.io.",
          ),
        ],
        [
          tr(
            "Contenido y condiciones de uso",
            "Contingut i condicions d’ús",
            "Content and usage",
          ),
          tr(
            "El contenido es informativo y no constituye una oferta contractual. Los alcances, precios y condiciones se acuerdan en una propuesta. Las demostraciones técnicas y los escenarios económicos se identifican como tales; no garantizan resultados futuros.",
            "El contingut és informatiu i no constitueix una oferta contractual. Abast, preus i condicions s’acorden en una proposta. Les demostracions i els escenaris econòmics no garanteixen resultats futurs.",
            "Content is informational and is not a contractual offer. Scope, pricing and terms are agreed in a proposal. Technical demonstrations and economic scenarios do not guarantee future results.",
          ),
        ],
        [
          tr(
            "Propiedad y enlaces",
            "Propietat i enllaços",
            "Ownership and links",
          ),
          tr(
            "Los contenidos de la web pertenecen a sus respectivos titulares. Los repositorios enlazados tienen sus propias licencias. Los enlaces externos pueden tener condiciones y políticas distintas.",
            "Els continguts pertanyen als titulars respectius. Els repositoris enllaçats tenen llicències pròpies. Els enllaços externs poden tenir condicions i polítiques diferents.",
            "Website content belongs to its respective owners. Linked repositories have their own licenses. External links may have different terms and policies.",
          ),
        ],
      ]
    : [
        [
          tr(
            "Quién trata los datos",
            "Qui tracta les dades",
            "Who processes the data",
          ),
          tr(
            "Arnau Sastre Conde, bajo la marca SC-Analytics. Contacto para consultas y derechos de protección de datos: arnau.sastre@sc-analytics.io.",
            "Arnau Sastre Conde, sota la marca SC-Analytics. Contacte per a consultes i drets de protecció de dades: arnau.sastre@sc-analytics.io.",
            "Arnau Sastre Conde, operating as SC-Analytics. Data protection enquiries and rights: arnau.sastre@sc-analytics.io.",
          ),
        ],
        [
          tr(
            "Cuando nos contactas",
            "Quan ens contactes",
            "When you contact us",
          ),
          tr(
            "Recogemos nombre, email, empresa opcional, mensaje, idioma y página de origen para responder a tu consulta y valorar una posible colaboración. La base es atender tu solicitud y las medidas previas a una posible contratación. No utilizamos el formulario para suscribirte a publicidad. Evita enviar datos sensibles o confidenciales innecesarios.",
            "Recollim nom, email, empresa opcional, missatge, idioma i pàgina d’origen per respondre la consulta i valorar una col·laboració. La base és atendre la sol·licitud i les mesures prèvies a una possible contractació. No et subscrivim a publicitat. Evita dades sensibles o confidencials innecessàries.",
            "We collect name, email, optional company, message, language and originating page to answer your enquiry and assess a collaboration. Processing serves your request and possible pre-contractual steps. The form does not subscribe you to marketing. Avoid unnecessary sensitive or confidential information.",
          ),
        ],
        [
          tr(
            "Servicios que intervienen",
            "Serveis que intervenen",
            "Services involved",
          ),
          tr(
            "La web se aloja en Vercel. Las consultas se guardan en un CRM sobre Supabase y se notifican por email mediante el proveedor SMTP configurado. Si reservas una llamada, Calendly tratará los datos que facilites bajo su propia política. Estos proveedores pueden implicar transferencias internacionales, sujetas a sus condiciones de protección de datos.",
            "El web s’allotja a Vercel. Les consultes es desen en un CRM sobre Supabase i es notifiquen per email amb el proveïdor SMTP configurat. Si reserves una trucada, Calendly tractarà les dades sota la seva política. Els proveïdors poden implicar transferències internacionals segons les seves condicions.",
            "The website is hosted on Vercel. Enquiries are stored in a Supabase-backed CRM and notified by the configured SMTP provider. If you book a call, Calendly processes the information you provide under its own policy. Providers may involve international transfers under their data protection terms.",
          ),
        ],
        [
          tr(
            "Analítica y cookies",
            "Analítica i cookies",
            "Analytics and cookies",
          ),
          tr(
            "Google Analytics se carga únicamente si aceptas la analítica. Puede utilizar cookies _ga y _ga_* para medir visitas e interacción. La preferencia se guarda en tu navegador; puedes cambiarla desde el pie de página. El formulario guarda temporalmente en la sesión la página de origen para contextualizar la consulta. No enviamos tu nombre, email ni mensaje a Google Analytics.",
            "Google Analytics només es carrega si acceptes l’analítica. Pot fer servir cookies _ga i _ga_* per mesurar visites i interacció. La preferència es desa al navegador i es pot canviar al peu de pàgina. El formulari desa temporalment la pàgina d’origen per contextualitzar la consulta. No enviem nom, email ni missatge a Google Analytics.",
            "Google Analytics loads only when you accept analytics. It may use _ga and _ga_* cookies to measure visits and interaction. Your preference is saved in your browser and can be changed in the footer. The form temporarily stores the originating page in the session to contextualize enquiries. Names, emails and messages are not sent to Google Analytics.",
          ),
        ],
        [
          tr(
            "Conservación y derechos",
            "Conservació i drets",
            "Retention and rights",
          ),
          tr(
            "Conservamos las consultas mientras sea necesario para gestionarlas y, si hay relación contractual, para cumplir las obligaciones aplicables. Puedes solicitar acceso, rectificación, supresión, oposición, limitación o portabilidad en el email de contacto. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (aepd.es).",
            "Conservem les consultes mentre calgui gestionar-les i, si hi ha relació contractual, per complir les obligacions aplicables. Pots sol·licitar accés, rectificació, supressió, oposició, limitació o portabilitat al correu de contacte. Pots reclamar davant l’Agència Espanyola de Protecció de Dades (aepd.es).",
            "We retain enquiries as needed to handle them and, where a contractual relationship exists, meet applicable obligations. You may request access, correction, deletion, objection, restriction or portability via the contact email. You can also complain to Spain’s data protection authority (aepd.es).",
          ),
        ],
      ];
  return (
    <main>
      <Hero
        label="SC-ANALYTICS"
        title={
          (legal
            ? tr("Información legal", "Informació legal", "Legal information")
            : tr(
                "Privacidad y cookies",
                "Privacitat i cookies",
                "Privacy and cookies",
              ))[lang]
        }
        body={
          tr(
            "Información sobre esta web y cómo gestionamos las consultas.",
            "Informació sobre aquest web i com gestionem les consultes.",
            "Information about this website and how we handle enquiries.",
          )[lang]
        }
      />
      <div className="site-container section-space max-w-3xl">
        {sections.map(([title, body], i) => (
          <section key={i} className="mb-10">
            <h2>{title[lang]}</h2>
            <p className="mt-4 leading-8 text-slate-600">{body[lang]}</p>
          </section>
        ))}
        <a className="underline" href="mailto:arnau.sastre@sc-analytics.io">
          arnau.sastre@sc-analytics.io
        </a>
      </div>
    </main>
  );
}
