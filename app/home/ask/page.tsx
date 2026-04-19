'use client'
import { useState, useEffect, useRef } from 'react'
import { useChild } from '@/lib/ChildContext'
import { supabase } from '@/lib/supabase'
import { PalSVG } from '@/lib/pal-svg'
import { useLang } from '../layout'

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

const SUBJECTS = ['Mathématiques', 'Français', 'Sciences', 'Histoire', 'Anglais', 'Finances', 'Autre']

const TECHNIQUES = [
  { id: 'socratic',  labelFr: 'Socratique',  labelCr: 'Sokrat',  icon: '🔍', descFr: 'Découvre par toi-même',   descCr: 'Dekouvri pou kont ou'   },
  { id: 'feynman',   labelFr: 'Feynman',      labelCr: 'Feynman', icon: '🧠', descFr: 'Explique comme un prof',  descCr: 'Eksplike tankou pwofesè' },
  { id: 'recall',    labelFr: 'Rappel actif', labelCr: 'Souvni',  icon: '💡', descFr: 'Teste ta mémoire',        descCr: 'Teste memwa ou'          },
  { id: 'pomodoro',  labelFr: 'Pomodoro',     labelCr: 'Pomodoro',icon: '⏱️', descFr: 'Focus 25 minutes',        descCr: 'Fokis 25 minit'          },
]

const MUSIC: Record<string, { url: string; label: string }> = {
  brave:   { url: 'https://www.youtube.com/embed/videoseries?list=PLGdBvXL8ynW_8wHZn9bxFGkLFIkFyGUhm&autoplay=1', label: 'Energetic Lo-Fi 🔥' },
  curious: { url: 'https://www.youtube.com/embed/videoseries?list=PLGdBvXL8ynW8A34rSqjvLtzPblMuEapHv&autoplay=1', label: 'Ambient Nature 🌿'   },
  funny:   { url: 'https://www.youtube.com/embed/videoseries?list=PLGdBvXL8ynW-QqMIFcN3KIKFnSp2fHbDL&autoplay=1', label: 'Chill Hop 😄'        },
  calm:    { url: 'https://www.youtube.com/embed/videoseries?list=PLGdBvXL8ynW9zC2UnAKqBBHBMbAtKkFGN&autoplay=1', label: 'Soft Piano 🌊'       },
}

const T = {
  fr: {
    title: 'Demande à', subtitle: 'Choisis un sujet et une technique',
    subject: 'Matière', technique: "Technique d'étude",
    startSession: 'Commencer la session →',
    typeMessage: 'Pose ta question...',
    endSession: 'Terminer la session',
    sessionSaved: 'Session sauvegardée! +',
    points: 'pts ⭐',
    pomodoroLabel: 'Focus',
    musicLabel: 'Musique de focus',
  },
  cr: {
    title: 'Mande', subtitle: 'Chwazi yon sijè ak yon teknik',
    subject: 'Sijè', technique: 'Teknik etid',
    startSession: 'Kòmanse sesyon →',
    typeMessage: 'Poze kesyon ou...',
    endSession: 'Fini sesyon',
    sessionSaved: 'Sesyon sove! +',
    points: 'pwen ⭐',
    pomodoroLabel: 'Fokis',
    musicLabel: 'Mizik fokis',
  }
}

const POMODORO = 25 * 60

type Message = { role: 'user' | 'assistant'; content: string }

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#FBBF24', fontWeight: 800 }}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}



