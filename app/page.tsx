 'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Root() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/home')
      else router.push('/auth')
    })
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'#0B1F4B', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <img src="/novere_logo.png" style={{ width:64, height:64, objectFit:'contain', animation:'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  )
}

