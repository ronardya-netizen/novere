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
  red:'#EF4444', redBg:'#FEE2E2',
}


type Plan = 'free' | 'monthly' | 'annual'


const PLANS = [
  {
    id:       'free' as Plan,
    name:     'Gratuit',
    price:    '0$',
    period:   '',
    tagline:  'Pour découvrir NOVERE',
    featured: false,
    description: 'Essayez NOVERE sans engagement. Votre enfant a droit à une session Pomodoro complète par jour, suivie d\'un mini-jeu de pause.',
    features: [
      { label: '1 enfant',                        included: true  },
      { label: '1 session Pomodoro / jour',        included: true  },
      { label: 'Mini-jeu de pause inclus',         included: true  },
      { label: 'Accès au compagnon IA',            included: true  },
      { label: 'Quêtes et articles éducatifs',     included: true  },
      { label: 'Boutique et liste de souhaits',    included: true  },
      { label: 'Accès aux vidéos Mentors',         included: true  },
      { label: 'Sessions illimitées',              included: false },
      { label: 'Rapport hebdomadaire par courriel',included: false },
    ],
    cta:      'Commencer gratuitement',
    ctaNote:  'Aucune carte de crédit requise',
    ctaBg:    C.bg,
    ctaColor: C.navy,
    ctaBorder:C.border,
  },
  {
    id:       'monthly' as Plan,
    name:     'Mensuel',
    price:    '4,99$',
    period:   '/ mois',
    tagline:  'Sessions illimitées — sans engagement',
    featured: true,
    description: 'Votre enfant étudie autant qu\'il le souhaite, chaque jour. Annulable à tout moment.',
    features: [
      { label: '1 enfant',                        included: true },
      { label: 'Sessions Pomodoro illimitées',    included: true },
      { label: 'Mini-jeu de pause inclus',        included: true },
      { label: 'Accès complet au compagnon IA',   included: true },
      { label: 'Quêtes et articles éducatifs',    included: true },
      { label: 'Boutique et liste de souhaits',   included: true },
      { label: 'Accès aux vidéos Mentors',        included: true },
      { label: 'Rapport hebdomadaire par courriel',included: true },
      { label: 'Support prioritaire',             included: true },
    ],
    cta:      'Choisir Mensuel →',
    ctaNote:  'Annulez à tout moment',
    ctaBg:    C.gold,
    ctaColor: C.navy,
    ctaBorder:C.gold,
    stripeKey:'monthly',
  },
  {
    id:       'annual' as Plan,
    name:     'Annuel',
    price:    '39,99$',
    period:   '/ an',
    tagline:  '3,33$ / mois · économisez 20$',
    featured: false,
    description: 'Tout ce qu\'offre le plan mensuel, avec deux mois offerts. Le choix des familles qui s\'engagent sur la durée.',
    features: [
      { label: '1 enfant',                        included: true },
      { label: 'Sessions Pomodoro illimitées',    included: true },
      { label: 'Mini-jeu de pause inclus',        included: true },
      { label: 'Accès complet au compagnon IA',   included: true },
      { label: 'Quêtes et articles éducatifs',    included: true },
      { label: 'Boutique et liste de souhaits',   included: true },
      { label: 'Accès aux vidéos Mentors',        included: true },
      { label: 'Rapport hebdomadaire par courriel',included: true },
      { label: 'Support prioritaire',             included: true },
    ],
    cta:      'Choisir Annuel →',
    ctaNote:  'Économisez 20$ vs mensuel',
    ctaBg:    C.navy,
    ctaColor: C.gold,
    ctaBorder:C.navy,
    stripeKey:'annual',
  },
]


