import Link from "next/link";
import Image from "next/image";

export interface ProjectCardProps {
  project: any
}
export function ProjectCard({ project }: ProjectCardProps){
  return (
    <article className="card overflow-hidden transition-all duration-200 hover:shadow-lg" style={{border: '1px solid var(--border)'}}>
      <Link href={`/${project.slug}`}>
        <div className="aspect-[16/10] relative" style={{backgroundColor: 'white'}}>
          <Image src={project.screens?.[0] || "/images/placeholder.webp"} alt={project.title} fill className="object-cover object-top" />
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {project.category?.slice(0,2).map((c:string)=>(<span key={c} className="badge">{c}</span>))}
          {project.status && <span className="badge">{project.status}</span>}
          {project.openSource && <span className="badge">open-source</span>}
        </div>
        <h3 className="title-20 mb-2"><Link href={`/${project.slug}`} style={{color: 'var(--text)'}}>{project.title}</Link></h3>
        <p className="body-14 mb-4" style={{color: 'var(--muted)'}}>{project.tagline}</p>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {(['annotations','btl','query','pow','storage'] as const).filter((k)=>project.usesArkiv?.[k]).map((feature) => (
            <span key={feature} className="badge">arkiv:{feature}</span>
          ))}
          {project.chains?.map((ch:string)=>(<span key={ch} className="badge">{ch}</span>))}
        </div>
        <div className="flex gap-3">
          {project.liveUrl && <a className="px-4 py-2 rounded-lg hover:opacity-90 transition-opacity" style={{backgroundColor: 'var(--primary)', color: 'white'}} href={project.liveUrl} target="_blank">Live</a>}
          {project.repoUrl && <a className="px-4 py-2 rounded-lg border transition-colors hover:opacity-80" style={{borderColor: 'var(--border)', color: 'var(--text)'}} href={project.repoUrl} target="_blank">Code</a>}
        </div>
      </div>
    </article>
  )
}
