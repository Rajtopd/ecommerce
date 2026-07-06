'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShoppingBag, CreditCard, CheckCircle, Package, Truck, Home, XCircle, RotateCcw, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContext';

// Badge colours map
const STATUS_COLORS = {
  pending: { bg: '#FFF8E7', text: '#92660A' },
  confirmed: { bg: '#E8F4FD', text: '#0C5460' },
  processing: { bg: '#EAF3FF', text: '#1A4A8A' },
  out_for_delivery: { bg: '#E8F5E9', text: '#1B5E20' },
  delivered: { bg: '#E8F5E9', text: '#1B5E20' },
  cancelled: { bg: '#FEECEC', text: '#8B1A1A' },
  returned: { bg: '#F3E8FF', text: '#4A1A6E' },
  paid: { bg: '#E8F5E9', text: '#1B5E20' },
  failed: { bg: '#FEECEC', text: '#8B1A1A' },
  refunded: { bg: '#F3E8FF', text: '#4A1A6E' }
};

const TIMELINE_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: ShoppingBag },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle }, // Assuming payment confirmed logic is bundled here for simplicity or we can add payment
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home }
];

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for tracking form
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [savingShipment, setSavingShipment] = useState(false);

  // States for notes
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setNotes(data.order.notes || '');
      }
    } catch (e) {
      showToast('Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast('Order status updated', 'success');
        setOrder(prev => ({ ...prev, status: newStatus }));
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update status', 'error');
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const handleSaveTracking = async () => {
    if (!courierName || !trackingNumber) return showToast('Courier and tracking number are required', 'error');
    setSavingShipment(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}/shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courier_name: courierName, tracking_number: trackingNumber, tracking_url: trackingUrl, estimated_delivery: estimatedDelivery })
      });
      if (res.ok) {
        showToast('Tracking info saved', 'success');
        setShowTrackingForm(false);
        fetchOrder(); // Reload to get shipment and potential status update
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save tracking', 'error');
      }
    } catch (e) {
      showToast('Error saving tracking', 'error');
    } finally {
      setSavingShipment(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (res.ok) {
        showToast('Notes saved successfully', 'success');
      } else {
        showToast('Failed to save notes', 'error');
      }
    } catch (e) {
      showToast('Error saving notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancelOrder = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        showToast('Order cancelled. Stock restored.', 'success');
        setOrder(prev => ({ ...prev, status: 'cancelled' }));
        setShowCancelModal(false);
      } else {
        showToast('Failed to cancel order', 'error');
      }
    } catch (e) {
      showToast('Error cancelling order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnOrder = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'returned' })
      });
      if (res.ok) {
        showToast('Order marked as returned', 'success');
        setOrder(prev => ({ ...prev, status: 'returned' }));
        setShowReturnModal(false);
      } else {
        showToast('Failed to return order', 'error');
      }
    } catch (e) {
      showToast('Error returning order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundOrder = async () => {
    const amount = (order.total / 100).toFixed(2);
    if (!confirm(`Refund د.إ ${amount} to the customer via Stripe? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}/refund`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(`Refunded د.إ ${(data.amount / 100).toFixed(2)}. Stock restored.`, 'success');
        setOrder(prev => ({ ...prev, status: 'returned', payment_status: 'refunded', refunded_at: new Date().toISOString() }));
      } else {
        showToast(data.error || 'Refund failed', 'error');
      }
    } catch (e) {
      showToast('Error processing refund', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={24} color="#C49B38" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '12px', color: '#9C7B5E', marginTop: '12px' }}>Loading order...</span>
      </div>
    );
  }

  if (!order) return null;

  const shipment = order.shipments?.[0];
  const isCancelled = order.status === 'cancelled';
  const isReturned = order.status === 'returned';

  // Determine current timeline step index
  let currentStepIndex = TIMELINE_STEPS.findIndex(s => s.id === order.status);
  if (currentStepIndex === -1 && (order.status === 'processing' || order.status === 'out_for_delivery' || order.status === 'delivered')) {
     // Ensure it doesn't get stuck if somehow a status jumps. 
     // This basic index check works if the flow is linear.
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <Link href="/admin/orders" style={{ textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '9px', textTransform: 'uppercase', color: '#9C7B5E', display: 'inline-block', marginBottom: '24px' }} onMouseOver={e => e.currentTarget.style.color = '#1A0F0A'} onMouseOut={e => e.currentTarget.style.color = '#9C7B5E'}>
        ← All Orders
      </Link>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '30px', color: '#1A0F0A', margin: 0 }}>
            {order.order_number}
          </h1>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px', color: '#9C7B5E', marginTop: '6px' }}>
            Placed {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px', color: '#9C7B5E', marginTop: '2px' }}>
            {order.guest_email || 'Customer'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <span style={{ ...STATUS_COLORS[order.payment_status || 'pending'], fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', borderRadius: '3px' }}>
            Payment: {order.payment_status || 'pending'}
          </span>
          <select 
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '9px 16px', fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '11px', color: '#1A0F0A', outline: 'none' }}
          >
            {['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>
          {order.payment_status === 'paid' && !order.refunded_at && (
            <button
              onClick={handleRefundOrder}
              disabled={actionLoading}
              style={{ background: 'transparent', border: '1px solid #E8C4C4', color: '#8B1A2C', borderRadius: '4px', padding: '8px 16px', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '11px', cursor: actionLoading ? 'not-allowed' : 'pointer' }}
            >
              {actionLoading ? 'Working…' : `Refund د.إ ${(order.total / 100).toFixed(2)}`}
            </button>
          )}
          {order.refunded_at && (
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '10px', color: '#4A1A6E' }}>
              Refunded {new Date(order.refunded_at).toLocaleDateString()} · {order.refund_id}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* LEFT COLUMN */}
        <div style={{ flex: '1 1 60%', minWidth: '400px' }}>
          
          {/* ITEMS CARD */}
          <div style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '6px', padding: '24px' }}>
            <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#9C7B5E', marginBottom: '16px' }}>
              Ordered Items
            </h2>
            
            {order.order_items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '14px', padding: '14px 0', borderBottom: '0.5px solid #E8E4DF' }}>
                <div style={{ width: '56px', height: '72px', borderRadius: '4px', background: '#F0EBE1', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                  {item.product_snapshot?.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product_snapshot.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '16px', color: '#1A0F0A' }}>
                    {item.product_snapshot?.name || 'Product'}
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#9C7B5E' }}>
                    {item.product_snapshot?.size ? `Size ${item.product_snapshot.size} · ${item.product_snapshot.color || ''}` : `Variant ID: ${item.variant_id}`}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#9C7B5E' }}>
                    Qty: {item.quantity}
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '13px', color: '#1A0F0A', marginTop: 'auto' }}>
                    د.إ {((item.unit_price || 0) / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '0.5px solid #E0D0B8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px' }}>
                <span style={{ color: '#9C7B5E' }}>Subtotal</span>
                <span style={{ color: '#1A0F0A' }}>د.إ {(order.subtotal / 100).toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px' }}>
                  <span style={{ color: '#2E7D5E' }}>Discount{order.discount_code ? ` (${order.discount_code})` : ''}</span>
                  <span style={{ color: '#2E7D5E' }}>−د.إ {(order.discount_amount / 100).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px' }}>
                <span style={{ color: '#9C7B5E' }}>Shipping</span>
                <span style={{ color: order.shipping_charge === 0 ? '#1B5E20' : '#1A0F0A' }}>
                  {order.shipping_charge === 0 ? 'Free' : `د.إ ${(order.shipping_charge / 100).toFixed(2)}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px' }}>
                <span style={{ color: '#9C7B5E' }}>VAT (5%)</span>
                <span style={{ color: '#1A0F0A' }}>د.إ {(order.vat_amount / 100).toFixed(2)}</span>
              </div>
              
              <div style={{ borderTop: '0.5px solid #E0D0B8', margin: '8px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '18px', color: '#1A0F0A' }}>Total</span>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '18px', color: '#1A0F0A' }}>د.إ {(order.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* TIMELINE CARD */}
          <div style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '6px', padding: '24px', marginTop: '16px' }}>
            <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#9C7B5E', marginBottom: '24px' }}>
              Order Timeline
            </h2>
            
            {isCancelled || isReturned ? (
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FEECEC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isReturned ? <RotateCcw size={15} color="#8B1A1A" /> : <XCircle size={15} color="#8B1A1A" />}
                </div>
                <div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B1A1A' }}>
                    {isReturned ? 'Return Requested' : 'Order Cancelled'}
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '9px', color: '#9C7B5E', marginTop: '4px' }}>
                    {new Date(order.updated_at).toLocaleString('en-GB')}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCompleted = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  const isUpcoming = currentStepIndex < idx;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} style={{ display: 'flex', gap: '15px', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: isCurrent ? '#C49B38' : isCompleted ? '#1A0F0A' : '#F0EBE1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(196,155,56,0.2)' : 'none',
                          zIndex: 2
                        }}>
                          <Icon size={15} color={isCurrent ? '#1A0F0A' : isCompleted ? 'white' : '#9C7B5E'} />
                        </div>
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <div style={{
                            width: '2px', height: '32px',
                            background: isCompleted && !isCurrent ? '#E0D0B8' : 'transparent',
                            borderLeft: isUpcoming || isCurrent ? '1px dashed #E0D0B8' : 'none'
                          }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: '32px', paddingTop: '8px' }}>
                        <div style={{
                          fontFamily: '"DM Sans", sans-serif',
                          fontWeight: isCurrent ? 600 : isCompleted ? 500 : 400,
                          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em',
                          color: isCurrent ? '#C49B38' : isCompleted ? '#1A0F0A' : '#9C7B5E'
                        }}>
                          {step.label}
                        </div>
                        {isCompleted && (
                          <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '9px', color: '#9C7B5E', marginTop: '4px' }}>
                            {idx === 0 ? new Date(order.created_at).toLocaleString('en-GB') : (isCurrent ? new Date(order.updated_at).toLocaleString('en-GB') : '')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
        
        {/* RIGHT COLUMN */}
        <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
          
          {/* CUSTOMER CARD */}
          <div style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '6px', padding: '24px' }}>
            <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#9C7B5E', marginBottom: '16px' }}>
              Customer
            </h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '16px', color: '#9C7B5E' }}>
                  {(order.guest_email || 'G')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '16px', color: '#1A0F0A' }}>
                  {order.guest_email ? order.guest_email.split('@')[0] : 'Guest User'}
                </div>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#9C7B5E' }}>
                  {order.guest_email || 'No email provided'}
                </div>
                {order.guest_phone && (
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#9C7B5E' }}>
                    {order.guest_phone}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span style={{ background: order.user_id ? '#E8F5E9' : '#F0EBE1', color: order.user_id ? '#1B5E20' : '#9C7B5E', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '7px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '3px' }}>
                {order.user_id ? 'Registered' : 'Guest'}
              </span>
            </div>
            {order.user_id && (
              <Link href={`/admin/orders?email=${order.guest_email}`} style={{ display: 'block', marginTop: '16px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '9px', textTransform: 'uppercase', color: '#C49B38', textDecoration: 'none' }}>
                View All Orders
              </Link>
            )}
          </div>

          {/* DELIVERY ADDRESS */}
          <div style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '6px', padding: '24px', marginTop: '16px' }}>
            <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#9C7B5E', marginBottom: '16px' }}>
              Delivery Address
            </h2>
            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '15px', color: '#1A0F0A', marginBottom: '4px' }}>
              {order.shipping_address?.firstName} {order.shipping_address?.lastName}
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px', color: '#9C7B5E', lineHeight: 1.9 }}>
              {order.shipping_address?.address}<br/>
              {order.shipping_address?.apartment && <>{order.shipping_address.apartment}<br/></>}
              {order.shipping_address?.city}, {order.shipping_address?.country}
            </div>
          </div>

          {/* SHIPMENT CARD */}
          <div style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '6px', padding: '24px', marginTop: '16px' }}>
            <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#9C7B5E', marginBottom: '16px' }}>
              Shipment
            </h2>
            
            {!shipment && !showTrackingForm && (
              <>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px', color: '#9C7B5E', marginBottom: '12px' }}>
                  No shipment added yet
                </div>
                <button onClick={() => setShowTrackingForm(true)} style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '10px 20px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '9px', color: '#1A0F0A', cursor: 'pointer' }}>
                  Add Tracking Info
                </button>
              </>
            )}

            {shipment && !showTrackingForm && (
              <>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '12px', color: '#1A0F0A', marginBottom: '4px' }}>
                  {shipment.courier_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '16px', color: '#C49B38' }}>
                    {shipment.tracking_number}
                  </span>
                  <Copy size={13} color="#9C7B5E" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(shipment.tracking_number); showToast('Copied!', 'success'); }} />
                </div>
                {shipment.tracking_url && (
                  <a href={shipment.tracking_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#C49B38', textDecoration: 'none', marginBottom: '8px' }}>
                    Track Package <ExternalLink size={11} />
                  </a>
                )}
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#9C7B5E', marginBottom: '12px' }}>
                  Est. Delivery: {shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString('en-GB') : 'TBA'}
                </div>
                <span style={{ ...STATUS_COLORS[shipment.status || 'pending'], fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', borderRadius: '3px' }}>
                  {shipment.status?.replace(/_/g, ' ') || 'In Transit'}
                </span>

                <div onClick={() => setShowTrackingForm(true)} style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '9px', textTransform: 'uppercase', color: '#9C7B5E', marginTop: '16px', cursor: 'pointer' }}>
                  Edit Tracking
                </div>
              </>
            )}

            {showTrackingForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="Courier Name * (e.g. DHL)" value={courierName} onChange={e => setCourierName(e.target.value)} style={{ width: '100%', height: '38px', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 300, boxSizing: 'border-box' }} />
                <input type="text" placeholder="Tracking Number *" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} style={{ width: '100%', height: '38px', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 300, boxSizing: 'border-box' }} />
                <input type="text" placeholder="Tracking URL (optional)" value={trackingUrl} onChange={e => setTrackingUrl(e.target.value)} style={{ width: '100%', height: '38px', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 300, boxSizing: 'border-box' }} />
                <input type="date" value={estimatedDelivery} onChange={e => setEstimatedDelivery(e.target.value)} style={{ width: '100%', height: '38px', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 300, boxSizing: 'border-box' }} />
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button onClick={handleSaveTracking} disabled={savingShipment} style={{ background: '#C49B38', color: '#1A0F0A', border: 'none', borderRadius: '4px', padding: '10px 20px', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '11px', cursor: 'pointer', flex: 1 }}>
                    {savingShipment ? 'Saving...' : 'Save Tracking'}
                  </button>
                  <button onClick={() => setShowTrackingForm(false)} style={{ background: 'transparent', color: '#9C7B5E', border: 'none', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '10px', cursor: 'pointer', padding: '0 10px' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ADMIN NOTES CARD */}
          <div style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '6px', padding: '24px', marginTop: '16px' }}>
            <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#9C7B5E', marginBottom: '16px' }}>
              Admin Notes
            </h2>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Internal notes about this order..."
              style={{ width: '100%', border: '0.5px solid #E0D0B8', borderRadius: '4px', background: '#FAF7F0', padding: '12px', fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '12px', color: '#1A0F0A', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = '#C49B38'; e.target.style.background = 'white'; }}
              onBlur={e => { e.target.style.borderColor = '#E0D0B8'; e.target.style.background = '#FAF7F0'; }}
            />
            <button onClick={handleSaveNotes} disabled={savingNotes} style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '8px 16px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '9px', color: '#1A0F0A', cursor: 'pointer', marginTop: '10px' }}>
              {savingNotes ? 'Saving...' : 'Save Note'}
            </button>
          </div>

          {/* DANGER ZONE */}
          {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'delivered') && (
            <div style={{ background: 'white', border: '0.5px solid #E0C0C0', borderRadius: '6px', padding: '24px', marginTop: '16px' }}>
              <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8B1A1A', marginBottom: '16px' }}>
                Order Actions
              </h2>
              
              {(order.status === 'pending' || order.status === 'confirmed') && (
                <button onClick={() => setShowCancelModal(true)} style={{ width: '100%', background: 'white', border: '0.5px solid #C0392B', borderRadius: '4px', padding: '10px 20px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '10px', color: '#C0392B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <XCircle size={14} /> Cancel Order
                </button>
              )}
              
              {order.status === 'delivered' && (
                <button onClick={() => setShowReturnModal(true)} style={{ width: '100%', background: 'white', border: '0.5px solid #C0392B', borderRadius: '4px', padding: '10px 20px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '10px', color: '#C0392B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <RotateCcw size={14} /> Mark as Returned
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '6px', padding: '32px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '20px', color: '#1A0F0A', margin: '0 0 12px 0' }}>Cancel this order?</h3>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '12px', color: '#9C7B5E', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Order {order.order_number} will be cancelled and stock will be restored automatically.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCancelModal(false)} style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '10px 20px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '10px', color: '#1A0F0A', cursor: 'pointer' }}>
                Keep Order
              </button>
              <button onClick={handleCancelOrder} disabled={actionLoading} style={{ background: 'white', border: '0.5px solid #C0392B', borderRadius: '4px', padding: '10px 20px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '10px', color: '#C0392B', cursor: 'pointer' }}>
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '6px', padding: '32px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '20px', color: '#1A0F0A', margin: '0 0 12px 0' }}>Mark order {order.order_number} as returned?</h3>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '12px', color: '#9C7B5E', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              This will update the order status. Stock is not automatically restored for returns.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowReturnModal(false)} style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '10px 20px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '10px', color: '#1A0F0A', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleReturnOrder} disabled={actionLoading} style={{ background: 'white', border: '0.5px solid #C0392B', borderRadius: '4px', padding: '10px 20px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '10px', color: '#C0392B', cursor: 'pointer' }}>
                {actionLoading ? 'Updating...' : 'Yes, Mark Returned'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
