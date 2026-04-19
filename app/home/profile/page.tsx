'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useChild } from '@/lib/ChildContext'
import { useRouter } from 'next/navigation'
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

const T = {
  fr: {
    title: 'Profil', points: 'points', nextGift: 'Prochain cadeau',
    catalog: 'Catalogue cadeaux 🎁', redeem: 'Demander',
    requested: 'Demandé ✓', stock: 'Stock',
    activity: 'Activité récente 📚', noActivity: 'Aucune activité pour l\'instant.',
    parentSettings: 'Paramètres parents ⚙️',
    parentSettingsSub: 'Gérez les horaires d\'étude et les préférences de votre enfant.',
    manageProfile: 'Gérer le profil →',
    logout: 'Se déconnecter',
    pts: 'pts',
  },
  cr: {
    title: 'Pwofil', points: 'pwen', nextGift: 'Pwochen kado',
    catalog: 'Katalòg kado 🎁', redeem: 'Mande',
    requested: 'Mande ✓', stock: 'Stock',
    activity: 'Aktivite resan 📚', noActivity: 'Pa gen aktivite pou kounye a.',
    parentSettings: 'Paramèt paran ⚙️',
    parentSettingsSub: 'Jere orè etid ak preferans pitit ou.',
    manageProfile: 'Jere pwofil →',
    logout: 'Dekonekte',
    pts: 'pwen',
  }
}

