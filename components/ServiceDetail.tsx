"use client";
import Link from "@/components/SiteLink";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import { Hero, Heading, ContactCTA } from "@/components/CommercialPrimitives";
import { serviceCatalog, method, tr } from "@/lib/commercial-content";
export default function ServiceDetail({ slug }: { slug: string }) {
  const { lang } = useSiteLanguage();
  const service = serviceCatalog.find((s) => s.slug === slug)!;
  return (
    <main>
      <Hero
        label={
          tr(
            "SERVICIOS · ENFOQUE Y ALCANCE",
            "SERVEIS · ENFOCAMENT I ABAST",
            "SERVICES · APPROACH AND SCOPE",
          )[lang]
        }
        title={service.title[lang]}
        body={service.problem[lang]}
      >
        <Link href="/contact" className="button-light">
          {
            tr("Valorar mi caso", "Valorar el meu cas", "Discuss my situation")[
              lang
            ]
          }{" "}
          →
        </Link>
      </Hero>
      <section className="site-container section-space">
        <Heading
          title={
            tr(
              "Una entrega ligada a una decisión.",
              "Un lliurable lligat a una decisió.",
              "A deliverable tied to a decision.",
            )[lang]
          }
          body={service.deliverable[lang]}
        />
        <div className="grid gap-8 md:grid-cols-2">
          <article className="commercial-card">
            <h3 className="text-xl font-semibold">
              {
                tr(
                  "Qué necesitamos entender",
                  "Què hem d’entendre",
                  "What we need to understand",
                )[lang]
              }
            </h3>
            <p className="mt-4 leading-7 text-slate-600">
              {
                tr(
                  "La decisión actual, las personas que la toman, los datos disponibles y las restricciones del negocio. Revisamos acceso, calidad y representatividad antes de acordar el desarrollo.",
                  "La decisió actual, les persones que la prenen, les dades disponibles i les restriccions del negoci. Revisem accés, qualitat i representativitat abans d’acordar el desenvolupament.",
                  "The current decision, its owners, available data and business constraints. Review access, quality and representativeness before agreeing development.",
                )[lang]
              }
            </p>
          </article>
          <article className="commercial-card">
            <h3 className="text-xl font-semibold">
              {
                tr(
                  "Cómo decidimos si funciona",
                  "Com decidim si funciona",
                  "How we decide whether it works",
                )[lang]
              }
            </h3>
            <p className="mt-4 leading-7 text-slate-600">
              {
                tr(
                  "Acordamos una referencia de comparación, criterios de aceptación y condiciones de uso. Una mejora técnica solo es útil si puede incorporarse a la operación y revisarse cuando cambie el contexto.",
                  "Acordem una referència de comparació, criteris d’acceptació i condicions d’ús. Una millora tècnica només és útil si s’incorpora a l’operació i es revisa quan canvia el context.",
                  "Agree a comparison baseline, acceptance criteria and usage conditions. A technical improvement is useful when it fits the operation and can be reviewed as context changes.",
                )[lang]
              }
            </p>
          </article>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {method.map((m, i) => (
            <div key={i}>
              <p className="eyebrow text-[#496C8A]">0{i + 1}</p>
              <h3 className="mt-3 font-semibold">{m.title[lang]}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {m.output[lang]}
              </p>
            </div>
          ))}
        </div>
        <nav className="mt-10 flex flex-wrap gap-6 border-t border-[#C6CFD6] pt-6">
          <Link className="text-sm font-semibold" href="/projects">
            {
              tr(
                "Inspeccionar proyectos demostrativos",
                "Inspeccionar projectes demostratius",
                "Inspect demonstration projects",
              )[lang]
            }{" "}
            →
          </Link>
          <Link className="text-sm font-semibold" href="/services">
            {
              tr("Todos los servicios", "Tots els serveis", "All services")[
                lang
              ]
            }{" "}
            →
          </Link>
        </nav>
      </section>
      <ContactCTA />
    </main>
  );
}
