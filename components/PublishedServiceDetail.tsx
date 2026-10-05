import Link from "@/components/SiteLink";
import { ContactCTA } from "@/components/CommercialPrimitives";
import type { PublishedService } from "@/lib/public-services";
export default function PublishedServiceDetail({
  page,
}: {
  page: PublishedService;
}) {
  return (
    <main>
      <section className="public-hero">
        <div className="site-container py-16 md:py-24">
          <p className="eyebrow">SC-ANALYTICS · SERVICES</p>
          <h1>{page.h1}</h1>
          <p className="mt-6 max-w-[65ch] whitespace-pre-wrap text-lg leading-8 text-[#DCE6EF]">
            {page.intro}
          </p>
        </div>
      </section>
      <section className="site-container section-space">
        {page.sections?.map((section, i) => (
          <article
            key={i}
            className="mb-10 grid gap-6 border-b border-[#C6CFD6] pb-10 md:grid-cols-[1fr_1.5fr]"
          >
            <h2>{section.heading}</h2>
            <p className="max-w-[65ch] whitespace-pre-wrap leading-8 text-slate-600">
              {section.body}
            </p>
          </article>
        ))}
        <Link className="text-sm font-semibold" href="/services">
          Explore all services →
        </Link>
      </section>
      <ContactCTA />
    </main>
  );
}
