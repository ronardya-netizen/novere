const BODY_SHAPES: Record<string, string> = {
  round:  'M50,20 C75,20 85,40 85,55 C85,75 70,85 50,85 C30,85 15,75 15,55 C15,40 25,20 50,20Z',
  tall:   'M50,10 C65,10 75,25 75,40 L75,75 C75,85 65,90 50,90 C35,90 25,85 25,75 L25,40 C25,25 35,10 50,10Z',
  sturdy: 'M20,25 C20,15 35,10 50,10 C65,10 80,15 80,25 L85,70 C85,82 70,88 50,88 C30,88 15,82 15,70Z',
  wispy:  'M50,15 C62,15 72,25 74,38 C80,42 84,50 82,60 C78,75 65,85 50,85 C35,85 22,75 18,60 C16,50 20,42 26,38 C28,25 38,15 50,15Z',
}

export function PalSVG({ creature, shape, palette, feature, size = 200 }: {
  creature: string
  shape: string
  palette: { main: string; accent: string; glow: string }
  feature: string
  size?: number
}) {
  const bodyPath = BODY_SHAPES[shape] || BODY_SHAPES.round

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
      case 'sea': return (
        <path d="M20,88 Q35,80 50,88 Q65,80 80,88" stroke={palette.accent} strokeWidth="3" fill="none" strokeLinecap="round" />
      )
      case 'sky': return (
        <circle cx="50" cy="50" r="48" fill="none" stroke={palette.accent} strokeWidth="1" strokeDasharray="4 6" opacity=".5" />
      )
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
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ filter: `drop-shadow(0 8px 24px ${palette.glow})`, overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`bodyGrad_${size}`} cx="40%" cy="35%">
          <stop offset="0%"   stopColor={palette.accent} stopOpacity=".9" />
          <stop offset="100%" stopColor={palette.main} />
        </radialGradient>
      </defs>
      {creatureEl()}
      {featureEl()}
      <path d={bodyPath} fill={`url(#bodyGrad_${size})`} stroke={palette.main} strokeWidth="2" />
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

