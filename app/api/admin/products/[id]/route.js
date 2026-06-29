import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to check admin token
const isAdmin = (request) => {
  const token = request.cookies.get('admin_token')?.value;
  return token === process.env.ADMIN_SECRET_TOKEN;
};

export async function GET(request, { params }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { variants, ...productData } = body;

    // Update Product Details if provided
    if (Object.keys(productData).length > 0) {
      const { error: productError } = await supabaseAdmin
        .from('products')
        .update(productData)
        .eq('id', params.id);

      if (productError) {
        return NextResponse.json({ error: productError.message }, { status: 500 });
      }
    }

    // Handle Variants if provided
    if (variants && Array.isArray(variants)) {
      // 1. Fetch existing variants to know what to delete
      const { data: existingVariants } = await supabaseAdmin
        .from('product_variants')
        .select('id')
        .eq('product_id', params.id);

      const existingIds = existingVariants?.map(v => v.id) || [];
      const incomingIds = variants.map(v => v.id).filter(Boolean);
      
      const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
      
      // Delete removed variants
      if (idsToDelete.length > 0) {
        // Ponytail: Ideally we'd check if they've been ordered first.
        // For simplicity as requested, we just attempt delete, which fails if there are FK constraints from orders.
        // If it fails, we catch and suggest soft delete.
        const { error: deleteError } = await supabaseAdmin
          .from('product_variants')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) {
          console.error("Variant delete error (possibly ordered):", deleteError);
          // Soft disable instead of deleting
          await supabaseAdmin
            .from('product_variants')
            .update({ stock_quantity: 0 })
            .in('id', idsToDelete);
        }
      }

      // Upsert Variants
      const variantsToUpsert = variants.map(v => ({
        ...v,
        product_id: params.id
      }));

      const { error: upsertError } = await supabaseAdmin
        .from('product_variants')
        .upsert(variantsToUpsert);

      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Check if product has orders
    const { data: orderItems, error: orderCheckError } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('product_id', params.id)
      .limit(1);

    if (orderCheckError && orderCheckError.code !== '42P01') { // 42P01 means table might not exist in some local setups
      console.error(orderCheckError);
    }

    if (orderItems && orderItems.length > 0) {
      return NextResponse.json({ error: 'Cannot delete product with orders. Set to inactive instead.' }, { status: 400 });
    }

    // Delete variants first
    await supabaseAdmin.from('product_variants').delete().eq('product_id', params.id);
    
    // Then delete product
    const { error: deleteError } = await supabaseAdmin.from('products').delete().eq('id', params.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