export default function PricingPage() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan]   = useState<Plan>('free')
  const [sessionsLeft, setSessionsLeft] = useState<number | null>(null)
  const [loading, setLoading]           = useState<Plan | null>(null)


  useEffect(() => { loadPlan() }, [])


  async function loadPlan() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles').select('plan').eq('id', user.id).single()
    if (profile?.plan) setCurrentPlan(profile.plan as Plan)


    if (!profile?.plan || profile.plan === 'free') {
      const { data: child } = await supabase
        .from('children').select('sessions_today').eq('parent_id', user.id).single()
      if (child) setSessionsLeft(Math.max(0, 1 - (child.sessions_today ?? 0)))
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
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(null)
  }


  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'var(--font-jakarta)', paddingBottom:80 }}>


      {/* Header */}
      <div style={{ background:C.navy, padding:'32px 20px 28px', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10, margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:700 }}>
          Plans et tarifs
        </p>
        <h1 style={{ color:C.white, fontSize:26, fontWeight:800, margin:'0 0 10px', fontFamily:'var(--font-fredoka)' }}>
          Investissez dans la réussite de votre enfant
        </h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:'0 auto', maxWidth:380, lineHeight:1.6 }}>
          Commencez gratuitement. Passez au mensuel ou annuel quand vous êtes prêt.
        </p>
      </div>


      {/* Session alert */}
      {currentPlan === 'free' && sessionsLeft === 0 && (
        <div style={{ background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:14, margin:'20px 20px 0', padding:'14px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:18, flexShrink:0 }}>⏰</span>
          <div>
            <p style={{ color:'#92400E', fontWeight:700, fontSize:13, margin:'0 0 2px' }}>Session utilisée pour aujourd'hui</p>
            <p style={{ color:'#92400E', fontSize:12, margin:0 }}>Passez au plan Mensuel pour des sessions illimitées.</p>
          </div>
        </div>
      )}


      <div style={{ padding:'28px 20px' }}>


        {/* Savings banner */}
        <div style={{ background:C.goldDim, border:`1px solid ${C.goldBorder}`, borderRadius:14, padding:'12px 16px', marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
          <p style={{ color:C.navy, fontSize:13, fontWeight:600, margin:0 }}>
            Le plan annuel vous fait économiser <strong>20$ par an</strong> — soit 2 mois offerts par rapport au mensuel.
          </p>
        </div>


        {/* Plan cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id
            return (
              <div key={plan.id} style={{
                background: plan.featured ? C.navy : C.white,
                border: `2px solid ${isCurrent ? C.gold : plan.featured ? C.navy : C.border}`,
                borderRadius:20, padding:'22px 20px', position:'relative',
              }}>
                {/* Popular badge */}
                {plan.featured && (
                  <div style={{ position:'absolute', top:16, right:16, background:C.gold, borderRadius:8, padding:'4px 10px' }}>
                    <p style={{ color:C.navy, fontSize:10, fontWeight:800, margin:0, textTransform:'uppercase', letterSpacing:'0.5px' }}>Populaire</p>
                  </div>
                )}
                {/* Annual savings badge */}
                {plan.id === 'annual' && !isCurrent && (
                  <div style={{ position:'absolute', top:16, right:16, background:C.greenBg, border:'1px solid #86EFAC', borderRadius:8, padding:'4px 10px' }}>
                    <p style={{ color:C.green, fontSize:10, fontWeight:800, margin:0 }}>-33%</p>
                  </div>
                )}
                {/* Current plan badge */}
                {isCurrent && (
                  <div style={{ position:'absolute', top:16, right:16, background:C.goldDim, border:`1px solid ${C.goldBorder}`, borderRadius:8, padding:'4px 10px' }}>
                    <p style={{ color: plan.featured ? C.white : C.navy, fontSize:10, fontWeight:700, margin:0 }}>Plan actuel</p>
                  </div>
                )}


                {/* Name + price */}
                <h2 style={{ color: plan.featured ? C.white : C.navy, fontSize:18, fontWeight:800, margin:'0 0 2px', fontFamily:'var(--font-fredoka)' }}>
                  {plan.name}
                </h2>
                <p style={{ color: plan.featured ? 'rgba(255,255,255,0.5)' : C.faint, fontSize:12, margin:'0 0 10px' }}>
                  {plan.tagline}
                </p>
                <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:12 }}>
                  <span style={{ color: plan.featured ? C.gold : C.navy, fontSize:28, fontWeight:800, fontFamily:'var(--font-fredoka)' }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ color: plan.featured ? 'rgba(255,255,255,0.45)' : C.faint, fontSize:13 }}>{plan.period}</span>
                  )}
                </div>


                {/* Description */}
                <p style={{ color: plan.featured ? 'rgba(255,255,255,0.65)' : C.muted, fontSize:12, lineHeight:1.6, margin:'0 0 16px' }}>
                  {plan.description}
                </p>


                {/* Divider */}
                <div style={{ height:1, background: plan.featured ? 'rgba(255,255,255,0.1)' : C.border, marginBottom:14 }} />


                {/* Features */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', background: f.included ? C.greenBg : C.redBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ color: f.included ? C.green : C.red, fontSize:9, fontWeight:800 }}>{f.included ? '✓' : '–'}</span>
                      </div>
                      <span style={{
                        color: f.included
                          ? (plan.featured ? 'rgba(255,255,255,0.85)' : C.text)
                          : (plan.featured ? 'rgba(255,255,255,0.3)' : C.faint),
                        fontSize:13,
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
                      fontFamily:'var(--font-jakarta)', opacity: loading===plan.id ? 0.7 : 1,
                      marginBottom:6,
                    }}
                  >
                    {loading===plan.id ? 'Redirection...' : plan.cta}
                  </button>
                ) : (
                  <div style={{ background: plan.featured ? 'rgba(251,191,36,0.15)' : C.bg, border:`1px solid ${plan.featured ? C.goldBorder : C.border}`, borderRadius:12, padding:'13px 0', textAlign:'center', marginBottom:6 }}>
                    <p style={{ color: plan.featured ? C.gold : C.navy, fontWeight:700, fontSize:13, margin:0 }}>Votre plan actuel</p>
                  </div>
                )}
                <p style={{ color: plan.featured ? 'rgba(255,255,255,0.35)' : C.faint, fontSize:11, textAlign:'center', margin:0 }}>
                  {plan.ctaNote}
                </p>
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
              q: 'Qu\'est-ce qu\'une session Pomodoro?',
              a: 'Une session = 25 minutes d\'étude guidée avec le compagnon IA, suivie d\'un mini-jeu de pause de 5 minutes. Le plan gratuit offre 1 session complète par jour.',
            },
            {
              q: 'Quelle est la différence entre mensuel et annuel?',
              a: 'Les deux plans offrent exactement les mêmes fonctionnalités. Le plan annuel est simplement facturé en une fois à 39,99$ au lieu de 4,99$/mois — vous économisez 20$ par an.',
            },
            {
              q: 'Puis-je annuler à tout moment?',
              a: 'Oui. Le plan mensuel peut être annulé à tout moment depuis le portail parents → Profil → Mon abonnement. Le plan annuel est remboursable dans les 30 jours suivant l\'achat.',
            },
            {
              q: 'La boutique est-elle incluse dans tous les plans?',
              a: 'Oui. La boutique, la liste de souhaits et les réductions basées sur les points sont disponibles pour tous les plans, y compris le plan gratuit.',
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
