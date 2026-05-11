'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { PalSVG } from '@/lib/pal-svg'


type Step = {
  targetId: string | null
  title: string
  message: string
  bubblePosition: 'top' | 'bottom' | 'center'
}


type Props = {
  childId: string
  childName: string
  palName: string
  creature: string
  bodyShape: string
  palette: { main: string; accent: string; glow: string }
  feature: string
  onComplete: () => void
}


const PADDING = 14


export default function TourOverlay({ childId, childName, palName, creature, bodyShape, palette, feature, onComplete }: Props) {
  const [step,     setStep]     = useState(0)
  const [rect,     setRect]     = useState<DOMRect | null>(null)
  const [animIn,   setAnimIn]   = useState(true)


  const STEPS: Step[] = [
{
  targetId: 'tour-stats',
  title: 'Ta progression 🔥',
  message: `Ici, tu peux voir tes points, tes sessions terminées et ta série d'étude. Plus tu étudies, plus tu gagnes de points pour débloquer des réductions sur des jouets et des récompenses!`,
  bubblePosition: 'bottom',
},
{
  targetId: 'tour-pal',
  title: `Salut ${childName}, moi c'est ${palName}! 👋`,
  message: `Je serai avec toi pendant tes sessions pour t'aider à apprendre plus facilement et rendre tes séances d'étude beaucoup plus amusantes.`,
  bubblePosition: 'bottom',
},
{
  targetId: 'tour-quest',
  title: 'Ta mission du jour ⚡',
  message: `Clique ici pour commencer une session d'étude de 25 minutes avec moi. Quand tu termines, tu gagnes 50 points et un mini-jeu!`,
  bubblePosition: 'bottom',
},
{
  targetId: 'tour-articles',
  title: 'Découvre de nouvelles choses ✨',
  message: `Entre tes sessions, explore des articles amusants sur l'argent, la confiance en soi, la santé mentale et plein d'autres sujets utiles pour la vraie vie.`,
  bubblePosition: 'top',
},
{
  targetId: 'tour-mentors',
  title: 'Découvre des métiers 🎬',
  message: `Regarde de courtes vidéos de médecins, ingénieurs, entrepreneurs et d'autres professionnels pour découvrir leur quotidien et imaginer ton futur.`,
  bubblePosition: 'top',
},
{
  targetId: null,
  title: `Prêt(e) à commencer, ${childName}? 🚀`,
  message: `Lance ta première session, gagne tes premiers points et commence à débloquer des récompenses et des réductions sur tes jouets préférés!`,
  bubblePosition: 'center',
}
  ]


  const current = STEPS[step]


  const measureTarget = useCallback(() => {
    if (!current.targetId) { setRect(null); return }
    const el = document.getElementById(current.targetId)
    if (el) setRect(el.getBoundingClientRect())
  }, [step])


  useEffect(() => {
    measureTarget()
    window.addEventListener('resize', measureTarget)
    return () => window.removeEventListener('resize', measureTarget)
  }, [measureTarget])


  async function advance() {
    if (step < STEPS.length - 1) {
      setAnimIn(false)
      setTimeout(() => { setStep(s => s + 1); setAnimIn(true) }, 200)
    } else {
      await finish()
    }
  }


  async function finish() {
    await supabase.from('children').update({ tour_completed: true }).eq('id', childId)
    onComplete()
  }


  // Spotlight box dimensions
  const spotlight = rect ? {
    top:    rect.top    - PADDING,
    left:   rect.left   - PADDING,
    width:  rect.width  + PADDING * 2,
    height: rect.height + PADDING * 2,
  } : null


  // Bubble position relative to spotlight
  const bubbleTop = (() => {
    if (!spotlight) return '50%'
    if (current.bubblePosition === 'bottom') return spotlight.top + spotlight.height + 16
    if (current.bubblePosition === 'top')    return spotlight.top - 220
    return '50%'
  })()


  const isCentered = current.bubblePosition === 'center'


  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, fontFamily:'var(--font-jakarta)' }}>


      {/* Dark overlay */}
      <div style={{ position:'absolute', inset:0, background:'rgba(4,13,31,0.82)', backdropFilter:'blur(2px)' }} />


      {/* Spotlight cutout */}
      {spotlight && (
        <div style={{
          position:'absolute',
          top:    spotlight.top,
          left:   spotlight.left,
          width:  spotlight.width,
          height: spotlight.height,
          borderRadius: 20,
          boxShadow: `0 0 0 9999px rgba(4,13,31,0.82)`,
          border: `2px solid ${palette.accent}`,
          zIndex: 501,
          pointerEvents: 'none',
          transition: 'all .3s ease',
        }} />
      )}


      {/* Pulse ring */}
      {spotlight && (
        <div style={{
          position:'absolute',
          top:    spotlight.top    - 6,
          left:   spotlight.left   - 6,
          width:  spotlight.width  + 12,
          height: spotlight.height + 12,
          borderRadius: 24,
          border: `2px solid ${palette.main}`,
          opacity: 0.5,
          animation: 'tourPulse 1.8s ease-in-out infinite',
          zIndex: 500,
          pointerEvents: 'none',
        }} />
      )}


      {/* Speech bubble */}
      <div style={{
        position: 'absolute',
        ...(isCentered ? {
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        } : {
          top:  typeof bubbleTop === 'number' ? bubbleTop : undefined,
          left: '50%',
          transform: 'translateX(-50%)',
        }),
        width: 'min(340px, calc(100vw - 40px))',
        zIndex: 502,
        opacity:   animIn ? 1 : 0,
        transition: 'opacity .2s ease',
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #0B1F4B, #13306B)',
          border: `1px solid ${palette.main}44`,
          borderRadius: 22,
          padding: '20px 20px 16px',
          boxShadow: `0 16px 48px rgba(0,0,0,.5), 0 0 0 1px ${palette.accent}22`,
        }}>
          {/* Pal + title row */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <div style={{ animation:'float 3s ease-in-out infinite', flexShrink:0 }}>
              <PalSVG creature={creature} shape={bodyShape} palette={palette} feature={feature} size={52} />
            </div>
            <div>
              <p style={{ color:'#FBBF24', fontWeight:800, fontSize:15, margin:'0 0 2px', fontFamily:'var(--font-fredoka)' }}>
                {current.title}
              </p>
              <p style={{ color:'rgba(255,255,255,.35)', fontSize:10, margin:0, fontWeight:600 }}>
                {palName} · Étape {step + 1} sur {STEPS.length}
              </p>
            </div>
          </div>


          {/* Message */}
          <p style={{ color:'rgba(255,255,255,.8)', fontSize:14, lineHeight:1.65, margin:'0 0 16px' }}>
            {current.message}
          </p>


          {/* Progress dots */}
          <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:14 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width:  i === step ? 20 : 6,
                height: 6,
                borderRadius: 99,
                background: i === step ? palette.main : 'rgba(255,255,255,.15)',
                transition: 'all .3s ease',
              }} />
            ))}
          </div>


          {/* Buttons */}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={finish} style={{
              flex:1, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)',
              borderRadius:12, padding:'10px 0', color:'rgba(255,255,255,.4)',
              fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--font-jakarta)',
            }}>
              Passer
            </button>
            <button onClick={advance} style={{
              flex:2, background: palette.main, border:'none',
              borderRadius:12, padding:'10px 0', color:'#fff',
              fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'var(--font-jakarta)',
              boxShadow: `0 4px 16px ${palette.glow}`,
            }}>
              {step === STEPS.length - 1 ? 'C\'est parti! 🚀' : 'Suivant →'}
            </button>
          </div>
        </div>
      </div>


      <style>{`
        @keyframes tourPulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.15;transform:scale(1.03)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </div>
  )
}
