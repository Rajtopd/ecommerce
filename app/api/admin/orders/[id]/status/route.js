import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

const isAdmin = (request) => requireAdmin(request);

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

export async function PATCH(request, { params }) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // If cancelled, fetch order items to restore stock
    if (status === 'cancelled') {
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('variant_id, quantity')
        .eq('order_id', params.id);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          if (item.variant_id) {
            await supabaseAdmin.rpc('increment_stock', {
              variant_id: item.variant_id,
              quantity: item.quantity
            });
          }
        }
      }
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, status });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
