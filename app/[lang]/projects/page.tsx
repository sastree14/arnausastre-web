import { getAllProjects } from '@/lib/projects'
import ProjectsPageClient from '@/components/ProjectsPageClient'

export default function ProjectsPage() {
  const projects = getAllProjects()
  return <ProjectsPageClient projects={projects} />
}
