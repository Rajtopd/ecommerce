'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import { useToast } from '@/components/ui/ToastContext'

export default function ProductActions({ product }) {
  const variants = product.product_variants || []
  
  // Unique colors
  const colorsMap = new Map()
  variants.forEach(v => {
    if (!colorsMap.has(v.color)) {
      colorsMap.set(v.color, v.color_hex || '#000000') // fallback if no hex
    }
  })
  const colors = Array.from(colorsMap.keys())
  
  const [selectedColor, setSelectedColor] = useState(colors[0] || null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [error, setError] = useState('')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const addItem = useCartStore(state => state.addItem)
  const openDrawer = useCartStore(state => state.openDrawer)
  const { showToast } = useToast()

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  // Find variants for the selected color
  const colorVariants = variants.filter(v => v.color === selectedColor)
  
  // Current selected variant (based on color and size)
  const selectedVariant = colorVariants.find(v => v.size === selectedSize)
  
  const isSale = product.sale_price != null
  const currentPrice = isSale ? product.sale_price : product.base_price

  const handleAddToCart = () => {
    setError('')
    if (!selectedSize) {
      setError('Please select a size')
      return
    }
    if (!selectedVariant || selectedVariant.stock_quantity <= 0) {
      setError('Selected variant is out of stock')
      return
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      size: selectedSize,
      color: selectedColor,
      price: currentPrice,
      image: product.images?.[0] || '',
      quantity: 1
    })
    
    showToast('Added to your bag')
    openDrawer()
  }

  return (
    <div className="flex flex-col">
      {/* Category & Title & Price */}
      <div className="mb-8">
        <div className="text-[9px] uppercase tracking-[0.14em] text-[#C8726A] mb-2">
          {product.category}
        </div>
        <h1 className="font-display text-[24px] md:text-[32px] text-[#1C1410] leading-[1.1] mb-4">
          {product.name}
        </h1>
        <div className="flex items-baseline">
          {isSale ? (
            <>
              <span className="text-[18px] text-[#C8726A]">د.إ {(product.sale_price / 100).toFixed(2)}</span>
              <span className="text-[14px] text-[#B5A89E] line-through ml-2">د.إ {(product.base_price / 100).toFixed(2)}</span>
            </>
          ) : (
            <span className="text-[18px] text-[#1C1410]">د.إ {(product.base_price / 100).toFixed(2)}</span>
          )}
        </div>
      </div>

      <div className="h-[0.5px] bg-[#E8E4DF] w-full my-5"></div>

      {/* Colour Selector */}
      {colors.length > 0 && (
        <div className="mb-6">
          <span className="block text-[9px] uppercase text-[#6B5E54] mb-3">Colour: {selectedColor}</span>
          <div className="flex flex-row gap-2.5">
            {colors.map(color => {
              const hex = colorsMap.get(color)
              const isSelected = selectedColor === color
              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    setSelectedSize(null) // reset size on color change
                    setError('')
                  }}
                  className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'border-[2px] border-[#1C1410] ring-2 ring-[#FAFAF8] ring-inset' : 'border-[1px] border-[#E8E4DF]'
                  }`}
                  title={color}
                >
                  <span className="w-full h-full rounded-full" style={{ backgroundColor: hex }}></span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-[9px] uppercase text-[#6B5E54]">Size</span>
          <a href="#" className="text-[9px] text-[#B5A89E] hover:text-[#1C1410]">Size guide</a>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          {allSizes.map(size => {
            const variant = colorVariants.find(v => v.size === size)
            const inStock = variant && variant.stock_quantity > 0
            const isSelected = selectedSize === size
            
            return (
              <button
                key={size}
                onClick={() => {
                  if (inStock) {
                    setSelectedSize(size)
                    setError('')
                  }
                }}
                disabled={!inStock}
                className={`w-[40px] h-[36px] rounded-[2px] text-[9px] uppercase tracking-[0.08em] transition-colors ${
                  isSelected 
                    ? 'bg-[#1C1410] text-white' 
                    : !inStock 
                      ? 'bg-[#F2EDE8] text-[#B5A89E] opacity-45 line-through cursor-not-allowed'
                      : 'bg-[#F2EDE8] text-[#6B5E54] hover:bg-[#E8E4DF]'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
        
        {/* Error / Stock Indicator */}
        <div className="mt-2 min-h-[16px]">
          {error ? (
            <span className="text-[11px] text-[#C8726A] font-light">{error}</span>
          ) : selectedVariant ? (
            selectedVariant.stock_quantity <= 5 && selectedVariant.stock_quantity > 0 ? (
              <span className="text-[10px] text-[#B8860B] font-light">Only {selectedVariant.stock_quantity} left in your size</span>
            ) : selectedVariant.stock_quantity === 0 ? (
              <span className="text-[10px] text-[#C0392B] font-light">Out of stock</span>
            ) : null
          ) : null}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col mt-2">
        <button
          onClick={handleAddToCart}
          disabled={selectedVariant && selectedVariant.stock_quantity === 0}
          className={`w-full h-[48px] rounded-[2px] text-[10px] uppercase tracking-[0.14em] flex items-center justify-center transition-colors ${
            selectedVariant && selectedVariant.stock_quantity === 0 
              ? 'bg-[#E8E4DF] text-[#B5A89E] cursor-not-allowed'
              : 'bg-[#1C1410] text-white hover:opacity-90'
          }`}
        >
          {selectedVariant && selectedVariant.stock_quantity === 0 ? 'Out of Stock' : 'Add to Bag'}
        </button>

        <button 
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="mt-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.1em] text-[#6B5E54] hover:text-[#C8726A] transition-colors self-center py-2"
        >
          <Heart size={16} strokeWidth={1.5} className={isWishlisted ? 'fill-[#C8726A] text-[#C8726A]' : ''} />
          Add to Wishlist
        </button>
      </div>

      <div className="h-[0.5px] bg-[#E8E4DF] w-full my-6"></div>

      {/* Tabs */}
      <div className="flex flex-col">
        <div className="flex gap-6 border-b-[0.5px] border-[#E8E4DF] mb-4">
          <button 
            onClick={() => setActiveTab('description')}
            className={`pb-2 text-[11px] uppercase tracking-[0.1em] transition-colors ${activeTab === 'description' ? 'text-[#1C1410] border-b-[1.5px] border-[#1C1410]' : 'text-[#B5A89E] hover:text-[#6B5E54]'}`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('material')}
            className={`pb-2 text-[11px] uppercase tracking-[0.1em] transition-colors ${activeTab === 'material' ? 'text-[#1C1410] border-b-[1.5px] border-[#1C1410]' : 'text-[#B5A89E] hover:text-[#6B5E54]'}`}
          >
            Material & Care
          </button>
        </div>
        
        <div className="text-[12px] text-[#6B5E54] font-light leading-[1.8]">
          {activeTab === 'description' ? (
            <p>{product.description || 'No description available.'}</p>
          ) : (
            <div>
              <p className="mb-2"><strong className="font-normal text-[#1C1410]">Material:</strong> {product.material || 'Not specified'}</p>
              <p><strong className="font-normal text-[#1C1410]">Care:</strong> {product.care_instructions || 'Not specified'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
