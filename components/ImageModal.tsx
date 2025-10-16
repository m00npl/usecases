'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ImageModalProps {
  images: string[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function ImageModal({ images, initialIndex, isOpen, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
          break
        case 'ArrowRight':
          setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, images.length])

  if (!isOpen) return null

  const nextImage = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
  }

  const prevImage = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center"
        >
          ✕
        </button>

        {/* Previous button */}
        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="absolute left-4 z-10 w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center text-xl"
          >
            ‹
          </button>
        )}

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute right-4 z-10 w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center text-xl"
          >
            ›
          </button>
        )}

        {/* Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={images[currentIndex]}
            alt={`Screenshot ${currentIndex + 1}`}
            width={1920}
            height={1080}
            className="max-w-full max-h-full object-contain"
            priority
          />
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto">
            {images.map((src, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                  index === currentIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}