'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, ShoppingBag, Search, XCircle } from 'lucide-react';
import Link from 'next/link';
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

export default function OrdersClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const { showToast } = useToast();

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Real-time
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fetch full order with items (since postgres_changes only gives the row)
          const { data: newOrder } = await supabase.from('orders').select('*, order_items(*)').eq('id', payload.new.id).single();
          if (newOrder) {
            setOrders(prev => [newOrder, ...prev]);
            showToast('New order: ' + newOrder.order_number, 'success');
          }
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [showToast]);

  // Derived stats
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;
  const outForDeliveryCount = orders.filter(o => o.status === 'out_for_delivery').length;
  const deliveredTodayCount = orders.filter(o => {
    if (o.status !== 'delivered') return false;
    const today = new Date().toISOString().split('T')[0];
    const updated = new Date(o.updated_at).toISOString().split('T')[0];
    return today === updated;
  }).length;

  // Filtering
  const filteredOrders = orders.filter(o => {
    let match = true;
    if (statusFilter !== 'All Statuses' && o.status !== statusFilter.toLowerCase().replace(/ /g, '_')) match = false;
    if (paymentFilter !== 'All' && o.payment_status !== paymentFilter.toLowerCase()) match = false;
    if (search) {
      const q = search.toLowerCase();
      const numMatch = o.order_number?.toLowerCase().includes(q);
      const emailMatch = o.guest_email?.toLowerCase().includes(q);
      if (!numMatch && !emailMatch) match = false;
    }
    if (dateFrom && new Date(o.created_at) < new Date(dateFrom)) match = false;
    if (dateTo && new Date(o.created_at) > new Date(dateTo + 'T23:59:59')) match = false;
    return match;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast('Order status updated to ' + newStatus, 'success');
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update status', 'error');
      }
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const downloadCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Email', 'Items Count', 'Subtotal (AED)', 'VAT (AED)', 'Shipping (AED)', 'Total (AED)', 'Payment Status', 'Order Status'];
    const rows = filteredOrders.map(o => {
      return [
        o.order_number || '',
        new Date(o.created_at).toLocaleDateString('en-GB'),
        o.guest_email || 'Guest',
        o.order_items?.length || 0,
        (o.subtotal / 100).toFixed(2),
        (o.vat_amount / 100).toFixed(2),
        (o.shipping_charge / 100).toFixed(2),
        (o.total / 100).toFixed(2),
        o.payment_status,
        o.status
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csvData = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `soul-sisters-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasFilters = search || statusFilter !== 'All Statuses' || paymentFilter !== 'All' || dateFrom || dateTo;

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      
      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '28px', color: '#1A0F0A' }}>
            Orders
          </span>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '13px', color: '#9C7B5E', marginLeft: '12px' }}>
            ({orders.length} total)
          </span>
        </div>
        
        <button onClick={downloadCSV} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'white', border: '0.5px solid #E0D0B8', color: '#1A0F0A',
          borderRadius: '4px', padding: '10px 20px', cursor: 'pointer',
          fontFamily: '"DM Sans", sans-serif', fontSize: '9px', fontWeight: 400, textTransform: 'uppercase'
        }}>
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* STATS STRIP */}
      <div style={{
        display: 'flex', gap: '40px', marginBottom: '24px',
        background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '6px', padding: '16px 24px'
      }}>
        {[
          { label: 'Pending', count: pendingCount, color: '#92660A', filter: 'pending' },
          { label: 'Processing', count: processingCount, color: '#1A4A8A', filter: 'processing' },
          { label: 'Out for Delivery', count: outForDeliveryCount, color: '#1B5E20', filter: 'out_for_delivery' },
          { label: 'Delivered Today', count: deliveredTodayCount, color: '#1A0F0A', filter: 'delivered' }
        ].map((stat, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '40px', cursor: 'pointer' }} onClick={() => setStatusFilter(stat.filter.replace('_', ' '))}>
            <div>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '28px', color: stat.color, lineHeight: 1 }}>
                {stat.count}
              </div>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9C7B5E', marginTop: '6px' }}>
                {stat.label}
              </div>
            </div>
            {i < 3 && <div style={{ width: '0.5px', height: '32px', background: '#E0D0B8' }} />}
          </div>
        ))}
      </div>

      {/* FILTERS BAR */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Search order number or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ height: '38px', width: '300px', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 300, color: '#1A0F0A', outline: 'none' }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ height: '38px', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 300, color: '#1A0F0A', outline: 'none', background: 'white' }}>
          {['All Statuses', 'Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} style={{ height: '38px', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 300, color: '#1A0F0A', outline: 'none', background: 'white' }}>
          {['All', 'Paid', 'Pending', 'Failed', 'Refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input 
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={{ height: '38px', width: '150px', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 300, color: '#1A0F0A', outline: 'none' }}
        />
        <input 
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={{ height: '38px', width: '150px', border: '0.5px solid #E0D0B8', borderRadius: '4px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 300, color: '#1A0F0A', outline: 'none' }}
        />
        {hasFilters && (
          <span 
            onClick={() => { setSearch(''); setStatusFilter('All Statuses'); setPaymentFilter('All'); setDateFrom(''); setDateTo(''); }}
            style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '9px', textTransform: 'uppercase', color: '#6E1A2C', cursor: 'pointer', marginLeft: '10px' }}>
            Clear Filters
          </span>
        )}
      </div>

      {/* TABLE */}
      <div style={{ background: 'white', border: '0.5px solid #E0D0B8', borderRadius: '6px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF7F0', borderBottom: '0.5px solid #E0D0B8' }}>
              {['Order #', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9C7B5E', padding: '10px 16px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? filteredOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '0.5px solid #E8E4DF', transition: 'background 0.15s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.background = '#FAF7F0'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '14px', color: '#C49B38', letterSpacing: '0.04em' }}>
                  {order.order_number}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px', color: '#1A0F0A' }}>
                    {order.guest_email || 'Unknown'}
                  </div>
                  {!order.user_id && (
                    <span style={{ display: 'inline-block', background: '#F3E8FF', color: '#4A1A6E', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '7px', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '3px', marginTop: '4px' }}>
                      Guest
                    </span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    {order.order_items?.slice(0, 3).map((item, idx) => (
                      <div key={idx} style={{ width: '28px', height: '36px', borderRadius: '3px', background: '#F0EBE1' }} /> // Placeholder for mini images
                    ))}
                    {order.order_items?.length > 3 && (
                      <div style={{ width: '28px', height: '36px', borderRadius: '3px', background: '#F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '9px', color: '#9C7B5E' }}>
                        +{order.order_items.length - 3}
                      </div>
                    )}
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '9px', color: '#9C7B5E' }}>
                    {order.order_items?.length || 0} item(s)
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '12px', color: '#1A0F0A' }}>
                    د.إ {(order.total / 100).toFixed(2)}
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '8px', color: '#9C7B5E', marginTop: '2px' }}>
                    incl. VAT
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ ...STATUS_COLORS[order.payment_status || 'pending'], fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', borderRadius: '3px' }}>
                    {order.payment_status || 'pending'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ border: '0.5px solid #E0D0B8', borderRadius: '4px', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '10px', color: '#1A0F0A', background: 'white', padding: '4px', outline: 'none' }}
                  >
                    {['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '10px', color: '#1A0F0A' }}>
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '9px', color: '#9C7B5E', marginTop: '2px' }}>
                    {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Link href={`/admin/orders/${order.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#C49B38', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '9px', textTransform: 'uppercase' }}>
                    <span style={{ fontSize: '13px' }}>👁</span> View
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} style={{ padding: '48px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ShoppingBag size={32} color="#9C7B5E" />
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: '22px', color: '#1A0F0A', marginTop: '12px' }}>
                      No orders found
                    </div>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: '11px', color: '#9C7B5E', marginTop: '6px' }}>
                      Try adjusting your filters
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
