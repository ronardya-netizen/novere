import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')


export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })


    // Fetch the profile to get the subscription ID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single()


    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: 'Aucun abonnement actif trouvé.' }, { status: 404 })
    }


    // Cancel at period end (parent keeps access until next billing date)
    const subscription = await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    })


    // Convert Unix timestamp to a readable date
    const periodEnd = new Date((subscription as any).current_period_end * 1000)
    const dateStr = periodEnd.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })


    return NextResponse.json({ ok: true, periodEnd: dateStr })
  } catch (err: any) {
    console.error('Cancel subscription error:', err)
    return NextResponse.json({ error: err.message || 'Failed to cancel' }, { status: 500 })
  }
}
