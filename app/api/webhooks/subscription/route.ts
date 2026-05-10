import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'


const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)


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


  // ── Subscription activated ────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.mode === 'subscription') {
      const userId = session.metadata?.supabase_id
      const plan   = session.metadata?.plan
      if (userId && plan) {
        await supabase
          .from('profiles')
          .update({ plan, stripe_subscription_id: session.subscription as string })
          .eq('id', userId)
      }
    }
  }


  // ── Subscription cancelled / expired ─────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId   = subscription.customer as string


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


  return NextResponse.json({ received: true })
}


