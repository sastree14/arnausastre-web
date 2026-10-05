"use client";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import { Hero, Heading, ContactCTA } from "@/components/CommercialPrimitives";
import { tr } from "@/lib/commercial-content";
export default function About() {
  const { lang } = useSiteLanguage();
  return (
    <main>
      <Hero
        label={tr("QUIÉNES SOMOS", "QUI SOM", "WHO WE ARE")[lang]}
        title={
          tr(
            "Rigor técnico. Responsabilidad sobre lo que construimos.",
            "Rigor tècnic. Responsabilitat sobre allò que construïm.",
            "Technical rigor. Responsibility for what we build.",
          )[lang]
        }
        body={
          tr(
            "SC-Analytics combina datos, modelización matemática e inteligencia artificial para abordar problemas de negocio. Trabajamos con una idea sencilla: primero entender, después decidir qué merece la pena construir.",
            "SC-Analytics combina dades, modelització matemàtica i intel·ligència artificial per abordar problemes de negoci. Primer entendre, després decidir què val la pena construir.",
            "SC-Analytics combines data, mathematical modelling and artificial intelligence to address business problems. First understand, then decide what is worth building.",
          )[lang]
        }
      />
      <section className="site-container section-space">
        <Heading
          label={
            tr(
              "PERSONAS Y RESPONSABILIDADES",
              "PERSONES I RESPONSABILITATS",
              "PEOPLE AND RESPONSIBILITY",
            )[lang]
          }
          title={
            tr(
              "Una interlocución clara desde el primer día.",
              "Una interlocució clara des del primer dia.",
              "Clear ownership from day one.",
            )[lang]
          }
        />
        <div className="grid gap-10 lg:grid-cols-2">
          <article className="commercial-card">
            <p className="eyebrow text-[#496C8A]">SC-ANALYTICS</p>
            <h3 className="mt-4 text-3xl font-[family-name:var(--font-playfair)]">
              Arnau Sastre Conde
            </h3>
            <p className="mt-3 font-semibold">
              {
                tr(
                  "Fundador · Datos y modelización matemática",
                  "Fundador · Dades i modelització matemàtica",
                  "Founder · Data and mathematical modelling",
                )[lang]
              }
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              {
                tr(
                  "Formación en Matemáticas y Estadística Aplicada en la Universitat Autònoma de Barcelona. El enfoque de trabajo conecta el análisis técnico con la decisión empresarial y sus restricciones.",
                  "Formació en Matemàtiques i Estadística Aplicada a la Universitat Autònoma de Barcelona. L’enfocament connecta l’anàlisi tècnica amb la decisió empresarial i les restriccions.",
                  "Background in Mathematics and Applied Statistics at Universitat Autònoma de Barcelona. The approach connects technical analysis with business decisions and their constraints.",
                )[lang]
              }
            </p>
            <a
              className="mt-6 inline-block text-sm font-semibold underline underline-offset-4"
              href="https://linkedin.com/in/arnausastre"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
          </article>
          <div>
            <h3 className="text-xl font-semibold">
              {
                tr(
                  "Especialidades alrededor del problema",
                  "Especialitats al voltant del problema",
                  "Specialists around the problem",
                )[lang]
              }
            </h3>
            <p className="mt-4 leading-7 text-slate-600">
              {
                tr(
                  "Articulamos la colaboración alrededor de cuatro áreas: datos y modelización, ingeniería e integración, automatización e IA y sistemas de decisión. En cada propuesta identificamos quién participa, qué responsabilidad asume y cómo se coordina con vuestro equipo.",
                  "Articulem la col·laboració en quatre àrees: dades i modelització, enginyeria i integració, automatització i IA i sistemes de decisió. A cada proposta identifiquem qui participa, quina responsabilitat assumeix i com es coordina amb el vostre equip.",
                  "Collaboration spans four areas: data and modelling, engineering and integration, automation and AI, and decision systems. Each proposal identifies participants, responsibilities and coordination with your team.",
                )[lang]
              }
            </p>
            <p className="mt-5 leading-7 text-slate-600">
              {
                tr(
                  "La complejidad de la solución debe responder al problema. Si un análisis sencillo o una mejora de proceso es suficiente, ese es el punto de partida.",
                  "La complexitat de la solució ha de respondre al problema. Si una anàlisi senzilla o una millora de procés és suficient, aquest és el punt de partida.",
                  "Solution complexity should follow the problem. If a simple analysis or process improvement is sufficient, that is the starting point.",
                )[lang]
              }
            </p>
          </div>
        </div>
      </section>
      <section className="border-y border-[#C6CFD6] bg-[#F4F1EA]">
        <div className="site-container section-space">
          <Heading
            title={
              tr(
                "Principios que se ven en las entregas.",
                "Principis que es veuen als lliuraments.",
                "Principles visible in the deliverables.",
              )[lang]
            }
          />
          <div className="grid gap-6 md:grid-cols-2">
            {[
              [
                tr(
                  "Valor antes que tecnología",
                  "Valor abans que tecnologia",
                  "Value before technology",
                ),
                tr(
                  "Acordar el objetivo, la referencia y los criterios de éxito antes de elegir herramientas.",
                  "Acordar l’objectiu, la referència i els criteris d’èxit abans de triar eines.",
                  "Agree the objective, baseline and success criteria before choosing tools.",
                ),
              ],
              [
                tr(
                  "Evidencia antes que promesas",
                  "Evidència abans que promeses",
                  "Evidence before promises",
                ),
                tr(
                  "Separar datos observados, supuestos y escenarios. Mostrar límites y resultados reproducibles.",
                  "Separar dades observades, supòsits i escenaris. Mostrar límits i resultats reproduïbles.",
                  "Separate observations, assumptions and scenarios. Show limits and reproducible results.",
                ),
              ],
              [
                tr(
                  "Integración y transferencia",
                  "Integració i transferència",
                  "Integration and handover",
                ),
                tr(
                  "Documentar lo que se entrega y quién lo opera. Evitar que el conocimiento se quede fuera del equipo.",
                  "Documentar què es lliura i qui ho opera. Evitar que el coneixement quedi fora de l’equip.",
                  "Document the deliverable and its operator. Keep knowledge accessible to the team.",
                ),
              ],
              [
                tr(
                  "Responsabilidad y control",
                  "Responsabilitat i control",
                  "Responsibility and control",
                ),
                tr(
                  "Hacer explícitos los accesos, la supervisión, los puntos de aprobación y el mantenimiento acordado.",
                  "Fer explícits els accessos, la supervisió, els punts d’aprovació i el manteniment acordat.",
                  "Make access, oversight, approval checkpoints and agreed maintenance explicit.",
                ),
              ],
            ].map(([title, body], i) => (
              <article key={i} className="commercial-card">
                <h3 className="text-xl font-semibold">{title[lang]}</h3>
                <p className="mt-3 leading-7 text-slate-600">{body[lang]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ContactCTA />
    </main>
  );
}
