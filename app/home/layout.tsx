'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useChild } from '@/lib/ChildContext'

const PALETTES: Record<string, { main: string; accent: string }> = {
  ocean:   { main: '#2563EB', accent: '#7DD3FC' },
  fire:    { main: '#EA580C', accent: '#FDE68A' },
  forest:  { main: '#16A34A', accent: '#BBF7D0' },
  cosmic:  { main: '#7C3AED', accent: '#DDD6FE' },
  sunrise: { main: '#DB2777', accent: '#FDE68A' },
  storm:   { main: '#475569', accent: '#BAE6FD' },
  gold:    { main: '#D97706', accent: '#FEF3C7' },
  night:   { main: '#1E293B', accent: '#C7D2FE' },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { child } = useChild()

  const palName    = child?.pal?.name || 'Ton compagnon'
  const paletteid  = child?.pal?.palette || 'ocean'
  const palette    = PALETTES[paletteid] || PALETTES.ocean

  const tabs = [
    { id: 'home',     path: '/home',         icon: HomeIcon,    label: 'Accueil'  },
    { id: 'ask',      path: '/home/ask',      icon: PalIcon,     label: palName    },
    { id: 'quests',   path: '/home/quests',   icon: QuestIcon,   label: 'Quêtes'   },
    { id: 'mentors',  path: '/home/mentors',  icon: MentorIcon,  label: 'Mentors'  },
    { id: 'profile',  path: '/home/profile',  icon: ProfileIcon, label: 'Profil'   },
  ]

  const active = tabs.find(t => pathname === t.path)?.id || 'home'

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#F4F7FF', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: 'var(--font-jakarta)' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {children}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: '#fff',
        borderTop: '1px solid #E8EEF9',
        display: 'flex',
        padding: '8px 4px 16px',
        zIndex: 100,
      }}>
        {tabs.map(t => {
          const isActive = active === t.id
          return (
            <button key={t.id} onClick={() => router.push(t.path)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 14,
                background: isActive ? '#0B1F4B' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}>
                <t.icon
                  color={isActive ? '#FBBF24' : '#94A3B8'}
                  palColor={palette.main}
                  isActive={isActive}
                />
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: isActive ? '#0B1F4B' : '#94A3B8',
                maxWidth: 60, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── ICONS ────────────────────────────────────────────────────────
function HomeIcon({ color }: { color: string; palColor?: string; isActive?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color === '#FBBF24' ? 'rgba(251,191,36,.2)' : 'none'} />
    </svg>
  )
}

function PalIcon({ color, palColor, isActive }: { color: string; palColor?: string; isActive?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill={isActive ? 'rgba(251,191,36,.15)' : 'none'} />
      <circle cx="9"  cy="11" r="1.5" fill={color} />
      <circle cx="15" cy="11" r="1.5" fill={color} />
      <path d="M9 15C9 15 10.5 17 12 17C13.5 17 15 15 15 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function QuestIcon({ color, isActive }: { color: string; palColor?: string; isActive?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15 8.5L22 9.3L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.3L9 8.5L12 2Z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"
        fill={isActive ? 'rgba(251,191,36,.2)' : 'none'} />
    </svg>
  )
}

function MentorIcon({ color, isActive }: { color: string; palColor?: string; isActive?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill={isActive ? 'rgba(251,191,36,.15)' : 'none'} />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" fill={isActive ? color : 'none'} opacity={isActive ? .3 : 1} />
      <circle cx="12" cy="5"  r="1.2" fill={color} />
      <circle cx="12" cy="19" r="1.2" fill={color} />
      <circle cx="5"  cy="12" r="1.2" fill={color} />
      <circle cx="19" cy="12" r="1.2" fill={color} />
    </svg>
  )
}

function ProfileIcon({ color, isActive }: { color: string; palColor?: string; isActive?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" fill={isActive ? 'rgba(251,191,36,.2)' : 'none'} />
      <path d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}


