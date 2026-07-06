import { supabaseAdmin } from '@/lib/supabase';
import { ShoppingBag, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function AdminDashboard() {
  // Fetch stats concurrently
  // ponytail: Doing individual queries because Supabase JS client doesn't have a single multi-query endpoint for these aggregates easily.
  // We can use Promise.all to fetch them in parallel.
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: totalOrders },
    { data: revenueData },
    { count: ordersToday },
    { data: lowStock },
    { data: outOfStock },
    { data: recentOrders }
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('total').eq('payment_status', 'paid'),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    supabaseAdmin.from('product_variants').select('*, products(name)').lte('stock_quantity', 5).gt('stock_quantity', 0),
    supabaseAdmin.from('product_variants').select('*, products(name)').eq('stock_quantity', 0),
    supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
  ]);

  const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const lowStockAlerts = [...(outOfStock || []), ...(lowStock || [])];
  
  const formattedDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '30px', fontWeight: 600, color: '#1A0F0A', margin: 0 }}>Dashboard</h1>
          <div style={{ fontSize: '13px', color: '#5C3D2E', marginTop: '3px' }}>{formattedDate} · Dubai, UAE</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/admin/products/new" style={{ background: 'white', color: '#1A0F0A', border: '1px solid #E0D0B8', padding: '9px 18px', fontSize: '13px', fontWeight: 500, borderRadius: '3px', textDecoration: 'none' }}>+ Add Product</Link>
          <Link href="/admin/orders" style={{ background: '#C49B38', color: '#1A0F0A', border: 'none', padding: '9px 18px', fontSize: '13px', fontWeight: 600, borderRadius: '3px', textDecoration: 'none' }}>View Orders</Link>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '6px', padding: '22px', border: '1px solid #E0D0B8' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C3D2E', marginBottom: '10px', fontWeight: 600 }}>Orders Today</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '40px', fontWeight: 700, color: '#1A0F0A', lineHeight: 1 }}>{ordersToday || 0}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '6px', padding: '22px', border: '1px solid #E0D0B8' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C3D2E', marginBottom: '10px', fontWeight: 600 }}>Total Revenue</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '40px', fontWeight: 700, color: '#C49B38', lineHeight: 1 }}>د.إ {(totalRevenue / 100).toFixed(0)}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '6px', padding: '22px', border: '1px solid #E0D0B8' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C3D2E', marginBottom: '10px', fontWeight: 600 }}>Total Orders</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '40px', fontWeight: 700, color: '#1A0F0A', lineHeight: 1 }}>{totalOrders || 0}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '6px', padding: '22px', border: lowStockAlerts.length > 0 ? '1px solid rgba(139,26,44,0.25)' : '1px solid #E0D0B8' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C3D2E', marginBottom: '10px', fontWeight: 600 }}>Low Stock Alerts</div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '40px', fontWeight: 700, color: lowStockAlerts.length > 0 ? '#8B1A2C' : '#1A0F0A', lineHeight: 1 }}>{lowStockAlerts.length}</div>
          {lowStockAlerts.length > 0 && <div style={{ fontSize: '12px', color: '#8B1A2C', marginTop: '8px', fontWeight: 500 }}>⚠ Needs restocking</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        
        {/* RECENT ORDERS TABLE */}
        <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #E0D0B8', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #E0D0B8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A0F0A' }}>Recent Orders</div>
            <Link href="/admin/orders" style={{ fontSize: '12px', color: '#C49B38', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>View All →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E0D0B8' }}>
                <th style={{ textAlign: 'left', padding: '10px 22px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C3D2E', fontWeight: 600 }}>Order</th>
                <th style={{ textAlign: 'left', padding: '10px 22px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C3D2E', fontWeight: 600 }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '10px 22px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C3D2E', fontWeight: 600 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px 22px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C3D2E', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'right', padding: '10px 22px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C3D2E', fontWeight: 600 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #E0D0B8' }}>
                  <td style={{ padding: '12px 22px', fontSize: '13px', color: '#C49B38', fontWeight: 600 }}>
                    <Link href={`/admin/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 22px', fontSize: '13px', color: '#1A0F0A', fontWeight: 500 }}>
                    {order.guest_email || 'Logged in user'}
                  </td>
                  <td style={{ padding: '12px 22px', fontSize: '12px', color: '#5C3D2E' }}>
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 22px' }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      fontWeight: 600,
                      background: order.status === 'delivered' ? 'rgba(26,90,60,0.12)' : 'rgba(196,155,56,0.12)',
                      color: order.status === 'delivered' ? '#1A5A3C' : '#8B6914',
                      textTransform: 'capitalize'
                    }}>
                      {order.status || order.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 22px', fontSize: '13px', fontWeight: 600, color: '#1A0F0A', textAlign: 'right' }}>
                    د.إ {(order.total / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#B5A89E', fontSize: '13px' }}>
                    No recent orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* LOW STOCK ALERTS */}
        {lowStockAlerts.length > 0 && (
          <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #E0D0B8', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #E0D0B8' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A0F0A' }}>Stock Alerts</div>
            </div>
            {lowStockAlerts.map(alert => (
              <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 22px', borderBottom: '1px solid #E0D0B8' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A0F0A' }}>
                    {alert.products?.name || 'Unknown Product'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5C3D2E', marginTop: '2px' }}>
                    Size {alert.size} · {alert.color}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontWeight: 600,
                    background: alert.stock_quantity === 0 ? 'rgba(110,26,44,0.12)' : 'rgba(181,69,27,0.12)',
                    color: alert.stock_quantity === 0 ? '#6E1A2C' : '#B5451B'
                  }}>
                    {alert.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'} ({alert.stock_quantity})
                  </span>
                  <Link href={`/admin/products/${alert.product_id}`} style={{ fontSize: '12px', color: '#C49B38', fontWeight: 500, textDecoration: 'none' }}>
                    Update
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
