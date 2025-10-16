import { FilterBar } from "@/components/FilterBar";
import { ProjectGallery } from "@/components/ProjectGallery";
import { getAllProjects } from "@/lib/projects";

export default async function Home() {
  const projects = await getAllProjects();
  return (
    <div className="container">
      <section className="pt-12 pb-10">
        <div className="max-w-4xl">
          <h1 className="title-48 mb-4">Built with Arkiv</h1>
          <p className="lead mt-3">Showcase of applications using Arkiv and modern web technologies.</p>
        </div>
      </section>

      <FilterBar />
      <section id="projects" className="mt-8">
        <ProjectGallery initial={projects} />
      </section>
    </div>
  )
}
