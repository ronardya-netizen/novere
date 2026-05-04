'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ────────────────────────────────────
type Product = {
  id: string; name: string; price_cad: number
  image_url: string | null; category: string
  stock: number; cost_cad: number; is_new: boolean
}
type WishlistItem  = { id: string; product_id: string }
type CartItem      = { product: Product; quantity: number }
type Child         = { id: string; name: string; grade: number | null }
type Schedule      = { id?: string; days: string[]; start_time: string; end_time: string; active: boolean }

// ── Design tokens ────────────────────────────
const C = {
  navy:'#0B1F4B', gold:'#FBBF24',
  goldDim:'rgba(251,191,36,0.10)', goldBorder:'rgba(251,191,36,0.25)',
  bg:'#F4F7FF', white:'#FFFFFF',
  border:'#E2E8F0', borderDark:'#CBD5E1',
  text:'#0F172A', muted:'#64748B', faint:'#94A3B8',
  green:'#16A34A', greenBg:'#DCFCE7',
  red:'#EF4444',
}

// ── Helpers ──────────────────────────────────
function getDiscountPct(pts: number) {
  if (pts >= 5000) return 30
  if (pts >= 2500) return 20
  if (pts >= 1000) return 10
  if (pts >= 500)  return 5
  return 0
}
const disc  = (price: number, pct: number) => +(price * (1 - pct/100)).toFixed(2)
const saved = (price: number, pct: number) => +(price * pct/100).toFixed(2)

const DAYS_SHORT = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
const TIERS      = [500, 1000, 2500, 5000]
const TIER_PCTS  = [5, 10, 20, 30]

const CATEGORIES = [
  { id:'all',   label:'Tout' },
  { id:'toy',   label:'Jouets' },
  { id:'game',  label:'Jeux' },
  { id:'merch', label:'Merch' },
  { id:'book',  label:'Livres' },
]
const SORTS = [
  { id:'default',    label:'Recommandés' },
  { id:'price_asc',  label:'Prix croissant' },
  { id:'price_desc', label:'Prix décroissant' },
  { id:'new',        label:'Nouveautés' },
]

// ── Small shared components ───────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ color:C.faint, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px', margin:'0 0 6px', fontFamily:'var(--font-jakarta)' }}>{children}</p>
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ color:C.navy, fontSize:13, fontWeight:800, margin:'0 0 14px', paddingBottom:8, borderBottom:`1px solid ${C.border}`, fontFamily:'var(--font-fredoka)' }}>{children}</h3>
}
function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:16, ...style }}>{children}</div>
}
function TextInput({ label, type='text', value, onChange, placeholder='' }: { label:string; type?:string; value:string; onChange:(v:string)=>void; placeholder?:string }) {
  return (
    <div style={{ marginBottom:14 }}>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', background:C.white, border:`1px solid ${C.borderDark}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
    </div>
  )
}
function Toast({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div style={{ background:C.greenBg, border:'1px solid #86EFAC', borderRadius:10, margin:'12px 20px 0', padding:'10px 14px' }}>
      <p style={{ color:C.green, fontWeight:700, fontSize:12, margin:0, fontFamily:'var(--font-jakarta)' }}>{msg}</p>
    </div>
  )
}

