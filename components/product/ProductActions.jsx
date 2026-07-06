'use client'

import { useState } from 'react'
import { Heart, Truck, ShieldCheck, Undo2 } from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import { useToast } from '@/components/ui/ToastContext'
import { formatPrice } from '@/lib/constants'
import { useSiteData, useContent } from '@/components/SiteDataContext'

const TRUST_ICONS = { truck: Truck, undo: Undo2, shield: ShieldCheck }
const DEFAULT_TRUST_BADGES = [
  { icon: 'truck', text: 'Free delivery across Dubai' },
  { icon: 'undo', text: 'Easy 7-day returns in Dubai' },
  { icon: 'shield', text: 'Authenticity guaranteed' },
]

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
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isDescOpen, setIsDescOpen] = useState(true)

  const addItem = useCartStore(state => state.addItem)
  const openDrawer = useCartStore(state => state.openDrawer)
  const { showToast } = useToast()
  const { content } = useSiteData()
  const c = useContent()
  const trustBadges = Array.isArray(content['product.trust_badges']) && content['product.trust_badges'].length
    ? content['product.trust_badges'] : DEFAULT_TRUST_BADGES

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  // Find variants for the selected color
  const colorVariants = variants.filter(v => v.color === selectedColor)
  
  // Current selected variant (based on color and size)
  const selectedVariant = colorVariants.find(v => v.size === selectedSize)
  
  const isSale = product.sale_price != null
  const currentPrice = isSale ? product.sale_price : product.base_price

  // Calc savings %
  const savingsPct = isSale ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100) : 0

  const handleAddToCart = () => {
    setError('')
    if (!selectedSize) {
      setError('Please select a size')
      return
    }
    if (!selectedVariant || selectedVariant.stock_quantity < quantity) {
      setError('Selected quantity is out of stock')
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
      quantity: quantity
    })
    
    showToast('Added to your bag')
    openDrawer()
  }

  return (
    <div className="flex flex-col gap-[20px]">
      
      {/* Category & Title & Price */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-semibold mb-2">
          {product.category}
        </div>
        <h1 className="font-display text-[32px] md:text-[40px] font-bold text-brand-dark leading-[1.1] mb-4">
          {product.name}
        </h1>
        <div className="flex items-center gap-[14px] flex-wrap">
          <span className="font-display text-[26px] font-semibold text-brand-dark">{formatPrice(currentPrice)}</span>
          {isSale && (
            <>
              <span className="text-[13px] text-brand-muted line-through">{formatPrice(product.base_price)}</span>
              <span className="bg-[#F0DDD0] text-brand-accent text-[11px] px-[10px] py-[3px] rounded-full font-semibold">
                Save {savingsPct}%
              </span>
            </>
          )}
        </div>
      </div>

      {product.material && (
        <div className="px-4 py-3 bg-[#F2EAD8] rounded-[3px] border-l-[3px] border-brand-gold">
          <div className="text-[10px] text-brand-muted tracking-[0.08em] uppercase mb-[2px]">Fabric</div>
          <div className="text-[14px] font-semibold text-brand-dark">{product.material}</div>
        </div>
      )}

      <div className="h-[1px] bg-brand-border w-full my-2"></div>

      {/* Colour Selector */}
      {colors.length > 0 && (
        <div>
          <div className="text-[13px] font-semibold text-brand-dark mb-[11px]">
            Colour: <span className="font-normal text-brand-muted">{selectedColor}</span>
          </div>
          <div className="flex flex-row gap-[10px] flex-wrap">
            {colors.map(color => {
              const hex = colorsMap.get(color)
              const isSelected = selectedColor === color
              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color)
                    setSelectedSize(null) // reset size on color change
                    setQuantity(1)
                    setError('')
                  }}
                  className={`w-[30px] h-[30px] rounded-full flex items-center justify-center transition-shadow ${
                    isSelected ? 'shadow-[0_0_0_2px_white,0_0_0_3.5px_#6E1A2C]' : ''
                  }`}
                  title={color}
                  style={{ backgroundColor: hex }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      <div>
        <div className="flex justify-between items-center mb-[11px]">
          <span className="text-[13px] font-semibold text-brand-dark">Size</span>
          <a href={c('product.size_guide_url', '#')} className="text-[12px] text-brand-gold font-medium hover:underline">Size guide</a>
        </div>
        <div className="flex flex-row flex-wrap gap-[8px]">
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
                    setQuantity(1)
                    setError('')
                  }
                }}
                disabled={!inStock}
                className={`min-w-[44px] h-[44px] rounded-[2px] px-[10px] text-[13px] font-semibold flex items-center justify-center transition-colors ${
                  isSelected 
                    ? 'bg-brand-accent text-white border-brand-accent' 
                    : !inStock 
                      ? 'bg-black/5 text-brand-muted border-transparent opacity-50 line-through cursor-not-allowed'
                      : 'bg-transparent text-brand-muted border border-brand-border hover:border-brand-accent hover:text-brand-accent'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
        
        {/* Error / Stock Indicator */}
        <div className="mt-2 min-h-[20px]">
          {error ? (
            <span className="text-[12px] text-[#C0392B] font-medium">{error}</span>
          ) : selectedVariant ? (
            selectedVariant.stock_quantity <= 5 && selectedVariant.stock_quantity > 0 ? (
              <span className="text-[12px] text-[#B8860B] font-medium">Only {selectedVariant.stock_quantity} left in your size</span>
            ) : selectedVariant.stock_quantity === 0 ? (
              <span className="text-[12px] text-[#C0392B] font-medium">Out of stock</span>
            ) : null
          ) : null}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-[16px]">
        <span className="text-[13px] font-semibold text-brand-dark">Quantity</span>
        <div className="flex items-center border border-brand-border rounded-[2px] overflow-hidden">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-[40px] h-[40px] bg-white text-[18px] text-brand-dark flex items-center justify-center hover:bg-[#F2EAD8] transition-colors"
          >
            &minus;
          </button>
          <span className="w-[44px] text-center text-[15px] font-semibold text-brand-dark border-x border-brand-border leading-[40px]">
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            disabled={selectedVariant && quantity >= selectedVariant.stock_quantity}
            className="w-[40px] h-[40px] bg-white text-[18px] text-brand-dark flex items-center justify-center hover:bg-[#F2EAD8] transition-colors disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-[10px]">
        <button
          onClick={handleAddToCart}
          disabled={selectedVariant && selectedVariant.stock_quantity === 0}
          className={`w-full py-[16px] rounded-[2px] text-[14px] uppercase tracking-[0.1em] font-semibold flex items-center justify-center transition-colors border-none ${
            selectedVariant && selectedVariant.stock_quantity === 0 
              ? 'bg-brand-border text-brand-muted cursor-not-allowed'
              : 'bg-brand-accent text-white hover:bg-[#8B2A3E]'
          }`}
        >
          {selectedVariant && selectedVariant.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>

        <button 
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`w-full py-[14px] border rounded-[2px] text-[14px] font-medium tracking-[0.05em] flex items-center justify-center gap-2 transition-colors ${
            isWishlisted 
              ? 'bg-[#F0DDD0] border-brand-accent text-brand-accent'
              : 'bg-transparent border-brand-accent text-brand-accent hover:bg-[#F0DDD0]'
          }`}
        >
          <Heart size={18} strokeWidth={1.5} className={isWishlisted ? 'fill-brand-accent text-brand-accent' : ''} />
          {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
        </button>
      </div>

      {/* Trust Badges */}
      <div className="bg-[#F2EAD8] rounded-[3px] p-4 flex flex-col gap-2.5 mt-2">
        {trustBadges.map((badge, i) => {
          const Icon = TRUST_ICONS[badge.icon] || ShieldCheck
          return (
            <div key={i} className="flex items-center gap-2.5">
              <Icon size={15} className="text-[#1A4A3A]" strokeWidth={2} />
              <span className="text-[13px] text-brand-dark font-medium">{badge.text}</span>
            </div>
          )
        })}
      </div>

      {/* Expandable Description */}
      <div className="border-t border-brand-border pt-4 mt-2">
        <div 
          className="flex justify-between items-center cursor-pointer mb-3"
          onClick={() => setIsDescOpen(!isDescOpen)}
        >
          <div className="text-[13px] font-semibold text-brand-dark">Product Description</div>
          <div className="text-brand-dark">
            {isDescOpen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            )}
          </div>
        </div>
        {isDescOpen && (
          <div className="text-[13px] text-brand-muted leading-[1.72] border-b border-brand-border pb-4">
            <p className="whitespace-pre-wrap">{product.description || 'No description available.'}</p>
            {product.care_instructions && (
              <p className="mt-3"><strong className="font-semibold text-brand-dark">Care:</strong> {product.care_instructions}</p>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
