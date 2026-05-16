'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'


type Mentor = {
  id:            string
  name:          string
  field:         string
  university:    string
  bio:           string
  quote:         string
  avatar_emoji:  string
  available:     boolean
}


type Episode = {
  id:             string
  mentor_id:      string
  episode_number: number
  title:          string
  description:    string
  video_url:      string
  duration_mins:  number
  published:      boolean
}


const emptyMentor = { name:'', field:'', university:'', bio:'', quote:'', avatar_emoji:'🌟', available:true }
const emptyEpisode = { title:'', description:'', video_url:'', duration_mins:4, episode_number:1, published:true }


const EMOJI_OPTIONS = ['👨‍⚕️','👩‍⚕️','👨‍💻','👩‍💻','👨‍🏫','👩‍🏫','👨‍🔬','👩‍🔬','👨‍🎨','👩‍🎨','👨‍🍳','👩‍🍳','👨‍⚖️','👩‍⚖️','👨‍🚀','👩‍🚀','👨‍🎓','👩‍🎓','👷','💼','⚖️','🎬','🎤','🎯','📊','🌟']


const C = {
  navy:'#0B1F4B', gold:'#FBBF24', bg:'#F4F7FF', white:'#FFFFFF',
  border:'#E2E8F0', text:'#0F172A', muted:'#64748B', faint:'#94A3B8',
  green:'#16A34A', greenBg:'#DCFCE7', red:'#EF4444', redBg:'#FEE2E2',
  blue:'#3B52D4', blueBg:'#DBEAFE',
}


