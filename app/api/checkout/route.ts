import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

type CartItem = {
  productId: string
  quantity: number
}

export async function POST(req: NextRequest) {
  const { cartItems, childId }: { cartItems: CartItem[]; childId: string } = await req.json()

  if (!cartItems?.length) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
  }

  const stripe = getStripe()

  // Get child's points for discount
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

  // Fetch all products in the cart
  const productIds = cartItems.map(i => i.productId)
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)

  if (error || !products?.length) {
    return NextResponse.json({ error: 'Produits introuvables' }, { status: 404 })
  }

  // Build Stripe line items
  const lineItems = cartItems.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId)
    if (!product) return null

    const originalCents  = Math.round(product.price_cad * 100)
    const discountedCents = Math.round(originalCents * (1 - discountPct / 100))

    return {
      price_data: {
        currency: 'cad',
        product_data: {
          name: product.name,
          images: product.image_url ? [product.image_url] : [],
        },
        unit_amount: discountedCents,
      },
      quantity: cartItem.quantity,
    }
  }).filter(Boolean)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems as any,
    shipping_address_collection: { allowed_countries: ['CA'] },
    metadata: {
      childId,
      discountPct: String(discountPct),
      cartItems: JSON.stringify(cartItems),
    },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/parent?success=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/parent`,
  })

  return NextResponse.json({ url: session.url })
}

