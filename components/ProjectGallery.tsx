"use client"
import { useEffect, useMemo, useState } from "react"
import { ProjectCard } from "./ProjectCard"

export function ProjectGallery({ initial }: { initial: any[] }){
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string|undefined>(undefined)
  const [features, setFeatures] = useState<string[]>([])

  const filtered = useMemo(()=>{
    return initial.filter(p=>{
      const matchesQ = query ? (p.title.toLowerCase().includes(query.toLowerCase()) || p.tagline.toLowerCase().includes(query.toLowerCase())) : true
      const matchesC = category ? p.category?.includes(category) : true
      const matchesF = features.length ? features.every(f=>p.usesArkiv?.[f]) : true
      return matchesQ && matchesC && matchesF
    })
  }, [initial, query, category, features])

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-5 px-5 py-4 backdrop-blur border-y border-border/70" style={{backgroundColor: '#c4c4c4'}}>
        <div className="flex flex-wrap gap-3 items-center">
          <input className="min-w-[220px] flex-1 rounded-lg border px-3 py-2" placeholder="Search projects" style={{backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)'}}
            value={query} onChange={e=>setQuery(e.target.value)} />
          <div className="flex gap-2 flex-wrap items-center text-sm">
            {["annotations","btl","query","pow","storage"].map(f=>(
              <label key={f} className="badge cursor-pointer" style={{backgroundColor: features.includes(f) ? 'var(--border)' : 'var(--surface)'}}>
                <input type="checkbox" className="mr-1 accent-emerald-500" checked={features.includes(f)} onChange={(e)=>{
                  setFeatures(prev => e.target.checked ? [...prev, f] : prev.filter(x=>x!==f))
                }} /> {f}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {filtered.map(p => <ProjectCard key={p.slug} project={p} />)}
        {!filtered.length && <div className="text-neutral-400">No results. Try different filters.</div>}
      </div>
    </div>
  )
}
