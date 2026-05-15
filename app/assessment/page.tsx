'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useChild } from '@/lib/ChildContext'
import { useRouter } from 'next/navigation'
import { PalSVG } from '@/lib/pal-svg'


// ── Types ────────────────────────────────────────────────────────
type Question = {
  question:    string
  options:     string[]
  correct:     string
  difficulty:  1 | 2 | 3
  competency:  string
}
type SubjectQuestions = Record<string, Question[]>


type SubjectResult = {
  subject: string
  score:   number
  total:   number
  level:   'debutant' | 'intermediaire' | 'avance'
}


// ── Constants ────────────────────────────────────────────────────
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


const SUBJECT_META: Record<string, { label: string; icon: string; color: string }> = {
  mathematiques: { label: 'Mathématiques', icon: '🔢', color: '#3B52D4' },
  francais:      { label: 'Français',       icon: '📖', color: '#DB2777' },
  histoire:      { label: 'Histoire',        icon: '🏛️', color: '#D97706' },
  sciences:      { label: 'Sciences',        icon: '🔬', color: '#16A34A' },
}


const LEVEL_META = {
  debutant:       { label: 'Débutant',       color: '#EF4444', bg: '#FEE2E2', icon: '🌱' },
  intermediaire:  { label: 'Intermédiaire',  color: '#D97706', bg: '#FEF3C7', icon: '🌿' },
  avance:         { label: 'Avancé',         color: '#16A34A', bg: '#DCFCE7', icon: '🌳' },
}


function getLevel(score: number, total: number): 'debutant' | 'intermediaire' | 'avance' {
  const pct = score / total
  if (pct >= 0.85) return 'avance'
  if (pct >= 0.5)  return 'intermediaire'
  return 'debutant'
}


