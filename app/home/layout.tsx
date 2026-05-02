'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useChild } from '@/lib/ChildContext'
import { useState, useEffect, createContext, useContext } from 'react'

const LangContext = createContext<{ lang: 'fr' | 'cr'; setLang: (l: 'fr' | 'cr') => void }>({ lang: 'fr', setLang: () => {} })
export const useLang = () => useContext(LangContext)

const PALETTES: Record<string, { main: string; accent: string }> = {
  ocean:   { main: '#3B52D4', accent: '#7DD3FC' },
  fire:    { main: '#EA580C', accent: '#FDE68A' },
  forest:  { main: '#16A34A', accent: '#BBF7D0' },
  cosmic:  { main: '#7C3AED', accent: '#DDD6FE' },
  sunrise: { main: '#DB2777', accent: '#FDE68A' },
  storm:   { main: '#475569', accent: '#BAE6FD' },
  gold:    { main: '#D97706', accent: '#FEF3C7' },
  night:   { main: '#1E293B', accent: '#C7D2FE' },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const path   = usePathname()
  const router = useRouter()
  const { child } = useChild()
  const [lang, setLang]       = useState<'fr' | 'cr'>('fr')
  const [isMobile, setIsMobile] = useState(true)

  const palName = child?.pal?.name || '...'
  const palId   = child?.pal?.palette || 'ocean'
  const palette = PALETTES[palId] || PALETTES.ocean

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const tabs = [
    { id: 'home',    path: '/home',          labelFr: 'Accueil',  labelCr: 'Akèy',   icon: HomeIcon    },
    { id: 'ask',     path: '/home/ask',       labelFr: palName,    labelCr: palName,  icon: PalIcon     },
    { id: 'mentors', path: '/home/mentors',   labelFr: 'Mentors',  labelCr: 'Mentor', icon: MentorIcon  },
    { id: 'quests',  path: '/home/quests',    labelFr: 'Quêtes',   labelCr: 'Kèt',    icon: QuestIcon   },
    { id: 'profile', path: '/home/profile',   labelFr: 'Profil',   labelCr: 'Pwofil', icon: ProfileIcon },
  ]

  const active = tabs.find(t => path === t.path || path.startsWith(t.path + '/'))?.id || 'home'

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>

        {/* SIDEBAR — tablet/desktop */}
        {!isMobile && (
          <div style={{
            width: 240, background: '#0B1F4B', display: 'flex', flexDirection: 'column',
            padding: '28px 16px', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
            borderRight: '1px solid rgba(255,255,255,.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, paddingLeft: 8 }}>
              <img src="/novere_logo.png" alt="NOVERE" style={{ width: 36, height: 36, objectFit: 'contain' }} />
              <span style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 1.5 }}>NOVERE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {tabs.map(t => {
                const isActive = active === t.id
                return (
                  <button key={t.id} onClick={() => router.push(t.path)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 14, border: 'none',
                    background: isActive ? palette.main : 'transparent',
                    cursor: 'pointer', transition: 'all .2s', textAlign: 'left',
                    fontFamily: 'var(--font-jakarta)',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <t.icon color={isActive ? '#FBBF24' : 'rgba(255,255,255,.45)'} />
                    </div>
                    <span style={{ color: isActive ? '#fff' : 'rgba(255,255,255,.45)', fontWeight: isActive ? 700 : 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'fr' ? t.labelFr : t.labelCr}
                    </span>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: 4, gap: 4 }}>
              {(['fr', 'cr'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 9, border: 'none',
                  background: lang === l ? '#FBBF24' : 'transparent',
                  color: lang === l ? '#0B1F4B' : 'rgba(255,255,255,.4)',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'var(--font-jakarta)', transition: 'all .2s',
                }}>
                  {l === 'fr' ? 'FR' : 'KR'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{
          flex: 1,
          marginLeft: isMobile ? 0 : 240,
          paddingBottom: isMobile ? 80 : 0,
          maxWidth: isMobile ? '100%' : 'calc(100% - 240px)',
          overflowX: 'hidden',
        }}>
          {children}
        </div>

        {/* BOTTOM NAV — mobile */}
        {isMobile && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff', borderTop: '1px solid #E8EEF9',
            display: 'flex', padding: '8px 0 16px', zIndex: 100,
            boxShadow: '0 -4px 20px rgba(0,0,0,.06)',
          }}>
            {tabs.map(t => {
              const isActive = active === t.id
              return (
                <button key={t.id} onClick={() => router.push(t.path)} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: isActive ? '#0B1F4B' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .2s',
                  }}>
                    <t.icon color={isActive ? '#FBBF24' : '#94A3B8'} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? '#0B1F4B' : '#94A3B8', maxWidth: 54, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lang === 'fr' ? t.labelFr : t.labelCr}
                  </span>
                </button>
              )
            })}

            <div style={{ display: 'flex', alignItems: 'center', paddingRight: 6 }}>
              <button onClick={() => setLang(lang === 'fr' ? 'cr' : 'fr')} style={{
                background: '#F1F5F9', border: 'none', borderRadius: 10,
                padding: '6px 10px', fontSize: 11, fontWeight: 700,
                color: '#64748B', cursor: 'pointer', fontFamily: 'var(--font-jakarta)',
              }}>
                {lang === 'fr' ? 'KR' : 'FR'}
              </button>
            </div>
          </div>
        )}
      </div>
    </LangContext.Provider>
  )
}

function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
function PalIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <circle cx="9"  cy="11" r="1.5" fill={color} />
      <circle cx="15" cy="11" r="1.5" fill={color} />
      <path d="M9 15C9 15 10.5 17 12 17C13.5 17 15 15 15 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function MentorIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="14" rx="3" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M10 9L15 12L10 15V9Z" fill={color} />
      <path d="M8 20L12 18L16 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function QuestIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15 8.5L22 9.3L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.3L9 8.5L12 2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
function ProfileIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
      <path d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

