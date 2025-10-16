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
    const pendingImagesDir = path.join(process.cwd(), 'public', 'images', 'pending')

    // Read the pending project to get image paths
    const pendingFilePath = path.join(pendingDir, `${slug}.json`)
    let projectData
    try {
      projectData = JSON.parse(await fs.readFile(pendingFilePath, 'utf-8'))
    } catch (error) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Remove associated images
    if (projectData.screens && projectData.screens.length > 0) {
      for (const screen of projectData.screens) {
        if (screen.includes('/pending/')) {
          const fileName = path.basename(screen)
          const imagePath = path.join(pendingImagesDir, fileName)
          try {
            await fs.unlink(imagePath)
          } catch (error) {
            console.warn(`Could not remove image ${fileName}:`, error)
          }
        }
      }
    }

    // Remove the project JSON file
    await fs.unlink(pendingFilePath)

    console.log(`Project rejected and removed: ${projectData.title} (${slug})`)

    return NextResponse.json({
      success: true,
      message: 'Project rejected and removed',
      slug
    })

  } catch (error) {
    console.error('Error rejecting project:', error)
    return NextResponse.json({
      error: 'Failed to reject project'
    }, { status: 500 })
  }
}