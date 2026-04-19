'use client'
import { useEffect, useState } from 'react'
import { useChild } from '@/lib/ChildContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PalSVG } from '@/lib/pal-svg'

const PALETTES: Record<string, any> = {
  ocean:   { main: '#2563EB', accent: '#7DD3FC', glow: 'rgba(37,99,235,.4)'   },
  fire:    { main: '#EA580C', accent: '#FDE68A', glow: 'rgba(234,88,12,.4)'   },
  forest:  { main: '#16A34A', accent: '#BBF7D0', glow: 'rgba(22,163,74,.4)'   },
  cosmic:  { main: '#7C3AED', accent: '#DDD6FE', glow: 'rgba(124,58,237,.4)'  },
  sunrise: { main: '#DB2777', accent: '#FDE68A', glow: 'rgba(219,39,119,.4)'  },
  storm:   { main: '#475569', accent: '#BAE6FD', glow: 'rgba(71,85,105,.4)'   },
  gold:    { main: '#D97706', accent: '#FEF3C7', glow: 'rgba(217,119,6,.4)'   },
  night:   { main: '#1E293B', accent: '#C7D2FE', glow: 'rgba(30,41,59,.4)'    },
}

const GREETINGS: Record<string, string[]> = {
  brave:   ['Prêt pour l\'aventure aujourd\'hui?', 'Allons relever un défi!', 'Le courage commence ici.'],
  curious: ['Qu\'allons-nous découvrir aujourd\'hui?', 'Tant de choses à explorer!', 'Une nouvelle question t\'attend.'],
  funny:   ['Hey, tu sais ce qui est drôle? Apprendre!', 'Prêt à rire... et à apprendre?', 'La bonne humeur, c\'est la moitié du chemin!'],
  calm:    ['Prends ton temps. On y va ensemble.', 'Chaque pas compte, même le petit.', 'Respire. Explore. Grandis.'],
}

