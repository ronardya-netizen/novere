import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object as Stripe.Checkout.Session
    const meta     = session.metadata ?? {}
    const shipping = (session as any).shipping_details

    const cartItems: { productId: string; quantity: number }[] =
      JSON.parse(meta.cartItems ?? '[]')

    if (!cartItems.length) return NextResponse.json({ received: true })

    const productIds = cartItems.map(i => i.productId)
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (!products?.length) return NextResponse.json({ received: true })

    const total    = (session.amount_total ?? 0) / 100
    const discPct  = Number(meta.discountPct ?? 0)
    const subtotal = products.reduce((s, p) => {
      const qty = cartItems.find(i => i.productId === p.id)?.quantity ?? 1
      return s + p.price_cad * qty
    }, 0)
    const discount = subtotal * discPct / 100

    // Save the order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        child_id:                   meta.childId,
        status:                     'paid',
        subtotal_cad:               subtotal,
        discount_cad:               discount,
        total_cad:                  total,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:   session.payment_intent as string,
        shipping_name:              shipping?.name ?? '',
        shipping_address:           shipping?.address?.line1 ?? '',
        shipping_city:              shipping?.address?.city ?? '',
        shipping_province:          shipping?.address?.state ?? '',
        shipping_postal_code:       shipping?.address?.postal_code ?? '',
        fulfillment_type:           'manual',
        notes: `Commande de ${cartItems.length} article(s) — ${shipping?.name}, ${shipping?.address?.city}`,
      })
      .select()
      .single()

    // Save each line item
    if (order) {
      const orderItems = cartItems.map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId)
        return {
          order_id:          order.id,
          product_id:        cartItem.productId,
          product_name:      product?.name ?? '',
          product_image_url: product?.image_url ?? null,
          quantity:          cartItem.quantity,
          unit_price_cad:    product ? +(product.price_cad * (1 - discPct/100)).toFixed(2) : 0,
        }
      })
      await supabase.from('order_items').insert(orderItems)
    }
  }

  return NextResponse.json({ received: true })
}

