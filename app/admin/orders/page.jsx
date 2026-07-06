import { supabaseAdmin } from '@/lib/supabase';
import OrdersClient from './OrdersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function OrdersPage() {
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  return <OrdersClient initialOrders={orders || []} />;
}
