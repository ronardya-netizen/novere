'use client'
import { useEffect, useState } from 'react'
import { useChild } from '@/lib/ChildContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { PalSVG } from '@/lib/pal-svg'
import { useLang } from './layout'

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

const T = {
  fr: {
    morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir',
    says: 'dit', jours: 'JOURS', points: 'POINTS', sessions: 'SESSIONS',
    questDuJour: 'Quête du jour', voirTout: 'Voir tout →',
    reprendre: 'REPRENDRE AVEC', exploration: 'Continue ton exploration! 🎯',
    complete: 'complété', continuer: 'Continuer →',
    dernieres: 'Dernières quêtes ✨', avec: 'Avec',
    questsVide: 'Les quêtes arrivent bientôt!',
    questsVideSub: 'Ton administrateur prépare du contenu pour toi.',
    prochainMentor: 'Prochain mentor 🔮',
    rejoindre: 'Rejoindre',
    aucuneMentor: 'Aucune session prévue',
    aucuneMentorSub: 'Ta prochaine session sera bientôt annoncée.',
    greetings: {
      brave:   ['Prêt pour l\'aventure?', 'Allons relever un défi!', 'Le courage commence ici.'],
      curious: ['Qu\'allons-nous découvrir?', 'Tant de choses à explorer!', 'Une nouvelle question t\'attend.'],
      funny:   ['Prêt à rire... et apprendre?', 'La bonne humeur, c\'est la moitié du chemin!', 'Apprendre, c\'est drôle!'],
      calm:    ['Prends ton temps.', 'Chaque pas compte.', 'Respire. Explore. Grandis.'],
    }
  },
  cr: {
    morning: 'Bonjou', afternoon: 'Bon apremidi', evening: 'Bonswa',
    says: 'di', jours: 'JOU', points: 'PWEN', sessions: 'SESYON',
    questDuJour: 'Kèt jodi a', voirTout: 'Wè tout →',
    reprendre: 'KONTINYE AK', exploration: 'Kontinye eksplosyon ou! 🎯',
    complete: 'konplete', continuer: 'Kontinye →',
    dernieres: 'Dènye kèt ✨', avec: 'Ak',
    questsVide: 'Kèt yo ap vini byento!',
    questsVideSub: 'Administratè ou ap prepare kontni pou ou.',
    prochainMentor: 'Pwochen mentor 🔮',
    rejoindre: 'Rantre',
    aucuneMentor: 'Pa gen sesyon prevwa',
    aucuneMentorSub: 'Pwochen sesyon ou ap anonse byento.',
    greetings: {
      brave:   ['Pare pou avanti?', 'Ann releve yon defi!', 'Kouraj kòmanse isit.'],
      curious: ['Kisa nou pral dekouvri?', 'Anpil bagay pou eksplore!', 'Yon nouvo kesyon ap tann ou.'],
      funny:   ['Pare pou ri... ak aprann?', 'Bon imè, se mwatye wout la!', 'Aprann, se amizan!'],
      calm:    ['Pran tan ou.', 'Chak pa konte.', 'Respire. Eksplore. Grandi.'],
    }
  }
}

export default function HomePage() {
  const { child, loading } = useChild()
  const router   = useRouter()
  const { lang } = useLang()
  const t        = T[lang]

  const [points, setPoints]         = useState(0)
  const [streak, setStreak]         = useState(0)
  const [sessions, setSessions]     = useState(0)
  const [nextMentor, setNextMentor] = useState<any>(null)
  const [articles, setArticles]     = useState<any[]>([])
  const [greeting, setGreeting]     = useState('')
  const [animIn, setAnimIn]         = useState(false)
  const [isWide, setIsWide]         = useState(false)

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!loading && !child) router.push('/onboarding')
  }, [child, loading, router])

