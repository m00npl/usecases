import { createROClient, createClient } from 'golem-base-sdk'

export interface ProjectData {
  projectId: string
  data: any
  updatedAt: string
}

export interface ImageUploadResult {
  media_id: string
  url: string
}

class GolemStorage {
  private roClient: any
  private writeClient: any | null = null
  private initialized: Promise<void>

  constructor() {
    this.initialized = this.initializeClient()
  }

  private async initializeClient() {
    const chainId = 60138453025
    const rpcUrl = 'https://kaolin.hoodi.arkiv.network/rpc'
    const wsUrl = 'wss://https://kaolin.hoodi.arkiv.network/rpc/ws'

    // Read-only client (zawsze działa)
    this.roClient = createROClient(chainId, rpcUrl, wsUrl)

    // Write client (tylko jeśli mamy private key)
    if (process.env.GOLEM_DB_PRIVATE_KEY) {
      try {
        const accountData = {
          tag: 'privatekey' as const,
          data: Buffer.from(process.env.GOLEM_DB_PRIVATE_KEY.slice(2), 'hex')
        }
        this.writeClient = await createClient(chainId, accountData, rpcUrl, wsUrl)
        console.log('✅ Golem DB write client initialized')
      } catch (error) {
        console.error('❌ Failed to initialize write client:', error)
      }
    } else {
      console.warn('⚠️ No GOLEM_DB_PRIVATE_KEY - read-only mode')
    }
  }

  private async getCurrentBlock(): Promise<number> {
    try {
      if (this.writeClient?.getRawClient) {
        const rawClient = this.writeClient.getRawClient()
        return await rawClient.httpClient.getBlockNumber()
      }
      return Math.floor(Date.now() / 1000 / 2)
    } catch (error) {
      return Math.floor(Date.now() / 1000 / 2)
    }
  }

  private calculateBTL(days: number): number {
    const blocksPerDay = (24 * 60 * 60) / 2 // ~43200 bloków/dzień (~2s/block)
    return Math.floor(days * blocksPerDay)
  }

  async storeProject(projectId: string, data: any): Promise<string | null> {
    await this.initialized

    if (!this.writeClient) {
      console.warn('❌ Write operations not available - no private key configured')
      return null
    }

    try {
      const btl = this.calculateBTL(365 * 2) // 2 lata
      const dataJson = JSON.stringify({
        projectId,
        data,
        updatedAt: new Date().toISOString()
      })

      console.log('📦 Storing project:', projectId)

      const result = await this.writeClient.createEntities([{
        btl: btl,
        data: Buffer.from(dataJson, 'utf8'),
        stringAnnotations: [
          { key: 'type', value: 'project_data' },
          { key: 'project_id', value: projectId },
          { key: 'updated_at', value: new Date().toISOString() }
        ],
        numericAnnotations: []
      }])

      const entityKey = result[0].entityKey
      console.log('✅ Project stored with key:', entityKey)
      return entityKey
    } catch (error) {
      console.error('❌ Failed to store project:', error)
      throw error
    }
  }

