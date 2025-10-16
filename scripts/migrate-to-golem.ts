import fs from 'fs/promises'
import path from 'path'
import { golemStorage } from '../lib/golem-storage'

async function migrateProjectsToGolem(force: boolean = false) {
  console.log('🚀 Starting migration to Golem DB...')
  if (force) {
    console.log('⚠️ Force mode enabled - will overwrite existing projects')
  }

  const contentDir = path.join(process.cwd(), 'content', 'projects')
  const publicImagesDir = path.join(process.cwd(), 'public', 'images')

  try {
    // Załaduj wszystkie projekty z lokalnych plików
    const files = await fs.readdir(contentDir)
    const projectFiles = files.filter(f => f.endsWith('.json'))

    console.log(`📁 Found ${projectFiles.length} project files`)

    for (const file of projectFiles) {
      console.log(`\n📦 Processing: ${file}`)

      const filePath = path.join(contentDir, file)
      const raw = await fs.readFile(filePath, 'utf-8')
      const project = JSON.parse(raw)

      // 1. Upload images to imagedb.online
      if (project.screens && project.screens.length > 0) {
        console.log(`🖼️ Uploading ${project.screens.length} images...`)
        const newScreens = []

        for (const screen of project.screens) {
          // Konwertuj z relative path na absolute
          const imagePath = path.join(process.cwd(), 'public', screen)

          try {
            await fs.access(imagePath)
            console.log(`⬆️ Uploading: ${screen}`)

            const uploadResult = await golemStorage.uploadImageToImageDB(imagePath)
            if (uploadResult) {
              newScreens.push(uploadResult.url)
              console.log(`✅ Uploaded to: ${uploadResult.url}`)
            } else {
              console.warn(`⚠️ Failed to upload ${screen}, keeping original`)
              newScreens.push(screen)
            }
          } catch (error) {
            console.warn(`⚠️ Image not found: ${imagePath}, keeping original path`)
            newScreens.push(screen)
          }
        }

        // Aktualizuj URLs obrazów
        project.screens = newScreens
      }

      // 2. Check if project already exists in Golem DB
      console.log(`🔍 Checking if project exists: ${project.slug}`)
      const existingProject = await golemStorage.getProject(project.slug)

      if (existingProject && !force) {
        console.log(`📋 Project ${project.slug} already exists in Golem DB, skipping...`)
        console.log(`   Last updated: ${existingProject.updatedAt}`)
        console.log(`   Use --force flag to overwrite existing projects`)
        continue
      } else if (existingProject && force) {
        console.log(`🔄 Project ${project.slug} exists, but force mode enabled - will update`)
      }

      // 3. Store project data in Golem DB
      console.log(`💾 Storing new project data for: ${project.slug}`)
      const entityKey = await golemStorage.storeProject(project.slug, project)

      if (entityKey) {
        console.log(`✅ Project ${project.slug} migrated successfully`)
        console.log(`   Entity Key: ${entityKey}`)
        console.log(`   Images: ${project.screens?.length || 0}`)
      } else {
        console.error(`❌ Failed to migrate project: ${project.slug}`)
      }
    }

    console.log('\n🎉 Migration completed!')
    console.log('💡 Set GOLEM_DB_PRIVATE_KEY environment variable to enable Golem DB storage')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Uruchom migrację
if (require.main === module) {
  const forceMode = process.argv.includes('--force')

  migrateProjectsToGolem(forceMode)
    .then(() => {
      console.log('✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateProjectsToGolem }