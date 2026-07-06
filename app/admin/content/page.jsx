import { supabaseAdmin } from '@/lib/supabase';
import ContentClient from './ContentClient';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const { data: content } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .neq('content_group', 'settings') // settings are edited on the Delivery screen
    .order('key');

  return <ContentClient initialContent={content || []} />;
}