useEffect(() => {
  if (!child) return
  setTimeout(() => setAnimIn(true), 100)
  const g = (t.greetings as any)[child.personality] || t.greetings.curious
  setGreeting(g[Math.floor(Math.random() * g.length)])

  // Points
  supabase.from('points').select('total').eq('child_id', child.id).single()
    .then(({ data }: any) => { if (data) setPoints(data.total) })

  // Sessions count
  supabase.from('study_sessions').select('id', { count: 'exact' }).eq('child_id', child.id)
    .then(({ count }: any) => { if (count) setSessions(count) })

  // Next mentor
  supabase
    .from('mentors')
    .select('id, name, field, avatar_emoji')
    .limit(1)
    .maybeSingle()
    .then(async ({ data }: any) => {
      if (!data) return
      const { count } = await supabase
        .from('mentor_episodes')
        .select('id', { count: 'exact' })
        .eq('mentor_id', data.id)
        .eq('published', true)
      setNextMentor({ ...data, episode_count: count || 0 })
    })


  // Articles
  supabase.from('news_articles')
    .select('id, title, subject, hero, hero_name')
    .eq('published', true).limit(3)
    .then(({ data }: any) => { if (data) setArticles(data) })

  // Streak — based on parent schedule + completed Pomodoros
  const computeStreak = async () => {
    // 1. Get active schedule
    const { data: schedule } = await supabase
      .from('focus_schedules')
      .select('days, start_time, end_time')
      .eq('child_id', child.id)
      .eq('active', true)
      .maybeSingle()

    // 2. Get all completed Pomodoro sessions
    const { data: pomodoros } = await supabase
      .from('study_sessions')
      .select('created_at')
      .eq('child_id', child.id)
      .eq('technique', 'pomodoro')
      .gt('points_earned', 0)
      .order('created_at', { ascending: false })

    if (!pomodoros || pomodoros.length === 0) { setStreak(0); return }

    // No schedule set — count distinct days with a completed Pomodoro
    if (!schedule || !schedule.days || schedule.days.length === 0) {
      const uniqueDays = new Set(
        pomodoros.map((s: any) => new Date(s.created_at).toDateString())
      ).size
      setStreak(uniqueDays)
      return
    }

    // 3. Build a set of "completed windows" — date strings where a Pomodoro
    //    happened inside the scheduled time window
    const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const scheduledDays: string[] = schedule.days.map((d: string) => d.toLowerCase())

    const [startH, startM] = (schedule.start_time as string).split(':').map(Number)
    const [endH,   endM  ] = (schedule.end_time   as string).split(':').map(Number)

    const completedDates = new Set<string>()
    for (const s of pomodoros) {
      const d = new Date(s.created_at)
      const h = d.getHours()
      const m = d.getMinutes()
      const inWindow = (h > startH || (h === startH && m >= startM)) &&
                       (h < endH   || (h === endH   && m <= endM))
      if (inWindow) {
        completedDates.add(d.toDateString())
      }
    }

    // 4. Walk backwards from today through scheduled days, count consecutive hits
    let count   = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cursor = new Date(today)

    // Check up to 90 days back
    for (let i = 0; i < 90; i++) {
      const dayName = DAY_NAMES[cursor.getDay()]
      if (scheduledDays.includes(dayName)) {
        const hit = completedDates.has(cursor.toDateString())
        // Allow today to be incomplete without breaking streak
        if (!hit && cursor.toDateString() !== today.toDateString()) {
          break
        }
        if (hit) count++
      }
      cursor.setDate(cursor.getDate() - 1)
    }

    setStreak(count)
  }

  computeStreak()
}, [child, lang])



  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1F4B' }}>
      <img src="/novere_logo.png" style={{ width: 64, height: 64, objectFit: 'contain', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  )
  if (!child) return null

  const palette   = PALETTES[child.pal?.palette || 'ocean']
  const palName   = child.pal?.name || '...'
  const hour      = new Date().getHours()
  const timeOfDay = hour < 12 ? t.morning : hour < 18 ? t.afternoon : t.evening

  const LeftCol = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, #0B1F4B 0%, #13306B 100%)`,
        borderRadius: isWide ? 24 : 0,
        padding: isWide ? '28px 28px 0' : '20px 20px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 2 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, marginBottom: 4 }}>{timeOfDay} 👋</p>
            <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: isWide ? 34 : 28, fontWeight: 700, lineHeight: 1.1 }}>
              {child.name}
            </h1>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20 }}>
              🔔
            </div>
            <div style={{ position: 'absolute', top: -3, right: -3, width: 11, height: 11, borderRadius: '50%', background: '#EF4444', border: '2px solid #0B1F4B' }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, position: 'relative', zIndex: 2 }}>
          {[
            { icon: '🔥', val: streak.toString(),   label: t.jours    },
            { icon: '⭐', val: points.toString(),   label: t.points   },
            { icon: '📚', val: sessions.toString(), label: t.sessions },
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

        {/* Pal greeting */}
        <div style={{
          background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '20px 20px 0 0', padding: '18px 18px 28px',
          display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', zIndex: 2,
          opacity: animIn ? 1 : 0,
          transform: animIn ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all .4s ease',
        }}>
          <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
            <PalSVG
              creature={child.pal?.creature || 'land'}
              shape={child.pal?.bodyShape || 'round'}
              palette={palette}
              feature={child.pal?.feature || 'eyes'}
              size={isWide ? 88 : 72}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#FBBF24', fontWeight: 800, fontSize: 13, marginBottom: 5 }}>
              {palName} {t.says}:
            </p>
            <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 15, lineHeight: 1.6 }}>
              "{greeting}"
            </p>
          </div>
        </div>
      </div>

      {/* Daily quest */}
      <div style={{ padding: isWide ? '0 0' : '0 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 20, fontWeight: 600 }}>
            {t.questDuJour} ⚡
          </h2>
          <button onClick={() => router.push('/home/quests')} style={{ color: palette.main, fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
            {t.voirTout}
          </button>
        </div>
        <div onClick={() => router.push('/home/ask')} style={{
          background: `linear-gradient(135deg, #0B1F4B, ${palette.main})`,
          borderRadius: 20, padding: '18px 20px', cursor: 'pointer',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 90, opacity: .07 }}>⚡</div>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, fontWeight: 700, letterSpacing: '.07em', marginBottom: 8 }}>
            {t.reprendre} {palName.toUpperCase()}
          </p>
          <h3 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 18, marginBottom: 14 }}>
            {t.exploration}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>
              {sessions > 0
                ? `${sessions} session${sessions > 1 ? 's' : ''} · ${streak} jour${streak > 1 ? 's' : ''} de suite`
                : lang === 'fr' ? 'Commence ta première session!' : 'Kòmanse premye sesyon ou!'
              }
            </span>
            <div style={{ background: '#FBBF24', color: '#0B1F4B', borderRadius: 99, padding: '6px 16px', fontSize: 13, fontWeight: 800 }}>
              {t.continuer}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const RightCol = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: isWide ? '0' : '0 18px' }}>

      {/* Articles */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 20, fontWeight: 600 }}>
            {t.dernieres}
          </h2>
          <button onClick={() => router.push('/home/quests')} style={{ color: palette.main, fontSize: 13, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
            {t.voirTout}
          </button>
        </div>
        {articles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {articles.map((a: any) => (
              <div key={a.id} onClick={() => router.push('/home/quests')} style={{
                background: '#fff', borderRadius: 18, padding: '14px 16px',
                border: '1.5px solid #E2E8F0', display: 'flex', gap: 12,
                alignItems: 'center', cursor: 'pointer',
                transition: 'transform .15s, box-shadow .15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F4F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {a.hero || '🦸'}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ background: '#DBEAFE', color: '#3B52D4', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{a.subject}</span>
                  <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 14, marginTop: 5 }}>{a.title}</p>
                  <p style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{t.avec} {a.hero_name}</p>
                </div>
                <span style={{ color: '#CBD5E1', fontSize: 20 }}>›</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1.5px dashed #E2E8F0', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>🦸</p>
            <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15, marginBottom: 4 }}>{t.questsVide}</p>
            <p style={{ color: '#94A3B8', fontSize: 13 }}>{t.questsVideSub}</p>
          </div>
        )}
      </div>

      {/* Next mentor */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
          {t.prochainMentor}
        </h2>
              {nextMentor ? (
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0F9FF)', borderRadius: 20, padding: '18px', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
              {nextMentor.avatar_emoji || '🎬'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15 }}>{nextMentor.name}</p>
              <p style={{ color: '#3B52D4', fontSize: 13, fontWeight: 600 }}>{nextMentor.field}</p>
              <p style={{ color: '#64748B', fontSize: 12, marginTop: 3 }}>
                {nextMentor.episode_count || 0} épisode{(nextMentor.episode_count || 0) > 1 ? 's' : ''} disponible{(nextMentor.episode_count || 0) > 1 ? 's' : ''}
              </p>
            </div>
            <div
              onClick={() => router.push('/home/mentors')}
              style={{ background: '#3B52D4', color: '#fff', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
            >
              ▶ Regarder
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1.5px dashed #E2E8F0', textAlign: 'center' }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>🎬</p>
            <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15, marginBottom: 4 }}>{t.aucuneMentor}</p>
            <p style={{ color: '#94A3B8', fontSize: 13 }}>{t.aucuneMentorSub}</p>
          </div>
        )}

      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100%', background: '#F4F7FF' }}>
      {isWide ? (
        /* DESKTOP / TABLET — two column */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 28, maxWidth: 1200, margin: '0 auto' }}>
          <LeftCol />
          <RightCol />
        </div>
      ) : (
        /* MOBILE — single column */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 24 }}>
          <LeftCol />
          <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <RightCol />
          </div>
        </div>
      )}

      <style>{`
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
      `}</style>
    </div>
  )
}

