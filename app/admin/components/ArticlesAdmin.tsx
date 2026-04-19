'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Article = { id: string; title: string; subject: string; hero_name: string; grade_min: number; grade_max: number; published: boolean }
const empty = { title:'', content:'', subject:'', hero:'🦸', hero_name:'', grade_min:3, grade_max:6, language:'fr', question:'', published:false }
const subjects = ['Finances personnelles','Sciences','Histoire','Français','Mathématiques','Santé mentale','Citoyenneté','Entrepreneuriat','Nutrition','Droit & Sécurité']

export default function ArticlesAdmin() {
  const [articles, setArticles] = useState<Article[]>([])
  const [form, setForm]         = useState(empty)
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  const load = async () => {
    const { data } = await supabase.from('news_articles').select('id,title,subject,hero_name,grade_min,grade_max,published').order('created_at', { ascending: false })
    if (data) setArticles(data)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title || !form.content || !form.subject) { setMsg('Titre, contenu et sujet requis'); return }
    setLoading(true)
    const { error } = await supabase.from('news_articles').insert([form])
    if (error) setMsg(error.message)
    else { setMsg('Article ajouté ✓'); setForm(empty); load() }
    setLoading(false)
  }

  const togglePublish = async (id: string, published: boolean) => {
    await supabase.from('news_articles').update({ published: !published }).eq('id', id)
    load()
  }

  const remove = async (id: string) => {
    await supabase.from('news_articles').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#0B1F4B', fontSize:24, marginBottom:24 }}>Gérer les articles</h2>

      {/* Form */}
      <div style={{ background:'#fff', borderRadius:20, padding:28, border:'1.5px solid #E2E8F0', marginBottom:28 }}>
        <h3 style={{ color:'#0B1F4B', fontWeight:700, marginBottom:20 }}>Écrire un article</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <div style={{ gridColumn:'1 / -1' }}>
            <label style={labelStyle}>Titre</label>
            <input placeholder="Pourquoi épargner dès maintenant?" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Sujet</label>
            <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={inputStyle}>
              <option value="">Choisir un sujet</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Nom du héros</label>
            <input placeholder="Volta" value={form.hero_name} onChange={e => setForm(p => ({ ...p, hero_name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Niveau min</label>
            <input type="number" min={1} max={6} value={form.grade_min} onChange={e => setForm(p => ({ ...p, grade_min: +e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Niveau max</label>
            <input type="number" min={1} max={6} value={form.grade_max} onChange={e => setForm(p => ({ ...p, grade_max: +e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ gridColumn:'1 / -1' }}>
            <label style={labelStyle}>Contenu (voix du héros)</label>
            <textarea placeholder="Salut! Moi c'est Volta et aujourd'hui je t'explique..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6} style={{ ...inputStyle, resize:'vertical' }} />
          </div>
          <div style={{ gridColumn:'1 / -1' }}>
            <label style={labelStyle}>Question de compréhension</label>
            <input placeholder="Si tu épargnes 5$ par semaine, combien as-tu en 1 an?" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} style={inputStyle} />
          </div>
        </div>
        {msg && <p style={{ color: msg.includes('✓') ? '#22C55E' : '#EF4444', fontSize:13, marginBottom:12 }}>{msg}</p>}
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button onClick={save} disabled={loading} style={btnStyle}>{loading ? 'Sauvegarde...' : '+ Publier l\'article'}</button>
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#64748B', cursor:'pointer' }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
            Publier immédiatement
          </label>
        </div>
      </div>

      {/* List */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {articles.length === 0 && (
          <div style={{ textAlign:'center', padding:40, color:'#94A3B8', background:'#fff', borderRadius:20, border:'1.5px dashed #E2E8F0' }}>
            Aucun article pour l'instant.
          </div>
        )}
        {articles.map(a => (
          <div key={a.id} style={{ background:'#fff', borderRadius:14, padding:'14px 18px', border:'1.5px solid #E2E8F0', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, color:'#0B1F4B', fontSize:14 }}>{a.title}</p>
              <p style={{ color:'#64748B', fontSize:12 }}>{a.subject} · {a.hero_name} · Niveaux {a.grade_min}–{a.grade_max}</p>
            </div>
            <button onClick={() => togglePublish(a.id, a.published)} style={{ background: a.published ? '#D1FAE5' : '#FEF3C7', color: a.published ? '#059669' : '#D97706', border:'none', borderRadius:8, padding:'4px 12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              {a.published ? 'Publié' : 'Brouillon'}
            </button>
            <button onClick={() => remove(a.id)} style={{ background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:8, padding:'4px 10px', fontSize:13, cursor:'pointer' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'#64748B', marginBottom:6 }
const inputStyle: React.CSSProperties = { width:'100%', padding:'11px 14px', background:'#F8FAFF', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, fontFamily:'var(--font-jakarta)', outline:'none', color:'#1E293B' }
const btnStyle: React.CSSProperties   = { padding:'12px 24px', background:'#0B1F4B', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font-jakarta)' }

