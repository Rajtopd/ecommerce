import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const orderNumber = searchParams.get('order')

  if (!orderNumber) {
    return NextResponse.json({ error: 'Order number required' }, { status: 400 })
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // IMPORTANT SECURITY: Strip sensitive fields
    const { payment_intent_id, ...safeOrder } = order

    return NextResponse.json({ order: safeOrder })
  } catch (error) {
    console.error('Track order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
