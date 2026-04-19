'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Gift = { id: string; name: string; points_required: number; emoji: string; stock: number; active: boolean }
const empty = { name:'', points_required:500, emoji:'🎁', stock:10, active:true }

export default function GiftsAdmin() {
  const [gifts, setGifts]   = useState<Gift[]>([])
  const [form, setForm]     = useState(empty)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')

  const load = async () => {
    const { data } = await supabase.from('gifts').select('*').order('points_required')
    if (data) setGifts(data)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name) { setMsg('Nom requis'); return }
    setLoading(true)
    const { error } = await supabase.from('gifts').insert([form])
    if (error) setMsg(error.message)
    else { setMsg('Cadeau ajouté ✓'); setForm(empty); load() }
    setLoading(false)
  }

  const toggle = async (id: string, active: boolean) => {
    await supabase.from('gifts').update({ active: !active }).eq('id', id)
    load()
  }

  const remove = async (id: string) => {
    await supabase.from('gifts').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#0B1F4B', fontSize:24, marginBottom:24 }}>Gérer les cadeaux</h2>
      <div style={{ background:'#fff', borderRadius:20, padding:28, border:'1.5px solid #E2E8F0', marginBottom:28 }}>
        <h3 style={{ color:'#0B1F4B', fontWeight:700, marginBottom:20 }}>Ajouter un cadeau</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          {[
            { key:'name',            label:'Nom du cadeau',  ph:'Livre-aventure', type:'text'   },
            { key:'emoji',           label:'Emoji',          ph:'📚',             type:'text'   },
            { key:'points_required', label:'Points requis',  ph:'400',            type:'number' },
            { key:'stock',           label:'Stock',          ph:'10',             type:'number' },
          ].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type={f.type} placeholder={f.ph}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        {msg && <p style={{ color: msg.includes('✓') ? '#22C55E' : '#EF4444', fontSize:13, marginBottom:12 }}>{msg}</p>}
        <button onClick={save} disabled={loading} style={btnStyle}>{loading ? 'Sauvegarde...' : '+ Ajouter le cadeau'}</button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {gifts.length === 0 && (
          <div style={{ textAlign:'center', padding:40, color:'#94A3B8', background:'#fff', borderRadius:20, border:'1.5px dashed #E2E8F0' }}>
            Aucun cadeau pour l'instant.
          </div>
        )}
        {gifts.map(g => (
          <div key={g.id} style={{ background:'#fff', borderRadius:14, padding:'14px 18px', border:'1.5px solid #E2E8F0', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:28 }}>{g.emoji}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, color:'#0B1F4B', fontSize:14 }}>{g.name}</p>
              <p style={{ color:'#64748B', fontSize:12 }}>{g.points_required} pts · Stock: {g.stock}</p>
            </div>
            <button onClick={() => toggle(g.id, g.active)} style={{ background: g.active ? '#D1FAE5' : '#FEE2E2', color: g.active ? '#059669' : '#DC2626', border:'none', borderRadius:8, padding:'4px 12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              {g.active ? 'Actif' : 'Inactif'}
            </button>
            <button onClick={() => remove(g.id)} style={{ background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:8, padding:'4px 10px', fontSize:13, cursor:'pointer' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'#64748B', marginBottom:6 }
const inputStyle: React.CSSProperties = { width:'100%', padding:'11px 14px', background:'#F8FAFF', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, fontFamily:'var(--font-jakarta)', outline:'none', color:'#1E293B' }
const btnStyle: React.CSSProperties   = { padding:'12px 24px', background:'#0B1F4B', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font-jakarta)' }

