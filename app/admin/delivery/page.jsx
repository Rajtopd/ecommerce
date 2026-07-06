import { supabaseAdmin } from '@/lib/supabase';
import DeliveryClient from './DeliveryClient';

export const dynamic = 'force-dynamic';

export default async function AdminDeliveryPage() {
  const [{ data: zones }, { data: settings }] = await Promise.all([
    supabaseAdmin.from('delivery_zones').select('*').order('sort_order'),
    supabaseAdmin.from('site_content').select('key, value, label').eq('content_group', 'settings').order('key'),
  ]);

  return <DeliveryClient initialZones={zones || []} initialSettings={settings || []} />;
}