// ── Cart Drawer ───────────────────────────────
function CartDrawer({ cart, discountPct, onClose, onQty, onRemove, onCheckout, loading }:
  { cart:CartItem[]; discountPct:number; onClose:()=>void; onQty:(id:string,qty:number)=>void; onRemove:(id:string)=>void; onCheckout:()=>void; loading:boolean }
) {
  const subtotal = cart.reduce((s,i) => s + disc(i.product.price_cad, discountPct) * i.quantity, 0)
  const savings  = cart.reduce((s,i) => s + saved(i.product.price_cad, discountPct) * i.quantity, 0)
  const count    = cart.reduce((s,i) => s + i.quantity, 0)

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:40 }} />
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:360, background:C.white, zIndex:50, display:'flex', flexDirection:'column', boxShadow:'-4px 0 40px rgba(0,0,0,0.15)', fontFamily:'var(--font-jakarta)' }}>

        {/* Header */}
        <div style={{ padding:'20px 20px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ color:C.navy, fontWeight:800, fontSize:16, margin:'0 0 2px', fontFamily:'var(--font-fredoka)' }}>Panier</h2>
            <p style={{ color:C.faint, fontSize:11, margin:0 }}>{count} article{count!==1?'s':''}</p>
          </div>
          <button onClick={onClose} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:18, color:C.muted, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 20px' }}>
              <p style={{ fontSize:36, margin:'0 0 12px' }}>🛒</p>
              <p style={{ color:C.faint, fontSize:13 }}>Votre panier est vide</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product.id} style={{ display:'flex', gap:12, marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:64, height:64, borderRadius:10, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                {item.product.image_url
                  ? <img src={item.product.image_url} alt={item.product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize:28 }}>🎁</span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 4px', lineHeight:1.3 }}>{item.product.name}</p>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                  <span style={{ color:C.faint, fontSize:10, textDecoration:'line-through' }}>{item.product.price_cad.toFixed(2)} CAD</span>
                  <span style={{ color:C.navy, fontWeight:800, fontSize:13 }}>{disc(item.product.price_cad, discountPct).toFixed(2)} CAD</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
                    <button onClick={() => onQty(item.product.id, item.quantity-1)} style={{ width:28, height:28, background:'none', border:'none', cursor:'pointer', color:C.navy, fontWeight:700, fontSize:14 }}>−</button>
                    <span style={{ width:28, textAlign:'center', color:C.navy, fontWeight:700, fontSize:13 }}>{item.quantity}</span>
                    <button onClick={() => onQty(item.product.id, item.quantity+1)} style={{ width:28, height:28, background:'none', border:'none', cursor:'pointer', color:C.navy, fontWeight:700, fontSize:14 }}>+</button>
                  </div>
                  <button onClick={() => onRemove(item.product.id)} style={{ background:'none', border:'none', color:C.faint, fontSize:11, cursor:'pointer', textDecoration:'underline' }}>Retirer</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding:'16px 20px', borderTop:`1px solid ${C.border}` }}>
            {discountPct > 0 && (
              <div style={{ background:C.goldDim, border:`1px solid ${C.goldBorder}`, borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:C.navy, fontSize:11, fontWeight:600 }}>Rabais de {discountPct}% appliqué</span>
                  <span style={{ color:C.green, fontWeight:700, fontSize:12 }}>-{savings.toFixed(2)} CAD</span>
                </div>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
              <span style={{ color:C.muted, fontSize:13 }}>Total</span>
              <span style={{ color:C.navy, fontWeight:800, fontSize:18 }}>{subtotal.toFixed(2)} CAD</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={loading}
              style={{ width:'100%', background:loading?C.faint:C.navy, border:'none', borderRadius:12, padding:'14px 0', color:C.gold, fontSize:14, fontWeight:800, cursor:loading?'not-allowed':'pointer', fontFamily:'var(--font-jakarta)' }}
            >
              {loading ? 'Redirection...' : 'Passer la commande →'}
            </button>
            <p style={{ color:C.faint, fontSize:10, textAlign:'center', margin:'10px 0 0' }}>
              Paiement sécurisé par Stripe · Livraison au Canada
            </p>
          </div>
        )}
      </div>
    </>
  )
}

