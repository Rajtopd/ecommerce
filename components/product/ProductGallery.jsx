'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({ images }) {
  const [mainImage, setMainImage] = useState(images?.[0] || null)

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/5] bg-[#F2EDE8] rounded-[4px] flex items-center justify-center">
        <span className="font-display-italic text-[48px] text-[#C8726A] opacity-20">SS</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Main Image */}
      <div className="w-full aspect-[4/5] relative rounded-[4px] overflow-hidden">
        <Image 
          src={mainImage} 
          alt="Product image" 
          fill 
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-row gap-2 mt-2">
          {images.slice(0, 5).map((img, i) => (
            <button 
              key={i}
              onClick={() => setMainImage(img)}
              className={`relative w-[64px] h-[80px] rounded-[4px] overflow-hidden shrink-0 transition-all ${
                mainImage === img ? 'border-[1.5px] border-[#1C1410]' : 'border border-transparent hover:opacity-80'
              }`}
            >
              <Image 
                src={img} 
                alt={`Thumbnail ${i+1}`} 
                fill 
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
