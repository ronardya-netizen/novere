'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'


const C = {
  navy:'#0B1F4B', gold:'#FBBF24',
  goldDim:'rgba(251,191,36,0.1)', goldBorder:'rgba(251,191,36,0.25)',
  bg:'#F4F7FF', white:'#FFFFFF', border:'#E2E8F0',
  text:'#0F172A', muted:'#64748B', faint:'#94A3B8',
  green:'#16A34A', greenBg:'#DCFCE7',
  red:'#EF4444', redBg:'#FEE2E2',
}


const MARKUP = 0.35
const TIERS  = [
  { pct:5,  minPts:500  },
  { pct:10, minPts:1000 },
  { pct:20, minPts:2500 },
  { pct:30, minPts:5000 },
]


type Product = {
  id: string; name: string; price_cad: number; cost_cad: number
  category: string; image_url: string | null; is_new: boolean; active: boolean; stock: number
}


const EMPTY: Omit<Product,'id'> = {
  name:'', price_cad:0, cost_cad:0, category:'toy',
  image_url:'', is_new:false, active:true, stock:0,
}


function margin(price: number, cost: number) {
  if (!price || !cost) return null
  return ((price - cost) / price * 100).toFixed(0)
}


function viableTiers(price: number, cost: number) {
  return TIERS.filter(t => price * (1 - t.pct/100) >= cost * (1 + MARKUP))
}


