"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface PendingProject {
  title: string
  slug: string
  tagline: string
  description?: string
  liveUrl?: string
  repoUrl?: string
  screens: string[]
  submittedAt: string
  approved: boolean
  status: string
}

export default function AdminPage() {
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (authenticated) {
      loadPendingProjects()
    }
  }, [authenticated])

  async function loadPendingProjects() {
    try {
      const response = await fetch('/api/admin/pending-projects')
      if (response.ok) {
        const projects = await response.json()
        setPendingProjects(projects)
      }
    } catch (error) {
      console.error('Error loading pending projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function authenticate() {
    if (password === 'arkiv-admin-2024') {
      setAuthenticated(true)
    } else {
      alert('Incorrect password')
    }
  }

  async function approveProject(slug: string) {
    try {
      const response = await fetch('/api/admin/approve-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })

      if (response.ok) {
        alert('Project approved and published!')
        loadPendingProjects()
      } else {
        alert('Error approving project')
      }
    } catch (error) {
      console.error('Error approving project:', error)
      alert('Error approving project')
    }
  }

  async function rejectProject(slug: string) {
    try {
      const response = await fetch('/api/admin/reject-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })

      if (response.ok) {
        alert('Project rejected and removed')
        loadPendingProjects()
      } else {
        alert('Error rejecting project')
      }
    } catch (error) {
      console.error('Error rejecting project:', error)
      alert('Error rejecting project')
    }
  }

  if (!authenticated) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto">
          <h1 className="title-32 mb-6">Admin Access</h1>
          <div className="card p-6 space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              className="w-full rounded-lg border px-3 py-2"
              style={{backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)'}}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && authenticate()}
            />
            <button
              onClick={authenticate}
              className="w-full px-4 py-2 rounded-lg"
              style={{backgroundColor: 'var(--primary)', color: 'white'}}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading pending projects...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="title-32 mb-6">Admin Panel - Pending Projects</h1>

      {pendingProjects.length === 0 ? (
        <div className="card p-6 text-center">
          <p style={{color: 'var(--muted)'}}>No pending projects to review</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingProjects.map((project) => (
            <div key={project.slug} className="card p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="title-24 mb-2">{project.title}</h2>
                  <p className="body-14 mb-4" style={{color: 'var(--muted)'}}>{project.tagline}</p>

                  {project.description && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-1">Description:</h3>
                      <p className="text-sm" style={{color: 'var(--muted)'}}>{project.description}</p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div><strong>Slug:</strong> {project.slug}</div>
                    {project.liveUrl && <div><strong>Live URL:</strong> <a href={project.liveUrl} target="_blank" className="text-blue-500">{project.liveUrl}</a></div>}
                    {project.repoUrl && <div><strong>Repo URL:</strong> <a href={project.repoUrl} target="_blank" className="text-blue-500">{project.repoUrl}</a></div>}
                    <div><strong>Submitted:</strong> {new Date(project.submittedAt).toLocaleString()}</div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => approveProject(project.slug)}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                      ✅ Approve & Publish
                    </button>
                    <button
                      onClick={() => rejectProject(project.slug)}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Screenshots ({project.screens.length})</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {project.screens.map((screen, index) => (
                      <div key={index} className="relative aspect-video border rounded overflow-hidden" style={{borderColor: 'var(--border)'}}>
                        <Image
                          src={screen}
                          alt={`Screenshot ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}