'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, Package, Truck, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useCartStore from '@/lib/cartStore'

export default function OrderConfirmedPage() {
  const params = useParams()
  const orderId = params?.id
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const clearCart = useCartStore((state) => state.clearCart)

  console.log('OrderConfirmedPage render - orderId:', orderId, 'loading:', loading, 'hasOrder:', !!order)

  useEffect(() => {
    async function fetchOrder() {
      console.log('fetchOrder starting for ID:', orderId)
      if (!orderId) {
        console.log('No orderId, exiting fetchOrder')
        return
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single()

        console.log('fetchOrder db result - data:', data, 'error:', error)

        if (error || !data) {
          console.log('fetchOrder error or no data, redirecting to /shop')
          router.push('/shop')
          return
        }

        if (data.payment_status !== 'paid') {
          console.log('Order payment status is not paid:', data.payment_status, ', redirecting to /shop')
          router.push('/shop')
          return
        }

        setOrder(data)
        setLoading(false)
        clearCart()
        console.log('Order loaded successfully, cart cleared')
      } catch (err) {
        console.error('fetchOrder exception:', err)
      }
    }

    fetchOrder()
  }, [orderId, router, clearCart])

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-6 max-w-[640px] mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-2 border-[#E8E4DF] border-t-[#C8726A] rounded-full animate-spin mb-4"></div>
        <p className="font-body font-light text-[12px] text-[#6B5E54]">Confirming your order...</p>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-[640px] mx-auto">
      {/* Success Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-[#F2EDE8] rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 size={32} className="text-[#C8726A]" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-[32px] text-[#1C1410]">Order Confirmed</h1>
        <p className="font-display italic text-[18px] text-[#6B5E54] mt-2">
          Thank you, {order.shipping_address?.firstName}
        </p>
        
        <div className="bg-[#F2EDE8] rounded-[2px] py-2 px-5 mt-4">
          <span className="font-body font-normal text-[11px] uppercase tracking-[0.12em] text-[#1C1410]">
            Order {order.order_number}
          </span>
        </div>

        <p className="font-body font-light text-[12px] text-[#6B5E54] text-center leading-[1.7] mt-3 max-w-[380px]">
          We have received your order and will begin processing it shortly.
        </p>
      </div>

      <div className="h-[0.5px] bg-[#E8E4DF] w-full my-8"></div>

      {/* Order Details Card */}
      <div className="bg-white border-[0.5px] border-[#E8E4DF] rounded-[4px] p-6 mb-4">
        <h2 className="font-body font-normal text-[9px] uppercase tracking-[0.14em] text-[#6B5E54] mb-4">
          Order Details
        </h2>

        <div className="flex flex-col">
          {order.order_items?.map((item, index) => {
            const isLast = index === order.order_items.length - 1
            return (
              <div key={item.id} className={`flex flex-row gap-3 py-2.5 ${!isLast ? 'border-b-[0.5px] border-[#E8E4DF]' : ''}`}>
                <div className="w-12 h-[60px] bg-[#F2EDE8] rounded-[4px] relative overflow-hidden shrink-0">
                  {item.product_snapshot?.image && (
                    <img 
                      src={item.product_snapshot.image} 
                      alt={item.product_snapshot.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="font-display text-[13px] text-[#1C1410]">
                    {item.product_snapshot?.name}
                  </span>
                  <span className="font-body font-light text-[10px] text-[#6B5E54] mt-0.5">
                    Size {item.product_snapshot?.size} &middot; {item.product_snapshot?.color}
                  </span>
                  <span className="font-body font-light text-[10px] text-[#6B5E54] mt-0.5">
                    Qty: {item.quantity}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-body font-normal text-[12px] text-[#1C1410]">
                    د.إ {(item.total_price / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between font-body font-light text-[11px] text-[#6B5E54]">
            <span>Subtotal</span>
            <span>د.إ {(order.subtotal / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-body font-light text-[11px] text-[#6B5E54]">
            <span>Shipping</span>
            {order.shipping_charge === 0 ? (
              <span className="text-[#2E7D5E]">Free</span>
            ) : (
              <span>د.إ {(order.shipping_charge / 100).toFixed(2)}</span>
            )}
          </div>
          <div className="flex justify-between font-body font-light text-[11px] text-[#6B5E54]">
            <span>VAT (5%)</span>
            <span>د.إ {(order.vat_amount / 100).toFixed(2)}</span>
          </div>

          <div className="h-[0.5px] bg-[#E8E4DF] w-full my-2"></div>

          <div className="flex justify-between items-center">
            <span className="font-display text-[16px] text-[#1C1410]">Total</span>
            <span className="font-display text-[16px] text-[#1C1410]">د.إ {(order.total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Details Card */}
      <div className="bg-white border-[0.5px] border-[#E8E4DF] rounded-[4px] p-6 mb-6">
        <h2 className="font-body font-normal text-[9px] uppercase tracking-[0.14em] text-[#6B5E54] mb-4">
          Delivery Address
        </h2>
        <div className="font-body font-light text-[12px] text-[#6B5E54] leading-[1.8] flex flex-col">
          <span>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</span>
          <span>{order.shipping_address?.area}, {order.shipping_address?.address}</span>
          <span>Dubai, UAE</span>
          <span>{order.shipping_address?.phone}</span>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="mt-6">
        <h2 className="font-body font-normal text-[9px] uppercase tracking-[0.14em] text-[#6B5E54] mb-4">
          What Happens Next
        </h2>
        
        <div className="flex flex-col relative">
          {/* Timeline Line */}
          <div className="absolute left-[15px] top-8 bottom-8 w-[2px] bg-[#F2EDE8] -z-10"></div>

          <div className="flex flex-row gap-3.5 items-start mb-6">
            <div className="w-8 h-8 rounded-full bg-[#F2EDE8] flex items-center justify-center shrink-0">
              <Package size={16} className="text-[#C8726A]" />
            </div>
            <div className="pt-1">
              <div className="font-body font-normal text-[11px] uppercase tracking-[0.1em] text-[#1C1410]">
                Order Processing
              </div>
              <div className="font-body font-light text-[10px] text-[#6B5E54] mt-0.5">
                We are preparing your items.
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-3.5 items-start mb-6">
            <div className="w-8 h-8 rounded-full bg-[#F2EDE8] flex items-center justify-center shrink-0">
              <Truck size={16} className="text-[#C8726A]" />
            </div>
            <div className="pt-1">
              <div className="font-body font-normal text-[11px] uppercase tracking-[0.1em] text-[#1C1410]">
                Out for Delivery
              </div>
              <div className="font-body font-light text-[10px] text-[#6B5E54] mt-0.5">
                Your order will be dispatched soon.
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-3.5 items-start">
            <div className="w-8 h-8 rounded-full bg-[#F2EDE8] flex items-center justify-center shrink-0">
              <CheckCircle size={16} className="text-[#C8726A]" />
            </div>
            <div className="pt-1">
              <div className="font-body font-normal text-[11px] uppercase tracking-[0.1em] text-[#1C1410]">
                Delivered
              </div>
              <div className="font-body font-light text-[10px] text-[#6B5E54] mt-0.5">
                Enjoy your Soul Sisters pieces.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-2.5">
        <a 
          href={`/track?order=${order.order_number}`}
          className="w-full h-[46px] bg-[#1C1410] text-white rounded-[2px] flex items-center justify-center font-body font-normal text-[10px] uppercase tracking-[0.12em] hover:opacity-90 transition-opacity"
        >
          Track Your Order
        </a>
        <a 
          href="/shop"
          className="w-full h-[46px] bg-white border-[0.5px] border-[#E8E4DF] text-[#6B5E54] rounded-[2px] flex items-center justify-center font-body font-normal text-[10px] uppercase tracking-[0.12em] hover:bg-[#FAFAF8] transition-colors"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  )
}
