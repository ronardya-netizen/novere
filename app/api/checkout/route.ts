import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { productId, childId } = await req.json()
  const stripe = getStripe()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
  }

  const { data: pointsData } = await supabase
    .from('points')
    .select('total_points')
    .eq('child_id', childId)
    .single()

  const points = pointsData?.total_points ?? 0

  const discountPct = points >= 5000 ? 30
    : points >= 2500 ? 20
    : points >= 1000 ? 10
    : points >= 500  ? 5
    : 0

  const originalCents = Math.round(product.price_cad * 100)
  const finalCents = Math.round(originalCents * (1 - discountPct / 100))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'cad',
        product_data: {
          name: product.name,
          images: product.image_url ? [product.image_url] : [],
        },
        unit_amount: finalCents,
      },
      quantity: 1,
    }],
    shipping_address_collection: { allowed_countries: ['CA'] },
    metadata: {
      productId,
      childId,
      discountPct: String(discountPct),
      fulfillmentType: product.type,
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/home/shop?success=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/home/shop`,
  })

  return NextResponse.json({ url: session.url })
}

