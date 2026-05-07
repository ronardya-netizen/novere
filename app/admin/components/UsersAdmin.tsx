'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'


const C = {
  navy:'#0B1F4B', gold:'#FBBF24',
  goldDim:'rgba(251,191,36,0.1)', goldBorder:'rgba(251,191,36,0.25)',
  bg:'#F4F7FF', white:'#FFFFFF', border:'#E2E8F0',
  text:'#0F172A', muted:'#64748B', faint:'#94A3B8',
  green:'#16A34A', greenBg:'#DCFCE7',
  red:'#EF4444', redBg:'#FEE2E2',
}


type Child = {
  id: string; name: string; grade: number | null
  sessions_today: number | null
}
type PointsRow = { total_points: number }
type User = {
  id: string; email: string; full_name: string; plan: string
  created_at: string; children: Child[]; points: PointsRow | null
}


const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit', individual: 'Individuel', family: 'Famille', user: 'Gratuit',
}
const PLAN_COLORS: Record<string, { bg: string; color: string }> = {
  free:       { bg:'#F3F4F6',   color:'#6B7280'  },
  user:       { bg:'#F3F4F6',   color:'#6B7280'  },
  individual: { bg:C.goldDim,   color:C.navy     },
  family:     { bg:C.greenBg,   color:C.green    },
}


