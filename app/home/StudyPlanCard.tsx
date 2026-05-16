'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'


type TodayPlan = {
  subject: string
  chapter: string | null
  level:   'debutant' | 'intermediaire' | 'avance'
  mode:    string
  dayCode: string
} | null


type Props = {
  childId: string
  palName: string
  palette: { main: string; accent: string; glow: string }
  lang:    'fr' | 'cr'
}


const SUBJECT_META: Record<string, { label: string; icon: string }> = {
  mathematiques: { label: 'Mathématiques', icon: '🔢' },
  francais:      { label: 'Français',       icon: '📖' },
  histoire:      { label: 'Histoire',        icon: '🏛️' },
  sciences:      { label: 'Sciences',        icon: '🔬' },
}


const LEVEL_META = {
  debutant:      { label: 'Débutant',      color: '#16A34A', bg: '#DCFCE7' },
  intermediaire: { label: 'Intermédiaire', color: '#D97706', bg: '#FEF3C7' },
  avance:        { label: 'Avancé',        color: '#7C3AED', bg: '#EDE9FE' },
}


const T = {
  fr: {
    today:        'Aujourd\'hui',
    restDay:      'Pas de session prévue aujourd\'hui',
    restDaySub:   'Tu peux quand même étudier librement si tu veux!',
    studyFreely:  'Étudier librement',
    start:        'Commencer →',
    loading:      'Chargement de ton plan...',
    modeExercises: '🎯 Exercices',
    modeChat:      '💬 Question libre',
    questDuJour:   'Quête du jour',
    voirTout:      'Voir tout →',
  },
  cr: {
    today:        'Jodi a',
    restDay:      'Pa gen sesyon prevwa jodi a',
    restDaySub:   'Ou ka toujou etidye lib si ou vle!',
    studyFreely:  'Etidye lib',
    start:        'Kòmanse →',
    loading:      'Chajman plan ou...',
    modeExercises: '🎯 Egzèsis',
    modeChat:      '💬 Kesyon lib',
    questDuJour:   'Kèt jodi a',
    voirTout:      'Wè tout →',
  },
}


export default function StudyPlanCard({ childId, palName, palette, lang }: Props) {
  const router = useRouter()
  const t      = T[lang]
  const [today,   setToday]   = useState<TodayPlan>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetch(`/api/study-plan?childId=${childId}`)
      .then(r => r.json())
      .then(data => { setToday(data.today); setLoading(false) })
      .catch(() => setLoading(false))
  }, [childId])


  function startSession() {
    if (!today) return
    const params = new URLSearchParams({
      subject: today.subject,
      mode:    today.mode,
    })
    if (today.chapter) params.set('chapter', today.chapter)
    router.push(`/home/ask?${params}`)
  }


  function studyFreely() {
    router.push('/home/ask')
  }


  // Loading
  if (loading) return (
    <div style={{ padding: '0 0' }}>
      <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#0B1F4B', fontSize:20, fontWeight:600, marginBottom:12 }}>{t.today} ⚡</h2>
      <div style={{ background:'#fff', borderRadius:20, padding:24, border:'1.5px solid #E2E8F0', textAlign:'center' }}>
        <p style={{ color:'#94A3B8', fontSize:13 }}>{t.loading}</p>
      </div>
    </div>
  )


  // Rest day
  if (!today) return (
    <div>
      <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#0B1F4B', fontSize:20, fontWeight:600, marginBottom:12 }}>{t.today} 🌿</h2>
      <div style={{ background:'#fff', borderRadius:20, padding:'18px 20px', border:'1.5px solid #E2E8F0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🌿</div>
          <div>
            <p style={{ fontWeight:700, color:'#0B1F4B', fontSize:15, margin:'0 0 3px' }}>{t.restDay}</p>
            <p style={{ color:'#64748B', fontSize:12, margin:0 }}>{t.restDaySub}</p>
          </div>
        </div>
        <button onClick={studyFreely} style={{ width:'100%', background:'#F4F7FF', border:`1.5px solid ${palette.main}33`, borderRadius:12, padding:'10px 0', color:palette.main, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
          {t.studyFreely} →
        </button>
      </div>
    </div>
  )


  // Today has a plan
  const meta      = SUBJECT_META[today.subject] || { label: today.subject, icon: '📚' }
  const levelInfo = LEVEL_META[today.level] || LEVEL_META.debutant
  const modeLabel = today.mode === 'exercises' ? t.modeExercises : t.modeChat


  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#0B1F4B', fontSize:20, fontWeight:600 }}>{t.today} ⚡</h2>
      </div>


      <div id="tour-quest" onClick={startSession} style={{ background:`linear-gradient(135deg, #0B1F4B, ${palette.main})`, borderRadius:20, padding:'20px', cursor:'pointer', position:'relative', overflow:'hidden', boxShadow:`0 8px 32px ${palette.glow}` }}>


        {/* Background decoration */}
        <div style={{ position:'absolute', right:-30, bottom:-30, fontSize:160, opacity:.05 }}>{meta.icon}</div>


        {/* Subject + level row */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, position:'relative', zIndex:2 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            {meta.icon}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:'rgba(255,255,255,.45)', fontSize:10, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', margin:'0 0 3px' }}>
              {meta.label}
            </p>
            <p style={{ color:'#fff', fontWeight:700, fontSize:16, fontFamily:'var(--font-fredoka)', margin:0, lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {today.chapter || 'Révision générale'}
            </p>
          </div>
        </div>


        {/* Badges row */}
        <div style={{ display:'flex', gap:6, marginBottom:14, position:'relative', zIndex:2, flexWrap:'wrap' }}>
          <span style={{ background:levelInfo.bg, color:levelInfo.color, fontSize:10, fontWeight:800, borderRadius:99, padding:'4px 10px' }}>
            {levelInfo.label}
          </span>
          <span style={{ background:'rgba(255,255,255,.12)', color:'rgba(255,255,255,.65)', fontSize:10, fontWeight:700, borderRadius:99, padding:'4px 10px' }}>
            {modeLabel}
          </span>
          <span style={{ background:'rgba(251,191,36,.15)', color:'#FBBF24', fontSize:10, fontWeight:700, borderRadius:99, padding:'4px 10px' }}>
            +50 pts ⭐
          </span>
        </div>


        {/* Action row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:2 }}>
          <span style={{ color:'rgba(255,255,255,.5)', fontSize:12 }}>
            {palName} t'attend
          </span>
          <div style={{ background:'#FBBF24', color:'#0B1F4B', borderRadius:99, padding:'7px 18px', fontSize:13, fontWeight:800 }}>
            {t.start}
          </div>
        </div>
      </div>
    </div>
  )
}
