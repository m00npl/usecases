import { getProjectBySlug, getAllSlugs } from "@/lib/projects";
import Image from "next/image";
import { CodeBlock } from "@/components/CodeBlock";
import { ProjectImages } from "@/components/ProjectImages";
import Link from "next/link";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map(slug => ({ slug }));
}

export default async function ProjectDetail({ params }: { params: { slug: string }}) {
  const project = await getProjectBySlug(params.slug);
  if (!project) {
    return <div className='container py-10'>Not found</div>
  }
  return (
    <div className="container py-10">
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl font-semibold">{project.title}</h1>
            <p className="text-slate-600 dark:text-neutral-300 mt-1">{project.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {project.category.map((c) => (<span key={c} className="badge">{c}</span>))}
              {project.status && <span className="badge">{project.status}</span>}
              {project.openSource && <span className="badge">open-source</span>}
              {project.chains?.map(ch => <span key={ch} className="badge">{ch}</span>)}
            </div>
          </div>
          <div className="flex gap-3">
            {project.liveUrl && <a className="px-4 py-2 rounded-lg bg-primary text-white dark:text-neutral-900 hover:opacity-90" href={project.liveUrl} target="_blank">Live demo</a>}
            {project.repoUrl && <a className="px-4 py-2 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-surface/60 text-slate-700 dark:text-neutral-200" href={project.repoUrl} target="_blank">View code</a>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 card p-6">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-slate-600 dark:text-neutral-300 mt-2 whitespace-pre-wrap">{project.description || project.golemDetails}</p>

          {project.sampleCode && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">How it uses Golem DB</h3>
              <CodeBlock lang={project.sampleCode.lang} code={project.sampleCode.code} />
            </div>
          )}

          {project.screens?.length ? (
            <div className="mt-6">
              <ProjectImages images={project.screens} projectTitle={project.title} />
            </div>
          ) : null}
        </div>

        <aside className="card p-6 space-y-5">
          <section>
            <h3 className="font-semibold">Golem DB Features</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['annotations','btl','query','pow','storage'] as const).filter((k)=>project.usesGolemDb?.[k]).map((feature) => (
                <span key={feature} className="badge">arkiv:{feature}</span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-semibold">Tech stack</h3>
            <ul className="mt-2 text-sm text-slate-600 dark:text-neutral-300 space-y-1">
              <li><span className="badge mr-2">Frontend</span>{project.techStack.frontend.join(", ")}</li>
              <li><span className="badge mr-2">Backend</span>{project.techStack.backend.join(", ")}</li>
              {project.techStack.identity?.length ? (<li><span className="badge mr-2">Identity</span>{project.techStack.identity.join(", ")}</li>) : null}
              {project.techStack.infra?.length ? (<li><span className="badge mr-2">Infra</span>{project.techStack.infra.join(", ")}</li>) : null}
            </ul>
          </section>

          {project.metrics && (
            <section>
              <h3 className="font-semibold">Metrics</h3>
              <ul className="mt-2 text-sm text-slate-600 dark:text-neutral-300 grid grid-cols-2 gap-2">
                {project.metrics.users && <li className="card p-3 text-center"><div className="text-xl font-semibold">{project.metrics.users}</div><div className="text-xs text-slate-500 dark:text-neutral-400">users</div></li>}
                {project.metrics.reqPerDay && <li className="card p-3 text-center"><div className="text-xl font-semibold">{project.metrics.reqPerDay}</div><div className="text-xs text-slate-500 dark:text-neutral-400">req/day</div></li>}
                {project.metrics.p95ms && <li className="card p-3 text-center"><div className="text-xl font-semibold">{project.metrics.p95ms}ms</div><div className="text-xs text-slate-500 dark:text-neutral-400">p95</div></li>}
                {project.metrics.storageMB && <li className="card p-3 text-center"><div className="text-xl font-semibold">{project.metrics.storageMB}MB</div><div className="text-xs text-slate-500 dark:text-neutral-400">storage</div></li>}
              </ul>
            </section>
          )}

          <section className="text-sm text-slate-500 dark:text-neutral-400">
            <p>Built with <Link href="/" className="underline">Golem DB</Link>. Submit improvements via PRs or the submit form.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
