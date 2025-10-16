'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageModal } from './ImageModal'

interface ProjectImagesProps {
  images: string[]
  projectTitle: string
}

export function ProjectImages({ images, projectTitle }: ProjectImagesProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const openModal = (index: number) => {
    setSelectedIndex(index)
    setModalOpen(true)
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => openModal(i)}
            className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 hover:border-neutral-700 transition-colors group cursor-pointer"
          >
            <div className="relative">
              <Image
                src={src}
                alt={`${projectTitle} screenshot ${i+1}`}
                width={1280}
                height={800}
                className="object-cover w-full h-auto group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <ImageModal
        images={images}
        initialIndex={selectedIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}