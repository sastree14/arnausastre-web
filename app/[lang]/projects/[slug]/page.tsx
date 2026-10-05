import { pageMetadata } from "@/lib/site-metadata";
import { LANGUAGES } from "@/lib/site-routing";
import { publicProject } from "@/lib/project-public-copy";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects";
import ProjectOverviewCommercial from "@/components/projects/ProjectOverviewCommercial";
import { getWebsiteProjectGoldStandard } from "@/lib/website-project-gold-standard";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const variants = Object.fromEntries(
    LANGUAGES.map((lang) => [lang, publicProject(project, lang)]),
  );
  return pageMetadata(
    `/projects/${slug}`,
    {
      es: variants.es.headline,
      ca: variants.ca.headline,
      en: variants.en.headline,
    },
    {
      es: variants.es.description,
      ca: variants.ca.description,
      en: variants.en.description,
    },
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const goldStandard = getWebsiteProjectGoldStandard(slug);
  return (
    <ProjectOverviewCommercial project={project} goldStandard={goldStandard} />
  );
}
