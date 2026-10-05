"use client";
import { useSiteLanguage } from "@/components/SiteLanguageProvider";
import { Hero, Heading, ContactCTA } from "@/components/CommercialPrimitives";
import { tr } from "@/lib/commercial-content";
export default function Partner() {
  const { lang } = useSiteLanguage();
  return (
    <main>
      <Hero
        label="PARTNER DATA & AI"
        title={
          tr(
            "Capacidad especializada, conectada a vuestro equipo.",
            "Capacitat especialitzada, connectada al vostre equip.",
            "Specialist capacity connected to your team.",
          )[lang]
        }
        body={
          tr(
            "Para empresas con necesidades recurrentes de datos, modelización y automatización. Una colaboración con prioridades visibles, responsables identificados y entregas que podéis revisar.",
            "Per a empreses amb necessitats recurrents de dades, modelització i automatització. Una col·laboració amb prioritats visibles, responsables identificats i lliuraments revisables.",
            "For businesses with recurring data, modelling and automation needs. A collaboration with visible priorities, named owners and deliverables you can review.",
          )[lang]
        }
      />
      <section className="site-container section-space">
        <Heading
          title={
            tr(
              "Cómo se organiza la colaboración.",
              "Com s’organitza la col·laboració.",
              "How the collaboration works.",
            )[lang]
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {[
            [
              tr(
                "01 · Acordar el marco",
                "01 · Acordar el marc",
                "01 · Agree the framework",
              ),
              tr(
                "Definimos objetivos, capacidad disponible, accesos, interlocutores y alcance. Revisamos qué sistemas existen y qué decisiones necesitan apoyo.",
                "Definim objectius, capacitat disponible, accessos, interlocutors i abast. Revisem els sistemes existents i les decisions que necessiten suport.",
                "Define objectives, available capacity, access, contacts and scope. Review existing systems and decisions needing support.",
              ),
            ],
            [
              tr(
                "02 · Priorizar juntos",
                "02 · Prioritzar junts",
                "02 · Prioritize together",
              ),
              tr(
                "Mantenemos una cartera de necesidades ordenada por valor, urgencia y viabilidad. Vuestro responsable de negocio valida las prioridades; nosotros contrastamos esfuerzo y dependencias.",
                "Mantenim una cartera de necessitats ordenada per valor, urgència i viabilitat. El vostre responsable de negoci valida prioritats; nosaltres contrastem esforç i dependències.",
                "Maintain a backlog ordered by value, urgency and feasibility. Your business owner validates priorities; we assess effort and dependencies.",
              ),
            ],
            [
              tr(
                "03 · Entregar y revisar",
                "03 · Lliurar i revisar",
                "03 · Deliver and review",
              ),
              tr(
                "Cada tarea tiene objetivo, responsable y criterio de aceptación. Revisamos resultados y transferimos documentación, código o análisis según el alcance acordado.",
                "Cada tasca té objectiu, responsable i criteri d’acceptació. Revisem resultats i transferim documentació, codi o anàlisi segons l’abast acordat.",
                "Each task has an objective, owner and acceptance criteria. Review outcomes and hand over documentation, code or analysis within agreed scope.",
              ),
            ],
            [
              tr(
                "04 · Ajustar el siguiente ciclo",
                "04 · Ajustar el cicle següent",
                "04 · Adjust the next cycle",
              ),
              tr(
                "Revisamos uso, incidencias y nuevas necesidades. La cadencia y los canales se acuerdan con vuestro equipo, con visibilidad sobre lo pendiente y lo entregado.",
                "Revisem ús, incidències i noves necessitats. Acordem cadència i canals amb el vostre equip, amb visibilitat del que queda pendent i del que s’ha lliurat.",
                "Review usage, issues and new needs. Agree cadence and channels with your team, keeping pending and delivered work visible.",
              ),
            ],
          ].map(([title, body], i) => (
            <article key={i} className="commercial-card">
              <h3 className="text-xl font-semibold">{title[lang]}</h3>
              <p className="mt-4 leading-7 text-slate-600">{body[lang]}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-y border-[#C6CFD6] bg-[#F4F1EA]">
        <div className="site-container section-space grid gap-10 md:grid-cols-2">
          <div>
            <h2>
              {
                tr(
                  "Qué puede incluir",
                  "Què pot incloure",
                  "What can be included",
                )[lang]
              }
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              {
                tr(
                  "Diagnóstico y asesoramiento técnico, análisis y modelos, integración de datos, automatizaciones, documentación y seguimiento de sistemas acordados. Cada propuesta concreta las entregas, dedicación y responsabilidades.",
                  "Diagnòstic i assessorament tècnic, anàlisi i models, integració de dades, automatitzacions, documentació i seguiment dels sistemes acordats. Cada proposta concreta lliuraments, dedicació i responsabilitats.",
                  "Assessment and technical advice, analysis and models, data integration, automation, documentation and monitoring of agreed systems. Each proposal specifies deliverables, capacity and ownership.",
                )[lang]
              }
            </p>
          </div>
          <div>
            <h2>
              {
                tr(
                  "Qué se acuerda aparte",
                  "Què s’acorda a part",
                  "What needs a separate agreement",
                )[lang]
              }
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              {
                tr(
                  "Licencias y servicios de terceros, infraestructura, disponibilidad fuera del horario acordado y nuevos desarrollos fuera del alcance. No se presupone soporte 24/7 ni un volumen ilimitado de tareas.",
                  "Llicències i serveis de tercers, infraestructura, disponibilitat fora de l’horari acordat i desenvolupaments fora de l’abast. No es pressuposa suport 24/7 ni tasques il·limitades.",
                  "Third-party licenses and services, infrastructure, availability outside agreed hours and development beyond scope. The agreement does not assume 24/7 support or unlimited tasks.",
                )[lang]
              }
            </p>
          </div>
        </div>
      </section>
      <ContactCTA />
    </main>
  );
}
