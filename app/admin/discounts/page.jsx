import { supabaseAdmin } from '@/lib/supabase';
import DiscountsClient from './DiscountsClient';

export const dynamic = 'force-dynamic';

export default async function AdminDiscountsPage() {
  const { data: discounts } = await supabaseAdmin
    .from('discounts').select('*').order('created_at', { ascending: false });
  return <DiscountsClient initialDiscounts={discounts || []} />;
}
