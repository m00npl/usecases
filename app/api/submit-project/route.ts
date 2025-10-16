import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const projectData = formData.get('projectData') as string

    if (!projectData) {
      return NextResponse.json({ error: 'No project data provided' }, { status: 400 })
    }

    let parsedData
    try {
      parsedData = JSON.parse(projectData)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 })
    }

    // Create pending directory if it doesn't exist
    const pendingDir = path.join(process.cwd(), 'content', 'pending')
    await fs.mkdir(pendingDir, { recursive: true })

    const imageDir = path.join(process.cwd(), 'public', 'images', 'pending')
    await fs.mkdir(imageDir, { recursive: true })

    // Save images
    const imageFiles = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image-') && value instanceof File) {
        const imageIndex = key.split('-')[1]
        const fileExtension = value.name.split('.').pop() || 'png'
        const fileName = `${parsedData.slug}-${parseInt(imageIndex) + 1}.${fileExtension}`
        const filePath = path.join(imageDir, fileName)

        const buffer = Buffer.from(await value.arrayBuffer())
        await fs.writeFile(filePath, buffer)
        imageFiles.push(`/images/pending/${fileName}`)
      }
    }

    // Update screens array with actual uploaded image paths
    if (imageFiles.length > 0) {
      parsedData.screens = imageFiles
    }

    // Add submission metadata
    parsedData.submittedAt = new Date().toISOString()
    parsedData.approved = false
    parsedData.status = 'pending'

    // Save project JSON to pending directory
    const jsonFileName = `${parsedData.slug}.json`
    const jsonPath = path.join(pendingDir, jsonFileName)
    await fs.writeFile(jsonPath, JSON.stringify(parsedData, null, 2))

    // Log submission for admin review
    console.log(`New project submission: ${parsedData.title} (${parsedData.slug})`)

    return NextResponse.json({
      success: true,
      message: 'Project submitted successfully',
      slug: parsedData.slug
    })

  } catch (error) {
    console.error('Error processing submission:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}