// ── Main component ───────────────────────────────────────────────
export default function AssessmentPage() {
  const { child, loading, refresh } = useChild()
  const router = useRouter()


  const palette  = PALETTES[child?.pal?.palette || 'ocean']
  const palName  = child?.pal?.name   || '...'
  const creature = child?.pal?.creature  || 'land'
  const bodyShape = child?.pal?.bodyShape || 'round'
  const feature  = child?.pal?.feature   || 'eyes'


  // ── Phase management ─────────────────────────────────────────
  type Phase =
    | 'loading_data'    // fetching child
    | 'generating'      // calling API
    | 'intro'           // welcome screen
    | 'subject_intro'   // "On commence par X"
    | 'question'        // answering a question
    | 'feedback'        // answer revealed
    | 'subject_result'  // end of one subject
    | 'complete'        // all done
    | 'error'


  const [phase,           setPhase]           = useState<Phase>('loading_data')
  const [questions,       setQuestions]       = useState<SubjectQuestions>({})
  const [subjects,        setSubjects]        = useState<string[]>([])
  const [subjectIdx,      setSubjectIdx]      = useState(0)
  const [questionIdx,     setQuestionIdx]     = useState(0)
  const [selected,        setSelected]        = useState<string | null>(null)
  const [isCorrect,       setIsCorrect]       = useState(false)
  const [subjectScores,   setSubjectScores]   = useState<Record<string, number>>({})
  const [results,         setResults]         = useState<SubjectResult[]>([])
  const [animIn,          setAnimIn]          = useState(true)
  const [loadingDot,      setLoadingDot]      = useState(0)
  const [saving,          setSaving]          = useState(false)


  // ── Loading animation ────────────────────────────────────────
  useEffect(() => {
    const i = setInterval(() => setLoadingDot(d => (d + 1) % 4), 400)
    return () => clearInterval(i)
  }, [])


  // ── Wait for child then generate ─────────────────────────────
  useEffect(() => {
    if (loading) return
    if (!child)  { router.push('/onboarding'); return }
    if (child.assessment_completed) { router.push('/home'); return }
    generateAssessment()
  }, [child, loading])


  async function generateAssessment() {
    setPhase('generating')
    const enabledSubjects = (child as any)?.enabled_subjects ||
      ['mathematiques', 'francais', 'histoire', 'sciences']


    try {
      const res = await fetch('/api/assessment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects:    enabledSubjects,
          grade:       child?.grade ?? 5,
          palName,
          creature,
          personality: child?.personality || 'curious',
        }),
      })
      const data = await res.json()
      if (!data.subjects) throw new Error('No subjects returned')


      // Filter to subjects that actually have questions
      const validSubjects = enabledSubjects.filter(
        (s: string) => data.subjects[s] && data.subjects[s].length > 0
      )


      setQuestions(data.subjects)
      setSubjects(validSubjects)
      setPhase('intro')
    } catch (err) {
      console.error('Assessment error:', err)
      setPhase('error')
    }
  }


  // ── Current question ─────────────────────────────────────────
  const currentSubject  = subjects[subjectIdx]
  const currentMeta     = SUBJECT_META[currentSubject] || { label: currentSubject, icon: '📚', color: '#3B52D4' }
  const currentQs       = questions[currentSubject] || []
  const currentQ        = currentQs[questionIdx]
  const totalQuestions  = subjects.reduce((s, sub) => s + (questions[sub]?.length || 0), 0)
  const answeredSoFar   = subjects.slice(0, subjectIdx).reduce((s, sub) => s + (questions[sub]?.length || 0), 0) + questionIdx
  const progressPct     = totalQuestions > 0 ? (answeredSoFar / totalQuestions) * 100 : 0


  // ── Navigation ───────────────────────────────────────────────
  function transition(nextPhase: Phase) {
    setAnimIn(false)
    setTimeout(() => { setPhase(nextPhase); setAnimIn(true) }, 200)
  }


  function submitAnswer(answer: string) {
    const correct = answer === currentQ.correct
    setSelected(answer)
    setIsCorrect(correct)
    if (correct) {
      setSubjectScores(prev => ({
        ...prev,
        [currentSubject]: (prev[currentSubject] || 0) + 1,
      }))
    }
    transition('feedback')
  }


  function nextQuestion() {
    const isLastQuestion = questionIdx >= currentQs.length - 1
    if (isLastQuestion) {
      transition('subject_result')
    } else {
      setSelected(null)
      setQuestionIdx(q => q + 1)
      transition('question')
    }
  }


  function nextSubject() {
    const isLastSubject = subjectIdx >= subjects.length - 1
    if (isLastSubject) {
      buildResults()
    } else {
      setSubjectIdx(s => s + 1)
      setQuestionIdx(0)
      setSelected(null)
      transition('subject_intro')
    }
  }


  function buildResults() {
    const res: SubjectResult[] = subjects.map(s => {
      const total = questions[s]?.length || 3
      const score = subjectScores[s] || 0
      return { subject: s, score, total, level: getLevel(score, total) }
    })
    setResults(res)
    transition('complete')
  }


  async function finishAssessment() {
    if (!child || saving) return
    setSaving(true)


    // Save per-subject results
    await Promise.all(results.map(r =>
      supabase.from('child_assessments').upsert({
        child_id: child.id,
        subject:  r.subject,
        score:    r.score,
        level:    r.level,
      }, { onConflict: 'child_id,subject' })
    ))


    // Mark assessment complete
    await supabase.from('children')
      .update({ assessment_completed: true })
      .eq('id', child.id)


    await refresh()
    router.push('/home')
  }


  // ── Shared styles ────────────────────────────────────────────
  const wrapStyle = {
    opacity:   animIn ? 1 : 0,
    transform: animIn ? 'translateY(0)' : 'translateY(16px)',
    transition: 'all .25s ease',
  }


  // ── LOADING / GENERATING ─────────────────────────────────────
  if (phase === 'loading_data' || phase === 'generating') return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg, #0B1F4B, ${palette.main}44)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jakarta)', padding:24 }}>
      <div style={{ animation:'float 2s ease-in-out infinite', marginBottom:28 }}>
        <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={100} />
      </div>
      <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:22, fontWeight:700, marginBottom:10, textAlign:'center' }}>
        {phase === 'loading_data'
          ? 'Chargement...'
          : `Je prépare ton test${'.'.repeat(loadingDot + 1)}`}
      </h2>
      <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, textAlign:'center', maxWidth:300 }}>
        {phase === 'generating' && 'Des questions adaptées à ton niveau arrivent dans quelques secondes!'}
      </p>
      <div style={{ marginTop:28, display:'flex', gap:8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:10, height:10, borderRadius:'50%', background: loadingDot===i ? '#FBBF24' : 'rgba(255,255,255,.2)', transition:'background .3s' }} />
        ))}
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  )


  // ── ERROR ────────────────────────────────────────────────────
  if (phase === 'error') return (
    <div style={{ minHeight:'100vh', background:'#0B1F4B', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jakarta)', padding:24 }}>
      <p style={{ fontSize:48, marginBottom:16 }}>😔</p>
      <p style={{ color:'#fff', fontWeight:700, fontSize:16, marginBottom:8, textAlign:'center' }}>Impossible de générer le test. Réessaie!</p>
      <div style={{ display:'flex', gap:10, marginTop:20 }}>
        <button onClick={() => router.push('/home')} style={{ background:'rgba(255,255,255,.1)', border:'none', borderRadius:12, padding:'12px 20px', color:'rgba(255,255,255,.6)', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>Passer pour l'instant</button>
        <button onClick={generateAssessment} style={{ background:'#FBBF24', border:'none', borderRadius:12, padding:'12px 24px', color:'#0B1F4B', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>Réessayer</button>
      </div>
    </div>
  )


  // ── INTRO ────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(145deg, #040D1F, #0B1F4B)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jakarta)', padding:24 }}>
      <div style={{ width:'100%', maxWidth:480, ...wrapStyle }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ animation:'float 3s ease-in-out infinite', display:'inline-block', marginBottom:20 }}>
            <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={120} />
          </div>
          <h1 style={{ fontFamily:'var(--font-fredoka)', color:'#FBBF24', fontSize:32, fontWeight:700, marginBottom:10 }}>
            Test de niveau
          </h1>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:16, lineHeight:1.7, maxWidth:380, margin:'0 auto' }}>
            Bonjour {child?.name}! Je suis {palName}, et je vais t'aider à découvrir ton niveau dans chaque matière.
          </p>
        </div>


        {/* Subject chips */}
        <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:'20px', marginBottom:24 }}>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.6px', margin:'0 0 14px' }}>
            Matières évaluées
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {subjects.map(s => {
              const m = SUBJECT_META[s] || { label: s, icon: '📚', color: '#3B52D4' }
              return (
                <div key={s} style={{ background:`${m.color}22`, border:`1px solid ${m.color}44`, borderRadius:99, padding:'6px 14px', display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:14 }}>{m.icon}</span>
                  <span style={{ color:'#fff', fontSize:12, fontWeight:600 }}>{m.label}</span>
                </div>
              )
            })}
          </div>
        </div>


        {/* Info cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:28 }}>
          {[
            { icon:'❓', label:`${totalQuestions} questions` },
            { icon:'⏱️', label:'~5 minutes' },
            { icon:'⭐', label:'Aucun point requis' },
          ].map((info, i) => (
            <div key={i} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'12px 8px', textAlign:'center' }}>
              <p style={{ fontSize:20, margin:'0 0 6px' }}>{info.icon}</p>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:11, fontWeight:600, margin:0 }}>{info.label}</p>
            </div>
          ))}
        </div>


        <div style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:'14px 18px', marginBottom:24, display:'flex', gap:10, alignItems:'flex-start' }}>
          <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={32} />
          <p style={{ color:'rgba(255,255,255,.65)', fontSize:13, lineHeight:1.6, margin:0, fontStyle:'italic' }}>
            "Il n'y a pas de bonnes ou mauvaises réponses — c'est juste pour mieux te connaître et t'aider à progresser!"
          </p>
        </div>


        <button
          onClick={() => transition('subject_intro')}
          style={{ width:'100%', background:`linear-gradient(135deg, #0B1F4B, ${palette.main})`, border:'none', borderRadius:16, padding:'16px', color:'#FBBF24', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-jakarta)', boxShadow:`0 8px 24px ${palette.glow}` }}
        >
          Commencer le test →
        </button>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  )


  // ── SUBJECT INTRO ────────────────────────────────────────────
  if (phase === 'subject_intro') return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(145deg, #040D1F, #0B1F4B)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jakarta)', padding:24 }}>
      <div style={{ width:'100%', maxWidth:480, textAlign:'center', ...wrapStyle }}>
        <div style={{ width:80, height:80, borderRadius:24, background:`${currentMeta.color}22`, border:`2px solid ${currentMeta.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, margin:'0 auto 24px' }}>
          {currentMeta.icon}
        </div>
        <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:30, fontWeight:700, marginBottom:8 }}>
          {currentMeta.label}
        </h2>
        <p style={{ color:'rgba(255,255,255,.4)', fontSize:15, marginBottom:28 }}>
          {currentQs.length} questions · Matière {subjectIdx + 1} sur {subjects.length}
        </p>


        <div style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:'16px 18px', marginBottom:28, display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ flexShrink:0 }}>
            <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={40} />
          </div>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:14, lineHeight:1.6, margin:0, fontStyle:'italic', textAlign:'left' }}>
            "{subjectIdx === 0
              ? `On commence par ${currentMeta.label}! Lis bien chaque question avant de répondre.`
              : `Super! Maintenant ${currentMeta.label}. Tu gères!`}"
          </p>
        </div>


        <button
          onClick={() => transition('question')}
          style={{ width:'100%', background:`linear-gradient(135deg, #0B1F4B, ${palette.main})`, border:'none', borderRadius:16, padding:'16px', color:'#FBBF24', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}
        >
          C'est parti! →
        </button>
      </div>
    </div>
  )


  // ── QUESTION ─────────────────────────────────────────────────
  if (phase === 'question' && currentQ) return (
    <div style={{ minHeight:'100vh', background:'#0B1F4B', display:'flex', flexDirection:'column', fontFamily:'var(--font-jakarta)' }}>


      {/* Progress bar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, height:4, background:'rgba(255,255,255,.08)', zIndex:10 }}>
        <div style={{ height:'100%', width:`${progressPct}%`, background:palette.main, transition:'width .4s ease', borderRadius:'0 99px 99px 0' }} />
      </div>


      {/* Header */}
      <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,.06)', marginTop:4, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>{currentMeta.icon}</span>
            <span style={{ color:'rgba(255,255,255,.6)', fontSize:13, fontWeight:600 }}>{currentMeta.label}</span>
          </div>
          <div style={{ background:`${currentMeta.color}22`, border:`1px solid ${currentMeta.color}44`, borderRadius:99, padding:'4px 12px' }}>
            <p style={{ color:currentMeta.color, fontSize:11, fontWeight:700, margin:0 }}>
              Question {questionIdx + 1} / {currentQs.length}
            </p>
          </div>
        </div>
      </div>


      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 18px 32px' }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>


          {/* Pal + question */}
          <div style={{ ...wrapStyle, marginBottom:28 }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:16 }}>
              <div style={{ animation:'float 3s ease-in-out infinite', flexShrink:0 }}>
                <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={48} />
              </div>
              <div style={{ flex:1, background:`${palette.main}22`, border:`1px solid ${palette.main}44`, borderRadius:'16px 16px 16px 4px', padding:'14px 16px' }}>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', margin:'0 0 6px' }}>
                  {currentQ.competency}
                </p>
                <p style={{ color:'#fff', fontSize:16, lineHeight:1.65, margin:0, fontWeight:500 }}>
                  {currentQ.question}
                </p>
              </div>
            </div>
          </div>


          {/* Options */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => submitAnswer(opt)}
                style={{
                  background: 'rgba(255,255,255,.07)',
                  border: '2px solid rgba(255,255,255,.12)',
                  borderRadius: 14, padding: '14px 18px',
                  textAlign: 'left', cursor: 'pointer',
                  color: 'rgba(255,255,255,.85)',
                  fontWeight: 600, fontSize: 14,
                  fontFamily: 'var(--font-jakarta)',
                  transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${palette.main}22`; (e.currentTarget as HTMLElement).style.borderColor = palette.main }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.12)' }}
              >
                <span style={{ width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>


      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  )


  // ── FEEDBACK ─────────────────────────────────────────────────
  if (phase === 'feedback' && currentQ) return (
    <div style={{ minHeight:'100vh', background:'#0B1F4B', display:'flex', flexDirection:'column', fontFamily:'var(--font-jakarta)' }}>


      <div style={{ position:'fixed', top:0, left:0, right:0, height:4, background:'rgba(255,255,255,.08)', zIndex:10 }}>
        <div style={{ height:'100%', width:`${progressPct}%`, background:palette.main, transition:'width .4s ease', borderRadius:'0 99px 99px 0' }} />
      </div>


      <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid rgba(255,255,255,.06)', marginTop:4 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>{currentMeta.icon}</span>
            <span style={{ color:'rgba(255,255,255,.6)', fontSize:13, fontWeight:600 }}>{currentMeta.label}</span>
          </div>
          <div style={{ background: isCorrect ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)', border:`1px solid ${isCorrect ? '#22C55E' : '#EF4444'}`, borderRadius:99, padding:'4px 12px' }}>
            <p style={{ color: isCorrect ? '#86EFAC' : '#FCA5A5', fontSize:11, fontWeight:700, margin:0 }}>
              {isCorrect ? '✓ Bonne réponse!' : '✗ Pas tout à fait'}
            </p>
          </div>
        </div>
      </div>


      <div style={{ flex:1, overflowY:'auto', padding:'20px 18px 32px' }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>


          {/* Question recap */}
          <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'14px 16px', marginBottom:16 }}>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, lineHeight:1.6, margin:0 }}>{currentQ.question}</p>
          </div>


          {/* Options with feedback */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {currentQ.options.map((opt, i) => {
              const isCorrectOpt = opt === currentQ.correct
              const isSelected   = opt === selected
              let bg = 'rgba(255,255,255,.04)', border = 'rgba(255,255,255,.08)', color = 'rgba(255,255,255,.5)'
              if (isCorrectOpt)          { bg = 'rgba(34,197,94,.15)';  border = '#22C55E'; color = '#86EFAC' }
              else if (isSelected)       { bg = 'rgba(239,68,68,.15)';  border = '#EF4444'; color = '#FCA5A5' }
              return (
                <div key={i} style={{ background: bg, border:`2px solid ${border}`, borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flexShrink:0, color:'rgba(255,255,255,.4)' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ color, fontWeight: isCorrectOpt ? 700 : 500, fontSize:13 }}>{opt}</span>
                  {isCorrectOpt && <span style={{ marginLeft:'auto', color:'#22C55E', fontSize:16 }}>✓</span>}
                </div>
              )
            })}
          </div>


          {/* Pal reaction */}
          <div style={{ ...wrapStyle, display:'flex', gap:12, alignItems:'flex-start', marginBottom:24 }}>
            <div style={{ flexShrink:0 }}>
              <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={40} />
            </div>
            <div style={{ background: isCorrect ? 'rgba(34,197,94,.1)' : 'rgba(251,191,36,.08)', border:`1px solid ${isCorrect ? 'rgba(34,197,94,.3)' : 'rgba(251,191,36,.2)'}`, borderRadius:'14px 14px 14px 4px', padding:'12px 14px' }}>
              <p style={{ color: isCorrect ? '#86EFAC' : 'rgba(255,255,255,.65)', fontSize:13, lineHeight:1.6, margin:0, fontStyle:'italic' }}>
                {isCorrect
                  ? '"Excellent! Tu as bien compris ce concept."'
                  : `"La bonne réponse était : ${currentQ.correct}. Pas de problème, on continue!"`}
              </p>
            </div>
          </div>


          <button
            onClick={nextQuestion}
            style={{ width:'100%', background:`linear-gradient(135deg, #0B1F4B, ${palette.main})`, border:'none', borderRadius:16, padding:'14px', color:'#FBBF24', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}
          >
            {questionIdx >= currentQs.length - 1 ? 'Voir les résultats →' : 'Question suivante →'}
          </button>
        </div>
      </div>
    </div>
  )


  // ── SUBJECT RESULT ───────────────────────────────────────────
  if (phase === 'subject_result') {
    const score     = subjectScores[currentSubject] || 0
    const total     = currentQs.length
    const level     = getLevel(score, total)
    const levelInfo = LEVEL_META[level]
    return (
      <div style={{ minHeight:'100vh', background:'#0B1F4B', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jakarta)', padding:24 }}>
        <div style={{ width:'100%', maxWidth:480, textAlign:'center', ...wrapStyle }}>
          <div style={{ fontSize:56, marginBottom:16 }}>{levelInfo.icon}</div>
          <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:28, fontWeight:700, marginBottom:6 }}>
            {currentMeta.label}
          </h2>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:levelInfo.bg, borderRadius:99, padding:'8px 20px', marginBottom:20 }}>
            <span style={{ color:levelInfo.color, fontWeight:800, fontSize:15 }}>{levelInfo.label}</span>
          </div>
          <div style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:'20px', marginBottom:24 }}>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:12, margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'.5px', fontWeight:700 }}>Résultat</p>
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:12 }}>
              {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{ width:32, height:32, borderRadius:'50%', background: i < score ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.2)', border:`2px solid ${i < score ? '#22C55E' : '#EF4444'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                  {i < score ? '✓' : '✗'}
                </div>
              ))}
            </div>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, margin:0 }}>{score} / {total} correctes</p>
          </div>


          <div style={{ display:'flex', gap:12, alignItems:'flex-start', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:'14px 16px', marginBottom:24 }}>
            <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={36} />
            <p style={{ color:'rgba(255,255,255,.65)', fontSize:13, lineHeight:1.6, margin:0, fontStyle:'italic', textAlign:'left' }}>
              {level === 'avance'
                ? '"Impressionnant! Tu maîtrises vraiment bien cette matière."'
                : level === 'intermediaire'
                ? '"Bon travail! Je vais t\'aider à progresser encore plus."'
                : '"On va construire des bases solides ensemble. Tu vas y arriver!"'}
            </p>
          </div>


          <button
            onClick={nextSubject}
            style={{ width:'100%', background:`linear-gradient(135deg, #0B1F4B, ${palette.main})`, border:'none', borderRadius:16, padding:'16px', color:'#FBBF24', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}
          >
            {subjectIdx >= subjects.length - 1 ? 'Voir le bilan complet →' : `Continuer avec ${SUBJECT_META[subjects[subjectIdx + 1]]?.label || 'la suite'} →`}
          </button>
        </div>
      </div>
    )
  }


  // ── COMPLETE ─────────────────────────────────────────────────
  if (phase === 'complete') return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(145deg, #040D1F, #0B1F4B)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-jakarta)', padding:24, overflowY:'auto' }}>
      <div style={{ width:'100%', maxWidth:480, ...wrapStyle }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ animation:'float 2s ease-in-out infinite', display:'inline-block', marginBottom:16 }}>
            <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={100} />
          </div>
          <h1 style={{ fontFamily:'var(--font-fredoka)', color:'#FBBF24', fontSize:30, fontWeight:700, marginBottom:8 }}>
            Test terminé!
          </h1>
          <p style={{ color:'rgba(255,255,255,.55)', fontSize:15, margin:0 }}>
            Voici ton profil d'apprentissage, {child?.name}
          </p>
        </div>


        {/* Results per subject */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
          {results.map(r => {
            const m    = SUBJECT_META[r.subject] || { label: r.subject, icon: '📚', color: '#3B52D4' }
            const info = LEVEL_META[r.level]
            return (
              <div key={r.subject} style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:`${m.color}22`, border:`1px solid ${m.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                  {m.icon}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ color:'#fff', fontWeight:700, fontSize:14, margin:'0 0 3px' }}>{m.label}</p>
                  <p style={{ color:'rgba(255,255,255,.35)', fontSize:12, margin:0 }}>{r.score} / {r.total} correctes</p>
                </div>
                <div style={{ background:info.bg, borderRadius:99, padding:'5px 12px', flexShrink:0 }}>
                  <p style={{ color:info.color, fontWeight:800, fontSize:12, margin:0 }}>{info.icon} {info.label}</p>
                </div>
              </div>
            )
          })}
        </div>


        <div style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', borderRadius:16, padding:'14px 18px', marginBottom:24, display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
          <p style={{ color:'rgba(255,255,255,.55)', fontSize:13, margin:0, lineHeight:1.6 }}>
            {palName} va adapter les exercices à ton niveau dans chaque matière. Tu progresseras à ton propre rythme!
          </p>
        </div>


        <button
          onClick={finishAssessment}
          disabled={saving}
          style={{ width:'100%', background: saving ? 'rgba(255,255,255,.1)' : '#FBBF24', border:'none', borderRadius:16, padding:'16px', color: saving ? 'rgba(255,255,255,.3)' : '#0B1F4B', fontSize:16, fontWeight:800, cursor: saving ? 'default' : 'pointer', fontFamily:'var(--font-jakarta)' }}
        >
          {saving ? 'Sauvegarde...' : `Commencer avec ${palName}! 🚀`}
        </button>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  )


  return null
}
