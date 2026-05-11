'use client'
import { useState, useEffect, useRef } from 'react'


const TRACKS = [
  { id: 'forest', label: 'Forêt',  emoji: '🌲', url: 'https://arbnjdlgjodsrumhqncb.supabase.co/storage/v1/object/public/audio/forest_river_ambience.m4a' },
  { id: 'ocean',  label: 'Océan',  emoji: '🌊', url: 'https://arbnjdlgjodsrumhqncb.supabase.co/storage/v1/object/public/audio/ocean_wave.mp3' },
]


type Props = {
  paused?: boolean  // pass true during grace period / break to auto-pause
}


export default function AmbientPlayer({ paused = false }: Props) {
  const audioRef                    = useRef<HTMLAudioElement | null>(null)
  const [trackId,  setTrackId]      = useState('forest')
  const [playing,  setPlaying]      = useState(false)
  const [volume,   setVolume]       = useState(0.4)
  const [expanded, setExpanded]     = useState(false)


  const track = TRACKS.find(t => t.id === trackId) ?? TRACKS[0]


  // Create / update audio element when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    const audio    = new Audio(track.url)
    audio.loop     = true
    audio.volume   = volume
    audioRef.current = audio
    if (playing) audio.play().catch(() => setPlaying(false))
    return () => { audio.pause(); audio.src = '' }
  }, [trackId])


  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])


  // Auto-pause during grace period / break overlay
  useEffect(() => {
    if (!audioRef.current) return
    if (paused && playing) {
      audioRef.current.pause()
    } else if (!paused && playing) {
      audioRef.current.play().catch(() => setPlaying(false))
    }
  }, [paused])


  function toggle() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().catch(() => setPlaying(false))
      setPlaying(true)
    }
  }


  function switchTrack(id: string) {
    const wasPlaying = playing
    setTrackId(id)
    // useEffect above handles restart; just keep playing state
    if (!wasPlaying) setPlaying(false)
    else setPlaying(true)
  }


  return (
    <div style={{ position:'relative' }}>
      {/* Expanded panel */}
      {expanded && (
        <div style={{
          position:'absolute', bottom:52, right:0,
          background:'rgba(11,31,75,0.97)', border:'1px solid rgba(255,255,255,.12)',
          borderRadius:18, padding:'16px 16px 12px', width:220,
          boxShadow:'0 8px 32px rgba(0,0,0,.4)',
          backdropFilter:'blur(12px)',
          fontFamily:'var(--font-jakarta)',
        }}>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.6px', margin:'0 0 10px' }}>
            Son d'ambiance
          </p>


          {/* Track selector */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
            {TRACKS.map(t => (
              <button key={t.id} onClick={() => switchTrack(t.id)} style={{
                display:'flex', alignItems:'center', gap:10,
                background: trackId===t.id ? 'rgba(251,191,36,.15)' : 'rgba(255,255,255,.05)',
                border: `1px solid ${trackId===t.id ? 'rgba(251,191,36,.4)' : 'rgba(255,255,255,.08)'}`,
                borderRadius:10, padding:'9px 12px', cursor:'pointer',
                transition:'all .15s',
              }}>
                <span style={{ fontSize:16 }}>{t.emoji}</span>
                <span style={{ color: trackId===t.id ? '#FBBF24' : 'rgba(255,255,255,.7)', fontSize:13, fontWeight:600 }}>{t.label}</span>
                {trackId===t.id && playing && (
                  <span style={{ marginLeft:'auto', display:'flex', gap:2, alignItems:'flex-end', height:14 }}>
                    {[1,2,3].map(i => (
                      <span key={i} style={{ width:3, background:'#FBBF24', borderRadius:2, animation:`bar${i} .8s ease-in-out infinite`, animationDelay:`${i*0.15}s` }} />
                    ))}
                  </span>
                )}
              </button>
            ))}
          </div>


          {/* Volume slider */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13 }}>{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
            <input
              type="range" min={0} max={1} step={0.05}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ flex:1, accentColor:'#FBBF24', cursor:'pointer' }}
            />
          </div>
        </div>
      )}


      {/* Floating button */}
      <button
        onClick={() => { if (!expanded) setExpanded(true); else toggle() }}
        onMouseEnter={() => setExpanded(true)}
        style={{
          width:44, height:44, borderRadius:14,
          background: playing ? 'rgba(251,191,36,.2)' : 'rgba(255,255,255,.08)',
          border: `1px solid ${playing ? 'rgba(251,191,36,.4)' : 'rgba(255,255,255,.12)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', transition:'all .2s', fontSize:18,
          position:'relative',
        }}
        title={playing ? 'Pause le son' : 'Activer le son d\'ambiance'}
      >
        {playing ? '🎵' : '🎧'}
        {playing && (
          <span style={{ position:'absolute', top:6, right:6, width:6, height:6, borderRadius:'50%', background:'#22C55E', border:'1px solid rgba(0,0,0,.3)' }} />
        )}
      </button>


      {/* Close panel on outside hover — invisible overlay */}
      {expanded && (
        <div
          style={{ position:'fixed', inset:0, zIndex:-1 }}
          onMouseEnter={() => setExpanded(false)}
        />
      )}


      <style>{`
        @keyframes bar1 { 0%,100%{height:4px} 50%{height:12px} }
        @keyframes bar2 { 0%,100%{height:8px} 50%{height:4px}  }
        @keyframes bar3 { 0%,100%{height:6px} 50%{height:12px} }
      `}</style>
    </div>
  )
}
