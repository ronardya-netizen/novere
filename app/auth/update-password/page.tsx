'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'


export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)
  const [validSession, setValidSession] = useState(false)


  useEffect(() => {
    // Supabase automatically exchanges the token from the URL
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true)
      else setError('Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.')
    })
  }, [])


  async function handle() {
    if (!password) return
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6)  { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }


    setLoading(true); setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError('Erreur lors de la mise à jour. Réessayez.')
      setLoading(false)
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/auth'), 2500)
  }


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #040D1F 0%, #0B1F4B 60%, #06122E 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'var(--font-jakarta)',
    }}>
      <div style={{ position:'fixed', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.2) 0%, transparent 70%)', top:'10%', right:'5%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(251,191,36,.1) 0%, transparent 70%)', bottom:'15%', left:'8%', pointerEvents:'none' }} />


      <div style={{ width:'100%', maxWidth:400 }}>


        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <h1 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:32, fontWeight:700, marginBottom:8 }}>
            NOVERE
          </h1>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:14 }}>
            {success ? 'Mot de passe mis à jour!' : 'Créer un nouveau mot de passe'}
          </p>
        </div>


        <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:24, padding:28, display:'flex', flexDirection:'column', gap:14 }}>


          {success ? (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <p style={{ fontSize:40, marginBottom:12 }}>✅</p>
              <p style={{ color:'#86EFAC', fontWeight:700, fontSize:15, marginBottom:6 }}>Mot de passe mis à jour!</p>
              <p style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>Redirection vers la connexion...</p>
            </div>
          ) : !validSession ? (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <p style={{ fontSize:40, marginBottom:12 }}>⚠️</p>
              <p style={{ color:'#FCA5A5', fontWeight:700, fontSize:14, marginBottom:16 }}>{error}</p>
              <button onClick={() => router.push('/auth')} style={{ background:'#FBBF24', border:'none', borderRadius:12, padding:'12px 24px', color:'#0B1F4B', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,.05)', borderRadius:14, padding:'12px 16px', border:'1px solid rgba(255,255,255,.08)' }}>
                <span style={{ fontSize:18 }}>🔒</span>
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ flex:1, background:'none', border:'none', color:'#fff', fontSize:15, fontFamily:'var(--font-jakarta)', outline:'none' }}
                />
              </div>


              <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,.05)', borderRadius:14, padding:'12px 16px', border:'1px solid rgba(255,255,255,.08)' }}>
                <span style={{ fontSize:18 }}>🔒</span>
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handle()}
                  style={{ flex:1, background:'none', border:'none', color:'#fff', fontSize:15, fontFamily:'var(--font-jakarta)', outline:'none' }}
                />
              </div>


              {error && (
                <div style={{ background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)', borderRadius:12, padding:'10px 14px' }}>
                  <p style={{ color:'#FCA5A5', fontSize:13, fontWeight:600 }}>{error}</p>
                </div>
              )}


              <button
                onClick={handle}
                disabled={loading || !password || !confirm}
                style={{
                  width:'100%', padding:'14px',
                  background: password && confirm ? '#FBBF24' : 'rgba(255,255,255,.1)',
                  color: password && confirm ? '#0B1F4B' : 'rgba(255,255,255,.3)',
                  border:'none', borderRadius:14, fontWeight:800, fontSize:15,
                  cursor: password && confirm ? 'pointer' : 'default',
                  fontFamily:'var(--font-jakarta)', transition:'all .2s',
                }}
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe →'}
              </button>


              <button onClick={() => router.push('/auth')} style={{ background:'none', border:'none', color:'rgba(255,255,255,.3)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-jakarta)', textAlign:'center' }}>
                ← Retour à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
