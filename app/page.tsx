'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Root() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/home')
      else setChecking(false)
    })
  }, [])

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#0B1F4B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/novere_logo.png" style={{ width: 64, height: 64, objectFit: 'contain', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  )

  return <LandingPage />
}

function LandingPage() {
  const router = useRouter()

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy:   #0B1F4B;
          --blue:   #3B52D4;
          --sky:    #DBEAFE;
          --yellow: #FBBF24;
          --white:  #FFFFFF;
          --off:    #F8FAFF;
          --text:   #1E293B;
          --muted:  #64748B;
        }
        html { scroll-behavior: smooth; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: var(--off); color: var(--text); overflow-x: hidden; }

        nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(11,31,75,0.97);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5%; height: 68px;
          border-bottom: 2px solid rgba(251,191,36,0.25);
        }
        .logo {
          font-family: 'Fredoka', sans-serif;
          font-size: 1.9rem; font-weight: 700; color: #fff;
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .logo img { width: 42px; height: 42px; object-fit: contain; }
        .nav-links { display: flex; gap: 32px; list-style: none; }
        .nav-links a { color: rgba(255,255,255,0.75); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color .2s; }
        .nav-links a:hover { color: var(--yellow); }
        .btn-nav {
          background: var(--yellow); color: var(--navy);
          border: none; border-radius: 99px;
          padding: 8px 22px; font-weight: 700; font-size: 0.88rem;
          cursor: pointer; transition: transform .15s, box-shadow .15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-nav:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(251,191,36,0.45); }

        .hero {
          background: linear-gradient(135deg, var(--navy) 0%, #0D2860 60%, #1a1060 100%);
          min-height: 92vh;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; padding: 80px 5% 60px;
          position: relative; overflow: hidden;
        }
        .hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 70% at 70% 50%, rgba(59,82,212,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .hero-text { position: relative; z-index: 2; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.4);
          border-radius: 99px; padding: 6px 16px;
          color: var(--yellow); font-size: 0.8rem; font-weight: 600;
          margin-bottom: 28px; animation: fadeUp .6s ease both;
        }
        .hero-badge::before { content: '✦'; font-size: 0.7rem; }
        .hero h1 {
          font-family: 'Fredoka', sans-serif;
          font-size: clamp(2.8rem, 5vw, 4.2rem); font-weight: 700;
          line-height: 1.1; color: #fff; margin-bottom: 24px;
          animation: fadeUp .6s .1s ease both;
        }
        .hero h1 em { font-style: normal; color: var(--yellow); }
        .hero p {
          font-size: 1.1rem; line-height: 1.75; color: rgba(255,255,255,0.7);
          max-width: 480px; margin-bottom: 36px;
          animation: fadeUp .6s .2s ease both;
        }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; animation: fadeUp .6s .3s ease both; }
        .btn-primary {
          background: var(--yellow); color: var(--navy);
          border: none; border-radius: 14px;
          padding: 14px 32px; font-weight: 700; font-size: 1rem;
          cursor: pointer; transition: transform .15s, box-shadow .2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(251,191,36,0.5); }
        .btn-outline {
          background: transparent; color: #fff;
          border: 2px solid rgba(255,255,255,0.3); border-radius: 14px;
          padding: 14px 32px; font-weight: 600; font-size: 1rem;
          cursor: pointer; transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-outline:hover { border-color: #fff; background: rgba(255,255,255,0.08); }
        .hero-trust { margin-top: 44px; display: flex; align-items: center; gap: 16px; animation: fadeUp .6s .4s ease both; }
        .trust-avatars { display: flex; }
        .trust-avatars span {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg,#3B82F6,#8B5CF6);
          border: 2px solid var(--navy);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; margin-left: -8px;
        }
        .trust-avatars span:first-child { margin-left: 0; background: linear-gradient(135deg,#F59E0B,#EF4444); }
        .trust-avatars span:nth-child(2) { background: linear-gradient(135deg,#10B981,#3B82F6); }
        .trust-text { color: rgba(255,255,255,0.6); font-size: 0.85rem; }
        .trust-text strong { color: #fff; }

        .hero-visual { position: relative; z-index: 2; display: flex; justify-content: center; align-items: center; animation: fadeUp .7s .2s ease both; }
        .phone-frame {
          width: 280px; background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 32px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5);
        }
        .phone-status { background: rgba(0,0,0,0.3); padding: 12px 20px 8px; display: flex; justify-content: space-between; align-items: center; }
        .phone-status span { color: rgba(255,255,255,0.5); font-size: 0.7rem; font-weight: 600; }
        .phone-notch { width: 80px; height: 22px; background: rgba(0,0,0,0.5); border-radius: 0 0 16px 16px; margin: 0 auto; }
        .chat-screen { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .chat-header { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.07); border-radius: 14px; padding: 10px 14px; }
        .avatar-img { width: 36px; height: 36px; border-radius: 50%; object-fit: contain; flex-shrink: 0; }
        .chat-header-text { flex: 1; }
        .chat-header-text p { color: #fff; font-size: 0.8rem; font-weight: 600; }
        .chat-header-text span { color: rgba(255,255,255,0.4); font-size: 0.65rem; }
        .online-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
        .bubble { max-width: 88%; padding: 10px 14px; border-radius: 16px; font-size: 0.75rem; line-height: 1.5; }
        .bubble-ai { background: rgba(59,82,212,0.35); border: 1px solid rgba(59,82,212,0.3); color: rgba(255,255,255,0.9); border-bottom-left-radius: 4px; align-self: flex-start; }
        .bubble-user { background: var(--yellow); color: var(--navy); font-weight: 600; border-bottom-right-radius: 4px; align-self: flex-end; margin-left: auto; }
        .bubble-typing { display: flex; gap: 4px; align-items: center; padding: 12px 16px; }
        .bubble-typing span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); animation: typing 1.2s infinite; }
        .bubble-typing span:nth-child(2) { animation-delay: .2s; }
        .bubble-typing span:nth-child(3) { animation-delay: .4s; }
        .phone-points { margin: 8px 16px 16px; background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05)); border: 1px solid rgba(251,191,36,0.3); border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; }
        .points-icon { font-size: 1.4rem; }
        .points-text p { color: var(--yellow); font-size: 0.75rem; font-weight: 700; }
        .points-text span { color: rgba(255,255,255,0.5); font-size: 0.65rem; }
        .points-bar-wrap { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden; }
        .points-bar { height: 100%; width: 62%; background: var(--yellow); border-radius: 99px; }
        .float-card { position: absolute; background: rgba(255,255,255,0.08); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; animation: float 5s ease-in-out infinite; }
        .float-card.left { left: -60px; top: 30%; }
        .float-card.right { right: -50px; bottom: 25%; animation-delay: 2.5s; }
        .float-text p { color: #fff; font-size: 0.72rem; font-weight: 600; white-space: nowrap; }
        .float-text span { color: rgba(255,255,255,0.45); font-size: 0.62rem; }

        section { padding: 96px 5%; }
        .section-label { display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--blue); margin-bottom: 16px; }
        .section-label::before { content: ''; display: block; width: 16px; height: 2px; background: var(--blue); }
        .section-title { font-family: 'Fredoka', sans-serif; font-size: clamp(2rem,4vw,3rem); font-weight: 700; line-height: 1.15; color: var(--navy); margin-bottom: 16px; }
        .section-sub { font-size: 1.05rem; color: var(--muted); line-height: 1.7; max-width: 520px; }

        .features { background: #fff; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); gap: 24px; margin-top: 56px; }
        .feat-card { background: var(--off); border: 1.5px solid #E2E8F0; border-radius: 24px; padding: 32px 28px; transition: transform .2s,box-shadow .2s; position: relative; overflow: hidden; }
        .feat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; border-radius: 24px 24px 0 0; }
        .feat-card.c1::before { background: linear-gradient(90deg,#3B52D4,#60A5FA); }
        .feat-card.c2::before { background: linear-gradient(90deg,#FBBF24,#F97316); }
        .feat-card.c3::before { background: linear-gradient(90deg,#8B5CF6,#EC4899); }
        .feat-card.c4::before { background: linear-gradient(90deg,#10B981,#3B82F6); }
        .feat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(11,31,75,0.1); }
        .feat-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px; }
        .feat-card.c1 .feat-icon { background: #DBEAFE; }
        .feat-card.c2 .feat-icon { background: #FEF3C7; }
        .feat-card.c3 .feat-icon { background: #EDE9FE; }
        .feat-card.c4 .feat-icon { background: #D1FAE5; }
        .feat-card h3 { font-family: 'Fredoka',sans-serif; font-size: 1.25rem; font-weight: 600; color: var(--navy); margin-bottom: 10px; }
        .feat-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.65; }
        .feat-tag { display: inline-block; margin-top: 18px; font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 99px; }
        .feat-card.c1 .feat-tag { background: #DBEAFE; color: #3B52D4; }
        .feat-card.c2 .feat-tag { background: #FEF3C7; color: #D97706; }
        .feat-card.c3 .feat-tag { background: #EDE9FE; color: #7C3AED; }
        .feat-card.c4 .feat-tag { background: #D1FAE5; color: #059669; }

        .how { background: var(--navy); }
        .how .section-title { color: #fff; }
        .how .section-sub { color: rgba(255,255,255,0.55); }
        .how .section-label { color: var(--yellow); }
        .how .section-label::before { background: var(--yellow); }
        .steps { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); margin-top: 56px; position: relative; }
        .steps::before { content: ''; position: absolute; top: 36px; left: 12%; right: 12%; height: 2px; background: repeating-linear-gradient(90deg,rgba(251,191,36,0.4) 0 12px,transparent 12px 24px); }
        .step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 24px; }
        .step-num { width: 72px; height: 72px; border-radius: 50%; background: rgba(251,191,36,0.1); border: 2px solid rgba(251,191,36,0.4); display: flex; align-items: center; justify-content: center; font-family: 'Fredoka',sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--yellow); margin-bottom: 24px; position: relative; z-index: 2; }
        .step h3 { font-family: 'Fredoka',sans-serif; font-size: 1.1rem; color: #fff; margin-bottom: 10px; }
        .step p { font-size: 0.85rem; color: rgba(255,255,255,0.5); line-height: 1.65; }

        .mission-band { background: linear-gradient(135deg,var(--yellow),#F59E0B); padding: 72px 5%; display: flex; align-items: center; gap: 60px; position: relative; overflow: hidden; }
        .mission-band::before { content: ''; position: absolute; right: 5%; top: 50%; transform: translateY(-50%); font-size: 9rem; opacity: .12; }
        .mission-text h2 { font-family: 'Fredoka',sans-serif; font-size: clamp(1.8rem,3.5vw,2.6rem); font-weight: 700; color: var(--navy); line-height: 1.2; margin-bottom: 14px; }
        .mission-text p { font-size: 1rem; color: rgba(11,31,75,0.7); line-height: 1.7; max-width: 560px; }
        .mission-stat { display: flex; flex-direction: column; align-items: center; background: rgba(11,31,75,0.08); border-radius: 20px; padding: 24px 36px; flex-shrink: 0; text-align: center; }
        .mission-stat strong { font-family: 'Fredoka',sans-serif; font-size: 3rem; font-weight: 700; color: var(--navy); }
        .mission-stat span { font-size: 0.85rem; color: rgba(11,31,75,0.6); font-weight: 600; }

        .pricing { background: #fff; }
        .pricing-grid { display: flex; gap: 24px; margin-top: 56px; justify-content: center; flex-wrap: wrap; }
        .plan { border: 2px solid #E2E8F0; border-radius: 28px; padding: 40px 36px; flex: 1; min-width: 260px; max-width: 340px; transition: transform .2s; }
        .plan:hover { transform: translateY(-4px); }
        .plan.featured { background: var(--navy); border-color: var(--navy); position: relative; }
        .plan-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--yellow); color: var(--navy); font-size: 0.72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; padding: 5px 18px; border-radius: 99px; }
        .plan-name { font-family: 'Fredoka',sans-serif; font-size: 1.2rem; margin-bottom: 8px; color: var(--navy); }
        .plan.featured .plan-name { color: #fff; }
        .plan-price { font-family: 'Fredoka',sans-serif; font-size: 3rem; font-weight: 700; line-height: 1; margin-bottom: 6px; color: var(--navy); }
        .plan.featured .plan-price { color: var(--yellow); }
        .plan-period { font-size: 0.82rem; color: var(--muted); margin-bottom: 28px; }
        .plan.featured .plan-period { color: rgba(255,255,255,0.45); }
        .plan-feats { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .plan-feats li { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; color: var(--text); }
        .plan.featured .plan-feats li { color: rgba(255,255,255,0.8); }
        .check { color: #22c55e; font-size: 1rem; flex-shrink: 0; }
        .btn-plan { width: 100%; padding: 14px; border-radius: 14px; font-family: 'Plus Jakarta Sans',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all .2s; border: 2px solid #E2E8F0; background: var(--off); color: var(--navy); }
        .plan.featured .btn-plan { background: var(--yellow); color: var(--navy); border: none; }

        .testimonials { background: var(--off); }
        .testi-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 20px; margin-top: 48px; }
        .testi-card { background: #fff; border-radius: 20px; padding: 28px; border: 1.5px solid #E2E8F0; }
        .stars { color: var(--yellow); font-size: 0.9rem; margin-bottom: 14px; }
        .testi-card p { font-size: 0.9rem; color: var(--text); line-height: 1.7; margin-bottom: 20px; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-ava { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .testi-author strong { display: block; font-size: 0.88rem; color: var(--navy); }
        .testi-author span { font-size: 0.78rem; color: var(--muted); }

        footer { background: var(--navy); padding: 60px 5% 36px; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .footer-brand p { color: rgba(255,255,255,0.45); font-size: 0.85rem; line-height: 1.65; max-width: 280px; margin-top: 14px; }
        .footer-col h4 { color: #fff; font-size: 0.85rem; font-weight: 700; margin-bottom: 16px; }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-col a { color: rgba(255,255,255,0.45); text-decoration: none; font-size: 0.83rem; transition: color .2s; }
        .footer-col a:hover { color: var(--yellow); }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-bottom p { color: rgba(255,255,255,0.3); font-size: 0.8rem; }
        .footer-langs { display: flex; gap: 8px; }
        .footer-langs button { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.5); border-radius: 8px; padding: 4px 12px; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans',sans-serif; transition: all .2s; }
        .footer-langs button:hover { background: rgba(251,191,36,0.2); color: var(--yellow); border-color: rgba(251,191,36,0.4); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes typing { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }

        @media(max-width:900px){
          .hero{grid-template-columns:1fr;text-align:center;}
          .hero p{margin:0 auto 36px;}
          .hero-ctas{justify-content:center;}
          .hero-trust{justify-content:center;}
          .hero-visual{margin-top:48px;}
          .float-card{display:none;}
          .footer-grid{grid-template-columns:1fr 1fr;}
          .mission-band{flex-direction:column;text-align:center;}
          .steps::before{display:none;}
        }
        @media(max-width:600px){
          .nav-links{display:none;}
          .footer-grid{grid-template-columns:1fr;}
        }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav>
        <a href="#" className="logo">
          <img src="/novere_logo.png" alt="NOVERE" />
          NOVERE
        </a>
        <ul className="nav-links">
          <li><a href="#features">Fonctionnalités</a></li>
          <li><a href="#how">Comment ça marche</a></li>
          <li><a href="#pricing">Tarifs</a></li>
          <li><a href="#mission">Notre mission</a></li>
        </ul>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn-nav" onClick={() => router.push('/auth')}>Commencer →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-dots" />
        <div className="hero-text">
          <div className="hero-badge">Montréal · Haïti · Avenir</div>
          <h1>Apprendre devrait être<br /><em>une aventure</em></h1>
          <p>
            NOVERE est le compagnon d'apprentissage des enfants de Montréal — un tuteur IA personnalisé,
            des mentors inspirants, des leçons de vie en français et en créole.
            Chaque abonnement aide un enfant en Haïti.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => router.push('/auth')}>Commencer gratuitement ✦</button>
            <button className="btn-outline" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior:'smooth' })}>Voir comment ça marche</button>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              <span>👩</span><span>👨</span><span>👩🏾</span>
            </div>
            <p className="trust-text"><strong>Pilot en cours</strong> · Montréal, 2025</p>
          </div>
        </div>

        <div className="hero-visual">
          <div style={{ position:'relative' }}>
            <div className="float-card left">
              <div style={{ fontSize:'1.4rem' }}>⭐</div>
              <div className="float-text"><p>50 points gagnés</p><span>Session Pomodoro · Maths</span></div>
            </div>
            <div className="phone-frame">
              <div className="phone-status">
                <span>9:41</span>
                <div className="phone-notch" />
                <span>●●●</span>
              </div>
              <div className="chat-screen">
                <div className="chat-header">
                  <img src="/novere_logo.png" alt="NOVERE" className="avatar-img" />
                  <div className="chat-header-text">
                    <p>Naruto · Ton compagnon</p>
                    <span>Français · Kreyòl</span>
                  </div>
                  <div className="online-dot" />
                </div>
                <div className="bubble bubble-ai">Hey Lucas! Si tu coupes une pizza en 4 parts égales et tu en prends 2, c'est quelle fraction? 🍕</div>
                <div className="bubble bubble-user">c'est 2/4? 😅</div>
                <div className="bubble bubble-ai">Exactement! Et tu peux simplifier ça? Réfléchis — 2 et 4 ont un diviseur commun... 🤔</div>
                <div className="bubble bubble-typing"><span /><span /><span /></div>
              </div>
              <div className="phone-points">
                <div className="points-icon">⭐</div>
                <div className="points-text"><p>620 / 1000 pts</p><span>Prochain cadeau NOVERE</span></div>
                <div className="points-bar-wrap"><div className="points-bar" /></div>
              </div>
            </div>
            <div className="float-card right">
              <div style={{ fontSize:'1.4rem' }}>🔮</div>
              <div className="float-text"><p>Mentor · Dr. Fabiola</p><span>Médecine · McGill</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-label">Ce qu'on offre</div>
        <h2 className="section-title">Quatre piliers pour<br />un enfant qui brille</h2>
        <p className="section-sub">Chaque fonctionnalité est conçue pour allier plaisir, curiosité et vraie progression scolaire.</p>
        <div className="features-grid">
          {[
            { c:'c1', icon:'🧠', title:'Compagnon IA', desc:'Ton enfant construit son compagnon lors de l\'arrivée. Ce compagnon l\'accompagne dans chaque session — il guide, questionne, et adapte son style selon la personnalité choisie.', tag:'Socratique · Adaptatif' },
            { c:'c2', icon:'🔮', title:'Mentors du Rêve', desc:'Les enfants sont jumelés avec des étudiants universitaires et professionnels qui font le métier dont ils rêvent. Inspirant, concret, et supervisé.', tag:'Sécurisé · Supervisé' },
            { c:'c3', icon:'🦸', title:'Quêtes & Vie', desc:'Des leçons sur ce que l\'école n\'enseigne pas — finances personnelles, santé mentale, citoyenneté — livrées par des super-héros avec des mini-quiz.', tag:'Quotidien · Engageant' },
            { c:'c4', icon:'🎁', title:'Points → Cadeaux', desc:'Chaque session Pomodoro complète rapporte des points échangeables contre de vrais cadeaux. L\'effort devient visible et tangible.', tag:'Motivant · Tangible' },
          ].map(f => (
            <div key={f.c} className={`feat-card ${f.c}`}>
              <div className="feat-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <span className="feat-tag">{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="section-label">Comment ça marche</div>
        <h2 className="section-title">Simple pour les parents,<br />magique pour les enfants</h2>
        <p className="section-sub">En moins de 5 minutes, votre enfant est prêt à apprendre avec son nouveau compagnon.</p>
        <div className="steps">
          {[
            { n:'01', title:'Créer un profil', desc:'Le parent s\'inscrit et configure le compte. L\'enfant choisit sa langue — français ou créole haïtien.' },
            { n:'02', title:'Construire le compagnon', desc:'En 5 étapes ludiques, l\'enfant crée son compagnon IA unique — type de créature, couleurs, personnalité.' },
            { n:'03', title:'Apprendre chaque jour', desc:'Sessions Pomodoro de 25 min, quêtes de vie, et échanges avec mentors réels — 20 min par jour font une vraie différence.' },
            { n:'04', title:'Gagner des récompenses', desc:'Les sessions complètes rapportent des points. Les points donnent de vrais cadeaux. La progression est visible.' },
          ].map(s => (
            <div key={s.n} className="step">
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <div className="mission-band" id="mission">
        <div className="mission-text">
          <h2>Chaque abonnement plante<br />une graine en Haïti 🇭🇹</h2>
          <p>
            NOVERE signifie "Nouvel Héritage". 10% de chaque abonnement est reversé à des organisations
            vérifiées qui accompagnent les enfants haïtiens les plus vulnérables.
            Un rapport d'impact annuel est publié publiquement. L'avenir se construit ensemble.
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16, flexShrink:0 }}>
          {/* Donation stat */}
          <div className="mission-stat">
            <strong>10%</strong>
            <span>de chaque abonnement</span>
            <span style={{ marginTop:6 }}>reversé en Haïti</span>
          </div>

          {/* Kids counter */}
          <div style={{
            background: 'rgba(11,31,75,0.08)', borderRadius: 20,
            padding: '24px 36px', textAlign: 'center',
            border: '2px solid rgba(11,31,75,0.12)',
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontSize:'2rem' }}>🎒</span>
              <span style={{ fontFamily:"'Fredoka',sans-serif", fontSize:'3rem', fontWeight:700, color:'var(--navy)', lineHeight:1 }}>0</span>
              <span style={{ fontFamily:"'Fredoka',sans-serif", fontSize:'1.4rem', fontWeight:600, color:'rgba(11,31,75,0.4)', alignSelf:'flex-end', paddingBottom:4 }}>/ 100</span>
            </div>
            <span style={{ fontSize:'0.85rem', color:'rgba(11,31,75,0.6)', fontWeight:600 }}>enfants parrainés</span>
            <div style={{ marginTop:12, height:8, background:'rgba(11,31,75,0.1)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:'0%', background:'var(--navy)', borderRadius:99, transition:'width 1s ease' }} />
            </div>
            <p style={{ fontSize:'0.75rem', color:'rgba(11,31,75,0.5)', marginTop:8 }}>Objectif : 100 enfants scolarisés d'ici fin 2026</p>
          </div>
        </div>
      </div>



      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="section-label">Tarifs</div>
        <h2 className="section-title">Un investissement dans<br />l'avenir de votre enfant</h2>
        <p className="section-sub">Sans engagement. Annulable à tout moment. Essai gratuit de 14 jours inclus.</p>
        <div className="pricing-grid">
          <div className="plan">
            <div className="plan-name">Découverte</div>
            <div className="plan-price">Gratuit</div>
            <div className="plan-period">Pour toujours · fonctions limitées</div>
            <ul className="plan-feats">
              <li><span className="check">✓</span> Compagnon IA (5 sessions/mois)</li>
              <li><span className="check">✓</span> Quêtes de vie (3/semaine)</li>
              <li><span className="check">✓</span> Système de points basique</li>
            </ul>
            <button className="btn-plan" onClick={() => router.push('/auth')}>Commencer gratuitement</button>
          </div>
          <div className="plan featured">
            <div className="plan-badge">⭐ Le plus populaire</div>
            <div className="plan-name">Famille</div>
            <div className="plan-price">$14<span style={{ fontSize:'1.2rem', color:'rgba(255,255,255,0.5)' }}>.99</span></div>
            <div className="plan-period">par mois · jusqu'à 2 enfants</div>
            <ul className="plan-feats">
              <li><span className="check">✓</span> Compagnon IA illimité + Pomodoro</li>
              <li><span className="check">✓</span> Quêtes de vie quotidiennes + quiz</li>
              <li><span className="check">✓</span> Flashcards automatiques</li>
              <li><span className="check">✓</span> 1 mentor attitré par enfant</li>
              <li><span className="check">✓</span> Points et cadeaux NOVERE</li>
              <li><span className="check">✓</span> Portail parents + horaire d'étude</li>
              <li><span className="check">✓</span> Français + Créole haïtien</li>
            </ul>
            <button className="btn-plan" onClick={() => router.push('/auth')}>Démarrer l'essai gratuit →</button>
          </div>
          <div className="plan">
            <div className="plan-name">École</div>
            <div className="plan-price">Sur<span style={{ fontSize:'1.4rem' }}> devis</span></div>
            <div className="plan-period">Licence établissement scolaire</div>
            <ul className="plan-feats">
              <li><span className="check">✓</span> Tout le plan Famille</li>
              <li><span className="check">✓</span> Tableau de bord enseignant</li>
              <li><span className="check">✓</span> Contenu aligné au programme QC</li>
              <li><span className="check">✓</span> Support dédié</li>
            </ul>
            <button className="btn-plan">Nous contacter</button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="section-label">Témoignages</div>
        <h2 className="section-title">Des familles montréalaises<br />nous font confiance</h2>
        <div className="testi-grid">
          {[
            { stars:'★★★★★', quote:'"Mon fils de 9 ans attend son compagnon chaque soir. Il me demande des devoirs supplémentaires! Je n\'aurais jamais cru ça possible."', name:'Marlène J.', role:'Maman · Montréal-Nord', ava:'👩🏾', bg:'#FEF3C7' },
            { stars:'★★★★★', quote:'"Le fait que ça soit disponible en créole haïtien, c\'est énorme pour notre famille. Ma fille alterne les deux langues sans problème."', name:'Jean-Pierre M.', role:'Papa · Saint-Michel', ava:'👨🏿', bg:'#DBEAFE' },
            { stars:'★★★★★', quote:'"Les flashcards automatiques sont brillantes. Ma fille révise pendant 5 minutes avant l\'école et ses notes en maths ont déjà augmenté."', name:'Sophia L.', role:'Maman · Côte-des-Neiges', ava:'👩', bg:'#D1FAE5' },
          ].map((t, i) => (
            <div key={i} className="testi-card">
              <div className="stars">{t.stars}</div>
              <p>{t.quote}</p>
              <div className="testi-author">
                <div className="testi-ava" style={{ background: t.bg }}>{t.ava}</div>
                <div><strong>{t.name}</strong><span>{t.role}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <img src="/novere_logo.png" alt="NOVERE" style={{ width:36, height:36, objectFit:'contain' }} />
              <span style={{ fontFamily:"'Fredoka',sans-serif", color:'#fff', fontSize:'1.6rem', fontWeight:700 }}>NOVERE</span>
            </div>
            <p>Nouvel Héritage. Apprendre aujourd'hui pour changer deux pays demain. Montréal · Haïti.</p>
          </div>
          <div className="footer-col">
            <h4>Produit</h4>
            <ul>
              <li><a href="#">Compagnon IA</a></li>
              <li><a href="#">Mentors</a></li>
              <li><a href="#">Quêtes de vie</a></li>
              <li><a href="#">Récompenses</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Compagnie</h4>
            <ul>
              <li><a href="#">Notre mission</a></li>
              <li><a href="#">Impact Haïti</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Carrières</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Nous contacter</a></li>
              <li><a href="#">Confidentialité</a></li>
              <li><a href="#">Conditions d'utilisation</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 NOVERE. Tous droits réservés. Fait à Montréal avec ❤️ pour Haïti.</p>
          <div className="footer-langs">
            <button>Français</button>
            <button>Kreyòl</button>
            <button>English</button>
          </div>
        </div>
      </footer>
    </>
  )
}

