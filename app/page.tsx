'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const COPY = {
  fr: {
    navLinks: ['Ce qu\'on offre', 'Comment ça marche', 'Notre mission', 'Tarifs'],
    navCta: 'Essayer gratuitement →',
    tagline: 'Le plaisir d\'apprendre en s\'amusant.',
    badge: 'Montréal · Haïti · Grandir ensemble',
    heroTitle: 'Le plaisir d\'apprendre\nen s\'amusant.',
    heroSub: 'NOVERE accompagne les enfants avec une expérience de tutorat pensée pour la confiance, la curiosité et la progression. Grâce à un compagnon d\'apprentissage unique et à des mentors inspirants, l\'enfant avance à son rythme, dans un cadre rassurant et engageant.',
    ctaPrimary: 'Essayer gratuitement →',
    ctaSecondary: 'Voir comment ça marche',
    trustLabel: 'Pilot en cours · Montréal, 2025',
    featEyebrow: 'Le plaisir d\'apprendre en s\'amusant',
    featTitle: 'Un outil de tutorat personnalisé conçu pour offrir une expérience basée sur des méthodes d\'étude efficaces et engageantes.',
    feats: [
      { icon: '🧠', title: 'Un compagnon qui lui ressemble', desc: 'Dès le départ, l\'enfant crée son propre compagnon d\'apprentissage. Ce repère familier rend chaque session plus engageante et soutient l\'habitude d\'apprendre.', tag: 'Personnalisé · Engageant' },
      { icon: '🔮', title: 'Des modèles qui ouvrent des horizons', desc: 'Des étudiants et des professionnels montréalais partagent leur parcours lors de rencontres qui aident l\'enfant à se projeter et à imaginer des opportunités professionnelles.', tag: 'Inspirant · Supervisé' },
      { icon: '🦸', title: 'Des apprentissages qui comptent vraiment', desc: 'NOVERE aborde des thèmes essentiels comme la finance personnelle, la santé mentale et la citoyenneté. L\'objectif est de soutenir la réussite scolaire tout en développant des repères utiles pour la vie.', tag: 'Essentiel · Quotidien' },
      { icon: '🎁', title: 'Des progrès qu\'on peut voir', desc: 'Chaque séance contribue à une progression tangible. Les récompenses rendent les efforts visibles et encouragent à poursuivre.', tag: 'Motivant · Tangible' },
    ],
    howEyebrow: 'Comment ça fonctionne',
    howTitle: 'Une mise en place simple, pour une habitude qui s\'installe naturellement.',
    howSub: 'En quelques minutes, tout est prêt : un compagnon personnalisé et une expérience pensée pour revenir chaque jour.',
    steps: [
      { title: 'Créer le profil', desc: 'Le parent crée le compte, choisit la langue d\'apprentissage selon les besoins de l\'enfant, et définit les périodes d\'étude.' },
      { title: 'Donner vie au compagnon', desc: 'L\'enfant personnalise son compagnon d\'apprentissage en quelques étapes simples.' },
      { title: 'Apprendre un peu chaque jour', desc: 'Des séances courtes basées sur des méthodes d\'étude éprouvées permettent une progression efficace en mathématiques, en français et dans les autres matières du programme québécois.' },
      { title: 'Voir les progrès', desc: 'Au fil du temps, les quêtes et les interactions adaptées au rythme de l\'enfant installent une routine durable. L\'enfant apprend tout en gagnant des points et des récompenses.' },
    ],
    missionEyebrow: 'Notre mission',
    missionTitle: 'Faire de l\'apprentissage un lien, ici et au-delà.',
    missionBody: 'NOVERE est né entre Montréal et Haïti. Sa mission est d\'offrir aux enfants d\'ici une expérience d\'apprentissage plus engageante, tout en contribuant à un impact concret pour d\'autres enfants ailleurs.',
    missionBody2: 'C\'est pourquoi 10% de chaque abonnement sont reversés à des organisations vérifiées qui soutiennent la scolarité d\'enfants en Haïti.',
    missionStat: '10% de chaque abonnement reversé en Haïti.',
    kidsGoal: 'Objectif : 100 enfants scolarisés d\'ici fin 2026',
    kidsLabel: 'enfants parrainés',
    pricingEyebrow: 'Tarifs',
    pricingTitle: 'Des options simples pour commencer.',
    pricingSub: 'Essai gratuit de 14 jours. Sans engagement. Annulable à tout moment.',
    plans: [
      { name: 'Découverte', price: 'Gratuit', period: 'Pour toujours · fonctions limitées', feats: ['Compagnon IA (5 sessions/mois)', 'Quêtes de vie (3/semaine)', 'Système de points basique'], cta: 'Commencer gratuitement', featured: false },
      { name: 'Famille', price: '$9', cents: '.99', period: 'par mois · jusqu\'à 2 enfants', feats: ['Compagnon IA illimité + Pomodoro', 'Quêtes de vie quotidiennes + quiz', 'Flashcards automatiques', '1 mentor attitré par enfant', 'Points et cadeaux NOVERE', 'Portail parents + horaire d\'étude', 'Français + Créole haïtien'], cta: 'Démarrer l\'essai gratuit →', featured: true },
      { name: 'École', price: 'Sur devis', period: 'Licence établissement scolaire', feats: ['Tout le plan Famille', 'Tableau de bord enseignant', 'Contenu aligné au programme QC', 'Support dédié'], cta: 'Nous contacter', featured: false },
    ],
    finalTitle: 'Apprendre ensemble, avec plus de plaisir et plus de constance.',
    finalSub: 'Découvrez comment NOVERE peut prendre sa place dans la routine de tutorat de votre enfant et contribuer à un impact plus large.',
    finalCta: 'Essayer gratuitement →',
    finalCta2: 'Voir notre mission',
    footerTagline: 'NOVERE — Le plaisir d\'apprendre en s\'amusant.',
    footerSig: 'Montréal · Haïti',
    footerCols: [
      { title: 'Produit', links: ['Compagnon', 'Mentors', 'Leçons de vie', 'Récompenses'] },
      { title: 'Compagnie', links: ['Notre mission', 'Impact Haïti', 'Blog', 'Carrières'] },
      { title: 'Support', links: ['FAQ', 'Nous contacter', 'Confidentialité', 'Conditions d\'utilisation'] },
    ],
    copyright: '© 2025 NOVERE Inc. — Montréal, Québec.',
    phoneBubble1: 'Si tu coupes une pizza en 4 parts égales et tu en prends 2, c\'est quelle fraction? 🍕',
    phoneBubble2: 'c\'est 2/4? 😅',
    phoneBubble3: 'Exactement! Et tu peux simplifier ça? Réfléchis... 🤔',
    phonePal: 'Naruto · Ton compagnon',
    phoneLang: 'Français · Kreyòl',
    phonePoints: '620 / 1000 pts',
    phonePointsSub: 'Prochain cadeau NOVERE',
    floatLeft: { label: '50 points gagnés', sub: 'Session Pomodoro · Maths' },
    floatRight: { label: 'Mentor · Dr. Fabiola', sub: 'Médecine · McGill' },
    testiEyebrow: 'Témoignages',
    testiTitle: 'Des familles montréalaises nous font confiance',
    testis: [
      { quote: '"Mon fils de 9 ans attend son compagnon chaque soir. Il me demande des devoirs supplémentaires! Je n\'aurais jamais cru ça possible."', name: 'Marlène J.', role: 'Maman · Montréal-Nord', ava: '👩🏾', bg: '#FEF3C7' },
      { quote: '"Le fait que ça soit disponible en créole haïtien, c\'est énorme pour notre famille. Ma fille alterne les deux langues sans problème."', name: 'Jean-Pierre M.', role: 'Papa · Saint-Michel', ava: '👨🏿', bg: '#DBEAFE' },
      { quote: '"Les flashcards automatiques sont brillantes. Ma fille révise pendant 5 minutes avant l\'école et ses notes en maths ont déjà augmenté."', name: 'Sophia L.', role: 'Maman · Côte-des-Neiges', ava: '👩', bg: '#D1FAE5' },
    ],
  },
  kr: {
    navLinks: ['Sa nou ofri', 'Kijan sa mache', 'Misyon nou', 'Pri'],
    navCta: 'Eseye gratis →',
    tagline: 'Aprann pandan wap amize w.',
    badge: 'Montréal · Ayiti · Grandi ansanm',
    heroTitle: 'Aprann pandan\nwap amize w.',
    heroSub: 'NOVERE akonpaye timoun yo ak yon eksperyans tutorat ki fèt pou konfyans, kiryozite ak pwogrè. Avèk yon konpayon aprantisaj inik ak konseye ki enspire, timoun nan avanse nan rit pa li, nan yon anviwònman ki ankouraje li epi fè li santi l an sekirite.',
    ctaPrimary: 'Eseye gratis →',
    ctaSecondary: 'Gade kijan sa mache',
    trustLabel: 'Pilot an kou · Montréal, 2025',
    featEyebrow: 'Aprann',
    featTitle: 'Yon zouti tutorat pèsonalize ki baze sou metòd etid ki efikas epi ki enteresan.',
    feats: [
      { icon: '🧠', title: 'Yon konpayon ki sanble avè l', desc: 'Depi nan kòmansman, timoun nan kreye pwòp konpayon aprantisaj li. Repè sa a fè chak sesyon pi enteresan epi ede devlope abitid aprann.', tag: 'Pèsonalize · Enteresan' },
      { icon: '🔮', title: 'Modèl ki louvri orizon', desc: 'Etidyan ak pwofesyonèl montreyalè pataje chemen yo pandan rankont ki ede timoun nan imajine diferan posiblite pou lavni li.', tag: 'Enspiran · Sipèvize' },
      { icon: '🦸', title: 'Aprantisaj ki vrèman enpòtan', desc: 'NOVERE abòde sijè esansyèl tankou finans pèsonèl, sante mantal ak sitwayènte. Objektif la se soutni reyisit lekòl pandan li devlope repè ki itil pou lavi.', tag: 'Esansyèl · Chak jou' },
      { icon: '🎁', title: 'Pwogrè ou ka wè', desc: 'Chak sesyon pote yon pwogrè klè. Rekonpans yo fè efò yo vizib epi ankouraje timoun nan kontinye.', tag: 'Motivasyon · Konkrè' },
    ],
    howEyebrow: 'Kijan sa mache',
    howTitle: 'Yon kòmansman senp, pou yon abitid ki vin enstale natirèlman.',
    howSub: 'Nan kèk minit sèlman, tout bagay pare: yon konpayon pèsonalize ak yon eksperyans ki fèt pou timoun nan retounen ladan chak jou.',
    steps: [
      { title: 'Kreye pwofil la', desc: 'Paran an kreye kont lan, chwazi lang aprantisaj la selon bezwen timoun nan, epi fikse peryòd etid yo.' },
      { title: 'Bay konpayon an lavi', desc: 'Timoun nan pèsonalize konpayon aprantisaj li an kèk etap senp.' },
      { title: 'Aprann yon ti kras chak jou', desc: 'Sesyon kout ki baze sou metòd etid ki deja pwouve yo pèmèt timoun nan avanse nan matematik, franse ak lòt matyè nan pwogram kebekwa a.' },
      { title: 'Wè pwogrè yo', desc: 'Avèk tan, kestyon, aktivite ak entèraksyon ki adapte ak rit timoun nan kreye yon abitid solid. Timoun nan aprann pandan li ranmase pwen ak rekonpans.' },
    ],
    missionEyebrow: 'Misyon nou',
    missionTitle: 'Fè aprantisaj vin yon lyen, isit ak pi lwen.',
    missionBody: 'NOVERE fèt ant Montréal ak Ayiti. Misyon li se ofri timoun isit yo yon eksperyans tutorat ki pi enteresan, pandan li kreye tou yon enpak konkrè pou lòt timoun lòt kote.',
    missionBody2: 'Se poutèt sa 10% nan chak abònman ale bay òganizasyon verifye ki sipòte lekòl timoun ann Ayiti.',
    missionStat: '10% nan chak abònman ale ann Ayiti.',
    kidsGoal: 'Objektif : 100 timoun eskolarize avan fen 2026',
    kidsLabel: 'timoun parène',
    pricingEyebrow: 'Pri',
    pricingTitle: 'Opsyon senp pou kòmanse.',
    pricingSub: 'Eseye gratis pandan 14 jou. San angajman. Ou ka anile nenpòt ki lè.',
    plans: [
      { name: 'Dekouvèt', price: 'Gratis', period: 'Pou toujou · fonksyon limite', feats: ['Konpayon IA (5 sesyon/mwa)', 'Kestyon lavi (3/semèn)', 'Sistèm pwen debaz'], cta: 'Kòmanse gratis', featured: false },
      { name: 'Fanmi', price: '$9', cents: '.99', period: 'pa mwa · jiska 2 timoun', feats: ['Konpayon IA san limit + Pomodoro', 'Kestyon lavi chak jou + quiz', 'Flashcard otomatik', '1 mentor pou chak timoun', 'Pwen ak kado NOVERE', 'Pòtay paran + orè etid', 'Franse + Kreyòl ayisyen'], cta: 'Kòmanse esè gratis →', featured: true },
      { name: 'Lekòl', price: 'Sou demann', period: 'Lisans etablisman', feats: ['Tout plan Fanmi', 'Tablo pwofesè', 'Kontni aliyen ak pwogram QC', 'Sipò dedye'], cta: 'Kontakte nou', featured: false },
    ],
    finalTitle: 'Aprann ansanm, ak plis plezi ak plis regilarite.',
    finalSub: 'Dekouvri kijan NOVERE ka pran plas li nan woutin tutorat pitit ou epi kontribye nan yon enpak ki pi laj.',
    finalCta: 'Eseye gratis →',
    finalCta2: 'Gade misyon nou',
    footerTagline: 'NOVERE — Aprann pandan wap amize w.',
    footerSig: 'Montréal · Ayiti',
    footerCols: [
      { title: 'Pwodwi', links: ['Konpayon', 'Mentor', 'Leson lavi', 'Rekonpans'] },
      { title: 'Konpayi', links: ['Misyon nou', 'Enpak Ayiti', 'Blog', 'Karyè'] },
      { title: 'Sipò', links: ['FAQ', 'Kontakte nou', 'Konfidansyalite', 'Kondisyon itilizasyon'] },
    ],
    copyright: '© 2025 NOVERE Inc. — Montréal, Québec.',
    phoneBubble1: 'Si ou koupe yon pizza an 4 pati egal epi ou pran 2, ki fraksyon sa a? 🍕',
    phoneBubble2: 'se 2/4? 😅',
    phoneBubble3: 'Egzakteman! Epi ou ka senplifye sa? Reflechi... 🤔',
    phonePal: 'Naruto · Konpayon ou',
    phoneLang: 'Franse · Kreyòl',
    phonePoints: '620 / 1000 pwen',
    phonePointsSub: 'Pwochen kado NOVERE',
    floatLeft: { label: '50 pwen ranmase', sub: 'Sesyon Pomodoro · Math' },
    floatRight: { label: 'Mentor · Dr. Fabiola', sub: 'Medsin · McGill' },
    testiEyebrow: 'Temwayaj',
    testiTitle: 'Fanmi montreyalè fè nou konfyans',
    testis: [
      { quote: '"Pitit gason mwen ki gen 9 an ap tann konpayon li chak swa. Li mande m devwa anplis! Mwen pa ta janm kwè sa posib."', name: 'Marlène J.', role: 'Manman · Montréal-Nord', ava: '👩🏾', bg: '#FEF3C7' },
      { quote: '"Lefèt ke li disponib an kreyòl ayisyen, sa se yon gwo bagay pou fanmi nou. Fi mwen alène de lang yo san pwoblèm."', name: 'Jean-Pierre M.', role: 'Papa · Saint-Michel', ava: '👨🏿', bg: '#DBEAFE' },
      { quote: '"Flashcard otomatik yo bril. Fi mwen revize pandan 5 minit anvan lekòl epi nòt matematik li yo deja monte."', name: 'Sophia L.', role: 'Manman · Côte-des-Neiges', ava: '👩', bg: '#D1FAE5' },
    ],
  },
}

