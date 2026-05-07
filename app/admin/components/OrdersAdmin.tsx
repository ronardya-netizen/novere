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


type OrderItem = { id: string; product_name: string; quantity: number; unit_price_cad: number; product_image_url: string | null }
type Order = {
  id: string; status: string; total_cad: number; discount_cad: number
  shipping_name: string; shipping_address: string; shipping_city: string
  shipping_province: string; shipping_postal_code: string
  created_at: string; notes: string | null; child_id: string
  order_items: OrderItem[]
}


const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  paid:       { label:'Payé',       bg:'#DCFCE7', color:'#16A34A' },
  fulfilled:  { label:'Expédié',    bg:C.goldDim, color:C.navy    },
  cancelled:  { label:'Annulé',     bg:'#FEE2E2', color:'#EF4444' },
  processing: { label:'En cours',   bg:'#F0F9FF', color:'#0369A1' },
}


export default function OrdersAdmin() {
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toast,    setToast]    = useState('')


  useEffect(() => { load() }, [])


  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }


  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }


  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id)
    showToast(`Commande marquée comme "${STATUS_CONFIG[status]?.label ?? status}".`)
    await load()
  }


  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)


  const stats = {
    total:     orders.length,
    revenue:   orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s+o.total_cad, 0),
    pending:   orders.filter(o => o.status === 'paid').length,
    fulfilled: orders.filter(o => o.status === 'fulfilled').length,
  }


  return (
    <div style={{ fontFamily:'var(--font-jakarta)' }}>


      {toast && (
        <div style={{ background:C.greenBg, border:'1px solid #86EFAC', borderRadius:10, padding:'10px 16px', marginBottom:16 }}>
          <p style={{ color:C.green, fontWeight:700, fontSize:13, margin:0 }}>{toast}</p>
        </div>
      )}


      {/* Header + stats */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ color:C.navy, fontFamily:'var(--font-fredoka)', fontSize:24, margin:'0 0 16px' }}>Commandes</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { label:'Total commandes',   value:stats.total,                 unit:'',     color:C.navy    },
            { label:'Revenus',           value:stats.revenue.toFixed(2),    unit:'CAD',  color:C.green   },
            { label:'À expédier',        value:stats.pending,               unit:'',     color:'#D97706' },
            { label:'Expédiées',         value:stats.fulfilled,             unit:'',     color:C.green   },
          ].map((s,i) => (
            <div key={i} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px' }}>
              <p style={{ color:s.color, fontWeight:800, fontSize:20, margin:'0 0 2px', fontFamily:'var(--font-fredoka)' }}>{s.value}<span style={{ fontSize:12, marginLeft:4 }}>{s.unit}</span></p>
              <p style={{ color:C.faint, fontSize:11, margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>


      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[{id:'all',label:'Toutes'},{id:'paid',label:'À expédier'},{id:'fulfilled',label:'Expédiées'},{id:'cancelled',label:'Annulées'}].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ background: filter===f.id ? C.navy : C.white, border:`1px solid ${filter===f.id ? C.navy : C.border}`, borderRadius:99, padding:'7px 16px', color: filter===f.id ? C.gold : C.muted, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s' }}>
            {f.label}
          </button>
        ))}
      </div>


      {/* Order list */}
      {loading ? (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:32, textAlign:'center' }}>
          <p style={{ color:C.faint, fontSize:14 }}>Chargement...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:32, textAlign:'center' }}>
          <p style={{ color:C.faint, fontSize:14 }}>Aucune commande.</p>
        </div>
      ) : filtered.map(o => {
        const statusCfg  = STATUS_CONFIG[o.status] ?? { label:o.status, bg:'#F3F4F6', color:C.muted }
        const isExpanded = expanded === o.id
        return (
          <div key={o.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, marginBottom:10, overflow:'hidden' }}>


            {/* Order row */}
            <div style={{ padding:'14px 18px', display:'flex', gap:12, alignItems:'center', cursor:'pointer' }} onClick={() => setExpanded(isExpanded ? null : o.id)}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <p style={{ color:C.navy, fontWeight:700, fontSize:14, margin:0 }}>
                    {o.shipping_name || 'Client'}
                  </p>
                  <span style={{ background:statusCfg.bg, color:statusCfg.color, fontSize:10, fontWeight:700, borderRadius:99, padding:'3px 9px' }}>
                    {statusCfg.label}
                  </span>
                </div>
                <p style={{ color:C.faint, fontSize:12, margin:0 }}>
                  {new Date(o.created_at).toLocaleDateString('fr-CA')} · {o.order_items?.length ?? 0} article(s) · {o.shipping_city}, {o.shipping_province}
                </p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ color:C.navy, fontWeight:800, fontSize:15, margin:'0 0 2px' }}>{o.total_cad.toFixed(2)} CAD</p>
                {o.discount_cad > 0 && <p style={{ color:C.green, fontSize:11, margin:0 }}>-{o.discount_cad.toFixed(2)} CAD économisé</p>}
              </div>
              <span style={{ color:C.faint, fontSize:18 }}>{isExpanded ? '▲' : '▼'}</span>
            </div>


            {/* Expanded */}
            {isExpanded && (
              <div style={{ borderTop:`1px solid ${C.border}`, padding:'16px 18px', background:C.bg }}>


                {/* Items */}
                <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 10px' }}>Articles</p>
                {(o.order_items ?? []).map(item => (
                  <div key={item.id} style={{ display:'flex', gap:10, alignItems:'center', background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                      {item.product_image_url ? <img src={item.product_image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:18 }}>🎁</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ color:C.navy, fontWeight:600, fontSize:13, margin:'0 0 2px' }}>{item.product_name}</p>
                      <p style={{ color:C.faint, fontSize:12, margin:0 }}>Qté : {item.quantity} · {item.unit_price_cad.toFixed(2)} CAD / unité</p>
                    </div>
                    <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:0 }}>{(item.quantity * item.unit_price_cad).toFixed(2)} CAD</p>
                  </div>
                ))}


                {/* Shipping address */}
                <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:14, marginTop:4 }}>
                  <p style={{ color:C.navy, fontWeight:700, fontSize:12, margin:'0 0 4px' }}>Adresse de livraison</p>
                  <p style={{ color:C.muted, fontSize:13, margin:0, lineHeight:1.6 }}>
                    {o.shipping_name}<br />
                    {o.shipping_address}<br />
                    {o.shipping_city}, {o.shipping_province} {o.shipping_postal_code}
                  </p>
                </div>


                {/* Status actions */}
                <div>
                  <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 8px' }}>Mettre à jour le statut</p>
                  <div style={{ display:'flex', gap:8 }}>
                    {o.status === 'paid' && (
                      <button onClick={() => updateStatus(o.id, 'fulfilled')} style={{ background:C.greenBg, border:'1px solid #86EFAC', borderRadius:8, padding:'8px 16px', color:C.green, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        ✓ Marquer comme expédié
                      </button>
                    )}
                    {o.status !== 'cancelled' && (
                      <button onClick={() => updateStatus(o.id, 'cancelled')} style={{ background:C.redBg, border:'1px solid #FCA5A5', borderRadius:8, padding:'8px 16px', color:C.red, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        Annuler la commande
                      </button>
                    )}
                    {o.status === 'cancelled' && (
                      <button onClick={() => updateStatus(o.id, 'paid')} style={{ background:C.goldDim, border:`1px solid ${C.goldBorder}`, borderRadius:8, padding:'8px 16px', color:C.navy, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        Restaurer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
