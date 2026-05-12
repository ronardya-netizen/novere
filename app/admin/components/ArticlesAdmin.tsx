'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'


const C = {
  navy:'#0B1F4B', gold:'#FBBF24',
  bg:'#F4F7FF', white:'#FFFFFF', border:'#E2E8F0',
  text:'#0F172A', muted:'#64748B', faint:'#94A3B8',
  green:'#16A34A', greenBg:'#DCFCE7',
  red:'#EF4444', redBg:'#FEE2E2',
}


const SUBJECTS = [
  'Finances personnelles', 'Santé mentale', 'Nutrition', 'Citoyenneté',
  'Entrepreneuriat', 'Droit & Sécurité', 'Relations sociales',
  'Environnement', 'Technologie & IA', 'Identité & Culture',
]


type Article = {
  id: string; title: string; content: string; subject: string
  grade_min: number; grade_max: number; read_time: number
  question: string; published: boolean
}


const EMPTY = {
  title: '', content: '', subject: 'Finances personnelles',
  grade_min: 3, grade_max: 11, read_time: 3,
  question: '', published: false,
}


export default function ArticlesAdmin() {
  const [articles, setArticles] = useState<Article[]>([])
  const [form,     setForm]     = useState(EMPTY)
  const [editing,  setEditing]  = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [toast,    setToast]    = useState('')


  useEffect(() => { load() }, [])


  async function load() {
    const { data } = await supabase.from('news_articles').select('*').order('created_at', { ascending: false })
    setArticles(data ?? [])
  }


  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }


  function startEdit(a: Article) {
    setForm({ title: a.title, content: a.content, subject: a.subject, grade_min: a.grade_min, grade_max: a.grade_max, read_time: a.read_time || 3, question: a.question || '', published: a.published })
    setEditing(a.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  function resetForm() { setForm(EMPTY); setEditing(null); setShowForm(false) }


  async function save() {
    if (!form.title || !form.content) { showToast('Titre et contenu sont requis.'); return }
    setLoading(true)
    if (editing) {
      await supabase.from('news_articles').update(form).eq('id', editing)
      showToast('Article mis à jour.')
    } else {
      await supabase.from('news_articles').insert(form)
      showToast('Article ajouté.')
    }
    await load(); resetForm(); setLoading(false)
  }


  async function togglePublished(a: Article) {
    await supabase.from('news_articles').update({ published: !a.published }).eq('id', a.id)
    await load()
  }


  async function deleteArticle(id: string) {
    if (!confirm('Supprimer cet article?')) return
    await supabase.from('news_articles').delete().eq('id', id)
    await load(); showToast('Article supprimé.')
  }


  const inputStyle: React.CSSProperties = {
    width: '100%', background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: '10px 12px', color: C.text,
    fontSize: 13, fontFamily: 'var(--font-jakarta)', outline: 'none',
    boxSizing: 'border-box' as const,
  }
  const labelStyle: React.CSSProperties = {
    color: C.faint, fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase' as const, letterSpacing: '.5px', margin: '0 0 6px',
    display: 'block',
  }


  return (
    <div style={{ fontFamily: 'var(--font-jakarta)' }}>


      {toast && (
        <div style={{ background: C.greenBg, border: '1px solid #86EFAC', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
          <p style={{ color: C.green, fontWeight: 700, fontSize: 13, margin: 0 }}>{toast}</p>
        </div>
      )}


      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ color: C.navy, fontFamily: 'var(--font-fredoka)', fontSize: 24, margin: '0 0 4px' }}>Articles</h2>
          <p style={{ color: C.faint, fontSize: 13, margin: 0 }}>{articles.length} articles · {articles.filter(a => a.published).length} publiés</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} style={{ background: C.navy, border: 'none', borderRadius: 12, padding: '10px 20px', color: C.gold, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
          + Ajouter un article
        </button>
      </div>


      {/* Form */}
      {showForm && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, marginBottom: 28 }}>
          <h3 style={{ color: C.navy, fontFamily: 'var(--font-fredoka)', fontSize: 18, margin: '0 0 20px' }}>
            {editing ? 'Modifier l\'article' : 'Nouvel article'}
          </h3>


          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>


            {/* Title */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Titre</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre de l'article" style={inputStyle} />
            </div>


            {/* Subject */}
            <div>
              <label style={labelStyle}>Sujet</label>
              <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inputStyle}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>


            {/* Read time */}
            <div>
              <label style={labelStyle}>Temps de lecture (min)</label>
              <input type="number" min={1} max={15} value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: parseInt(e.target.value) || 3 }))} style={inputStyle} />
            </div>


            {/* Age range */}
            <div>
              <label style={labelStyle}>Année scolaire min</label>
              <select value={form.grade_min} onChange={e => setForm(f => ({ ...f, grade_min: parseInt(e.target.value) }))} style={inputStyle}>
                {[3,4,5,6,7,8,9,10,11].map(g => <option key={g} value={g}>{g <= 6 ? `${g}e primaire` : `Sec. ${g - 6}`}</option>)}
              </select>
            </div>


            <div>
              <label style={labelStyle}>Année scolaire max</label>
              <select value={form.grade_max} onChange={e => setForm(f => ({ ...f, grade_max: parseInt(e.target.value) }))} style={inputStyle}>
                {[3,4,5,6,7,8,9,10,11].map(g => <option key={g} value={g}>{g <= 6 ? `${g}e primaire` : `Sec. ${g - 6}`}</option>)}
              </select>
            </div>


            {/* Content */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Contenu</label>
              <p style={{ color: C.faint, fontSize: 11, margin: '0 0 6px' }}>Sépare les paragraphes par une ligne vide.</p>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Écris le contenu de l'article ici..." rows={8} style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>


            {/* Quiz question */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Question du quiz</label>
              <p style={{ color: C.faint, fontSize: 11, margin: '0 0 6px' }}>
                Format: <strong>Question|Bonne réponse</strong> — ex: "C'est quoi un budget?|Un plan pour gérer ton argent."
              </p>
              <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Question|Bonne réponse" style={inputStyle} />
            </div>


            {/* Published toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div onClick={() => setForm(f => ({ ...f, published: !f.published }))} style={{ width: 44, height: 24, borderRadius: 99, background: form.published ? C.navy : C.border, position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.white, position: 'absolute', top: 3, left: form.published ? 23 : 3, transition: 'left .2s' }} />
              </div>
              <span style={{ color: C.navy, fontSize: 13, fontWeight: 600 }}>Publié</span>
            </div>
          </div>


          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={save} disabled={loading} style={{ background: C.navy, border: 'none', borderRadius: 12, padding: '11px 24px', color: C.gold, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
              {loading ? 'Sauvegarde...' : editing ? 'Mettre à jour' : 'Ajouter l\'article'}
            </button>
            <button onClick={resetForm} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 24px', color: C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
              Annuler
            </button>
          </div>
        </div>
      )}


      {/* Article list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {articles.length === 0 ? (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <p style={{ color: C.faint, fontSize: 14 }}>Aucun article. Cliquez sur "Ajouter un article" pour commencer.</p>
          </div>
        ) : articles.map(a => (
          <div key={a.id} style={{ background: C.white, border: `1px solid ${a.published ? C.border : '#E5E7EB'}`, borderRadius: 16, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center', opacity: a.published ? 1 : 0.6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ color: C.navy, fontWeight: 700, fontSize: 14, margin: 0 }}>{a.title}</p>
                {!a.published && <span style={{ background: '#F3F4F6', color: C.faint, fontSize: 9, fontWeight: 700, borderRadius: 6, padding: '2px 7px' }}>BROUILLON</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: C.muted, fontSize: 12 }}>{a.subject}</span>
                <span style={{ color: C.faint, fontSize: 12 }}>⏱ {a.read_time || 3} min</span>
                <span style={{ color: C.faint, fontSize: 12 }}>
                  Ans: {(a.grade_min || 3) + 6}–{(a.grade_max || 11) + 6}
                </span>
                <span style={{ color: a.question ? C.green : C.faint, fontSize: 12 }}>
                  {a.question ? '✓ Quiz' : '— Pas de quiz'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => startEdit(a)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 14px', color: C.navy, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Modifier</button>
              <button onClick={() => togglePublished(a)} style={{ background: a.published ? '#FEF3C7' : C.greenBg, border: `1px solid ${a.published ? '#FDE68A' : '#86EFAC'}`, borderRadius: 8, padding: '6px 14px', color: a.published ? '#92400E' : C.green, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {a.published ? 'Dépublier' : 'Publier'}
              </button>
              <button onClick={() => deleteArticle(a.id)} style={{ background: C.redBg, border: '1px solid #FCA5A5', borderRadius: 8, padding: '6px 14px', color: C.red, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
