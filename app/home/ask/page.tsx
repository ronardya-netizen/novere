'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useChild } from '@/lib/ChildContext'
import { supabase } from '@/lib/supabase'
import { PalSVG } from '@/lib/pal-svg'
import { useLang } from '../layout'
import {
  getTopicsForGrade,
  getSubjectLabel,
  type Subject,
  type GradeLevel,
  ALL_SUBJECTS,
} from '@/lib/curriculum'

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

const CREATURE_THEMES: Record<string, { world: string; obstacles: string[]; bg: string; ground: string }> = {
  land:   { world: 'Forêt',  obstacles: ['🪨','🌲','🍄'], bg: '#1a3a1a', ground: '#2d5a1b' },
  sea:    { world: 'Océan',  obstacles: ['🪼','🦈','🐚'], bg: '#0a1628', ground: '#1a4a6b' },
  sky:    { world: 'Ciel',   obstacles: ['⛅','⚡','🌪️'], bg: '#1a2a4a', ground: '#4a7ab5' },
  cosmic: { world: 'Cosmos', obstacles: ['☄️','🌑','💫'], bg: '#0a0a1a', ground: '#1a0a3a' },
}

const SUBJECT_CONFIG: Record<Subject, { emoji: string; shortLabel: string }> = {
  mathematiques: { emoji: '🔢', shortLabel: 'Maths'    },
  francais:      { emoji: '📖', shortLabel: 'Français'  },
  histoire:      { emoji: '🏛️', shortLabel: 'Histoire'  },
  sciences:      { emoji: '🔬', shortLabel: 'Sciences'  },
}

const T = {
  fr: {
    title: 'Demande à', subtitle: 'Choisis une matière et commence',
    subject: 'Matière', topic: 'Chapitre',
    topicOptional: '(optionnel)', topicHint: 'Quel chapitre travailles-tu?',
    topicGeneral: 'Général',
    startSession: 'Commencer la session →',
    typeMessage: 'Pose ta question...',
    endSession: 'Terminer la session',
    sessionSaved: 'Session sauvegardée! +', points: 'pts ⭐',
    pomodoroLabel: 'Focus',
    saveFlashcard: 'Sauvegarder en flashcard',
    flashcardSaved: '✓ Flashcard sauvegardée!',
    flashcardsTitle: 'Mes flashcards',
    noFlashcards: 'Pas encore de flashcards. Sauvegarde une réponse pendant ta session!',
    back: 'Réponse',
    breakTitle: 'Pause de 5 minutes! 🎉',
    breakSub: 'Tu as complété un Pomodoro! Joue un peu avant de continuer.',
    breakContinue: 'Continuer la session →',
    breakScore: 'Score',
  },
  cr: {
    title: 'Mande', subtitle: 'Chwazi yon sijè epi kòmanse',
    subject: 'Sijè', topic: 'Chapit',
    topicOptional: '(opsyonèl)', topicHint: 'Ki chapit ou ap travay sou li?',
    topicGeneral: 'Jeneral',
    startSession: 'Kòmanse sesyon →',
    typeMessage: 'Poze kesyon ou...',
    endSession: 'Fini sesyon',
    sessionSaved: 'Sesyon sove! +', points: 'pwen ⭐',
    pomodoroLabel: 'Fokis',
    saveFlashcard: 'Sove kòm flashcard',
    flashcardSaved: '✓ Flashcard sove!',
    flashcardsTitle: 'Flashcard mwen yo',
    noFlashcards: 'Pa gen flashcard ankò.',
    back: 'Repons',
    breakTitle: 'Repo 5 minit! 🎉',
    breakSub: 'Ou fini yon Pomodoro! Jwe yon ti kras anvan ou kontinye.',
    breakContinue: 'Kontinye sesyon →',
    breakScore: 'Pwen',
  },
}

const POMODORO     = 25 * 60
const BREAK_TIME   = 5  * 60
const GRACE_PERIOD = 3  * 60  // 3 minutes in seconds
const GAME_TYPES   = ['memory', 'dodge', 'tap', 'breathe'] as const
type GameType = typeof GAME_TYPES[number]

type Message = {
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string
  shortAnswer?: string
  imagePrompt?: string
  savedAsFlashcard?: boolean
}

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#FBBF24', fontWeight: 800 }}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function buildImageUrl(prompt: string): string {
  const encoded = encodeURIComponent(prompt + ', children illustration, colorful, safe for kids, no text')
  return `https://image.pollinations.ai/prompt/${encoded}?width=400&height=300&nologo=true`
}

