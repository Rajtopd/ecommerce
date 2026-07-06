import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { requireAdmin } from '@/lib/adminAuth';

// Refund a paid order via Stripe and mark it refunded.
// Additive: does not alter the existing payment/checkout flow.
export async function POST(request, { params }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, total, payment_intent_id, payment_status, status, refunded_at')
      .eq('id', params.id)
      .single();

    if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.refunded_at) return NextResponse.json({ error: 'Order is already refunded' }, { status: 400 });
    if (order.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Only paid orders can be refunded' }, { status: 400 });
    }
    if (!order.payment_intent_id) {
      return NextResponse.json({ error: 'Order has no payment reference' }, { status: 400 });
    }

    const refund = await stripe.refunds.create({ payment_intent: order.payment_intent_id });

    // Restore stock for refunded items
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', order.id);
    for (const item of orderItems || []) {
      if (item.variant_id) {
        await supabaseAdmin.rpc('increment_stock', { variant_id: item.variant_id, quantity: item.quantity });
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'returned',
        payment_status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: refund.amount,
        refund_id: refund.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      // Refund succeeded on Stripe but DB update failed — surface loudly
      return NextResponse.json(
        { error: `Stripe refund ${refund.id} succeeded but the order record update failed: ${updateError.message}. Update the order manually.` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, refund_id: refund.id, amount: refund.amount });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Refund failed' }, { status: 500 });
  }
}
