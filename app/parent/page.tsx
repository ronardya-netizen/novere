'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const DAYS_EN = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function ParentPage() {
  const router = useRouter()
  const [child, setChild]         = useState<any>(null)
  const [schedule, setSchedule]   = useState<any>(null)
  const [days, setDays]           = useState<string[]>([])
  const [startTime, setStartTime] = useState('17:00')
  const [endTime, setEndTime]     = useState('18:00')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: c } = await supabase.from('children').select('*').eq('parent_id', user.id).single()
      if (!c) { router.push('/onboarding'); return }
      setChild(c)

      const { data: s } = await supabase.from('focus_schedules').select('*').eq('child_id', c.id).single()
      if (s) {
        setSchedule(s)
        setDays(s.days || [])
        setStartTime(s.start_time || '17:00')
        setEndTime(s.end_time || '18:00')
      }
    }
    load()
  }, [])

  const toggleDay = (day: string) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const save = async () => {
    if (!child) return
    setSaving(true)
    const payload = { child_id: child.id, days, start_time: startTime, end_time: endTime, active: true }

    if (schedule) {
      await supabase.from('focus_schedules').update(payload).eq('id', schedule.id)
    } else {
      await supabase.from('focus_schedules').insert(payload)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>

      {/* Header */}
      <div style={{ background: '#0B1F4B', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '2px solid rgba(251,191,36,.2)' }}>
        <button onClick={() => router.push('/home/profile')} style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.6)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'var(--font-jakarta)', fontSize: 14 }}>
          ← Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/novere_logo.png" alt="NOVERE" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>NOVERE</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, marginLeft: 4 }}>· Portail parents</span>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
        {child && (
          <div style={{ background: '#fff', borderRadius: 20, padding: '18px 20px', border: '1.5px solid #E2E8F0', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F4F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👤</div>
            <div>
              <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 16 }}>{child.name}</p>
              <p style={{ color: '#64748B', fontSize: 13 }}>Année {child.grade} · Compagnon: {child.hero_name}</p>
            </div>
          </div>
        )}

        {/* Study schedule */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1.5px solid #E2E8F0', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 22, marginBottom: 6 }}>
            Horaire d'étude ⏰
          </h2>
          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>
            Pendant ces heures, l'app passe en mode focus pour votre enfant.
          </p>

          {/* Days */}
          <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Jours actifs</p>
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

          {/* Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#0B1F4B', fontSize: 13, marginBottom: 8 }}>Heure de début</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', padding: '11px 14px', background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 15, fontFamily: 'var(--font-jakarta)', outline: 'none', color: '#0B1F4B' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#0B1F4B', fontSize: 13, marginBottom: 8 }}>Heure de fin</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '100%', padding: '11px 14px', background: '#F8FAFF', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 15, fontFamily: 'var(--font-jakarta)', outline: 'none', color: '#0B1F4B' }} />
            </div>
          </div>

          {saved && (
            <div style={{ background: '#D1FAE5', borderRadius: 12, padding: '10px 16px', marginBottom: 16, color: '#065F46', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
              ✓ Horaire sauvegardé!
            </div>
          )}

          <button onClick={save} disabled={saving} style={{
            width: '100%', padding: '14px', background: saving ? '#94A3B8' : '#0B1F4B',
            color: '#FBBF24', border: 'none', borderRadius: 14,
            fontWeight: 800, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-jakarta)',
          }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder l\'horaire →'}
          </button>
        </div>

      </div>
    </div>
  )
}

