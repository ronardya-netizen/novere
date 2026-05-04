import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object as Stripe.Checkout.Session
    const meta     = session.metadata ?? {}
    const shipping = (session as any).shipping_details

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', meta.productId)
      .single()

    if (!product) return NextResponse.json({ received: true })

    const total    = (session.amount_total ?? 0) / 100
    const discount = product.price_cad * Number(meta.discountPct) / 100

    const { data: order } = await supabase
      .from('orders')
      .insert({
        child_id:              meta.childId,
        status:                'paid',
        subtotal_cad:          product.price_cad,
        discount_cad:          discount,
        total_cad:             total,
        stripe_checkout_session_id: session.id,
        shipping_name:         shipping?.name ?? '',
        shipping_address:      shipping?.address?.line1 ?? '',
        shipping_city:         shipping?.address?.city ?? '',
        shipping_province:     shipping?.address?.state ?? '',
        shipping_postal_code:  shipping?.address?.postal_code ?? '',
        fulfillment_type:      meta.fulfillmentType,
        notes: `${product.name} — ${shipping?.name}, ${shipping?.address?.city}`,
      })
      .select()
      .single()

    if (order) {
      await supabase.from('order_items').insert({
        order_id:        order.id,
        product_id:      meta.productId,
        product_name:    product.name,
        product_image_url: product.image_url,
        quantity:        1,
        unit_price_cad:  total,
      })
    }
  }

  return NextResponse.json({ received: true })
}

