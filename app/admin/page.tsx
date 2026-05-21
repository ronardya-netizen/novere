'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ArticlesAdmin from './components/ArticlesAdmin'
import GiftsAdmin from './components/GiftsAdmin'
import SessionsAdmin from './components/SessionsAdmin'
import RedemptionsAdmin from './components/RedemptionsAdmin'
import ProductsAdmin from './components/ProductsAdmin'
import UsersAdmin from './components/UsersAdmin'
import OrdersAdmin from './components/OrdersAdmin'


const TABS = [
  { id: 'products',    label: 'Produits',     icon: '🛍️' },
  { id: 'users',       label: 'Utilisateurs', icon: '👥' },
  { id: 'orders',      label: 'Commandes',    icon: '📦' },
  { id: 'mentors',     label: 'Mentors',      icon: '🌟' },
  { id: 'articles',    label: 'Articles',     icon: '🦸' },
  { id: 'gifts',       label: 'Cadeaux',      icon: '🎁' },
  { id: 'sessions',    label: 'Sessions',     icon: '📅' },
  { id: 'redemptions', label: 'Demandes',     icon: '🔔' },
]


type AdminUser = { id: string; email: string; full_name: string }


export default function AdminPage() {
  const [phase,    setPhase]    = useState<'checking'|'login'|'reset'|'authorized'|'unauthorized'>('checking')
  const [admin,    setAdmin]    = useState<AdminUser | null>(null)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [tab,      setTab]      = useState('products')


  useEffect(() => { checkSession() }, [])


  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setPhase('login'); return }
    await checkRole(session.user.id, session.user.email ?? '')
  }


  async function checkRole(userId: string, userEmail: string) {
    const { data: profile } = await supabase
      .from('profiles').select('role, full_name').eq('id', userId).single()
    console.log('Admin check:', { userId, profile })
    if (profile?.role === 'admin') {
      setAdmin({ id: userId, email: userEmail, full_name: profile.full_name ?? '' })
      setPhase('authorized')
    } else {
      setPhase('unauthorized')
    }
  }


  async function handleLogin() {
    if (!email || !password) return
    setLoading(true); setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !data.user) {
      setError('Identifiants incorrects. Veuillez réessayer.')
      setLoading(false); return
    }
    await checkRole(data.user.id, data.user.email ?? '')
    setLoading(false)
  }


  async function handleReset() {
    if (!email) return
    setLoading(true); setError(''); setSuccess('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (err) setError('Impossible d\'envoyer le courriel.')
    else setSuccess('Lien de réinitialisation envoyé à ' + email)
    setLoading(false)
  }


  async function handleSignOut() {
    await supabase.auth.signOut()
    setAdmin(null); setPhase('login'); setEmail(''); setPassword('')
  }


  const inputStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,.05)', borderRadius: 14,
    padding: '12px 16px', border: '1px solid rgba(255,255,255,.08)',
  }


  // ── CHECKING ──
  if (phase === 'checking') return <div style={{ minHeight:'100vh', background:'#0B1F4B' }} />


  // ── UNAUTHORIZED ──
  if (phase === 'unauthorized') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(145deg, #040D1F 0%, #0B1F4B 60%, #06122E 100%)', fontFamily:'var(--font-jakarta)' }}>
      <div style={{ textAlign:'center', padding:32 }}>
        <p style={{ fontSize:40, marginBottom:16 }}>🚫</p>
        <h2 style={{ color:'#fff', fontFamily:'var(--font-fredoka)', fontSize:24, marginBottom:8 }}>Accès non autorisé</h2>
        <p style={{ color:'rgba(255,255,255,.4)', fontSize:14, marginBottom:24 }}>Ce compte n'a pas les droits d'administration.</p>
        <button onClick={handleSignOut} style={{ background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.6)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-jakarta)', fontSize:14 }}>
          Se connecter avec un autre compte
        </button>
      </div>
    </div>
  )


  // ── LOGIN / RESET ──
  if (phase === 'login' || phase === 'reset') return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(145deg, #040D1F 0%, #0B1F4B 60%, #06122E 100%)', fontFamily:'var(--font-jakarta)', padding:24 }}>
      <div style={{ position:'fixed', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.2) 0%, transparent 70%)', top:'10%', right:'5%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(251,191,36,.1) 0%, transparent 70%)', bottom:'15%', left:'8%', pointerEvents:'none' }} />


      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32 }}>
          <h1 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:32, fontWeight:700, letterSpacing:2 }}>NOVERE</h1>
          <p style={{ color:'rgba(255,255,255,.35)', fontSize:13, marginTop:4 }}>
            {phase === 'reset' ? 'Réinitialiser le mot de passe' : 'Panneau d\'administration'}
          </p>
        </div>


        <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:28, padding:32, backdropFilter:'blur(20px)', display:'flex', flexDirection:'column', gap:14 }}>


          <div style={inputStyle}>
            <span style={{ fontSize:16 }}>📧</span>
            <input type="email" placeholder="Adresse courriel" value={email} onChange={e => setEmail(e.target.value)}
              style={{ flex:1, background:'none', border:'none', color:'#fff', fontSize:14, fontFamily:'var(--font-jakarta)', outline:'none' }} />
          </div>


          {phase === 'login' && (
            <div style={inputStyle}>
              <span style={{ fontSize:16 }}>🔒</span>
              <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ flex:1, background:'none', border:'none', color:'#fff', fontSize:14, fontFamily:'var(--font-jakarta)', outline:'none' }} />
            </div>
          )}


          {error && (
            <div style={{ background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)', borderRadius:12, padding:'10px 14px' }}>
              <p style={{ color:'#FCA5A5', fontSize:13, fontWeight:600 }}>{error}</p>
            </div>
          )}


          {success && (
            <div style={{ background:'rgba(34,197,94,.15)', border:'1px solid rgba(34,197,94,.3)', borderRadius:12, padding:'10px 14px' }}>
              <p style={{ color:'#86EFAC', fontSize:13, fontWeight:600 }}>{success}</p>
            </div>
          )}


          <button
            onClick={phase === 'reset' ? handleReset : handleLogin}
            disabled={loading || !email || (phase === 'login' && !password)}
            style={{ width:'100%', padding:14, background: email ? '#FBBF24' : 'rgba(255,255,255,.1)', color: email ? '#0B1F4B' : 'rgba(255,255,255,.3)', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor: email ? 'pointer' : 'default', fontFamily:'var(--font-jakarta)', transition:'all .2s' }}
          >
            {loading ? 'Chargement...' : phase === 'reset' ? 'Envoyer le lien →' : 'Entrer →'}
          </button>


          {phase === 'login' && (
            <button onClick={() => { setPhase('reset'); setError(''); setSuccess('') }} style={{ background:'none', border:'none', color:'rgba(255,255,255,.35)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-jakarta)', textDecoration:'underline' }}>
              Mot de passe oublié?
            </button>
          )}


          {phase === 'reset' && (
            <button onClick={() => { setPhase('login'); setError(''); setSuccess('') }} style={{ background:'none', border:'none', color:'rgba(255,255,255,.35)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
              ← Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  )


  // ── ADMIN PANEL ──
  return (
    <div style={{ minHeight:'100vh', background:'#F4F7FF', fontFamily:'var(--font-jakarta)' }}>
      <div style={{ background:'#0B1F4B', padding:'14px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'2px solid rgba(251,191,36,.2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <img src="/novere_logo.png" alt="NOVERE" style={{ width:44, height:44, objectFit:'contain' }} />
          <div>
            <p style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:22, fontWeight:700, letterSpacing:1.5, lineHeight:1 }}>NOVERE</p>
            <p style={{ color:'rgba(255,255,255,.3)', fontSize:11, fontWeight:600, letterSpacing:'.06em' }}>ADMIN</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>
            Connecté · <span style={{ color:'rgba(255,255,255,.7)' }}>{admin?.email}</span>
          </p>
          <button onClick={handleSignOut} style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.5)', border:'1px solid rgba(255,255,255,.1)', borderRadius:10, padding:'6px 16px', fontSize:13, cursor:'pointer', fontFamily:'var(--font-jakarta)' }}>
            Déconnexion
          </button>
        </div>
      </div>


      <div style={{ background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'0 32px', display:'flex', gap:4, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'16px 20px', border:'none', background:'transparent', color: tab===t.id ? '#0B1F4B' : '#94A3B8', fontWeight: tab===t.id ? 700 : 500, fontSize:14, cursor:'pointer', borderBottom: tab===t.id ? '2px solid #FBBF24' : '2px solid transparent', fontFamily:'var(--font-jakarta)', transition:'all .2s', whiteSpace:'nowrap' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>


      <div style={{ padding:32, maxWidth:1100, margin:'0 auto' }}>
        {tab === 'products'    && <ProductsAdmin />}
        {tab === 'users'       && <UsersAdmin />}
        {tab === 'orders'      && <OrdersAdmin />}
        {tab === 'articles'    && <ArticlesAdmin />}
        {tab === 'gifts'       && <GiftsAdmin />}
        {tab === 'sessions'    && <SessionsAdmin />}
        {tab === 'redemptions' && <RedemptionsAdmin />}
      </div>
    </div>
  )
}
