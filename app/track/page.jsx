'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchX, ShoppingBag, CheckCircle, Package, Truck, Home, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

function OrderTrackingContent() {
  const searchParams = useSearchParams()
  const initialOrder = searchParams.get('order') || ''
  
  const [orderNumber, setOrderNumber] = useState(initialOrder)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [itemsOpen, setItemsOpen] = useState(true)

  useEffect(() => {
    if (initialOrder) {
      fetchOrder(initialOrder)
    }
  }, [initialOrder])

  const handleSearch = (e) => {
    e.preventDefault()
    if (orderNumber.trim()) {
      fetchOrder(orderNumber.trim())
    }
  }

  const fetchOrder = async (number) => {
    setLoading(true)
    setError(false)
    setOrder(null)

    try {
      const res = await fetch(`/api/orders/track?order=${encodeURIComponent(number)}`)
      if (!res.ok) {
        throw new Error('Order not found')
      }
      const data = await res.json()
      setOrder(data.order)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-[#FFF3CD] text-[#856404] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[5px] px-[12px] rounded-[2px]">Pending</span>
      case 'confirmed': return <span className="bg-[#D1ECF1] text-[#0C5460] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[5px] px-[12px] rounded-[2px]">Confirmed</span>
      case 'processing': return <span className="bg-[#E8F4FD] text-[#0C5460] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[5px] px-[12px] rounded-[2px]">Processing</span>
      case 'out_for_delivery': return <span className="bg-[#D4EDDA] text-[#155724] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[5px] px-[12px] rounded-[2px]">Out for Delivery</span>
      case 'delivered': return <span className="bg-[#D4EDDA] text-[#155724] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[5px] px-[12px] rounded-[2px]">Delivered</span>
      case 'cancelled': return <span className="bg-[#F8D7DA] text-[#721C24] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[5px] px-[12px] rounded-[2px]">Cancelled</span>
      case 'returned': return <span className="bg-[#E2E3E5] text-[#383D41] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[5px] px-[12px] rounded-[2px]">Returned</span>
      default: return null
    }
  }

  // Timeline logic
  const statusLevels = {
    pending: 1,
    confirmed: 2,
    processing: 3,
    out_for_delivery: 4,
    delivered: 5,
  }

  const currentLevel = order ? statusLevels[order.status] || 0 : 0
  const isCancelled = order?.status === 'cancelled'

  const TimelineStep = ({ step, title, icon: Icon, isLast }) => {
    const isCompleted = step < currentLevel && !isCancelled
    const isCurrent = step === currentLevel && !isCancelled
    const isUpcoming = step > currentLevel && !isCancelled

    let circleClass = ''
    let iconClass = ''
    let titleClass = ''
    let lineClass = ''

    if (isCompleted) {
      circleClass = 'bg-[#1C1410]'
      iconClass = 'text-white'
      titleClass = 'text-[#1C1410]'
      lineClass = 'border-solid border-[#1C1410]'
    } else if (isCurrent) {
      circleClass = 'bg-[#C8726A] ring-4 ring-[#C8726A]/20'
      iconClass = 'text-white'
      titleClass = 'text-[#C8726A]'
      lineClass = 'border-dashed border-[#E8E4DF]' // Line to next is pending
    } else {
      circleClass = 'bg-[#F2EDE8]'
      iconClass = 'text-[#B5A89E]'
      titleClass = 'text-[#B5A89E]'
      lineClass = 'border-dashed border-[#E8E4DF]'
    }

    return (
      <div className="flex gap-4 min-h-[60px] relative">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${circleClass}`}>
            <Icon size={16} className={iconClass} />
          </div>
          {!isLast && (
            <div className={`w-0 flex-1 border-l-2 my-1 ${lineClass}`}></div>
          )}
        </div>
        <div className={`pt-1.5 font-body font-normal text-[11px] uppercase ${titleClass}`}>
          {title}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-[600px] mx-auto min-h-screen">
      {/* Header */}
      <h1 className="font-display text-[32px] text-[#1C1410]">Track Your Order</h1>
      <p className="font-body font-light text-[12px] text-[#6B5E54] mt-2">
        Enter your order number to see the latest status.
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex flex-row gap-2 mt-8">
        <input 
          type="text" 
          placeholder="e.g. SS-2026-00001"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="flex-1 h-[46px] rounded-[2px] border-[0.5px] border-[#E8E4DF] font-body font-light text-[12px] text-[#1C1410] px-4 outline-none focus:border-[#1C1410] transition-colors"
        />
        <button 
          type="submit"
          className="h-[46px] px-6 rounded-[2px] bg-[#1C1410] text-white font-body font-normal text-[10px] uppercase tracking-[0.1em] hover:opacity-90 transition-opacity flex items-center"
        >
          {loading ? '...' : 'Track'}
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="mt-12 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#E8E4DF] border-t-[#C8726A] rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-10 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SearchX size={32} className="text-[#B5A89E]" />
          <h2 className="font-display text-[20px] text-[#1C1410] mt-3">Order not found</h2>
          <p className="font-body font-light text-[11px] text-[#6B5E54] mt-1.5">
            Check your order number and try again.
          </p>
        </div>
      )}

      {/* Order Found */}
      {!loading && order && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Order Header Card */}
          <div className="bg-white border-[0.5px] border-[#E8E4DF] rounded-[4px] p-5 mt-6 flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="font-body font-normal text-[10px] uppercase tracking-[0.12em] text-[#C8726A]">
                Order {order.order_number}
              </span>
              <span className="font-body font-light text-[10px] text-[#6B5E54]">
                Placed on {formatDate(order.created_at)}
              </span>
            </div>
            <div>
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-8 ml-2">
            {isCancelled ? (
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-[#F8D7DA] flex items-center justify-center">
                  <XCircle size={16} className="text-[#721C24]" />
                </div>
                <div>
                  <div className="font-body font-normal text-[11px] text-[#721C24]">Order Cancelled</div>
                  <div className="font-body font-light text-[10px] text-[#6B5E54]">This order has been cancelled.</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col pt-2">
                <TimelineStep step={1} title="Order Placed" icon={ShoppingBag} />
                <TimelineStep step={2} title="Order Confirmed" icon={CheckCircle} />
                <TimelineStep step={3} title="Processing" icon={Package} />
                <TimelineStep step={4} title="Out for Delivery" icon={Truck} />
                <TimelineStep step={5} title="Delivered" icon={Home} isLast={true} />
              </div>
            )}
          </div>

          {/* Order Items Summary */}
          <div className="mt-10">
            <button 
              onClick={() => setItemsOpen(!itemsOpen)}
              className="flex items-center gap-2 font-body font-normal text-[10px] uppercase tracking-[0.12em] text-[#6B5E54] hover:text-[#1C1410] transition-colors mb-3"
            >
              View Items ({order.order_items?.length || 0})
              {itemsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {itemsOpen && (
              <div className="bg-white border-[0.5px] border-[#E8E4DF] rounded-[4px] p-4 flex flex-col">
                {order.order_items?.map((item, index) => {
                  const isLast = index === order.order_items.length - 1
                  return (
                    <div key={item.id} className={`flex flex-row gap-3 py-2 ${!isLast ? 'border-b-[0.5px] border-[#E8E4DF]' : ''}`}>
                      <div className="w-10 h-[50px] bg-[#F2EDE8] rounded-[4px] relative overflow-hidden shrink-0">
                        {item.product_snapshot?.image && (
                          <img 
                            src={item.product_snapshot.image} 
                            alt={item.product_snapshot.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="font-display text-[12px] text-[#1C1410] leading-[1.2]">
                          {item.product_snapshot?.name}
                        </span>
                        <span className="font-body font-light text-[9px] text-[#6B5E54] mt-1">
                          Size {item.product_snapshot?.size} &middot; {item.product_snapshot?.color}
                        </span>
                        <span className="font-body font-light text-[9px] text-[#6B5E54] mt-0.5">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-body font-normal text-[11px] text-[#1C1410]">
                          د.إ {(item.total_price / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white border-[0.5px] border-[#E8E4DF] rounded-[4px] p-5 mt-4">
            <h2 className="font-body font-normal text-[9px] uppercase tracking-[0.14em] text-[#6B5E54] mb-3">
              Delivery Address
            </h2>
            <div className="font-body font-light text-[12px] text-[#6B5E54] leading-[1.8] flex flex-col">
              <span>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</span>
              <span>{order.shipping_address?.area}, {order.shipping_address?.address}</span>
              <span>Dubai, UAE</span>
              <span>{order.shipping_address?.phone}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-20 px-6 max-w-[600px] mx-auto min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8E4DF] border-t-[#C8726A] rounded-full animate-spin"></div>
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  )
}
