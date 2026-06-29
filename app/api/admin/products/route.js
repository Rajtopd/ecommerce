import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to check admin token
const isAdmin = (request) => {
  const token = request.cookies.get('admin_token')?.value;
  return token === process.env.ADMIN_SECRET_TOKEN;
};

export async function GET(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products });
}

export async function POST(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { variants, ...productData } = body;

    // Validation
    if (!productData.name || !productData.slug || !productData.base_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!variants || variants.length === 0) {
      return NextResponse.json({ error: 'At least 1 variant is required' }, { status: 400 });
    }

    // Insert Product
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // Insert Variants
    const variantsToInsert = variants.map(v => ({
      ...v,
      product_id: product.id
    }));

    const { error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .insert(variantsToInsert);

    if (variantsError) {
      // Cleanup: delete product if variants failed
      await supabaseAdmin.from('products').delete().eq('id', product.id);
      return NextResponse.json({ error: variantsError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product });

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
