'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import useCartStore from '@/lib/cartStore'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import { ShoppingBag } from 'lucide-react'
import { useSiteData } from '@/components/SiteDataContext'
import { useAuth } from '@/lib/authContext'
import { supabase } from '@/lib/supabase'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function CheckoutPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const items = useCartStore(state => state.items)
  const clearCart = useCartStore(state => state.clearCart)
  const subtotal = useCartStore(state => state.getTotal())
  const { settings } = useSiteData()
  const [clientSecret, setClientSecret] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [serverTotals, setServerTotals] = useState(null)
  const [discountInput, setDiscountInput] = useState('')
  const [discountMsg, setDiscountMsg] = useState(null)
  const [applyingDiscount, setApplyingDiscount] = useState(false)

  // Display estimates from admin-managed settings; the server response is authoritative.
  const vatRate = settings?.vatRatePercent ?? 5
  const threshold = settings?.freeDeliveryThresholdFils ?? 20000
  const fee = settings?.deliveryFeeFils ?? 1500

  const discountAmount = serverTotals?.discountAmount || 0
  const discountedSubtotal = subtotal - discountAmount
  const isFreeShipping = discountedSubtotal >= threshold
  const shippingCharge = serverTotals?.shippingCharge ?? (isFreeShipping ? 0 : fee)
  const vatAmount = serverTotals?.vatAmount ?? Math.round(discountedSubtotal * (vatRate / 100))
  const totalAmount = serverTotals?.totalAmount ?? (discountedSubtotal + shippingCharge + vatAmount)

  const createIntent = async (discountCode) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    return fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ items, ...(discountCode ? { discountCode } : {}) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          if (data.totals) setServerTotals(data.totals)
          return data
        } else {
          console.error('API Error:', data)
          setErrorMsg(data.error || 'Failed to initialize checkout. Please try again.')
          return data
        }
      })
  }

  // Guest checkout isn't allowed — bounce unauthenticated visitors to login
  // and bring them straight back here once they're signed in.
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?redirect=/checkout')
    }
  }, [authLoading, isLoggedIn, router])

  useEffect(() => {
    if (isLoggedIn && items.length > 0) {
      createIntent().catch((err) => {
        console.error(err)
        setErrorMsg('A network error occurred. Please refresh the page.')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isLoggedIn])

  const applyDiscount = async () => {
    const code = discountInput.trim().toUpperCase()
    if (!code) return
    setApplyingDiscount(true)
    setDiscountMsg(null)
    try {
      // Validate first for a fast, friendly error…
      const check = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      }).then(r => r.json())

      if (!check.valid) {
        setDiscountMsg({ ok: false, text: check.error || 'Invalid code' })
        return
      }
      // …then recreate the payment intent with the discounted total
      const data = await createIntent(code)
      if (data?.clientSecret) {
        setDiscountMsg({ ok: true, text: `Code ${code} applied — you save د.إ ${(check.discount.amount / 100).toFixed(2)}` })
      }
    } catch {
      setDiscountMsg({ ok: false, text: 'Could not apply the code. Please try again.' })
    } finally {
      setApplyingDiscount(false)
    }
  }

  if (authLoading || !isLoggedIn) {
    return (
      <div className="pt-24 pb-20 px-5 md:px-10 max-w-7xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8E4DF] border-t-[#1C1410] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="pt-24 pb-20 px-5 md:px-10 max-w-3xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-[#F2EDE8] text-[#1C1410] rounded-full flex items-center justify-center mb-8">
          <ShoppingBag size={32} strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-[40px] text-[#1C1410] mb-6">Order Confirmed</h1>
        <p className="text-[15px] text-[#6B5E54] font-light mb-10 max-w-md leading-relaxed">
          Thank you for your purchase. We have received your order and will send you an email update shortly.
        </p>
        <a href="/" className="bg-[#1C1410] text-white px-10 py-5 rounded-[2px] text-[11px] uppercase tracking-[0.14em] hover:opacity-90 transition-opacity">
          Continue Shopping
        </a>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-20 px-5 md:px-10 max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-[32px] text-[#1C1410] mb-6">Your bag is empty</h1>
        <a href="/shop" className="text-[11px] uppercase tracking-[0.14em] text-[#1C1410] hover:text-[#C8726A] transition-colors border-b border-transparent hover:border-[#C8726A] pb-1">
          Return to Shop
        </a>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 px-5 md:px-10 max-w-7xl mx-auto min-h-screen">
      <h1 className="font-display text-[36px] text-[#1C1410] mb-10">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
        {/* Left Column - Form */}
        <div className="flex-1 order-2 lg:order-1">
          {clientSecret ? (
            <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm 
                clientSecret={clientSecret} 
                totalAmount={totalAmount} 
                onSuccess={(id) => {
                  setOrderId(id)
                  setIsSuccess(true)
                }} 
              />
            </Elements>
          ) : errorMsg ? (
            <div className="w-full h-[400px] flex flex-col items-center justify-center bg-[#FFF3CD] border border-[#FFE69C] rounded-[4px] px-8 text-center gap-3">
              <span className="text-[14px] text-[#856404] font-medium">{errorMsg}</span>
              <p className="text-[12px] text-[#856404] opacity-80">Your cart contains items that no longer exist. Please clear your cart and add items again.</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => { clearCart(); window.location.href = '/shop'; }}
                  className="bg-[#1C1410] text-white px-6 py-2 rounded-[2px] text-[10px] uppercase tracking-[0.1em]"
                >
                  Clear Cart & Shop
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center bg-[#FAFAF8] border border-[#E8E4DF] rounded-[4px] animate-pulse">
              <span className="text-[13px] text-[#B5A89E] font-light">Loading secure checkout...</span>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-[400px] xl:w-[450px] order-1 lg:order-2">
          <div className="bg-[#F2EDE8] p-8 rounded-[4px] sticky top-24">
            <h2 className="font-display text-[24px] text-[#1C1410] mb-8">Order Summary</h2>
            
            <div className="flex flex-col gap-5 mb-8 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4 group">
                  <div className="w-20 h-24 bg-white relative shrink-0">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center py-1">
                    <span className="text-[14px] text-[#1C1410] mb-2">{item.name}</span>
                    <span className="text-[12px] text-[#6B5E54] font-light">
                      {item.color} / {item.size}
                    </span>
                    <span className="text-[12px] text-[#6B5E54] font-light mt-1">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <div className="text-[14px] text-[#1C1410] flex items-center">
                    د.إ {((item.price * item.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Discount code */}
            <div className="border-t border-[#E8E4DF] pt-5 pb-1 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountInput}
                  onChange={(e) => { setDiscountInput(e.target.value.toUpperCase()); setDiscountMsg(null) }}
                  placeholder="Discount code"
                  disabled={applyingDiscount || !!discountAmount}
                  className="flex-1 border border-[#E8E4DF] rounded-[2px] p-3 text-[13px] font-light bg-white outline-none focus:border-[#1C1410] transition-colors uppercase tracking-[0.06em]"
                />
                <button
                  type="button"
                  onClick={applyDiscount}
                  disabled={applyingDiscount || !discountInput.trim() || !!discountAmount}
                  className="bg-[#1C1410] text-white px-5 rounded-[2px] text-[10px] uppercase tracking-[0.12em] disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  {applyingDiscount ? '…' : 'Apply'}
                </button>
              </div>
              {discountMsg && (
                <p className={`text-[12px] mt-2 ${discountMsg.ok ? 'text-[#2E7D5E]' : 'text-[#C0392B]'}`}>{discountMsg.text}</p>
              )}
            </div>

            <div className="border-t border-[#E8E4DF] pt-6 flex flex-col gap-4">
              <div className="flex justify-between text-[14px] text-[#6B5E54] font-light">
                <span>Subtotal</span>
                <span>د.إ {(subtotal / 100).toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[14px] text-[#2E7D5E] font-light">
                  <span>Discount ({serverTotals?.discountCode})</span>
                  <span>−د.إ {(discountAmount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[14px] text-[#6B5E54] font-light">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? 'Free' : `د.إ ${(shippingCharge / 100).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-[14px] text-[#6B5E54] font-light">
                <span>VAT ({serverTotals?.vatRatePercent ?? vatRate}%)</span>
                <span>د.إ {(vatAmount / 100).toFixed(2)}</span>
              </div>
              
              <div className="border-t border-[#E8E4DF] mt-4 pt-6 flex justify-between items-baseline">
                <span className="text-[18px] text-[#1C1410] uppercase tracking-[0.1em]">Total</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[12px] text-[#6B5E54]">AED</span>
                  <span className="text-[24px] text-[#1C1410]">د.إ {(totalAmount / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
