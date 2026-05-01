'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const DAYS_EN = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function ParentPage() {
  const router = useRouter()

  // Auth gate
  const [gatePassword, setGatePassword] = useState('')
  const [gateError, setGateError]       = useState('')
  const [unlocked, setUnlocked]         = useState(false)
  const [gateLoading, setGateLoading]   = useState(false)

  // Data
  const [child, setChild]         = useState<any>(null)
  const [schedule, setSchedule]   = useState<any>(null)
  const [days, setDays]           = useState<string[]>([])
  const [startTime, setStartTime] = useState('17:00')
  const [endTime, setEndTime]     = useState('18:00')
  const [active, setActive]       = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  // Stats
  const [points, setPoints]       = useState(0)
  const [totalSessions, setTotalSessions] = useState(0)
  const [weekSessions, setWeekSessions]   = useState(0)
  const [recentSessions, setRecentSessions] = useState<any[]>([])

  // Verify parent password then load data
  const unlock = async () => {
    setGateLoading(true)
    setGateError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { error } = await supabase.auth.signInWithPassword({
      email:    user.email!,
      password: gatePassword,
    })

    if (error) {
      setGateError('Mot de passe incorrect.')
      setGateLoading(false)
      return
    }

    setUnlocked(true)
    setGateLoading(false)
    loadData()
  }

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Child
    const { data: c } = await supabase
      .from('children').select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1).maybeSingle()
    if (!c) { router.push('/onboarding'); return }
    setChild(c)

    // Schedule
    const { data: s } = await supabase
      .from('focus_schedules').select('*')
      .eq('child_id', c.id).maybeSingle()
    if (s) {
      setSchedule(s)
      setDays(s.days || [])
      setStartTime(s.start_time || '17:00')
      setEndTime(s.end_time || '18:00')
      setActive(s.active ?? true)
    }

    // Points
    const { data: p } = await supabase
      .from('points').select('total')
      .eq('child_id', c.id).maybeSingle()
    if (p) setPoints(p.total)

    // Total sessions
    const { count: total } = await supabase
      .from('study_sessions').select('id', { count: 'exact' })
      .eq('child_id', c.id)
    setTotalSessions(total || 0)

    // Sessions this week
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { count: week } = await supabase
      .from('study_sessions').select('id', { count: 'exact' })
      .eq('child_id', c.id)
      .gte('created_at', weekAgo.toISOString())
    setWeekSessions(week || 0)

    // Recent sessions (last 5)
    const { data: recent } = await supabase
      .from('study_sessions').select('*')
      .eq('child_id', c.id)
      .order('created_at', { ascending: false })
      .limit(5)
    if (recent) setRecentSessions(recent)
  }

  const toggleDay = (day: string) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const save = async () => {
    if (!child) return
    setSaving(true)
    const payload = {
      child_id:   child.id,
      days,
      start_time: startTime,
      end_time:   endTime,
      active,
    }
    if (schedule) {
      await supabase.from('focus_schedules').update(payload).eq('id', schedule.id)
    } else {
      const { data: inserted } = await supabase.from('focus_schedules').insert(payload).select().single()
      if (inserted) setSchedule(inserted)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // ── PASSWORD GATE ────────────────────────────────────────────────
  if (!unlocked) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #040D1F 0%, #0B1F4B 60%, #06122E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-jakarta)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/novere_logo.png" alt="NOVERE" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 16 }} />
          <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Portail parents
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, lineHeight: 1.6 }}>
            Entrez votre mot de passe pour accéder aux paramètres de votre enfant.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, border: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <input
              type="password"
              placeholder="Mot de passe du compte"
              value={gatePassword}
              onChange={e => setGatePassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlock()}
              style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 15, fontFamily: 'var(--font-jakarta)', outline: 'none' }}
            />
          </div>

          {gateError && (
            <p style={{ color: '#FCA5A5', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{gateError}</p>
          )}

          <button onClick={unlock} disabled={gateLoading || !gatePassword} style={{
            width: '100%', padding: '13px', background: gatePassword ? '#FBBF24' : 'rgba(255,255,255,.1)',
            color: gatePassword ? '#0B1F4B' : 'rgba(255,255,255,.3)',
            border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 15,
            cursor: gatePassword ? 'pointer' : 'default',
            fontFamily: 'var(--font-jakarta)', transition: 'all .2s',
          }}>
            {gateLoading ? 'Vérification...' : 'Accéder au portail →'}
          </button>

          <button onClick={() => router.push('/home')} style={{ width: '100%', marginTop: 12, padding: '10px', background: 'transparent', color: 'rgba(255,255,255,.3)', border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )

  // ── MAIN PORTAL ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>

      {/* Header */}
      <div style={{ background: '#0B1F4B', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '2px solid rgba(251,191,36,.2)' }}>
        <button onClick={() => router.push('/home/profile')} style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.6)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontFamily: 'var(--font-jakarta)', fontSize: 13 }}>
          ← Retour
        </button>
        <img src="/novere_logo.png" alt="NOVERE" style={{ width: 30, height: 30, objectFit: 'contain' }} />
        <span style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 19, fontWeight: 700 }}>NOVERE</span>
        <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>· Portail parents</span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Child card */}
        {child && (
          <div style={{ background: 'linear-gradient(135deg, #0B1F4B, #13306B)', borderRadius: 20, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-fredoka)', fontWeight: 700, color: '#fff', fontSize: 20 }}>{child.name}</p>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>
                {child.grade}ème année · Compagnon: <span style={{ color: '#FBBF24', fontWeight: 700 }}>{child.hero_name}</span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#FBBF24', fontWeight: 800, fontSize: 22, fontFamily: 'var(--font-fredoka)' }}>{points}</p>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700 }}>POINTS</p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { icon: '📚', val: totalSessions, label: 'Sessions totales' },
            { icon: '🗓️', val: weekSessions,  label: 'Cette semaine'    },
            { icon: '⭐', val: points,         label: 'Points gagnés'   },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: '16px 12px', border: '1.5px solid #E2E8F0', textAlign: 'center' }}>
              <p style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</p>
              <p style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{s.val}</p>
              <p style={{ color: '#94A3B8', fontSize: 11, fontWeight: 700, marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Study schedule */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1.5px solid #E2E8F0' }}>

          {/* Title + active toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 22 }}>
              Horaire d'étude ⏰
            </h2>
            <div onClick={() => setActive(a => !a)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: active ? '#059669' : '#94A3B8' }}>
                {active ? 'Actif' : 'Pausé'}
              </span>
              <div style={{ width: 44, height: 24, borderRadius: 99, background: active ? '#059669' : '#E2E8F0', position: 'relative', transition: 'background .2s' }}>
                <div style={{ position: 'absolute', top: 3, left: active ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
              </div>
            </div>
          </div>

          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Pendant ces créneaux, le timer Pomodoro de votre enfant est activé et les points sont comptabilisés.
          </p>

          {/* Days */}
          <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Jours actifs
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {DAYS_FR.map((d, i) => (
              <button key={d} onClick={() => toggleDay(DAYS_EN[i])} style={{
                padding: '8px 16px', borderRadius: 99, border: 'none',
                background: days.includes(DAYS_EN[i]) ? '#0B1F4B' : '#F1F5F9',
                color: days.includes(DAYS_EN[i]) ? '#FBBF24' : '#64748B',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'var(--font-jakarta)', transition: 'all .15s',
              }}>
                {d}
              </button>
            ))}
          </div>

          {/* Time window */}
          <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Créneau horaire
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
            <div>
              <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Début</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', padding: '11px 14px', background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 15, fontFamily: 'var(--font-jakarta)', outline: 'none', color: '#0B1F4B' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Fin</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '100%', padding: '11px 14px', background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 15, fontFamily: 'var(--font-jakarta)', outline: 'none', color: '#0B1F4B' }} />
            </div>
          </div>

          {/* Schedule preview */}
          {days.length > 0 && (
            <div style={{ background: '#F0F9FF', borderRadius: 14, padding: '12px 16px', marginBottom: 20, border: '1px solid #BAE6FD' }}>
              <p style={{ color: '#0369A1', fontSize: 13, fontWeight: 600 }}>
                📅 {days.map(d => DAYS_FR[DAYS_EN.indexOf(d)]).join(', ')} · {startTime} – {endTime}
              </p>
              <p style={{ color: '#0369A1', fontSize: 12, marginTop: 4, opacity: .7 }}>
                Durée : {(() => {
                  const [sh, sm] = startTime.split(':').map(Number)
                  const [eh, em] = endTime.split(':').map(Number)
                  const mins = (eh * 60 + em) - (sh * 60 + sm)
                  return mins > 0 ? `${mins} min` : '—'
                })()}
              </p>
            </div>
          )}

          {saved && (
            <div style={{ background: '#D1FAE5', borderRadius: 12, padding: '10px 16px', marginBottom: 14, color: '#065F46', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
              ✓ Horaire sauvegardé!
            </div>
          )}

          <button onClick={save} disabled={saving || days.length === 0} style={{
            width: '100%', padding: '14px',
            background: saving || days.length === 0 ? '#94A3B8' : '#0B1F4B',
            color: '#FBBF24', border: 'none', borderRadius: 14,
            fontWeight: 800, fontSize: 15,
            cursor: saving || days.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-jakarta)',
          }}>
            {saving ? 'Sauvegarde...' : days.length === 0 ? 'Choisissez au moins un jour' : 'Sauvegarder l\'horaire →'}
          </button>
        </div>

        {/* Recent activity */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1.5px solid #E2E8F0' }}>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 22, marginBottom: 16 }}>
            Activité récente 📊
          </h2>
          {recentSessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentSessions.map((s: any) => {
                const date = new Date(s.created_at)
                const isPomodoro = s.technique === 'pomodoro'
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F8FAFF', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isPomodoro ? '#FEF3C7' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {isPomodoro ? '⏱️' : '📖'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 14 }}>{s.subject}</p>
                      <p style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                        {date.toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric', month: 'short' })} · {s.duration_mins} min
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {s.points_earned > 0 ? (
                        <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                          +{s.points_earned} pts
                        </span>
                      ) : (
                        <span style={{ color: '#CBD5E1', fontSize: 12 }}>0 pts</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>📚</p>
              <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15, marginBottom: 4 }}>Aucune session encore</p>
              <p style={{ color: '#94A3B8', fontSize: 13 }}>L'activité apparaîtra ici après les premières sessions d'étude.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

