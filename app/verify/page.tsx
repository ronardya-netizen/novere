'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
  const router = useRouter()
  const [resent, setResent]   = useState(false)
  const [loading, setLoading] = useState(false)

  const resendEmail = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: { emailRedirectTo: 'https://novere.vercel.app/onboarding' },
      })
    }
    setResent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #040D1F 0%, #0B1F4B 60%, #06122E 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'var(--font-jakarta)',
    }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>

        {/* Logo */}
        <img src="/novere_logo.png" alt="NOVERE" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 20 }} />

        {/* Welcome heading */}
        <h1 style={{ fontFamily: 'var(--font-fredoka)', color: '#fff', fontSize: 34, fontWeight: 700, marginBottom: 10 }}>
          Bienvenue sur NOVERE! 🎉
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
          Votre compte a été créé avec succès. Merci de vérifier votre email avant de poursuivre.
        </p>

        {/* Email box */}
        <div style={{
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 24, padding: '32px 28px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>📬</div>
          <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#FBBF24', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            Vérifiez votre courriel
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Vous avez reçu un lien de vérification. Cliquez sur le lien dans le courriel pour accéder à l'inscription de votre enfant.
          </p>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, textAlign: 'left' }}>
            {[
              { n: '1', text: 'Ouvre ton application de courriel' },
              { n: '2', text: 'Cherche un message de NOVERE' },
              { n: '3', text: 'Clique sur le lien de vérification' },
              { n: '4', text: 'Crée le profil de ton enfant' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#FBBF24', fontWeight: 800, fontSize: 14 }}>{step.n}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>{step.text}</p>
              </div>
            ))}
          </div>

          {/* Resend button */}
          {!resent ? (
            <button onClick={resendEmail} disabled={loading} style={{
              width: '100%', padding: '12px',
              background: 'rgba(255,255,255,.08)',
              color: 'rgba(255,255,255,.6)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 14, fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: 'var(--font-jakarta)',
            }}>
              {loading ? 'Envoi...' : 'Renvoyer le courriel'}
            </button>
          ) : (
            <div style={{ background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 14, padding: '12px' }}>
              <p style={{ color: '#86EFAC', fontWeight: 700, fontSize: 14 }}>✓ Courriel renvoyé!</p>
            </div>
          )}
        </div>

        {/* Already verified */}
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, marginBottom: 12 }}>
          Avez vous déjà vérifié votre compte?
        </p>
        <button onClick={() => router.push('/home')} style={{
          background: 'transparent', border: 'none',
          color: '#FBBF24', fontWeight: 700, fontSize: 14,
          cursor: 'pointer', fontFamily: 'var(--font-jakarta)',
          textDecoration: 'underline',
        }}>
          Accéder à l'accueil →
        </button>
      </div>
    </div>
  )
}

