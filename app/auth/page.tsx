'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode]         = useState<'login' | 'signup'>('signup')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handle = async () => {
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://novere.vercel.app/onboarding',
        },
      })
      if (error) { setError(error.message); setLoading(false); return }
      // Always go to verify page after signup
      router.push('/verify')
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
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/novere_logo.png" alt="NOVERE" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 16 }} />
          <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            NOVÈRE
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
            {mode === 'signup' ? 'Crée ton compte parent' : 'Bienvenue de retour'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.06)', borderRadius: 14, padding: 4, marginBottom: 24 }}>
          {(['signup', 'login'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none',
              background: mode === m ? '#FBBF24' : 'transparent',
              color: mode === m ? '#0B1F4B' : 'rgba(255,255,255,.4)',
              fontWeight: 800, fontSize: 14, cursor: 'pointer',
              fontFamily: 'var(--font-jakarta)', transition: 'all .2s',
            }}>
              {m === 'signup' ? 'Créer un compte' : 'Se connecter'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ fontSize: 18 }}>📧</span>
            <input
              type="email"
              placeholder="Adresse courriel"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 15, fontFamily: 'var(--font-jakarta)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.05)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
              style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 15, fontFamily: 'var(--font-jakarta)', outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, padding: '10px 14px' }}>
              <p style={{ color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>{error}</p>
            </div>
          )}

          <button onClick={handle} disabled={loading || !email || !password} style={{
            width: '100%', padding: '14px',
            background: email && password ? '#FBBF24' : 'rgba(255,255,255,.1)',
            color: email && password ? '#0B1F4B' : 'rgba(255,255,255,.3)',
            border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 15,
            cursor: email && password ? 'pointer' : 'default',
            fontFamily: 'var(--font-jakarta)', transition: 'all .2s',
          }}>
            {loading ? 'Chargement...' : mode === 'signup' ? 'Créer mon compte →' : 'Se connecter →'}
          </button>

          {mode === 'signup' && (
            <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
              En créant un compte, vous acceptez nos conditions d'utilisation. Un courriel de vérification sera envoyé.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

