'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useChild } from '@/lib/ChildContext'
import { useLang } from '../layout'
import { PalSVG } from '@/lib/pal-svg'


type Article = {
  id: string
  title: string
  content: string
  subject: string
  grade_min: number
  grade_max: number
  read_time: number
  question: string
  published: boolean
}


const PALETTES: Record<string, any> = {
  ocean:   { main: '#3B52D4', accent: '#7DD3FC', glow: 'rgba(59,82,212,.4)'   },
  fire:    { main: '#EA580C', accent: '#FDE68A', glow: 'rgba(234,88,12,.4)'   },
  forest:  { main: '#16A34A', accent: '#BBF7D0', glow: 'rgba(22,163,74,.4)'   },
  cosmic:  { main: '#7C3AED', accent: '#DDD6FE', glow: 'rgba(124,58,237,.4)'  },
  sunrise: { main: '#DB2777', accent: '#FDE68A', glow: 'rgba(219,39,119,.4)'  },
  storm:   { main: '#475569', accent: '#BAE6FD', glow: 'rgba(71,85,105,.4)'   },
  gold:    { main: '#D97706', accent: '#FEF3C7', glow: 'rgba(217,119,6,.4)'   },
  night:   { main: '#1E293B', accent: '#C7D2FE', glow: 'rgba(30,41,59,.4)'    },
}


const SUBJECTS_FR = [
  'Tout', 'Finances personnelles', 'Santé mentale', 'Nutrition',
  'Citoyenneté', 'Entrepreneuriat', 'Droit & Sécurité',
  'Relations sociales', 'Environnement', 'Technologie & IA', 'Identité & Culture',
]
const SUBJECTS_CR = [
  'Tout', 'Finans pèsonèl', 'Sante mantal', 'Nitrisyon',
  'Sitwayen', 'Antreprenè', 'Dwa & Sekirite',
  'Relasyon sosyal', 'Anviwònman', 'Teknoloji & IA', 'Idantite & Kilti',
]


const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  'Finances personnelles': { bg: '#D1FAE5', text: '#059669' },
  'Santé mentale':         { bg: '#EDE9FE', text: '#7C3AED' },
  'Nutrition':             { bg: '#D1FAE5', text: '#16A34A' },
  'Citoyenneté':           { bg: '#DBEAFE', text: '#3B52D4' },
  'Entrepreneuriat':       { bg: '#FEF3C7', text: '#D97706' },
  'Droit & Sécurité':      { bg: '#FEE2E2', text: '#DC2626' },
  'Relations sociales':    { bg: '#FCE7F3', text: '#DB2777' },
  'Environnement':         { bg: '#D1FAE5', text: '#059669' },
  'Technologie & IA':      { bg: '#DBEAFE', text: '#2563EB' },
  'Identité & Culture':    { bg: '#FEF3C7', text: '#D97706' },
}


const T = {
  fr: {
    title: 'Quêtes', subtitle: 'Explore et apprends avec ton compagnon',
    read: 'Lire', close: 'Fermer',
    quiz: 'Mini Quiz', quizSub: 'Tu as bien lu? Voyons ça!',
    correct: '🎉 Bonne réponse! +20 points',
    wrong: '❌ Pas tout à fait...',
    tryAgain: 'Réessayer', next: 'Quête suivante',
    readBy: 'Présenté par',
    empty: 'Aucune quête disponible pour ce sujet.',
    emptySub: 'Reviens bientôt pour du nouveau contenu!',
    points: '+20 pts',
    minRead: 'min de lecture',
    ages: 'Ans',
  },
  cr: {
    title: 'Kèt', subtitle: 'Eksplore ak aprann ak konpayon ou',
    read: 'Li', close: 'Fèmen',
    quiz: 'Mini Quiz', quizSub: 'Ou te li vre? Ann wè!',
    correct: '🎉 Bon repons! +20 pwen',
    wrong: '❌ Pa tout afè...',
    tryAgain: 'Eseye ankò', next: 'Pwochen kèt',
    readBy: 'Prezante pa',
    empty: 'Pa gen kèt disponib pou sijè sa a.',
    emptySub: 'Tounen byento pou nouvo kontni!',
    points: '+20 pwen',
    minRead: 'min lekti',
    ages: 'Ane',
  },
} 
  


function generateChoices(correct: string): string[] {
  const wrongs = [
    'Non, ce n\'est pas exact.',
    'Pas tout à fait, réfléchis encore.',
    'C\'est proche mais ce n\'est pas ça.',
  ]
  return [correct, ...wrongs].sort(() => Math.random() - 0.5)
}


function gradeToAge(grade: number) {
  return grade + 6
}