  async getProject(projectId: string): Promise<ProjectData | null> {
    await this.initialized

    try {
      console.log('🔍 Searching for project:', projectId)

      // Get owner address - musimy mieć write client
      if (!this.writeClient) {
        console.warn('❌ Cannot retrieve project data without write client')
        return null
      }

      const ownerAddress = await this.writeClient.getOwnerAddress()

      // Pobierz wszystkie entities właściciela
      const allEntities = await this.roClient.getEntitiesOfOwner(ownerAddress)

      // Znajdź najnowszy projekt o podanym ID
      let latestEntity = null
      let latestTimestamp = 0

      for (const entityKey of allEntities) {
        try {
          const metadata = await this.roClient.getEntityMetaData(entityKey)

          const isProjectType = metadata.stringAnnotations.some(
            (ann: any) => ann.key === 'type' && ann.value === 'project_data'
          )
          const matchesId = metadata.stringAnnotations.some(
            (ann: any) => ann.key === 'project_id' && ann.value === projectId
          )

          if (isProjectType && matchesId) {
            const updatedAtAnnotation = metadata.stringAnnotations.find(
              (ann: any) => ann.key === 'updated_at'
            )

            if (updatedAtAnnotation) {
              const timestamp = new Date(updatedAtAnnotation.value).getTime()
              if (timestamp > latestTimestamp) {
                latestTimestamp = timestamp
                latestEntity = entityKey
              }
            }
          }
        } catch (error) {
          // Skip entities that can't be read
          continue
        }
      }

      if (!latestEntity) {
        console.log('📭 Project not found:', projectId)
        return null
      }

      // Pobierz dane najnowszej entity
      const data = await this.roClient.getStorageValue(latestEntity)
      const projectData = JSON.parse(data.toString('utf8'))

      console.log('✅ Project found:', projectId)
      return projectData
    } catch (error) {
      console.error('❌ Failed to get project:', error)
      return null
    }
  }

  async getAllProjects(): Promise<ProjectData[]> {
    await this.initialized

    try {
      console.log('🔍 Loading all projects from Golem DB')

      if (!this.writeClient) {
        console.warn('❌ Cannot retrieve all projects without write client')
        return []
      }

      const ownerAddress = await this.writeClient.getOwnerAddress()
      const allEntities = await this.roClient.getEntitiesOfOwner(ownerAddress)

      const projectsMap = new Map<string, ProjectData>()

      for (const entityKey of allEntities) {
        try {
          const metadata = await this.roClient.getEntityMetaData(entityKey)

          const isProjectType = metadata.stringAnnotations.some(
            (ann: any) => ann.key === 'type' && ann.value === 'project_data'
          )

          if (isProjectType) {
            const projectIdAnnotation = metadata.stringAnnotations.find(
              (ann: any) => ann.key === 'project_id'
            )
            const updatedAtAnnotation = metadata.stringAnnotations.find(
              (ann: any) => ann.key === 'updated_at'
            )

            if (projectIdAnnotation && updatedAtAnnotation) {
              const projectId = projectIdAnnotation.value
              const updatedAt = updatedAtAnnotation.value

              // Sprawdź czy to najnowsza wersja tego projektu
              const existing = projectsMap.get(projectId)
              if (!existing || new Date(updatedAt) > new Date(existing.updatedAt)) {
                const data = await this.roClient.getStorageValue(entityKey)
                const projectData = JSON.parse(data.toString('utf8'))
                projectsMap.set(projectId, projectData)
              }
            }
          }
        } catch (error) {
          // Skip entities that can't be read
          continue
        }
      }

      const projects = Array.from(projectsMap.values())
      console.log('✅ Loaded', projects.length, 'projects from Golem DB')
      return projects
    } catch (error) {
      console.error('❌ Failed to get all projects:', error)
      return []
    }
  }

  async uploadImageToImageDB(imagePath: string): Promise<ImageUploadResult | null> {
    try {
      console.log('🖼️ Uploading image to imagedb.online:', imagePath)

      // Pobierz plik z lokalnego systemu
      const fs = await import('fs/promises')
      const imageBuffer = await fs.readFile(imagePath)

      // Przygotuj FormData
      const formData = new FormData()
      const blob = new Blob([imageBuffer])
      formData.append('file', blob, imagePath.split('/').pop() || 'image.png')
      formData.append('ttlDays', '730') // 2 lata

      // Upload do imagedb.online
      const response = await fetch('https://imagedb.online/media', {
        method: 'POST',
        body: formData,
        headers: {
          'Idempotency-Key': `portfolio-${Date.now()}-${Math.random()}`
        }
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Image uploaded with ID:', result.media_id)

      return {
        media_id: result.media_id,
        url: `https://imagedb.online/media/${result.media_id}`
      }
    } catch (error) {
      console.error('❌ Failed to upload image:', error)
      return null
    }
  }
}

export const golemStorage = new GolemStorage()