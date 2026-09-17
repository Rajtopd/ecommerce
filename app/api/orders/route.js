import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/content'
import { evaluateDiscount } from '@/lib/discounts'

// Places a Cash-on-Delivery order in one step: validate + price the cart
// server-side, then write the order, its line items, and stock in one go.
// There is no payment gateway anymore, so this endpoint is the only place
// an order gets created — nothing else waits for a webhook to confirm it.
export async function POST(req) {
  try {
    // No guest checkout — a valid signed-in customer is required.
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user } } = token ? await supabaseAdmin.auth.getUser(token) : { data: { user: null } }

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to checkout.' }, { status: 401 })
    }

    const { items, discountCode, shippingAddress } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName ||
        !shippingAddress.phone || !shippingAddress.address || !shippingAddress.area) {
      return NextResponse.json({ error: 'Missing delivery address' }, { status: 400 })
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

    // Fetch real prices + stock from the database to prevent client-side spoofing.
    // Keep the full variant+product rows around — they're needed again below
    // for the order_items snapshot, so there's no point re-querying them.
    let subtotal = 0
    const variants = []
    for (const item of items) {
      const { data: variant, error: variantError } = await supabaseAdmin
        .from('product_variants')
        .select('*, products(*)')
        .eq('id', item.variantId)
        .single()

      if (variantError || !variant) {
        return NextResponse.json({ error: `Variant not found: ${item.name}` }, { status: 400 })
      }
      if (variant.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${item.name}` }, { status: 400 })
      }

      const currentPrice = variant.products.sale_price != null ? variant.products.sale_price : variant.products.base_price
      subtotal += currentPrice * item.quantity
      variants.push({ variant, quantity: item.quantity, currentPrice })
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

    // TODO(human): Write the order.
    //
    // At this point `variants` holds each { variant, quantity, currentPrice }
    // with `variant.products` already joined in, and the totals above
    // (subtotal, discountAmount, appliedCode, shippingCharge, vatAmount,
    // totalAmount) are the authoritative, server-checked numbers.
    //
    // Implement, in order:
    //   1. Insert one row into `orders`: order_number ('SS-' + 6 random
    //      uppercase alphanumeric chars — e.g.
    //      'SS-' + Math.random().toString(36).substring(2, 8).toUpperCase()),
    //      status 'confirmed', payment_status 'cod', user_id: user.id,
    //      subtotal, vat_amount: vatAmount, shipping_charge: shippingCharge,
    //      discount_code: appliedCode, discount_amount: discountAmount,
    //      total: totalAmount, shipping_address: shippingAddress,
    //      guest_email: shippingAddress.email, guest_phone:
    //      shippingAddress.phone, confirmed_at: new Date().toISOString().
    //      Capture the inserted row's id — everything below needs it.
    //   2. For each entry in `variants`: insert an `order_items` row
    //      (order_id, product_id: variant.product_id, variant_id: variant.id,
    //      quantity, unit_price: currentPrice, total_price: currentPrice *
    //      quantity, product_snapshot: { name: variant.products.name, color:
    //      variant.color, size: variant.size, sku: variant.sku, image:
    //      variant.products.images?.[0] || '' }), then decrement stock via
    //      the existing `decrement_stock` RPC (variant_id, quantity).
    //   3. If appliedCode was set: read the discount's current used_count
    //      from `discounts` by code, then update it to used_count + 1.
    //   4. Return NextResponse.json({ success: true, orderId, orderNumber }).
    //
    // Decide how to handle a failure partway through (e.g. an order_items
    // insert or stock decrement fails after the order row is already
    // created) — the previous Stripe flow just logged and moved on since a
    // failed webhook could retry; there's no retry here, so consider
    // whether that's still good enough for cash orders, or whether a
    // failed step should be surfaced back to the customer/admin instead.

    return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
