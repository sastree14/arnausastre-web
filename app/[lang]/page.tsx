"use client";
import Link from "@/components/SiteLink";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import {
  Hero,
  Heading,
  ContactCTA,
  Method,
} from "@/components/CommercialPrimitives";
import { common, doors, tr } from "@/lib/commercial-content";
export default function Home() {
  const { lang } = useSiteLanguage();
  return (
    <main>
      <Hero
        label="SC-ANALYTICS · DATA & AI"
        title={common.claim[lang]}
        body={common.intro[lang]}
      >
        <div className="border-l border-[#496C8A] pl-6">
          <p className="text-xl leading-8 font-[family-name:var(--font-playfair)]">
            {
              tr(
                "Comprender antes de construir.",
                "Comprendre abans de construir.",
                "Understand before building.",
              )[lang]
            }
          </p>
          <Link href="/contact" className="button-light mt-6">
            {common.talk[lang]} →
          </Link>
          <p className="mt-4 text-sm leading-6 text-[#A8BACB]">
            {common.noCommitment[lang]}
          </p>
        </div>
      </Hero>
      <section className="site-container section-space">
        <Heading
          label={
            tr("DÓNDE PODEMOS AYUDAR", "ON PODEM AJUDAR", "WHERE WE CAN HELP")[
              lang
            ]
          }
          title={
            tr(
              "Partimos de lo que necesita mejorar.",
              "Partim d’allò que ha de millorar.",
              "Start with what needs to improve.",
            )[lang]
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {doors.map((item, i) => (
            <Link
              className="commercial-card group"
              key={item.slug}
              href={`/services/${item.slug}`}
            >
              <p className="eyebrow text-[#496C8A]">0{i + 1}</p>
              <h3 className="mt-5 text-2xl font-[family-name:var(--font-playfair)]">
                {item.title[lang]}
              </h3>
              <p className="mt-3 max-w-[50ch] leading-7 text-slate-600">
                {item.body[lang]}
              </p>
              <p className="mt-6 text-sm font-semibold">
                {common.explore[lang]} <span aria-hidden>→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="border-y border-[#C6CFD6] bg-[#F4F1EA]">
        <div className="site-container section-space">
          <Heading
            label={
              tr(
                "EVIDENCIA TÉCNICA",
                "EVIDÈNCIA TÈCNICA",
                "TECHNICAL EVIDENCE",
              )[lang]
            }
            title={
              tr(
                "Del problema al sistema: ejemplos que se pueden inspeccionar.",
                "Del problema al sistema: exemples que es poden inspeccionar.",
                "From problem to system: examples you can inspect.",
              )[lang]
            }
            body={common.evidence[lang]}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                "planning",
                tr(
                  "Anticipar la demanda",
                  "Anticipar la demanda",
                  "Anticipate demand",
                ),
                tr(
                  "Comparar previsiones por horizonte antes de utilizarlas para planificar.",
                  "Comparar previsions per horitzó abans d’utilitzar-les per planificar.",
                  "Compare forecasts by horizon before using them to plan.",
                ),
              ],
              [
                "ai_automation",
                tr(
                  "Automatizar con supervisión",
                  "Automatitzar amb supervisió",
                  "Automate with oversight",
                ),
                tr(
                  "Conectar tareas y herramientas manteniendo puntos de control.",
                  "Connectar tasques i eines mantenint punts de control.",
                  "Connect tasks and tools while retaining control checkpoints.",
                ),
              ],
              [
                "operations",
                tr(
                  "Asignar recursos con criterio",
                  "Assignar recursos amb criteri",
                  "Allocate resources with clarity",
                ),
                tr(
                  "Hacer explícitos los objetivos, las restricciones y los compromisos.",
                  "Fer explícits els objectius, les restriccions i els compromisos.",
                  "Make objectives, constraints and trade-offs explicit.",
                ),
              ],
            ].map(([area, title, body]) => (
              <Link
                key={area as string}
                href={`/projects?area=${area}`}
                className="commercial-card"
              >
                <p className="eyebrow text-[#496C8A]">
                  {tr("DEMOSTRACIÓN", "DEMOSTRACIÓ", "DEMONSTRATION")[lang]}
                </p>
                <h3 className="mt-4 text-xl font-semibold">
                  {(title as ReturnType<typeof tr>)[lang]}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {(body as ReturnType<typeof tr>)[lang]}
                </p>
                <p className="mt-6 text-sm font-semibold">
                  {
                    tr("Ver proyectos", "Veure projectes", "View projects")[
                      lang
                    ]
                  }{" "}
                  →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Method />
      <section className="border-t border-[#C6CFD6]">
        <div className="site-container section-space">
          <Heading
            label={tr("COLABORACIÓN", "COL·LABORACIÓ", "COLLABORATION")[lang]}
            title={
              tr(
                "Un primer paso acotado o capacidad especializada continua.",
                "Un primer pas delimitat o capacitat especialitzada contínua.",
                "A scoped first step or ongoing specialist capacity.",
              )[lang]
            }
          />
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">
                {
                  tr(
                    "Diagnóstico y proyecto",
                    "Diagnòstic i projecte",
                    "Assessment and project",
                  )[lang]
                }
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                {
                  tr(
                    "Aclaramos viabilidad, alcance y criterios de éxito. Si hay encaje, desarrollamos una solución con entregables y responsabilidades acordados.",
                    "Aclarim viabilitat, abast i criteris d’èxit. Si hi ha encaix, desenvolupem una solució amb lliurables i responsabilitats acordats.",
                    "Clarify feasibility, scope and success criteria. When there is a fit, build a solution with agreed deliverables and ownership.",
                  )[lang]
                }
              </p>
              <Link
                href="/services"
                className="mt-5 inline-block text-sm font-semibold"
              >
                {common.explore[lang]} →
              </Link>
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {
                  tr(
                    "Partner de datos e IA",
                    "Partner de dades i IA",
                    "Data and AI partner",
                  )[lang]
                }
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                {
                  tr(
                    "Trabajamos junto a tu equipo sobre prioridades recurrentes, con una cartera de trabajo visible y revisión de cada entrega.",
                    "Treballem amb el teu equip sobre prioritats recurrents, amb una cartera de feina visible i revisió de cada lliurament.",
                    "Work alongside your team on recurring priorities, with a visible backlog and review of each deliverable.",
                  )[lang]
                }
              </p>
              <Link
                href="/partner-analitico"
                className="mt-5 inline-block text-sm font-semibold"
              >
                {common.explore[lang]} →
              </Link>
            </div>
          </div>
          <nav className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-[#C6CFD6] pt-6 text-sm font-semibold">
            <Link href="/about">
              {
                tr(
                  "Quién está detrás",
                  "Qui hi ha al darrere",
                  "Who is behind the work",
                )[lang]
              }{" "}
              →
            </Link>
            <Link href="/knowledge">
              {
                tr(
                  "Leer nuestros análisis",
                  "Llegir les nostres anàlisis",
                  "Read our analysis",
                )[lang]
              }{" "}
              →
            </Link>
            <Link href="/projects">
              {
                tr(
                  "Explorar el portfolio",
                  "Explorar el portafolis",
                  "Explore the portfolio",
                )[lang]
              }{" "}
              →
            </Link>
          </nav>
        </div>
      </section>
      <ContactCTA />
    </main>
  );
}
