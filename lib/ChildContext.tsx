'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type Pal = {
  name: string
  creature: string
  bodyShape: string
  palette: string
  feature: string
}

type Child = {
  id: string
  name: string
  grade: number
  personality: string
  hero_name: string
  pal: Pal
}

type ChildContextType = {
  child: Child | null
  loading: boolean
  refresh: () => Promise<void>
}

const ChildContext = createContext<ChildContextType>({
  child: null,
  loading: true,
  refresh: async () => {},
})

export function ChildProvider({ children }: { children: ReactNode }) {
  const [child, setChild]     = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchChild = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setChild(null); setLoading(false); return }

    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('ChildContext fetch error:', error)
      setChild(null)
    } else {
      setChild(data ?? null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchChild()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchChild()
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <ChildContext.Provider value={{ child, loading, refresh: fetchChild }}>
      {children}
    </ChildContext.Provider>
  )
}

export const useChild = () => useContext(ChildContext)

