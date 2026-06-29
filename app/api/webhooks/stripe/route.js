import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event

  try {
    // Note: STRIPE_WEBHOOK_SECRET should be set in .env.local
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhooks will not be verified securely.')
      throw new Error('Missing Stripe Webhook Secret')
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Webhook Error: ' + err.message }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('payment_intent_id', paymentIntent.id)
    .single()

  if (order && order.status === 'pending') {
    const items = JSON.parse(paymentIntent.metadata.cart_items || '[]')
    
    for (const item of items) {
      const { data: variant } = await supabaseAdmin
        .from('product_variants')
        .select('*, products(*)')
        .eq('id', item.v)
        .single()
        
      if (!variant) continue
      
      const currentPrice = variant.products.sale_price != null ? variant.products.sale_price : variant.products.base_price

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
      
      await supabaseAdmin.rpc('decrement_stock', {
        variant_id: variant.id,
        quantity: item.q
      })
    }
    
    await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'confirmed',
        payment_status: 'paid',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', order.id)
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  await supabaseAdmin
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('payment_intent_id', paymentIntent.id)
}
