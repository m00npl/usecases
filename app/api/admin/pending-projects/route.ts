import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const pendingDir = path.join(process.cwd(), 'content', 'pending')

    try {
      const files = await fs.readdir(pendingDir)
      const jsonFiles = files.filter(file => file.endsWith('.json'))

      const projects = await Promise.all(
        jsonFiles.map(async (file) => {
          const filePath = path.join(pendingDir, file)
          const content = await fs.readFile(filePath, 'utf-8')
          return JSON.parse(content)
        })
      )

      // Sort by submission date (newest first)
      projects.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

      return NextResponse.json(projects)
    } catch (error) {
      // If pending directory doesn't exist, return empty array
      if ((error as any).code === 'ENOENT') {
        return NextResponse.json([])
      }
      throw error
    }
  } catch (error) {
    console.error('Error loading pending projects:', error)
    return NextResponse.json({ error: 'Failed to load pending projects' }, { status: 500 })
  }
}