// ── Product Card ──────────────────────────────
function ProductCard({ product, discountPct, inCart, isWished, onAdd }:
  { product:Product; discountPct:number; inCart:boolean; isWished:boolean; onAdd:(p:Product)=>void }
) {
  return (
    <div style={{ background:C.white, border:`1px solid ${inCart?C.navy:C.border}`, borderRadius:16, overflow:'hidden', transition:'border-color 0.2s', display:'flex', flexDirection:'column' }}>
      {/* Square image */}
      <div style={{ aspectRatio:'1/1', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span style={{ fontSize:52 }}>🎁</span>}

        {/* Badges */}
        <div style={{ position:'absolute', top:10, left:10, display:'flex', flexDirection:'column', gap:4 }}>
          {product.is_new && (
            <span style={{ background:C.navy, color:C.gold, fontSize:9, fontWeight:700, borderRadius:6, padding:'3px 8px', fontFamily:'var(--font-jakarta)' }}>NOUVEAU</span>
          )}
          {isWished && (
            <span style={{ background:C.goldDim, border:`1px solid ${C.goldBorder}`, color:C.navy, fontSize:9, fontWeight:700, borderRadius:6, padding:'3px 8px', fontFamily:'var(--font-jakarta)' }}>❤️ Souhaité</span>
          )}
        </div>
        {product.stock > 0 && product.stock < 4 && (
          <span style={{ position:'absolute', top:10, right:10, background:C.red, color:C.white, fontSize:9, fontWeight:700, borderRadius:6, padding:'3px 8px' }}>
            Plus que {product.stock}!
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'12px 14px 14px', flex:1, display:'flex', flexDirection:'column', fontFamily:'var(--font-jakarta)' }}>
        <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 4px', lineHeight:1.35, flex:1 }}>{product.name}</p>

        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom: discountPct>0?4:12 }}>
          <span style={{ color:C.faint, fontSize:10, textDecoration:'line-through' }}>{product.price_cad.toFixed(2)} CAD</span>
          <span style={{ color:C.navy, fontWeight:800, fontSize:15 }}>{disc(product.price_cad, discountPct).toFixed(2)} CAD</span>
        </div>

        {discountPct > 0 && (
          <p style={{ color:C.green, fontSize:10, fontWeight:600, margin:'0 0 12px' }}>
            Économie de {saved(product.price_cad, discountPct).toFixed(2)} CAD
          </p>
        )}

        <button
          onClick={() => onAdd(product)}
          style={{ width:'100%', background:inCart?C.goldDim:C.navy, border:`1px solid ${inCart?C.goldBorder:C.navy}`, borderRadius:10, padding:'10px 0', color:inCart?C.navy:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s', fontFamily:'var(--font-jakarta)' }}
        >
          {inCart ? '✓ Dans le panier' : '+ Ajouter au panier'}
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════
export default function ParentPage() {
  // ── Auth & data ──
  const [user,        setUser]        = useState<{ id:string; email:string }|null>(null)
  const [parentName,  setParentName]  = useState('')
  const [child,       setChild]       = useState<Child|null>(null)
  const [points,      setPoints]      = useState(0)
  const [products,    setProducts]    = useState<Product[]>([])
  const [wishlist,    setWishlist]    = useState<WishlistItem[]>([])
  const [schedule,    setSchedule]    = useState<Schedule>({ days:['Lun','Mar','Mer','Jeu','Ven'], start_time:'16:00', end_time:'18:00', active:true })
  const [loading,  setLoading]  = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  // ── UI state ──
  const [tab,         setTab]         = useState<'boutique'|'wishlist'|'profile'>('boutique')
  const [toast,       setToast]       = useState('')
  const [cart,        setCart]        = useState<CartItem[]>([])
  const [showCart,    setShowCart]    = useState(false)
  const [checkLoading,setCheckLoading]= useState(false)

  // ── Boutique filters ──
  const [search,      setSearch]      = useState('')
  const [category,    setCategory]    = useState('all')
  const [sort,        setSort]        = useState('default')
  const [maxPrice,    setMaxPrice]    = useState(150)
  const [wishOnly,    setWishOnly]    = useState(false)

  // ── Profile form ──
  const [pwForm,      setPwForm]      = useState({ current:'', next:'', confirm:'' })
  const [notifs,      setNotifs]      = useState({ weeklyReport:true, tierReached:true, wishlistAdded:false })
  const [pomoDur,     setPomoDur]     = useState(25)
  const [breakDur,    setBreakDur]    = useState(5)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    setUser({ id: u.id, email: u.email ?? '' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', u.id)
      .single()
    setParentName(profile?.full_name ?? u.email?.split('@')[0] ?? 'Parent')

    const [{ data: childData }, { data: prods }] = await Promise.all([
      supabase.from('children').select('id, name, grade').eq('parent_id', u.id).single(),
      supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
    ])

    if (childData) {
      setChild(childData)
      const [{ data: pts }, { data: wl }, { data: sched }] = await Promise.all([
        supabase.from('points').select('total_points').eq('child_id', childData.id).single(),
        supabase.from('wishlists').select('id, product_id').eq('child_id', childData.id),
        supabase.from('focus_schedules').select('*').eq('child_id', childData.id).single(),
      ])
      setPoints((pts as any)?.total_points ?? 0)
      setWishlist(wl ?? [])
      if (sched) setSchedule(sched as Schedule)
    }

    setProducts(prods ?? [])
    setLoading(false)
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // ── Derived ──
  const discountPct = getDiscountPct(points)
  const inWL        = (pid: string) => wishlist.some(w => w.product_id === pid)
  const inCart      = (pid: string) => cart.some(i => i.product.id === pid)
  const cartCount   = cart.reduce((s,i) => s + i.quantity, 0)
  const wishItems   = products.filter(p => inWL(p.id))

  // ── Filtered products ──
  const filtered = useMemo(() => {
    let r = [...products]
    if (category !== 'all') r = r.filter(p => p.category === category)
    if (search)             r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (wishOnly)           r = r.filter(p => inWL(p.id))
    r = r.filter(p => disc(p.price_cad, discountPct) <= maxPrice)
    if (sort === 'price_asc')  r.sort((a,b) => a.price_cad - b.price_cad)
    if (sort === 'price_desc') r.sort((a,b) => b.price_cad - a.price_cad)
    if (sort === 'new')        r = r.filter(p => p.is_new).concat(r.filter(p => !p.is_new))
    return r
  }, [products, category, search, wishOnly, maxPrice, sort, wishlist, discountPct])

  // ── Cart actions ──
  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id===product.id ? {...i, quantity:i.quantity+1} : i)
      return [...prev, { product, quantity:1 }]
    })
  }
  function setQty(id: string, qty: number) {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.product.id !== id)); return }
    setCart(prev => prev.map(i => i.product.id===id ? {...i, quantity:qty} : i))
  }
  function removeFromCart(id: string) { setCart(prev => prev.filter(i => i.product.id !== id)) }

  async function handleCheckout() {
    if (!child || !cart.length) return
    setCheckLoading(true)
    const cartItems = cart.map(i => ({ productId: i.product.id, quantity: i.quantity }))
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems, childId: child.id }),
    })
    const { url, error } = await res.json()
    if (url) { window.location.href = url }
    else { showToast('Erreur lors du paiement. Réessayez.'); setCheckLoading(false) }
  }

  // ── Schedule / profile actions ──
  function toggleDay(d: string) {
    setSchedule(prev => ({ ...prev, days: prev.days.includes(d) ? prev.days.filter(x=>x!==d) : [...prev.days, d] }))
  }
  async function saveSchedule() {
    if (!child) return
    const payload = { ...schedule, child_id: child.id, pomodoro_duration: pomoDur, break_duration: breakDur }
    if (schedule.id) await supabase.from('focus_schedules').update(payload).eq('id', schedule.id)
    else { const { data } = await supabase.from('focus_schedules').insert(payload).select().single(); if (data) setSchedule(data as Schedule) }
    showToast('Horaire mis à jour.')
  }
  async function checkout(cartItems: { productId: string; quantity: number }[]) {
    if (!child || !cartItems.length) return
    setCheckoutLoading(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems, childId: child.id }),
    })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else { showToast('Erreur lors du paiement. Réessayez.'); setCheckoutLoading(false) }
  }
  async function changePassword() {
    if (pwForm.next !== pwForm.confirm) { showToast('Les mots de passe ne correspondent pas.'); return }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    if (error) { showToast('Erreur — mot de passe non modifié.'); return }
    setPwForm({ current:'', next:'', confirm:'' })
    showToast('Mot de passe modifié.')
  }
  async function signOut() { await supabase.auth.signOut(); window.location.href = '/auth' }

  if (loading) return (
    <div style={{ height:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jakarta)' }}>
      <p style={{ color:C.faint, fontSize:14 }}>Chargement...</p>
    </div>
  )

  const TABS: { id:'boutique'|'wishlist'|'profile'; label:string }[] = [
    { id:'boutique', label:'Boutique' },
    { id:'wishlist', label: child ? `Liste de ${child.name}` : 'Liste' },
    { id:'profile',  label:'Profil' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'var(--font-jakarta)', paddingBottom:80 }}>

      {/* ── HEADER ── */}
      <div style={{ background:C.navy, padding:'0 20px', position:'sticky', top:0, zIndex:30 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', height:60 }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:9, margin:0, textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>Portail parents</p>
            <h1 style={{ color:C.white, fontSize:18, fontWeight:800, margin:0, fontFamily:'var(--font-fredoka)' }}>
              Bonjour, {parentName}
            </h1>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {child && discountPct > 0 && (
              <div style={{ background:C.goldDim, border:`1px solid ${C.goldBorder}`, borderRadius:8, padding:'5px 10px' }}>
                <p style={{ color:C.gold, fontSize:11, fontWeight:700, margin:0 }}>{child.name} — {discountPct}% off</p>
              </div>
            )}
            {/* Cart button */}
            <button
              onClick={() => setShowCart(true)}
              style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}
            >
              <span style={{ fontSize:16 }}>🛒</span>
              <span style={{ color:C.white, fontWeight:700, fontSize:13 }}>Panier</span>
              {cartCount > 0 && (
                <div style={{ background:C.gold, borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ color:C.navy, fontSize:11, fontWeight:800 }}>{cartCount}</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, background:'none', border:'none', borderBottom:`2px solid ${tab===t.id?C.gold:'transparent'}`, padding:'9px 4px 13px', color:tab===t.id?C.gold:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.3px', fontFamily:'var(--font-jakarta)' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Toast msg={toast} />

      {/* ════════════════════════════════════════
          BOUTIQUE TAB
      ════════════════════════════════════════ */}
      {tab === 'boutique' && (
        <div style={{ padding:'22px 20px' }}>

          {/* Wishlist callout */}
          {wishItems.filter(p => !inCart(p.id)).length > 0 && (
            <div style={{ background:C.goldDim, border:`1px solid ${C.goldBorder}`, borderRadius:16, padding:'14px 16px', marginBottom:22 }}>
              <p style={{ color:C.navy, fontWeight:800, fontSize:12, margin:'0 0 2px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                Liste de souhaits de {child?.name}
              </p>
              <p style={{ color:C.muted, fontSize:11, margin:'0 0 12px' }}>
                Ces articles ont été ajoutés par {child?.name}. Ajoutez-les au panier directement.
              </p>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
                {wishItems.filter(p => !inCart(p.id)).map(p => (
                  <div key={p.id} style={{ flexShrink:0, background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 12px', display:'flex', gap:10, alignItems:'center', minWidth:220 }}>
                    <div style={{ width:40, height:40, borderRadius:8, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                      {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:20 }}>🎁</span>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:C.navy, fontWeight:700, fontSize:12, margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</p>
                      <p style={{ color:C.navy, fontWeight:800, fontSize:13, margin:0 }}>{disc(p.price_cad, discountPct).toFixed(2)} CAD</p>
                    </div>
                    <button onClick={() => addToCart(p)} style={{ background:C.navy, border:'none', borderRadius:8, padding:'6px 12px', color:C.gold, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                      + Panier
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search + Sort row */}
          <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:180, position:'relative' }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:C.faint }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un jouet..."
                style={{ width:'100%', background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px 10px 34px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', color:C.navy, fontSize:13, fontFamily:'var(--font-jakarta)', cursor:'pointer', outline:'none', fontWeight:600 }}>
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Price range + wishlist toggle */}
          <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 14px' }}>
              <span style={{ color:C.muted, fontSize:12, whiteSpace:'nowrap' }}>Max :</span>
              <input type="range" min={10} max={150} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width:80, accentColor:C.navy }} />
              <span style={{ color:C.navy, fontWeight:700, fontSize:12, whiteSpace:'nowrap', minWidth:64 }}>{maxPrice} CAD</span>
            </div>
            <button onClick={() => setWishOnly(!wishOnly)}
              style={{ background:wishOnly?C.navy:C.white, border:`1px solid ${wishOnly?C.navy:C.border}`, borderRadius:10, padding:'9px 16px', color:wishOnly?C.gold:C.muted, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}>
              ❤️ Souhaités seulement
            </button>
          </div>

          {/* Category pills + result count */}
          <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                style={{ background:category===cat.id?C.navy:C.white, border:`1px solid ${category===cat.id?C.navy:C.border}`, borderRadius:99, padding:'7px 18px', color:category===cat.id?C.gold:C.muted, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                {cat.label}
              </button>
            ))}
            <span style={{ marginLeft:'auto', color:C.faint, fontSize:12 }}>
              {filtered.length} résultat{filtered.length!==1?'s':''}
            </span>
          </div>

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:'48px 20px', textAlign:'center' }}>
              <p style={{ fontSize:32, margin:'0 0 10px' }}>🔍</p>
              <p style={{ color:C.navy, fontWeight:700, fontSize:14, margin:'0 0 4px', fontFamily:'var(--font-fredoka)' }}>Aucun résultat</p>
              <p style={{ color:C.faint, fontSize:12, margin:0 }}>Essayez d'ajuster vos filtres</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16 }}>
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  discountPct={discountPct}
                  inCart={inCart(p.id)}
                  isWished={inWL(p.id)}
                  onAdd={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          WISHLIST TAB
      ════════════════════════════════════════ */}
      {tab === 'wishlist' && (
        <div style={{ padding:'22px 20px' }}>
          <Card style={{ marginBottom:20 }}>
            <Label>Récompense gagnée par {child?.name}</Label>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              {TIER_PCTS.map((pct, i) => (
                <div key={pct} style={{ flex:1, background:points>=TIERS[i]?C.navy:'transparent', border:`1px solid ${points>=TIERS[i]?C.navy:C.border}`, borderRadius:8, padding:'6px 4px', textAlign:'center', transition:'all 0.2s' }}>
                  <p style={{ color:points>=TIERS[i]?C.gold:C.faint, fontWeight:700, fontSize:11, margin:0 }}>{pct}%</p>
                </div>
              ))}
            </div>
            <p style={{ color:C.muted, fontSize:11, margin:0 }}>
              {points} points accumulés
              {discountPct < 30 && ` · Prochain palier à ${TIERS.find(t => t > points)} points`}
            </p>
          </Card>

          <p style={{ color:C.faint, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 4px' }}>Articles souhaités</p>
          <p style={{ color:C.faint, fontSize:11, margin:'0 0 14px' }}>
            {child?.name} a ajouté {wishlist.length} article(s). Le rabais de {discountPct}% est appliqué automatiquement.
          </p>

          {wishItems.length === 0 ? (
            <Card style={{ textAlign:'center', padding:'28px 20px' }}>
              <p style={{ color:C.faint, fontSize:13, margin:0 }}>
                {child?.name} n'a pas encore ajouté de jouets.
              </p>
            </Card>
          ) : wishItems.map(p => (
            <div key={p.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px', display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
              <div style={{ width:54, height:54, borderRadius:12, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:26 }}>🎁</span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 4px' }}>{p.name}</p>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                  <span style={{ color:C.faint, fontSize:10, textDecoration:'line-through' }}>{p.price_cad.toFixed(2)} CAD</span>
                  <span style={{ color:C.navy, fontWeight:800, fontSize:14 }}>{disc(p.price_cad, discountPct).toFixed(2)} CAD</span>
                </div>
                <p style={{ color:C.green, fontSize:10, fontWeight:600, margin:0 }}>
                  Économie de {saved(p.price_cad, discountPct).toFixed(2)} CAD grâce aux points de {child?.name}
                </p>
              </div>
              <button onClick={() => addToCart(p)} style={{ background:inCart(p.id)?C.goldDim:C.navy, border:`1px solid ${inCart(p.id)?C.goldBorder:C.navy}`, borderRadius:10, padding:'10px 14px', color:inCart(p.id)?C.navy:C.gold, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0, fontFamily:'var(--font-jakarta)', transition:'all 0.2s' }}>
                {inCart(p.id) ? '✓ Dans le panier' : 'Acheter'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════
          PROFILE TAB
      ════════════════════════════════════════ */}
      {tab === 'profile' && (
        <div style={{ padding:'22px 20px' }}>

          <SectionTitle>Informations du compte</SectionTitle>
          <Card style={{ marginBottom:22 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:48, height:48, borderRadius:14, background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:C.gold, fontSize:18, fontWeight:800, fontFamily:'var(--font-fredoka)' }}>{parentName[0]?.toUpperCase() ?? 'P'}</span>
              </div>
              <div>
                <p style={{ color:C.navy, fontWeight:700, fontSize:14, margin:'0 0 2px', fontFamily:'var(--font-fredoka)' }}>{parentName}</p>
                <p style={{ color:C.faint, fontSize:12, margin:0 }}>{user?.email ?? ''}</p>
              </div>
            </div>
            <TextInput label="Adresse courriel" type="email" value={user?.email ?? ''} onChange={() => {}} />
            <button onClick={() => showToast('Informations mises à jour.')} style={{ width:'100%', background:C.navy, border:'none', borderRadius:10, padding:'11px 0', color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
              Sauvegarder
            </button>
          </Card>

          <SectionTitle>Modifier le mot de passe</SectionTitle>
          <Card style={{ marginBottom:22 }}>
            <TextInput label="Mot de passe actuel"       type="password" value={pwForm.current}  onChange={v => setPwForm(p=>({...p,current:v}))}  placeholder="••••••••" />
            <TextInput label="Nouveau mot de passe"      type="password" value={pwForm.next}     onChange={v => setPwForm(p=>({...p,next:v}))}     placeholder="••••••••" />
            <TextInput label="Confirmer le mot de passe" type="password" value={pwForm.confirm}  onChange={v => setPwForm(p=>({...p,confirm:v}))}  placeholder="••••••••" />
            <button onClick={changePassword} style={{ width:'100%', background:C.navy, border:'none', borderRadius:10, padding:'11px 0', color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
              Modifier le mot de passe
            </button>
          </Card>

          <SectionTitle>Sessions d'étude — {child?.name}</SectionTitle>
          <Card style={{ marginBottom:22 }}>
            <Label>Jours actifs</Label>
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {DAYS_SHORT.map(d => (
                <button key={d} onClick={() => toggleDay(d)} style={{ flex:1, background:schedule.days.includes(d)?C.navy:'transparent', border:`1px solid ${schedule.days.includes(d)?C.navy:C.border}`, borderRadius:8, padding:'7px 2px', color:schedule.days.includes(d)?C.gold:C.faint, fontSize:9, fontWeight:700, cursor:'pointer', transition:'all 0.2s', fontFamily:'var(--font-jakarta)' }}>
                  {d}
                </button>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[{label:'Heure de début',key:'start_time'},{label:'Heure de fin',key:'end_time'}].map(f => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  <input type="time" value={schedule[f.key as keyof Schedule] as string} onChange={e => setSchedule(p=>({...p,[f.key]:e.target.value}))}
                    style={{ width:'100%', background:C.white, border:`1px solid ${C.borderDark}`, borderRadius:10, padding:'9px 10px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {[{label:'Durée Pomodoro (min)',val:pomoDur,set:setPomoDur},{label:'Durée pause (min)',val:breakDur,set:setBreakDur}].map(f => (
                <div key={f.label}>
                  <Label>{f.label}</Label>
                  <input type="number" min={5} max={60} value={f.val} onChange={e => f.set(Number(e.target.value))}
                    style={{ width:'100%', background:C.white, border:`1px solid ${C.borderDark}`, borderRadius:10, padding:'9px 10px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
              <div>
                <p style={{ color:C.navy, fontWeight:700, fontSize:12, margin:'0 0 2px' }}>Sessions actives</p>
                <p style={{ color:C.faint, fontSize:11, margin:0 }}>Activer ou désactiver les rappels d'étude</p>
              </div>
              <button onClick={() => setSchedule(p=>({...p,active:!p.active}))} style={{ width:44, height:24, borderRadius:99, border:'none', cursor:'pointer', background:schedule.active?C.navy:C.border, position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:C.white, position:'absolute', top:3, left:schedule.active?23:3, transition:'left 0.2s' }} />
              </button>
            </div>
            <button onClick={saveSchedule} style={{ width:'100%', background:C.navy, border:'none', borderRadius:10, padding:'11px 0', color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
              Sauvegarder l'horaire
            </button>
          </Card>

          <SectionTitle>Notifications par courriel</SectionTitle>
          <Card style={{ marginBottom:22 }}>
            {[
              { key:'weeklyReport',  label:'Rapport hebdomadaire',         desc:`Activité, points et progrès de ${child?.name ?? 'votre enfant'}` },
              { key:'tierReached',   label:'Nouveau palier de rabais',     desc:`Quand ${child?.name ?? 'votre enfant'} atteint un nouveau niveau` },
              { key:'wishlistAdded', label:'Ajout à la liste de souhaits', desc:`Quand ${child?.name ?? 'votre enfant'} ajoute un jouet` },
            ].map((n, i) => (
              <div key={n.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:i<2?'14px':0, marginBottom:i<2?'14px':0, borderBottom:i<2?`1px solid ${C.border}`:'none' }}>
                <div>
                  <p style={{ color:C.navy, fontWeight:700, fontSize:12, margin:'0 0 2px' }}>{n.label}</p>
                  <p style={{ color:C.faint, fontSize:11, margin:0 }}>{n.desc}</p>
                </div>
                <button onClick={() => setNotifs(p=>({...p,[n.key]:!p[n.key as keyof typeof p]}))} style={{ width:44, height:24, borderRadius:99, border:'none', cursor:'pointer', background:notifs[n.key as keyof typeof notifs]?C.navy:C.border, position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:C.white, position:'absolute', top:3, left:notifs[n.key as keyof typeof notifs]?23:3, transition:'left 0.2s' }} />
                </button>
              </div>
            ))}
          </Card>

          <SectionTitle>Compte</SectionTitle>
          <Card>
            <button onClick={signOut} style={{ width:'100%', background:'transparent', border:`1px solid ${C.navy}`, borderRadius:10, padding:'11px 0', color:C.navy, fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:10, fontFamily:'var(--font-jakarta)' }}>
              Se déconnecter
            </button>
            <button style={{ width:'100%', background:'transparent', border:`1px solid ${C.red}`, borderRadius:10, padding:'11px 0', color:C.red, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
              Supprimer le compte
            </button>
          </Card>
        </div>
      )}

      {/* ── CART DRAWER ── */}
      {showCart && (
        <CartDrawer
          cart={cart}
          discountPct={discountPct}
          onClose={() => setShowCart(false)}
          onQty={setQty}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          loading={checkLoading}
        />
      )}

      {/* ── FLOATING CART (when drawer is closed) ── */}
      {cartCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          style={{ position:'fixed', bottom:24, right:24, background:C.navy, border:'none', borderRadius:99, padding:'14px 22px', color:C.gold, fontWeight:800, fontSize:13, cursor:'pointer', boxShadow:'0 8px 32px rgba(11,31,75,0.3)', display:'flex', alignItems:'center', gap:10, zIndex:20, fontFamily:'var(--font-jakarta)' }}
        >
          🛒 Panier · {cartCount} article{cartCount!==1?'s':''}
        </button>
      )}
    </div>
  )
}
