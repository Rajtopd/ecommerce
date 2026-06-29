import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { paymentIntentId, shippingAddress } = await req.json()

    if (!paymentIntentId || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let userId = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      if (user) userId = user.id
    }

    // Retrieve payment intent to verify status and get cart items
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
    }

    // Get the order from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('payment_intent_id', paymentIntentId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'confirmed') {
      // Order already processed
      return NextResponse.json({ success: true, orderId: order.id })
    }

    // Parse items from stripe metadata
    const items = JSON.parse(paymentIntent.metadata.cart_items || '[]')
    
    // Process each item to create order_items and decrement stock
    for (const item of items) {
      // We need product details for snapshot
      const { data: variant } = await supabaseAdmin
        .from('product_variants')
        .select('*, products(*)')
        .eq('id', item.v)
        .single()
        
      if (!variant) continue
      
      const currentPrice = variant.products.sale_price != null ? variant.products.sale_price : variant.products.base_price

      // Insert order item
      await supabaseAdmin.from('order_items').insert({
        order_id: order.id,
        product_id: variant.product_id,
        variant_id: variant.id,
        quantity: item.q,
        unit_price: currentPrice,
        total_price: currentPrice * item.q,
        product_snapshot: {
          name: variant.products.name,
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
          image: variant.products.images?.[0] || ''
        }
      })
      
      // Decrement stock safely
      const { error: rpcError } = await supabaseAdmin.rpc('decrement_stock', {
        variant_id: variant.id,
        quantity: item.q
      })
      
      if (rpcError) {
        console.error('Stock decrement error:', rpcError)
      }
    }

    // Update order status and attach shipping details
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        guest_email: shippingAddress.email,
        guest_phone: shippingAddress.phone,
        shipping_address: shippingAddress,
        confirmed_at: new Date().toISOString(),
        ...(userId ? { user_id: userId } : {})
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Failed to update order status:', updateError)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }

    return NextResponse.json({ success: true, orderId: order.id })

  } catch (error) {
    console.error('Order confirmation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
