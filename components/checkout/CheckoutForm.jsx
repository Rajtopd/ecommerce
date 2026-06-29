'use client'

import { useState, useEffect } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { useToast } from '@/components/ui/ToastContext'
import useCartStore from '@/lib/cartStore'
import { useAuth } from '@/lib/authContext'
import { supabase } from '@/lib/supabase'

export default function CheckoutForm({ clientSecret, totalAmount, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const { showToast } = useToast()
  const clearCart = useCartStore(state => state.clearCart)
  const { user, isLoggedIn } = useAuth()
  
  const [useSavedAddress, setUseSavedAddress] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    area: 'Downtown Dubai',
    city: 'Dubai',
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  
  const dubaiAreas = [
    'Downtown Dubai', 'Dubai Marina', 'Jumeirah', 'Business Bay', 
    'Palm Jumeirah', 'Al Barsha', 'Deira', 'Bur Dubai'
  ]

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
            area: data.area || 'Downtown Dubai'
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
    
    if (!stripe || !elements || !clientSecret) return

    setIsProcessing(true)

    // 1. Confirm Payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
          },
        },
      }
    )

    if (stripeError) {
      showToast(stripeError.message || 'Payment failed', 'error')
      setIsProcessing(false)
      return
    }

    // 2. Confirm order in our database
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
          paymentIntentId: paymentIntent.id,
          shippingAddress: formData
        })
      })

      if (!res.ok) {
        throw new Error('Failed to confirm order in database')
      }

      showToast('Order placed successfully!', 'success')
      clearCart()
      onSuccess(paymentIntent.id)
    } catch (err) {
      console.error(err)
      showToast('Payment successful but order creation failed. Please contact support.', 'error')
    }
    
    setIsProcessing(false)
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
                  firstName: '', lastName: '', phone: '', address: '', area: 'Downtown Dubai'
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
        <div className="border border-[#E8E4DF] rounded-[2px] p-4 bg-[#FAFAF8]">
          <CardElement options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#1C1410',
                fontFamily: 'Josefin Sans, sans-serif',
                '::placeholder': {
                  color: '#B5A89E',
                },
              },
              invalid: {
                color: '#C8726A',
              },
            },
          }} />
        </div>
      </section>

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements || !clientSecret}
        className="w-full bg-[#1C1410] text-white h-[54px] rounded-[2px] text-[12px] uppercase tracking-[0.14em] mt-2 hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
      >
        {isProcessing ? 'Processing...' : `Pay د.إ ${(totalAmount / 100).toFixed(2)}`}
      </button>
    </form>
  )
}
