'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'


export default function AuthPage() {
  const router = useRouter()
  const [mode,     setMode]     = useState<'signup'|'login'|'reset'>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)


  async function handle() {
    if (!email) return
    setLoading(true); setError(''); setSuccess('')


    if (mode === 'reset') {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (err) setError('Impossible d\'envoyer le courriel. Vérifiez l\'adresse.')
      else setSuccess('Un lien de réinitialisation a été envoyé à votre adresse courriel.')
      setLoading(false)
      return
    }


    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) setError(err.message)
      else setSuccess('Vérifiez votre courriel pour confirmer votre compte.')
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) setError('Identifiants incorrects. Veuillez réessayer.')
      else router.push('/home')
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


      <div style={{ width: '100%', maxWidth: 400 }}>


        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            NOVERE
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
            {mode === 'signup' ? 'Créez votre compte parent' : mode === 'reset' ? 'Réinitialiser le mot de passe' : 'Content de vous revoir'}
          </p>
        </div>


        {/* Mode toggle — only for login/signup */}
        {mode !== 'reset' && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,.06)', borderRadius: 14, padding: 4, marginBottom: 24 }}>
            {(['signup', 'login'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
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
        )}


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


          {mode !== 'reset' && (
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
          )}


          {error && (
            <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, padding: '10px 14px' }}>
              <p style={{ color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>{error}</p>
            </div>
          )}


          {success && (
            <div style={{ background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 12, padding: '10px 14px' }}>
              <p style={{ color: '#86EFAC', fontSize: 13, fontWeight: 600 }}>{success}</p>
            </div>
          )}


          <button onClick={handle} disabled={loading || !email || (mode !== 'reset' && !password)} style={{
            width: '100%', padding: '14px',
            background: email && (mode === 'reset' || password) ? '#FBBF24' : 'rgba(255,255,255,.1)',
            color: email && (mode === 'reset' || password) ? '#0B1F4B' : 'rgba(255,255,255,.3)',
            border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 15,
            cursor: email && (mode === 'reset' || password) ? 'pointer' : 'default',
            fontFamily: 'var(--font-jakarta)', transition: 'all .2s',
          }}>
            {loading ? 'Chargement...' : mode === 'signup' ? 'Créer mon compte →' : mode === 'reset' ? 'Envoyer le lien →' : 'Se connecter →'}
          </button>


          {/* Forgot password link */}
          {mode === 'login' && (
            <button onClick={() => { setMode('reset'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-jakarta)', textAlign: 'center', textDecoration: 'underline' }}>
              Mot de passe oublié?
            </button>
          )}


          {/* Back to login from reset */}
          {mode === 'reset' && (
            <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-jakarta)', textAlign: 'center' }}>
              ← Retour à la connexion
            </button>
          )}


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


