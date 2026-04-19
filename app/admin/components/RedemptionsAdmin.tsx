'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function RedemptionsAdmin() {
  const [requests, setRequests] = useState<any[]>([])

  const load = async () => {
    const { data } = await supabase
      .from('redemption_requests')
      .select('*, children(name), gifts(name, emoji, points_required)')
      .order('created_at', { ascending: false })
    if (data) setRequests(data)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('redemption_requests').update({ status }).eq('id', id)
    load()
  }

  const statusStyle = (status: string) => {
    if (status === 'pending')  return { bg: '#FEF3C7', color: '#D97706' }
    if (status === 'approved') return { bg: '#D1FAE5', color: '#059669' }
    return { bg: '#FEE2E2', color: '#DC2626' }
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-fredoka)', color: '#0B1F4B', fontSize: 24, marginBottom: 24 }}>
        Demandes de cadeaux 🔔
      </h2>

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, background: '#fff', borderRadius: 20, border: '1.5px dashed #E2E8F0' }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>🎁</p>
          <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15 }}>Aucune demande pour l'instant</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map((r: any) => {
            const s = statusStyle(r.status)
            return (
              <div key={r.id} style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{r.gifts?.emoji || '🎁'}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#0B1F4B', fontSize: 15 }}>{r.children?.name} → {r.gifts?.name}</p>
                  <p style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                    {r.gifts?.points_required} pts · {new Date(r.created_at).toLocaleDateString('fr-CA')}
                  </p>
                </div>
                <div style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>
                  {r.status === 'pending' ? 'En attente' : r.status === 'approved' ? 'Approuvé' : 'Refusé'}
                </div>
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => updateStatus(r.id, 'approved')} style={{ background: '#D1FAE5', color: '#059669', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
                      ✓ Approuver
                    </button>
                    <button onClick={() => updateStatus(r.id, 'rejected')} style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>
                      ✕ Refuser
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

