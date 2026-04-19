'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useChild } from '@/lib/ChildContext'
import { useLang } from '../layout'

type Article = {
  id: string
  title: string
  content: string
  subject: string
  hero: string
  hero_name: string
  grade_min: number
  grade_max: number
  question: string
  published: boolean
}

const SUBJECTS_FR = [
  'Tout',
  'Finances personnelles',
  'Santé mentale',
  'Nutrition',
  'Citoyenneté',
  'Entrepreneuriat',
  'Droit & Sécurité',
  'Relations sociales',
  'Environnement',
  'Technologie & IA',
  'Identité & Culture',
]

const SUBJECTS_CR = [
  'Tout',
  'Finans pèsonèl',
  'Sante mantal',
  'Nitrisyon',
  'Sitwayen',
  'Antreprenè',
  'Dwa & Sekirite',
  'Relasyon sosyal',
  'Anviwònman',
  'Teknoloji & IA',
  'Idantite & Kilti',
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
    title: 'Quêtes', subtitle: 'Explore et apprends avec ton héros',
    read: 'Lire', close: 'Fermer',
    quiz: 'Mini Quiz', quizSub: 'Tu as bien lu? Voyons ça!',
    correct: '🎉 Bonne réponse! +20 points', wrong: '❌ Pas tout à fait...',
    tryAgain: 'Réessayer', next: 'Quête suivante',
    readBy: 'Avec', empty: 'Aucune quête disponible pour ce sujet.',
    emptySub: 'Reviens bientôt pour du nouveau contenu!',
    points: '+20 pts',
  },
  cr: {
    title: 'Kèt', subtitle: 'Eksplore ak aprann ak ewo ou',
    read: 'Li', close: 'Fèmen',
    quiz: 'Mini Quiz', quizSub: 'Ou te li vre? Ann wè!',
    correct: '🎉 Bon repons! +20 pwen', wrong: '❌ Pa tout afè...',
    tryAgain: 'Eseye ankò', next: 'Pwochen kèt',
    readBy: 'Ak', empty: 'Pa gen kèt disponib pou sijè sa a.',
    emptySub: 'Tounen byento pou nouvo kontni!',
    points: '+20 pwen',
  }
}

// Generate wrong answers for multiple choice
function generateChoices(correct: string): string[] {
  const wrongs = [
    'Non, ce n\'est pas exact.',
    'Pas tout à fait, réfléchis encore.',
    'C\'est proche mais ce n\'est pas ça.',
  ]
  const all = [correct, ...wrongs]
  return all.sort(() => Math.random() - 0.5)
}

