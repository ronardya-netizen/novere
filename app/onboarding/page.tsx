'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useChild } from '@/lib/ChildContext'

const CREATURE_TYPES = [
  { id: 'land',   label: 'Terrestre', icon: '🐾', desc: 'Ancré et courageux'    },
  { id: 'sea',    label: 'Marin',     icon: '🌊', desc: 'Profond et mystérieux'  },
  { id: 'sky',    label: 'Céleste',   icon: '🕊️', desc: 'Libre et rapide'        },
  { id: 'cosmic', label: 'Cosmique',  icon: '✨', desc: 'Rare et lumineux'       },
]

const BODY_SHAPES = [
  { id: 'round',  label: 'Petit & rond',       shape: 'M50,20 C75,20 85,40 85,55 C85,75 70,85 50,85 C30,85 15,75 15,55 C15,40 25,20 50,20Z' },
  { id: 'tall',   label: 'Grand & élancé',     shape: 'M50,10 C65,10 75,25 75,40 L75,75 C75,85 65,90 50,90 C35,90 25,85 25,75 L25,40 C25,25 35,10 50,10Z' },
  { id: 'sturdy', label: 'Large & solide',     shape: 'M20,25 C20,15 35,10 50,10 C65,10 80,15 80,25 L85,70 C85,82 70,88 50,88 C30,88 15,82 15,70Z' },
  { id: 'wispy',  label: 'Mystérieux & léger', shape: 'M50,15 C62,15 72,25 74,38 C80,42 84,50 82,60 C78,75 65,85 50,85 C35,85 22,75 18,60 C16,50 20,42 26,38 C28,25 38,15 50,15Z' },
]

const PALETTES = [
  { id: 'ocean',   name: 'Océan',   main: '#2563EB', accent: '#7DD3FC', glow: 'rgba(37,99,235,.4)'   },
  { id: 'fire',    name: 'Feu',     main: '#EA580C', accent: '#FDE68A', glow: 'rgba(234,88,12,.4)'   },
  { id: 'forest',  name: 'Forêt',   main: '#16A34A', accent: '#BBF7D0', glow: 'rgba(22,163,74,.4)'   },
  { id: 'cosmic',  name: 'Cosmos',  main: '#7C3AED', accent: '#DDD6FE', glow: 'rgba(124,58,237,.4)'  },
  { id: 'sunrise', name: 'Aurore',  main: '#DB2777', accent: '#FDE68A', glow: 'rgba(219,39,119,.4)'  },
  { id: 'storm',   name: 'Tempête', main: '#475569', accent: '#BAE6FD', glow: 'rgba(71,85,105,.4)'   },
  { id: 'gold',    name: 'Or',      main: '#D97706', accent: '#FEF3C7', glow: 'rgba(217,119,6,.4)'   },
  { id: 'night',   name: 'Nuit',    main: '#1E293B', accent: '#C7D2FE', glow: 'rgba(30,41,59,.4)'    },
]

const FEATURES = [
  { id: 'ears',    label: 'Grandes oreilles', icon: '👂' },
  { id: 'eyes',    label: 'Yeux lumineux',    icon: '👁️' },
  { id: 'wings',   label: 'Ailes',            icon: '🪶' },
  { id: 'shell',   label: 'Carapace',         icon: '🐚' },
  { id: 'tail',    label: 'Queue tourbillon', icon: '🌀' },
  { id: 'antenna', label: 'Antennes',         icon: '📡' },
]

const PERSONALITIES = [
  { id: 'brave',   label: 'Courageux', icon: '⚡', color: '#EA580C', desc: 'Toujours prêt à relever un défi',        greeting: "Je suis prêt pour l'aventure! Allons explorer quelque chose d'incroyable ensemble." },
  { id: 'curious', label: 'Curieux',   icon: '🔍', color: '#2563EB', desc: 'Pose toujours les meilleures questions',  greeting: "Oh! Il y a tellement de choses à découvrir! Par où commence-t-on?" },
  { id: 'funny',   label: 'Drôle',     icon: '😄', color: '#D97706', desc: 'Apprendre est encore mieux en riant',    greeting: "Eh, tu sais quoi? Apprendre c'est comme une blague — ça devient meilleur avec la pratique!" },
  { id: 'calm',    label: 'Calme',     icon: '🌊', color: '#16A34A', desc: 'Patient et toujours là pour toi',        greeting: "Prends une grande respiration. Je suis là, on va apprendre à notre propre rythme." },
]

