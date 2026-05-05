'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = {
  navy:'#0B1F4B', gold:'#FBBF24',
  goldDim:'rgba(251,191,36,0.12)', goldBorder:'rgba(251,191,36,0.3)',
  bg:'#F4F7FF', white:'#FFFFFF',
  border:'#E2E8F0', text:'#0F172A',
  muted:'#64748B', faint:'#94A3B8',
  green:'#16A34A', greenBg:'#DCFCE7',
}

type Plan = 'free' | 'individual' | 'family'

const PLANS = [
  {
    id:       'free' as Plan,
    name:     'Gratuit',
    price:    0,
    period:   '',
    tagline:  'Pour découvrir NOVERE',
    color:    C.white,
    border:   C.border,
    features: [
      { label: '1 enfant',                   included: true  },
      { label: '3 sessions Pomodoro / jour', included: true  },
      { label: 'Accès aux Quêtes',           included: true  },
      { label: 'Boutique et liste de souhaits', included: true  },
      { label: 'Accès aux Mentors',          included: true  },
      { label: 'Sessions illimitées',        included: false },
      { label: 'Portail parents complet',    included: true  },
      { label: 'Rapport hebdomadaire',       included: false },
    ],
    cta:      'Commencer gratuitement',
    ctaBg:    C.bg,
    ctaColor: C.navy,
    ctaBorder:C.border,
  },
  {
    id:       'individual' as Plan,
    name:     'Individuel',
    price:    9.99,
    period:   '/ mois',
    tagline:  'Pour un enfant — tout inclus',
    color:    C.navy,
    border:   C.navy,
    featured: true,
    features: [
      { label: '1 enfant',                   included: true },
      { label: 'Sessions illimitées',        included: true },
      { label: 'Accès aux Quêtes',           included: true },
      { label: 'Boutique et liste de souhaits', included: true },
      { label: 'Accès aux Mentors',          included: true },
      { label: 'Portail parents complet',    included: true },
      { label: 'Rapport hebdomadaire',       included: true },
      { label: 'Support prioritaire',        included: true },
    ],
    cta:      'Choisir Individuel',
    ctaBg:    C.gold,
    ctaColor: C.navy,
    ctaBorder:C.gold,
    stripeKey: 'individual',
  },
  {
    id:       'family' as Plan,
    name:     'Famille',
    price:    19.99,
    period:   '/ mois',
    tagline:  'Jusqu\'à 3 enfants — meilleure valeur',
    color:    C.white,
    border:   C.border,
    features: [
      { label: 'Jusqu\'à 3 enfants',         included: true },
      { label: 'Sessions illimitées',        included: true },
      { label: 'Accès aux Quêtes',           included: true },
      { label: 'Boutique et liste de souhaits', included: true },
      { label: 'Accès aux Mentors',          included: true },
      { label: 'Portail parents complet',    included: true },
      { label: 'Rapport hebdomadaire',       included: true },
      { label: 'Support prioritaire',        included: true },
    ],
    cta:      'Choisir Famille',
    ctaBg:    C.navy,
    ctaColor: C.gold,
    ctaBorder:C.navy,
    stripeKey: 'family',
  },
]