export default function QuestsPage() {
  const { child }   = useChild()
  const { lang }    = useLang()
  const t           = T[lang]

  const [articles, setArticles]       = useState<Article[]>([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('Tout')
  const [selected, setSelected]       = useState<Article | null>(null)
  const [phase, setPhase]             = useState<'read' | 'quiz' | 'done'>('read')
  const [choices, setChoices]         = useState<string[]>([])
  const [picked, setPicked]           = useState<string | null>(null)
  const [isWide, setIsWide]           = useState(false)
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set())

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    supabase.from('news_articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setArticles(data)
        setLoading(false)
      })
  }, [])

  const subjects = lang === 'fr' ? SUBJECTS_FR : SUBJECTS_CR
  const filtered = filter === 'Tout' || filter === subjects[0]
    ? articles
    : articles.filter(a => a.subject === filter || a.subject === SUBJECTS_FR[SUBJECTS_CR.indexOf(filter)])

  const openArticle = (a: Article) => {
    setSelected(a)
    setPhase('read')
    setPicked(null)
    setChoices(generateChoices(a.question?.split('|')[1] || 'C\'est la bonne réponse!'))
  }

  const startQuiz = () => {
    if (!selected?.question) return
    setPhase('quiz')
    setPicked(null)
    const correct = selected.question.split('|')[1] || selected.question
    setChoices(generateChoices(correct))
  }

  const handlePick = async (choice: string) => {
    if (picked) return
    setPicked(choice)
    const correct = selected?.question?.split('|')[1] || selected?.question || ''
    const isRight = choice === correct

    if (isRight && child) {
      // Award points
      const { data: existing } = await supabase
        .from('points').select('total').eq('child_id', child.id).single()
      if (existing) {
        await supabase.from('points').update({ total: existing.total + 20 }).eq('child_id', child.id)
      } else {
        await supabase.from('points').insert({ child_id: child.id, total: 20 })
      }
      setReadArticles(prev => new Set([...prev, selected!.id]))
    }
  }

  const subjectColor = (subject: string) => SUBJECT_COLORS[subject] || { bg: '#F1F5F9', text: '#64748B' }

  return (
    <div style={{ minHeight: '100%', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0B1F4B 0%, #13306B 100%)', padding: isWide ? '32px 32px 0' : '20px 20px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: isWide ? 36 : 28, fontWeight: 700, marginBottom: 6 }}>
          {t.title} ✨
        </h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14, marginBottom: 20 }}>{t.subtitle}</p>

        {/* Subject filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16 }}>
          {subjects.slice(0, 7).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              background: filter === s ? '#FBBF24' : 'rgba(255,255,255,.08)',
              color: filter === s ? '#0B1F4B' : 'rgba(255,255,255,.6)',
              border: 'none', borderRadius: 99, padding: '7px 16px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all .15s',
              fontFamily: 'var(--font-jakarta)',
            }}>
              {s}
            </button>
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
            <p style={{ fontSize: 40, marginBottom: 12 }}>🦸</p>
            <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 16, marginBottom: 6 }}>{t.empty}</p>
            <p style={{ color: '#94A3B8', fontSize: 14 }}>{t.emptySub}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isWide ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr', gap: 16 }}>
            {filtered.map(a => {
              const sc    = subjectColor(a.subject)
              const isDone = readArticles.has(a.id)
              return (
                <div key={a.id} onClick={() => openArticle(a)} style={{
                  background: '#fff', borderRadius: 20,
                  border: `1.5px solid ${isDone ? '#BBF7D0' : '#E2E8F0'}`,
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform .2s, box-shadow .2s',
                  position: 'relative',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                >
                  {isDone && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#22C55E', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99 }}>
                      ✓ Lu
                    </div>
                  )}

                  {/* Hero banner */}
                  <div style={{ background: `linear-gradient(135deg, #0B1F4B, #1A4FD8)`, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                      {a.hero || '🦸'}
                    </div>
                    <div>
                      <span style={{ background: sc.bg, color: sc.text, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                        {a.subject}
                      </span>
                      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, marginTop: 6 }}>
                        {t.readBy} {a.hero_name}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px 18px 18px' }}>
                    <h3 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 17, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
                      {a.title}
                    </h3>
                    <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                      {a.content.slice(0, 100)}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                        {t.points}
                      </span>
                      <span style={{ color: '#3B52D4', fontWeight: 700, fontSize: 13 }}>{t.read} →</span>
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
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center',
        }} onClick={() => setSelected(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '28px 28px 0 0',
              width: '100%', maxWidth: 640,
              maxHeight: '90vh', overflowY: 'auto',
              padding: '28px 24px 40px',
            }}
          >
            {phase === 'read' && (
              <>
                {/* Hero header */}
                <div style={{ background: 'linear-gradient(135deg, #0B1F4B, #1A4FD8)', borderRadius: 20, padding: '20px', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>
                    {selected.hero || '🦸'}
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, marginBottom: 4 }}>{t.readBy} {selected.hero_name}</p>
                    <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
                      {selected.title}
                    </h2>
                  </div>
                </div>

                {/* Subject tag */}
                <div style={{ marginBottom: 18 }}>
                  <span style={{ background: subjectColor(selected.subject).bg, color: subjectColor(selected.subject).text, fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 99 }}>
                    {selected.subject}
                  </span>
                </div>

                {/* Article content */}
                <p style={{ color: '#1E293B', fontSize: 16, lineHeight: 1.85, marginBottom: 32 }}>
                  {selected.content}
                </p>

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
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>🎯</div>
                  <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 24, marginBottom: 6 }}>{t.quiz}</h2>
                  <p style={{ color: '#64748B', fontSize: 14 }}>{t.quizSub}</p>
                </div>

                {/* Question */}
                <div style={{ background: '#F4F7FF', borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
                  <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15, lineHeight: 1.6 }}>
                    {selected.question?.split('|')[0] || selected.question}
                  </p>
                </div>

                {/* Choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {choices.map((c, i) => {
                    const correct = selected.question?.split('|')[1] || selected.question
                    const isCorrect = c === correct
                    const isPicked  = c === picked
                    let bg = '#fff', border = '#E2E8F0', color = '#0B1F4B'
                    if (picked) {
                      if (isCorrect)       { bg = '#D1FAE5'; border = '#22C55E'; color = '#065F46' }
                      else if (isPicked)   { bg = '#FEE2E2'; border = '#EF4444'; color = '#991B1B' }
                    } else if (isPicked)   { bg = '#DBEAFE'; border = '#3B52D4'; color = '#1E3A8A' }

                    return (
                      <button key={i} onClick={() => handlePick(c)} disabled={!!picked} style={{
                        background: bg, border: `2px solid ${border}`, borderRadius: 14,
                        padding: '14px 18px', textAlign: 'left', cursor: picked ? 'default' : 'pointer',
                        color, fontWeight: 600, fontSize: 14,
                        fontFamily: 'var(--font-jakarta)', transition: 'all .2s',
                      }}>
                        {String.fromCharCode(65 + i)}. {c}
                      </button>
                    )
                  })}
                </div>

                {/* Result */}
                {picked && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      background: picked === (selected.question?.split('|')[1] || selected.question) ? '#D1FAE5' : '#FEE2E2',
                      borderRadius: 14, padding: '14px 18px', textAlign: 'center',
                      fontWeight: 700, fontSize: 15,
                      color: picked === (selected.question?.split('|')[1] || selected.question) ? '#065F46' : '#991B1B',
                    }}>
                      {picked === (selected.question?.split('|')[1] || selected.question) ? t.correct : t.wrong}
                    </div>
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
      `}</style>
    </div>
  )
}

