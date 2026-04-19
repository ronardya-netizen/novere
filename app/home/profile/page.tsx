'use client'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div style={{ padding: 28, fontFamily: 'var(--font-jakarta)', color: '#0B1F4B', maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'var(--font-fredoka)', fontSize: 28, marginBottom: 24 }}>Profil</h1>
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1.5px solid #E2E8F0', marginBottom: 16 }}>
        <p style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>Récompenses, activité et paramètres — bientôt disponible.</p>
        <button onClick={logout} style={{
          background: '#FEE2E2', color: '#DC2626', border: 'none',
          borderRadius: 12, padding: '12px 24px', fontWeight: 700,
          fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-jakarta)',
        }}>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}