export default function HomePage() {
  const { child, loading } = useChild()
  const router = useRouter()
  const [points, setPoints]     = useState(0)
  const [streak, setStreak]     = useState(0)
  const [sessions, setSessions] = useState(0)
  const [nextMentor, setNextMentor] = useState<any>(null)
  const [articles, setArticles]     = useState<any[]>([])
  const [greeting, setGreeting]     = useState('')
  const [animIn, setAnimIn]         = useState(false)

  const palette  = PALETTES[child?.pal?.palette || 'ocean']
  const palName  = child?.pal?.name || 'Ton compagnon'
  const personality = child?.personality || 'curious'

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 100)
    if (!child) return

    // Random greeting based on personality
    const greetings = GREETINGS[personality] || GREETINGS.curious
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)])

    // Fetch points
    supabase.from('points').select('total').eq('child_id', child.id).single()
      .then(({ data }) => { if (data) setPoints(data.total) })

    // Fetch sessions count
    supabase.from('study_sessions').select('id', { count: 'exact' }).eq('child_id', child.id)
      .then(({ count }) => { if (count) setSessions(count) })

    // Fetch next mentor session
    supabase.from('mentor_sessions')
      .select('*, mentors(name, field)')
      .eq('child_id', child.id)
      .eq('status', 'upcoming')
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setNextMentor(data) })

    // Fetch recent articles
    supabase.from('news_articles')
      .select('id, title, subject, hero, hero_name')
      .eq('published', true)
      .limit(3)
      .then(({ data }) => { if (data) setArticles(data) })

    // Fake streak for pilot
    setStreak(7)
  }, [child])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1F4B' }}>
      <div style={{ animation: 'pulse 1.5s ease-in-out infinite', fontSize: 48 }}>😊</div>
    </div>
  )

    useEffect(() => {
      if (!loading && !child) {
        router.push('/onboarding')
      }
    }, [child, loading])

    if (loading || !child) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1F4B' }}>
        <div style={{ animation: 'pulse 1.5s ease-in-out infinite', fontSize: 48 }}>😊</div>
      </div>
    )


  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div style={{ minHeight: '100%', background: '#F4F7FF' }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: `linear-gradient(160deg, #0B1F4B 0%, #13306B 100%)`,
        padding: '20px 20px 0', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 2 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, marginBottom: 4 }}>{timeOfDay} 👋</p>
            <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>
              {child.name}
            </h1>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              🔔
            </div>
            <div style={{ position: 'absolute', top: -3, right: -3, width: 11, height: 11, borderRadius: '50%', background: '#EF4444', border: '2px solid #0B1F4B' }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, position: 'relative', zIndex: 2 }}>
          {[
            { icon: '🔥', val: streak.toString(),   label: 'JOURS'    },
            { icon: '⭐', val: points.toString(),   label: 'POINTS'   },
            { icon: '📚', val: sessions.toString(), label: 'SESSIONS' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,.07)', borderRadius: 16, padding: '12px 10px', border: '1px solid rgba(255,255,255,.06)', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 3 }}>
                <span style={{ fontSize: 15 }}>{s.icon}</span>
                <span style={{ color: '#FBBF24', fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-fredoka)' }}>{s.val}</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 9, fontWeight: 700, letterSpacing: '.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pal greeting card */}
        <div style={{
          background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '20px 20px 0 0',
          padding: '18px 18px 28px',
          display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', zIndex: 2,
          opacity: animIn ? 1 : 0,
          transform: animIn ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all .4s ease',
        }}>
          <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
            <PalSVG
              creature={child.pal.creature}
              shape={child.pal.bodyShape}
              palette={palette}
              feature={child.pal.feature}
              size={72}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#FBBF24', fontWeight: 800, fontSize: 13, marginBottom: 5 }}>
              {palName} dit:
            </p>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 15, lineHeight: 1.6 }}>
              "{greeting}"
            </p>
          </div>
        </div>
      </div>

      {/* ── WHITE CARD BODY ── */}
      <div style={{ background: '#F4F7FF', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Daily Quest */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 20, fontWeight: 600 }}>
              Quête du jour ⚡
            </h2>
            <button onClick={() => router.push('/home/quests')} style={{ color: palette.main, fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              Voir tout →
            </button>
          </div>

          <div
            onClick={() => router.push('/home/ask')}
            style={{
              background: `linear-gradient(135deg, #0B1F4B, ${palette.main})`,
              borderRadius: 20, padding: '18px 20px', cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 90, opacity: .07 }}>⚡</div>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', marginBottom: 8 }}>
              REPRENDRE AVEC {palName.toUpperCase()}
            </p>
            <h3 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 18, marginBottom: 14 }}>
              Continue ton exploration! 🎯
            </h3>
            <div style={{ height: 6, background: 'rgba(255,255,255,.12)', borderRadius: 99, marginBottom: 10 }}>
              <div style={{ height: '100%', width: '65%', background: '#FBBF24', borderRadius: 99 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>65% complété</span>
              <div style={{ background: '#FBBF24', color: '#0B1F4B', borderRadius: 99, padding: '6px 16px', fontSize: 13, fontWeight: 800 }}>
                Continuer →
              </div>
            </div>
          </div>
        </div>

        {/* Recent articles */}
        {articles.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 20, fontWeight: 600 }}>
                Dernières quêtes ✨
              </h2>
              <button onClick={() => router.push('/home/quests')} style={{ color: palette.main, fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                Voir tout →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {articles.map(a => (
                <div key={a.id} onClick={() => router.push('/home/quests')} style={{
                  background: '#fff', borderRadius: 18, padding: '14px 16px',
                  border: '1.5px solid #E2E8F0', display: 'flex', gap: 12,
                  alignItems: 'center', cursor: 'pointer',
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F4F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {a.hero || '🦸'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ background: '#DBEAFE', color: '#2563EB', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{a.subject}</span>
                    <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 14, marginTop: 5 }}>{a.title}</p>
                    <p style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>Avec {a.hero_name}</p>
                  </div>
                  <span style={{ color: '#CBD5E1', fontSize: 20 }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No articles yet */}
        {articles.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1.5px dashed #E2E8F0', textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🦸</p>
            <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15, marginBottom: 4 }}>Les quêtes arrivent bientôt!</p>
            <p style={{ color: '#94A3B8', fontSize: 13 }}>Ton administrateur prépare du contenu pour toi.</p>
          </div>
        )}

        {/* Next mentor session */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            Prochain mentor 🔮
          </h2>
          {nextMentor ? (
            <div style={{ background: '#EFF6FF', borderRadius: 20, padding: '16px', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                🌟
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15 }}>{nextMentor.mentors?.name}</p>
                <p style={{ color: '#2563EB', fontSize: 13, fontWeight: 600 }}>{nextMentor.mentors?.field}</p>
                <p style={{ color: '#64748B', fontSize: 12, marginTop: 3 }}>
                  {new Date(nextMentor.scheduled_at).toLocaleString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div style={{ background: '#2563EB', color: '#fff', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                Rejoindre
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1.5px dashed #E2E8F0', textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🔮</p>
              <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15, marginBottom: 4 }}>Aucune session prévue</p>
              <p style={{ color: '#94A3B8', fontSize: 13 }}>Ton prochain mentor sera bientôt assigné.</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .4; }
        }
      `}</style>
    </div>
  )
}