// ── MEMORY GAME ───────────────────────────────────────────────────
function MemoryGame({ creature, palette, palName, onComplete }: { creature: string; palette: any; palName: string; onComplete: (score: number) => void }) {
  const theme = CREATURE_THEMES[creature] || CREATURE_THEMES.land
  const baseEmojis = [...theme.obstacles, '⭐', '🎯', '🏆', '💎']
  const pairs = [...baseEmojis.slice(0, 6), ...baseEmojis.slice(0, 6)]
  const [cards] = useState(() => pairs.map((e, i) => ({ id: i, emoji: e })).sort(() => Math.random() - 0.5))
  const [flipped, setFlipped]   = useState<number[]>([])
  const [matched, setMatched]   = useState<number[]>([])
  const [moves, setMoves]       = useState(0)
  const [checking, setChecking] = useState(false)

  const flip = (id: number) => {
    if (checking || flipped.includes(id) || matched.includes(id)) return
    if (flipped.length === 1) {
      const newFlipped = [...flipped, id]
      setFlipped(newFlipped)
      setMoves(m => m + 1)
      setChecking(true)
      const [a, b] = [cards.find(c => c.id === flipped[0])!, cards.find(c => c.id === id)!]
      setTimeout(() => {
        if (a.emoji === b.emoji) {
          const newMatched = [...matched, a.id, b.id]
          setMatched(newMatched)
          setFlipped([])
          if (newMatched.length === cards.length) onComplete(Math.max(100 - moves * 5, 10))
        } else setFlipped([])
        setChecking(false)
      }, 800)
    } else setFlipped([id])
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, marginBottom: 16 }}>
        {palName} te défie! Trouve toutes les paires 🃏 · {moves} coups
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxWidth: 320, margin: '0 auto' }}>
        {cards.map(card => {
          const isVisible = flipped.includes(card.id) || matched.includes(card.id)
          return (
            <div key={card.id} onClick={() => flip(card.id)} style={{
              width: '100%', aspectRatio: '1', borderRadius: 12,
              background: isVisible ? palette.main : 'rgba(255,255,255,.1)',
              border: `2px solid ${isVisible ? palette.accent : 'rgba(255,255,255,.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, cursor: 'pointer', transition: 'all .2s',
              opacity: matched.includes(card.id) ? .5 : 1,
            }}>
              {isVisible ? card.emoji : '?'}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── DODGE GAME ────────────────────────────────────────────────────
function DodgeGame({ creature, palette, palName, onComplete }: { creature: string; palette: any; palName: string; onComplete: (score: number) => void }) {
  const theme = CREATURE_THEMES[creature] || CREATURE_THEMES.land
  const [palY, setPalY]           = useState(60)
  const [obstacles, setObstacles] = useState<{ x: number; emoji: string; id: number }[]>([])
  const [score, setScore]         = useState(0)
  const [alive, setAlive]         = useState(true)
  const [started, setStarted]     = useState(false)
  const frameRef  = useRef<any>(null)
  const obsRef    = useRef(obstacles)
  const palYRef   = useRef(palY)
  const scoreRef  = useRef(0)
  obsRef.current  = obstacles
  palYRef.current = palY

  const jump = useCallback(() => {
    if (!started) { setStarted(true); return }
    if (!alive) return
    setPalY(20)
    setTimeout(() => setPalY(60), 500)
  }, [alive, started])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); jump() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [jump])

  useEffect(() => {
    if (!started || !alive) return
    const obstacleInterval = setInterval(() => {
      setObstacles(prev => [...prev, { x: 100, emoji: theme.obstacles[Math.floor(Math.random() * theme.obstacles.length)], id: Date.now() }])
    }, 1800)
    return () => clearInterval(obstacleInterval)
  }, [started, alive, theme])

  useEffect(() => {
    if (!started || !alive) return
    frameRef.current = setInterval(() => {
      setObstacles(prev => {
        const updated = prev.map(o => ({ ...o, x: o.x - 3 })).filter(o => o.x > -10)
        for (const obs of updated) {
          if (obs.x < 18 && obs.x > 5 && palYRef.current > 45) {
            setAlive(false)
            clearInterval(frameRef.current)
            setTimeout(() => onComplete(scoreRef.current), 1500)
            return updated
          }
        }
        return updated
      })
      scoreRef.current += 1
      setScore(s => s + 1)
    }, 50)
    return () => clearInterval(frameRef.current)
  }, [started, alive, onComplete])

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, marginBottom: 8 }}>
        {!started ? 'Appuie pour commencer!' : `Score: ${score}`}
      </p>
      <div onClick={jump} style={{
        width: '100%', maxWidth: 360, height: 120, margin: '0 auto',
        background: theme.bg, borderRadius: 16, position: 'relative',
        overflow: 'hidden', cursor: 'pointer', border: `2px solid ${palette.main}`,
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, background: theme.ground, borderRadius: '0 0 14px 14px' }} />
        <div style={{ position: 'absolute', left: '8%', fontSize: 28, transition: 'bottom .15s ease', bottom: `${100 - palY}%` }}>
          {alive ? '🙂' : '😵'}
        </div>
        {obstacles.map(obs => (
          <div key={obs.id} style={{ position: 'absolute', bottom: 24, left: `${obs.x}%`, fontSize: 24 }}>{obs.emoji}</div>
        ))}
        {!started && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)', borderRadius: 14 }}>
            <p style={{ color: '#FBBF24', fontWeight: 800, fontSize: 16 }}>Appuie / Espace pour sauter!</p>
          </div>
        )}
      </div>
      <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginTop: 8 }}>
        {palName} doit éviter les obstacles du {theme.world}!
      </p>
    </div>
  )
}

// ── TAP GAME ──────────────────────────────────────────────────────
function TapGame({ creature, palette, palName, onComplete }: { creature: string; palette: any; palName: string; onComplete: (score: number) => void }) {
  const theme = CREATURE_THEMES[creature] || CREATURE_THEMES.land
  const [targets, setTargets]   = useState<{ id: number; x: number; y: number; emoji: string }[]>([])
  const [score, setScore]       = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [started, setStarted]   = useState(false)
  const doneRef  = useRef(false)
  const scoreRef = useRef(0)

  useEffect(() => {
    if (!started) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          if (!doneRef.current) { doneRef.current = true; setTimeout(() => onComplete(scoreRef.current), 500) }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [started, onComplete])

  useEffect(() => {
    if (!started || timeLeft === 0) return
    const spawn = setInterval(() => {
      setTargets(prev => [...prev.slice(-6), {
        id: Date.now(), x: 5 + Math.random() * 80, y: 10 + Math.random() * 70,
        emoji: theme.obstacles[Math.floor(Math.random() * theme.obstacles.length)],
      }])
    }, 800)
    return () => clearInterval(spawn)
  }, [started, timeLeft, theme])

  const hit = (id: number) => {
    setTargets(prev => prev.filter(t => t.id !== id))
    scoreRef.current += 10
    setScore(s => s + 10)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '0 8px' }}>
        <p style={{ color: '#FBBF24', fontWeight: 700, fontSize: 14 }}>Score: {score}</p>
        <p style={{ color: timeLeft <= 10 ? '#EF4444' : 'rgba(255,255,255,.6)', fontWeight: 700, fontSize: 14 }}>{timeLeft}s</p>
      </div>
      <div onClick={() => !started && setStarted(true)} style={{
        width: '100%', maxWidth: 360, height: 200, margin: '0 auto',
        background: theme.bg, borderRadius: 16, position: 'relative',
        overflow: 'hidden', cursor: started ? 'default' : 'pointer',
        border: `2px solid ${palette.main}`,
      }}>
        {!started ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#FBBF24', fontWeight: 800, fontSize: 16 }}>Appuie pour commencer!</p>
          </div>
        ) : timeLeft === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
            <p style={{ color: '#FBBF24', fontWeight: 800, fontSize: 20 }}>Terminé! 🎉</p>
            <p style={{ color: '#fff', fontSize: 16 }}>Score: {score}</p>
          </div>
        ) : targets.map(tgt => (
          <div key={tgt.id} onClick={() => hit(tgt.id)} style={{
            position: 'absolute', left: `${tgt.x}%`, top: `${tgt.y}%`,
            fontSize: 28, cursor: 'pointer', userSelect: 'none',
            transform: 'translate(-50%, -50%)',
          }}>
            {tgt.emoji}
          </div>
        ))}
      </div>
      <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginTop: 8 }}>
        Attrape les créatures du {theme.world} de {palName}!
      </p>
    </div>
  )
}

// ── BREATHE GAME ──────────────────────────────────────────────────
function BreatheGame({ palette, palName, onComplete }: { creature: string; palette: any; palName: string; onComplete: (score: number) => void }) {
  const [phase, setPhase]   = useState<'inhale'|'hold'|'exhale'>('inhale')
  const [count, setCount]   = useState(4)
  const [cycles, setCycles] = useState(0)
  const TOTAL = 4

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => {
            if (p === 'inhale') { setCount(4); return 'hold' }
            if (p === 'hold')   { setCount(6); return 'exhale' }
            setCycles(cy => {
              if (cy + 1 >= TOTAL) { clearInterval(timer); setTimeout(() => onComplete(100), 500) }
              return cy + 1
            })
            setCount(4); return 'inhale'
          })
          return c
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onComplete])

  const size  = phase === 'exhale' ? 60 : 120
  const label = phase === 'inhale' ? 'Inspire...' : phase === 'hold' ? 'Retiens...' : 'Expire...'
  const color = phase === 'inhale' ? palette.main : phase === 'hold' ? palette.accent : '#22C55E'

  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, marginBottom: 20 }}>
        {palName} t'accompagne 🌬️ · {TOTAL - cycles} cycles restants
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: `radial-gradient(circle, ${color}44, ${color}11)`,
          border: `3px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 1s ease', boxShadow: `0 0 ${size/2}px ${color}44`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 28, fontFamily: 'var(--font-fredoka)' }}>{count}</p>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 11 }}>{label}</p>
          </div>
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>Inspire 4s · Retiens 4s · Expire 6s</p>
    </div>
  )
}

// ── BREAK OVERLAY ─────────────────────────────────────────────────
function BreakOverlay({ creature, palette, palName, lang, t, onFinish }: {
  creature: string; palette: any; palName: string;
  lang: 'fr'|'cr'; t: typeof T['fr']; onFinish: () => void
}) {
  const [game]      = useState<GameType>(() => GAME_TYPES[Math.floor(Math.random() * GAME_TYPES.length)])
  const [breakLeft, setBreakLeft] = useState(BREAK_TIME)
  const [gameScore, setGameScore] = useState<number|null>(null)
  const [gameDone, setGameDone]   = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setBreakLeft(t => { if (t <= 1) { clearInterval(timer); return 0 } return t - 1 })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const breakMins = String(Math.floor(breakLeft / 60)).padStart(2, '0')
  const breakSecs = String(breakLeft % 60).padStart(2, '0')

  const gameNames: Record<GameType, string> = {
    memory: '🃏 Carte mémoire', dodge: '🚀 Évite les obstacles',
    tap: '🎯 Clique vite', breathe: '🌬️ Respiration guidée',
  }

  const handleGameComplete = (score: number) => { setGameScore(score); setGameDone(true) }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: `linear-gradient(160deg, #0B1F4B 0%, ${palette.main}33 100%)`,
      display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-jakarta)',
      animation: 'slideUp .4s ease',
    }}>
      <div style={{ padding: '20px 20px 16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ background: 'rgba(34,197,94,.2)', border: '1px solid #22C55E', borderRadius: 99, padding: '4px 14px' }}>
            <span style={{ color: '#22C55E', fontWeight: 800, fontSize: 13 }}>🎉 +50 pts gagnés!</span>
          </div>
          <div style={{ background: 'rgba(251,191,36,.15)', border: '1px solid #FBBF24', borderRadius: 99, padding: '4px 14px' }}>
            <span style={{ color: '#FBBF24', fontWeight: 800, fontSize: 13 }}>⏱ {breakMins}:{breakSecs}</span>
          </div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{t.breakTitle}</h2>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>{gameNames[game]}</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {!gameDone ? (
          <>
            {game === 'memory'  && <MemoryGame  creature={creature} palette={palette} palName={palName} onComplete={handleGameComplete} />}
            {game === 'dodge'   && <DodgeGame   creature={creature} palette={palette} palName={palName} onComplete={handleGameComplete} />}
            {game === 'tap'     && <TapGame     creature={creature} palette={palette} palName={palName} onComplete={handleGameComplete} />}
            {game === 'breathe' && <BreatheGame creature={creature} palette={palette} palName={palName} onComplete={handleGameComplete} />}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🎊</p>
            <h3 style={{ fontFamily: 'var(--font-fredoka)', color: '#FBBF24', fontSize: 28, marginBottom: 8 }}>Bien joué!</h3>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, marginBottom: 4 }}>
              {t.breakScore}: <strong style={{ color: '#fff' }}>{gameScore}</strong>
            </p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>{palName} est fier de toi! 🌟</p>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 16px 24px', flexShrink: 0 }}>
        <button onClick={onFinish} disabled={!gameDone && breakLeft > 0} style={{
          width: '100%', padding: '14px',
          background: gameDone || breakLeft === 0 ? `linear-gradient(135deg, #0B1F4B, ${palette.main})` : 'rgba(255,255,255,.08)',
          color: gameDone || breakLeft === 0 ? '#FBBF24' : 'rgba(255,255,255,.3)',
          border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 15,
          cursor: gameDone || breakLeft === 0 ? 'pointer' : 'default',
          fontFamily: 'var(--font-jakarta)', transition: 'all .2s',
        }}>
          {gameDone || breakLeft === 0 ? t.breakContinue : `Termine le jeu pour continuer · ${breakMins}:${breakSecs}`}
        </button>
      </div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function AskPage() {
  const { child }  = useChild()
  const { lang }   = useLang()
  const t          = T[lang]
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [phase, setPhase]               = useState<'setup'|'chat'|'flashcards'>('setup')
  const [subject, setSubject]           = useState<Subject>('mathematiques')
  const [topic, setTopic]               = useState<string | null>(null)
  const [pomodoroOn, setPomodoroOn]     = useState(true)
  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [sessionStart, setSessionStart] = useState<Date|null>(null)
  const [elapsed, setElapsed]           = useState(0)
  const [isWide, setIsWide]             = useState(false)
  const [ptsEarned, setPtsEarned]       = useState(0)
  const [sessionDone, setSessionDone]   = useState(false)
  const [showBreak, setShowBreak]       = useState(false)
  const [breakShown, setBreakShown]     = useState(false)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0)
  const [flashcards, setFlashcards]     = useState<any[]>([])
  const [savedIds, setSavedIds]         = useState<Set<number>>(new Set())
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())

  // ── TAB VISIBILITY / DISTRACTION STATE ───────────────────────────
  const [graceLeft, setGraceLeft]       = useState(0)       // seconds remaining in grace period
  const [showGrace, setShowGrace]       = useState(false)   // grace banner visible?
  const graceIntervalRef  = useRef<any>(null)
  const distractionIdRef  = useRef<string | null>(null)     // current distraction row id
  const leftAtRef         = useRef<Date | null>(null)

  const pomodoroLeft = Math.max(0, POMODORO - elapsed)
  const pomodoroMins = String(Math.floor(pomodoroLeft / 60)).padStart(2, '0')
  const pomodoroSecs = String(pomodoroLeft % 60).padStart(2, '0')

  const graceMins = String(Math.floor(graceLeft / 60)).padStart(2, '0')
  const graceSecs = String(graceLeft % 60).padStart(2, '0')

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  // ── Pomodoro timer ────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionStart) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionStart])

  useEffect(() => {
    if (pomodoroOn && pomodoroLeft === 0 && !breakShown && phase === 'chat' && !sessionDone) {
      const timeout = setTimeout(() => { setShowBreak(true); setBreakShown(true) }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [pomodoroLeft, pomodoroOn, breakShown, phase, sessionDone])

  // ── TAB VISIBILITY LISTENER ───────────────────────────────────────
  useEffect(() => {
    // Only active during a chat session
    if (phase !== 'chat' || sessionDone) return

    const handleVisibility = async () => {
      if (document.visibilityState === 'hidden') {
        // Child left the tab
        const now = new Date()
        leftAtRef.current = now

        // Log distraction to Supabase
        if (child) {
          const { data } = await supabase
            .from('distractions')
            .insert({
              child_id:    child.id,
              left_at:     now.toISOString(),
              timer_reset: false,
            })
            .select('id')
            .single()
          if (data) distractionIdRef.current = data.id
        }

        // Start grace period countdown
        setGraceLeft(GRACE_PERIOD)
        setShowGrace(true)

        graceIntervalRef.current = setInterval(() => {
          setGraceLeft(prev => {
            if (prev <= 1) {
              // Grace period expired — reset timer, keep chat
              clearInterval(graceIntervalRef.current)
              setShowGrace(false)
              setSessionStart(new Date())
              setElapsed(0)
              setBreakShown(false)

              // Update distraction record: timer_reset = true
              if (distractionIdRef.current && child) {
                const returnedAt = new Date()
                const durationAway = leftAtRef.current
                  ? Math.floor((returnedAt.getTime() - leftAtRef.current.getTime()) / 1000)
                  : GRACE_PERIOD

                supabase
                  .from('distractions')
                  .update({
                    returned_at:     returnedAt.toISOString(),
                    duration_away_s: durationAway,
                    timer_reset:     true,
                  })
                  .eq('id', distractionIdRef.current)
                  .then(() => { distractionIdRef.current = null })
              }

              // Add system message to chat (timer reset, chat preserved)
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: lang === 'fr'
                  ? `⏱️ Tu as quitté l'application pendant plus de 3 minutes. Le timer a été remis à zéro — mais ne t'inquiète pas, ta conversation est toujours là. Reprends là où tu en étais! 💪`
                  : `⏱️ Ou te kite aplikasyon an pandan plis pase 3 minit. Timer a reyalize — men pa enkyete ou, konvèsasyon an la toujou. Kontinye kote ou te ye a! 💪`,
              }])

              return 0
            }
            return prev - 1
          })
        }, 1000)

        return
      }

      // Child came back within grace period
      if (document.visibilityState === 'visible' && showGrace) {
        clearInterval(graceIntervalRef.current)
        setShowGrace(false)

        // Update distraction record: returned within grace, no reset
        if (distractionIdRef.current && leftAtRef.current && child) {
          const returnedAt    = new Date()
          const durationAway  = Math.floor((returnedAt.getTime() - leftAtRef.current.getTime()) / 1000)
          supabase
            .from('distractions')
            .update({
              returned_at:     returnedAt.toISOString(),
              duration_away_s: durationAway,
              timer_reset:     false,
            })
            .eq('id', distractionIdRef.current)
            .then(() => { distractionIdRef.current = null })
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      clearInterval(graceIntervalRef.current)
    }
  }, [phase, sessionDone, child, lang, showGrace])

  // Cleanup grace interval when session ends or phase changes
  useEffect(() => {
    return () => clearInterval(graceIntervalRef.current)
  }, [])

  useEffect(() => { setTopic(null) }, [subject])

  const loadFlashcards = async () => {
    if (!child) return
    const { data } = await supabase.from('flashcards').select('*').eq('child_id', child.id).order('created_at', { ascending: false })
    if (data) setFlashcards(data)
  }

  useEffect(() => { if (phase === 'flashcards') loadFlashcards() }, [phase])

  if (!child) return null

  const palette     = PALETTES[child.pal?.palette || 'ocean']
  const palName     = child.pal?.name || '...'
  const personality = child.personality || 'curious'
  const creature    = child.pal?.creature || 'land'
  const palPalette  = child.pal?.palette || 'ocean'

  const grade         = (child.grade ?? 5) as GradeLevel
  const curriculumObj = getTopicsForGrade(subject, grade)
  const subtopics     = curriculumObj?.subtopics ?? []

  const startSession = () => {
    const topicStr = topic ? ` — chapitre: **${topic}**` : ''
    const greeting = lang === 'fr'
      ? `Bonjour! Je suis ${palName}. On travaille sur **${getSubjectLabel(subject)}**${topicStr} aujourd'hui${pomodoroOn ? ' — le timer de 25 min est lancé!' : ''}. Tu peux me poser des questions quand tu en as besoin. Bonne étude! 🎯`
      : `Bonjou! Mwen se ${palName}. Nou ap travay sou **${getSubjectLabel(subject)}**${topicStr} jodi a${pomodoroOn ? ' — timer 25 min kòmanse!' : ''}. Ou ka poze m kesyon nenpòt kilè. Bon etid! 🎯`

    setMessages([{ role: 'assistant', content: greeting }])
    setSessionStart(new Date())
    setElapsed(0)
    setPtsEarned(0)
    setSessionDone(false)
    setShowBreak(false)
    setBreakShown(false)
    setPomodorosCompleted(0)
    setShowGrace(false)
    setGraceLeft(0)
    clearInterval(graceIntervalRef.current)
    setPhase('chat')
  }

  const handleBreakFinish = () => {
    setShowBreak(false)
    setPomodorosCompleted(p => p + 1)
    setSessionStart(new Date())
    setElapsed(0)
    setBreakShown(false)
    setMessages(m => [...m, {
      role: 'assistant',
      content: lang === 'fr'
        ? `Excellent! Pause terminée 💪 Nouveau Pomodoro lancé — 25 minutes de focus sur **${getSubjectLabel(subject)}**${topic ? ` · ${topic}` : ''}. Continue comme ça!`
        : `Ekselan! Repo fini 💪 Nouvo Pomodoro kòmanse — 25 minit fokis sou **${getSubjectLabel(subject)}**. Kontinye konsa!`,
    }])
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:  newMessages.map(m => ({ role: m.role, content: m.content })),
          palName, personality, lang,
          subject, grade,
          chapter: topic ?? null,
          pomodoro: pomodoroOn, palPalette, creature,
          childId: child.id,
        }),
      })
      const data = await res.json()

      if (res.status === 429) {
        setMessages(m => [...m, {
          role: 'assistant',
          content: data.message ?? 'Tu as atteint ta limite de sessions pour aujourd\'hui. Reviens demain! 🌙',
        }])
        setLoading(false)
        return
      }

      if (data.message) {
        const imageUrl = data.imagePrompt ? buildImageUrl(data.imagePrompt) : undefined
        setMessages(m => [...m, {
          role: 'assistant', content: data.message,
          imageUrl, shortAnswer: data.shortAnswer || '',
          imagePrompt: data.imagePrompt || '', savedAsFlashcard: false,
        }])
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const saveFlashcard = async (msgIndex: number) => {
    if (!child || savedIds.has(msgIndex)) return
    const aiMsg   = messages[msgIndex]
    const userMsg = messages[msgIndex - 1]
    if (!aiMsg || aiMsg.role !== 'assistant') return
    await supabase.from('flashcards').insert({
      child_id:     child.id,
      subject:      getSubjectLabel(subject),
      question:     userMsg?.content || getSubjectLabel(subject),
      answer:       aiMsg.shortAnswer || aiMsg.content.slice(0, 150),
      image_prompt: aiMsg.imagePrompt || '',
    })
    setSavedIds(prev => new Set([...prev, msgIndex]))
    setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, savedAsFlashcard: true } : m))
  }

  const endSession = async () => {
    if (!child || !sessionStart) return
    const durationMins  = Math.max(1, Math.floor(elapsed / 60))
    const completedFull = pomodoroOn && pomodorosCompleted > 0
    const pts           = completedFull ? pomodorosCompleted * 50 : 0

    await supabase.from('study_sessions').insert({
      child_id:      child.id,
      subject:       getSubjectLabel(subject),
      technique:     pomodoroOn ? 'pomodoro' : 'free',
      duration_mins: durationMins,
      points_earned: pts,
    })

    if (pts > 0) {
      const { data: existing } = await supabase.from('points').select('total').eq('child_id', child.id).single()
      if (existing) {
        await supabase.from('points').update({ total: existing.total + pts }).eq('child_id', child.id)
      } else {
        await supabase.from('points').insert({ child_id: child.id, total: pts })
      }
    }

    setPtsEarned(pts)
    setSessionDone(true)
    setSessionStart(null)
    setShowGrace(false)
    clearInterval(graceIntervalRef.current)
  }

  // ── SETUP ─────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div style={{ minHeight: '100%', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>
      <div style={{ background: 'linear-gradient(160deg, #0B1F4B, #13306B)', padding: isWide ? '32px 32px 36px' : '24px 20px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ animation: 'float 3s ease-in-out infinite' }}>
            <PalSVG creature={creature} shape={child.pal?.bodyShape || 'round'} palette={palette} feature={child.pal?.feature || 'eyes'} size={72} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: isWide ? 32 : 26, fontWeight: 700 }}>
              {t.title} {palName}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 14 }}>{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: isWide ? '28px 32px' : '20px 18px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Subject selector */}
        <div>
          <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            {t.subject}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ALL_SUBJECTS.map(s => {
              const cfg      = SUBJECT_CONFIG[s]
              const isActive = subject === s
              return (
                <button key={s} onClick={() => setSubject(s)} style={{
                  padding: '14px 16px', borderRadius: 16,
                  background: isActive ? '#0B1F4B' : '#fff',
                  color:      isActive ? '#FBBF24' : '#64748B',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  border:    `1.5px solid ${isActive ? '#0B1F4B' : '#E2E8F0'}`,
                  fontFamily:'var(--font-jakarta)', transition: 'all .15s',
                  display:   'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{cfg.emoji}</span>
                  <span style={{ lineHeight: 1.3 }}>{cfg.shortLabel}</span>
                </button>
              )
            })}
          </div>
          {curriculumObj && (
            <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 8, paddingLeft: 4 }}>
              Programme : {curriculumObj.programLabel}
            </p>
          )}
        </div>

        {/* Topic selector */}
        {subtopics.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {t.topic}
              </p>
              <span style={{ color: '#94A3B8', fontSize: 12 }}>{t.topicOptional}</span>
            </div>
            <p style={{ color: '#64748B', fontSize: 12, marginBottom: 10 }}>{t.topicHint}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button onClick={() => setTopic(null)} style={{
                padding: '7px 14px', borderRadius: 99,
                background: topic === null ? '#0B1F4B' : '#fff',
                color:      topic === null ? '#FBBF24' : '#64748B',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                border:    `1.5px solid ${topic === null ? '#0B1F4B' : '#E2E8F0'}`,
                fontFamily:'var(--font-jakarta)', transition: 'all .15s',
              }}>
                {t.topicGeneral}
              </button>
              {subtopics.map(tp => (
                <button key={tp} onClick={() => setTopic(topic === tp ? null : tp)} style={{
                  padding: '7px 14px', borderRadius: 99,
                  background: topic === tp ? palette.main : '#fff',
                  color:      topic === tp ? '#fff'        : '#64748B',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  border:    `1.5px solid ${topic === tp ? palette.main : '#E2E8F0'}`,
                  fontFamily:'var(--font-jakarta)', transition: 'all .15s',
                }}>
                  {tp}
                </button>
              ))}
            </div>
            {topic && (
              <div style={{ marginTop: 10, background: '#F0F9FF', borderRadius: 12, padding: '10px 14px', border: '1px solid #BAE6FD' }}>
                <p style={{ color: '#0369A1', fontSize: 12, fontWeight: 600 }}>
                  📚 {palName} se concentrera sur : <strong>{topic}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pomodoro toggle */}
        <div onClick={() => setPomodoroOn(p => !p)} style={{
          background: pomodoroOn ? 'rgba(59,82,212,.06)' : '#fff',
          border: `1.5px solid ${pomodoroOn ? palette.main : '#E2E8F0'}`,
          borderRadius: 20, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all .2s',
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: pomodoroOn ? palette.main : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>⏱️</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15, marginBottom: 3 }}>Mode Pomodoro</p>
            <p style={{ color: '#64748B', fontSize: 13 }}>
              {pomodoroOn ? 'Activé · 25 min focus + pause jeu · +50 pts' : 'Désactivé · session libre · pas de points'}
            </p>
          </div>
          <div style={{ width: 48, height: 26, borderRadius: 99, background: pomodoroOn ? palette.main : '#E2E8F0', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: pomodoroOn ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
          </div>
        </div>

        {pomodoroOn && (
          <div style={{ background: '#FEF3C7', borderRadius: 16, padding: '14px 18px', border: '1.5px solid #FBBF24', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>⭐</span>
            <p style={{ color: '#92400E', fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
              Le timer démarre dès que tu cliques sur <strong>Commencer</strong>. Après 25 min, une pause de 5 min avec un mini-jeu apparaît. Chaque Pomodoro = <strong>50 points</strong>.
            </p>
          </div>
        )}

        <button onClick={() => setPhase('flashcards')} style={{
          width: '100%', padding: '13px', background: '#fff',
          color: '#0B1F4B', border: '1.5px solid #E2E8F0', borderRadius: 16,
          fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-jakarta)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          🗂️ {t.flashcardsTitle}
        </button>

        <button onClick={startSession} style={{
          width: '100%', padding: '16px',
          background: `linear-gradient(135deg, #0B1F4B, ${palette.main})`,
          color: '#FBBF24', border: 'none', borderRadius: 16,
          fontWeight: 800, fontSize: 16, cursor: 'pointer',
          fontFamily: 'var(--font-jakarta)', boxShadow: `0 8px 24px ${palette.glow}`,
        }}>
          {t.startSession}
        </button>
      </div>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  )

  // ── FLASHCARDS ────────────────────────────────────────────────────
  if (phase === 'flashcards') return (
    <div style={{ minHeight: '100%', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>
      <div style={{ background: 'linear-gradient(160deg, #0B1F4B, #13306B)', padding: isWide ? '28px 32px 32px' : '20px 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button onClick={() => setPhase('setup')} style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.6)', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-jakarta)' }}>←</button>
          <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 26, fontWeight: 700 }}>🗂️ {t.flashcardsTitle}</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, paddingLeft: 44 }}>Appuie sur une carte pour voir la réponse</p>
      </div>
      <div style={{ padding: isWide ? '24px 32px' : '20px 18px' }}>
        {flashcards.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1.5px dashed #E2E8F0', textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🗂️</p>
            <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15 }}>{t.noFlashcards}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isWide ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 16 }}>
            {flashcards.map((card: any) => {
              const isFlipped = flippedCards.has(card.id)
              const imgUrl    = card.image_prompt ? buildImageUrl(card.image_prompt) : null
              return (
                <div key={card.id} onClick={() => setFlippedCards(prev => {
                  const next = new Set(prev)
                  if (next.has(card.id)) next.delete(card.id); else next.add(card.id)
                  return next
                })} style={{
                  background: isFlipped ? `linear-gradient(135deg, #0B1F4B, ${palette.main})` : '#fff',
                  borderRadius: 20, overflow: 'hidden',
                  border: `1.5px solid ${isFlipped ? palette.main : '#E2E8F0'}`,
                  cursor: 'pointer', transition: 'all .3s', minHeight: 200,
                }}>
                  {!isFlipped ? (
                    <>
                      {imgUrl && (
                        <div style={{ height: 140, overflow: 'hidden' }}>
                          <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        </div>
                      )}
                      <div style={{ padding: '14px 16px' }}>
                        <span style={{ background: '#DBEAFE', color: '#3B52D4', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{card.subject}</span>
                        <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 14, marginTop: 8 }}>{card.question}</p>
                        <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 8 }}>Appuie pour voir la réponse 👆</p>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '24px 20px', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>{t.back}</p>
                      <p style={{ color: '#fff', fontSize: 16, lineHeight: 1.7 }}>{card.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  // ── CHAT ──────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0B1F4B', fontFamily: 'var(--font-jakarta)', position: 'relative' }}>

      {showBreak && (
        <BreakOverlay
          creature={creature} palette={palette} palName={palName}
          lang={lang} t={t} onFinish={handleBreakFinish}
        />
      )}

      {/* ── GRACE PERIOD BANNER ── */}
      {showGrace && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 300,
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'slideDown .3s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 13, margin: 0 }}>
                Tu as quitté l'application!
              </p>
              <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 11, margin: 0 }}>
                Reviens maintenant — le timer repart dans {graceMins}:{graceSecs}
              </p>
            </div>
          </div>
          {/* Countdown ring */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(255,255,255,.15)',
            border: '2px solid rgba(255,255,255,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-fredoka)', margin: 0 }}>
              {graceLeft}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0B1F4B, #13306B)', padding: '14px 18px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.07)', marginTop: showGrace ? 72 : 0, transition: 'margin-top .3s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => { setPhase('setup'); setMessages([]); setShowGrace(false); clearInterval(graceIntervalRef.current) }} style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.5)', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-jakarta)' }}>←</button>
          <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
            <PalSVG creature={creature} shape={child.pal?.bodyShape || 'round'} palette={palette} feature={child.pal?.feature || 'eyes'} size={38} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-fredoka)' }}>{palName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: showGrace ? '#EF4444' : '#22C55E', transition: 'background .3s' }} />
              <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>
                {SUBJECT_CONFIG[subject].shortLabel}{topic ? ` · ${topic}` : ''} · {pomodoroOn ? `Pomodoro${pomodorosCompleted > 0 ? ` · ${pomodorosCompleted}✓` : ''}` : 'Libre'}
              </span>
            </div>
          </div>

          {pomodoroOn && (
            <div style={{ background: pomodoroLeft === 0 ? 'rgba(34,197,94,.2)' : 'rgba(251,191,36,.15)', border: `1px solid ${pomodoroLeft === 0 ? '#22C55E' : '#FBBF24'}`, borderRadius: 12, padding: '6px 12px', textAlign: 'center', flexShrink: 0 }}>
              <p style={{ color: pomodoroLeft === 0 ? '#22C55E' : '#FBBF24', fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-fredoka)', lineHeight: 1 }}>
                {pomodoroLeft === 0 ? '🎮 Pause!' : `${pomodoroMins}:${pomodoroSecs}`}
              </p>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 9, fontWeight: 700, marginTop: 2 }}>
                {pomodoroLeft === 0 ? 'JEU!' : t.pomodoroLabel.toUpperCase()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Session done banner */}
      {sessionDone && (
        <div style={{ background: ptsEarned > 0 ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : '#FEF3C7', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <p style={{ fontWeight: 700, color: ptsEarned > 0 ? '#065F46' : '#92400E', fontSize: 14 }}>
            {ptsEarned > 0
              ? `${t.sessionSaved}${ptsEarned} ${t.points} · ${pomodorosCompleted} Pomodoro${pomodorosCompleted > 1 ? 's' : ''}`
              : '⏱️ Complète un Pomodoro pour gagner des points!'
            }
          </p>
          <button onClick={() => { setPhase('setup'); setMessages([]); setSessionDone(false) }} style={{ background: ptsEarned > 0 ? '#065F46' : '#92400E', color: '#fff', border: 'none', borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
            Nouvelle session
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
            {msg.role === 'assistant' && (
              <div style={{ flexShrink: 0, marginBottom: 2 }}>
                <PalSVG creature={creature} shape={child.pal?.bodyShape || 'round'} palette={palette} feature={child.pal?.feature || 'eyes'} size={28} />
              </div>
            )}
            {msg.role === 'assistant' ? (
              <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {msg.imageUrl && (
                  <div style={{ borderRadius: '16px 16px 4px 16px', overflow: 'hidden', border: `2px solid ${palette.main}33` }}>
                    <img src={msg.imageUrl} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }}
                      onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }} />
                  </div>
                )}
                <div style={{ padding: '11px 15px', borderRadius: '16px 16px 16px 4px', background: 'rgba(59,82,212,.3)', border: '1px solid rgba(59,82,212,.3)', color: 'rgba(255,255,255,.9)', fontSize: 14, lineHeight: 1.6 }}>
                  {renderMarkdown(msg.content)}
                </div>
                {i > 0 && msg.shortAnswer && (
                  <button onClick={() => saveFlashcard(i)} disabled={msg.savedAsFlashcard || savedIds.has(i)} style={{
                    alignSelf: 'flex-start',
                    background: msg.savedAsFlashcard || savedIds.has(i) ? 'rgba(34,197,94,.2)' : 'rgba(255,255,255,.07)',
                    border: `1px solid ${msg.savedAsFlashcard || savedIds.has(i) ? '#22C55E' : 'rgba(255,255,255,.15)'}`,
                    borderRadius: 99, padding: '4px 12px',
                    color: msg.savedAsFlashcard || savedIds.has(i) ? '#22C55E' : 'rgba(255,255,255,.45)',
                    fontSize: 11, fontWeight: 700,
                    cursor: msg.savedAsFlashcard || savedIds.has(i) ? 'default' : 'pointer',
                    fontFamily: 'var(--font-jakarta)', transition: 'all .2s',
                  }}>
                    {msg.savedAsFlashcard || savedIds.has(i) ? t.flashcardSaved : `🗂️ ${t.saveFlashcard}`}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ maxWidth: '78%', padding: '11px 15px', borderRadius: '16px 16px 4px 16px', background: '#FBBF24', color: '#0B1F4B', fontSize: 14, lineHeight: 1.6, fontWeight: 600 }}>
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ flexShrink: 0 }}>
              <PalSVG creature={creature} shape={child.pal?.bodyShape || 'round'} palette={palette} feature={child.pal?.feature || 'eyes'} size={28} />
            </div>
            <div style={{ background: 'rgba(59,82,212,.3)', border: '1px solid rgba(59,82,212,.3)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', display: 'flex', gap: 5 }}>
              {[0,1,2].map(n => (
                <div key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,.4)', animation: `typing 1.2s ${n * .2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px 20px', background: '#0B1F4B', borderTop: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
        {!sessionDone && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={t.typeMessage}
              style={{ flex: 1, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '12px 16px', color: '#fff', fontSize: 14, fontFamily: 'var(--font-jakarta)', outline: 'none' }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
              width: 46, height: 46, borderRadius: 14, border: 'none',
              background: input.trim() ? '#FBBF24' : 'rgba(255,255,255,.08)',
              color: input.trim() ? '#0B1F4B' : 'rgba(255,255,255,.3)',
              fontSize: 18, cursor: input.trim() ? 'pointer' : 'default',
              flexShrink: 0, transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>↑</button>
          </div>
        )}

        <button onClick={endSession} disabled={sessionDone} style={{
          width: '100%', padding: '11px',
          background: sessionDone ? 'rgba(255,255,255,.05)' : pomodorosCompleted > 0 ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
          color: sessionDone ? 'rgba(255,255,255,.2)' : pomodorosCompleted > 0 ? '#86EFAC' : '#FCA5A5',
          border: `1px solid ${sessionDone ? 'rgba(255,255,255,.05)' : pomodorosCompleted > 0 ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
          borderRadius: 12, fontWeight: 700, fontSize: 13,
          cursor: sessionDone ? 'default' : 'pointer',
          fontFamily: 'var(--font-jakarta)',
        }}>
          {sessionDone
            ? 'Session terminée'
            : pomodorosCompleted > 0
              ? `Terminer · +${pomodorosCompleted * 50} pts ⭐ · ${pomodorosCompleted} Pomodoro${pomodorosCompleted > 1 ? 's' : ''}`
              : pomodoroOn
                ? `${t.endSession} · ${Math.floor(elapsed / 60)}min · (termine un Pomodoro pour les points)`
                : `${t.endSession} · ${Math.floor(elapsed / 60)}min`
          }
        </button>
      </div>

      <style>{`
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes typing   { 0%,60%,100%{transform:translateY(0);opacity:.3} 30%{transform:translateY(-5px);opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown{ from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
