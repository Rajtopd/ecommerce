'use client'

import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import { formatPrice } from '@/lib/constants'

export default function CartItem({ item }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const handleMinus = () => {
    if (item.quantity === 1) {
      removeItem(item.variantId)
    } else {
      updateQuantity(item.variantId, item.quantity - 1)
    }
  }

  const handlePlus = () => {
    updateQuantity(item.variantId, item.quantity + 1)
  }

  return (
    <div className="flex flex-row gap-3.5 py-4 border-b border-brand-border last:border-b-0">
      
      {/* LEFT — Product image */}
      <div className="w-16 h-20 shrink-0 rounded-[4px] overflow-hidden relative border border-brand-border/50">
        {item.image ? (
          <Image 
            src={item.image} 
            alt={item.name} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-black/5 flex items-center justify-center">
            <span className="font-display italic text-[14px] text-brand-accent opacity-30">SS</span>
          </div>
        )}
      </div>

      {/* MIDDLE — Product details */}
      <div className="flex-1 flex flex-col justify-start">
        <h4 className="font-display text-[14px] md:text-[15px] font-semibold text-brand-dark leading-[1.3] mb-1">
          {item.name}
        </h4>
        <span className="text-[11px] text-brand-muted mb-2.5">
          Size {item.size} &middot; {item.color}
        </span>
        
        {/* Quantity stepper */}
        <div className="flex flex-row items-center border border-brand-border rounded-[2px] w-fit overflow-hidden mt-auto">
          <button 
            onClick={handleMinus}
            className="w-[28px] h-[28px] bg-white text-[16px] text-brand-dark flex items-center justify-center hover:bg-[#F2EAD8] transition-colors"
          >
            &minus;
          </button>
          <span className="w-8 text-center text-[12px] font-semibold text-brand-dark border-x border-brand-border h-[28px] leading-[28px]">
            {item.quantity}
          </span>
          <button 
            onClick={handlePlus}
            className="w-[28px] h-[28px] bg-white text-[16px] text-brand-dark flex items-center justify-center hover:bg-[#F2EAD8] transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* RIGHT — Price + Remove */}
      <div className="flex flex-col items-end justify-between py-1">
        <span className="text-[13px] font-semibold text-brand-dark">
          {formatPrice(item.price * item.quantity)}
        </span>
        <button 
          onClick={() => removeItem(item.variantId)}
          className="text-brand-muted hover:text-brand-accent transition-colors duration-150 p-1"
          aria-label="Remove item"
        >
          <Trash2 size={15} strokeWidth={1.5} />
        </button>
      </div>

    </div>
  )
}