export default function PricingPage() {
  const router  = useRouter()
  const [currentPlan, setCurrentPlan] = useState<Plan>('free')
  const [loading,     setLoading]     = useState<Plan | null>(null)
  const [sessionsLeft, setSessionsLeft] = useState<number | null>(null)

  useEffect(() => {
    loadPlan()
  }, [])

  async function loadPlan() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan) setCurrentPlan(profile.plan as Plan)

    // Get sessions remaining for free plan users
    if (profile?.plan === 'free' || !profile?.plan) {
      const { data: child } = await supabase
        .from('children')
        .select('sessions_today')
        .eq('parent_id', user.id)
        .single()
      if (child) setSessionsLeft(Math.max(0, 3 - (child.sessions_today ?? 0)))
    }
  }

  async function handleUpgrade(plan: Plan) {
    if (plan === 'free') return
    setLoading(plan)

    const res = await fetch('/api/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ plan }),
    })
    const { url, error } = await res.json()

    if (url) {
      window.location.href = url
    } else {
      console.error('Subscription error:', error)
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'var(--font-jakarta)', paddingBottom:80 }}>

      {/* Header */}
      <div style={{ background:C.navy, padding:'32px 20px 28px', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10, margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:700 }}>
          Plans et tarifs
        </p>
        <h1 style={{ color:C.white, fontSize:26, fontWeight:800, margin:'0 0 8px', fontFamily:'var(--font-fredoka)' }}>
          Choisissez votre plan
        </h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:0, maxWidth:340, marginLeft:'auto', marginRight:'auto' }}>
          Annulez à tout moment. Aucun engagement.
        </p>
      </div>

      {/* Session alert for free users */}
      {currentPlan === 'free' && sessionsLeft !== null && sessionsLeft <= 1 && (
        <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:14, margin:'20px 20px 0', padding:'14px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:18, flexShrink:0 }}>⏰</span>
          <div>
            <p style={{ color:'#92400E', fontWeight:700, fontSize:13, margin:'0 0 2px' }}>
              {sessionsLeft === 0 ? 'Limite atteinte pour aujourd\'hui' : '1 session restante aujourd\'hui'}
            </p>
            <p style={{ color:'#92400E', fontSize:12, margin:0 }}>
              Passez au plan Individuel pour des sessions illimitées.
            </p>
          </div>
        </div>
      )}

      <div style={{ padding:'28px 20px' }}>

        {/* Plan cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id
            return (
              <div key={plan.id} style={{
                background: plan.featured ? C.navy : C.white,
                border: `2px solid ${isCurrent ? C.gold : plan.featured ? C.navy : C.border}`,
                borderRadius:20, padding:'22px 20px',
                position:'relative', overflow:'hidden',
              }}>
                {/* Featured badge */}
                {plan.featured && (
                  <div style={{ position:'absolute', top:16, right:16, background:C.gold, borderRadius:8, padding:'4px 10px' }}>
                    <p style={{ color:C.navy, fontSize:10, fontWeight:800, margin:0, textTransform:'uppercase', letterSpacing:'0.5px' }}>Populaire</p>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrent && (
                  <div style={{ position:'absolute', top:16, right:16, background:C.goldDim, border:`1px solid ${C.goldBorder}`, borderRadius:8, padding:'4px 10px' }}>
                    <p style={{ color:plan.featured?C.white:C.navy, fontSize:10, fontWeight:700, margin:0 }}>Plan actuel</p>
                  </div>
                )}

                {/* Plan name + price */}
                <h2 style={{ color:plan.featured?C.white:C.navy, fontSize:18, fontWeight:800, margin:'0 0 2px', fontFamily:'var(--font-fredoka)' }}>
                  {plan.name}
                </h2>
                <p style={{ color:plan.featured?'rgba(255,255,255,0.5)':C.faint, fontSize:12, margin:'0 0 14px' }}>
                  {plan.tagline}
                </p>

                <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:18 }}>
                  <span style={{ color:plan.featured?C.gold:C.navy, fontSize:30, fontWeight:800, fontFamily:'var(--font-fredoka)' }}>
                    {plan.price === 0 ? 'Gratuit' : `${plan.price}$`}
                  </span>
                  {plan.period && (
                    <span style={{ color:plan.featured?'rgba(255,255,255,0.45)':C.faint, fontSize:13 }}>{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14, flexShrink:0 }}>
                        {f.included ? '✓' : '✗'}
                      </span>
                      <span style={{
                        color: f.included
                          ? (plan.featured ? 'rgba(255,255,255,0.85)' : C.text)
                          : (plan.featured ? 'rgba(255,255,255,0.3)' : C.faint),
                        fontSize: 13,
                        textDecoration: f.included ? 'none' : 'line-through',
                      }}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {!isCurrent ? (
                  <button
                    onClick={() => plan.id === 'free' ? router.push('/home') : handleUpgrade(plan.id)}
                    disabled={loading === plan.id}
                    style={{
                      width:'100%', background:plan.ctaBg, border:`1px solid ${plan.ctaBorder}`,
                      borderRadius:12, padding:'13px 0',
                      color:plan.ctaColor, fontSize:13, fontWeight:700,
                      cursor: loading===plan.id ? 'not-allowed' : 'pointer',
                      fontFamily:'var(--font-jakarta)', transition:'all 0.2s',
                      opacity: loading===plan.id ? 0.7 : 1,
                    }}
                  >
                    {loading===plan.id ? 'Redirection...' : plan.cta}
                  </button>
                ) : (
                  <div style={{ background:plan.featured?'rgba(251,191,36,0.15)':'rgba(11,31,75,0.05)', border:`1px solid ${plan.featured?C.goldBorder:C.border}`, borderRadius:12, padding:'13px 0', textAlign:'center' }}>
                    <p style={{ color:plan.featured?C.gold:C.navy, fontWeight:700, fontSize:13, margin:0 }}>
                      Votre plan actuel
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div style={{ marginTop:32 }}>
          <h2 style={{ color:C.navy, fontSize:15, fontWeight:800, margin:'0 0 16px', fontFamily:'var(--font-fredoka)' }}>
            Questions fréquentes
          </h2>
          {[
            {
              q: 'Puis-je annuler à tout moment?',
              a: 'Oui. Aucun engagement. Vous pouvez annuler depuis le portail parents → Profil → Gérer mon abonnement.',
            },
            {
              q: 'Qu\'est-ce qu\'une session Pomodoro?',
              a: 'Une session = 25 minutes de travail avec Nova. Le plan gratuit permet 3 sessions par jour, ce qui représente environ 75 minutes d\'étude.',
            },
            {
              q: 'Le plan Famille couvre combien d\'enfants?',
              a: 'Jusqu\'à 3 enfants sous un même compte parent. Chaque enfant a son propre profil, ses points, et sa liste de souhaits.',
            },
            {
              q: 'La boutique est-elle incluse dans tous les plans?',
              a: 'Oui. La boutique, la liste de souhaits et les réductions sont disponibles pour tous les plans, y compris le plan gratuit.',
            },
          ].map((faq, i) => (
            <div key={i} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
              <p style={{ color:C.navy, fontWeight:700, fontSize:13, margin:'0 0 6px' }}>{faq.q}</p>
              <p style={{ color:C.muted, fontSize:12, margin:0, lineHeight:1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
