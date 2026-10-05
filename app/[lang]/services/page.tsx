"use client";
import Link from "@/components/SiteLink";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import {
  Hero,
  Heading,
  ContactCTA,
  Method,
} from "@/components/CommercialPrimitives";
import { doors, serviceCatalog, tr } from "@/lib/commercial-content";
export default function Services() {
  const { lang } = useSiteLanguage();
  return (
    <main>
      <Hero
        label={tr("SERVICIOS", "SERVEIS", "SERVICES")[lang]}
        title={
          tr(
            "La especialidad adecuada para la decisión que importa.",
            "L’especialitat adequada per a la decisió que importa.",
            "The right expertise for the decision that matters.",
          )[lang]
        }
        body={
          tr(
            "Previsión, optimización, automatización y analítica. Combinamos las herramientas necesarias alrededor del problema, sin imponer una tecnología de partida.",
            "Previsió, optimització, automatització i analítica. Combinem les eines necessàries al voltant del problema, sense imposar una tecnologia de partida.",
            "Forecasting, optimization, automation and analytics. Combine the tools the problem needs without imposing a technology upfront.",
          )[lang]
        }
      />
      {doors.map((door, index) => (
        <section key={door.slug} className="border-b border-[#C6CFD6]">
          <div className="site-container section-space">
            <Heading
              label={`0${index + 1}`}
              title={door.title[lang]}
              body={door.body[lang]}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {serviceCatalog
                .filter((s) => s.group === index)
                .map((service) => (
                  <article key={service.slug} className="commercial-card">
                    <h3 className="text-xl font-semibold">
                      {service.title[lang]}
                    </h3>
                    <p className="mt-4 leading-7 text-slate-600">
                      {service.problem[lang]}
                    </p>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#496C8A]">
                      {
                        tr("QUÉ ENTREGAMOS", "QUÈ LLIUREM", "WHAT WE DELIVER")[
                          lang
                        ]
                      }
                    </p>
                    <p className="mt-2 leading-7">
                      {service.deliverable[lang]}
                    </p>
                    <Link
                      className="mt-6 inline-block text-sm font-semibold"
                      href={`/services/${service.slug}`}
                    >
                      {
                        tr(
                          "Ver enfoque y alcance",
                          "Veure enfocament i abast",
                          "View approach and scope",
                        )[lang]
                      }{" "}
                      →
                    </Link>
                  </article>
                ))}
            </div>
          </div>
        </section>
      ))}
      <Method />
      <ContactCTA />
    </main>
  );
}
