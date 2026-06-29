'use client'

import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import useCartStore from '@/lib/cartStore'

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
    <div className="flex flex-row gap-3.5 py-4 border-b-[0.5px] border-[#E8E4DF] last:border-b-0">
      
      {/* LEFT — Product image */}
      <div className="w-16 h-20 shrink-0 rounded-[4px] overflow-hidden relative">
        {item.image ? (
          <Image 
            src={item.image} 
            alt={item.name} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#F2EDE8] flex items-center justify-center">
            <span className="font-display-italic text-[14px] text-[#C8726A] opacity-30">SS</span>
          </div>
        )}
      </div>

      {/* MIDDLE — Product details */}
      <div className="flex-1 flex flex-col justify-start">
        <h4 className="font-display text-[13px] text-[#1C1410] leading-[1.3] mb-1">
          {item.name}
        </h4>
        <span className="text-[10px] text-[#6B5E54] mb-2.5">
          Size {item.size} &middot; {item.color}
        </span>
        
        {/* Quantity stepper */}
        <div className="flex flex-row items-center">
          <button 
            onClick={handleMinus}
            className="w-[26px] h-[26px] border-[0.5px] border-[#E8E4DF] rounded-[2px] text-[14px] text-[#6B5E54] flex items-center justify-center hover:bg-[#F2EDE8] transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center text-[12px] text-[#1C1410]">
            {item.quantity}
          </span>
          <button 
            onClick={handlePlus}
            className="w-[26px] h-[26px] border-[0.5px] border-[#E8E4DF] rounded-[2px] text-[14px] text-[#6B5E54] flex items-center justify-center hover:bg-[#F2EDE8] transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* RIGHT — Price + Remove */}
      <div className="flex flex-col items-end justify-between py-1">
        <span className="text-[12px] text-[#1C1410]">
          د.إ {((item.price * item.quantity) / 100).toFixed(2)}
        </span>
        <button 
          onClick={() => removeItem(item.variantId)}
          className="text-[#B5A89E] hover:text-[#C8726A] transition-colors duration-150"
          aria-label="Remove item"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </div>

    </div>
  )
}
