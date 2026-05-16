'use client'
import { useState, useEffect } from 'react'


type Props = {
  childId:  string
  palName:  string
  palette:  { main: string; accent: string; glow: string }
}


export default function NotificationPrompt({ childId, palName, palette }: Props) {
  const [status,   setStatus]   = useState<'idle'|'asking'|'granted'|'denied'|'unsupported'>('idle')
  const [visible,  setVisible]  = useState(false)
  const [dismissed, setDismissed] = useState(false)


  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported'); return
    }
    const perm = Notification.permission
    if (perm === 'granted') { setStatus('granted'); return }
    if (perm === 'denied')  { setStatus('denied');  return }


    // Check if already dismissed this session
    const key = `novere_notif_dismissed_${childId}`
    if (sessionStorage.getItem(key)) { setDismissed(true); return }


    // Show prompt after 3 seconds
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [childId])


  async function enable() {
    setStatus('asking')
    try {
      const reg  = await navigator.serviceWorker.register('/sw.js')
      const perm = await Notification.requestPermission()


      if (perm !== 'granted') { setStatus('denied'); setVisible(false); return }


      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: vapidKey,
      })




      await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: sub.toJSON(), childId }),
      })


      setStatus('granted')
      setVisible(false)
    } catch (err) {
      console.error('Notification setup error:', err)
      setStatus('denied')
      setVisible(false)
    }
  }


  function dismiss() {
    const key = `novere_notif_dismissed_${childId}`
    sessionStorage.setItem(key, '1')
    setDismissed(true)
    setVisible(false)
  }


  if (!visible || dismissed || status === 'granted' || status === 'denied' || status === 'unsupported') return null


  return (
    <div style={{
      position: 'fixed', bottom: 90, left: 16, right: 16, zIndex: 400,
      background: `linear-gradient(135deg, #0B1F4B, ${palette.main})`,
      border: `1px solid ${palette.main}66`,
      borderRadius: 20, padding: '16px 18px',
      boxShadow: `0 8px 32px rgba(0,0,0,.4), 0 0 0 1px ${palette.glow}`,
      fontFamily: 'var(--font-jakarta)',
      animation: 'slideUpPrompt .4s ease',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>🔔</span>
        <div>
          <p style={{ color: '#FBBF24', fontWeight: 800, fontSize: 14, margin: '0 0 4px', fontFamily: 'var(--font-fredoka)' }}>
            Ne rate jamais une session!
          </p>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>
            Active les rappels et {palName} t'avertira quand c'est l'heure d'étudier.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={dismiss}
          style={{ flex: 1, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '10px 0', color: 'rgba(255,255,255,.45)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}
        >
          Plus tard
        </button>
        <button
          onClick={enable}
          disabled={status === 'asking'}
          style={{ flex: 2, background: '#FBBF24', border: 'none', borderRadius: 12, padding: '10px 0', color: '#0B1F4B', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}
        >
          {status === 'asking' ? 'Activation...' : 'Activer les rappels 🔔'}
        </button>
      </div>
      <style>{`
        @keyframes slideUpPrompt {
          from { opacity:0; transform:translateY(20px) }
          to   { opacity:1; transform:translateY(0)    }
        }
      `}</style>
    </div>
  )
}


function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}
