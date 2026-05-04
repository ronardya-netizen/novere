'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = {
  id: string; name: string; price_cad: number
  image_url: string | null; category: string
  stock: number; cost_cad: number
}
type WishlistItem = { id: string; product_id: string }
type Child = {
  id: string; name: string; grade: number | null
  pal: { name?: string } | null
}
type PointsData = { total_points: number }
type Schedule = {
  id?: string; days: string[]; start_time: string
  end_time: string; active: boolean
}

const C = {
  navy:'#0B1F4B', navyLight:'rgba(11,31,75,0.05)',
  gold:'#FBBF24', goldDim:'rgba(251,191,36,0.1)', goldBorder:'rgba(251,191,36,0.25)',
  bg:'#F4F7FF', white:'#FFFFFF',
  border:'#E2E8F0', borderDark:'#CBD5E1',
  text:'#0F172A', muted:'#64748B', faint:'#94A3B8',
  green:'#16A34A', greenBg:'#DCFCE7',
  red:'#EF4444',
}

function getDiscountPct(pts: number) {
  if (pts >= 5000) return 30
  if (pts >= 2500) return 20
  if (pts >= 1000) return 10
  if (pts >= 500)  return 5
  return 0
}

const MARKUP     = 0.35
const DAYS_SHORT = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
const TIERS      = [500, 1000, 2500, 5000]
const TIER_PCTS  = [5, 10, 20, 30]

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ color:C.faint, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px', margin:'0 0 6px', fontFamily:'var(--font-jakarta)' }}>{children}</p>
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ color:C.navy, fontSize:13, fontWeight:800, margin:'0 0 14px', paddingBottom:8, borderBottom:`1px solid ${C.border}`, fontFamily:'var(--font-fredoka)', letterSpacing:'0.3px' }}>{children}</h3>
}
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:16, ...style }}>{children}</div>
}
function TextInput({ label, type='text', value, onChange, placeholder='' }: { label:string; type?:string; value:string; onChange:(v:string)=>void; placeholder?:string }) {
  return (
    <div style={{ marginBottom:14 }}>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width:'100%', background:C.white, border:`1px solid ${C.borderDark}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
    </div>
  )
}
function Toast({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div style={{ background:C.greenBg, border:`1px solid #86EFAC`, borderRadius:10, margin:'12px 20px 0', padding:'10px 14px' }}>
      <p style={{ color:C.green, fontWeight:700, fontSize:12, margin:0, fontFamily:'var(--font-jakarta)' }}>{msg}</p>
    </div>
  )
}

