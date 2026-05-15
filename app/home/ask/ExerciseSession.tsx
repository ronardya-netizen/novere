'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { PalSVG } from '@/lib/pal-svg'
import { getSubjectLabel } from '@/lib/curriculum'
import type { Subject } from '@/lib/curriculum'


type ExerciseType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'match' | 'order' | 'quick_calc'


type Exercise = {
  type:               ExerciseType
  question:           string
  options?:           string[]
  correct:            string
  pairs?:             { left: string; right: string }[]
  steps?:             string[]
  correctOrder?:      string[]
  explanation:        string
  difficulty:         1 | 2 | 3
  palReactionCorrect: string
  palReactionWrong:   string
}


type Props = {
  child:       any
  subject:     Subject
  grade:       number
  chapter:     string | null
  palName:     string
  creature:    string
  bodyShape:   string
  palette:     { main: string; accent: string; glow: string }
  feature:     string
  personality: string
  lang:        'fr' | 'cr'
  onBack:      () => void
  onComplete:  (pointsEarned: number) => void
}


const T = {
  fr: {
    preparing:    'Je prépare ta mission...',
    preparingSub: 'Tes exercices arrivent dans quelques secondes!',
    error:        'Impossible de générer les exercices. Réessaie!',
    retry:        'Réessayer',
    back:         '← Retour',
    next:         'Suivant →',
    confirm:      'Confirmer',
    correct:      '✓ Bonne réponse!',
    wrong:        '✗ Pas tout à fait...',
    explanation:  'Explication',
    trueBtn:      'Vrai',
    falseBtn:     'Faux',
    matchInstr:   'Associe chaque élément de gauche avec celui de droite',
    orderInstr:   'Touche les éléments dans le bon ordre',
    orderReset:   'Recommencer',
    calcInstr:    'Calcule et écris ta réponse',
    fillInstr:    'Choisis le bon mot pour compléter la phrase',
    complete:     'Mission accomplie!',
    completeSub:  'Tu as terminé tous les exercices!',
    score:        'Score',
    points:       'points gagnés',
    newSession:   'Nouvelle session',
    exercise:     'Exercice',
    of:           'sur',
    difficulty:   ['', 'Facile', 'Moyen', 'Difficile'],
  },
  cr: {
    preparing:    'Mwen ap prepare misyon ou...',
    preparingSub: 'Egzèsis yo ap vini nan kèk segonn!',
    error:        'Enposib pou jenere egzèsis yo. Eseye ankò!',
    retry:        'Eseye ankò',
    back:         '← Retounen',
    next:         'Swivan →',
    confirm:      'Konfime',
    correct:      '✓ Bon repons!',
    wrong:        '✗ Pa tout afè...',
    explanation:  'Eksplikasyon',
    trueBtn:      'Vrè',
    falseBtn:     'Fo',
    matchInstr:   'Asosye chak eleman gòch ak eleman dwat',
    orderInstr:   'Touche eleman yo nan bon lòd',
    orderReset:   'Rekòmanse',
    calcInstr:    'Kalkile epi ekri repons ou',
    fillInstr:    'Chwazi bon mo pou konplete fraz la',
    complete:     'Misyon akonpli!',
    completeSub:  'Ou te fini tout egzèsis yo!',
    score:        'Pwen',
    points:       'pwen ranmase',
    newSession:   'Nouvo sesyon',
    exercise:     'Egzèsis',
    of:           'nan',
    difficulty:   ['', 'Fasil', 'Mwayen', 'Difisil'],
  },
}


