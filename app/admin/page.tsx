'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const [authed, setAuthed]   = useState(false)
  const [pw, setPw]           = useState('')
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState('mentors')

  const login = () => {
    if (pw === ADMIN_PASSWORD) setAuthed(true)
    else setError('Mot de passe incorrect')
  }

  if (!authed) return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(145deg,#040D1F,#0B1F4B)',
      fontFamily:'var(--font-jakarta)',
    }}>
      <div style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:24, padding:40, width:360 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:10 }}>😊</div>
          <h1 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:26 }}>
            NOV<span style={{ color:'#FBBF24' }}>ÈRE</span> Admin
          </h1>
        </div>
        <input
          type="password"
          placeholder="Mot de passe admin"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width:'100%', padding:'12px 16px', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:12, color:'#fff', fontSize:14, fontFamily:'var(--font-jakarta)', outline:'none', marginBottom:12 }}
        />
        {error && <p style={{ color:'#FCA5A5', fontSize:13, marginBottom:10 }}>{error}</p>}
        <button onClick={login} style={{ width:'100%', padding:13, background:'#FBBF24', color:'#0B1F4B', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
          Entrer →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#F4F7FF', fontFamily:'var(--font-jakarta)' }}>
      {/* Header */}
      <div style={{ background:'#0B1F4B', padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:24 }}>😊</span>
          <span style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:22 }}>
            NOV<span style={{ color:'#FBBF24' }}>ÈRE</span>
            <span style={{ color:'rgba(255,255,255,.3)', fontSize:14, marginLeft:10 }}>Admin</span>
          </span>
        </div>
        <button onClick={() => setAuthed(false)} style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.5)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'6px 16px', fontSize:13, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
          Déconnexion
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'0 32px', display:'flex', gap:4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'16px 20px', border:'none', background:'transparent',
            color: tab === t.id ? '#0B1F4B' : '#94A3B8',
            fontWeight: tab === t.id ? 700 : 500,
            fontSize:14, cursor:'pointer',
            borderBottom: tab === t.id ? '2px solid #0B1F4B' : '2px solid transparent',
            fontFamily:'var(--font-jakarta)',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding:32, maxWidth:900, margin:'0 auto' }}>
        {tab === 'mentors'  && <MentorsAdmin />}
        {tab === 'articles' && <ArticlesAdmin />}
        {tab === 'gifts'    && <GiftsAdmin />}
        {tab === 'sessions' && <SessionsAdmin />}
      </div>
    </div>
  )
}