export default function UsersAdmin() {
  const [users,   setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [toast,   setToast]   = useState('')
  const [expanded,setExpanded]= useState<string | null>(null)


  useEffect(() => { load() }, [])


  async function load() {
    setLoading(true)


    // Get all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, plan, created_at')
      .in('role', ['user', 'parent'])
      .order('created_at', { ascending: false })


    if (!profiles) { setLoading(false); return }


    // Get auth emails via admin API — using service role not available client-side
    // Instead join with children and points
    const result: User[] = await Promise.all(profiles.map(async p => {
      const [{ data: children }, { data: points }] = await Promise.all([
        supabase.from('children').select('id, name, grade, sessions_today').eq('parent_id', p.id),
        supabase.from('points').select('total_points').eq('child_id', p.id).single(),
      ])
      return {
        id:         p.id,
        email:      '', // populated below
        full_name:  p.full_name ?? '',
        plan:       p.plan ?? 'free',
        created_at: p.created_at,
        children:   children ?? [],
        points:     points,
      }
    }))


    setUsers(result)
    setLoading(false)
  }


  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }


  async function changePlan(userId: string, plan: string) {
    await supabase.from('profiles').update({ plan }).eq('id', userId)
    showToast('Plan mis à jour.')
    await load()
  }


  async function resetSessions(childId: string) {
    await supabase.from('children').update({ sessions_today: 0, sessions_reset_at: new Date().toISOString().split('T')[0] }).eq('id', childId)
    showToast('Sessions remises à zéro.')
    await load()
  }


  async function deleteUser(userId: string) {
    if (!confirm('Supprimer ce compte et toutes ses données? Cette action est irréversible.')) return
    await supabase.from('children').delete().eq('parent_id', userId)
    await supabase.from('auth.users').delete().eq('id', userId)
    showToast('Compte supprimé.')
    await load()
  }


  const filtered = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || u.plan === filter || (filter === 'free' && (u.plan === 'free' || u.plan === 'user'))
    return matchSearch && matchFilter
  })


  const stats = {
    total:      users.length,
    free:       users.filter(u => u.plan === 'free' || u.plan === 'user').length,
    individual: users.filter(u => u.plan === 'individual').length,
    family:     users.filter(u => u.plan === 'family').length,
  }


  return (
    <div style={{ fontFamily:'var(--font-jakarta)' }}>


      {toast && (
        <div style={{ background:C.greenBg, border:'1px solid #86EFAC', borderRadius:10, padding:'10px 16px', marginBottom:16 }}>
          <p style={{ color:C.green, fontWeight:700, fontSize:13, margin:0 }}>{toast}</p>
        </div>
      )}


      {/* Header + stats */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ color:C.navy, fontFamily:'var(--font-fredoka)', fontSize:24, margin:'0 0 16px' }}>Utilisateurs</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { label:'Total comptes',     value:stats.total,      color:C.navy },
            { label:'Plan Gratuit',      value:stats.free,       color:C.muted },
            { label:'Plan Individuel',   value:stats.individual, color:'#D97706' },
            { label:'Plan Famille',      value:stats.family,     color:C.green },
          ].map((s,i) => (
            <div key={i} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px' }}>
              <p style={{ color:s.color, fontWeight:800, fontSize:22, margin:'0 0 2px', fontFamily:'var(--font-fredoka)' }}>{s.value}</p>
              <p style={{ color:C.faint, fontSize:11, margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>


      {/* Search + filter */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200, position:'relative' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.faint, fontSize:14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom..."
            style={{ width:'100%', background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 12px 9px 34px', color:C.text, fontSize:13, fontFamily:'var(--font-jakarta)', outline:'none', boxSizing:'border-box' as const }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[{id:'all',label:'Tous'},{id:'free',label:'Gratuit'},{id:'individual',label:'Individuel'},{id:'family',label:'Famille'}].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ background: filter===f.id ? C.navy : C.white, border:`1px solid ${filter===f.id ? C.navy : C.border}`, borderRadius:99, padding:'8px 16px', color: filter===f.id ? C.gold : C.muted, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>


      {/* User list */}
      {loading ? (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:32, textAlign:'center' }}>
          <p style={{ color:C.faint, fontSize:14 }}>Chargement...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:32, textAlign:'center' }}>
          <p style={{ color:C.faint, fontSize:14 }}>Aucun utilisateur trouvé.</p>
        </div>
      ) : filtered.map(u => {
        const planStyle = PLAN_COLORS[u.plan] ?? PLAN_COLORS.free
        const isExpanded = expanded === u.id
        return (
          <div key={u.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, marginBottom:10, overflow:'hidden' }}>


            {/* User row */}
            <div style={{ padding:'14px 18px', display:'flex', gap:12, alignItems:'center', cursor:'pointer' }} onClick={() => setExpanded(isExpanded ? null : u.id)}>
              {/* Avatar */}
              <div style={{ width:40, height:40, borderRadius:'50%', background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:C.gold, fontWeight:800, fontSize:16, fontFamily:'var(--font-fredoka)' }}>{(u.full_name || '?')[0].toUpperCase()}</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:C.navy, fontWeight:700, fontSize:14, margin:'0 0 2px' }}>{u.full_name || 'Sans nom'}</p>
                <p style={{ color:C.faint, fontSize:12, margin:0 }}>
                  Inscrit le {new Date(u.created_at).toLocaleDateString('fr-CA')} · {u.children.length} enfant(s)
                </p>
              </div>
              <span style={{ background:planStyle.bg, color:planStyle.color, fontSize:11, fontWeight:700, borderRadius:99, padding:'4px 10px', flexShrink:0 }}>
                {PLAN_LABELS[u.plan] ?? 'Gratuit'}
              </span>
              <span style={{ color:C.faint, fontSize:18 }}>{isExpanded ? '▲' : '▼'}</span>
            </div>


            {/* Expanded details */}
            {isExpanded && (
              <div style={{ borderTop:`1px solid ${C.border}`, padding:'16px 18px', background:C.bg }}>


                {/* Plan management */}
                <div style={{ marginBottom:16 }}>
                  <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 8px' }}>Changer le plan</p>
                  <div style={{ display:'flex', gap:8 }}>
                    {[{id:'free',label:'Gratuit'},{id:'individual',label:'Individuel'},{id:'family',label:'Famille'}].map(plan => (
                      <button key={plan.id} onClick={() => changePlan(u.id, plan.id)} style={{ background: u.plan===plan.id || (u.plan==='user' && plan.id==='free') ? C.navy : C.white, border:`1px solid ${u.plan===plan.id ? C.navy : C.border}`, borderRadius:8, padding:'7px 14px', color: u.plan===plan.id || (u.plan==='user' && plan.id==='free') ? C.gold : C.muted, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                        {plan.label}
                      </button>
                    ))}
                  </div>
                </div>


                {/* Children */}
                {u.children.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 8px' }}>Enfants</p>
                    {u.children.map(ch => (
                      <div key={ch.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                        <div style={{ flex:1 }}>
                          <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 2px' }}>{ch.name}</p>
                          <p style={{ color:C.faint, fontSize:12, margin:0 }}>
                            {ch.grade ? `Année ${ch.grade}` : 'Niveau non défini'} · {ch.sessions_today ?? 0} session(s) aujourd'hui
                          </p>
                        </div>
                        <button onClick={() => resetSessions(ch.id)} style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:8, padding:'6px 12px', color:'#92400E', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                          Réinitialiser sessions
                        </button>
                      </div>
                    ))}
                  </div>
                )}


                {/* Delete */}
                <button onClick={() => deleteUser(u.id)} style={{ background:C.redBg, border:'1px solid #FCA5A5', borderRadius:8, padding:'7px 16px', color:C.red, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  Supprimer le compte
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
