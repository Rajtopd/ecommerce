'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, ShoppingBag, Truck } from 'lucide-react'
import useCartStore from '@/lib/cartStore'
import CartItem from './CartItem'
import { formatPrice, FREE_DELIVERY_THRESHOLD } from '@/lib/constants'
import { useSiteData, useContent } from '@/components/SiteDataContext'
import { useAuth } from '@/lib/authContext'

export default function CartDrawer() {
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen)
  const closeDrawer = useCartStore((state) => state.closeDrawer)
  const items = useCartStore((state) => state.items)
  const getItemCount = useCartStore((state) => state.getItemCount)
  const getTotal = useCartStore((state) => state.getTotal)

  const [mounted, setMounted] = useState(false)
  const { settings } = useSiteData()
  const c = useContent()
  const freeDeliveryThreshold = settings?.freeDeliveryThresholdFils ?? FREE_DELIVERY_THRESHOLD

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on Escape, lock body scroll while open
  useEffect(() => {
    if (!isDrawerOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeDrawer() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen, closeDrawer])

  if (!mounted || pathname.startsWith('/admin')) {
    return null
  }

  const itemCount = getItemCount()
  const total = getTotal()

  const remaining = freeDeliveryThreshold - total
  const progressPct = Math.min(100, (total / freeDeliveryThreshold) * 100)

  return (
    <div className={`fixed inset-0 z-[100] ${isDrawerOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isDrawerOpen}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-brand-dark/45 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeDrawer}
      ></div>

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 h-screen z-[101] w-full md:w-[420px] bg-brand-bg flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[-12px_0_40px_rgba(26,15,10,0.18)] ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-5 px-6 border-b border-brand-border flex justify-between items-center shrink-0">
          <span className="font-display text-[20px] font-semibold text-brand-dark">
            Your Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <button onClick={closeDrawer} aria-label="Close bag" className="text-brand-muted hover:text-brand-dark transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F2EAD8] flex items-center justify-center mb-4">
              <ShoppingBag size={24} strokeWidth={1.25} className="text-brand-accent" />
            </div>
            <span className="font-display italic text-[24px] text-brand-muted">{c('cart.empty_text', 'Your bag is empty.')}</span>
            <a
              href="/shop"
              onClick={closeDrawer}
              className="mt-6 bg-brand-accent text-white px-7 py-[13px] text-[11px] uppercase tracking-[0.12em] font-semibold rounded-[2px] hover:bg-[#8B2A3E] transition-colors"
            >
              Discover the collection
            </a>
          </div>
        ) : (
          /* With Items */
          <>
            {/* Free delivery progress */}
            <div className="px-6 pt-4 pb-3 border-b border-brand-border bg-[#F2EAD8]/60 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={14} strokeWidth={1.75} className="text-brand-accent shrink-0" />
                <span className="text-[12px] text-brand-dark">
                  {remaining > 0 ? (
                    <>You&apos;re <strong className="font-semibold">{formatPrice(remaining)}</strong> away from free delivery</>
                  ) : (
                    <strong className="font-semibold text-[#1A4A3A]">You&apos;ve unlocked free delivery across Dubai ✦</strong>
                  )}
                </span>
              </div>
              <div className="h-[4px] w-full bg-brand-border/70 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ease-out ${remaining > 0 ? 'bg-brand-accent' : 'bg-[#1A4A3A]'}`}
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.map((item) => (
                <CartItem key={item.variantId} item={item} />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-brand-border p-6 bg-white shrink-0">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-dark">Subtotal</span>
                <span className="text-[18px] font-semibold text-brand-dark">{formatPrice(total)}</span>
              </div>
              <p className="text-[11px] text-brand-muted">
                {c('cart.footer_note', 'Shipping and VAT calculated at checkout')}
              </p>

              <a
                href={isLoggedIn ? '/checkout' : '/login?redirect=/checkout'}
                onClick={closeDrawer}
                className="mt-5 w-full py-[16px] bg-brand-accent text-white rounded-[2px] text-[13px] font-semibold uppercase tracking-[0.1em] flex items-center justify-center hover:bg-[#8B2A3E] transition-colors"
              >
                {isLoggedIn ? <>Checkout &rarr;</> : 'Sign In to Checkout'}
              </a>
              {!isLoggedIn && (
                <p className="text-[10px] text-brand-muted text-center mt-2">
                  Sign in to place an order — no guest checkout.
                </p>
              )}

              <button
                onClick={closeDrawer}
                className="block w-full text-center mt-3 text-[11px] font-medium text-brand-muted hover:text-brand-dark transition-colors"
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
