'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = {
  id: string; name: string; price_cad: number
  image_url: string | null; category: string
  stock: number; cost_cad: number
}
type WishlistItem = { id: string; product_id: string }

const C = {
  navy:'#0B1F4B', gold:'#FBBF24',
  goldDim:'rgba(251,191,36,0.12)', goldBorder:'rgba(251,191,36,0.3)',
  bg:'#F4F7FF', white:'#FFFFFF', border:'#E2E8F0',
  muted:'#64748B', faint:'#94A3B8',
}
const MARKUP = 0.35
const TIER_STEPS = [0, 500, 1000, 2500, 5000]

function getDiscountPct(pts: number) {
  if (pts >= 5000) return 30
  if (pts >= 2500) return 20
  if (pts >= 1000) return 10
  if (pts >= 500)  return 5
  return 0
}

function isViable(product: Product, discPct: number) {
  return product.price_cad * (1 - discPct / 100) >= product.cost_cad * (1 + MARKUP)
}

export default function ShopPage() {
  const [products,  setProducts]  = useState<Product[]>([])
  const [wishlist,  setWishlist]  = useState<WishlistItem[]>([])
  const [childId,   setChildId]   = useState<string | null>(null)
  const [childName, setChildName] = useState('toi')
  const [points,    setPoints]    = useState(0)
  const [added,     setAdded]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: child } = await supabase.from('children').select('id, name').eq('parent_id', user.id).single()
    if (!child) return
    setChildId(child.id)
    setChildName(child.name ?? 'toi')
    const [{ data: prods }, { data: wl }, { data: pts }] = await Promise.all([
      supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
      supabase.from('wishlists').select('id, product_id').eq('child_id', child.id),
      supabase.from('points').select('total_points').eq('child_id', child.id).single(),
    ])
    setProducts(prods ?? [])
    setWishlist(wl ?? [])
    setPoints(pts?.total_points ?? 0)
    setLoading(false)
  }

  const discPct   = getDiscountPct(points)
  const inWL      = (pid: string) => wishlist.some(w => w.product_id === pid)
  const visible   = products.filter(p => isViable(p, discPct))
  const locked    = products.filter(p => !isViable(p, discPct)).slice(0, 2)
  const wished    = products.filter(p => inWL(p.id))
  const starLevel = discPct >= 30 ? 4 : discPct >= 20 ? 3 : discPct >= 10 ? 2 : discPct >= 5 ? 1 : 0
  const curStep   = [...TIER_STEPS].reverse().find(t => points >= t) ?? 0
  const nextStep  = TIER_STEPS.find(t => t > points) ?? 5000
  const progress  = ((points - curStep) / (nextStep - curStep)) * 100

  async function toggle(pid: string) {
    if (!childId) return
    if (inWL(pid)) {
      await supabase.from('wishlists').delete().eq('child_id', childId).eq('product_id', pid)
      setWishlist(prev => prev.filter(w => w.product_id !== pid))
    } else {
      const { data } = await supabase.from('wishlists').insert({ child_id: childId, product_id: pid }).select().single()
      if (data) { setWishlist(prev => [...prev, data]); setAdded(pid); setTimeout(() => setAdded(null), 1500) }
    }
  }

  if (loading) return (
    <div style={{ height:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jakarta)' }}>
      <p style={{ color:C.faint, fontSize:14 }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'var(--font-jakarta)', paddingBottom:100 }}>

      {/* ── HEADER ── */}
      <div style={{ background:C.navy, padding:'24px 20px 20px' }}>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10, margin:'0 0 2px', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>
          Mes récompenses
        </p>
        <h1 style={{ color:C.white, fontSize:22, fontWeight:800, margin:'0 0 18px', fontFamily:'var(--font-fredoka)' }}>
          Continue comme ça, {childName}! 🌟
        </h1>
        <div style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:18, padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div>
              <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10, margin:'0 0 5px' }}>Ton niveau de récompense</p>
              <div style={{ display:'flex', gap:4 }}>
                {[1,2,3,4].map(s => <span key={s} style={{ fontSize:20, opacity:s<=starLevel?1:0.2 }}>⭐</span>)}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:10, margin:'0 0 2px' }}>Prochain niveau</p>
              <p style={{ color:C.gold, fontWeight:700, fontSize:13, margin:0, fontFamily:'var(--font-fredoka)' }}>
                {nextStep - points} pts
              </p>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:99, height:6 }}>
            <div style={{ width:`${Math.min(progress,100)}%`, height:'100%', borderRadius:99, background:C.gold, transition:'width 0.5s ease' }} />
          </div>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:10, margin:'6px 0 0' }}>
            Continue tes Pomodoros pour débloquer plus de jouets! 🍅
          </p>
        </div>
      </div>

      <div style={{ padding:'22px 20px' }}>

        {/* ── WISHLIST ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h2 style={{ color:C.navy, fontSize:15, fontWeight:800, margin:0, fontFamily:'var(--font-fredoka)' }}>
            Ma liste {wished.length > 0 && `(${wished.length})`}
          </h2>
          {wished.length > 0 && (
            <span style={{ background:C.goldDim, border:`1px solid ${C.goldBorder}`, borderRadius:99, padding:'4px 12px', color:C.navy, fontSize:10, fontWeight:700 }}>
              Partagé avec tes parents ✓
            </span>
          )}
        </div>

        {wished.length === 0 ? (
          <div style={{ background:C.white, border:`1px dashed ${C.border}`, borderRadius:18, padding:'28px 20px', textAlign:'center', marginBottom:28 }}>
            <p style={{ fontSize:30, margin:'0 0 8px' }}>🤍</p>
            <p style={{ color:C.navy, fontWeight:700, fontSize:14, margin:'0 0 4px', fontFamily:'var(--font-fredoka)' }}>Ta liste est vide</p>
            <p style={{ color:C.faint, fontSize:12, margin:0 }}>Ajoute des jouets depuis le catalogue!</p>
          </div>
        ) : (
          <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:10, marginBottom:28 }}>
            {wished.map(p => (
              <div key={p.id} style={{ flexShrink:0, width:115, background:C.white, border:`1.5px solid ${C.navy}`, borderRadius:18, padding:'12px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <div style={{ width:56, height:56, borderRadius:12, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:28 }}>🎁</span>}
                </div>
                <p style={{ color:C.navy, fontWeight:700, fontSize:11, margin:0, textAlign:'center', lineHeight:1.3 }}>{p.name}</p>
                <button onClick={() => toggle(p.id)} style={{ background:'none', border:'none', color:C.faint, fontSize:10, cursor:'pointer', padding:0, fontFamily:'var(--font-jakarta)' }}>
                  Retirer ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── CATALOGUE ── */}
        <h2 style={{ color:C.navy, fontSize:15, fontWeight:800, margin:'0 0 6px', fontFamily:'var(--font-fredoka)' }}>
          Jouets débloqués pour toi
        </h2>
        <p style={{ color:C.faint, fontSize:12, margin:'0 0 16px' }}>
          Ces jouets correspondent à ton niveau — ajoute ceux que tu veux!
        </p>

        {visible.length === 0 ? (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:'24px 20px', textAlign:'center', marginBottom:20 }}>
            <p style={{ color:C.faint, fontSize:13, margin:0 }}>Gagne des points pour débloquer des jouets! 🍅</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
            {visible.map(p => {
              const inList = inWL(p.id)
              return (
                <div key={p.id} style={{ background:inList?C.goldDim:C.white, border:`1px solid ${inList?C.goldBorder:C.border}`, borderRadius:18, overflow:'hidden', transition:'all 0.2s' }}>
                  <div style={{ height:96, background:inList?'rgba(251,191,36,0.08)':C.bg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                    {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:42 }}>🎁</span>}
                    {p.stock > 0 && p.stock < 5 && (
                      <div style={{ position:'absolute', top:8, right:8, background:'#EF4444', color:C.white, fontSize:8, fontWeight:700, borderRadius:99, padding:'2px 7px' }}>
                        Plus que {p.stock}!
                      </div>
                    )}
                  </div>
                  <div style={{ padding:'10px 12px 14px' }}>
                    <p style={{ color:C.navy, fontWeight:700, fontSize:12, margin:'0 0 10px', lineHeight:1.35 }}>{p.name}</p>
                    <button onClick={() => toggle(p.id)} style={{ width:'100%', background:inList?C.navy:C.bg, border:`1px solid ${inList?C.navy:C.border}`, borderRadius:99, padding:'8px 0', color:inList?C.gold:C.muted, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.2s', fontFamily:'var(--font-jakarta)' }}>
                      {added===p.id?'Ajouté! ✓':inList?'Dans ma liste ❤️':'+ Ajouter à ma liste'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── LOCKED ── */}
        {locked.length > 0 && (
          <>
            <p style={{ color:C.faint, fontSize:11, fontWeight:700, margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
              Prochain niveau — continue à étudier
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {locked.map(p => (
                <div key={p.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:18, overflow:'hidden', opacity:0.4 }}>
                  <div style={{ height:96, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', filter:'blur(3px)' }}>
                    {p.image_url ? <img src={p.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:42 }}>🎁</span>}
                  </div>
                  <div style={{ padding:'10px 12px 14px' }}>
                    <div style={{ height:10, background:C.border, borderRadius:6, marginBottom:10 }} />
                    <div style={{ background:C.border, borderRadius:99, padding:'8px 0', textAlign:'center' }}>
                      <span style={{ color:C.faint, fontSize:11, fontWeight:700 }}>Verrouillé 🔒</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
