'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import CartItem from './CartItem'

export default function CartDrawer() {
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen)
  const closeDrawer = useCartStore((state) => state.closeDrawer)
  const items = useCartStore((state) => state.items)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const getTotal = useCartStore((state) => state.getTotal)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isDrawerOpen) {
    return null
  }

  const itemCount = getItemCount()
  const total = getTotal()

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#1C1410]/45 transition-opacity duration-300 ease-in-out"
        onClick={closeDrawer}
      ></div>

      {/* Drawer Panel */}
      <div 
        className={`fixed right-0 top-0 h-screen z-[101] w-full md:w-[400px] bg-[#FAFAF8] flex flex-col transform transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-5 px-6 border-b-[0.5px] border-[#E8E4DF] flex justify-between items-center shrink-0">
          <span className="font-display text-[18px] text-[#1C1410]">
            Your Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <button onClick={closeDrawer} className="text-[#6B5E54] hover:text-[#1C1410] transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center">
            <span className="font-display-italic text-[20px] text-[#B5A89E]">Your bag is empty.</span>
            <a 
              href="/shop"
              onClick={closeDrawer}
              className="text-[10px] uppercase tracking-[0.1em] text-[#C8726A] mt-3 hover:opacity-70 transition-opacity"
            >
              Discover our collection
            </a>
          </div>
        ) : (
          /* With Items */
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.map((item) => (
                <CartItem key={item.variantId} item={item} />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t-[0.5px] border-[#E8E4DF] p-5 px-6 bg-[#FAFAF8] shrink-0">
              <div className="flex justify-between items-baseline">
                <span className="text-[9px] uppercase tracking-[0.1em] text-[#6B5E54]">Subtotal</span>
                <span className="text-[15px] text-[#1C1410]">د.إ {(total / 100).toFixed(2)}</span>
              </div>
              <p className="text-[9px] text-[#B5A89E] mt-1">
                Shipping and VAT calculated at checkout
              </p>
              
              <a 
                href="/checkout"
                className="mt-[14px] w-full h-[46px] bg-[#C8726A] text-white rounded-[2px] text-[10px] uppercase tracking-[0.12em] flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                Checkout &rarr;
              </a>
              
              <button 
                onClick={closeDrawer}
                className="block w-full text-center mt-2.5 text-[9px] text-[#6B5E54] hover:text-[#1C1410] transition-colors"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
