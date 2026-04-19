'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode]         = useState<'login' | 'signup'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/onboarding')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/home')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #040D1F 0%, #0B1F4B 60%, #06122E 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'var(--font-jakarta)',
    }}>
      {/* Glow blobs */}
      <div style={{ position:'fixed', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.2) 0%, transparent 70%)', top:'10%', right:'5%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(251,191,36,.1) 0%, transparent 70%)', bottom:'15%', left:'8%', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:36 }}>
          <img
            src="/novere_logo.png"
            alt="NOVERE"
            style={{ width:100, height:100, objectFit:'contain', marginBottom:16 }}
          />
          <h1 style={{ fontFamily:'var(--font-fredoka)', color:'#FFFFFF', fontSize:32, fontWeight:700, letterSpacing:2 }}>
            NOVERE
          </h1>
          <p style={{ color:'rgba(255,255,255,.35)', fontSize:14, marginTop:4 }}>
            Nouvel Héritage
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:'rgba(255,255,255,.05)',
          border:'1px solid rgba(255,255,255,.1)',
          borderRadius:28, padding:32,
          backdropFilter:'blur(20px)',
        }}>
          {/* Toggle */}
          <div style={{ display:'flex', background:'rgba(255,255,255,.06)', borderRadius:14, padding:4, marginBottom:28 }}>
            {(['login','signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex:1, padding:'10px 0', borderRadius:11, border:'none',
                background: mode === m ? '#FBBF24' : 'transparent',
                color: mode === m ? '#0B1F4B' : 'rgba(255,255,255,.45)',
                fontWeight:700, fontSize:14, cursor:'pointer',
                transition:'all .2s', fontFamily:'var(--font-jakarta)',
              }}>
                {m === 'login' ? 'Connexion' : 'Créer un compte'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode === 'signup' && (
              <input
                placeholder="Votre nom complet"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
            )}
            <input
              placeholder="Adresse courriel"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Mot de passe"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ color:'#FCA5A5', fontSize:13, marginTop:12, textAlign:'center' }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width:'100%', marginTop:22, padding:'14px',
              background: loading ? 'rgba(251,191,36,.5)' : '#FBBF24',
              color:'#0B1F4B', border:'none', borderRadius:14,
              fontWeight:800, fontSize:16,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:'var(--font-jakarta)', transition:'all .2s',
            }}
          >
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter →' : 'Créer mon compte →'}
          </button>

          <p style={{ color:'rgba(255,255,255,.25)', fontSize:12, textAlign:'center', marginTop:20, lineHeight:1.6 }}>
            Une partie de chaque abonnement aide des enfants en Haiti 🇭🇹
          </p>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'13px 16px',
  background:'rgba(255,255,255,.07)',
  border:'1px solid rgba(255,255,255,.1)',
  borderRadius:12, color:'#fff', fontSize:14,
  fontFamily:'var(--font-jakarta)',
  outline:'none',
}

