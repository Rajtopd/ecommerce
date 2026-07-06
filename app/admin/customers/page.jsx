import { supabaseAdmin } from '@/lib/supabase';
import CustomersClient from './CustomersClient';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, phone, created_at')
    .order('created_at', { ascending: false });

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('user_id, total, payment_status')
    .not('user_id', 'is', null);

  const stats = {};
  for (const o of orders || []) {
    if (!stats[o.user_id]) stats[o.user_id] = { order_count: 0, total_spent: 0 };
    stats[o.user_id].order_count += 1;
    if (o.payment_status === 'paid') stats[o.user_id].total_spent += o.total || 0;
  }

  const customers = (users || []).map(u => ({
    ...u,
    order_count: stats[u.id]?.order_count || 0,
    total_spent: stats[u.id]?.total_spent || 0,
  }));

  return <CustomersClient customers={customers} />;
}
