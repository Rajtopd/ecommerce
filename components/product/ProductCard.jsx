'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import { formatPrice } from '@/lib/constants'

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
  const salePct = isSale ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100) : 0

  // Extract unique sizes from variants
  const variants = product.product_variants || []
  const isSoldOut = variants.length > 0 && !variants.some(v => v.stock_quantity > 0)
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
    <a href={`/product/${product.slug}`} className="group block relative cursor-pointer flex flex-col">
      
      {/* IMAGE AREA */}
      <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden bg-black/5">
        {hasImages ? (
          <>
            <Image
              src={image1}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out z-10 group-hover:scale-[1.05]"
            />
            {image2 && (
              <Image
                src={image2}
                alt={`${product.name} alternate`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-20 group-hover:scale-[1.05]"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display italic text-[32px] text-brand-accent/25">SS</span>
          </div>
        )}

        {/* SOLD OUT overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 z-30 bg-brand-bg/55 flex items-center justify-center">
            <span className="bg-brand-dark/85 text-brand-bg text-[10px] tracking-[0.16em] uppercase px-4 py-2">Sold Out</span>
          </div>
        )}

        {/* TOP LEFT badge */}
        {!isSoldOut && (isSale || isNew) && (
          <div className={`absolute top-2.5 left-2.5 z-30 text-[9px] tracking-[0.08em] px-[9px] py-[3px] rounded-full uppercase font-medium ${
            isSale ? 'bg-brand-accent text-white' : 'bg-brand-accent/90 text-brand-gold'
          }`}>
            {isSale ? `-${salePct}%` : 'New In'}
          </div>
        )}

        {/* TOP RIGHT heart */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-2.5 right-2.5 z-30 bg-brand-bg/95 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart 
            size={13} 
            strokeWidth={2.5}
            className={`${isWishlisted ? 'fill-brand-accent text-brand-accent' : 'text-brand-accent hover:scale-110 transition-transform'}`}
          />
        </button>

        {/* BOTTOM HOVER OVERLAY - Quick Add Pill or Size Modal */}
        <div className="absolute bottom-0 left-0 w-full z-40 overflow-hidden">
          <div 
            className={`w-full transform transition-transform duration-300 ease-in-out ${isQuickAddOpen ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}
          >
            {isQuickAddOpen && (
              <div className="w-full bg-brand-bg p-3 border-t border-brand-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] uppercase tracking-[0.1em] text-brand-muted">Select Size</span>
                  <button onClick={(e) => { e.preventDefault(); setIsQuickAddOpen(false) }} className="text-brand-muted hover:text-brand-dark">
                    <span className="sr-only">Close</span>&times;
                  </button>
                </div>
                <div className="flex flex-row flex-wrap gap-1.5">
                  {sizesData.map((sd) => (
                    <button
                      key={sd.size}
                      onClick={(e) => handleSizeSelect(e, sd)}
                      disabled={!sd.inStock}
                      className={`w-[26px] h-[26px] rounded-[2px] text-[8px] uppercase tracking-[0.08em] flex items-center justify-center border ${
                        sd.inStock 
                          ? 'bg-brand-bg text-brand-dark border-brand-border hover:border-brand-dark' 
                          : 'bg-black/5 text-brand-muted border-transparent opacity-40 line-through cursor-not-allowed'
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
      <div className="pt-[13px] px-[3px] pb-[10px] flex flex-col flex-grow">
        <div className="text-[10px] uppercase tracking-[0.12em] text-brand-gold mb-1">
          {product.category}
        </div>
        
        <h3 className="font-display text-[18px] md:text-[20px] font-semibold text-brand-dark leading-[1.25] mb-2 text-balance">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline">
            {isSale ? (
              <>
                <span className="text-[14px] md:text-[15px] font-semibold text-brand-accent">{formatPrice(product.sale_price)}</span>
                <span className="text-[11px] text-brand-muted line-through ml-1.5">{formatPrice(product.base_price)}</span>
              </>
            ) : (
              <span className="text-[14px] md:text-[15px] font-semibold text-brand-dark">{formatPrice(product.base_price)}</span>
            )}
          </div>

          {!isQuickAddOpen && !isSoldOut && (
            <button 
              onClick={handleQuickAddClick}
              className="text-[10px] text-brand-accent bg-transparent border border-brand-border px-[12px] py-[4px] rounded-full font-medium hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>

    </a>
  )
}
