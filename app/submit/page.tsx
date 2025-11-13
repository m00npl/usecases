"use client"

import { useState } from "react"

export default function SubmitPage(){
  const [data, setData] = useState({
    title:"",
    tagline:"",
    slug:"",
    email:"",
    category:[] as string[],
    liveUrl:"",
    repoUrl:"",
    description:"",
    images: [] as File[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setData({...data, images: [...data.images, ...imageFiles]})
  }

  function removeImage(index: number) {
    setData({...data, images: data.images.filter((_, i) => i !== index)})
  }

  async function submitForApproval() {
    if (!data.title || !data.tagline || !data.email) {
      alert('Please fill in title, tagline, and email')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const projectData = {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
        tagline: data.tagline,
        description: data.description,
        email: data.email,
        category: data.category.length? data.category : ["other"],
        status: "pending",
        liveUrl: data.liveUrl || undefined,
        repoUrl: data.repoUrl || undefined,
        chains: ["arkiv-kaolin"],
        usesArkiv: { annotations:true, btl:true, query:true },
        golemDetails: "Describe how you use Arkiv features here.",
        sampleCode: { lang:"ts", code: "// paste sample code" },
        techStack: { frontend:["Next.js"], backend:["Node"], identity:["Web3"], infra:["Arkiv"] },
        screens: data.images.map((_, i) => `/images/pending/${data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${i + 1}.png`),
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        approved: false
      }

      const formData = new FormData()
      formData.append('projectData', JSON.stringify(projectData))
      data.images.forEach((image, index) => {
        formData.append(`image-${index}`, image)
      })

      const response = await fetch('/api/submit-project', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setSubmitStatus('success')
        // Reset form
        setData({
          title:"",
          tagline:"",
          slug:"",
          email:"",
          category:[],
          liveUrl:"",
          repoUrl:"",
          description:"",
          images: []
        })
      } else {
        throw new Error('Submission failed')
      }
    } catch (error) {
      console.error('Error submitting project:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Submit your project</h1>
      <p className="mt-1" style={{color: 'var(--text)'}}>Fill in the project details and submit for approval. Projects will be reviewed before publication.</p>

      <div className="max-w-2xl mx-auto mt-6">
        <div className="space-y-3">
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Title *" style={{borderColor: 'var(--border)', color: 'var(--text)'}}
            value={data.title} onChange={e=>setData({...data, title: e.target.value})} />
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Tagline *" style={{borderColor: 'var(--border)', color: 'var(--text)'}}
            value={data.tagline} onChange={e=>setData({...data, tagline: e.target.value})} />
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Email *" type="email" style={{borderColor: 'var(--border)', color: 'var(--text)'}}
            value={data.email} onChange={e=>setData({...data, email: e.target.value})} />
          <textarea className="w-full rounded-xl border px-3 py-2 h-24" placeholder="Description" style={{borderColor: 'var(--border)', color: 'var(--text)'}}
            value={data.description} onChange={e=>setData({...data, description: e.target.value})} />
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Slug (optional)" style={{borderColor: 'var(--border)', color: 'var(--text)'}}
            value={data.slug} onChange={e=>setData({...data, slug: e.target.value})} />
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Live URL" style={{borderColor: 'var(--border)', color: 'var(--text)'}}
            value={data.liveUrl} onChange={e=>setData({...data, liveUrl: e.target.value})} />
          <input className="w-full rounded-xl border px-3 py-2" placeholder="Repo URL" style={{borderColor: 'var(--border)', color: 'var(--text)'}}
            value={data.repoUrl} onChange={e=>setData({...data, repoUrl: e.target.value})} />

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text)'}}>Project Screenshots</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded-xl border px-3 py-2"
              style={{borderColor: 'var(--border)', color: 'var(--text)'}}
            />
            {data.images.length > 0 && (
              <div className="mt-3 space-y-2">
                {data.images.map((image, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border" style={{borderColor: 'var(--border)'}}>
                    <span className="text-sm" style={{color: 'var(--text)'}}>{image.name}</span>
                    <button
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="w-full px-4 py-2 rounded-lg"
            style={{backgroundColor: 'var(--primary)', color: 'white'}}
            onClick={submitForApproval}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </button>

          {submitStatus === 'success' && (
            <div className="p-3 rounded-lg bg-green-100 text-green-800 text-sm">
              ✅ Project submitted successfully! It will be reviewed before publication.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-3 rounded-lg bg-red-100 text-red-800 text-sm">
              ❌ Error submitting project. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