export default function ExerciseSession({
  child, subject, grade, chapter, palName, creature, bodyShape,
  palette, feature, personality, lang, onBack, onComplete,
}: Props) {
  const t = T[lang]


  // ── Load state ────────────────────────────────────────────────
  const [loadPhase,  setLoadPhase]  = useState<'loading'|'ready'|'error'>('loading')
  const [exercises,  setExercises]  = useState<Exercise[]>([])
  const [loadingDot, setLoadingDot] = useState(0)


  // ── Session state ─────────────────────────────────────────────
  const [idx,         setIdx]         = useState(0)
  const [phase,       setPhase]       = useState<'question'|'feedback'|'complete'>('question')
  const [isCorrect,   setIsCorrect]   = useState(false)
  const [score,       setScore]       = useState(0)
  const [wrongStreak, setWrongStreak] = useState(0)
  const [rightStreak, setRightStreak] = useState(0)
  const [animIn,      setAnimIn]      = useState(true)


  // ── Exercise-specific state ───────────────────────────────────
  const [selected,      setSelected]      = useState<string | null>(null)
  const [filledWord,    setFilledWord]     = useState<string | null>(null)
  const [selectedLeft,  setSelectedLeft]  = useState<string | null>(null)
  const [matches,       setMatches]       = useState<Record<string, string>>({})
  const [orderedItems,  setOrderedItems]  = useState<string[]>([])
  const [calcInput,     setCalcInput]     = useState('')


  const inputRef = useRef<HTMLInputElement>(null)


  const current = exercises[idx]


  // ── Loading animation ─────────────────────────────────────────
  useEffect(() => {
    const i = setInterval(() => setLoadingDot(d => (d + 1) % 4), 400)
    return () => clearInterval(i)
  }, [])


  // ── Generate exercises ────────────────────────────────────────
  useEffect(() => { generate() }, [])


  async function generate() {
    setLoadPhase('loading')
    try {
      const res = await fetch('/api/exercises', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subject, grade, chapter, palName, creature, personality, lang, childId: child.id }),
      })
      const data = await res.json()
      if (!data.exercises || data.exercises.length === 0) throw new Error('empty')
      setExercises(data.exercises)
      setLoadPhase('ready')
    } catch {
      setLoadPhase('error')
    }
  }


  // ── Answer submission ─────────────────────────────────────────
  function submitAnswer(answer: string) {
    if (!current) return
    const correct = checkCorrect(answer)
    setIsCorrect(correct)
    setPhase('feedback')
    if (correct) {
      setScore(s => s + 1)
      setRightStreak(r => r + 1)
      setWrongStreak(0)
    } else {
      setWrongStreak(w => w + 1)
      setRightStreak(0)
    }
  }


  function checkCorrect(answer: string): boolean {
    if (!current) return false
    if (current.type === 'order') {
      return JSON.stringify(orderedItems) === JSON.stringify(current.correctOrder)
    }
    if (current.type === 'match') {
      if (!current.pairs) return false
      return current.pairs.every(p => matches[p.left] === p.right)
    }
    return answer.trim().toLowerCase() === (current.correct || '').trim().toLowerCase()
  }


  function nextExercise() {
    if (idx >= exercises.length - 1) {
      setPhase('complete')
      saveSession()
      return
    }
    setAnimIn(false)
    setTimeout(() => {
      setIdx(i => i + 1)
      setPhase('question')
      setSelected(null)
      setFilledWord(null)
      setSelectedLeft(null)
      setMatches({})
      setOrderedItems([])
      setCalcInput('')
      setAnimIn(true)
    }, 200)
  }


  async function saveSession() {
    if (!child) return
    const pts = score * 5 + (score === exercises.length ? 10 : 0)
    await supabase.from('study_sessions').insert({
      child_id:     child.id,
      subject:      getSubjectLabel(subject),
      technique:    'exercises',
      duration_mins: Math.ceil(exercises.length * 1.5),
      points_earned: pts,
    })
    if (pts > 0) {
      const { data: existing } = await supabase.from('points').select('total').eq('child_id', child.id).single()
      if (existing) await supabase.from('points').update({ total: existing.total + pts }).eq('child_id', child.id)
      else await supabase.from('points').insert({ child_id: child.id, total: pts })
    }
  }


  // ── Match handlers ────────────────────────────────────────────
  function handleLeftTap(left: string) {
    if (matches[left]) return // already matched
    setSelectedLeft(l => l === left ? null : left)
  }


  function handleRightTap(right: string) {
    if (!selectedLeft) return
    if (Object.values(matches).includes(right)) return // already matched
    const newMatches = { ...matches, [selectedLeft]: right }
    setMatches(newMatches)
    setSelectedLeft(null)
    if (current?.pairs && Object.keys(newMatches).length === current.pairs.length) {
      setTimeout(() => submitAnswer('match_done'), 400)
    }
  }


  // ── Order handlers ────────────────────────────────────────────
  function handleOrderTap(item: string) {
    if (orderedItems.includes(item)) {
      setOrderedItems(prev => prev.filter(i => i !== item))
    } else {
      const newOrder = [...orderedItems, item]
      setOrderedItems(newOrder)
      if (current?.steps && newOrder.length === current.steps.length) {
        setTimeout(() => submitAnswer('order_done'), 300)
      }
    }
  }


  // ── Difficulty badge ──────────────────────────────────────────
  const diffColors = ['', '#22C55E', '#F59E0B', '#EF4444']
  const diffBgs    = ['', '#DCFCE7', '#FEF3C7', '#FEE2E2']


  // ── LOADING ───────────────────────────────────────────────────
  if (loadPhase === 'loading') return (
    <div style={{ height: '100vh', background: `linear-gradient(160deg, #0B1F4B, ${palette.main}44)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-jakarta)', padding: 24 }}>
      <div style={{ animation: 'float 2s ease-in-out infinite', marginBottom: 28 }}>
        <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={100} />
      </div>
      <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
        {t.preparing.replace('...', '.'.repeat(loadingDot + 1))}
      </h2>
      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, textAlign: 'center' }}>{t.preparingSub}</p>
      <div style={{ marginTop: 32, display: 'flex', gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: loadingDot === i ? '#FBBF24' : 'rgba(255,255,255,.2)', transition: 'background .3s' }} />
        ))}
      </div>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }`}</style>
    </div>
  )


  // ── ERROR ─────────────────────────────────────────────────────
  if (loadPhase === 'error') return (
    <div style={{ height: '100vh', background: '#0B1F4B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-jakarta)', padding: 24 }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>😔</p>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8, textAlign: 'center' }}>{t.error}</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,.1)', border: 'none', borderRadius: 12, padding: '12px 20px', color: 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>{t.back}</button>
        <button onClick={generate} style={{ background: '#FBBF24', border: 'none', borderRadius: 12, padding: '12px 24px', color: '#0B1F4B', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>{t.retry}</button>
      </div>
    </div>
  )


  // ── COMPLETE ──────────────────────────────────────────────────
  if (phase === 'complete') {
    const pts        = score * 5 + (score === exercises.length ? 10 : 0)
    const pct        = Math.round((score / exercises.length) * 100)
    const starCount  = pct >= 90 ? 3 : pct >= 60 ? 2 : 1
    return (
      <div style={{ height: '100vh', background: `linear-gradient(160deg, #0B1F4B, ${palette.main}55)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-jakarta)', padding: 24 }}>
        <div style={{ animation: 'float 2s ease-in-out infinite', marginBottom: 20 }}>
          <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={110} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[1,2,3].map(i => <span key={i} style={{ fontSize: 36, filter: i <= starCount ? 'none' : 'grayscale(1) opacity(.3)' }}>⭐</span>)}
        </div>
        <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#FBBF24', fontSize: 30, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{t.complete}</h2>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, marginBottom: 28, textAlign: 'center' }}>{t.completeSub}</p>
        <div style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: '20px 32px', marginBottom: 28, textAlign: 'center', minWidth: 220 }}>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', margin: '0 0 8px' }}>{t.score}</p>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 32, fontFamily: 'var(--font-fredoka)', margin: '0 0 4px' }}>{score} / {exercises.length}</p>
          <p style={{ color: '#FBBF24', fontWeight: 700, fontSize: 15, margin: 0 }}>+{pts} {t.points}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 14, padding: '13px 20px', color: 'rgba(255,255,255,.7)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>{t.back}</button>
          <button onClick={() => { setIdx(0); setScore(0); setPhase('question'); setSelected(null); setFilledWord(null); setMatches({}); setOrderedItems([]); setCalcInput(''); generate() }} style={{ background: '#FBBF24', border: 'none', borderRadius: 14, padding: '13px 24px', color: '#0B1F4B', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>{t.newSession}</button>
        </div>
        <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
      </div>
    )
  }


  if (!current) return null


  // ── EXERCISE RENDERERS ────────────────────────────────────────


  const renderMultipleChoice = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {(current.options || []).map((opt, i) => {
        const isSelected = selected === opt
        const isCorrectOpt = opt === current.correct
        let bg = 'rgba(255,255,255,.07)', border = 'rgba(255,255,255,.12)', color = 'rgba(255,255,255,.85)'
        if (phase === 'feedback') {
          if (isCorrectOpt)        { bg = 'rgba(34,197,94,.2)';  border = '#22C55E'; color = '#86EFAC' }
          else if (isSelected)     { bg = 'rgba(239,68,68,.2)';  border = '#EF4444'; color = '#FCA5A5' }
        } else if (isSelected) {
          bg = `${palette.main}33`; border = palette.main; color = '#fff'
        }
        return (
          <button key={i} onClick={() => { if (phase !== 'feedback') { setSelected(opt); if (phase === 'question') submitAnswer(opt) } }}
            style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: '14px 18px', textAlign: 'left', cursor: phase === 'feedback' ? 'default' : 'pointer', color, fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-jakarta)', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        )
      })}
    </div>
  )


  const renderTrueFalse = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {[t.trueBtn, t.falseBtn].map((label) => {
        const val = label === t.trueBtn ? 'Vrai' : 'Faux'
        const isSelected = selected === val
        const isCorrectOpt = val === current.correct || (current.correct === 'true' && val === 'Vrai') || (current.correct === 'false' && val === 'Faux')
        let bg = 'rgba(255,255,255,.07)', border = 'rgba(255,255,255,.12)', color = 'rgba(255,255,255,.85)'
        if (phase === 'feedback') {
          if (isCorrectOpt)    { bg = 'rgba(34,197,94,.2)';  border = '#22C55E'; color = '#86EFAC' }
          else if (isSelected) { bg = 'rgba(239,68,68,.2)';  border = '#EF4444'; color = '#FCA5A5' }
        } else if (isSelected) {
          bg = `${palette.main}33`; border = palette.main; color = '#fff'
        }
        return (
          <button key={label} onClick={() => { if (phase !== 'feedback') { setSelected(val); submitAnswer(val) } }}
            style={{ background: bg, border: `2px solid ${border}`, borderRadius: 16, padding: '20px 0', textAlign: 'center', cursor: phase === 'feedback' ? 'default' : 'pointer', color, fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-fredoka)', transition: 'all .2s' }}>
            {label}
          </button>
        )
      })}
    </div>
  )


  const renderFillBlank = () => {
    const parts = current.question.split('___')
    return (
      <div>
        <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '16px 18px', marginBottom: 18, lineHeight: 1.9, fontSize: 16, color: 'rgba(255,255,255,.9)', fontWeight: 500 }}>
          {parts[0]}
          <span style={{ display: 'inline-block', minWidth: 120, borderBottom: `2px solid ${filledWord ? palette.accent : 'rgba(255,255,255,.4)'}`, padding: '2px 8px', margin: '0 4px', color: filledWord ? '#FBBF24' : 'rgba(255,255,255,.4)', fontWeight: 700, textAlign: 'center', transition: 'all .2s' }}>
            {filledWord || '___'}
          </span>
          {parts[1]}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {(current.options || []).map((opt, i) => {
            const isSelected = filledWord === opt
            const isCorrectOpt = opt === current.correct
            let bg = 'rgba(255,255,255,.07)', border = 'rgba(255,255,255,.12)', color = 'rgba(255,255,255,.85)'
            if (phase === 'feedback') {
              if (isCorrectOpt)    { bg = 'rgba(34,197,94,.2)';  border = '#22C55E'; color = '#86EFAC' }
              else if (isSelected) { bg = 'rgba(239,68,68,.2)';  border = '#EF4444'; color = '#FCA5A5' }
            } else if (isSelected) {
              bg = `${palette.main}33`; border = palette.main; color = '#fff'
            }
            return (
              <button key={i} onClick={() => { if (phase !== 'feedback') setFilledWord(f => f === opt ? null : opt) }}
                style={{ background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '12px 0', textAlign: 'center', cursor: phase === 'feedback' ? 'default' : 'pointer', color, fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-jakarta)', transition: 'all .2s' }}>
                {opt}
              </button>
            )
          })}
        </div>
        {filledWord && phase === 'question' && (
          <button onClick={() => submitAnswer(filledWord)} style={{ width: '100%', marginTop: 14, background: '#FBBF24', border: 'none', borderRadius: 12, padding: '13px 0', color: '#0B1F4B', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
            {t.confirm}
          </button>
        )}
      </div>
    )
  }


  const renderMatch = () => {
    const pairs = current.pairs || []
    const rightItems = pairs.map(p => p.right).sort(() => Math.random() - 0.5)
    // Use a stable shuffle seeded by idx
    const shuffledRight = [...pairs.map(p => p.right)].sort((a, b) => {
      const seed = idx * 137
      return ((a.charCodeAt(0) + seed) % 7) - ((b.charCodeAt(0) + seed) % 7)
    })
    return (
      <div>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>{t.matchInstr}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pairs.map((p, i) => {
              const isMatched  = !!matches[p.left]
              const isSelected = selectedLeft === p.left
              const isCorrectMatch = phase === 'feedback' && matches[p.left] === p.right
              const isWrongMatch   = phase === 'feedback' && matches[p.left] && matches[p.left] !== p.right
              let bg = 'rgba(255,255,255,.07)', border = 'rgba(255,255,255,.12)', color = 'rgba(255,255,255,.85)'
              if (isCorrectMatch) { bg = 'rgba(34,197,94,.2)'; border = '#22C55E'; color = '#86EFAC' }
              else if (isWrongMatch) { bg = 'rgba(239,68,68,.2)'; border = '#EF4444'; color = '#FCA5A5' }
              else if (isSelected) { bg = `${palette.main}33`; border = palette.main; color = '#fff' }
              else if (isMatched)  { bg = 'rgba(251,191,36,.1)'; border = 'rgba(251,191,36,.3)'; color = '#FBBF24' }
              return (
                <button key={i} onClick={() => { if (phase === 'question' && !isMatched) handleLeftTap(p.left) }}
                  style={{ background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '11px 10px', textAlign: 'left', cursor: phase === 'feedback' || isMatched ? 'default' : 'pointer', color, fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-jakarta)', transition: 'all .2s', minHeight: 44 }}>
                  {p.left}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shuffledRight.map((right, i) => {
              const matchedLeft    = Object.entries(matches).find(([, v]) => v === right)?.[0]
              const isMatched      = !!matchedLeft
              const isCorrectMatch = phase === 'feedback' && pairs.find(p => p.right === right)?.left === matchedLeft
              const isWrongMatch   = phase === 'feedback' && isMatched && !isCorrectMatch
              let bg = 'rgba(255,255,255,.07)', border = 'rgba(255,255,255,.12)', color = 'rgba(255,255,255,.85)'
              if (isCorrectMatch) { bg = 'rgba(34,197,94,.2)'; border = '#22C55E'; color = '#86EFAC' }
              else if (isWrongMatch) { bg = 'rgba(239,68,68,.2)'; border = '#EF4444'; color = '#FCA5A5' }
              else if (isMatched)   { bg = 'rgba(251,191,36,.1)'; border = 'rgba(251,191,36,.3)'; color = '#FBBF24' }
              else if (selectedLeft) { bg = 'rgba(255,255,255,.12)'; border = palette.accent }
              return (
                <button key={i} onClick={() => { if (phase === 'question' && !isMatched && selectedLeft) handleRightTap(right) }}
                  style={{ background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '11px 10px', textAlign: 'left', cursor: phase === 'feedback' || !selectedLeft || isMatched ? 'default' : 'pointer', color, fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-jakarta)', transition: 'all .2s', minHeight: 44 }}>
                  {right}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }


  const renderOrder = () => {
    const steps = current.steps || []
    return (
      <div>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>{t.orderInstr}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {steps.map((step, i) => {
            const orderNum    = orderedItems.indexOf(step)
            const isPlaced    = orderNum >= 0
            const isCorrectPos = phase === 'feedback' && current.correctOrder?.[orderNum] === step
            const isWrongPos   = phase === 'feedback' && isPlaced && !isCorrectPos
            let bg = 'rgba(255,255,255,.07)', border = 'rgba(255,255,255,.12)', color = 'rgba(255,255,255,.85)'
            if (isCorrectPos) { bg = 'rgba(34,197,94,.2)'; border = '#22C55E'; color = '#86EFAC' }
            else if (isWrongPos) { bg = 'rgba(239,68,68,.2)'; border = '#EF4444'; color = '#FCA5A5' }
            else if (isPlaced)   { bg = `${palette.main}33`; border = palette.main; color = '#fff' }
            return (
              <button key={i} onClick={() => { if (phase === 'question') handleOrderTap(step) }}
                style={{ background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '12px 14px', textAlign: 'left', cursor: phase === 'feedback' ? 'default' : 'pointer', color, fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-jakarta)', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: isPlaced ? palette.main : 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, color: isPlaced ? '#fff' : 'rgba(255,255,255,.4)' }}>
                  {isPlaced ? orderNum + 1 : '?'}
                </span>
                {step}
              </button>
            )
          })}
        </div>
        {orderedItems.length > 0 && phase === 'question' && (
          <button onClick={() => setOrderedItems([])} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
            {t.orderReset}
          </button>
        )}
      </div>
    )
  }


  const renderQuickCalc = () => (
    <div>
      <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>{t.calcInstr}</p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="number"
          value={calcInput}
          onChange={e => setCalcInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && calcInput && submitAnswer(calcInput)}
          placeholder="?"
          disabled={phase === 'feedback'}
          style={{ flex: 1, background: 'rgba(255,255,255,.07)', border: `2px solid ${phase === 'feedback' ? (isCorrect ? '#22C55E' : '#EF4444') : 'rgba(255,255,255,.2)'}`, borderRadius: 14, padding: '14px 18px', color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-fredoka)', outline: 'none', textAlign: 'center' }}
        />
        {phase === 'question' && calcInput && (
          <button onClick={() => submitAnswer(calcInput)} style={{ background: '#FBBF24', border: 'none', borderRadius: 14, padding: '14px 20px', color: '#0B1F4B', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
            →
          </button>
        )}
      </div>
    </div>
  )


  const renderExercise = () => {
    switch (current.type) {
      case 'multiple_choice': return renderMultipleChoice()
      case 'true_false':      return renderTrueFalse()
      case 'fill_blank':      return renderFillBlank()
      case 'match':           return renderMatch()
      case 'order':           return renderOrder()
      case 'quick_calc':      return renderQuickCalc()
      default:                return renderMultipleChoice()
    }
  }


  // ── MAIN RENDER ───────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0B1F4B', fontFamily: 'var(--font-jakarta)', position: 'relative', overflow: 'hidden' }}>


      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,.08)', zIndex: 10 }}>
        <div style={{ height: '100%', width: `${((idx + (phase === 'feedback' ? 1 : 0)) / exercises.length) * 100}%`, background: palette.main, transition: 'width .4s ease', borderRadius: '0 99px 99px 0' }} />
      </div>


      {/* Header */}
      <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.06)', flexShrink: 0, marginTop: 4 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 10, padding: '7px 12px', color: 'rgba(255,255,255,.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>{t.back}</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', margin: 0 }}>
            {t.exercise} {idx + 1} {t.of} {exercises.length}
          </p>
        </div>
        <div style={{ background: diffBgs[current.difficulty], borderRadius: 99, padding: '4px 10px' }}>
          <p style={{ color: diffColors[current.difficulty], fontSize: 10, fontWeight: 700, margin: 0 }}>
            {t.difficulty[current.difficulty]}
          </p>
        </div>
      </div>


      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>


        {/* Pal question bubble */}
        <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(12px)', transition: 'all .25s ease' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
              <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={48} />
            </div>
            <div style={{ flex: 1, background: `${palette.main}33`, border: `1px solid ${palette.main}55`, borderRadius: '16px 16px 16px 4px', padding: '12px 16px' }}>
              <p style={{ color: '#fff', fontSize: 15, lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
                {current.question}
              </p>
            </div>
          </div>
        </div>


        {/* Exercise content */}
        <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(12px)', transition: 'all .3s ease .05s' }}>
          {renderExercise()}
        </div>


        {/* Feedback */}
        {phase === 'feedback' && (
          <div style={{ animation: 'slideUp .3s ease', display: 'flex', flexDirection: 'column', gap: 12 }}>


            {/* Result banner */}
            <div style={{ background: isCorrect ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', border: `1px solid ${isCorrect ? '#22C55E' : '#EF4444'}`, borderRadius: 14, padding: '12px 16px' }}>
              <p style={{ color: isCorrect ? '#86EFAC' : '#FCA5A5', fontWeight: 800, fontSize: 14, margin: '0 0 4px' }}>
                {isCorrect ? t.correct : t.wrong}
              </p>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                {current.explanation}
              </p>
            </div>


            {/* Pal reaction */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={36} />
              </div>
              <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '14px 14px 14px 4px', padding: '10px 14px' }}>
                <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 13, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                  "{isCorrect ? current.palReactionCorrect : current.palReactionWrong}"
                </p>
              </div>
            </div>


            {/* Next button */}
            <button onClick={nextExercise} style={{ width: '100%', background: `linear-gradient(135deg, #0B1F4B, ${palette.main})`, border: 'none', borderRadius: 14, padding: '14px 0', color: '#FBBF24', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-jakarta)', boxShadow: `0 4px 16px ${palette.glow}` }}>
              {idx >= exercises.length - 1 ? '🎉 Terminer la session' : t.next}
            </button>
          </div>
        )}
      </div>


      {/* Score indicator */}
      <div style={{ padding: '10px 18px', background: 'rgba(0,0,0,.2)', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
        {exercises.map((_, i) => (
          <div key={i} style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 99, background: i < idx ? palette.main : i === idx ? '#FBBF24' : 'rgba(255,255,255,.12)', transition: 'all .3s ease' }} />
        ))}
      </div>


      <style>{`
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