export default function MentorsAdmin() {
  const [mentors,        setMentors]        = useState<Mentor[]>([])
  const [episodes,       setEpisodes]       = useState<Record<string, Episode[]>>({})
  const [form,           setForm]           = useState(emptyMentor)
  const [expandedId,     setExpandedId]     = useState<string | null>(null)
  const [editForm,       setEditForm]       = useState<Partial<Mentor> | null>(null)
  const [editingId,      setEditingId]      = useState<string | null>(null)
  const [epForm,         setEpForm]         = useState(emptyEpisode)
  const [epEditId,       setEpEditId]       = useState<string | null>(null)
  const [loading,        setLoading]        = useState(false)
  const [toast,          setToast]          = useState('')


  useEffect(() => { load() }, [])


  async function load() {
    const { data: m } = await supabase.from('mentors').select('*').order('created_at', { ascending: false })
    if (m) setMentors(m)


    // Load all episodes
    const { data: e } = await supabase.from('mentor_episodes').select('*').order('episode_number', { ascending: true })
    if (e) {
      const grouped: Record<string, Episode[]> = {}
      for (const ep of e) {
        if (!grouped[ep.mentor_id]) grouped[ep.mentor_id] = []
        grouped[ep.mentor_id].push(ep)
      }
      setEpisodes(grouped)
    }
  }


  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }


  async function saveMentor() {
    if (!form.name || !form.field) { showToast('Nom et domaine requis'); return }
    setLoading(true)
    const { error } = await supabase.from('mentors').insert([form])
    if (error) showToast(error.message)
    else { showToast('Mentor ajouté ✓'); setForm(emptyMentor); await load() }
    setLoading(false)
  }


  function startEdit(m: Mentor) {
    setEditingId(m.id)
    setEditForm({ name: m.name, field: m.field, university: m.university, bio: m.bio, quote: m.quote, avatar_emoji: m.avatar_emoji })
  }


  async function saveEdit() {
    if (!editingId || !editForm) return
    setLoading(true)
    const { error } = await supabase.from('mentors').update(editForm).eq('id', editingId)
    if (error) showToast(error.message)
    else { showToast('Mentor mis à jour ✓'); setEditingId(null); setEditForm(null); await load() }
    setLoading(false)
  }


  async function toggleAvailable(id: string, current: boolean) {
    await supabase.from('mentors').update({ available: !current }).eq('id', id)
    await load()
  }


  async function deleteMentor(id: string) {
    if (!confirm('Supprimer ce mentor et tous ses épisodes?')) return
    await supabase.from('mentor_episodes').delete().eq('mentor_id', id)
    await supabase.from('mentors').delete().eq('id', id)
    showToast('Mentor supprimé')
    await load()
  }


  // ─ Episode functions ────────────────────────────────────────
  async function saveEpisode(mentorId: string) {
    if (!epForm.title || !epForm.video_url) { showToast('Titre et URL vidéo requis'); return }
    if (!epForm.video_url.includes('player.vimeo.com')) {
      showToast('URL doit être une URL Vimeo Player (player.vimeo.com/video/...)'); return
    }
    setLoading(true)
    if (epEditId) {
      const { error } = await supabase.from('mentor_episodes').update(epForm).eq('id', epEditId)
      if (error) showToast(error.message)
      else { showToast('Épisode mis à jour ✓'); setEpForm(emptyEpisode); setEpEditId(null); await load() }
    } else {
      const { error } = await supabase.from('mentor_episodes').insert([{ ...epForm, mentor_id: mentorId }])
      if (error) showToast(error.message)
      else { showToast('Épisode ajouté ✓'); setEpForm(emptyEpisode); await load() }
    }
    setLoading(false)
  }


  function startEditEpisode(ep: Episode) {
    setEpEditId(ep.id)
    setEpForm({ title: ep.title, description: ep.description, video_url: ep.video_url, duration_mins: ep.duration_mins, episode_number: ep.episode_number, published: ep.published })
  }


  async function deleteEpisode(id: string) {
    if (!confirm('Supprimer cet épisode?')) return
    await supabase.from('mentor_episodes').delete().eq('id', id)
    showToast('Épisode supprimé')
    await load()
  }


  async function toggleEpPublished(ep: Episode) {
    await supabase.from('mentor_episodes').update({ published: !ep.published }).eq('id', ep.id)
    await load()
  }


  return (
    <div style={{ fontFamily:'var(--font-jakarta)' }}>


      {toast && (
        <div style={{ background: toast.includes('✓') ? C.greenBg : C.redBg, border:`1px solid ${toast.includes('✓') ? '#86EFAC' : '#FCA5A5'}`, borderRadius:10, padding:'10px 16px', marginBottom:16 }}>
          <p style={{ color: toast.includes('✓') ? C.green : C.red, fontWeight:700, fontSize:13, margin:0 }}>{toast}</p>
        </div>
      )}


      <h2 style={{ color:C.navy, fontFamily:'var(--font-fredoka)', fontSize:24, margin:'0 0 4px' }}>Mentors</h2>
      <p style={{ color:C.faint, fontSize:13, margin:'0 0 24px' }}>{mentors.length} mentor{mentors.length > 1 ? 's' : ''} · {Object.values(episodes).flat().length} épisode{Object.values(episodes).flat().length > 1 ? 's' : ''}</p>


      {/* Add new mentor */}
      <div style={{ background:C.white, borderRadius:20, padding:24, border:`1.5px solid ${C.border}`, marginBottom:24 }}>
        <h3 style={{ color:C.navy, fontFamily:'var(--font-fredoka)', fontSize:18, margin:'0 0 18px' }}>+ Ajouter un mentor</h3>


        {/* Avatar */}
        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Avatar</label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setForm(p => ({ ...p, avatar_emoji: e }))} style={{
                width:40, height:40, borderRadius:10, border:`2px solid ${form.avatar_emoji === e ? C.navy : C.border}`,
                background: form.avatar_emoji === e ? C.blueBg : C.white,
                fontSize:20, cursor:'pointer', transition:'all .15s',
              }}>{e}</button>
            ))}
          </div>
        </div>


        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
          <div>
            <label style={labelStyle}>Nom complet</label>
            <input placeholder="Dr. Fabiola Jean" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Domaine</label>
            <input placeholder="Médecine d'urgence" value={form.field} onChange={e => setForm(p => ({ ...p, field: e.target.value }))} style={inputStyle} />
          </div>
        </div>


        <div style={{ marginBottom:12 }}>
          <label style={labelStyle}>Université</label>
          <input placeholder="McGill" value={form.university} onChange={e => setForm(p => ({ ...p, university: e.target.value }))} style={inputStyle} />
        </div>


        <div style={{ marginBottom:12 }}>
          <label style={labelStyle}>Citation (apparaît sur la page du mentor)</label>
          <input placeholder="J\'aide des gens en situation critique chaque jour."value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))} style={inputStyle} />
        </div>


        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Biographie</label>
          <textarea placeholder="Courte présentation du mentor — 2-3 phrases sur leur parcours..." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} style={{ ...inputStyle, resize:'vertical' as const }} />
        </div>


        <button onClick={saveMentor} disabled={loading} style={btnStyle}>
          {loading ? 'Sauvegarde...' : '+ Ajouter le mentor'}
        </button>
      </div>


      {/* Mentors list */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {mentors.length === 0 ? (
          <div style={{ background:C.white, borderRadius:16, padding:32, border:`1.5px dashed ${C.border}`, textAlign:'center' }}>
            <p style={{ color:C.faint, fontSize:14 }}>Aucun mentor pour l'instant.</p>
          </div>
        ) : mentors.map(m => {
          const mentorEpisodes = episodes[m.id] || []
          const isExpanded     = expandedId === m.id
          const isEditing      = editingId === m.id


          return (
            <div key={m.id} style={{ background:C.white, borderRadius:16, border:`1.5px solid ${C.border}`, overflow:'hidden' }}>


              {/* Row */}
              <div style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:C.blueBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                  {m.avatar_emoji || '🌟'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, color:C.navy, fontSize:15, margin:'0 0 3px' }}>{m.name}</p>
                  <p style={{ color:C.blue, fontSize:12, margin:0 }}>{m.field}{m.university ? ` · ${m.university}` : ''} · {mentorEpisodes.length} épisode{mentorEpisodes.length > 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setExpandedId(isExpanded ? null : m.id)} style={{ background:C.bg, color:C.navy, border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  {isExpanded ? 'Fermer' : 'Gérer'}
                </button>
                <button onClick={() => toggleAvailable(m.id, m.available)} style={{ background: m.available ? C.greenBg : '#F3F4F6', color: m.available ? C.green : C.faint, border:'none', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  {m.available ? '✓ Actif' : 'Inactif'}
                </button>
                <button onClick={() => deleteMentor(m.id)} style={{ background:C.redBg, color:C.red, border:'none', borderRadius:8, padding:'6px 10px', fontSize:13, cursor:'pointer' }}>✕</button>
              </div>


              {/* Expanded section */}
              {isExpanded && (
                <div style={{ borderTop:`1px solid ${C.border}`, padding:'18px', background:C.bg }}>


                  {/* Edit mentor */}
                  {isEditing && editForm ? (
                    <div style={{ background:C.white, borderRadius:14, padding:18, marginBottom:16 }}>
                      <h4 style={{ color:C.navy, fontWeight:700, fontSize:14, margin:'0 0 14px' }}>Modifier le mentor</h4>


                      <div style={{ marginBottom:12 }}>
                        <label style={labelStyle}>Avatar</label>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          {EMOJI_OPTIONS.map(e => (
                            <button key={e} onClick={() => setEditForm(p => ({ ...p!, avatar_emoji: e }))} style={{
                              width:36, height:36, borderRadius:9, border:`2px solid ${editForm.avatar_emoji === e ? C.navy : C.border}`,
                              background: editForm.avatar_emoji === e ? C.blueBg : C.white,
                              fontSize:18, cursor:'pointer',
                            }}>{e}</button>
                          ))}
                        </div>
                      </div>


                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                        <input placeholder="Nom" value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p!, name: e.target.value }))} style={inputStyle} />
                        <input placeholder="Domaine" value={editForm.field || ''} onChange={e => setEditForm(p => ({ ...p!, field: e.target.value }))} style={inputStyle} />
                      </div>
                      <input placeholder="Université" value={editForm.university || ''} onChange={e => setEditForm(p => ({ ...p!, university: e.target.value }))} style={{ ...inputStyle, marginBottom:10 }} />
                      <input placeholder="Citation" value={editForm.quote || ''} onChange={e => setEditForm(p => ({ ...p!, quote: e.target.value }))} style={{ ...inputStyle, marginBottom:10 }} />
                      <textarea placeholder="Biographie" value={editForm.bio || ''} onChange={e => setEditForm(p => ({ ...p!, bio: e.target.value }))} rows={3} style={{ ...inputStyle, resize:'vertical' as const, marginBottom:12 }} />


                      <div style={{ display:'flex', gap:10 }}>
                        <button onClick={saveEdit} disabled={loading} style={btnStyle}>Enregistrer</button>
                        <button onClick={() => { setEditingId(null); setEditForm(null) }} style={{ ...btnStyle, background:C.bg, color:C.muted, border:`1px solid ${C.border}` }}>Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background:C.white, borderRadius:14, padding:18, marginBottom:16 }}>
                      {m.quote && <p style={{ color:C.text, fontSize:14, lineHeight:1.6, fontStyle:'italic', margin:'0 0 10px' }}>"{m.quote}"</p>}
                      {m.bio   && <p style={{ color:C.muted, fontSize:13, lineHeight:1.6, margin:'0 0 12px' }}>{m.bio}</p>}
                      <button onClick={() => startEdit(m)} style={{ background:C.blueBg, color:C.blue, border:'none', borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        ✎ Modifier le profil
                      </button>
                    </div>
                  )}


                  {/* Episodes section */}
                  <h4 style={{ color:C.navy, fontWeight:700, fontSize:14, margin:'0 0 12px' }}>Épisodes ({mentorEpisodes.length})</h4>


                  {/* Existing episodes */}
                  {mentorEpisodes.length > 0 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                      {mentorEpisodes.map(ep => (
                        <div key={ep.id} style={{ background:C.white, borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, border:`1px solid ${C.border}` }}>
                          <div style={{ width:32, height:32, borderRadius:8, background:C.blueBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <span style={{ color:C.blue, fontWeight:800, fontSize:12 }}>#{ep.episode_number}</span>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontWeight:700, color:C.navy, fontSize:13, margin:'0 0 2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ep.title}</p>
                            <p style={{ color:C.faint, fontSize:11, margin:0 }}>{ep.duration_mins} min · {ep.published ? '🟢 Publié' : '⚫ Brouillon'}</p>
                          </div>
                          <button onClick={() => toggleEpPublished(ep)} style={{ background:C.bg, color:C.navy, border:`1px solid ${C.border}`, borderRadius:6, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>
                            {ep.published ? 'Dépublier' : 'Publier'}
                          </button>
                          <button onClick={() => startEditEpisode(ep)} style={{ background:C.blueBg, color:C.blue, border:'none', borderRadius:6, padding:'5px 10px', fontSize:11, cursor:'pointer' }}>✎</button>
                          <button onClick={() => deleteEpisode(ep.id)} style={{ background:C.redBg, color:C.red, border:'none', borderRadius:6, padding:'5px 9px', fontSize:11, cursor:'pointer' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}


                  {/* Add episode form */}
                  <div style={{ background:C.white, borderRadius:14, padding:16, border:`1.5px dashed ${C.border}` }}>
                    <h5 style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 12px' }}>
                      {epEditId ? 'Modifier l\'épisode' : '+ Nouvel épisode'}
                    </h5>


                    <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 100px', gap:8, marginBottom:10 }}>
                      <input type="number" min={1} placeholder="N°" value={epForm.episode_number} onChange={e => setEpForm(p => ({ ...p, episode_number: parseInt(e.target.value) || 1 }))} style={inputStyle} />
                      <input placeholder="Titre de l'épisode" value={epForm.title} onChange={e => setEpForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
                      <input type="number" min={1} placeholder="Min" value={epForm.duration_mins} onChange={e => setEpForm(p => ({ ...p, duration_mins: parseInt(e.target.value) || 4 }))} style={inputStyle} />
                    </div>


                    <div style={{ marginBottom:10 }}>
                      <label style={{ ...labelStyle, fontSize:10 }}>URL Player Vimeo</label>
                      <input placeholder="https://player.vimeo.com/video/123456789" value={epForm.video_url} onChange={e => setEpForm(p => ({ ...p, video_url: e.target.value }))} style={inputStyle} />
                      <p style={{ color:C.faint, fontSize:11, margin:'4px 0 0' }}>
                        Sur Vimeo → ⋯ → Partager → Lien intégré → copiez l'URL "player"
                      </p>
                    </div>


                    <textarea placeholder="Description (optionnel) — qu'est-ce que les enfants apprendront?" value={epForm.description} onChange={e => setEpForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize:'vertical' as const, marginBottom:12 }} />


                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => saveEpisode(m.id)} disabled={loading} style={{ ...btnStyle, padding:'10px 18px', fontSize:13 }}>
                        {loading ? 'Sauvegarde...' : epEditId ? 'Enregistrer' : '+ Ajouter l\'épisode'}
                      </button>
                      {epEditId && (
                        <button onClick={() => { setEpEditId(null); setEpForm(emptyEpisode) }} style={{ ...btnStyle, background:C.bg, color:C.muted, border:`1px solid ${C.border}`, padding:'10px 18px', fontSize:13 }}>
                          Annuler
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
    </div>
  )
}


const inputStyle: React.CSSProperties = {
  width:'100%', padding:'10px 12px',
  background:'#F8FAFF', border:'1.5px solid #E2E8F0',
  borderRadius:10, fontSize:13, fontFamily:'var(--font-jakarta)',
  outline:'none', color:'#1E293B', boxSizing:'border-box' as const,
}
const labelStyle: React.CSSProperties = {
  display:'block', fontSize:11, fontWeight:700, color:'#64748B',
  marginBottom:6, textTransform:'uppercase' as const, letterSpacing:'.5px',
}
const btnStyle: React.CSSProperties = {
  padding:'11px 22px', background:'#0B1F4B', color:'#FBBF24',
  border:'none', borderRadius:10, fontWeight:700, fontSize:13,
  cursor:'pointer', fontFamily:'var(--font-jakarta)',
}
