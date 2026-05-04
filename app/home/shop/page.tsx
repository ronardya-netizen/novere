'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = {
  id: string
  name: string
  description: string
  price_cad: number
  image_url: string
  category: string
  stock: number
}

type WishlistItem = {
  id: string
  product_id: string
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [childId, setChildId] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [tab, setTab] = useState<'boutique' | 'liste' | 'reduction'>('boutique')
  const [category, setCategory] = useState('tous')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check for Stripe success redirect
    const url = new URL(window.location.href)
    if (url.searchParams.get('success') === 'true') {
      setSuccessMessage('Commande confirmée! 🎉 Tu recevras ton colis bientôt.')
      window.history.replaceState({}, '', '/home/shop')
    }
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get child
    const { data: child } = await supabase
      .from('children')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!child) return
    setChildId(child.id)

    // Get products
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    setProducts(prods ?? [])

    // Get wishlist
    const { data: wl } = await supabase
      .from('wishlists')
      .select('id, product_id')
      .eq('child_id', child.id)

    setWishlist(wl ?? [])

    // Get points
    const { data: pts } = await supabase
      .from('points')
      .select('total_points')
      .eq('child_id', child.id)
      .single()

    setPoints(pts?.total_points ?? 0)
  }

  function getDiscountPercent(pts: number) {
    if (pts >= 5000) return 30
    if (pts >= 2500) return 20
    if (pts >= 1000) return 10
    if (pts >= 500) return 5
    return 0
  }

  function getDiscountedPrice(price: number) {
    const pct = getDiscountPercent(points)
    return price - (price * pct / 100)
  }

  function isInWishlist(productId: string) {
    return wishlist.some(w => w.product_id === productId)
  }

  async function toggleWishlist(productId: string) {
    if (!childId) return
    if (isInWishlist(productId)) {
      await supabase.from('wishlists')
        .delete()
        .eq('child_id', childId)
        .eq('product_id', productId)
      setWishlist(prev => prev.filter(w => w.product_id !== productId))
    } else {
      const { data } = await supabase.from('wishlists')
        .insert({ child_id: childId, product_id: productId })
        .select()
        .single()
      if (data) setWishlist(prev => [...prev, data])
    }
  }

  async function handleBuy(productId: string) {
    if (!childId) return
    setLoading(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, childId }),
    })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else console.error('Checkout error:', error)
    setLoading(false)
  }

  const discount = getDiscountPercent(points)
  const filteredProducts = category === 'tous'
    ? products
    : products.filter(p => p.category === category)

  const wishlistProducts = products.filter(p => isInWishlist(p.id))

  const nextTier = points < 500 ? { pts: 500, pct: 5 }
    : points < 1000 ? { pts: 1000, pct: 10 }
    : points < 2500 ? { pts: 2500, pct: 20 }
    : points < 5000 ? { pts: 5000, pct: 30 }
    : null

  return (
    <div className="min-h-screen bg-[#F4F7FF] pb-24">
      {/* Header */}
      <div className="bg-[#0B1F4B] px-4 pt-6 pb-4">
        <h1 className="text-white font-bold text-xl">🛍️ Boutique NOVERE</h1>
        <p className="text-[#FBBF24] text-sm mt-1">
          {discount > 0
            ? `Tes ${points} points te donnent ${discount}% de rabais 🎉`
            : `Gagne 500 points pour obtenir 5% de rabais!`}
        </p>
      </div>

      {successMessage && (
        <div className="mx-4 mt-4 bg-green-100 border border-green-400 text-green-800 rounded-xl p-4 text-sm font-medium">
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {(['boutique', 'liste', 'reduction'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? 'text-[#0B1F4B] border-b-2 border-[#FBBF24]'
                : 'text-gray-400'
            }`}
          >
            {t === 'boutique' ? '🛒 Boutique'
              : t === 'liste' ? `❤️ Ma liste (${wishlist.length})`
              : '✨ Ma réduction'}
          </button>
        ))}
      </div>

      {/* Tab 1 — Boutique */}
      {tab === 'boutique' && (
        <div className="px-4 pt-4">
          {/* Category filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {['tous', 'toy', 'game', 'merch', 'book'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-[#0B1F4B] text-white'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {cat === 'tous' ? 'Tous'
                  : cat === 'toy' ? '🚗 Jouets'
                  : cat === 'game' ? '🎮 Jeux'
                  : cat === 'merch' ? '👕 Merch'
                  : '📚 Livres'}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-[#F4F7FF] flex items-center justify-center text-4xl">
                    🎁
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-[#0B1F4B] text-sm leading-tight">{product.name}</p>
                  {discount > 0 ? (
                    <div className="mt-1">
                      <span className="text-gray-400 line-through text-xs">{product.price_cad.toFixed(2)}$</span>
                      <span className="text-[#0B1F4B] font-bold text-sm ml-1">
                        {getDiscountedPrice(product.price_cad).toFixed(2)}$
                      </span>
                    </div>
                  ) : (
                    <p className="text-[#0B1F4B] font-bold text-sm mt-1">{product.price_cad.toFixed(2)}$</p>
                  )}
                  {product.stock < 5 && (
                    <p className="text-red-500 text-xs mt-1">Plus que {product.stock} en stock!</p>
                  )}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`mt-2 w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isInWishlist(product.id)
                        ? 'bg-red-50 text-red-500 border border-red-200'
                        : 'bg-[#F4F7FF] text-[#0B1F4B] border border-[#E2E8F0]'
                    }`}
                  >
                    {isInWishlist(product.id) ? '❤️ Dans ma liste' : '🤍 Ajouter à ma liste'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2 — Wishlist */}
      {tab === 'liste' && (
        <div className="px-4 pt-4 space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🤍</p>
              <p className="font-medium">Ta liste est vide</p>
              <p className="text-sm mt-1">Ajoute des jouets depuis la Boutique!</p>
            </div>
          ) : (
            <>
              {wishlistProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl p-4 flex gap-3 shadow-sm">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-[#F4F7FF] rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      🎁
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0B1F4B] text-sm">{product.name}</p>
                    {discount > 0 ? (
                      <div>
                        <span className="text-gray-400 line-through text-xs">{product.price_cad.toFixed(2)}$</span>
                        <span className="text-[#0B1F4B] font-bold text-sm ml-1">
                          {getDiscountedPrice(product.price_cad).toFixed(2)}$
                        </span>
                        <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-[#0B1F4B] font-bold text-sm">{product.price_cad.toFixed(2)}$</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="text-xs text-gray-400 underline"
                      >
                        Retirer
                      </button>
                      <button
                        onClick={() => handleBuy(product.id)}
                        disabled={loading}
                        className="flex-1 bg-[#0B1F4B] text-white text-xs font-semibold py-1.5 rounded-lg"
                      >
                        {loading ? '...' : 'Acheter →'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="bg-[#0B1F4B] rounded-2xl p-4 text-white">
                <div className="flex justify-between text-sm">
                  <span>Total avec réduction</span>
                  <span className="font-bold">
                    {wishlistProducts.reduce((sum, p) => sum + getDiscountedPrice(p.price_cad), 0).toFixed(2)}$
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-[#FBBF24] mt-1">
                    <span>Tu économises</span>
                    <span>
                      {wishlistProducts.reduce((sum, p) => sum + (p.price_cad - getDiscountedPrice(p.price_cad)), 0).toFixed(2)}$
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3 — Réduction */}
      {tab === 'reduction' && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-[#0B1F4B] text-lg mb-1">✨ Ta réduction NOVERE</h2>
            <p className="text-gray-500 text-sm mb-5">
              Plus tu étudies, plus tu économises sur tes jouets!
            </p>

            {/* Points display */}
            <div className="bg-[#F4F7FF] rounded-xl p-4 mb-4 text-center">
              <p className="text-3xl font-bold text-[#0B1F4B]">{points}</p>
              <p className="text-gray-500 text-sm">points accumulés</p>
              {discount > 0 && (
                <div className="mt-2 bg-[#FBBF24] text-[#0B1F4B] font-bold rounded-full px-4 py-1 inline-block text-sm">
                  {discount}% de rabais actif 🎉
                </div>
              )}
            </div>

            {/* Tiers */}
            <div className="space-y-2">
              {[
                { pts: 500, pct: 5 },
                { pts: 1000, pct: 10 },
                { pts: 2500, pct: 20 },
                { pts: 5000, pct: 30 },
              ].map(tier => {
                const reached = points >= tier.pts
                const isCurrent = getDiscountPercent(points) === tier.pct
                return (
                  <div key={tier.pts}
                    className={`flex justify-between items-center rounded-xl px-4 py-3 ${
                      isCurrent ? 'bg-[#0B1F4B] text-white'
                      : reached ? 'bg-green-50 text-green-700'
                      : 'bg-[#F4F7FF] text-gray-400'
                    }`}
                  >
                    <span className="font-semibold text-sm">{tier.pts} pts</span>
                    <span className="font-bold">{tier.pct}% de rabais</span>
                    <span>{reached ? '✅' : '🔒'}</span>
                  </div>
                )
              })}
            </div>

            {/* Next milestone */}
            {nextTier && (
              <p className="text-center text-sm text-gray-500 mt-4">
                Il te manque <span className="font-bold text-[#0B1F4B]">{nextTier.pts - points} points</span> pour
                atteindre {nextTier.pct}% de rabais. Continue tes Pomodoros! 🍅
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

