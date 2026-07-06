import { supabaseAdmin } from '@/lib/supabase';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [{ data: orders }, { data: items }] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('created_at, total, status, payment_status, discount_amount')
      .gte('created_at', since.toISOString())
      .order('created_at'),
    supabaseAdmin
      .from('order_items')
      .select('quantity, total_price, product_snapshot, orders!inner(payment_status, created_at)')
      .gte('orders.created_at', since.toISOString())
      .eq('orders.payment_status', 'paid'),
  ]);

  // Daily revenue + order counts (30 days)
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    days.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), revenue: 0, orders: 0 });
  }
  const byKey = Object.fromEntries(days.map(d => [d.key, d]));
  let paidRevenue = 0, paidCount = 0;
  for (const o of orders || []) {
    const day = byKey[o.created_at.slice(0, 10)];
    if (!day) continue;
    day.orders += 1;
    if (o.payment_status === 'paid') {
      day.revenue += (o.total || 0) / 100;
      paidRevenue += o.total || 0;
      paidCount += 1;
    }
  }

  // Top products by paid revenue
  const productTotals = {};
  for (const it of items || []) {
    const name = it.product_snapshot?.name || 'Unknown';
    if (!productTotals[name]) productTotals[name] = { name, revenue: 0, units: 0 };
    productTotals[name].revenue += (it.total_price || 0) / 100;
    productTotals[name].units += it.quantity || 0;
  }
  const topProducts = Object.values(productTotals).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Status breakdown
  const statusCounts = {};
  for (const o of orders || []) statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;

  return (
    <AnalyticsClient
      days={days.map(({ label, revenue, orders: o }) => ({ label, revenue: Math.round(revenue * 100) / 100, orders: o }))}
      topProducts={topProducts}
      statusCounts={statusCounts}
      summary={{
        paidRevenue,
        paidCount,
        avgOrder: paidCount ? Math.round(paidRevenue / paidCount) : 0,
        totalOrders: (orders || []).length,
      }}
    />
  );
}
