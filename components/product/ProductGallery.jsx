'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%')

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-black/5 rounded-[4px] flex items-center justify-center border border-brand-border/50">
        <span className="font-display italic text-[48px] text-brand-accent opacity-20">SS</span>
      </div>
    )
  }

  const mainImage = images[activeIndex] || images[0]

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomOrigin(`${x}% ${y}%`)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Main Image with hover zoom */}
      <div
        className="w-full aspect-[4/5] relative rounded-[4px] overflow-hidden bg-black/5 cursor-zoom-in group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          key={mainImage}
          src={mainImage}
          alt="Product image"
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover transition-transform duration-300 ease-out animate-fade-in"
          style={{
            transform: isZoomed ? 'scale(1.75)' : 'scale(1)',
            transformOrigin: zoomOrigin,
          }}
          priority
        />

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-brand-dark/60 text-brand-bg text-[10px] tracking-[0.08em] px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-row gap-2 mt-2 overflow-x-auto scrollbar-hide">
          {images.slice(0, 6).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative w-[64px] h-[80px] rounded-[4px] overflow-hidden shrink-0 transition-all ${
                activeIndex === i ? 'ring-[1.5px] ring-brand-dark ring-offset-1' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
