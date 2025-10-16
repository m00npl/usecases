import fs from "fs/promises"
import path from "path"
import { cache } from "./cache"

export interface Project {
  title: string
  slug: string
  tagline: string
  category: string[]
  status: "live"|"demo"|"wip"
  liveUrl?: string
  repoUrl?: string
  chains: string[]
  usesArkiv: Partial<Record<"annotations"|"btl"|"pow"|"query"|"storage", boolean>>
  golemDetails: string
  sampleCode?: { lang: "ts"|"js"|"sql"|"json", code: string }
  techStack: { frontend: string[], backend: string[], identity?: string[], infra?: string[] }
  metrics?: { users?: number; reqPerDay?: number; p95ms?: number; storageMB?: number }
  screens: string[]
  archDiagram?: string
  createdAt: string
  updatedAt?: string
  authors?: { name: string; link?: string }[]
  openSource?: boolean
  description?: string
}

const CONTENT_DIR = path.join(process.cwd(), "content", "projects")

export async function getAllProjects(): Promise<Project[]> {
  // Spróbuj najpierw pobrać z cache
  const cacheKey = 'all-projects'
  let cachedProjects = await cache.get(cacheKey)

  if (cachedProjects) {
    console.log('📋 Using cached projects')
    return cachedProjects
  }

  console.log('🔄 Loading projects...')

  // Spróbuj pobrać z Arkiv
  try {
    const { golemStorage } = await import("./golem-storage")
    const golemProjects = await golemStorage.getAllProjects()
    if (golemProjects.length > 0) {
      console.log('✅ Loaded projects from Arkiv')
      const projects = golemProjects.map(p => p.data).sort((a,b)=> (b.createdAt||"").localeCompare(a.createdAt||""))
      await cache.set(cacheKey, projects)
      return projects
    }
  } catch (error) {
    console.warn('⚠️ Failed to load from Arkiv, falling back to local files:', error)
  }

  // Fallback do lokalnych plików
  console.log('📁 Loading from local files')
  const files = await fs.readdir(CONTENT_DIR)
  const jsons = await Promise.all(files.filter(f=>f.endsWith(".json")).map(async (f)=>{
    const raw = await fs.readFile(path.join(CONTENT_DIR, f), "utf-8")
    return JSON.parse(raw)
  }))

  const projects = jsons.sort((a,b)=> (b.createdAt||"").localeCompare(a.createdAt||""))

  // Cache lokalnie załadowane dane
  await cache.set(cacheKey, projects)

  return projects
}

export async function getAllSlugs(): Promise<string[]> {
  const list = await getAllProjects()
  return list.map(p=>p.slug)
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const list = await getAllProjects()
  return list.find(p=>p.slug === slug)
}
