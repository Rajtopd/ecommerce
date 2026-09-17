'use client'

import { useState, useEffect } from 'react'
import { Banknote } from 'lucide-react'
import { useToast } from '@/components/ui/ToastContext'
import { useAuth } from '@/lib/authContext'
import { supabase } from '@/lib/supabase'
import { useSiteData } from '@/components/SiteDataContext'
import { DUBAI_AREAS } from '@/lib/constants'

export default function CheckoutForm({ items, discountCode, totalAmount, onSuccess }) {
  const { showToast } = useToast()
  const { user, isLoggedIn } = useAuth()
  const { zones } = useSiteData()

  // Delivery areas are admin-managed (Delivery screen); fall back to the legacy list
  const dubaiAreas = zones && zones.length ? zones : DUBAI_AREAS

  const [useSavedAddress, setUseSavedAddress] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    area: '',
    city: 'Dubai',
  })

  const [isProcessing, setIsProcessing] = useState(false)

  // Default the area to the first available zone
  useEffect(() => {
    setFormData(prev => prev.area ? prev : { ...prev, area: dubaiAreas[0] || '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dubaiAreas.length])

  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({ ...prev, email: user.email }))

      const fetchAddress = async () => {
        const { data } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single()

        if (data) {
          const names = (data.full_name || '').split(' ')
          const firstName = names[0] || ''
          const lastName = names.slice(1).join(' ') || ''
          setFormData(prev => ({
            ...prev,
            firstName,
            lastName,
            phone: data.phone || '',
            address: data.street || '',
            area: data.area || ''
          }))
          setUseSavedAddress(true)
        }
      }
      fetchAddress()
    }
  }, [isLoggedIn, user])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          items,
          ...(discountCode ? { discountCode } : {}),
          shippingAddress: formData,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || 'Could not place your order. Please try again.', 'error')
        setIsProcessing(false)
        return
      }

      showToast('Order placed successfully!', 'success')
      onSuccess(data.orderId)
    } catch (err) {
      console.error(err)
      showToast('A network error occurred. Please try again.', 'error')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Contact Info */}
      <section>
        <h2 className="font-display text-[22px] text-[#1C1410] mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} disabled={isLoggedIn} className={`border border-[#E8E4DF] rounded-[2px] p-3 text-[13px] font-light outline-none focus:border-[#1C1410] transition-colors ${isLoggedIn ? 'bg-[#F2EDE8] text-[#6B5E54] cursor-not-allowed' : 'bg-[#FAFAF8]'}`} />
          <input required name="phone" type="tel" placeholder="Phone" value={formData.phone} onChange={handleChange} className="border border-[#E8E4DF] rounded-[2px] p-3 text-[13px] font-light bg-[#FAFAF8] outline-none focus:border-[#1C1410] transition-colors" />
        </div>
      </section>

      {/* Delivery */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-display text-[22px] text-[#1C1410]">Delivery Address</h2>
          {useSavedAddress && (
            <button
              type="button"
              onClick={() => {
                setUseSavedAddress(false)
                setFormData(prev => ({
                  ...prev,
                  firstName: '', lastName: '', phone: '', address: '', area: dubaiAreas[0] || ''
                }))
              }}
              className="text-[10px] uppercase tracking-[0.1em] text-[#C8726A] hover:text-[#1C1410] transition-colors mb-1"
            >
              Clear saved address
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required name="firstName" type="text" placeholder="First name" value={formData.firstName} onChange={handleChange} className="border border-[#E8E4DF] rounded-[2px] p-3 text-[13px] font-light bg-[#FAFAF8] outline-none focus:border-[#1C1410] transition-colors" />
          <input required name="lastName" type="text" placeholder="Last name" value={formData.lastName} onChange={handleChange} className="border border-[#E8E4DF] rounded-[2px] p-3 text-[13px] font-light bg-[#FAFAF8] outline-none focus:border-[#1C1410] transition-colors" />
          <input required name="address" type="text" placeholder="Address (Villa, Street, etc.)" value={formData.address} onChange={handleChange} className="md:col-span-2 border border-[#E8E4DF] rounded-[2px] p-3 text-[13px] font-light bg-[#FAFAF8] outline-none focus:border-[#1C1410] transition-colors" />
          <select name="area" value={formData.area} onChange={handleChange} className="border border-[#E8E4DF] rounded-[2px] p-3 text-[13px] font-light bg-[#FAFAF8] outline-none focus:border-[#1C1410] transition-colors appearance-none">
            {dubaiAreas.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
          <input disabled name="city" type="text" value="Dubai, UAE" className="border border-[#E8E4DF] rounded-[2px] p-3 text-[13px] font-light bg-[#F2EDE8] text-[#6B5E54] outline-none" />
        </div>
      </section>

      {/* Payment */}
      <section>
        <h2 className="font-display text-[22px] text-[#1C1410] mb-4">Payment</h2>
        <div className="border border-[#E8E4DF] rounded-[2px] p-4 bg-[#FAFAF8] flex items-center gap-3">
          <Banknote size={20} className="text-[#1C1410] shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-[13px] text-[#1C1410]">Cash on Delivery</p>
            <p className="text-[12px] text-[#6B5E54] font-light">Pay in cash when your order arrives at your door.</p>
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-[#1C1410] text-white h-[54px] rounded-[2px] text-[12px] uppercase tracking-[0.14em] mt-2 hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
      >
        {isProcessing ? 'Placing order...' : `Place Order — Pay د.إ ${(totalAmount / 100).toFixed(2)} on Delivery`}
      </button>
    </form>
  )
}
