'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Mentor  = { id: string; name: string }
type Child   = { id: string; name: string }
type Session = { id: string; scheduled_at: string; status: string; mentors: { name: string }; children: { name: string } }

export default function SessionsAdmin() {
  const [mentors, setMentors]   = useState<Mentor[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [form, setForm]         = useState({ mentor_id:'', child_id:'', scheduled_at:'', duration_mins:20 })
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  const load = async () => {
    const [m, c, s] = await Promise.all([
      supabase.from('mentors').select('id,name'),
      supabase.from('children').select('id,name'),
      supabase.from('mentor_sessions').select('id,scheduled_at,status,mentors(name),children(name)').order('scheduled_at', { ascending: false }),
    ])
    if (m.data) setMentors(m.data)
    if (c.data) setChildren(c.data)
    if (s.data) setSessions(s.data)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.mentor_id || !form.child_id || !form.scheduled_at) { setMsg('Tous les champs sont requis'); return }
    setLoading(true)
    const { error } = await supabase.from('mentor_sessions').insert([form])
    if (error) setMsg(error.message)
    else { setMsg('Session créée ✓'); setForm({ mentor_id:'', child_id:'', scheduled_at:'', duration_mins:20 }); load() }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('mentor_sessions').update({ status }).eq('id', id)
    load()
  }

  return (
    <div>
      <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#0B1F4B', fontSize:24, marginBottom:24 }}>Gérer les sessions</h2>
      <div style={{ background:'#fff', borderRadius:20, padding:28, border:'1.5px solid #E2E8F0', marginBottom:28 }}>
        <h3 style={{ color:'#0B1F4B', fontWeight:700, marginBottom:20 }}>Planifier une session</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <div>
            <label style={labelStyle}>Mentor</label>
            <select value={form.mentor_id} onChange={e => setForm(p => ({ ...p, mentor_id: e.target.value }))} style={inputStyle}>
              <option value="">Choisir un mentor</option>
              {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Enfant</label>
            <select value={form.child_id} onChange={e => setForm(p => ({ ...p, child_id: e.target.value }))} style={inputStyle}>
              <option value="">Choisir un enfant</option>
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date et heure</label>
            <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Durée (minutes)</label>
            <input type="number" value={form.duration_mins} onChange={e => setForm(p => ({ ...p, duration_mins: +e.target.value }))} style={inputStyle} />
          </div>
        </div>
        {msg && <p style={{ color: msg.includes('✓') ? '#22C55E' : '#EF4444', fontSize:13, marginBottom:12 }}>{msg}</p>}
        <button onClick={save} disabled={loading} style={btnStyle}>{loading ? 'Sauvegarde...' : '+ Planifier la session'}</button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {sessions.length === 0 && (
          <div style={{ textAlign:'center', padding:40, color:'#94A3B8', background:'#fff', borderRadius:20, border:'1.5px dashed #E2E8F0' }}>
            Aucune session planifiée.
          </div>
        )}
        {sessions.map((s: any) => (
          <div key={s.id} style={{ background:'#fff', borderRadius:14, padding:'14px 18px', border:'1.5px solid #E2E8F0', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, color:'#0B1F4B', fontSize:14 }}>{s.mentors?.name} → {s.children?.name}</p>
              <p style={{ color:'#64748B', fontSize:12 }}>{new Date(s.scheduled_at).toLocaleString('fr-CA')}</p>
            </div>
            <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)} style={{ background: s.status === 'upcoming' ? '#DBEAFE' : s.status === 'completed' ? '#D1FAE5' : '#FEE2E2', color: s.status === 'upcoming' ? '#2563EB' : s.status === 'completed' ? '#059669' : '#DC2626', border:'none', borderRadius:8, padding:'5px 10px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              <option value="upcoming">À venir</option>
              <option value="completed">Complétée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'#64748B', marginBottom:6 }
const inputStyle: React.CSSProperties = { width:'100%', padding:'11px 14px', background:'#F8FAFF', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, fontFamily:'var(--font-jakarta)', outline:'none', color:'#1E293B' }
const btnStyle: React.CSSProperties   = { padding:'12px 24px', background:'#0B1F4B', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font-jakarta)' }

