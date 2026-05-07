'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const COPY = {
  fr: {
    navLinks: ['Ce qu\'on offre', 'Comment ça marche', 'Notre mission', 'Tarifs'],
    navCta: 'Essayer →',
    badge: 'Montréal · Haïti · Grandir ensemble',
    heroTitle: 'Bâtir des ponts\ngrâce à l\'éducation.',
    heroSub: 'NOVERE accompagne les enfants du primaire et du secondaire avec un compagnon d\'apprentissage unique dans un cadre engageant qui récompense chaque effort.',
    ctaPrimary: 'Essayer gratuitement →',
    ctaSecondary: 'Voir comment ça marche',
    featEyebrow: 'Ce qu\'on offre',
    featTitle: 'Un outil de tutorat personnalisé, aligné sur le programme québécois, conçu pour que chaque enfant avance avec confiance.',
    feats: [
      { icon: '🧠', title: 'Un compagnon d\'apprentissage qui lui ressemble', desc: 'Dès le départ, l\'enfant crée son propre compagnon d\'apprentissage qui l\'aide à appliquer des techniques d\'études efficaces qui développe la vraie compréhension.', tag: 'Personnalisé · Méthodes d\'apprentissage' },
      { icon: '🎬', title: 'Des mentors qui ouvrent des horizons', desc: 'Des professionnels partagent leur journée en courtes vidéos animées. Médecin, entrepreneur, ingénieur — l\'enfant voit des carrières réelles et s\'y projette.', tag: 'Inspirant · Authentique' },
      { icon: '🎯', title: 'Des quêtes de vie essentielles', desc: 'NOVERE aborde des thèmes comme les finances personnelles, la santé mentale et la citoyenneté. Des apprentissages que l\'école n\'enseigne pas toujours, mais dont chaque enfant a besoin.', tag: 'Essentiel · Quotidien' },
      { icon: '🛍️', title: 'Des récompenses qui motivent vraiment', desc: 'Les points gagnés pendant les sessions se transforment en rabais sur des jouets et du merch NOVERE. Une récompense grandement méritée!', tag: 'Motivant · Tangible' },
    ],
    howEyebrow: 'Comment ça fonctionne',
    howTitle: 'Une mise en place simple, pour une habitude qui s\'installe naturellement.',
    howSub: 'En quelques minutes, tout est prêt : un compagnon personnalisé et une expérience pensée pour revenir chaque jour.',
    steps: [
      { title: 'Créer le profil', desc: 'Le parent crée le compte, choisit la langue, définit les horaires d\'étude et le niveau scolaire de l\'enfant.' },
      { title: 'Donner vie au compagnon', desc: 'L\'enfant personnalise son compagnon de travail en quelques étapes — nom, apparence, univers. C\'est son repère.' },
      { title: 'Étudier avec son compagnon', desc: 'Des sessions Pomodoro de 25 minutes avec son comagnong qui l\'aide à mieux comprendre et mémoriser les concepts — maths, français, histoire, sciences, alignés sur le programme QEP.' },
      { title: 'Gagner et être récompensé', desc: 'Chaque Pomodoro complété = 50 points. Les points donnent des rabais sur la boutique NOVERE. Les parents voient les progrès en temps réel et sont encouragés à récompenser les efforts.' },
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
    pricingSub: 'Commencez gratuitement. Sans engagement. Annulable à tout moment.',
    pricingNote: 'Pourquoi les sessions sont-elles limitées sur le plan gratuit?',
    pricingNoteBody: 'Le compagnon d\'apprentissage utilise une IA avancée pour répondre à chaque question de votre enfant — chaque réponse a un coût. Le plan gratuit offre 3 sessions de 25 minutes par jour (75 min d\'étude guidée). Les plans payants permettent des sessions illimitées pour que votre enfant ne soit jamais bloqué en plein devoir.',
    plans: [
      {
        name: 'Gratuit',
        price: '0$',
        period: 'Pour toujours',
        description: 'Découvrez NOVERE sans engagement. Idéal pour tester la plateforme avant de s\'abonner.',
        feats: [
          { label: '1 enfant', included: true },
          { label: '3 sessions Pomodoro par jour', included: true },
          { label: 'Accès à Nova (IA Socratique)', included: true },
          { label: 'Quêtes et articles éducatifs', included: true },
          { label: 'Boutique et liste de souhaits', included: true },
          { label: 'Accès aux vidéos Mentors', included: true },
          { label: 'Portail parents de base', included: true },
          { label: 'Sessions illimitées', included: false },
          { label: 'Rapport hebdomadaire par courriel', included: false },
          { label: 'Support prioritaire', included: false },
        ],
        cta: 'Commencer gratuitement',
        ctaNote: 'Aucune carte de crédit requise',
        featured: false,
      },
      {
        name: 'Individuel',
        price: '9,99$',
        period: 'par mois · 1 enfant',
        description: 'Tout inclus pour un enfant. Sessions illimitées et rapport hebdomadaire pour suivre les progrès.',
        feats: [
          { label: '1 enfant', included: true },
          { label: 'Sessions Pomodoro illimitées', included: true },
          { label: 'Accès complet à Nova (IA Socratique)', included: true },
          { label: 'Quêtes et articles éducatifs', included: true },
          { label: 'Boutique et liste de souhaits', included: true },
          { label: 'Accès aux vidéos Mentors', included: true },
          { label: 'Portail parents complet', included: true },
          { label: 'Rapport hebdomadaire par courriel', included: true },
          { label: 'Support prioritaire', included: true },
          { label: 'Jusqu\'à 3 enfants', included: false },
        ],
        cta: 'Choisir Individuel →',
        ctaNote: 'Annulez à tout moment',
        featured: true,
      },
      {
        name: 'Famille',
        price: '19,99$',
        period: 'par mois · jusqu\'à 3 enfants',
        description: 'La meilleure valeur pour les familles. Chaque enfant a son propre compagnon, ses points et sa liste de souhaits.',
        feats: [
          { label: 'Jusqu\'à 3 enfants', included: true },
          { label: 'Sessions Pomodoro illimitées', included: true },
          { label: 'Accès complet à Nova (IA Socratique)', included: true },
          { label: 'Quêtes et articles éducatifs', included: true },
          { label: 'Boutique et liste de souhaits', included: true },
          { label: 'Accès aux vidéos Mentors', included: true },
          { label: 'Portail parents complet', included: true },
          { label: 'Rapport hebdomadaire par courriel', included: true },
          { label: 'Support prioritaire', included: true },
          { label: 'Profil individuel par enfant', included: true },
        ],
        cta: 'Choisir Famille →',
        ctaNote: 'Annulez à tout moment',
        featured: false,
      },
    ],
    finalTitle: 'Apprendre ensemble, avec plus de plaisir et plus de constance.',
    finalSub: 'Rejoignez les premières familles qui utilisent NOVERE à Montréal et contribuez à un impact concret en Haïti.',
    finalCta: 'Essayer gratuitement →',
    finalCta2: 'Voir notre mission',
    footerTagline: 'Building bridges through education.',
    footerSig: 'Montréal · Haïti',
    footerCols: [
      { title: 'Produit', links: ['Compagnon IA', 'Mentors', 'Quêtes de vie', 'Boutique & Récompenses'] },
      { title: 'Compagnie', links: ['Notre mission', 'Impact Haïti', 'Blog', 'Carrières'] },
      { title: 'Support', links: ['FAQ', 'Nous contacter', 'Confidentialité', 'Conditions d\'utilisation'] },
    ],
    copyright: '© 2025 NOVERE — Montréal, Québec.',
    phoneBubble1: 'Si tu coupes une pizza en 4 parts égales et tu en prends 2, c\'est quelle fraction? 🍕',
    phoneBubble2: 'c\'est 2/4? 😅',
    phoneBubble3: 'Exactement! Et tu peux simplifier ça? 🤔',
    phonePal: 'Naruto · Ton compagnon',
    phoneLang: 'Français · Kreyòl',
    phonePoints: '620 / 1000 pts',
    phonePointsSub: 'Prochain cadeau NOVERE',
    floatLeft: { label: '50 points gagnés', sub: 'Session Pomodoro · Maths' },
    floatRight: { label: 'Mentor · Dr. Fabiola', sub: 'Médecine · McGill University' },
  },
 kr: {
  navLinks: ['Sa nou ofri', 'Kijan sa mache', 'Misyon nou', 'Pri'],
  navCta: 'Eseye →',
  badge: 'Montréal · Ayiti · Grandi ansanm',
  heroTitle: 'N\'ap bati pon\ngras ak edikasyon.',
  heroSub: 'NOVERE akonpaye timoun lekòl primè ak segondè ak yon konpayon aprantisaj inik nan yon anviwònman ki rekonpanse chak efò.',
  ctaPrimary: 'Eseye gratis →',
  ctaSecondary: 'Gade kijan sa mache',
  featEyebrow: 'Sa nou ofri',
  featTitle: 'Yon zouti aprantisaj pèsonalize, aliyen ak pwogram kebekwa a, nan lespri pou ede chak timoun avanse ak konfyans.',
  feats: [
    { icon: '🧠', title: 'Yon konpayon aprantisaj ki sanble avè l', desc: 'Depi nan kòmansman, timoun nan kreye pwòp konpayon aprantisaj li ki ede ap li aplike teknik etid efikas ki ede l devlope konpreyansyon li.', tag: 'Pèsonalize · Metòd aprantisaj' },
    { icon: '🎬', title: 'Mentò ki louvri orizon', desc: 'Pwofesyonèl yo pataje jounen yo nan ti videyo anime. Doktè, antreprenè, enjenyè — timoun nan wè karyè reyèl epi imajine lavni li.', tag: 'Enspiran · Otantik' },
    { icon: '🎯', title: 'Kesyon lavi ki esansyèl', desc: 'NOVERE abòde sijè tankou finans pèsonèl, sante mantal ak sitwayènte. Aprantisaj ke lekòl pa toujou ansèye, men tout timoun bezwen.', tag: 'Esansyèl · Chak jou' },
    { icon: '🛍️', title: 'Rekonpans ki vrèman motive', desc: 'Pwen yo ranmase pandan sesyon yo vin tounen rabè sou jwèt ak atik NOVERE. Yon rekonpans ki vrèman merite!', tag: 'Motivasyon · Konkrè' },
  ],
  howEyebrow: 'Kijan sa mache',
  howTitle: 'Yon kòmansman senp, pou yon abitid ki vin enstale natirèlman.',
  howSub: 'Nan kèk minit sèlman, tout bagay pare: yon konpayon pèsonalize ak yon eksperyans ki fèt pou ankouraje timoun nan retounen chak jou.',
  steps: [
    { title: 'Kreye pwofil la', desc: 'Paran an kreye kont lan, chwazi lang lan, fikse orè etid yo ak nivo lekòl timoun nan.' },
    { title: 'Bay konpayon an lavi', desc: 'Timoun nan pèsonalize konpayon travay li an kèk etap — non, aparans, inivè. Se repè pa li.' },
    { title: 'Etidye ak konpayon li', desc: 'Sesyon Pomodoro 25 minit ak konpayon li ki ede l\' pi byen konprann epi memorize konsèp yo — matematik, Franse, istwa, syans, aliyen ak pwogram QEP.' },
    { title: 'Ranmase rekonpans', desc: 'Chak Pomodoro li konplete = 50 pwen. Pwen yo bay rabè sou boutik NOVERE. Paran yo wè pwogrè yo an tan reyèl sa ki ankouraje yo rekonpanse efò yo.' },
  ],
  missionEyebrow: 'Misyon nou',
  missionTitle: 'Fè aprantisaj vin yon lyen, isit ak pi lwen.',
  missionBody: 'NOVERE fèt ant Montréal ak Ayiti. Misyon li se ofri timoun isit yo yon eksperyans tutorat ki pi enteresan, pandan li kreye tou yon enpak konkrè pou lòt timoun lòt kote.',
  missionBody2: 'Se poutèt sa 10% nan chak abònman ale bay òganizasyon verifye ki sipòte lekòl timoun ann Ayiti.',
  missionStat: '10% nan chak abònman ale ann Ayiti.',
  kidsGoal: 'Objektif : Sipòte 100 timoun avan fen 2026',
  kidsLabel: 'timoun parene',
  pricingEyebrow: 'Pri',
  pricingTitle: 'Opsyon senp pou kòmanse.',
  pricingSub: 'Kòmanse gratis. San angajman. Ou ka anile nenpòt ki lè.',
  pricingNote: 'Poukisa sesyon yo limite sou plan gratis la?',
  pricingNoteBody: 'Konpayon aprantisaj la itilize yon IA avanse pou reponn chak kesyon timoun nan — chak repons gen yon pri. Plan gratis la ofri 3 sesyon 25 minit pa jou (75 minit etid gide). Plan peye yo pèmèt sesyon san limit pou timoun nan pa janm bloke nan mitan devwa.',
  plans: [
    {
      name: 'Gratis',
      price: '0$',
      period: 'Pou toujou',
      description: 'Dekouvri NOVERE san angajman. Idyal pou eseye platfòm nan anvan ou abòne.',
      feats: [
        { label: '1 timoun', included: true },
        { label: '3 sesyon Pomodoro pa jou', included: true },
        { label: 'Aksè a konpayon aprantisaj la', included: true },
        { label: 'Kestyon ak atik edikasyon', included: true },
        { label: 'Boutik ak lis dezire', included: true },
        { label: 'Aksè a videyo Mentor', included: true },
        { label: 'Pòtay paran debaz', included: true },
        { label: 'Sesyon san limit', included: false },
        { label: 'Rapò chak semèn pa imèl', included: false },
        { label: 'Sipò priyoritè', included: false },
      ],
      cta: 'Kòmanse gratis',
      ctaNote: 'Pa bezwen kat kredi',
      featured: false,
    },
    {
      name: 'Endividyèl',
      price: '9,99$',
      period: 'pa mwa · 1 timoun',
      description: 'Tout enkli pou yon timoun. Sesyon san limit ak rapò chak semèn pou suiv pwogrè yo.',
      feats: [
        { label: '1 timoun', included: true },
        { label: 'Sesyon Pomodoro san limit', included: true },
        { label: 'Aksè konplè a konpayon aprantisaj la', included: true },
        { label: 'Kestyon ak atik edikasyon', included: true },
        { label: 'Boutik ak lis dezire', included: true },
        { label: 'Aksè a videyo Mentor', included: true },
        { label: 'Pòtay paran konplè', included: true },
        { label: 'Rapò chak semèn pa imèl', included: true },
        { label: 'Sipò priyoritè', included: true },
        { label: 'Jiska 3 timoun', included: false },
      ],
      cta: 'Chwazi Endividyèl →',
      ctaNote: 'Anile nenpòt ki lè',
      featured: true,
    },
    {
      name: 'Fanmi',
      price: '19,99$',
      period: 'pa mwa · jiska 3 timoun',
      description: 'Pi bon valè pou fanmi yo. Chak timoun gen pwòp konpayon li, pwen li ak lis dezire pa li.',
      feats: [
        { label: 'Jiska 3 timoun', included: true },
        { label: 'Sesyon Pomodoro san limit', included: true },
        { label: 'Aksè konplè a konpayon aprantisaj la', included: true },
        { label: 'Kestyon ak atik edikasyon', included: true },
        { label: 'Boutik ak lis dezire', included: true },
        { label: 'Aksè a videyo Mentor', included: true },
        { label: 'Pòtay paran konplè', included: true },
        { label: 'Rapò chak semèn pa imèl', included: true },
        { label: 'Sipò priyoritè', included: true },
        { label: 'Pwofil endividyèl pa timoun', included: true },
      ],
      cta: 'Chwazi Fanmi →',
      ctaNote: 'Anile nenpòt ki lè',
      featured: false,
    },
  ],
  finalTitle: 'Aprann ansanm, ak plis plezi ak plis regilarite.',
  finalSub: 'Rantre nan premye fanmi ki itilize NOVERE Montréal epi kontribye nan yon enpak konkrè ann Ayiti.',
  finalCta: 'Eseye gratis →',
  finalCta2: 'Gade misyon nou',
  footerTagline: 'Bati pon gras ak edikasyon.',
  footerSig: 'Montréal · Ayiti',
  footerCols: [
    { title: 'Pwodwi', links: ['Konpayon aprantisaj', 'Mentor', 'Kestyon lavi', 'Boutik & Rekonpans'] },
    { title: 'Konpayi', links: ['Misyon nou', 'Enpak Ayiti', 'Blog', 'Karyè'] },
    { title: 'Sipò', links: ['FAQ', 'Kontakte nou', 'Konfidansyalite', 'Kondisyon itilizasyon'] },
  ],
  copyright: '© 2025 NOVERE — Montréal, Québec.',
  phoneBubble1: 'Si ou koupe yon pizza an 4 pati egal epi ou pran 2, ki fraksyon sa a? 🍕',
  phoneBubble2: 'se 2/4? 😅',
  phoneBubble3: 'Egzakteman! Epi ou ka senplifye sa? 🤔',
  phonePal: 'Naruto · Konpayon ou',
  phoneLang: 'Franse · Kreyòl',
  phonePoints: '620 / 1000 pwen',
  phonePointsSub: 'Pwochen kado NOVERE',
  floatLeft: { label: '50 pwen ranmase', sub: 'Sesyon Pomodoro · Math' },
  floatRight: { label: 'Mentor · Dr. Fabiola', sub: 'Medsin · McGill' },
},
}
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
    <div style={{ minHeight:'100vh', background:'#0B1F4B', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <img src="/novere_logo.png" style={{ width:64, height:64, objectFit:'contain', animation:'pulse 1.5s ease-in-out infinite' }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  )

  return <LandingPage />
}

function LandingPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'fr'|'kr'>('fr')
  const c = COPY[lang]

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--navy:#0B1F4B;--blue:#3B52D4;--sky:#DBEAFE;--yellow:#FBBF24;--white:#FFFFFF;--off:#F8FAFF;--text:#1E293B;--muted:#64748B;--green:#16A34A;--green-bg:#DCFCE7;--red:#EF4444;--red-bg:#FEE2E2}
        html{scroll-behavior:smooth;font-family:'Plus Jakarta Sans',sans-serif}
        body{background:var(--off);color:var(--text);overflow-x:hidden}

        nav{position:sticky;top:0;z-index:100;background:rgba(11,31,75,0.97);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:space-between;padding:0 4%;height:64px;border-bottom:2px solid rgba(251,191,36,0.25);gap:8px}
        .logo{font-family:'Fredoka',sans-serif;font-size:1.6rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0}
        .logo img{width:32px;height:32px;object-fit:contain}
        .nav-links{display:flex;gap:24px;list-style:none;flex:1;justify-content:center}
        .nav-links a{color:rgba(255,255,255,0.75);text-decoration:none;font-size:0.85rem;font-weight:500;transition:color .2s;white-space:nowrap}
        .nav-links a:hover{color:var(--yellow)}
        .nav-right{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .lang-pill{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);border:1px solid rgba(255,255,255,0.2);border-radius:99px;padding:4px 10px;font-size:0.72rem;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif;white-space:nowrap}
        .lang-pill:hover,.lang-pill.active{background:rgba(251,191,36,0.2);color:var(--yellow);border-color:rgba(251,191,36,0.5)}
        .btn-nav{background:var(--yellow);color:var(--navy);border:none;border-radius:99px;padding:7px 14px;font-weight:700;font-size:0.82rem;cursor:pointer;transition:transform .15s,box-shadow .15s;font-family:'Plus Jakarta Sans',sans-serif;white-space:nowrap;flex-shrink:0}
        .btn-nav:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(251,191,36,0.45)}

        .hero{background:linear-gradient(135deg,var(--navy) 0%,#0D2860 60%,#1a1060 100%);min-height:92vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:80px 5% 60px;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 70% 50%,rgba(59,82,212,0.25) 0%,transparent 70%);pointer-events:none}
        .hero-dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px);background-size:32px 32px}
        .hero-text{position:relative;z-index:2}
        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.4);border-radius:99px;padding:6px 16px;color:var(--yellow);font-size:0.8rem;font-weight:600;margin-bottom:28px;animation:fadeUp .6s ease both}
        .hero-badge::before{content:'✦';font-size:0.7rem}
        .hero h1{font-family:'Fredoka',sans-serif;font-size:clamp(2.8rem,5vw,4.2rem);font-weight:700;line-height:1.1;color:#fff;margin-bottom:24px;animation:fadeUp .6s .1s ease both;white-space:pre-line}
        .hero p{font-size:1.05rem;line-height:1.75;color:rgba(255,255,255,0.7);max-width:480px;margin-bottom:36px;animation:fadeUp .6s .2s ease both}
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
        .phone-frame{width:270px;background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:32px;overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.5)}
        .phone-status{background:rgba(0,0,0,0.3);padding:10px 18px 6px;display:flex;justify-content:space-between;align-items:center}
        .phone-status span{color:rgba(255,255,255,0.5);font-size:0.68rem;font-weight:600}
        .phone-notch{width:70px;height:18px;background:rgba(0,0,0,0.5);border-radius:0 0 14px 14px;margin:0 auto}
        .chat-screen{padding:12px;display:flex;flex-direction:column;gap:8px;align-items:stretch}
        .chat-header{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.07);border-radius:12px;padding:8px 12px;margin-bottom:2px}
        .avatar-img{width:30px;height:30px;border-radius:50%;object-fit:contain;flex-shrink:0}
        .chat-header-text{flex:1;min-width:0}
        .chat-header-text p{color:#fff;font-size:0.75rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .chat-header-text span{color:rgba(255,255,255,0.4);font-size:0.6rem}
        .online-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0}
        .bubble{padding:8px 12px;border-radius:14px;font-size:0.7rem;line-height:1.45;word-wrap:break-word;word-break:break-word;max-width:82%}
        .bubble-ai{background:rgba(59,82,212,0.35);border:1px solid rgba(59,82,212,0.3);color:rgba(255,255,255,0.9);border-bottom-left-radius:3px;align-self:flex-start;margin-right:auto}
        .bubble-user{background:var(--yellow);color:var(--navy);font-weight:600;border-bottom-right-radius:3px;align-self:flex-end;margin-left:auto}
        .bubble-typing{display:flex;gap:4px;align-items:center;padding:10px 14px;align-self:flex-start;background:rgba(59,82,212,0.35);border:1px solid rgba(59,82,212,0.3);border-radius:14px;border-bottom-left-radius:3px}
        .bubble-typing span{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.4);animation:typing 1.2s infinite}
        .bubble-typing span:nth-child(2){animation-delay:.2s}
        .bubble-typing span:nth-child(3){animation-delay:.4s}
        .phone-points{margin:6px 12px 12px;background:linear-gradient(135deg,rgba(251,191,36,0.2),rgba(251,191,36,0.05));border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:8px}
        .points-icon{font-size:1.2rem;flex-shrink:0}
        .points-text{flex:1;min-width:0}
        .points-text p{color:var(--yellow);font-size:0.7rem;font-weight:700}
        .points-text span{color:rgba(255,255,255,0.5);font-size:0.6rem}
        .points-bar-wrap{flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden}
        .points-bar{height:100%;width:62%;background:var(--yellow);border-radius:99px}
        .float-card{position:absolute;background:rgba(255,255,255,0.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:10px 14px;display:flex;align-items:center;gap:10px;animation:float 5s ease-in-out infinite}
        .float-card.left{left:-60px;top:30%}
        .float-card.right{right:-50px;bottom:25%;animation-delay:2.5s}
        .float-text p{color:#fff;font-size:0.7rem;font-weight:600;white-space:nowrap}
        .float-text span{color:rgba(255,255,255,0.45);font-size:0.6rem}

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

        /* ── NEW PRICING ── */
        .pricing{background:#fff}
        .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:56px;align-items:start}
        .plan-card{border:2px solid #E2E8F0;border-radius:24px;padding:32px 28px;position:relative;transition:transform .2s,box-shadow .2s;background:#fff}
        .plan-card:hover{transform:translateY(-4px);box-shadow:0 20px 50px rgba(11,31,75,0.1)}
        .plan-card.featured{background:var(--navy);border-color:var(--navy)}
        .plan-popular{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--yellow);color:var(--navy);font-size:0.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:5px 18px;border-radius:99px;white-space:nowrap}
        .plan-name{font-family:'Fredoka',sans-serif;font-size:1.3rem;font-weight:700;color:var(--navy);margin-bottom:4px}
        .plan-card.featured .plan-name{color:#fff}
        .plan-price{font-family:'Fredoka',sans-serif;font-size:2.4rem;font-weight:700;color:var(--navy);line-height:1;margin-bottom:4px}
        .plan-card.featured .plan-price{color:var(--yellow)}
        .plan-period{font-size:0.82rem;color:var(--muted);margin-bottom:12px}
        .plan-card.featured .plan-period{color:rgba(255,255,255,0.45)}
        .plan-desc{font-size:0.88rem;color:var(--muted);line-height:1.6;margin-bottom:20px;min-height:52px}
        .plan-card.featured .plan-desc{color:rgba(255,255,255,0.6)}
        .plan-divider{height:1px;background:#E2E8F0;margin-bottom:18px}
        .plan-card.featured .plan-divider{background:rgba(255,255,255,0.1)}
        .plan-feats{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
        .plan-feat-item{display:flex;align-items:center;gap:10px;font-size:0.87rem}
        .plan-feat-item.included{color:var(--text)}
        .plan-feat-item.excluded{color:var(--muted);text-decoration:line-through}
        .plan-card.featured .plan-feat-item.included{color:rgba(255,255,255,0.88)}
        .plan-card.featured .plan-feat-item.excluded{color:rgba(255,255,255,0.28)}
        .feat-icon-check{width:20px;height:20px;border-radius:50%;background:var(--green-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.7rem;font-weight:800;color:var(--green)}
        .feat-icon-dash{width:20px;height:20px;border-radius:50%;background:var(--red-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.85rem;font-weight:800;color:var(--red);line-height:1}
        .plan-cta{width:100%;padding:13px;border-radius:12px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:0.95rem;cursor:pointer;transition:all .2s;margin-bottom:8px;border:2px solid #E2E8F0;background:var(--off);color:var(--navy)}
        .plan-card.featured .plan-cta{background:var(--yellow);color:var(--navy);border:none}
        .plan-card.featured .plan-cta:hover{box-shadow:0 8px 24px rgba(251,191,36,0.4)}
        .plan-cta-note{font-size:0.78rem;color:var(--muted);text-align:center}
        .plan-card.featured .plan-cta-note{color:rgba(255,255,255,0.35)}
        .pricing-note{margin-top:32px;background:var(--off);border:1.5px solid #E2E8F0;border-radius:16px;padding:20px 24px;display:flex;gap:14px;align-items:flex-start}
        .pricing-note-icon{font-size:1.4rem;flex-shrink:0;margin-top:2px}
        .pricing-note-text p{color:var(--navy);font-weight:700;font-size:0.9rem;margin-bottom:6px}
        .pricing-note-text span{color:var(--muted);font-size:0.85rem;line-height:1.65}

        .final-cta{background:linear-gradient(135deg,var(--navy),#13306B);padding:96px 5%;text-align:center}
        .final-cta h2{font-family:'Fredoka',sans-serif;font-size:clamp(2rem,4vw,3rem);font-weight:700;color:#fff;margin-bottom:16px;line-height:1.2}
        .final-cta p{font-size:1.05rem;color:rgba(255,255,255,0.6);line-height:1.7;max-width:520px;margin:0 auto 40px}
        .final-ctas{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}

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

        @media(max-width:1000px){.pricing-grid{grid-template-columns:1fr}}
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
          .logo{font-size:1.3rem}
          .btn-nav{padding:6px 12px;font-size:0.78rem}
          .lang-pill{padding:3px 8px;font-size:0.7rem}
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
        <div className="nav-right">
          <button className={`lang-pill${lang==='fr'?' active':''}`} onClick={() => setLang('fr')}>FR</button>
          <button className={`lang-pill${lang==='kr'?' active':''}`} onClick={() => setLang('kr')}>KR</button>
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
          </div>
        </div>

        <div className="hero-visual">
          <div style={{ position:'relative' }}>
            <div className="float-card left">
              <div style={{ fontSize:'1.3rem' }}>⭐</div>
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
                    <p>{c.phonePal}</p>
                    <span>{c.phoneLang}</span>
                  </div>
                  <div className="online-dot" />
                </div>
                <div className="bubble bubble-ai">{c.phoneBubble1}</div>
                <div className="bubble bubble-user">{c.phoneBubble2}</div>
                <div className="bubble bubble-ai">{c.phoneBubble3}</div>
                <div className="bubble-typing"><span /><span /><span /></div>
              </div>
              <div className="phone-points">
                <div className="points-icon">⭐</div>
                <div className="points-text">
                  <p>{c.phonePoints}</p>
                  <span>{c.phonePointsSub}</span>
                </div>
                <div className="points-bar-wrap"><div className="points-bar" /></div>
              </div>
            </div>
            <div className="float-card right">
              <div style={{ fontSize:'1.3rem' }}>🎬</div>
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
            <div key={i} className={`plan-card${plan.featured?' featured':''}`}>
              {plan.featured && <div className="plan-popular">⭐ Le plus populaire</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">{plan.price}</div>
              <div className="plan-period">{plan.period}</div>
              <div className="plan-desc">{plan.description}</div>
              <div className="plan-divider" />
              <ul className="plan-feats">
                {plan.feats.map((f, j) => (
                  <li key={j} className={`plan-feat-item ${f.included?'included':'excluded'}`}>
                    {f.included
                      ? <div className="feat-icon-check">✓</div>
                      : <div className="feat-icon-dash">–</div>}
                    {f.label}
                  </li>
                ))}
              </ul>
              <button
                className="plan-cta"
                onClick={() => router.push(plan.featured || plan.name === 'Famille' || plan.name === 'Fanmi' ? '/pricing' : '/auth')}
              >
                {plan.cta}
              </button>
              <p className="plan-cta-note">{plan.ctaNote}</p>
            </div>
          ))}
        </div>

        {/* Why sessions are limited */}
        <div className="pricing-note">
          <div className="pricing-note-icon">💡</div>
          <div className="pricing-note-text">
            <p>{c.pricingNote}</p>
            <span>{c.pricingNoteBody}</span>
          </div>
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
