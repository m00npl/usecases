import fs from 'fs/promises'
import path from 'path'

interface CacheData {
  data: any
  timestamp: number
  lastModified: string
}

class LocalCache {
  private cacheDir: string

  constructor() {
    this.cacheDir = path.join(process.cwd(), '.cache')
    this.ensureCacheDir()
  }

  private async ensureCacheDir() {
    try {
      await fs.access(this.cacheDir)
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true })
    }
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`)
  }

  async get(key: string): Promise<any | null> {
    try {
      const filePath = this.getCacheFilePath(key)
      const content = await fs.readFile(filePath, 'utf8')
      const cached: CacheData = JSON.parse(content)

      // Sprawdź czy cache nie jest starszy niż 24h
      const now = Date.now()
      const dayInMs = 24 * 60 * 60 * 1000

      if (now - cached.timestamp > dayInMs) {
        console.log('🕐 Cache expired for:', key)
        return null
      }

      console.log('📋 Cache hit for:', key)
      return cached.data
    } catch (error) {
      console.log('📋 Cache miss for:', key)
      return null
    }
  }

  async set(key: string, data: any, lastModified?: string): Promise<void> {
    try {
      await this.ensureCacheDir()

      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        lastModified: lastModified || new Date().toISOString()
      }

      const filePath = this.getCacheFilePath(key)
      await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2))

      console.log('💾 Cached data for:', key)
    } catch (error) {
      console.error('❌ Failed to cache data:', error)
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      const filePath = this.getCacheFilePath(key)
      await fs.unlink(filePath)
      console.log('🗑️ Invalidated cache for:', key)
    } catch (error) {
      // File doesn't exist, nothing to do
    }
  }

  async shouldInvalidate(key: string, currentLastModified: string): Promise<boolean> {
    try {
      const filePath = this.getCacheFilePath(key)
      const content = await fs.readFile(filePath, 'utf8')
      const cached: CacheData = JSON.parse(content)

      const cachedModified = new Date(cached.lastModified).getTime()
      const currentModified = new Date(currentLastModified).getTime()

      if (currentModified > cachedModified) {
        console.log('🔄 Data changed, invalidating cache for:', key)
        await this.invalidate(key)
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }
}

export const cache = new LocalCache()