export default function AskPage() {
  const { child }  = useChild()
  const { lang }   = useLang()
  const t          = T[lang]
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [phase, setPhase]             = useState<'setup' | 'chat'>('setup')
  const [subject, setSubject]         = useState(SUBJECTS[0])
  const [technique, setTechnique]     = useState('socratic')
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [elapsed, setElapsed]         = useState(0)
  const [showMusic, setShowMusic]     = useState(false)
  const [isWide, setIsWide]           = useState(false)
  const [ptsEarned, setPtsEarned]     = useState(0)
  const [sessionDone, setSessionDone] = useState(false)

  const pomodoroLeft = Math.max(0, POMODORO - elapsed)
  const pomodoroMins = String(Math.floor(pomodoroLeft / 60)).padStart(2, '0')
  const pomodoroSecs = String(pomodoroLeft % 60).padStart(2, '0')

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!sessionStart) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStart])

  if (!child) return null

  const palette     = PALETTES[child.pal?.palette || 'ocean']
  const palName     = child.pal?.name || '...'
  const personality = child.personality || 'curious'

  const startSession = () => {
    const greeting = lang === 'fr'
      ? `Bonjour! Je suis ${palName}, ton compagnon d'apprentissage. On travaille sur **${subject}** aujourd'hui avec la technique **${TECHNIQUES.find(tech => tech.id === technique)?.labelFr}**. Qu'est-ce qu'on explore? 🎯`
      : `Bonjou! Mwen se ${palName}, konpayon aprantisaj ou. Nou ap travay sou **${subject}** jodi a. Kisa ou vle eksplore? 🎯`

    setMessages([{ role: 'assistant', content: greeting }])
    setElapsed(0)
    setSessionStart(null)
    setPtsEarned(0)
    setSessionDone(false)
    setPhase('chat')
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    // Start timer on first message
    if (!sessionStart) {
      setSessionStart(new Date())
      setElapsed(0)
    }

    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, palName, personality, technique, subject, lang }),
      })
      const data = await res.json()
      if (data.message) {
        setMessages(m => [...m, { role: 'assistant', content: data.message }])
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const endSession = async () => {
    if (!child || !sessionStart) return
    const durationMins   = Math.max(1, Math.floor(elapsed / 60))
    const completedFull  = elapsed >= POMODORO
    const pts            = completedFull ? 50 : 0

    await supabase.from('study_sessions').insert({
      child_id:      child.id,
      subject,
      technique,
      duration_mins: durationMins,
      points_earned: pts,
    })

    if (pts > 0) {
      const { data: existing } = await supabase
        .from('points').select('total').eq('child_id', child.id).single()
      if (existing) {
        await supabase.from('points').update({ total: existing.total + pts }).eq('child_id', child.id)
      } else {
        await supabase.from('points').insert({ child_id: child.id, total: pts })
      }
    }

    setPtsEarned(pts)
    setSessionDone(true)
    setSessionStart(null)
  }

  // ── SETUP SCREEN ────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div style={{ minHeight: '100%', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>
      <div style={{ background: 'linear-gradient(160deg, #0B1F4B, #13306B)', padding: isWide ? '32px 32px 36px' : '24px 20px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ animation: 'float 3s ease-in-out infinite' }}>
            <PalSVG
              creature={child.pal?.creature || 'land'}
              shape={child.pal?.bodyShape || 'round'}
              palette={palette}
              feature={child.pal?.feature || 'eyes'}
              size={72}
            />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: isWide ? 32 : 26, fontWeight: 700 }}>
              {t.title} {palName}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14 }}>{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: isWide ? '28px 32px' : '20px 18px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Subject */}
        <div>
          <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            {t.subject}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)} style={{
                padding: '9px 18px', borderRadius: 99,
                background: subject === s ? '#0B1F4B' : '#fff',
                color: subject === s ? '#FBBF24' : '#64748B',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                border: `1.5px solid ${subject === s ? '#0B1F4B' : '#E2E8F0'}`,
                fontFamily: 'var(--font-jakarta)', transition: 'all .15s',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Technique */}
        <div>
          <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            {t.technique}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TECHNIQUES.map(tech => (
              <button key={tech.id} onClick={() => setTechnique(tech.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                background: technique === tech.id ? 'rgba(59,82,212,.08)' : '#fff',
                border: `1.5px solid ${technique === tech.id ? palette.main : '#E2E8F0'}`,
                textAlign: 'left', transition: 'all .15s',
                fontFamily: 'var(--font-jakarta)',
              }}>
                <span style={{ fontSize: 24 }}>{tech.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 13 }}>
                    {lang === 'fr' ? tech.labelFr : tech.labelCr}
                  </p>
                  <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>
                    {lang === 'fr' ? tech.descFr : tech.descCr}
                  </p>
                </div>
                {technique === tech.id && (
                  <span style={{ color: palette.main, fontSize: 16, flexShrink: 0 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Music */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '16px 18px', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#F4F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            🎵
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 14 }}>{t.musicLabel}</p>
            <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{MUSIC[personality]?.label}</p>
          </div>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E' }} />
        </div>

        {/* Points rule */}
        <div style={{ background: '#FEF3C7', borderRadius: 16, padding: '14px 18px', border: '1.5px solid #FBBF24', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 22 }}>⭐</span>
          <p style={{ color: '#92400E', fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
            Complete un Pomodoro entier (25 min) pour gagner <strong>50 points</strong>. Les sessions plus courtes ne donnent pas de points.
          </p>
        </div>

        <button onClick={startSession} style={{
          width: '100%', padding: '16px',
          background: `linear-gradient(135deg, #0B1F4B, ${palette.main})`,
          color: '#FBBF24', border: 'none', borderRadius: 16,
          fontWeight: 800, fontSize: 16, cursor: 'pointer',
          fontFamily: 'var(--font-jakarta)',
          boxShadow: `0 8px 24px ${palette.glow}`,
        }}>
          {t.startSession}
        </button>
      </div>

      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  )

  // ── CHAT SCREEN ─────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0B1F4B', fontFamily: 'var(--font-jakarta)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0B1F4B, #13306B)', padding: '14px 18px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => { setPhase('setup'); setMessages([]) }}
            style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.5)', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-jakarta)' }}
          >
            ←
          </button>

          <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
            <PalSVG
              creature={child.pal?.creature || 'land'}
              shape={child.pal?.bodyShape || 'round'}
              palette={palette}
              feature={child.pal?.feature || 'eyes'}
              size={38}
            />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-fredoka)' }}>{palName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>
                {subject} · {TECHNIQUES.find(tech => tech.id === technique)?.labelFr}
              </span>
            </div>
          </div>

          {/* Pomodoro timer — only shows after first message */}
          {sessionStart && (
            <div style={{
              background: pomodoroLeft === 0 ? 'rgba(34,197,94,.2)' : 'rgba(251,191,36,.15)',
              border: `1px solid ${pomodoroLeft === 0 ? '#22C55E' : '#FBBF24'}`,
              borderRadius: 12, padding: '6px 12px', textAlign: 'center', flexShrink: 0,
            }}>
              <p style={{ color: pomodoroLeft === 0 ? '#22C55E' : '#FBBF24', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-fredoka)', lineHeight: 1 }}>
                {pomodoroLeft === 0 ? '🎉 +50' : `${pomodoroMins}:${pomodoroSecs}`}
              </p>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 9, fontWeight: 700, marginTop: 2 }}>
                {pomodoroLeft === 0 ? 'TERMINÉ!' : t.pomodoroLabel.toUpperCase()}
              </p>
            </div>
          )}

          {/* Music toggle */}
          <button
            onClick={() => setShowMusic(m => !m)}
            style={{
              background: showMusic ? 'rgba(34,197,94,.2)' : 'rgba(255,255,255,.08)',
              border: `1px solid ${showMusic ? '#22C55E' : 'rgba(255,255,255,.1)'}`,
              borderRadius: 10, padding: '7px 10px', cursor: 'pointer',
              fontSize: 16, color: showMusic ? '#22C55E' : 'rgba(255,255,255,.5)',
              flexShrink: 0,
            }}
          >
            🎵
          </button>
        </div>

        {showMusic && (
          <div style={{ marginTop: 10 }}>
            <iframe
              src={MUSIC[personality]?.url}
              width="100%" height="60"
              style={{ borderRadius: 10, border: 'none' }}
              allow="autoplay"
            />
          </div>
        )}
      </div>

      {/* Session done banner */}
      {sessionDone && (
        <div style={{ background: ptsEarned > 0 ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : '#FEF3C7', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <p style={{ fontWeight: 700, color: ptsEarned > 0 ? '#065F46' : '#92400E', fontSize: 14 }}>
            {ptsEarned > 0
              ? `${t.sessionSaved}${ptsEarned} ${t.points}`
              : '⏱️ Complète 25 min pour gagner des points la prochaine fois!'
            }
          </p>
          <button
            onClick={() => { setPhase('setup'); setMessages([]); setSessionDone(false) }}
            style={{ background: ptsEarned > 0 ? '#065F46' : '#92400E', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}
          >
            Nouvelle session
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
            {msg.role === 'assistant' && (
              <div style={{ flexShrink: 0, marginBottom: 2 }}>
                <PalSVG
                  creature={child.pal?.creature || 'land'}
                  shape={child.pal?.bodyShape || 'round'}
                  palette={palette}
                  feature={child.pal?.feature || 'eyes'}
                  size={28}
                />
              </div>
            )}
            <div style={{
              maxWidth: '78%', padding: '11px 15px', borderRadius: 18,
              borderBottomLeftRadius:  msg.role === 'assistant' ? 4 : 18,
              borderBottomRightRadius: msg.role === 'user'      ? 4 : 18,
              background: msg.role === 'assistant' ? 'rgba(59,82,212,.3)' : '#FBBF24',
              border:     msg.role === 'assistant' ? '1px solid rgba(59,82,212,.3)' : 'none',
              color:      msg.role === 'assistant' ? 'rgba(255,255,255,.9)' : '#0B1F4B',
              fontSize: 14, lineHeight: 1.6,
              fontWeight: msg.role === 'user' ? 600 : 400,
            }}>
              {renderMarkdown(msg.content)}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ flexShrink: 0 }}>
              <PalSVG
                creature={child.pal?.creature || 'land'}
                shape={child.pal?.bodyShape || 'round'}
                palette={palette}
                feature={child.pal?.feature || 'eyes'}
                size={28}
              />
            </div>
            <div style={{ background: 'rgba(59,82,212,.3)', border: '1px solid rgba(59,82,212,.3)', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 5 }}>
              {[0,1,2].map(n => (
                <div key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,.4)', animation: `typing 1.2s ${n * .2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: '10px 14px 20px', background: '#0B1F4B', borderTop: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
        {!sessionDone && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={t.typeMessage}
              style={{
                flex: 1, background: 'rgba(255,255,255,.08)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 16, padding: '12px 16px',
                color: '#fff', fontSize: 14,
                fontFamily: 'var(--font-jakarta)', outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 46, height: 46, borderRadius: 14, border: 'none',
                background: input.trim() ? '#FBBF24' : 'rgba(255,255,255,.08)',
                color: input.trim() ? '#0B1F4B' : 'rgba(255,255,255,.3)',
                fontSize: 18, cursor: input.trim() ? 'pointer' : 'default',
                flexShrink: 0, transition: 'all .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ↑
            </button>
          </div>
        )}

        <button
          onClick={endSession}
          disabled={sessionDone || !sessionStart}
          style={{
            width: '100%', padding: '11px',
            background: sessionDone || !sessionStart
              ? 'rgba(255,255,255,.05)'
              : elapsed >= POMODORO
                ? 'rgba(34,197,94,.15)'
                : 'rgba(239,68,68,.15)',
            color: sessionDone || !sessionStart
              ? 'rgba(255,255,255,.2)'
              : elapsed >= POMODORO
                ? '#86EFAC'
                : '#FCA5A5',
            border: `1px solid ${
              sessionDone || !sessionStart
                ? 'rgba(255,255,255,.05)'
                : elapsed >= POMODORO
                  ? 'rgba(34,197,94,.2)'
                  : 'rgba(239,68,68,.2)'
            }`,
            borderRadius: 12, fontWeight: 700, fontSize: 13,
            cursor: sessionDone || !sessionStart ? 'default' : 'pointer',
            fontFamily: 'var(--font-jakarta)',
          }}
        >
          {!sessionStart
            ? 'Envoie un message pour démarrer le timer'
            : sessionDone
              ? 'Session terminée'
              : elapsed >= POMODORO
                ? `Terminer · +50 pts ⭐ · ${Math.floor(elapsed / 60)}min`
                : `${t.endSession} · ${Math.floor(elapsed / 60)}min · (25min = points)`
          }
        </button>
      </div>

      <style>{`
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes typing { 0%,60%,100%{transform:translateY(0);opacity:.3} 30%{transform:translateY(-5px);opacity:1} }
      `}</style>
    </div>
  )
}