function PalSVG({ creature, shape, palette, feature, size = 200 }: {
  creature: string
  shape: string
  palette: typeof PALETTES[0]
  feature: string
  size?: number
}) {
  const bodyShape = BODY_SHAPES.find(b => b.id === shape)?.shape || BODY_SHAPES[0].shape

  const featureEl = () => {
    switch (feature) {
      case 'ears': return (
        <>
          <ellipse cx="22" cy="28" rx="10" ry="16" fill={palette.main} opacity=".9" transform="rotate(-15,22,28)" />
          <ellipse cx="78" cy="28" rx="10" ry="16" fill={palette.main} opacity=".9" transform="rotate(15,78,28)" />
          <ellipse cx="22" cy="28" rx="6"  ry="11" fill={palette.accent} opacity=".7" transform="rotate(-15,22,28)" />
          <ellipse cx="78" cy="28" rx="6"  ry="11" fill={palette.accent} opacity=".7" transform="rotate(15,78,28)" />
        </>
      )
      case 'eyes': return (
        <>
          <circle cx="38" cy="46" r="9" fill={palette.accent} />
          <circle cx="62" cy="46" r="9" fill={palette.accent} />
          <circle cx="38" cy="46" r="5" fill={palette.main} />
          <circle cx="62" cy="46" r="5" fill={palette.main} />
          <circle cx="40" cy="44" r="2" fill="white" opacity=".8" />
          <circle cx="64" cy="44" r="2" fill="white" opacity=".8" />
        </>
      )
      case 'wings': return (
        <>
          <ellipse cx="10" cy="45" rx="18" ry="10" fill={palette.accent} opacity=".8" transform="rotate(-30,10,45)" />
          <ellipse cx="90" cy="45" rx="18" ry="10" fill={palette.accent} opacity=".8" transform="rotate(30,90,45)" />
        </>
      )
      case 'shell': return (
        <path d="M30,72 Q50,90 70,72 Q65,80 50,83 Q35,80 30,72Z" fill={palette.accent} stroke={palette.main} strokeWidth="2" />
      )
      case 'tail': return (
        <path d="M50,85 Q70,95 75,85 Q80,75 70,78 Q78,88 68,92 Q60,96 50,88Z" fill={palette.accent} stroke={palette.main} strokeWidth="1.5" />
      )
      case 'antenna': return (
        <>
          <line x1="40" y1="20" x2="33" y2="5"  stroke={palette.main} strokeWidth="3" strokeLinecap="round" />
          <circle cx="33" cy="4" r="4" fill={palette.accent} />
          <line x1="60" y1="20" x2="67" y2="5"  stroke={palette.main} strokeWidth="3" strokeLinecap="round" />
          <circle cx="67" cy="4" r="4" fill={palette.accent} />
        </>
      )
      default: return null
    }
  }

  const creatureEl = () => {
    switch (creature) {
      case 'sea':    return <path d="M20,88 Q35,80 50,88 Q65,80 80,88" stroke={palette.accent} strokeWidth="3" fill="none" strokeLinecap="round" />
      case 'sky':    return <circle cx="50" cy="50" r="48" fill="none" stroke={palette.accent} strokeWidth="1" strokeDasharray="4 6" opacity=".5" />
      case 'cosmic': return (
        <>
          <circle cx="15" cy="15" r="3" fill={palette.accent} opacity=".6" />
          <circle cx="85" cy="20" r="2" fill={palette.accent} opacity=".5" />
          <circle cx="80" cy="80" r="3" fill={palette.accent} opacity=".4" />
          <circle cx="20" cy="75" r="2" fill={palette.accent} opacity=".6" />
        </>
      )
      default: return null
    }
  }

  return (
    <svg viewBox="0 0 100 100" width={size} height={size}
      style={{ filter: `drop-shadow(0 8px 24px ${palette.glow})`, overflow: 'visible' }}>
      <defs>
        <radialGradient id={`grad_${size}`} cx="40%" cy="35%">
          <stop offset="0%"   stopColor={palette.accent} stopOpacity=".9" />
          <stop offset="100%" stopColor={palette.main} />
        </radialGradient>
      </defs>
      {creatureEl()}
      {featureEl()}
      <path d={bodyShape} fill={`url(#grad_${size})`} stroke={palette.main} strokeWidth="2" />
      {feature !== 'eyes' && (
        <>
          <circle cx="38" cy="46" r="7" fill="white" opacity=".9" />
          <circle cx="62" cy="46" r="7" fill="white" opacity=".9" />
          <circle cx="38" cy="46" r="4" fill={palette.main} />
          <circle cx="62" cy="46" r="4" fill={palette.main} />
          <circle cx="39.5" cy="44.5" r="1.5" fill="white" opacity=".7" />
          <circle cx="63.5" cy="44.5" r="1.5" fill="white" opacity=".7" />
        </>
      )}
      <path d="M38,62 Q50,72 62,62" stroke={palette.main} strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function OnboardingPage() {
  const router  = useRouter()
  const { refresh } = useChild()

  const [step, setStep]               = useState(0)
  const [childName, setChildName]     = useState('')
  const [palName, setPalName]         = useState('')
  const [grade, setGrade]             = useState(3)
  const [creature, setCreature]       = useState('land')
  const [bodyShape, setBodyShape]     = useState('round')
  const [paletteId, setPaletteId]     = useState('ocean')
  const [feature, setFeature]         = useState('eyes')
  const [personality, setPersonality] = useState('curious')
  const [saving, setSaving]           = useState(false)
  const [speaking, setSpeaking]       = useState(false)
  const [animIn, setAnimIn]           = useState(true)

  const palette = PALETTES.find(p => p.id === paletteId) || PALETTES[0]
  const pers    = PERSONALITIES.find(p => p.id === personality) || PERSONALITIES[1]

  const goTo = (n: number) => {
    setAnimIn(false)
    setTimeout(() => { setStep(n); setAnimIn(true) }, 200)
  }

  useEffect(() => {
    if (step === 4 && palName) {
      const t = setTimeout(() => setSpeaking(true), 800)
      return () => clearTimeout(t)
    }
  }, [step, palName])

 const finish = async () => {
  setSaving(true)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/auth'); return }

  const palData = { creature, bodyShape, palette: paletteId, feature, name: palName }

  const { error } = await supabase.from('children').insert({
    parent_id:   user.id,
    name:        childName,
    grade,
    hero:        '🦸',
    hero_name:   palName,
    pal:         palData,
    personality,
  })

  if (!error) {
    try {
      await Promise.race([
        refresh(),
        new Promise(resolve => setTimeout(resolve, 3000))
      ])
    } catch (e) {
      console.log('refresh error', e)
    }
    router.push('/home')
  } else {
    console.error('Insert error:', error)
  }
  setSaving(false)
}


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #040D1F 0%, #0B1F4B 60%, #06122E 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      fontFamily: 'var(--font-jakarta)', overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* Static background blobs — no Math.random() */}
      <div style={{ position:'fixed', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.15) 0%, transparent 70%)', top:'10%', right:'5%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(251,191,36,.08) 0%, transparent 70%)', bottom:'15%', left:'8%', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:150, height:150, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,.1) 0%, transparent 70%)', top:'50%', left:'2%', pointerEvents:'none' }} />

      {/* Progress bar */}
      {step > 0 && step < 5 && (
        <div style={{ position:'fixed', top:0, left:0, right:0, height:4, background:'rgba(255,255,255,.1)', zIndex:100 }}>
          <div style={{ height:'100%', width:`${(step/4)*100}%`, background:palette.main, transition:'width .4s ease', borderRadius:'0 99px 99px 0' }} />
        </div>
      )}

      {step > 0 && step < 5 && (
        <div style={{ position:'fixed', top:20, right:24, color:'rgba(255,255,255,.3)', fontSize:13, fontWeight:700 }}>
          {step} / 4
        </div>
      )}

      <div style={{
        width:'100%', maxWidth:520,
        opacity: animIn ? 1 : 0,
        transform: animIn ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all .25s ease',
      }}>

        {/* STEP 0 */}
        {step === 0 && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:72, marginBottom:8, display:'inline-block', animation:'float 3s ease-in-out infinite' }}>
              😊
            </div>
            <h1 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:48, fontWeight:700, marginBottom:16, letterSpacing:2 }}>
              NOVERE
            </h1>
            <p style={{ color:'rgba(255,255,255,.55)', fontSize:16, lineHeight:1.7, maxWidth:380, margin:'0 auto 12px' }}>
              Un univers où les enfants curieux partent en aventures d'apprentissage.
            </p>
            <p style={{ color:'rgba(255,255,255,.3)', fontSize:14, marginBottom:48 }}>
              Chaque explorateur a besoin d'un compagnon.
            </p>
            <div style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:24, padding:28, marginBottom:24, textAlign:'left' }}>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, fontWeight:700, marginBottom:16, textTransform:'uppercase', letterSpacing:'.06em' }}>
                Parlez-nous de votre enfant
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <input
                  placeholder="Prénom de l'enfant"
                  value={childName}
                  onChange={e => setChildName(e.target.value)}
                  style={inputStyle}
                />
                <select value={grade} onChange={e => setGrade(+e.target.value)} style={inputStyle}>
                  {[1,2,3,4,5,6].map(g => (
                    <option key={g} value={g} style={{ background:'#0B1F4B' }}>
                      {g === 1 ? '1ère' : `${g}ème`} année du primaire
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => childName.trim() && goTo(1)}
              disabled={!childName.trim()}
              style={{ ...btnStyle, background: childName.trim() ? '#FBBF24' : 'rgba(255,255,255,.1)', color: childName.trim() ? '#0B1F4B' : 'rgba(255,255,255,.3)', fontSize:16, padding:'16px 48px' }}
            >
              Commencer l'aventure ✦
            </button>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:14, marginBottom:20 }}>Bonjour, {childName} 👋</p>
            <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:38, fontWeight:700, lineHeight:1.2, marginBottom:20 }}>
              Chaque explorateur a besoin d'un compagnon.
            </h2>
            <p style={{ color:'rgba(255,255,255,.5)', fontSize:17, lineHeight:1.7, maxWidth:400, margin:'0 auto 48px' }}>
              Avant de commencer, crée le tien. Il t'accompagnera dans chaque aventure, apprendra avec toi, et grandira à tes côtés.
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:20, marginBottom:48 }}>
              {[
                { c:'land',   p:PALETTES[0], f:'ears'    },
                { c:'cosmic', p:PALETTES[3], f:'antenna' },
                { c:'sky',    p:PALETTES[4], f:'wings'   },
              ].map((preview, i) => (
                <div key={i} style={{ animation:`float ${2.5+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.3}s` }}>
                  <PalSVG creature={preview.c} shape="round" palette={preview.p} feature={preview.f} size={70} />
                </div>
              ))}
            </div>
            <button onClick={() => goTo(2)} style={{ ...btnStyle, background:'#FBBF24', color:'#0B1F4B', fontSize:16, padding:'16px 48px' }}>
              Créer mon compagnon →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:30, textAlign:'center', marginBottom:8 }}>Construis ton compagnon</h2>
            <p style={{ color:'rgba(255,255,255,.4)', textAlign:'center', fontSize:14, marginBottom:32 }}>Chaque choix le rend unique</p>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:32, animation:'float 3s ease-in-out infinite' }}>
              <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={140} />
            </div>

            <div style={{ marginBottom:24 }}>
              <p style={sectionLabel}>Type de créature</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {CREATURE_TYPES.map(c => (
                  <button key={c.id} onClick={() => setCreature(c.id)} style={{ ...choiceBtn, background: creature===c.id ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.05)', border:`1.5px solid ${creature===c.id ? '#FBBF24' : 'rgba(255,255,255,.1)'}` }}>
                    <span style={{ fontSize:22 }}>{c.icon}</span>
                    <div style={{ textAlign:'left' }}>
                      <p style={{ color:'#fff', fontWeight:700, fontSize:13 }}>{c.label}</p>
                      <p style={{ color:'rgba(255,255,255,.4)', fontSize:11 }}>{c.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <p style={sectionLabel}>Forme du corps</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {BODY_SHAPES.map(b => (
                  <button key={b.id} onClick={() => setBodyShape(b.id)} style={{ ...choiceBtn, background: bodyShape===b.id ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.05)', border:`1.5px solid ${bodyShape===b.id ? '#FBBF24' : 'rgba(255,255,255,.1)'}` }}>
                    <span style={{ fontSize:18 }}>
                      {b.id==='round' ? '⭕' : b.id==='tall' ? '📏' : b.id==='sturdy' ? '🪨' : '🌫️'}
                    </span>
                    <p style={{ color:'#fff', fontWeight:600, fontSize:12 }}>{b.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <p style={sectionLabel}>Palette de couleurs</p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {PALETTES.map(p => (
                  <button key={p.id} onClick={() => setPaletteId(p.id)} style={{ width:48, height:48, borderRadius:14, border:'none', cursor:'pointer', background:`linear-gradient(135deg, ${p.main}, ${p.accent})`, outline: paletteId===p.id ? '3px solid #FBBF24' : '3px solid transparent', outlineOffset:2, transition:'all .15s', transform: paletteId===p.id ? 'scale(1.15)' : 'scale(1)' }} title={p.name} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom:32 }}>
              <p style={sectionLabel}>Trait distinctif</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                {FEATURES.map(f => (
                  <button key={f.id} onClick={() => setFeature(f.id)} style={{ ...choiceBtn, flexDirection:'column', gap:4, padding:'12px 8px', background: feature===f.id ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.05)', border:`1.5px solid ${feature===f.id ? '#FBBF24' : 'rgba(255,255,255,.1)'}` }}>
                    <span style={{ fontSize:20 }}>{f.icon}</span>
                    <p style={{ color:'#fff', fontSize:11, fontWeight:600, textAlign:'center' }}>{f.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => goTo(3)} style={{ ...btnStyle, background:'#FBBF24', color:'#0B1F4B', width:'100%', fontSize:15 }}>
              Presque fini! →
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#fff', fontSize:30, textAlign:'center', marginBottom:8 }}>Quelle est sa personnalité?</h2>
            <p style={{ color:'rgba(255,255,255,.4)', textAlign:'center', fontSize:14, marginBottom:28 }}>Cela change comment il te parle</p>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:28, animation:'float 3s ease-in-out infinite' }}>
              <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={120} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:32 }}>
              {PERSONALITIES.map(p => (
                <button key={p.id} onClick={() => setPersonality(p.id)} style={{
                  display:'flex', alignItems:'center', gap:14,
                  background: personality===p.id ? `rgba(${p.id==='brave'?'234,88,12':p.id==='curious'?'37,99,235':p.id==='funny'?'217,119,6':'22,163,74'},.15)` : 'rgba(255,255,255,.05)',
                  border:`1.5px solid ${personality===p.id ? p.color : 'rgba(255,255,255,.1)'}`,
                  borderRadius:16, padding:'14px 18px', cursor:'pointer', textAlign:'left', transition:'all .15s',
                }}>
                  <div style={{ width:46, height:46, borderRadius:14, background: personality===p.id ? p.color : 'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, transition:'all .15s' }}>
                    {p.icon}
                  </div>
                  <div>
                    <p style={{ color:'#fff', fontWeight:700, fontSize:15, marginBottom:3 }}>{p.label}</p>
                    <p style={{ color:'rgba(255,255,255,.4)', fontSize:12 }}>{p.desc}</p>
                  </div>
                  {personality===p.id && <div style={{ marginLeft:'auto', color:'#FBBF24', fontSize:18 }}>✓</div>}
                </button>
              ))}
            </div>
            <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:20, padding:24, marginBottom:24, textAlign:'center' }}>
              <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, marginBottom:16 }}>Comment vas-tu l'appeler?</p>
              <input
                placeholder="Donne-lui un nom..."
                value={palName}
                onChange={e => setPalName(e.target.value)}
                style={{ ...inputStyle, textAlign:'center', fontSize:20, fontFamily:'var(--font-fredoka)', letterSpacing:1, padding:'16px' }}
                maxLength={20}
              />
            </div>
            <button
              onClick={() => palName.trim() && goTo(4)}
              disabled={!palName.trim()}
              style={{ ...btnStyle, background: palName.trim() ? '#FBBF24' : 'rgba(255,255,255,.1)', color: palName.trim() ? '#0B1F4B' : 'rgba(255,255,255,.3)', width:'100%', fontSize:15 }}
            >
              Rencontrer {palName || 'ton compagnon'} →
            </button>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div style={{ textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:14, marginBottom:24 }}>{childName}, rencontre...</p>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:8, animation:'float 3s ease-in-out infinite' }}>
              <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={180} />
            </div>
            <h2 style={{ fontFamily:'var(--font-fredoka)', color:'#FBBF24', fontSize:42, fontWeight:700, marginBottom:6, letterSpacing:2 }}>
              {palName}
            </h2>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:`rgba(${personality==='brave'?'234,88,12':personality==='curious'?'37,99,235':personality==='funny'?'217,119,6':'22,163,74'},.2)`, border:`1px solid ${pers.color}`, borderRadius:99, padding:'4px 14px', marginBottom:32 }}>
              <span>{pers.icon}</span>
              <span style={{ color:pers.color, fontSize:13, fontWeight:700 }}>{pers.label}</span>
            </div>
            <div style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', borderRadius:20, padding:'20px 24px', marginBottom:36, position:'relative', opacity: speaking ? 1 : 0, transform: speaking ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)', transition:'all .5s ease' }}>
              <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'10px solid transparent', borderRight:'10px solid transparent', borderBottom:'10px solid rgba(255,255,255,.12)' }} />
              <p style={{ color:'rgba(255,255,255,.85)', fontSize:16, lineHeight:1.7, fontStyle:'italic' }}>"{pers.greeting}"</p>
            </div>
            <button
              onClick={finish}
              disabled={saving}
              style={{ ...btnStyle, background: saving ? 'rgba(255,255,255,.1)' : '#FBBF24', color: saving ? 'rgba(255,255,255,.3)' : '#0B1F4B', fontSize:16, padding:'16px 48px' }}
            >
              {saving ? 'Sauvegarde...' : "C'est parti! 🚀"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
      `}</style>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'13px 16px',
  background:'rgba(255,255,255,.07)',
  border:'1px solid rgba(255,255,255,.1)',
  borderRadius:12, color:'#fff', fontSize:15,
  fontFamily:'var(--font-jakarta)', outline:'none',
}
const btnStyle: React.CSSProperties = {
  padding:'14px 32px', borderRadius:14, border:'none',
  fontWeight:800, cursor:'pointer',
  fontFamily:'var(--font-jakarta)', transition:'all .2s',
  display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
}
const choiceBtn: React.CSSProperties = {
  display:'flex', alignItems:'center', gap:10,
  padding:'12px 14px', borderRadius:14, cursor:'pointer',
  transition:'all .15s', fontFamily:'var(--font-jakarta)', border:'none',
}
const sectionLabel: React.CSSProperties = {
  color:'rgba(255,255,255,.4)', fontSize:11,
  fontWeight:700, letterSpacing:'.08em',
  textTransform:'uppercase', marginBottom:10,
}

