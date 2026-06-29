'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, MapPin, Plus, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/authContext'

export default function AccountPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState('orders') // 'orders' or 'addresses'
  
  // Data states
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  // Form states
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    firstName: '',
    lastName: '',
    phone: '',
    area: '',
    address: '',
    is_default: false
  })
  const [formLoading, setFormLoading] = useState(false)

  // Protection Redirect
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?redirect=/account')
    }
  }, [authLoading, isLoggedIn, router])

  // Fetch Data
  useEffect(() => {
    if (!user) return

    async function fetchData() {
      setDataLoading(true)
      try {
        // Fetch Orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          
        setOrders(ordersData || [])

        // Fetch Addresses
        const { data: addrData } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          
        const mappedAddr = (addrData || []).map(addr => {
          const names = (addr.full_name || '').split(' ')
          const firstName = names[0] || ''
          const lastName = names.slice(1).join(' ') || ''
          return {
            id: addr.id,
            firstName,
            lastName,
            phone: addr.phone,
            area: addr.area,
            address: addr.street || '',
            is_default: addr.is_default
          }
        })
        setAddresses(mappedAddr)
      } catch (err) {
        console.error('Error fetching account data:', err)
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    
    try {
      const payload = {
        user_id: user.id,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        area: formData.area,
        street: formData.address,
        building: '',
        flat_number: '',
        is_default: formData.is_default
      }

      if (formData.is_default) {
        // Unset other defaults first
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
      }

      if (formData.id) {
        // Update
        await supabase.from('addresses').update(payload).eq('id', formData.id)
      } else {
        // Insert
        // If it's the first address, make it default automatically
        if (addresses.length === 0) payload.is_default = true
        await supabase.from('addresses').insert(payload)
      }

      // Refresh addresses
      const { data: newAddr } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        
      const mappedAddr = (newAddr || []).map(addr => {
        const names = (addr.full_name || '').split(' ')
        const firstName = names[0] || ''
        const lastName = names.slice(1).join(' ') || ''
        return {
          id: addr.id,
          firstName,
          lastName,
          phone: addr.phone,
          area: addr.area,
          address: addr.street || '',
          is_default: addr.is_default
        }
      })
      setAddresses(mappedAddr)
      
      setShowAddressForm(false)
      setFormData({ id: null, firstName: '', lastName: '', phone: '', area: '', address: '', is_default: false })
    } catch (err) {
      console.error('Error saving address:', err)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      await supabase.from('addresses').delete().eq('id', id)
      setAddresses(addresses.filter(a => a.id !== id))
    } catch (err) {
      console.error(err)
    }
  }
  
  const handleSetDefault = async (id) => {
    try {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
      await supabase.from('addresses').update({ is_default: true }).eq('id', id)
      
      const { data: newAddr } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
      setAddresses(newAddr || [])
    } catch (err) {
      console.error(err)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-[#FFF3CD] text-[#856404] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[4px] px-[8px] rounded-[2px]">Pending</span>
      case 'confirmed': return <span className="bg-[#D1ECF1] text-[#0C5460] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[4px] px-[8px] rounded-[2px]">Confirmed</span>
      case 'processing': return <span className="bg-[#E8F4FD] text-[#0C5460] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[4px] px-[8px] rounded-[2px]">Processing</span>
      case 'out_for_delivery': return <span className="bg-[#D4EDDA] text-[#155724] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[4px] px-[8px] rounded-[2px]">Out for Delivery</span>
      case 'delivered': return <span className="bg-[#D4EDDA] text-[#155724] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[4px] px-[8px] rounded-[2px]">Delivered</span>
      case 'cancelled': return <span className="bg-[#F8D7DA] text-[#721C24] font-body font-normal text-[8px] uppercase tracking-[0.1em] py-[4px] px-[8px] rounded-[2px]">Cancelled</span>
      default: return null
    }
  }

  if (authLoading || (!isLoggedIn && !authLoading)) {
    return (
      <div className="pt-[140px] pb-20 min-h-[60vh] flex justify-center items-center">
        <Loader2 className="animate-spin text-[#C8726A]" size={24} />
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto pt-[140px] pb-20 px-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-[32px] text-[#1C1410]">My Account</h1>
          <p className="font-body font-light text-[12px] text-[#6B5E54] mt-1.5">
            Welcome, {user?.email}
          </p>
        </div>
        <button 
          onClick={handleSignOut}
          className="border-[0.5px] border-[#E8E4DF] bg-white font-body font-normal text-[9px] uppercase tracking-[0.1em] text-[#6B5E54] py-2 px-4 rounded-[2px] hover:text-[#1C1410] hover:border-[#1C1410] transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-8 border-b-[0.5px] border-[#E8E4DF]">
        <button
          onClick={() => setActiveTab('orders')}
          className={`font-body font-normal text-[10px] uppercase tracking-[0.1em] pb-3 px-1 transition-colors ${
            activeTab === 'orders' 
              ? 'text-[#1C1410] border-b-[1.5px] border-[#1C1410]' 
              : 'text-[#B5A89E] hover:text-[#6B5E54]'
          }`}
        >
          My Orders
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`font-body font-normal text-[10px] uppercase tracking-[0.1em] pb-3 px-1 transition-colors ${
            activeTab === 'addresses' 
              ? 'text-[#1C1410] border-b-[1.5px] border-[#1C1410]' 
              : 'text-[#B5A89E] hover:text-[#6B5E54]'
          }`}
        >
          My Addresses
        </button>
      </div>

      {/* Loading state for tabs */}
      {dataLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-[#B5A89E]" size={24} />
        </div>
      ) : (
        <div className="mt-8">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <ShoppingBag size={32} className="text-[#B5A89E]" />
                  <h2 className="font-display text-[20px] text-[#1C1410] mt-4">No orders yet</h2>
                  <p className="font-body font-light text-[11px] text-[#6B5E54] mt-2">
                    Your orders will appear here once you shop.
                  </p>
                  <a 
                    href="/shop"
                    className="mt-5 bg-[#C8726A] text-white font-body font-normal text-[9px] uppercase tracking-[0.1em] py-2.5 px-6 rounded-[2px] hover:opacity-90 transition-opacity"
                  >
                    Shop Now
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border-[0.5px] border-[#E8E4DF] rounded-[4px] p-5 flex flex-col gap-4">
                      {/* Top Row */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-body font-normal text-[10px] uppercase tracking-[0.1em] text-[#C8726A]">
                            {order.order_number}
                          </div>
                          <div className="font-body font-light text-[10px] text-[#6B5E54] mt-1">
                            Placed {formatDate(order.created_at)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {getStatusBadge(order.status)}
                          <div className="font-body font-normal text-[13px] text-[#1C1410]">
                            د.إ {(order.total / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Images Row */}
                      <div className="flex items-center overflow-x-auto pb-2 -ml-2 pl-2">
                        {order.order_items.slice(0, 4).map((item, i) => (
                          <div key={item.id} className={`w-12 h-[60px] bg-[#F2EDE8] rounded-[4px] relative shrink-0 border-[0.5px] border-white shadow-sm ${i > 0 ? '-ml-2' : ''}`}>
                            {item.product_snapshot?.image && (
                              <img src={item.product_snapshot.image} alt="product" className="w-full h-full object-cover rounded-[4px]" />
                            )}
                          </div>
                        ))}
                        {order.order_items.length > 4 && (
                          <div className="w-12 h-[60px] bg-[#F2EDE8] rounded-[4px] flex items-center justify-center shrink-0 border-[0.5px] border-white shadow-sm -ml-2 z-10">
                            <span className="font-body font-normal text-[9px] text-[#6B5E54]">+{order.order_items.length - 4}</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Row */}
                      <div className="flex justify-between items-center pt-2 border-t-[0.5px] border-[#E8E4DF]">
                        <span className="font-body font-light text-[10px] text-[#6B5E54]">
                          {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
                        </span>
                        <a 
                          href={`/track?order=${order.order_number}`}
                          className="font-body font-normal text-[9px] uppercase tracking-[0.1em] text-[#C8726A] hover:text-[#1C1410] transition-colors"
                        >
                          Track / View Details
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              {addresses.length === 0 && !showAddressForm ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <MapPin size={32} className="text-[#B5A89E]" />
                  <h2 className="font-display text-[20px] text-[#1C1410] mt-4">No saved addresses</h2>
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="mt-5 bg-[#1C1410] text-white font-body font-normal text-[9px] uppercase tracking-[0.1em] py-2.5 px-6 rounded-[2px] hover:opacity-90 transition-opacity"
                  >
                    Add an address
                  </button>
                </div>
              ) : (
                <>
                  {!showAddressForm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {addresses.map(addr => (
                        <div key={addr.id} className="bg-white border-[0.5px] border-[#E8E4DF] rounded-[4px] p-5 relative">
                          {addr.is_default && (
                            <span className="absolute top-4 right-4 bg-[#F2EDE8] text-[#6B5E54] font-body font-normal text-[8px] uppercase tracking-[0.08em] py-1 px-2 rounded-[2px]">
                              Default
                            </span>
                          )}
                          
                          <div className="font-display text-[14px] text-[#1C1410] mb-2 pr-12">
                            {addr.firstName} {addr.lastName}
                          </div>
                          
                          <div className="font-body font-light text-[11px] text-[#6B5E54] leading-[1.7]">
                            <div>{addr.area}, {addr.address}</div>
                            <div>Dubai, UAE</div>
                            <div>{addr.phone}</div>
                          </div>

                          <div className="flex gap-4 mt-4 pt-4 border-t-[0.5px] border-[#E8E4DF]">
                            <button 
                              onClick={() => {
                                setFormData(addr)
                                setShowAddressForm(true)
                              }}
                              className="font-body font-normal text-[9px] uppercase text-[#6B5E54] hover:text-[#1C1410]"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="font-body font-normal text-[9px] uppercase text-[#C8726A] hover:opacity-80"
                            >
                              Delete
                            </button>
                            {!addr.is_default && (
                              <button 
                                onClick={() => handleSetDefault(addr.id)}
                                className="font-body font-normal text-[9px] uppercase text-[#1C1410] ml-auto hover:opacity-70"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!showAddressForm && (
                    <button 
                      onClick={() => {
                        setFormData({ id: null, firstName: '', lastName: '', phone: '', area: '', address: '', is_default: false })
                        setShowAddressForm(true)
                      }}
                      className="w-full py-4 border-[0.5px] border-dashed border-[#E8E4DF] rounded-[4px] flex items-center justify-center gap-2 font-body font-normal text-[10px] uppercase tracking-[0.1em] text-[#B5A89E] hover:border-[#1C1410] hover:text-[#1C1410] transition-colors"
                    >
                      <Plus size={16} /> Add New Address
                    </button>
                  )}
                  
                  {/* ADDRESS FORM */}
                  {showAddressForm && (
                    <div className="bg-white border-[0.5px] border-[#E8E4DF] rounded-[4px] p-6">
                      <h3 className="font-display text-[20px] text-[#1C1410] mb-5">
                        {formData.id ? 'Edit Address' : 'New Address'}
                      </h3>
                      
                      <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
                        <div className="flex gap-4">
                          <input required type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="flex-1 h-[44px] px-3 border-[0.5px] border-[#E8E4DF] rounded-[2px] font-body text-[12px] outline-none focus:border-[#1C1410]" />
                          <input required type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="flex-1 h-[44px] px-3 border-[0.5px] border-[#E8E4DF] rounded-[2px] font-body text-[12px] outline-none focus:border-[#1C1410]" />
                        </div>
                        
                        <input required type="tel" placeholder="Phone (e.g. +971 5X XXX XXXX)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-[44px] px-3 border-[0.5px] border-[#E8E4DF] rounded-[2px] font-body text-[12px] outline-none focus:border-[#1C1410]" />
                        
                        <select required value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full h-[44px] px-3 border-[0.5px] border-[#E8E4DF] rounded-[2px] font-body text-[12px] outline-none focus:border-[#1C1410] bg-white">
                          <option value="">Select Dubai Area</option>
                          <option value="Jumeirah">Jumeirah</option>
                          <option value="Downtown Dubai">Downtown Dubai</option>
                          <option value="Dubai Marina">Dubai Marina</option>
                          <option value="Business Bay">Business Bay</option>
                          <option value="Al Barsha">Al Barsha</option>
                          <option value="Deira">Deira</option>
                          <option value="Bur Dubai">Bur Dubai</option>
                          <option value="Palm Jumeirah">Palm Jumeirah</option>
                          <option value="Other">Other Area (Dubai Only)</option>
                        </select>

                        <input required type="text" placeholder="Street / Building / Flat" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full h-[44px] px-3 border-[0.5px] border-[#E8E4DF] rounded-[2px] font-body text-[12px] outline-none focus:border-[#1C1410]" />

                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input type="checkbox" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} className="w-4 h-4 accent-[#1C1410]" />
                          <span className="font-body font-light text-[12px] text-[#1C1410]">Set as default address</span>
                        </label>

                        <div className="flex gap-3 mt-4">
                          <button type="submit" disabled={formLoading} className="flex-1 h-[44px] bg-[#1C1410] text-white rounded-[2px] font-body font-normal text-[10px] uppercase tracking-[0.1em] hover:opacity-90 flex justify-center items-center">
                            {formLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Address'}
                          </button>
                          <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 h-[44px] bg-white border-[0.5px] border-[#E8E4DF] text-[#6B5E54] rounded-[2px] font-body font-normal text-[10px] uppercase tracking-[0.1em] hover:border-[#1C1410] hover:text-[#1C1410]">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
