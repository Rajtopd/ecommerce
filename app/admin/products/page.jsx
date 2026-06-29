import { supabaseAdmin } from '@/lib/supabase';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function ProductsPage() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false });

  return <ProductsClient initialProducts={products || []} />;
}
