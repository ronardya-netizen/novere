import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create these products in your Stripe dashboard and paste the price IDs here
const PRICE_IDS: Record<string, string> = {
  individual: process.env.STRIPE_PRICE_INDIVIDUAL ?? '',
  family:     process.env.STRIPE_PRICE_FAMILY     ?? '',
}

export async function POST(req: NextRequest) {
  const { plan } = await req.json()

  if (!PRICE_IDS[plan]) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const stripe = getStripe()

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email:    user.email,
      metadata: { supabase_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Create Stripe Checkout session for subscription
  const session = await stripe.checkout.sessions.create({
    mode:     'subscription',
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{
      price:    PRICE_IDS[plan],
      quantity: 1,
    }],
    metadata: {
      supabase_id: user.id,
      plan,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home?subscribed=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