export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [form,     setForm]     = useState<Omit<Product,'id'>>(EMPTY)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState('')
  const [filter,   setFilter]   = useState<'all'|'toy'|'game'|'merch'>('all')
  const [showForm, setShowForm] = useState(false)


  useEffect(() => { load() }, [])


  async function load() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
  }


  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }


  function startEdit(p: Product) {
    setForm({ name:p.name, price_cad:p.price_cad, cost_cad:p.cost_cad, category:p.category, image_url:p.image_url??'', is_new:p.is_new, active:p.active, stock:p.stock })
    setEditing(p.id)
    setShowForm(true)
    window.scrollTo({ top:0, behavior:'smooth' })
  }


  function resetForm() { setForm(EMPTY); setEditing(null); setShowForm(false) }


  async function save() {
    if (!form.name || !form.price_cad || !form.cost_cad) { showToast('Nom, prix et coût sont requis.'); return }
    setLoading(true)
    const payload = { ...form, image_url: form.image_url || null }
    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing)
      showToast('Produit mis à jour.')
    } else {
      await supabase.from('products').insert(payload)
      showToast('Produit ajouté.')
    }
    await load()
    resetForm()
    setLoading(false)
  }


  async function toggleActive(p: Product) {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    await load()
  }


  async function deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit définitivement?')) return
    await supabase.from('products').delete().eq('id', id)
    await load()
    showToast('Produit supprimé.')
  }


  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter)
  const viable   = viableTiers(form.price_cad, form.cost_cad)
  const mgn      = margin(form.price_cad, form.cost_cad)


  return (
    <div style={{ fontFamily:'var(--font-jakarta)' }}>


      {/* Toast */}
      {toast && (
        <div style={{ background:C.greenBg, border:'1px solid #86EFAC', borderRadius:10, padding:'10px 16px', marginBottom:16 }}>
          <p style={{ color:C.green, fontWeight:700, fontSize:13, margin:0 }}>{toast}</p>
        </div>
      )}


      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h2 style={{ color:C.navy, fontFamily:'var(--font-fredoka)', fontSize:24, margin:'0 0 4px' }}>Produits</h2>
          <p style={{ color:C.faint, fontSize:13, margin:0 }}>{products.length} produits · {products.filter(p=>p.active).length} actifs</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} style={{ background:C.navy, border:'none', borderRadius:12, padding:'10px 20px', color:C.gold, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
          + Ajouter un produit
        </button>
      </div>


      {/* Form */}
      {showForm && (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:20, padding:24, marginBottom:28 }}>
          <h3 style={{ color:C.navy, fontFamily:'var(--font-fredoka)', fontSize:18, margin:'0 0 20px' }}>
            {editing ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>


          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {/* Name */}
            <div style={{ gridColumn:'1/-1' }}>
              <p style={{ color:C.faint, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', margin:'0 0 6px' }}>Nom du produit</p>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="ex: Voiture télécommandée XL" style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
            </div>


            {/* Price */}
            <div>
              <p style={{ color:C.faint, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', margin:'0 0 6px' }}>Prix de vente (CAD)</p>
              <input type="number" step="0.01" value={form.price_cad || ''} onChange={e => setForm(f=>({...f,price_cad:parseFloat(e.target.value)||0}))} placeholder="0.00" style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
            </div>


            {/* Cost */}
            <div>
              <p style={{ color:C.faint, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', margin:'0 0 6px' }}>Coût (CAD)</p>
              <input type="number" step="0.01" value={form.cost_cad || ''} onChange={e => setForm(f=>({...f,cost_cad:parseFloat(e.target.value)||0}))} placeholder="0.00" style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
            </div>


            {/* Stock */}
            <div>
              <p style={{ color:C.faint, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', margin:'0 0 6px' }}>Stock</p>
              <input type="number" value={form.stock || ''} onChange={e => setForm(f=>({...f,stock:parseInt(e.target.value)||0}))} placeholder="0" style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
            </div>


            {/* Category */}
            <div>
              <p style={{ color:C.faint, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', margin:'0 0 6px' }}>Catégorie</p>
              <select value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }}>
                <option value="toy">Jouet</option>
                <option value="game">Jeu</option>
                <option value="merch">Merch</option>
                <option value="book">Livre</option>
              </select>
            </div>


            {/* Image URL */}
            <div style={{ gridColumn:'1/-1' }}>
              <p style={{ color:C.faint, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', margin:'0 0 6px' }}>URL de l'image</p>
              <input value={form.image_url ?? ''} onChange={e => setForm(f=>({...f,image_url:e.target.value}))} placeholder="https://..." style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
            </div>


            {/* Toggles */}
            <div style={{ display:'flex', gap:16 }}>
              {[{label:'Nouveau',key:'is_new'},{label:'Actif',key:'active'}].map(toggle => (
                <div key={toggle.key} onClick={() => setForm(f=>({...f,[toggle.key]:!f[toggle.key as keyof typeof f]}))} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                  <div style={{ width:40, height:22, borderRadius:99, background:form[toggle.key as keyof typeof form] ? C.navy : C.border, position:'relative', transition:'background .2s' }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', background:C.white, position:'absolute', top:3, left:form[toggle.key as keyof typeof form] ? 21 : 3, transition:'left .2s' }} />
                  </div>
                  <span style={{ color:C.navy, fontSize:13, fontWeight:600 }}>{toggle.label}</span>
                </div>
              ))}
            </div>
          </div>


          {/* Margin calculator */}
          {form.price_cad > 0 && form.cost_cad > 0 && (
            <div style={{ marginTop:20, background:C.bg, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
              <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 10px' }}>Calculateur de marge</p>
              <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                <div style={{ background: parseFloat(mgn??'0') >= 35 ? C.greenBg : C.redBg, border:`1px solid ${parseFloat(mgn??'0') >= 35 ? '#86EFAC' : '#FCA5A5'}`, borderRadius:10, padding:'8px 14px' }}>
                  <p style={{ color: parseFloat(mgn??'0') >= 35 ? C.green : C.red, fontWeight:700, fontSize:13, margin:0 }}>
                    Marge brute : {mgn}% {parseFloat(mgn??'0') >= 35 ? '✓' : '⚠️ En dessous de 35%'}
                  </p>
                </div>
              </div>
              <p style={{ color:C.faint, fontSize:12, margin:'0 0 8px', fontWeight:600 }}>Paliers de rabais viables pour ce produit :</p>
              <div style={{ display:'flex', gap:6 }}>
                {TIERS.map(t => {
                  const ok = viable.some(v => v.pct === t.pct)
                  return (
                    <div key={t.pct} style={{ background: ok ? C.goldDim : C.bg, border:`1px solid ${ok ? C.goldBorder : C.border}`, borderRadius:8, padding:'6px 12px', textAlign:'center' }}>
                      <p style={{ color: ok ? C.navy : C.faint, fontWeight:700, fontSize:12, margin:0 }}>{t.pct}%</p>
                      <p style={{ color: ok ? C.muted : C.faint, fontSize:10, margin:'2px 0 0' }}>{t.minPts} pts</p>
                    </div>
                  )
                })}
              </div>
              {viable.length === 0 && (
                <p style={{ color:C.red, fontSize:12, fontWeight:600, marginTop:8 }}>
                  ⚠️ Ce produit ne peut être offert avec aucun rabais tout en respectant la marge de 35%.
                </p>
              )}
            </div>
          )}


          {/* Actions */}
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <button onClick={save} disabled={loading} style={{ background:C.navy, border:'none', borderRadius:12, padding:'11px 24px', color:C.gold, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
              {loading ? 'Sauvegarde...' : editing ? 'Mettre à jour' : 'Ajouter le produit'}
            </button>
            <button onClick={resetForm} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 24px', color:C.muted, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
              Annuler
            </button>
          </div>
        </div>
      )}


      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {(['all','toy','game','merch'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter===f ? C.navy : C.white, border:`1px solid ${filter===f ? C.navy : C.border}`, borderRadius:99, padding:'6px 16px', color: filter===f ? C.gold : C.muted, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s' }}>
            {f === 'all' ? 'Tous' : f === 'toy' ? 'Jouets' : f === 'game' ? 'Jeux' : 'Merch'}
          </button>
        ))}
      </div>


      {/* Product list */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.length === 0 ? (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:32, textAlign:'center' }}>
            <p style={{ color:C.faint, fontSize:14 }}>Aucun produit. Cliquez sur "Ajouter un produit" pour commencer.</p>
          </div>
        ) : filtered.map(p => {
          const mgn = margin(p.price_cad, p.cost_cad)
          const ok  = parseFloat(mgn??'0') >= 35
          return (
            <div key={p.id} style={{ background:C.white, border:`1px solid ${p.active ? C.border : '#E5E7EB'}`, borderRadius:16, padding:'14px 18px', display:'flex', gap:14, alignItems:'center', opacity: p.active ? 1 : 0.55 }}>
              {/* Image */}
              <div style={{ width:56, height:56, borderRadius:10, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:24 }}>🎁</span>}
              </div>


              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <p style={{ color:C.navy, fontWeight:700, fontSize:14, margin:0 }}>{p.name}</p>
                  {p.is_new && <span style={{ background:C.goldDim, color:C.navy, fontSize:9, fontWeight:700, borderRadius:6, padding:'2px 7px' }}>NOUVEAU</span>}
                  {!p.active && <span style={{ background:'#F3F4F6', color:C.faint, fontSize:9, fontWeight:700, borderRadius:6, padding:'2px 7px' }}>INACTIF</span>}
                </div>
                <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                  <span style={{ color:C.navy, fontWeight:700, fontSize:13 }}>{p.price_cad.toFixed(2)} CAD</span>
                  <span style={{ color:C.faint, fontSize:12 }}>coût : {p.cost_cad.toFixed(2)} CAD</span>
                  <span style={{ color: ok ? C.green : C.red, fontWeight:700, fontSize:12 }}>marge : {mgn}%</span>
                  <span style={{ color:C.faint, fontSize:12 }}>stock : {p.stock}</span>
                </div>
              </div>


              {/* Actions */}
              <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                <button onClick={() => startEdit(p)} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 14px', color:C.navy, fontSize:12, fontWeight:700, cursor:'pointer' }}>Modifier</button>
                <button onClick={() => toggleActive(p)} style={{ background: p.active ? '#FEF3C7' : C.greenBg, border:`1px solid ${p.active ? '#FDE68A' : '#86EFAC'}`, borderRadius:8, padding:'6px 14px', color: p.active ? '#92400E' : C.green, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  {p.active ? 'Désactiver' : 'Activer'}
                </button>
                <button onClick={() => deleteProduct(p.id)} style={{ background:C.redBg, border:'1px solid #FCA5A5', borderRadius:8, padding:'6px 14px', color:C.red, fontSize:12, fontWeight:700, cursor:'pointer' }}>Supprimer</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
