import { notFound, redirect } from "next/navigation";
import ServiceDetail from "@/components/ServiceDetail";
import PublishedServiceDetail from "@/components/PublishedServiceDetail";
import { serviceCatalog } from "@/lib/commercial-content";
import { pageMetadata } from "@/lib/site-metadata";
import { getPublishedService } from "@/lib/public-services";
import { SITE_ORIGIN } from "@/lib/site-routing";
type Props = { params: Promise<{ slug: string; lang: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = serviceCatalog.find((s) => s.slug === slug);
  if (service)
    return pageMetadata(`/services/${slug}`, service.title, service.problem);
  const row = await getPublishedService(slug);
  if (!row) return {};
  return {
    title: row.title,
    description: row.meta_description,
    alternates: {
      canonical: `/en/services/${slug}`,
      languages: { en: `/en/services/${slug}` },
    },
    openGraph: {
      title: row.title,
      description: row.meta_description,
      url: `${SITE_ORIGIN}/en/services/${slug}`,
      locale: "en_GB",
      images: [{ url: "/api/og?lang=en", width: 1200, height: 630 }],
    },
  };
}
export default async function Page({ params }: Props) {
  const { slug, lang } = await params;
  if (serviceCatalog.some((s) => s.slug === slug))
    return <ServiceDetail slug={slug} />;
  const row = await getPublishedService(slug);
  if (!row) notFound();
  // Existing CMS service entries have English content. Do not index it as Spanish/Catalan.
  if (lang !== "en") redirect(`/en/services/${slug}`);
  return <PublishedServiceDetail page={row} />;
}
