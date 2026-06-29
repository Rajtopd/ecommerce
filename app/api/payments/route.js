import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    let subtotal = 0

    // Fetch real prices from database to prevent client-side spoofing
    for (const item of items) {
      const { data: variant, error: variantError } = await supabaseAdmin
        .from('product_variants')
        .select('product_id, stock_quantity')
        .eq('id', item.variantId)
        .single()

      if (variantError || !variant) {
        return NextResponse.json({ error: `Variant not found: ${item.name}` }, { status: 400 })
      }

      if (variant.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${item.name}` }, { status: 400 })
      }

      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('base_price, sale_price')
        .eq('id', variant.product_id)
        .single()

      if (productError || !product) {
        return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 })
      }

      const currentPrice = product.sale_price != null ? product.sale_price : product.base_price
      subtotal += currentPrice * item.quantity
    }

    const isFreeShipping = (subtotal / 100) >= 200
    const shippingCharge = isFreeShipping ? 0 : 1500
    const vatAmount = Math.round(subtotal * 0.05)
    const totalAmount = subtotal + shippingCharge + vatAmount

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'aed',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        cart_items: JSON.stringify(items.map(i => ({ v: i.variantId, q: i.quantity })))
      }
    })

    // Insert pending order in database
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: 'SS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'pending',
        subtotal: subtotal,
        vat_amount: vatAmount,
        shipping_charge: shippingCharge,
        total: totalAmount,
        shipping_address: {}, // Will update on confirmation
        payment_intent_id: paymentIntent.id,
        payment_status: 'pending'
      })

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order record' }, { status: 500 })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
