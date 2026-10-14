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

    // Delivery fee and free-delivery threshold are admin-managed settings.
    // Product prices already include VAT, so no tax is added on top.
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
    const totalAmount = discountedSubtotal + shippingCharge

    // 1. Reserve stock first. decrement_stock raises if stock is short, so two
    //    customers racing for the last unit can't both succeed. There is no
    //    webhook retry for cash orders, so anything that fails after this
    //    point is undone via `rollback` and reported to the customer.
    const reserved = []
    let orderId = null
    const rollback = async () => {
      for (const { variant, quantity } of reserved) {
        const { data: current } = await supabaseAdmin
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variant.id)
          .single()
        if (current) {
          await supabaseAdmin
            .from('product_variants')
            .update({ stock_quantity: current.stock_quantity + quantity })
            .eq('id', variant.id)
        }
      }
      // order_items rows are removed by ON DELETE CASCADE
      if (orderId) await supabaseAdmin.from('orders').delete().eq('id', orderId)
    }

    for (const entry of variants) {
      const { error: stockError } = await supabaseAdmin.rpc('decrement_stock', {
        variant_id: entry.variant.id,
        quantity: entry.quantity,
      })
      if (stockError) {
        console.error('Stock reservation failed:', stockError)
        await rollback()
        return NextResponse.json(
          { error: 'Sorry, an item just sold out. Please review your cart.' },
          { status: 409 }
        )
      }
      reserved.push(entry)
    }

    // 2. Create the order as 'pending'. An admin confirms it (and moves it
    //    through later statuses) from the admin panel.
    const orderNumber = 'SS-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        payment_status: 'cod',
        subtotal,
        vat_amount: 0, // column is NOT NULL; VAT is inclusive in prices
        shipping_charge: shippingCharge,
        discount_code: appliedCode,
        discount_amount: discountAmount,
        total: totalAmount,
        shipping_address: shippingAddress,
        guest_email: shippingAddress.email,
        guest_phone: shippingAddress.phone,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('Order insert failed:', orderError)
      await rollback()
      return NextResponse.json({ error: 'Could not place your order. Please try again.' }, { status: 500 })
    }
    orderId = order.id

    // 3. Line items, snapshotting product details at the time of purchase.
    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
      variants.map(({ variant, quantity, currentPrice }) => ({
        order_id: orderId,
        product_id: variant.product_id,
        variant_id: variant.id,
        quantity,
        unit_price: currentPrice,
        total_price: currentPrice * quantity,
        product_snapshot: {
          name: variant.products.name,
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
          image: variant.products.images?.[0] || '',
        },
      }))
    )

    if (itemsError) {
      console.error('Order items insert failed:', itemsError)
      await rollback()
      return NextResponse.json({ error: 'Could not place your order. Please try again.' }, { status: 500 })
    }

    // 4. Count the discount use. The order is already placed, so a failure
    //    here is logged rather than failing the customer's checkout.
    if (appliedCode) {
      const { data: discount } = await supabaseAdmin
        .from('discounts')
        .select('used_count')
        .eq('code', appliedCode)
        .single()
      if (discount) {
        const { error: usageError } = await supabaseAdmin
          .from('discounts')
          .update({ used_count: discount.used_count + 1 })
          .eq('code', appliedCode)
        if (usageError) console.error('Discount usage update failed:', usageError)
      }
    }

    return NextResponse.json({ success: true, orderId, orderNumber })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
