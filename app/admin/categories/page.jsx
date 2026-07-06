import { supabaseAdmin } from '@/lib/supabase';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const { data: categories } = await supabaseAdmin.from('categories').select('*').order('sort_order');

  // Product counts per category (guards deletion decisions)
  const { data: products } = await supabaseAdmin.from('products').select('category');
  const counts = {};
  for (const p of products || []) counts[p.category] = (counts[p.category] || 0) + 1;

  return <CategoriesClient initialCategories={categories || []} productCounts={counts} />;
}
