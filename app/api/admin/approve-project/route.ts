import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const pendingDir = path.join(process.cwd(), 'content', 'pending')
    const projectsDir = path.join(process.cwd(), 'content', 'projects')
    const pendingImagesDir = path.join(process.cwd(), 'public', 'images', 'pending')
    const finalImagesDir = path.join(process.cwd(), 'public', 'images')

    // Read the pending project
    const pendingFilePath = path.join(pendingDir, `${slug}.json`)
    const projectData = JSON.parse(await fs.readFile(pendingFilePath, 'utf-8'))

    // Update project metadata for approval
    projectData.approved = true
    projectData.status = 'live'
    projectData.approvedAt = new Date().toISOString()

    // Create projects directory if it doesn't exist
    await fs.mkdir(projectsDir, { recursive: true })

    // Move images from pending to final location
    if (projectData.screens && projectData.screens.length > 0) {
      // Create project-specific image directory
      const projectImageDir = path.join(finalImagesDir, slug)
      await fs.mkdir(projectImageDir, { recursive: true })

      const newScreens = []
      for (let i = 0; i < projectData.screens.length; i++) {
        const screen = projectData.screens[i]
        if (screen.includes('/pending/')) {
          const fileName = path.basename(screen)
          const oldPath = path.join(pendingImagesDir, fileName)
          const newFileName = `${slug}-${i + 1}${path.extname(fileName)}`
          const newPath = path.join(projectImageDir, newFileName)

          try {
            await fs.copyFile(oldPath, newPath)
            await fs.unlink(oldPath) // Remove from pending
            newScreens.push(`/images/${slug}/${newFileName}`)
          } catch (error) {
            console.warn(`Could not move image ${fileName}:`, error)
            newScreens.push(screen) // Keep original path if move fails
          }
        } else {
          newScreens.push(screen)
        }
      }
      projectData.screens = newScreens
    }

    // Save to projects directory
    const finalFilePath = path.join(projectsDir, `${slug}.json`)
    await fs.writeFile(finalFilePath, JSON.stringify(projectData, null, 2))

    // Remove from pending
    await fs.unlink(pendingFilePath)

    console.log(`Project approved and published: ${projectData.title} (${slug})`)

    return NextResponse.json({
      success: true,
      message: 'Project approved and published',
      slug
    })

  } catch (error) {
    console.error('Error approving project:', error)
    return NextResponse.json({
      error: 'Failed to approve project'
    }, { status: 500 })
  }
}