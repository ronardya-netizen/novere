'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '../layout'

type Episode = {
  id: string
  title: string
  description: string
  vimeo_url: string
  episode_number: number
}

type Mentor = {
  id: string
  name: string
  field: string
  bio: string
  avatar_emoji: string
  episodes: Episode[]
}

function getVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : ''
}

const T = {
  fr: {
    title: 'Mentors',
    subtitle: 'Découvre des métiers inspirants',
    episode: 'Épisode',
    watch: 'Regarder',
    noMentors: 'Les mentors arrivent bientôt!',
    noMentorsSub: 'De nouvelles vidéos sont en cours de production.',
    episodes: 'épisodes',
    episode1: 'épisode',
    spotlight: 'Spotlight',
    career: 'Carrière',
    close: 'Fermer',
  },
  cr: {
    title: 'Mentor yo',
    subtitle: 'Dekouvri metye ki enspire',
    episode: 'Episòd',
    watch: 'Gade',
    noMentors: 'Mentor yo ap vini byento!',
    noMentorsSub: 'Nouvo videyo yo ap pwodui kounye a.',
    episodes: 'episòd',
    episode1: 'episòd',
    spotlight: 'Spotlight',
    career: 'Karyè',
    close: 'Fèmen',
  }
}

export default function MentorsPage() {
  const { lang }   = useLang()
  const t          = T[lang]
  const [mentors, setMentors]         = useState<Mentor[]>([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState<Mentor | null>(null)
  const [activeEp, setActiveEp]       = useState<Episode | null>(null)
  const [isWide, setIsWide]           = useState(false)

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data: mentorData } = await supabase
        .from('mentors')
        .select('id, name, field, bio, avatar_emoji')
        .order('created_at', { ascending: true })

      if (!mentorData) { setLoading(false); return }

      const { data: epData } = await supabase
        .from('mentor_episodes')
        .select('*')
        .eq('published', true)
        .order('episode_number', { ascending: true })

      const enriched: Mentor[] = mentorData.map(m => ({
        ...m,
        bio: m.bio || '',
        avatar_emoji: m.avatar_emoji || '🎬',
        episodes: epData?.filter(e => e.mentor_id === m.id) || [],
      }))

      setMentors(enriched)
      setLoading(false)
    }
    load()
  }, [])

  const openMentor = (mentor: Mentor) => {
    setSelected(mentor)
    setActiveEp(mentor.episodes[0] || null)
  }

  const closeModal = () => {
    setSelected(null)
    setActiveEp(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1F4B' }}>
      <img src="/novere_logo.png" style={{ width: 56, height: 56, objectFit: 'contain', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100%', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)', position: 'relative' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0B1F4B 0%, #13306B 100%)', padding: isWide ? '32px 32px 36px' : '24px 20px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 99, padding: '4px 12px', marginBottom: 12 }}>
            <span style={{ fontSize: 12 }}>🎬</span>
            <span style={{ color: '#FBBF24', fontSize: 11, fontWeight: 700, letterSpacing: '.06em' }}>SPOTLIGHT MENTORS</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: isWide ? 32 : 26, fontWeight: 700, marginBottom: 6 }}>
            {t.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>{t.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isWide ? '28px 32px' : '20px 16px', maxWidth: 900, margin: '0 auto' }}>
        {mentors.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: 48, textAlign: 'center', border: '1.5px dashed #E2E8F0', marginTop: 16 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🎬</p>
            <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 16, marginBottom: 6 }}>{t.noMentors}</p>
            <p style={{ color: '#94A3B8', fontSize: 13 }}>{t.noMentorsSub}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isWide ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr', gap: 16 }}>
            {mentors.map(mentor => (
              <div key={mentor.id} onClick={() => openMentor(mentor)} style={{
                background: '#fff', borderRadius: 22, overflow: 'hidden',
                border: '1.5px solid #E2E8F0', cursor: 'pointer',
                transition: 'transform .2s, box-shadow .2s',
                boxShadow: '0 2px 8px rgba(0,0,0,.04)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,.04)' }}
              >
                {/* Card thumbnail */}
                <div style={{ background: 'linear-gradient(135deg, #0B1F4B, #3B52D4)', padding: '28px 20px 20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 90, opacity: .08 }}>🎬</div>

                  {/* Episode count badge */}
                  {mentor.episodes.length > 0 && (
                    <div style={{ position: 'absolute', top: 14, right: 14, background: '#FBBF24', color: '#0B1F4B', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
                      {mentor.episodes.length} {mentor.episodes.length === 1 ? t.episode1 : t.episodes}
                    </div>
                  )}

                  {/* Avatar */}
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,.12)', border: '2px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 14 }}>
                    {mentor.avatar_emoji || '🎬'}
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                    {mentor.name}
                  </h3>
                  <p style={{ color: '#FBBF24', fontSize: 12, fontWeight: 700 }}>{mentor.field}</p>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px 18px' }}>
                  {mentor.bio && (
                    <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                      {mentor.bio.length > 100 ? mentor.bio.slice(0, 100) + '...' : mentor.bio}
                    </p>
                  )}

                  {mentor.episodes.length > 0 ? (
                    <div style={{ background: '#F4F7FF', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: '#0B1F4B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#FBBF24', fontSize: 14 }}>▶</span>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 12, marginBottom: 1 }}>{t.episode} 1</p>
                        <p style={{ color: '#94A3B8', fontSize: 11 }}>{mentor.episodes[0].title}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#F4F7FF', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
                      <p style={{ color: '#94A3B8', fontSize: 12 }}>Bientôt disponible</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div onClick={closeModal} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 300,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          animation: 'fadeIn .2s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: isWide ? 720 : '100%',
            background: '#0B1F4B', borderRadius: isWide ? '24px 24px 0 0' : '24px 24px 0 0',
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            animation: 'slideUp .3s ease',
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                {selected.avatar_emoji}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
                  {selected.name}
                </h2>
                <p style={{ color: '#FBBF24', fontSize: 12, fontWeight: 700 }}>{selected.field}</p>
              </div>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: 'rgba(255,255,255,.6)', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-jakarta)' }}>
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px' }}>

              {/* Vimeo player */}
              {activeEp && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
                    <iframe
                      src={`https://player.vimeo.com/video/${getVimeoId(activeEp.vimeo_url)}?autoplay=0&color=FBBF24&title=0&byline=0&portrait=0`}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontWeight: 700, color: '#FBBF24', fontSize: 11, letterSpacing: '.06em', marginBottom: 4 }}>
                      {t.episode} {activeEp.episode_number}
                    </p>
                    <h3 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                      {activeEp.title}
                    </h3>
                    {activeEp.description && (
                      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, lineHeight: 1.6 }}>{activeEp.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Episode list */}
              {selected.episodes.length > 1 && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                    Tous les épisodes
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selected.episodes.map(ep => {
                      const isActive = activeEp?.id === ep.id
                      return (
                        <div key={ep.id} onClick={() => setActiveEp(ep)} style={{
                          background: isActive ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.06)',
                          border: `1px solid ${isActive ? 'rgba(251,191,36,.4)' : 'rgba(255,255,255,.08)'}`,
                          borderRadius: 14, padding: '12px 14px',
                          display: 'flex', alignItems: 'center', gap: 12,
                          cursor: 'pointer', transition: 'all .15s',
                        }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? '#FBBF24' : 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: isActive ? '#0B1F4B' : 'rgba(255,255,255,.5)', fontSize: 14, fontWeight: 800 }}>{isActive ? '▶' : ep.episode_number}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: isActive ? '#FBBF24' : 'rgba(255,255,255,.4)', fontSize: 10, fontWeight: 700, marginBottom: 2 }}>
                              {t.episode} {ep.episode_number}
                            </p>
                            <p style={{ color: isActive ? '#fff' : 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: isActive ? 700 : 400 }}>{ep.title}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* No episodes */}
              {selected.episodes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ fontSize: 36, marginBottom: 10 }}>🎬</p>
                  <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Épisodes bientôt disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  )
}


