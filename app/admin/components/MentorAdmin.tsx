'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Mentor = { id: string; name: string; field: string; university: string; bio: string; available: boolean }
const empty = { name:'', field:'', university:'', bio:'', available:true }

export default function MentorsAdmin() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [form, setForm]       = useState(empty)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  const load = async () => {
    const { data } = await supabase.from('mentors').select('*').order('created_at', { ascending: false })
    if (data) setMentors(data)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.field) { setMsg('Nom et domaine requis'); return }
    setLoading(true)
    const { error } = await supabase.from('mentors').insert([form])
    if (error) setMsg(error.message)
    else { setMsg('Mentor ajouté ✓'); setForm(empty); load() }
    setLoading(false)
  }

  const toggle = async (id: string, available: boolean) => {
    await supabase.from('mentors').update({ available: !available }).eq('id', id)
    load()
  }

  const remove = async (id: string) => {
    await supabase.from('mentors').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#0B1F4B', fontSize:24, marginBottom:24 }}>Gérer les mentors</h2>

      {/* Form */}
      <div style={{ background:'#fff', borderRadius:20, padding:28, border:'1.5px solid #E2E8F0', marginBottom:28 }}>
        <h3 style={{ color:'#0B1F4B', fontWeight:700, marginBottom:20 }}>Ajouter un mentor</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          {[
            { key:'name',       label:'Nom complet',   ph:'Dr. Fabiola Jean'       },
            { key:'field',      label:'Domaine',        ph:'Médecine'               },
            { key:'university', label:'Université',     ph:'McGill'                 },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#64748B', marginBottom:6 }}>{f.label}</label>
              <input
                placeholder={f.ph}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#64748B', marginBottom:6 }}>Biographie</label>
          <textarea
            placeholder="Courte bio du mentor..."
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize:'vertical' }}
          />
        </div>
        {msg && <p style={{ color: msg.includes('✓') ? '#22C55E' : '#EF4444', fontSize:13, marginBottom:12 }}>{msg}</p>}
        <button onClick={save} disabled={loading} style={btnStyle}>
          {loading ? 'Sauvegarde...' : '+ Ajouter le mentor'}
        </button>
      </div>

      {/* List */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {mentors.length === 0 && (
          <div style={{ textAlign:'center', padding:40, color:'#94A3B8', background:'#fff', borderRadius:20, border:'1.5px dashed #E2E8F0' }}>
            Aucun mentor pour l'instant. Ajoutez-en un ci-dessus.
          </div>
        )}
        {mentors.map(m => (
          <div key={m.id} style={{ background:'#fff', borderRadius:16, padding:'16px 20px', border:'1.5px solid #E2E8F0', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:'#DBEAFE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🌟</div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, color:'#0B1F4B', fontSize:15 }}>{m.name}</p>
              <p style={{ color:'#2563EB', fontSize:13 }}>{m.field} · {m.university}</p>
            </div>
            <button onClick={() => toggle(m.id, m.available)} style={{ background: m.available ? '#D1FAE5' : '#FEE2E2', color: m.available ? '#059669' : '#DC2626', border:'none', borderRadius:8, padding:'5px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              {m.available ? 'Disponible' : 'Indisponible'}
            </button>
            <button onClick={() => remove(m.id)} style={{ background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:8, padding:'5px 12px', fontSize:13, cursor:'pointer' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { width:'100%', padding:'11px 14px', background:'#F8FAFF', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, fontFamily:'var(--font-jakarta)', outline:'none', color:'#1E293B' }
const btnStyle: React.CSSProperties   = { padding:'12px 24px', background:'#0B1F4B', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font-jakarta)' }

