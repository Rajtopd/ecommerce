'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import useCartStore from '@/lib/cartStore'

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  const addItem = useCartStore((state) => state.addItem)
  const openDrawer = useCartStore((state) => state.openDrawer)

  const hasImages = product.images && product.images.length > 0
  const image1 = hasImages ? product.images[0] : null
  const image2 = hasImages && product.images.length > 1 ? product.images[1] : null

  const isSale = product.sale_price != null
  const isNew = product.is_featured && !isSale

  // Extract unique sizes from variants
  const variants = product.product_variants || []
  const uniqueSizes = Array.from(new Set(variants.map(v => v.size)))
  const sizesData = uniqueSizes.map(size => {
    const sizeVariants = variants.filter(v => v.size === size)
    const inStock = sizeVariants.some(v => v.stock_quantity > 0)
    return { size, inStock, variant: sizeVariants[0] } // Picking first variant for that size
  })

  const handleQuickAddClick = (e) => {
    e.preventDefault() // prevent navigating to product page
    setIsQuickAddOpen(true)
  }

  const handleSizeSelect = (e, sizeData) => {
    e.preventDefault()
    if (!sizeData.inStock) return

    // Add to cart
    addItem({
      productId: product.id,
      variantId: sizeData.variant.id,
      name: product.name,
      size: sizeData.size,
      color: sizeData.variant.color,
      price: isSale ? product.sale_price : product.base_price,
      image: image1 || '',
      quantity: 1
    })
    setIsQuickAddOpen(false)
    openDrawer()
  }

  const toggleWishlist = (e) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
  }

  return (
    <a href={`/product/${product.slug}`} className="group block relative cursor-pointer">
      
      {/* IMAGE AREA */}
      <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden bg-[#F2EDE8]">
        {hasImages ? (
          <>
            <Image 
              src={image1} 
              alt={product.name} 
              fill 
              className="object-cover transition-opacity duration-300 ease-in-out z-10"
            />
            {image2 && (
              <Image 
                src={image2} 
                alt={`${product.name} alternate`} 
                fill 
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out z-20"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display-italic text-[32px] text-[#C8726A] opacity-25">SS</span>
          </div>
        )}

        {/* TOP LEFT badge */}
        {(isSale || isNew) && (
          <div className={`absolute top-2 left-2 z-30 px-2 py-[3px] rounded-[2px] text-[8px] uppercase tracking-[0.1em] ${isSale ? 'bg-[#1C1410] text-white' : 'bg-[#C8726A] text-white'}`}>
            {isSale ? 'Sale' : 'New'}
          </div>
        )}

        {/* TOP RIGHT heart */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-2 right-2 z-30 p-1"
        >
          <Heart 
            size={20} 
            strokeWidth={1.5}
            className={`${isWishlisted ? 'fill-[#C8726A] text-[#C8726A]' : 'text-[#6B5E54] hover:text-[#1C1410] transition-colors'}`}
          />
        </button>

        {/* BOTTOM HOVER OVERLAY - Quick Add Pill or Size Modal */}
        <div className="absolute bottom-0 left-0 w-full z-40 overflow-hidden">
          <div 
            className={`w-full transform transition-transform duration-300 ease-in-out ${isQuickAddOpen ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}
          >
            {!isQuickAddOpen ? (
              <button 
                onClick={handleQuickAddClick}
                className="w-full bg-[#1C1410]/85 text-white py-2.5 text-[9px] uppercase tracking-[0.12em] text-center hover:bg-[#1C1410] transition-colors"
              >
                Quick Add
              </button>
            ) : (
              <div className="w-full bg-[#FAFAF8] p-3 border-t-[0.5px] border-[#E8E4DF]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#6B5E54]">Select Size</span>
                  <button onClick={(e) => { e.preventDefault(); setIsQuickAddOpen(false) }} className="text-[#6B5E54]">
                    <span className="sr-only">Close</span>&times;
                  </button>
                </div>
                <div className="flex flex-row flex-wrap gap-1.5">
                  {sizesData.map((sd) => (
                    <button
                      key={sd.size}
                      onClick={(e) => handleSizeSelect(e, sd)}
                      disabled={!sd.inStock}
                      className={`w-[26px] h-[26px] rounded-[2px] text-[8px] uppercase tracking-[0.08em] flex items-center justify-center border-[0.5px] ${
                        sd.inStock 
                          ? 'bg-[#FAFAF8] text-[#1C1410] border-[#E8E4DF] hover:border-[#1C1410]' 
                          : 'bg-[#F2EDE8] text-[#B5A89E] border-transparent opacity-40 line-through cursor-not-allowed'
                      }`}
                    >
                      {sd.size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INFO AREA */}
      <div className="pt-3 pb-1 px-1">
        <div className="text-[8px] uppercase tracking-[0.1em] text-[#C8726A] mb-1">
          {product.category}
        </div>
        
        <h3 className="font-display text-[15px] text-[#1C1410] leading-[1.3] mb-2 truncate">
          {product.name}
        </h3>
        
        <div className="flex items-baseline mb-2.5">
          {isSale ? (
            <>
              <span className="text-[12px] text-[#C8726A]">د.إ {(product.sale_price / 100).toFixed(2)}</span>
              <span className="text-[11px] text-[#B5A89E] line-through ml-1.5">د.إ {(product.base_price / 100).toFixed(2)}</span>
            </>
          ) : (
            <span className="text-[12px] text-[#1C1410]">د.إ {(product.base_price / 100).toFixed(2)}</span>
          )}
        </div>
        
        {/* Size chips static row */}
        <div className="flex flex-row flex-wrap gap-1">
          {sizesData.map((sd) => (
            <div 
              key={sd.size}
              className={`w-[20px] h-[20px] rounded-[2px] bg-[#F2EDE8] flex items-center justify-center text-[7px] text-[#6B5E54] ${!sd.inStock ? 'opacity-30' : ''}`}
            >
              {sd.size}
            </div>
          ))}
        </div>
      </div>

    </a>
  )
}