export default function ParentPage() {
  const [tab,      setTab]      = useState<'boutique'|'wishlist'|'profile'>('boutique')
  const [user,     setUser]     = useState<{ id:string; email:string } | null>(null)
  const [child,    setChild]    = useState<Child | null>(null)
  const [points,   setPoints]   = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [bought,   setBought]   = useState<string[]>([])
  const [schedule, setSchedule] = useState<Schedule>({ days:['Lun','Mar','Mer','Jeu','Ven'], start_time:'16:00', end_time:'18:00', active:true })
  const [toast,    setToast]    = useState('')
  const [pwForm,   setPwForm]   = useState({ current:'', next:'', confirm:'' })
  const [notifs,   setNotifs]   = useState({ weeklyReport:true, tierReached:true, wishlistAdded:false })
  const [loading,  setLoading]  = useState(true)
  const [pomoDur,  setPomoDur]  = useState(25)
  const [breakDur, setBreakDur] = useState(5)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    setUser({ id: u.id, email: u.email ?? '' })

    const [{ data: childData }, { data: prods }] = await Promise.all([
      supabase.from('children').select('id, name, grade, pal').eq('parent_id', u.id).single(),
      supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
    ])

    if (childData) {
      setChild(childData)
      const [{ data: pts }, { data: wl }, { data: sched }] = await Promise.all([
        supabase.from('points').select('total_points').eq('child_id', childData.id).single(),
        supabase.from('wishlists').select('id, product_id').eq('child_id', childData.id),
        supabase.from('focus_schedules').select('*').eq('child_id', childData.id).single(),
      ])
      setPoints((pts as PointsData | null)?.total_points ?? 0)
      setWishlist(wl ?? [])
      if (sched) setSchedule(sched as Schedule)
    }

    setProducts(prods ?? [])
    setLoading(false)
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const discPct   = getDiscountPct(points)
  const discPrice = (p: number) => (p * (1 - discPct / 100)).toFixed(2)
  const savedAmt  = (p: number) => (p * discPct / 100).toFixed(2)
  const inWL      = (pid: string) => wishlist.some(w => w.product_id === pid)
  const wishItems = products.filter(p => inWL(p.id) && !bought.includes(p.id))
  const available = products.filter(p => !bought.includes(p.id))
  const curTierPct = [...TIER_PCTS].reverse().find((_, i) => points >= TIERS[TIERS.length - 1 - i]) ?? discPct

  function toggleDay(d: string) {
    setSchedule(prev => ({
      ...prev,
      days: prev.days.includes(d) ? prev.days.filter(x => x !== d) : [...prev.days, d],
    }))
  }

  async function saveSchedule() {
    if (!child) return
    const payload = { ...schedule, child_id: child.id, pomodoro_duration: pomoDur, break_duration: breakDur }
    if (schedule.id) {
      await supabase.from('focus_schedules').update(payload).eq('id', schedule.id)
    } else {
      const { data } = await supabase.from('focus_schedules').insert(payload).select().single()
      if (data) setSchedule(data as Schedule)
    }
    showToast('Horaire mis à jour.')
  }

  async function saveAccount() {
    showToast('Informations mises à jour.')
  }

  async function changePassword() {
    if (pwForm.next !== pwForm.confirm) { showToast('Les mots de passe ne correspondent pas.'); return }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    if (error) { showToast('Erreur — mot de passe non modifié.'); return }
    setPwForm({ current:'', next:'', confirm:'' })
    showToast('Mot de passe modifié.')
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (loading) return (
    <div style={{ height:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jakarta)' }}>
      <p style={{ color:C.faint, fontSize:14 }}>Chargement...</p>
    </div>
  )

  const TABS: { id:'boutique'|'wishlist'|'profile'; label:string }[] = [
    { id:'boutique', label:'Boutique' },
    { id:'wishlist', label:child ? `Liste de ${child.name}` : 'Liste' },
    { id:'profile',  label:'Profil' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'var(--font-jakarta)', paddingBottom:80 }}>

      {/* ── HEADER ── */}
      <div style={{ background:C.navy, padding:'24px 20px 0', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:10, margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>
              Portail parents
            </p>
            <h1 style={{ color:C.white, fontSize:20, fontWeight:800, margin:'0 0 4px', fontFamily:'var(--font-fredoka)' }}>
              Bonjour, {user?.email?.split('@')[0] ?? 'Parent'}
            </h1>
            {child && (
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, margin:0 }}>
                {child.name} — <span style={{ color:C.gold, fontWeight:600 }}>{discPct}% de rabais actif</span>
              </p>
            )}
          </div>
          {child && (
            <div style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 14px', textAlign:'center', flexShrink:0 }}>
              <p style={{ color:C.gold, fontSize:16, fontWeight:800, margin:0, fontFamily:'var(--font-fredoka)' }}>{points}</p>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:9, margin:0, textTransform:'uppercase', letterSpacing:'0.5px' }}>points</p>
            </div>
          )}
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

      <div style={{ padding:'22px 20px 40px' }}>

        {/* ════════════════════════════════════════
            BOUTIQUE
        ════════════════════════════════════════ */}
        {tab === 'boutique' && (
          <>
            {/* Wishlist callout */}
            {wishItems.length > 0 && (
              <div style={{ background:C.goldDim, border:`1px solid ${C.goldBorder}`, borderRadius:16, padding:'14px 16px', marginBottom:22 }}>
                <p style={{ color:C.navy, fontWeight:800, fontSize:12, margin:'0 0 2px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  Liste de souhaits de {child?.name}
                </p>
                <p style={{ color:C.muted, fontSize:11, margin:'0 0 14px' }}>
                  Ces articles ont été ajoutés par {child?.name}.
                </p>
                {wishItems.map(p => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:'rgba(11,31,75,0.06)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                      {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:20 }}>🎁</span>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ color:C.navy, fontWeight:700, fontSize:12, margin:'0 0 3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</p>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ color:C.faint, fontSize:10, textDecoration:'line-through' }}>{p.price_cad.toFixed(2)} CAD</span>
                        <span style={{ color:C.navy, fontWeight:800, fontSize:13 }}>{discPrice(p.price_cad)} CAD</span>
                        <span style={{ background:C.greenBg, color:C.green, fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px' }}>
                          -{discPct}% · économie de {savedAmt(p.price_cad)} CAD
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setBought(prev => [...prev, p.id])} style={{ background:C.navy, border:'none', borderRadius:10, padding:'8px 14px', color:C.gold, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0, fontFamily:'var(--font-jakarta)' }}>
                      Acheter
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p style={{ color:C.faint, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 12px' }}>
              Catalogue complet
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {available.map(p => (
                <div key={p.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'12px 14px', display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:50, height:50, borderRadius:10, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                    {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:24 }}>🎁</span>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:C.faint, fontSize:10, textDecoration:'line-through' }}>{p.price_cad.toFixed(2)} CAD</span>
                      <span style={{ color:C.navy, fontWeight:800, fontSize:13 }}>{discPrice(p.price_cad)} CAD</span>
                      {inWL(p.id) && <span style={{ background:C.goldDim, color:C.navy, fontSize:9, fontWeight:700, borderRadius:4, padding:'2px 6px' }}>Souhaité</span>}
                    </div>
                  </div>
                  {p.stock > 0 && p.stock < 5 && (
                    <span style={{ color:C.red, fontSize:9, fontWeight:700, flexShrink:0 }}>Plus que {p.stock}!</span>
                  )}
                  <button onClick={() => setBought(prev => [...prev, p.id])} style={{ background:C.navy, border:'none', borderRadius:10, padding:'8px 12px', color:C.gold, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0, fontFamily:'var(--font-jakarta)' }}>
                    Acheter
                  </button>
                </div>
              ))}
            </div>

            {bought.length > 0 && (
              <div style={{ background:C.greenBg, border:'1px solid #86EFAC', borderRadius:12, padding:'12px 16px', marginTop:14, textAlign:'center' }}>
                <p style={{ color:C.green, fontWeight:700, fontSize:12, margin:'0 0 2px' }}>{bought.length} commande(s) confirmée(s)</p>
                <p style={{ color:C.green, fontSize:11, margin:0 }}>Votre enfant sera surpris.</p>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            WISHLIST
        ════════════════════════════════════════ */}
        {tab === 'wishlist' && (
          <>
            {/* Tier summary */}
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
                {discPct < 30 && ` · Prochain palier à ${TIERS.find(t => t > points)} points`}
              </p>
            </Card>

            <p style={{ color:C.faint, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 4px' }}>
              Articles souhaités
            </p>
            <p style={{ color:C.faint, fontSize:11, margin:'0 0 14px' }}>
              {child?.name} a ajouté {wishlist.length} article(s). Le rabais de {discPct}% est appliqué automatiquement.
            </p>

            {wishItems.length === 0 ? (
              <Card style={{ textAlign:'center', padding:'28px 20px' }}>
                <p style={{ color:C.faint, fontSize:13, margin:0 }}>
                  {wishlist.length === 0 ? `${child?.name} n'a pas encore ajouté de jouets.` : 'Tous les articles ont été achetés.'}
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
                    <span style={{ color:C.navy, fontWeight:800, fontSize:14 }}>{discPrice(p.price_cad)} CAD</span>
                  </div>
                  <p style={{ color:C.green, fontSize:10, fontWeight:600, margin:0 }}>
                    Économie de {savedAmt(p.price_cad)} CAD grâce aux points de {child?.name}
                  </p>
                </div>
                <button onClick={() => setBought(prev => [...prev, p.id])} style={{ background:C.navy, border:'none', borderRadius:10, padding:'10px 14px', color:C.gold, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0, fontFamily:'var(--font-jakarta)' }}>
                  Acheter
                </button>
              </div>
            ))}
          </>
        )}

        {/* ════════════════════════════════════════
            PROFILE
        ════════════════════════════════════════ */}
        {tab === 'profile' && (
          <>

            {/* Account */}
            <SectionTitle>Informations du compte</SectionTitle>
            <Card style={{ marginBottom:22 }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
                <div style={{ width:48, height:48, borderRadius:14, background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ color:C.gold, fontSize:18, fontWeight:800, fontFamily:'var(--font-fredoka)' }}>
                    {(user?.email ?? 'P')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p style={{ color:C.navy, fontWeight:700, fontSize:14, margin:'0 0 2px', fontFamily:'var(--font-fredoka)' }}>
                    {user?.email?.split('@')[0] ?? ''}
                  </p>
                  <p style={{ color:C.faint, fontSize:12, margin:0 }}>{user?.email ?? ''}</p>
                </div>
              </div>
              <TextInput label="Adresse courriel" type="email" value={user?.email ?? ''} onChange={() => {}} />
              <button onClick={saveAccount} style={{ width:'100%', background:C.navy, border:'none', borderRadius:10, padding:'11px 0', color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
                Sauvegarder
              </button>
            </Card>

            {/* Password */}
            <SectionTitle>Modifier le mot de passe</SectionTitle>
            <Card style={{ marginBottom:22 }}>
              <TextInput label="Mot de passe actuel"      type="password" value={pwForm.current}  onChange={v => setPwForm(p => ({...p,current:v}))}  placeholder="••••••••" />
              <TextInput label="Nouveau mot de passe"     type="password" value={pwForm.next}     onChange={v => setPwForm(p => ({...p,next:v}))}     placeholder="••••••••" />
              <TextInput label="Confirmer le mot de passe" type="password" value={pwForm.confirm} onChange={v => setPwForm(p => ({...p,confirm:v}))} placeholder="••••••••" />
              <button onClick={changePassword} style={{ width:'100%', background:C.navy, border:'none', borderRadius:10, padding:'11px 0', color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
                Modifier le mot de passe
              </button>
            </Card>

            {/* Study sessions */}
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
                    <input type="time" value={schedule[f.key as keyof Schedule] as string} onChange={e => setSchedule(p => ({...p,[f.key]:e.target.value}))} style={{ width:'100%', background:C.white, border:`1px solid ${C.borderDark}`, borderRadius:10, padding:'9px 10px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {[{label:'Durée Pomodoro (min)',val:pomoDur,set:setPomoDur},{label:'Durée pause (min)',val:breakDur,set:setBreakDur}].map(f => (
                  <div key={f.label}>
                    <Label>{f.label}</Label>
                    <input type="number" min={5} max={60} value={f.val} onChange={e => f.set(Number(e.target.value))} style={{ width:'100%', background:C.white, border:`1px solid ${C.borderDark}`, borderRadius:10, padding:'9px 10px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
                <div>
                  <p style={{ color:C.navy, fontWeight:700, fontSize:12, margin:'0 0 2px' }}>Sessions actives</p>
                  <p style={{ color:C.faint, fontSize:11, margin:0 }}>Activer ou désactiver les rappels d'étude</p>
                </div>
                <button onClick={() => setSchedule(p => ({...p,active:!p.active}))} style={{ width:44, height:24, borderRadius:99, border:'none', cursor:'pointer', background:schedule.active?C.navy:C.border, position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:C.white, position:'absolute', top:3, left:schedule.active?23:3, transition:'left 0.2s' }} />
                </button>
              </div>

              <button onClick={saveSchedule} style={{ width:'100%', background:C.navy, border:'none', borderRadius:10, padding:'11px 0', color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
                Sauvegarder l'horaire
              </button>
            </Card>

            {/* Notifications */}
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
                  <button onClick={() => setNotifs(p => ({...p,[n.key]:!p[n.key as keyof typeof p]}))} style={{ width:44, height:24, borderRadius:99, border:'none', cursor:'pointer', background:notifs[n.key as keyof typeof notifs]?C.navy:C.border, position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:C.white, position:'absolute', top:3, left:notifs[n.key as keyof typeof notifs]?23:3, transition:'left 0.2s' }} />
                  </button>
                </div>
              ))}
            </Card>

            {/* Account actions */}
            <SectionTitle>Compte</SectionTitle>
            <Card>
              <button onClick={signOut} style={{ width:'100%', background:'transparent', border:`1px solid ${C.navy}`, borderRadius:10, padding:'11px 0', color:C.navy, fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:10, fontFamily:'var(--font-jakarta)' }}>
                Se déconnecter
              </button>
              <button style={{ width:'100%', background:'transparent', border:`1px solid ${C.red}`, borderRadius:10, padding:'11px 0', color:C.red, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
                Supprimer le compte
              </button>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
