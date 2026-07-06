import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/content'
import { evaluateDiscount } from '@/lib/discounts'

export async function POST(req) {
  try {
    // No guest checkout — a valid signed-in customer is required.
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user } } = token ? await supabaseAdmin.auth.getUser(token) : { data: { user: null } }

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to checkout.' }, { status: 401 })
    }

    const { items, discountCode } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Reject malformed/malicious quantities and ids before any pricing math —
    // a negative or non-integer quantity can otherwise drive the total to
    // zero/negative and corrupt stock on confirmation.
    const MAX_QUANTITY_PER_ITEM = 100
    for (const item of items) {
      if (typeof item.variantId !== 'string' || !item.variantId) {
        return NextResponse.json({ error: 'Invalid item in cart' }, { status: 400 })
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > MAX_QUANTITY_PER_ITEM) {
        return NextResponse.json({ error: 'Invalid quantity in cart' }, { status: 400 })
      }
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

    // Delivery fee, free-delivery threshold and VAT rate are admin-managed settings
    const settings = await getStoreSettings()

    // Optional discount code (validated server-side)
    let discountAmount = 0
    let appliedCode = null
    if (discountCode) {
      const result = await evaluateDiscount(discountCode, subtotal)
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      discountAmount = result.discount.amount
      appliedCode = result.discount.code
    }

    const discountedSubtotal = subtotal - discountAmount
    const isFreeShipping = discountedSubtotal >= settings.freeDeliveryThresholdFils
    const shippingCharge = isFreeShipping ? 0 : settings.deliveryFeeFils
    const vatAmount = Math.round(discountedSubtotal * (settings.vatRatePercent / 100))
    const totalAmount = discountedSubtotal + shippingCharge + vatAmount

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'aed',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        cart_items: JSON.stringify(items.map(i => ({ v: i.variantId, q: i.quantity }))),
        ...(appliedCode ? { discount_code: appliedCode } : {})
      }
    })

    // Insert pending order in database
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: 'SS-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'pending',
        user_id: user.id,
        subtotal: subtotal,
        vat_amount: vatAmount,
        shipping_charge: shippingCharge,
        discount_code: appliedCode,
        discount_amount: discountAmount,
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
      totals: {
        subtotal,
        discountAmount,
        discountCode: appliedCode,
        shippingCharge,
        vatAmount,
        vatRatePercent: settings.vatRatePercent,
        totalAmount,
      },
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
