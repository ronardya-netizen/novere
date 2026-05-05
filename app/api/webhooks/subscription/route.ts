import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_INDIVIDUAL ?? '']: 'individual',
  [process.env.STRIPE_PRICE_FAMILY     ?? '']: 'family',
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SUBSCRIPTION_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const session     = event.data.object as Stripe.Checkout.Session
  const subscription = event.data.object as Stripe.Subscription

  // Subscription activated
  if (event.type === 'checkout.session.completed' && session.mode === 'subscription') {
    const userId = session.metadata?.supabase_id
    const plan   = session.metadata?.plan
    if (userId && plan) {
      await supabase
        .from('profiles')
        .update({
          plan,
          stripe_subscription_id: session.subscription as string,
        })
        .eq('id', userId)
    }
  }

  // Subscription cancelled or expired
  if (event.type === 'customer.subscription.deleted') {
    const customerId = subscription.customer as string
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (profile) {
      await supabase
        .from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', profile.id)
    }
  }

  // Subscription renewed
  if (event.type === 'invoice.payment_succeeded') {
    const invoice      = event.data.object as Stripe.Invoice
    const customerId   = invoice.customer as string
    const lineItem = invoice.lines.data[0] as any
    const priceId  = typeof lineItem?.price === 'string' ? lineItem.price : (lineItem?.price?.id ?? '')
    const plan         = PLAN_MAP[priceId]

    if (plan) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({ plan })
          .eq('id', profile.id)
      }
    }
  }

  return NextResponse.json({ received: true })
}
