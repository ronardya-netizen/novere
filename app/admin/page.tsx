'use client'
import { useState } from 'react'
import MentorsAdmin from './components/MentorsAdmin'
import ArticlesAdmin from './components/ArticlesAdmin'
import GiftsAdmin from './components/GiftsAdmin'
import SessionsAdmin from './components/SessionsAdmin'

const ADMIN_PASSWORD = 'novere2025'

const tabs = [
  { id: 'mentors',  label: 'Mentors',  icon: '🌟' },
  { id: 'articles', label: 'Articles', icon: '🦸' },
  { id: 'gifts',    label: 'Cadeaux',  icon: '🎁' },
  { id: 'sessions', label: 'Sessions', icon: '📅' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw]         = useState('')
  const [error, setError]   = useState('')
  const [tab, setTab]       = useState('mentors')

  const login = () => {
    if (pw === ADMIN_PASSWORD) setAuthed(true)
    else setError('Mot de passe incorrect')
  }

  if (!authed) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #040D1F 0%, #0B1F4B 60%, #06122E 100%)',
      fontFamily: 'var(--font-jakarta)',
    }}>
      {/* Glow blobs */}
      <div style={{ position:'fixed', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.2) 0%, transparent 70%)', top:'10%', right:'5%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(251,191,36,.1) 0%, transparent 70%)', bottom:'15%', left:'8%', pointerEvents:'none' }} />

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo + name */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/novere_logo.png"
            alt="NOVERE"
            style={{ width: 90, height: 90, marginBottom: 16 }}
          />
          <h1 style={{
            fontFamily: 'var(--font-fredoka)',
            color: '#FFFFFF',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 2,
          }}>
            NOVERE
          </h1>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13, marginTop: 4 }}>
            Panneau d'administration
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 28,
          padding: 32,
          backdropFilter: 'blur(20px)',
        }}>
          <input
            type="password"
            placeholder="Mot de passe admin"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{
              width: '100%',
              padding: '13px 16px',
              background: 'rgba(255,255,255,.07)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 14,
              fontFamily: 'var(--font-jakarta)',
              outline: 'none',
              marginBottom: 12,
            }}
          />
          {error && (
            <p style={{ color: '#FCA5A5', fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}
          <button
            onClick={login}
            style={{
              width: '100%',
              padding: 14,
              background: '#FBBF24',
              color: '#0B1F4B',
              border: 'none',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'var(--font-jakarta)',
            }}
          >
            Entrer →
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7FF', fontFamily: 'var(--font-jakarta)' }}>

      {/* Header */}
      <div style={{
        background: '#0B1F4B',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid rgba(251,191,36,.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/novere_logo.png" alt="NOVERE" style={{ width: 40, height: 40 }} />
          <div>
            <p style={{
              fontFamily: 'var(--font-fredoka)',
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 1.5,
              lineHeight: 1,
            }}>
              NOVERE
            </p>
            <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 11, fontWeight: 600, letterSpacing: '.06em' }}>
              ADMIN
            </p>
          </div>
        </div>
        <button
          onClick={() => setAuthed(false)}
          style={{
            background: 'rgba(255,255,255,.08)',
            color: 'rgba(255,255,255,.5)',
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 10,
            padding: '6px 16px',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'var(--font-jakarta)',
          }}
        >
          Déconnexion
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 32px',
        display: 'flex',
        gap: 4,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '16px 22px',
            border: 'none',
            background: 'transparent',
            color: tab === t.id ? '#0B1F4B' : '#94A3B8',
            fontWeight: tab === t.id ? 700 : 500,
            fontSize: 14,
            cursor: 'pointer',
            borderBottom: tab === t.id ? '2px solid #FBBF24' : '2px solid transparent',
            fontFamily: 'var(--font-jakarta)',
            transition: 'all .2s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
        {tab === 'mentors'  && <MentorsAdmin />}
        {tab === 'articles' && <ArticlesAdmin />}
        {tab === 'gifts'    && <GiftsAdmin />}
        {tab === 'sessions' && <SessionsAdmin />}
      </div>
    </div>
  )
}