export default function QuestsPage() {
  const { child }   = useChild()
  const { lang }    = useLang()
  const t           = T[lang]


  const [articles,     setArticles]     = useState<Article[]>([])
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState('Tout')
  const [selected,     setSelected]     = useState<Article | null>(null)
  const [phase,        setPhase]        = useState<'read'|'quiz'>('read')
  const [choices,      setChoices]      = useState<string[]>([])
  const [picked,       setPicked]       = useState<string | null>(null)
  const [isWide,       setIsWide]       = useState(false)
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set())


  const palette = PALETTES[child?.pal?.palette || 'ocean']
  const palName = child?.pal?.name || '...'
  const creature  = child?.pal?.creature  || 'land'
  const bodyShape = child?.pal?.bodyShape || 'round'
  const feature   = child?.pal?.feature   || 'eyes'


  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])


  useEffect(() => {
    supabase.from('news_articles').select('*').eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setArticles(data); setLoading(false) })
  }, [])


  const subjects = lang === 'fr' ? SUBJECTS_FR : SUBJECTS_CR
  const filtered = filter === 'Tout' || filter === subjects[0]
    ? articles
    : articles.filter(a => a.subject === filter || a.subject === SUBJECTS_FR[SUBJECTS_CR.indexOf(filter)])


  const openArticle = (a: Article) => {
    setSelected(a); setPhase('read'); setPicked(null)
    setChoices(generateChoices(a.question?.split('|')[1] || 'C\'est la bonne réponse!'))
  }


  const startQuiz = () => {
    if (!selected?.question) return
    setPhase('quiz'); setPicked(null)
    setChoices(generateChoices(selected.question.split('|')[1] || selected.question))
  }


  const handlePick = async (choice: string) => {
    if (picked) return
    setPicked(choice)
    const correct = selected?.question?.split('|')[1] || selected?.question || ''
    const isRight = choice === correct
    if (isRight && child) {
      const { data: existing } = await supabase.from('points').select('total').eq('child_id', child.id).single()
      if (existing) await supabase.from('points').update({ total: existing.total + 20 }).eq('child_id', child.id)
      else await supabase.from('points').insert({ child_id: child.id, total: 20 })
      setReadArticles(prev => new Set([...prev, selected!.id]))
    }
  }


  const sc = (subject: string) => SUBJECT_COLORS[subject] || { bg: '#F1F5F9', text: '#64748B' }


  return (
    <div style={{ minHeight: '100%', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>


      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0B1F4B 0%, #13306B 100%)', padding: isWide ? '32px 32px 0' : '20px 20px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: isWide ? 36 : 28, fontWeight: 700, marginBottom: 6 }}>
          {t.title} ✨
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14, marginBottom: 20 }}>{t.subtitle}</p>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16 }}>
          {subjects.slice(0, 7).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              background: filter === s ? '#FBBF24' : 'rgba(255,255,255,.08)',
              color: filter === s ? '#0B1F4B' : 'rgba(255,255,255,.6)',
              border: 'none', borderRadius: 99, padding: '7px 16px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all .15s', fontFamily: 'var(--font-jakarta)',
            }}>{s}</button>
          ))}
        </div>
      </div>


      {/* Articles grid */}
      <div style={{ padding: isWide ? 32 : '20px 18px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#94A3B8' }}>
            <div style={{ fontSize: 40, marginBottom: 12, animation: 'pulse 1.5s infinite' }}>✨</div>
            <p>Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, background: '#fff', borderRadius: 20, border: '1.5px dashed #E2E8F0' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>✨</p>
            <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 16, marginBottom: 6 }}>{t.empty}</p>
            <p style={{ color: '#94A3B8', fontSize: 14 }}>{t.emptySub}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isWide ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr', gap: 16 }}>
            {filtered.map(a => {
              const color  = sc(a.subject)
              const isDone = readArticles.has(a.id)
              const ageMin = gradeToAge(a.grade_min || 3)
              const ageMax = gradeToAge(a.grade_max || 11)
              return (
                <div key={a.id} onClick={() => openArticle(a)} style={{
                  background: '#fff', borderRadius: 20,
                  border: `1.5px solid ${isDone ? '#BBF7D0' : '#E2E8F0'}`,
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform .2s, box-shadow .2s', position: 'relative',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                >
                  {isDone && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#22C55E', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, zIndex: 2 }}>✓ Lu</div>
                  )}


                  {/* Pal banner */}
                  <div style={{ background: `linear-gradient(135deg, #0B1F4B, ${palette.main})`, padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
                      <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={52} />
                    </div>
                    <div>
                      <span style={{ background: color.bg, color: color.text, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, display: 'inline-block', marginBottom: 6 }}>
                        {a.subject}
                      </span>
                      <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, margin: 0 }}>
                        {t.readBy} {palName}
                      </p>
                    </div>
                  </div>


                  {/* Content */}
                  <div style={{ padding: '16px 18px 18px' }}>
                    <h3 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 17, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
                      {a.title}
                    </h3>
                    <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                      {a.content?.slice(0, 100)}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99 }}>
                          ⏱ {a.read_time || 3} {t.minRead}
                        </span>
                        <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99 }}>
                          {ageMin}-{ageMax} {t.ages}
                        </span>
                      </div>
                      <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                        {t.points}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>


      {/* ARTICLE MODAL */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: '28px 24px 40px' }}>


            {phase === 'read' && (
              <>
                {/* Pal narrator header */}
                <div style={{ background: `linear-gradient(135deg, #0B1F4B, ${palette.main})`, borderRadius: 20, padding: '20px', display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
                    <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={64} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, margin: '0 0 4px' }}>
                      {t.readBy} {palName}
                    </p>
                    <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                      {selected.title}
                    </h2>
                  </div>
                </div>


                {/* Meta row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  <span style={{ background: sc(selected.subject).bg, color: sc(selected.subject).text, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>
                    {selected.subject}
                  </span>
                  <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99 }}>
                    ⏱ {selected.read_time || 3} {t.minRead}
                  </span>
                  <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99 }}>
                    {gradeToAge(selected.grade_min || 3)}-{gradeToAge(selected.grade_max || 11)} {t.ages}
                  </span>
                </div>


                {/* Article body — render paragraphs */}
                <div style={{ marginBottom: 32 }}>
                  {selected.content?.split('\n\n').map((para, i) => (
                    para.trim() ? (
                      <p key={i} style={{ color: '#1E293B', fontSize: 16, lineHeight: 1.85, marginBottom: 18 }}>
                        {para.trim()}
                      </p>
                    ) : null
                  ))}
                </div>


                {/* Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '13px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
                    {t.close}
                  </button>
                  {selected.question && (
                    <button onClick={startQuiz} style={{ flex: 2, padding: '13px', background: '#0B1F4B', color: '#FBBF24', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
                      {t.quiz} 🎯
                    </button>
                  )}
                </div>
              </>
            )}


            {phase === 'quiz' && (
              <>
                {/* Pal quiz header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                  <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
                    <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={56} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 22, margin: '0 0 4px' }}>{t.quiz}</h2>
                    <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>{t.quizSub}</p>
                  </div>
                </div>


                {/* Question */}
                <div style={{ background: '#F4F7FF', borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
                  <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                    {selected.question?.split('|')[0] || selected.question}
                  </p>
                </div>


                {/* Choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {choices.map((c, i) => {
                    const correct   = selected.question?.split('|')[1] || selected.question
                    const isCorrect = c === correct
                    const isPicked  = c === picked
                    let bg = '#fff', border = '#E2E8F0', color = '#0B1F4B'
                    if (picked) {
                      if (isCorrect)     { bg = '#D1FAE5'; border = '#22C55E'; color = '#065F46' }
                      else if (isPicked) { bg = '#FEE2E2'; border = '#EF4444'; color = '#991B1B' }
                    }
                    return (
                      <button key={i} onClick={() => handlePick(c)} disabled={!!picked} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: '14px 18px', textAlign: 'left', cursor: picked ? 'default' : 'pointer', color, fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-jakarta)', transition: 'all .2s' }}>
                        {String.fromCharCode(65 + i)}. {c}
                      </button>
                    )
                  })}
                </div>


                {/* Pal reaction */}
                {picked && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: picked === (selected.question?.split('|')[1] || selected.question) ? '#D1FAE5' : '#FEE2E2', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
                    <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={36} />
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: picked === (selected.question?.split('|')[1] || selected.question) ? '#065F46' : '#991B1B', lineHeight: 1.5 }}>
                      {picked === (selected.question?.split('|')[1] || selected.question) ? t.correct : t.wrong}
                    </p>
                  </div>
                )}


                {/* Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                  {picked && picked !== (selected.question?.split('|')[1] || selected.question) && (
                    <button onClick={() => { setPicked(null); setChoices(generateChoices(selected.question?.split('|')[1] || '')) }} style={{ flex: 1, padding: '13px', background: '#F1F5F9', color: '#0B1F4B', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
                      {t.tryAgain}
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} style={{ flex: 2, padding: '13px', background: '#0B1F4B', color: '#FBBF24', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
                    {t.next} →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes float  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
      `}</style>
    </div>
  )
}
