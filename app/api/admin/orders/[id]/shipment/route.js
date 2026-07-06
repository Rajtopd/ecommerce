import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

const isAdmin = (request) => requireAdmin(request);

export async function POST(request, { params }) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { courier_name, tracking_number, tracking_url, estimated_delivery } = await request.json();

    if (!courier_name || !tracking_number) {
      return NextResponse.json({ error: 'Courier and tracking number required' }, { status: 400 });
    }

    // Upsert shipment
    const { data: shipment, error: shipmentError } = await supabaseAdmin
      .from('shipments')
      .upsert({
        order_id: params.id,
        courier_name,
        tracking_number,
        tracking_url,
        estimated_delivery,
        status: 'in_transit',
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'order_id' })
      .select()
      .single();

    if (shipmentError) return NextResponse.json({ error: shipmentError.message }, { status: 500 });

    // Auto-transition confirmed order to processing
    const { data: order } = await supabaseAdmin.from('orders').select('status').eq('id', params.id).single();
    if (order && order.status === 'confirmed') {
      await supabaseAdmin.from('orders').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', params.id);
    }

    return NextResponse.json({ shipment });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