export default function ProfilePage() {
  const { child }   = useChild()
  const router      = useRouter()
  const { lang }    = useLang()
  const t           = T[lang]

  const [points, setPoints]           = useState(0)
  const [gifts, setGifts]             = useState<any[]>([])
  const [activity, setActivity]       = useState<any[]>([])
  const [requested, setRequested]     = useState<Set<string>>(new Set())
  const [isWide, setIsWide]           = useState(false)
  const [requesting, setRequesting]   = useState<string | null>(null)

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!child) return

    supabase.from('points').select('total').eq('child_id', child.id).single()
      .then(({ data }: any) => { if (data) setPoints(data.total) })

    supabase.from('gifts').select('*').eq('active', true).order('points_required')
      .then(({ data }: any) => { if (data) setGifts(data) })

    supabase.from('study_sessions')
      .select('*').eq('child_id', child.id)
      .order('created_at', { ascending: false }).limit(10)
      .then(({ data }: any) => { if (data) setActivity(data) })

    supabase.from('redemption_requests')
      .select('gift_id').eq('child_id', child.id).eq('status', 'pending')
      .then(({ data }: any) => {
        if (data) setRequested(new Set(data.map((r: any) => r.gift_id)))
      })
  }, [child])

  const handleRedeem = async (gift: any) => {
    if (!child || points < gift.points_required) return
    setRequesting(gift.id)

    const { error } = await supabase.from('redemption_requests').insert({
      child_id: child.id,
      gift_id:  gift.id,
    })

    if (!error) setRequested(prev => new Set([...prev, gift.id]))
    setRequesting(null)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (!child) return null

  const palette  = PALETTES[child.pal?.palette || 'ocean']
  const palName  = child.pal?.name || '...'
  const nextGift = gifts.find(g => g.points_required > points)
  const progress = nextGift ? Math.min((points / nextGift.points_required) * 100, 100) : 100

  return (
    <div style={{ minHeight: '100%', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0B1F4B 0%, #13306B 100%)', padding: isWide ? '32px 32px 40px' : '24px 20px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
            <PalSVG
              creature={child.pal?.creature || 'land'}
              shape={child.pal?.bodyShape || 'round'}
              palette={palette}
              feature={child.pal?.feature || 'eyes'}
              size={80}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, marginBottom: 4 }}>{t.title}</p>
            <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              {child.name}
            </h1>
            <p style={{ color: '#FBBF24', fontSize: 13, fontWeight: 700 }}>
              {palName} · {child.personality}
            </p>
          </div>
        </div>

        {/* Points card */}
        <div style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: '18px 20px', marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>⭐</span>
            <span style={{ fontFamily: 'var(--font-fredoka)', fontSize: 42, fontWeight: 700, color: '#FBBF24', lineHeight: 1 }}>{points}</span>
            <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, alignSelf: 'flex-end', paddingBottom: 4 }}>{t.points}</span>
          </div>
          {nextGift && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>{t.nextGift}: {nextGift.emoji} {nextGift.name}</span>
                <span style={{ color: '#FBBF24', fontWeight: 700, fontSize: 12 }}>{points} / {nextGift.points_required}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 99 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #FBBF24, #F97316)', borderRadius: 99, transition: 'width .5s ease' }} />
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: isWide ? '28px 32px' : '20px 18px', display: 'flex', flexDirection: 'column', gap: 28, maxWidth: isWide ? 900 : '100%', margin: '0 auto' }}>

        {/* Gift catalog */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
            {t.catalog}
          </h2>
          {gifts.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1.5px dashed #E2E8F0', textAlign: 'center' }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>🎁</p>
              <p style={{ color: '#94A3B8', fontSize: 14 }}>La boutique arrive bientôt</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isWide ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 12 }}>
              {gifts.map((g: any) => {
                const canAfford   = points >= g.points_required
                const isRequested = requested.has(g.id)
                const isLoading   = requesting === g.id
                return (
                  <div key={g.id} style={{
                    background: isRequested ? 'linear-gradient(135deg, #FEF9EC, #FDE68A)' : '#fff',
                    border: `1.5px solid ${isRequested ? '#FBBF24' : canAfford ? palette.main : '#E2E8F0'}`,
                    borderRadius: 20, padding: '18px 14px', textAlign: 'center',
                    opacity: canAfford || isRequested ? 1 : .7,
                    transition: 'all .2s',
                    position: 'relative',
                  }}>
                    {isRequested && (
                      <div style={{ position: 'absolute', top: 8, right: 8, background: '#22C55E', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 99 }}>
                        ✓
                      </div>
                    )}
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{g.emoji}</div>
                    <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 13, marginBottom: 4 }}>{g.name}</p>
                    <p style={{ color: canAfford ? palette.main : '#94A3B8', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                      {g.points_required} {t.pts}
                    </p>
                    <button
                      onClick={() => handleRedeem(g)}
                      disabled={!canAfford || isRequested || !!isLoading}
                      style={{
                        width: '100%', padding: '8px', borderRadius: 10, border: 'none',
                        background: isRequested ? '#D1FAE5' : canAfford ? palette.main : '#F1F5F9',
                        color: isRequested ? '#059669' : canAfford ? '#fff' : '#94A3B8',
                        fontWeight: 700, fontSize: 12, cursor: canAfford && !isRequested ? 'pointer' : 'default',
                        fontFamily: 'var(--font-jakarta)', transition: 'all .2s',
                      }}
                    >
                      {isLoading ? '...' : isRequested ? t.requested : t.redeem}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Activity */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
            {t.activity}
          </h2>
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
            {activity.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center' }}>
                <p style={{ color: '#94A3B8', fontSize: 14 }}>{t.noActivity}</p>
              </div>
            ) : (
              activity.map((a: any, i: number) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  borderBottom: i < activity.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F4F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    📚
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#0B1F4B', fontSize: 13 }}>{a.subject || 'Session d\'étude'}</p>
                    <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 2 }}>
                      {new Date(a.created_at).toLocaleDateString('fr-CA')} · {a.duration_mins || 0} min
                    </p>
                  </div>
                  <span style={{ color: '#22C55E', fontWeight: 800, fontSize: 13 }}>+{a.points_earned || 0}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Parent settings */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
            {t.parentSettings}
          </h2>
          <div style={{ background: 'linear-gradient(135deg, #F0F9FF, #EFF6FF)', borderRadius: 20, padding: '20px', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
            onClick={() => router.push('/parent')}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              ⚙️
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15, marginBottom: 4 }}>{t.parentSettings}</p>
              <p style={{ color: '#64748B', fontSize: 13 }}>{t.parentSettingsSub}</p>
            </div>
            <span style={{ color: '#3B52D4', fontSize: 22, fontWeight: 700 }}>›</span>
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout} style={{
          width: '100%', padding: '14px', background: '#FEE2E2',
          color: '#DC2626', border: 'none', borderRadius: 16,
          fontWeight: 700, fontSize: 15, cursor: 'pointer',
          fontFamily: 'var(--font-jakarta)',
        }}>
          {t.logout}
        </button>

      </div>

      <style>{`
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
      `}</style>
    </div>
  )
}