export default function Root() {
  const router   = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/home')
      else setChecking(false)
    })
  }, [])

  if (checking) return (
    <div style={{ minHeight:'100vh', background:'#0B1F4B', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <img src="/novere_logo.png" style={{ width:64, height:64, objectFit:'contain', animation:'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  )

  return <LandingPage />
}

function LandingPage() {
  const router   = useRouter()
  const [lang, setLang] = useState<'fr'|'kr'>('fr')
  const c = COPY[lang]

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--navy:#0B1F4B;--blue:#3B52D4;--sky:#DBEAFE;--yellow:#FBBF24;--white:#FFFFFF;--off:#F8FAFF;--text:#1E293B;--muted:#64748B}
        html{scroll-behavior:smooth;font-family:'Plus Jakarta Sans',sans-serif}
        body{background:var(--off);color:var(--text);overflow-x:hidden}

        nav{position:sticky;top:0;z-index:100;background:rgba(11,31,75,0.97);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:0 5%;height:68px;border-bottom:2px solid rgba(251,191,36,0.25)}
        .logo{font-family:'Fredoka',sans-serif;font-size:1.9rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:10px;text-decoration:none}
        .logo img{width:38px;height:38px;object-fit:contain}
        .nav-links{display:flex;gap:32px;list-style:none}
        .nav-links a{color:rgba(255,255,255,0.75);text-decoration:none;font-size:0.9rem;font-weight:500;transition:color .2s}
        .nav-links a:hover{color:var(--yellow)}
        .lang-pill{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);border:1px solid rgba(255,255,255,0.2);border-radius:99px;padding:5px 16px;font-size:0.78rem;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif}
        .lang-pill:hover,.lang-pill.active{background:rgba(251,191,36,0.2);color:var(--yellow);border-color:rgba(251,191,36,0.5)}
        .btn-nav{background:var(--yellow);color:var(--navy);border:none;border-radius:99px;padding:8px 22px;font-weight:700;font-size:0.88rem;cursor:pointer;transition:transform .15s,box-shadow .15s;font-family:'Plus Jakarta Sans',sans-serif}
        .btn-nav:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(251,191,36,0.45)}

        .hero{background:linear-gradient(135deg,var(--navy) 0%,#0D2860 60%,#1a1060 100%);min-height:92vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:80px 5% 60px;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 70% 50%,rgba(59,82,212,0.25) 0%,transparent 70%);pointer-events:none}
        .hero-dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px);background-size:32px 32px}
        .hero-text{position:relative;z-index:2}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.4);border-radius:99px;padding:6px 16px;color:var(--yellow);font-size:0.8rem;font-weight:600;margin-bottom:28px;animation:fadeUp .6s ease both}
        .hero-badge::before{content:'✦';font-size:0.7rem}
        .hero h1{font-family:'Fredoka',sans-serif;font-size:clamp(2.8rem,5vw,4.2rem);font-weight:700;line-height:1.1;color:#fff;margin-bottom:24px;animation:fadeUp .6s .1s ease both;white-space:pre-line}
        .hero h1 em{font-style:normal;color:var(--yellow)}
        .hero p{font-size:1.1rem;line-height:1.75;color:rgba(255,255,255,0.7);max-width:480px;margin-bottom:36px;animation:fadeUp .6s .2s ease both}
        .hero-ctas{display:flex;gap:14px;flex-wrap:wrap;animation:fadeUp .6s .3s ease both}
        .btn-primary{background:var(--yellow);color:var(--navy);border:none;border-radius:14px;padding:14px 32px;font-weight:700;font-size:1rem;cursor:pointer;transition:transform .15s,box-shadow .2s;font-family:'Plus Jakarta Sans',sans-serif}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(251,191,36,0.5)}
        .btn-outline{background:transparent;color:#fff;border:2px solid rgba(255,255,255,0.3);border-radius:14px;padding:14px 32px;font-weight:600;font-size:1rem;cursor:pointer;transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif}
        .btn-outline:hover{border-color:#fff;background:rgba(255,255,255,0.08)}
        .hero-trust{margin-top:44px;display:flex;align-items:center;gap:16px;animation:fadeUp .6s .4s ease both}
        .trust-avatars{display:flex}
        .trust-avatars span{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#8B5CF6);border:2px solid var(--navy);display:flex;align-items:center;justify-content:center;font-size:1rem;margin-left:-8px}
        .trust-avatars span:first-child{margin-left:0;background:linear-gradient(135deg,#F59E0B,#EF4444)}
        .trust-avatars span:nth-child(2){background:linear-gradient(135deg,#10B981,#3B82F6)}
        .trust-text{color:rgba(255,255,255,0.6);font-size:0.85rem}
        .trust-text strong{color:#fff}

        .hero-visual{position:relative;z-index:2;display:flex;justify-content:center;align-items:center;animation:fadeUp .7s .2s ease both}
        .phone-frame{width:280px;background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:32px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.5)}
        .phone-status{background:rgba(0,0,0,0.3);padding:12px 20px 8px;display:flex;justify-content:space-between;align-items:center}
        .phone-status span{color:rgba(255,255,255,0.5);font-size:0.7rem;font-weight:600}
        .phone-notch{width:80px;height:22px;background:rgba(0,0,0,0.5);border-radius:0 0 16px 16px;margin:0 auto}
        .chat-screen{padding:16px;display:flex;flex-direction:column;gap:12px}
        .chat-header{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.07);border-radius:14px;padding:10px 14px}
        .avatar-img{width:36px;height:36px;border-radius:50%;object-fit:contain;flex-shrink:0}
        .chat-header-text{flex:1}
        .chat-header-text p{color:#fff;font-size:0.8rem;font-weight:600}
        .chat-header-text span{color:rgba(255,255,255,0.4);font-size:0.65rem}
        .online-dot{width:8px;height:8px;border-radius:50%;background:#22c55e}
        .bubble{max-width:88%;padding:10px 14px;border-radius:16px;font-size:0.75rem;line-height:1.5}
        .bubble-ai{background:rgba(59,82,212,0.35);border:1px solid rgba(59,82,212,0.3);color:rgba(255,255,255,0.9);border-bottom-left-radius:4px;align-self:flex-start}
        .bubble-user{background:var(--yellow);color:var(--navy);font-weight:600;border-bottom-right-radius:4px;align-self:flex-end;margin-left:auto}
        .bubble-typing{display:flex;gap:4px;align-items:center;padding:12px 16px}
        .bubble-typing span{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);animation:typing 1.2s infinite}
        .bubble-typing span:nth-child(2){animation-delay:.2s}
        .bubble-typing span:nth-child(3){animation-delay:.4s}
        .phone-points{margin:8px 16px 16px;background:linear-gradient(135deg,rgba(251,191,36,0.2),rgba(251,191,36,0.05));border:1px solid rgba(251,191,36,0.3);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px}
        .points-icon{font-size:1.4rem}
        .points-text p{color:var(--yellow);font-size:0.75rem;font-weight:700}
        .points-text span{color:rgba(255,255,255,0.5);font-size:0.65rem}
        .points-bar-wrap{flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden}
        .points-bar{height:100%;width:62%;background:var(--yellow);border-radius:99px}
        .float-card{position:absolute;background:rgba(255,255,255,0.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:12px 16px;display:flex;align-items:center;gap:10px;animation:float 5s ease-in-out infinite}
        .float-card.left{left:-60px;top:30%}
        .float-card.right{right:-50px;bottom:25%;animation-delay:2.5s}
        .float-text p{color:#fff;font-size:0.72rem;font-weight:600;white-space:nowrap}
        .float-text span{color:rgba(255,255,255,0.45);font-size:0.62rem}

        section{padding:96px 5%}
        .section-label{display:inline-flex;align-items:center;gap:6px;font-size:0.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);margin-bottom:16px}
        .section-label::before{content:'';display:block;width:16px;height:2px;background:var(--blue)}
        .section-title{font-family:'Fredoka',sans-serif;font-size:clamp(2rem,4vw,3rem);font-weight:700;line-height:1.2;color:var(--navy);margin-bottom:16px}
        .section-sub{font-size:1.05rem;color:var(--muted);line-height:1.7;max-width:560px}

        .features{background:#fff}
        .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;margin-top:56px}
        .feat-card{background:var(--off);border:1.5px solid #E2E8F0;border-radius:24px;padding:32px 28px;transition:transform .2s,box-shadow .2s;position:relative;overflow:hidden}
        .feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;border-radius:24px 24px 0 0}
        .feat-card.c1::before{background:linear-gradient(90deg,#3B52D4,#60A5FA)}
        .feat-card.c2::before{background:linear-gradient(90deg,#FBBF24,#F97316)}
        .feat-card.c3::before{background:linear-gradient(90deg,#8B5CF6,#EC4899)}
        .feat-card.c4::before{background:linear-gradient(90deg,#10B981,#3B82F6)}
        .feat-card:hover{transform:translateY(-5px);box-shadow:0 20px 50px rgba(11,31,75,0.1)}
        .feat-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:20px}
        .feat-card.c1 .feat-icon{background:#DBEAFE}
        .feat-card.c2 .feat-icon{background:#FEF3C7}
        .feat-card.c3 .feat-icon{background:#EDE9FE}
        .feat-card.c4 .feat-icon{background:#D1FAE5}
        .feat-card h3{font-family:'Fredoka',sans-serif;font-size:1.2rem;font-weight:600;color:var(--navy);margin-bottom:10px}
        .feat-card p{font-size:0.9rem;color:var(--muted);line-height:1.7}
        .feat-tag{display:inline-block;margin-top:18px;font-size:0.72rem;font-weight:700;padding:4px 12px;border-radius:99px}
        .feat-card.c1 .feat-tag{background:#DBEAFE;color:#3B52D4}
        .feat-card.c2 .feat-tag{background:#FEF3C7;color:#D97706}
        .feat-card.c3 .feat-tag{background:#EDE9FE;color:#7C3AED}
        .feat-card.c4 .feat-tag{background:#D1FAE5;color:#059669}

        .how{background:var(--navy)}
        .how .section-title{color:#fff}
        .how .section-sub{color:rgba(255,255,255,0.55)}
        .how .section-label{color:var(--yellow)}
        .how .section-label::before{background:var(--yellow)}
        .steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-top:56px;position:relative}
        .steps::before{content:'';position:absolute;top:36px;left:12%;right:12%;height:2px;background:repeating-linear-gradient(90deg,rgba(251,191,36,0.4) 0 12px,transparent 12px 24px)}
        .step{display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 24px}
        .step-num{width:72px;height:72px;border-radius:50%;background:rgba(251,191,36,0.1);border:2px solid rgba(251,191,36,0.4);display:flex;align-items:center;justify-content:center;font-family:'Fredoka',sans-serif;font-size:1.6rem;font-weight:700;color:var(--yellow);margin-bottom:24px;position:relative;z-index:2}
        .step h3{font-family:'Fredoka',sans-serif;font-size:1.1rem;color:#fff;margin-bottom:10px}
        .step p{font-size:0.85rem;color:rgba(255,255,255,0.5);line-height:1.65}

        .mission-band{background:linear-gradient(135deg,var(--yellow),#F59E0B);padding:72px 5%;display:flex;align-items:center;gap:48px;position:relative;overflow:hidden;flex-wrap:wrap}
        .mission-text h2{font-family:'Fredoka',sans-serif;font-size:clamp(1.8rem,3.5vw,2.6rem);font-weight:700;color:var(--navy);line-height:1.2;margin-bottom:14px}
        .mission-text p{font-size:1rem;color:rgba(11,31,75,0.7);line-height:1.7;max-width:540px}
        .mission-text p+p{margin-top:10px}
        .mission-stats{display:flex;flex-direction:column;gap:16px;flex-shrink:0}
        .mission-stat{display:flex;flex-direction:column;align-items:center;background:rgba(11,31,75,0.08);border-radius:20px;padding:24px 36px;text-align:center}
        .mission-stat strong{font-family:'Fredoka',sans-serif;font-size:3rem;font-weight:700;color:var(--navy)}
        .mission-stat span{font-size:0.85rem;color:rgba(11,31,75,0.6);font-weight:600}

        .pricing{background:#fff}
        .pricing-grid{display:flex;gap:24px;margin-top:56px;justify-content:center;flex-wrap:wrap}
        .plan{border:2px solid #E2E8F0;border-radius:28px;padding:40px 36px;flex:1;min-width:260px;max-width:340px;transition:transform .2s}
        .plan:hover{transform:translateY(-4px)}
        .plan.featured{background:var(--navy);border-color:var(--navy);position:relative}
        .plan-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--yellow);color:var(--navy);font-size:0.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:5px 18px;border-radius:99px}
        .plan-name{font-family:'Fredoka',sans-serif;font-size:1.2rem;margin-bottom:8px;color:var(--navy)}
        .plan.featured .plan-name{color:#fff}
        .plan-price{font-family:'Fredoka',sans-serif;font-size:3rem;font-weight:700;line-height:1;margin-bottom:6px;color:var(--navy)}
        .plan.featured .plan-price{color:var(--yellow)}
        .plan-period{font-size:0.82rem;color:var(--muted);margin-bottom:28px}
        .plan.featured .plan-period{color:rgba(255,255,255,0.45)}
        .plan-feats{list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:32px}
        .plan-feats li{display:flex;align-items:center;gap:10px;font-size:0.88rem;color:var(--text)}
        .plan.featured .plan-feats li{color:rgba(255,255,255,0.8)}
        .check{color:#22c55e;font-size:1rem;flex-shrink:0}
        .btn-plan{width:100%;padding:14px;border-radius:14px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.95rem;cursor:pointer;transition:all .2s;border:2px solid #E2E8F0;background:var(--off);color:var(--navy)}
        .plan.featured .btn-plan{background:var(--yellow);color:var(--navy);border:none}
        .plan.featured .btn-plan:hover{box-shadow:0 8px 24px rgba(251,191,36,0.4)}

        .final-cta{background:linear-gradient(135deg,var(--navy),#13306B);padding:96px 5%;text-align:center}
        .final-cta h2{font-family:'Fredoka',sans-serif;font-size:clamp(2rem,4vw,3rem);font-weight:700;color:#fff;margin-bottom:16px;line-height:1.2}
        .final-cta p{font-size:1.05rem;color:rgba(255,255,255,0.6);line-height:1.7;max-width:520px;margin:0 auto 40px}
        .final-ctas{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

        .testimonials{background:var(--off)}
        .testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:48px}
        .testi-card{background:#fff;border-radius:20px;padding:28px;border:1.5px solid #E2E8F0}
        .stars{color:var(--yellow);font-size:0.9rem;margin-bottom:14px}
        .testi-card p{font-size:0.9rem;color:var(--text);line-height:1.7;margin-bottom:20px}
        .testi-author{display:flex;align-items:center;gap:12px}
        .testi-ava{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem}
        .testi-author strong{display:block;font-size:0.88rem;color:var(--navy)}
        .testi-author span{font-size:0.78rem;color:var(--muted)}

        footer{background:var(--navy);padding:60px 5% 36px}
        .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}
        .footer-brand p{color:rgba(255,255,255,0.45);font-size:0.85rem;line-height:1.65;max-width:280px;margin-top:14px}
        .footer-col h4{color:#fff;font-size:0.85rem;font-weight:700;margin-bottom:16px}
        .footer-col ul{list-style:none;display:flex;flex-direction:column;gap:10px}
        .footer-col a{color:rgba(255,255,255,0.45);text-decoration:none;font-size:0.83rem;transition:color .2s}
        .footer-col a:hover{color:var(--yellow)}
        .footer-bottom{border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
        .footer-bottom p{color:rgba(255,255,255,0.3);font-size:0.8rem}

        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes typing{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}

        @media(max-width:900px){
          .hero{grid-template-columns:1fr;text-align:center}
          .hero p{margin:0 auto 36px}
          .hero-ctas{justify-content:center}
          .hero-trust{justify-content:center}
          .hero-visual{margin-top:48px}
          .float-card{display:none}
          .footer-grid{grid-template-columns:1fr 1fr}
          .mission-band{flex-direction:column;text-align:center}
          .steps::before{display:none}
          .final-ctas{flex-direction:column;align-items:center}
        }
        @media(max-width:600px){
          .nav-links{display:none}
          .footer-grid{grid-template-columns:1fr}
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
          {c.navLinks.map((l, i) => (
            <li key={i}><a href={['#features','#how','#mission','#pricing'][i]}>{l}</a></li>
          ))}
        </ul>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button className={`lang-pill${lang==='fr'?' active':''}`} onClick={() => setLang('fr')}>FR</button>
          <button className={`lang-pill${lang==='kr'?' active':''}`} onClick={() => setLang('kr')}>KREYÒL</button>
          <button className="btn-nav" onClick={() => router.push('/auth')}>{c.navCta}</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-dots" />
        <div className="hero-text">
          <div className="hero-badge">{c.badge}</div>
          <h1>{c.heroTitle}</h1>
          <p>{c.heroSub}</p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => router.push('/auth')}>{c.ctaPrimary}</button>
            <button className="btn-outline" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior:'smooth' })}>{c.ctaSecondary}</button>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars"><span>👩</span><span>👨</span><span>👩🏾</span></div>
            <p className="trust-text"><strong>{c.trustLabel}</strong></p>
          </div>
        </div>
        <div className="hero-visual">
          <div style={{ position:'relative' }}>
            <div className="float-card left">
              <div style={{ fontSize:'1.4rem' }}>⭐</div>
              <div className="float-text"><p>{c.floatLeft.label}</p><span>{c.floatLeft.sub}</span></div>
            </div>
            <div className="phone-frame">
              <div className="phone-status">
                <span>9:41</span><div className="phone-notch" /><span>●●●</span>
              </div>
              <div className="chat-screen">
                <div className="chat-header">
                  <img src="/novere_logo.png" alt="" className="avatar-img" />
                  <div className="chat-header-text">
                    <p>{c.phonePal}</p><span>{c.phoneLang}</span>
                  </div>
                  <div className="online-dot" />
                </div>
                <div className="bubble bubble-ai">{c.phoneBubble1}</div>
                <div className="bubble bubble-user">{c.phoneBubble2}</div>
                <div className="bubble bubble-ai">{c.phoneBubble3}</div>
                <div className="bubble bubble-typing"><span /><span /><span /></div>
              </div>
              <div className="phone-points">
                <div className="points-icon">⭐</div>
                <div className="points-text"><p>{c.phonePoints}</p><span>{c.phonePointsSub}</span></div>
                <div className="points-bar-wrap"><div className="points-bar" /></div>
              </div>
            </div>
            <div className="float-card right">
              <div style={{ fontSize:'1.4rem' }}>🔮</div>
              <div className="float-text"><p>{c.floatRight.label}</p><span>{c.floatRight.sub}</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-label">{c.featEyebrow}</div>
        <h2 className="section-title" style={{ maxWidth:680 }}>{c.featTitle}</h2>
        <div className="features-grid">
          {c.feats.map((f, i) => (
            <div key={i} className={`feat-card c${i+1}`}>
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
        <div className="section-label">{c.howEyebrow}</div>
        <h2 className="section-title">{c.howTitle}</h2>
        <p className="section-sub">{c.howSub}</p>
        <div className="steps">
          {c.steps.map((s, i) => (
            <div key={i} className="step">
              <div className="step-num">0{i+1}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <div className="mission-band" id="mission">
        <div className="mission-text" style={{ flex:1 }}>
          <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(11,31,75,0.5)', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ display:'block', width:16, height:2, background:'rgba(11,31,75,0.4)' }} />
            {c.missionEyebrow}
          </div>
          <h2>{c.missionTitle}</h2>
          <p>{c.missionBody}</p>
          <p>{c.missionBody2}</p>
        </div>
        <div className="mission-stats">
          <div className="mission-stat">
            <strong>10%</strong>
            <span>{c.missionStat}</span>
          </div>
          <div style={{ background:'rgba(11,31,75,0.08)', borderRadius:20, padding:'24px 36px', textAlign:'center', border:'2px solid rgba(11,31,75,0.12)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontSize:'2rem' }}>🎒</span>
              <span style={{ fontFamily:"'Fredoka',sans-serif", fontSize:'3rem', fontWeight:700, color:'var(--navy)', lineHeight:1 }}>0</span>
              <span style={{ fontFamily:"'Fredoka',sans-serif", fontSize:'1.4rem', fontWeight:600, color:'rgba(11,31,75,0.4)', alignSelf:'flex-end', paddingBottom:4 }}>/&nbsp;100</span>
            </div>
            <span style={{ fontSize:'0.85rem', color:'rgba(11,31,75,0.6)', fontWeight:600 }}>{c.kidsLabel}</span>
            <div style={{ marginTop:12, height:8, background:'rgba(11,31,75,0.1)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', width:'0%', background:'var(--navy)', borderRadius:99 }} />
            </div>
            <p style={{ fontSize:'0.75rem', color:'rgba(11,31,75,0.5)', marginTop:8 }}>{c.kidsGoal}</p>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <section className="pricing" id="pricing">
        <div className="section-label">{c.pricingEyebrow}</div>
        <h2 className="section-title">{c.pricingTitle}</h2>
        <p className="section-sub">{c.pricingSub}</p>
        <div className="pricing-grid">
          {c.plans.map((plan, i) => (
            <div key={i} className={`plan${plan.featured?' featured':''}`}>
              {plan.featured && <div className="plan-badge">⭐ Le plus populaire</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                {plan.cents ? <>{plan.price}<span style={{ fontSize:'1.2rem', color: plan.featured ? 'rgba(255,255,255,0.5)' : 'var(--muted)' }}>{plan.cents}</span></> : plan.price}
              </div>
              <div className="plan-period">{plan.period}</div>
              <ul className="plan-feats">
                {plan.feats.map((f, j) => <li key={j}><span className="check">✓</span>{f}</li>)}
              </ul>
              <button className="btn-plan" onClick={() => plan.cta.includes('contac') || plan.cta.includes('contact') ? null : router.push('/auth')}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="section-label">{c.testiEyebrow}</div>
        <h2 className="section-title">{c.testiTitle}</h2>
        <div className="testi-grid">
          {c.testis.map((t, i) => (
            <div key={i} className="testi-card">
              <div className="stars">★★★★★</div>
              <p>{t.quote}</p>
              <div className="testi-author">
                <div className="testi-ava" style={{ background:t.bg }}>{t.ava}</div>
                <div><strong>{t.name}</strong><span>{t.role}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="final-cta">
        <h2>{c.finalTitle}</h2>
        <p>{c.finalSub}</p>
        <div className="final-ctas">
          <button className="btn-primary" onClick={() => router.push('/auth')}>{c.finalCta}</button>
          <button className="btn-outline" onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior:'smooth' })}>{c.finalCta2}</button>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <img src="/novere_logo.png" alt="NOVERE" style={{ width:34, height:34, objectFit:'contain' }} />
              <span style={{ fontFamily:"'Fredoka',sans-serif", color:'#fff', fontSize:'1.6rem', fontWeight:700 }}>NOVERE</span>
            </div>
            <p>{c.footerTagline}<br />{c.footerSig}</p>
          </div>
          {c.footerCols.map((col, i) => (
            <div key={i} className="footer-col">
              <h4>{col.title}</h4>
              <ul>{col.links.map((l, j) => <li key={j}><a href="#">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>{c.copyright}</p>
          <div style={{ display:'flex', gap:8 }}>
            <button className={`lang-pill${lang==='fr'?' active':''}`} onClick={() => setLang('fr')}>Français</button>
            <button className={`lang-pill${lang==='kr'?' active':''}`} onClick={() => setLang('kr')}>Kreyòl</button>
          </div>
        </div>
      </footer>
    </>
  )
}

