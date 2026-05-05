// lib/curriculum.ts
// QEP curriculum for Primary (Grades 3-6) and Secondary (Grades 7-11)
// Subjects: Math, French, History & Citizenship, Science & Technology / Physics & Chemistry

export type Subject = 'mathematiques' | 'francais' | 'histoire' | 'sciences'

export type GradeLevel = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type CurriculumTopic = {
  topic: string
  subtopics: string[]
  level: 'primaire' | 'secondaire'
  programLabel: string // official QEP label
}

const CURRICULUM: Record<Subject, Record<GradeLevel, CurriculumTopic>> = {

  // ─────────────────────────────────────────────────────────────────
  // MATHÉMATIQUES
  // ─────────────────────────────────────────────────────────────────
  mathematiques: {
    3: {
      topic: 'Nombres et opérations — Cycle 2 (1re année)',
      programLabel: 'Mathématiques — Cycle 2, 1re année',
      level: 'primaire',
      subtopics: [
        'Nombres naturels jusqu\'à 1 000',
        'Addition et soustraction avec retenue',
        'Tables de multiplication (2, 3, 5, 10)',
        'Introduction aux fractions simples (1/2, 1/4, 1/3)',
        'Mesure de longueurs (cm, m)',
        'Figures planes (carré, rectangle, triangle, cercle)',
        'Lecture de données simples (tableaux et diagrammes)',
      ],
    },
    4: {
      topic: 'Nombres décimaux et fractions — Cycle 2 (2e année)',
      programLabel: 'Mathématiques — Cycle 2, 2e année',
      level: 'primaire',
      subtopics: [
        'Nombres naturels jusqu\'à 10 000',
        'Multiplication à 2 chiffres',
        'Division avec reste',
        'Fractions équivalentes',
        'Nombres décimaux (dixièmes et centièmes)',
        'Périmètre et aire de figures simples',
        'Angles droits, aigus, obtus',
        'Probabilités simples (certain, possible, impossible)',
      ],
    },
    5: {
      topic: 'Proportions et géométrie — Cycle 3 (1re année)',
      programLabel: 'Mathématiques — Cycle 3, 1re année',
      level: 'primaire',
      subtopics: [
        'Nombres naturels jusqu\'à 1 000 000',
        'Pourcentages et fractions dans des situations concrètes',
        'Multiplication et division de décimaux',
        'Introduction aux nombres négatifs',
        'Volume et capacité',
        'Axes de symétrie',
        'Diagrammes circulaires et histogrammes',
        'Probabilités (expériences aléatoires simples)',
      ],
    },
    6: {
      topic: 'Algèbre introductive et statistiques — Cycle 3 (2e année)',
      programLabel: 'Mathématiques — Cycle 3, 2e année',
      level: 'primaire',
      subtopics: [
        'Expressions algébriques simples (trouver l\'inconnue)',
        'Rapport et proportion',
        'Pourcentages appliqués (rabais, taxes)',
        'Transformations géométriques (translation, réflexion, rotation)',
        'Coordonnées dans un plan cartésien',
        'Moyenne arithmétique',
        'Lecture et construction de graphiques',
      ],
    },
    7: {
      topic: 'Algèbre et arithmétique — Secondaire 1',
      programLabel: 'Mathématiques — Secondaire 1',
      level: 'secondaire',
      subtopics: [
        'Entiers relatifs (addition, soustraction, multiplication, division)',
        'Fractions et nombres rationnels',
        'Expressions algébriques — simplification et substitution',
        'Équations du 1er degré à une inconnue',
        'Plan cartésien — points, distances',
        'Propriétés des triangles et quadrilatères',
        'Théorème de Pythagore (introduction)',
        'Statistiques — médiane, mode, étendue',
      ],
    },
    8: {
      topic: 'Fonctions linéaires et géométrie — Secondaire 2',
      programLabel: 'Mathématiques — Secondaire 2',
      level: 'secondaire',
      subtopics: [
        'Fonctions et relations (notation, tableaux de valeurs)',
        'Fonction linéaire y = ax + b',
        'Taux de variation et ordonnée à l\'origine',
        'Systèmes d\'équations (résolution graphique)',
        'Théorème de Pythagore (applications)',
        'Isométries et similitudes',
        'Probabilités — probabilité conditionnelle simple',
        'Dénombrement (permutations simples)',
      ],
    },
    9: {
      topic: 'Fonctions et trigonométrie — Secondaire 3',
      programLabel: 'Mathématiques — Secondaire 3',
      level: 'secondaire',
      subtopics: [
        'Fonctions polynomiales du 2e degré',
        'Factorisation (mise en évidence, produit notable)',
        'Systèmes d\'équations (algébrique)',
        'Inéquations du 1er degré',
        'Trigonométrie dans le triangle rectangle (sin, cos, tan)',
        'Loi des sinus et des cosinus (introduction)',
        'Cercle — équation, corde, sécante',
        'Statistiques — régression linéaire',
      ],
    },
    10: {
      topic: 'Fonctions avancées — Secondaire 4',
      programLabel: 'Mathématiques — Secondaire 4 (CST / SN)',
      level: 'secondaire',
      subtopics: [
        'Fonction quadratique — forme canonique et sommets',
        'Fonctions exponentielles et logarithmiques',
        'Résolution d\'équations du 2e degré (quadratique)',
        'Vecteurs dans le plan',
        'Trigonométrie — angles quelconques, cercle trigonométrique',
        'Arithmétique financière (intérêts composés)',
        'Statistiques inférentielles (intervalles de confiance)',
        'Géométrie analytique — droites et cercles',
      ],
    },
    11: {
      topic: 'Mathématiques avancées — Secondaire 5',
      programLabel: 'Mathématiques — Secondaire 5 (SN / TS)',
      level: 'secondaire',
      subtopics: [
        'Fonctions: rationnelle, racine carrée, valeur absolue',
        'Logarithmes — propriétés et équations logarithmiques',
        'Suites et séries arithmétiques et géométriques',
        'Préparation au calcul différentiel (limites, taux de variation)',
        'Matrices et systèmes d\'équations',
        'Distributions statistiques (normale, binomiale)',
        'Probabilités conditionnelles avancées',
        'Géométrie des coniques (parabole, ellipse, hyperbole)',
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // FRANÇAIS
  // ─────────────────────────────────────────────────────────────────
  francais: {
    3: {
      topic: 'Lecture et grammaire de base — Cycle 2 (1re année)',
      programLabel: 'Français langue d\'enseignement — Cycle 2, 1re année',
      level: 'primaire',
      subtopics: [
        'Compréhension de textes narratifs simples',
        'Identification des personnages, lieux, événements',
        'Verbes — présent, passé composé, futur simple',
        'Accord du verbe avec le sujet',
        'Phrases déclaratives, interrogatives, exclamatives',
        'Ponctuation de base (point, virgule, point d\'exclamation)',
        'Stratégies de lecture (inférence simple, prédiction)',
        'Rédaction de phrases et de courts textes',
      ],
    },
    4: {
      topic: 'Rédaction et analyse — Cycle 2 (2e année)',
      programLabel: 'Français langue d\'enseignement — Cycle 2, 2e année',
      level: 'primaire',
      subtopics: [
        'Textes descriptifs et narratifs',
        'Structure d\'un paragraphe (idée principale + développement)',
        'Accord de l\'adjectif avec le nom',
        'Pronoms personnels (substitution)',
        'Imparfait et plus-que-parfait',
        'Vocabulaire en contexte (synonymes, antonymes)',
        'Organisateurs textuels (d\'abord, ensuite, enfin)',
        'Révision et correction d\'un texte',
      ],
    },
    5: {
      topic: 'Textes variés et grammaire avancée — Cycle 3 (1re année)',
      programLabel: 'Français langue d\'enseignement — Cycle 3, 1re année',
      level: 'primaire',
      subtopics: [
        'Textes informatifs, explicatifs et poétiques',
        'Intention de l\'auteur et point de vue',
        'Subjonctif présent (introduction)',
        'Phrases complexes (subordonnées)',
        'Accord du participe passé (avoir/être)',
        'Figures de style (comparaison, métaphore)',
        'Structure d\'une lettre formelle',
        'Prise de notes et résumé',
      ],
    },
    6: {
      topic: 'Analyse littéraire et argumentation — Cycle 3 (2e année)',
      programLabel: 'Français langue d\'enseignement — Cycle 3, 2e année',
      level: 'primaire',
      subtopics: [
        'Analyse d\'un texte narratif (schéma actanciel simple)',
        'Textes argumentatifs — thèse et arguments',
        'Conditionnel et subjonctif',
        'Discours direct et indirect',
        'Cohérence textuelle (reprise de l\'information)',
        'Registres de langue (familier, courant, soutenu)',
        'Production d\'un texte d\'opinion',
        'Préparation à l\'oral (exposé structuré)',
      ],
    },
    7: {
      topic: 'Lecture littéraire et écriture — Secondaire 1',
      programLabel: 'Français langue d\'enseignement — Secondaire 1',
      level: 'secondaire',
      subtopics: [
        'Romans et nouvelles québécois (caractéristiques)',
        'Schéma narratif complet',
        'Analyse des personnages (psychologie, évolution)',
        'Texte descriptif — cohérence et progression',
        'Syntaxe — phrases transformées (passive, impersonnelle)',
        'Homophones grammaticaux (a/à, ou/où, et/est)',
        'Introduction à la dissertation (thèse + arguments + exemples)',
        'Compréhension de textes courants (journaux, articles)',
      ],
    },
    8: {
      topic: 'Argumentation et style — Secondaire 2',
      programLabel: 'Français langue d\'enseignement — Secondaire 2',
      level: 'secondaire',
      subtopics: [
        'Texte argumentatif structuré',
        'Contre-argument et réfutation',
        'Analyse du point de vue et de la modalisation',
        'Figures de style avancées (ironie, hyperbole, antithèse)',
        'Système des temps verbaux dans le récit',
        'Subordonnées relatives, conjonctives, circonstancielles',
        'Littérature québécoise — œuvres au programme',
        'Communication orale — débat et argumentation',
      ],
    },
    9: {
      topic: 'Analyse littéraire approfondie — Secondaire 3',
      programLabel: 'Français langue d\'enseignement — Secondaire 3',
      level: 'secondaire',
      subtopics: [
        'Analyse formelle d\'un texte littéraire (fond et forme)',
        'Registres littéraires (tragique, comique, lyrique)',
        'Rédaction d\'un paragraphe de développement (PEE)',
        'Intertextualité et contexte historique d\'une œuvre',
        'Rhétorique — ethos, pathos, logos',
        'Révision stylistique d\'un texte',
        'Compréhension de textes complexes (essais, discours)',
        'Oral — présentation formelle et écoute active',
      ],
    },
    10: {
      topic: 'Dissertation et canon québécois — Secondaire 4',
      programLabel: 'Français langue d\'enseignement — Secondaire 4',
      level: 'secondaire',
      subtopics: [
        'Dissertation explicative — structure et rédaction',
        'Œuvres du canon littéraire québécois',
        'Analyse comparée de deux textes',
        'Syntaxe avancée — ellipse, anaphore, prolepse',
        'Vocabulaire littéraire (diégèse, focalisation, narrateur)',
        'Cohérence et cohésion d\'un texte long',
        'Révision complète — grille d\'autocorrection',
        'Préparation à l\'épreuve ministérielle',
      ],
    },
    11: {
      topic: 'Épreuve uniforme et synthèse — Secondaire 5',
      programLabel: 'Français langue d\'enseignement — Secondaire 5',
      level: 'secondaire',
      subtopics: [
        'Épreuve uniforme de français — format et critères',
        'Dissertation critique — prise de position argumentée',
        'Analyse d\'extraits et textes complets',
        'Gestion du temps en situation d\'examen',
        'Correction finale — grammaire, syntaxe, ponctuation',
        'Littérature mondiale en traduction (œuvres comparées)',
        'Oral — communication en situation professionnelle',
        'Révision complète du programme Secondaire 1-5',
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // HISTOIRE ET ÉDUCATION À LA CITOYENNETÉ
  // ─────────────────────────────────────────────────────────────────
  histoire: {
    3: {
      topic: 'La société au fil du temps — Cycle 2 (1re année)',
      programLabel: 'Univers social — Cycle 2, 1re année',
      level: 'primaire',
      subtopics: [
        'La société iroquoienne vers 1500',
        'L\'organisation sociale (chefs, familles, clans)',
        'Le rôle des femmes et des hommes',
        'Les besoins et les ressources de la société',
        'Comparaison avec notre société aujourd\'hui',
        'L\'utilisation du territoire',
        'Lecture de cartes simples',
        'Chronologie et frise du temps',
      ],
    },
    4: {
      topic: 'La société en Nouvelle-France — Cycle 2 (2e année)',
      programLabel: 'Univers social — Cycle 2, 2e année',
      level: 'primaire',
      subtopics: [
        'La société en Nouvelle-France vers 1645',
        'Les relations entre Français et Autochtones',
        'Le régime seigneurial et la vie paysanne',
        'Le commerce des fourrures',
        'La religion catholique et les missionnaires',
        'La société canadienne vers 1745',
        'Évolution de la population en Nouvelle-France',
        'Comparaison Nouvelle-France / société iroquoienne',
      ],
    },
    5: {
      topic: 'La société sous le régime britannique — Cycle 3 (1re année)',
      programLabel: 'Univers social — Cycle 3, 1re année',
      level: 'primaire',
      subtopics: [
        'La Conquête de 1760 et ses conséquences',
        'La société canadienne sous le régime britannique vers 1820',
        'L\'Acte de Québec (1774) et l\'Acte constitutionnel (1791)',
        'Les deux Canadas — Haut-Canada et Bas-Canada',
        'Les Rébellions de 1837-1838',
        'L\'immigration britannique',
        'La vie urbaine vs rurale au XIXe siècle',
        'Lecture de sources historiques primaires simples',
      ],
    },
    6: {
      topic: 'La formation du Canada — Cycle 3 (2e année)',
      programLabel: 'Univers social — Cycle 3, 2e année',
      level: 'primaire',
      subtopics: [
        'L\'Acte d\'Union de 1840',
        'La Confédération de 1867',
        'Les Pères de la Confédération',
        'La société québécoise vers 1905',
        'L\'industrialisation et l\'urbanisation',
        'Le rôle de l\'Église catholique au XIXe siècle',
        'Les droits des femmes et des minorités',
        'La citoyenneté — droits et responsabilités',
      ],
    },
    7: {
      topic: 'Origines de la société québécoise — Secondaire 1',
      programLabel: 'Histoire et éducation à la citoyenneté — Secondaire 1',
      level: 'secondaire',
      subtopics: [
        'Les premiers occupants — nations autochtones du Québec',
        'L\'exploration et la colonisation française',
        'La Nouvelle-France — économie, société, religion',
        'La Conquête britannique (1760)',
        'Les changements politiques sous le régime britannique',
        'Les Rébellions de 1837-1838 — causes et conséquences',
        'L\'Acte d\'Union et la démocratie représentative',
        'Concepts : société, territoire, pouvoir, citoyenneté',
      ],
    },
    8: {
      topic: 'Le Québec dans le Canada — Secondaire 2',
      programLabel: 'Histoire et éducation à la citoyenneté — Secondaire 2',
      level: 'secondaire',
      subtopics: [
        'La Confédération de 1867 — enjeux et débats',
        'L\'industrialisation du Québec (1850-1929)',
        'Les deux Guerres mondiales — impact au Québec',
        'La crise économique des années 1930',
        'L\'après-guerre et le gouvernement Duplessis',
        'La Révolution tranquille (1960-1966)',
        'La question nationale québécoise',
        'Concepts : nation, identité, démocratie, économie',
      ],
    },
    9: {
      topic: 'Le Québec contemporain — Secondaire 3',
      programLabel: 'Histoire et éducation à la citoyenneté — Secondaire 3',
      level: 'secondaire',
      subtopics: [
        'Le Québec de 1967 à aujourd\'hui',
        'Les référendums de 1980 et 1995',
        'La Charte des droits et libertés',
        'Les mouvements sociaux (féminisme, droits civiques)',
        'L\'immigration et la diversité culturelle au Québec',
        'Les institutions démocratiques québécoises et canadiennes',
        'Les enjeux environnementaux et développement durable',
        'Citoyenneté mondiale et organisations internationales',
      ],
    },
    10: {
      topic: 'Enjeux du monde contemporain — Secondaire 4',
      programLabel: 'Histoire et éducation à la citoyenneté — Secondaire 4',
      level: 'secondaire',
      subtopics: [
        'La mondialisation économique',
        'Les conflits armés du XXe siècle',
        'La décolonisation et les pays en développement',
        'Les droits humains — universalité et violations',
        'Les régimes politiques (démocratie, autoritarisme)',
        'Les médias et l\'opinion publique',
        'Les enjeux de la migration internationale',
        'L\'ONU et la gouvernance mondiale',
      ],
    },
    11: {
      topic: 'Grands enjeux du XXIe siècle — Secondaire 5',
      programLabel: 'Histoire et éducation à la citoyenneté — Secondaire 5',
      level: 'secondaire',
      subtopics: [
        'Les défis démocratiques contemporains',
        'Économie mondiale et inégalités',
        'Changements climatiques — enjeux politiques',
        'Les nouvelles technologies et société',
        'La sécurité internationale et le terrorisme',
        'Les identités culturelles dans un monde globalisé',
        'L\'engagement citoyen local et mondial',
        'Révision pour l\'épreuve ministérielle',
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // SCIENCES ET TECHNOLOGIE / PHYSIQUE-CHIMIE
  // ─────────────────────────────────────────────────────────────────
  sciences: {
    3: {
      topic: 'La matière et l\'énergie — Cycle 2 (1re année)',
      programLabel: 'Science et technologie — Cycle 2, 1re année',
      level: 'primaire',
      subtopics: [
        'Les trois états de la matière (solide, liquide, gazeux)',
        'Les transformations physiques (fusion, solidification, évaporation)',
        'Les propriétés des matériaux (dureté, flexibilité, transparence)',
        'Les forces — pousser et tirer',
        'La lumière et les ombres',
        'Les sons — vibrations et propagation',
        'Les êtres vivants — caractéristiques communes',
        'La démarche d\'investigation scientifique (observation, hypothèse)',
      ],
    },
    4: {
      topic: 'Les systèmes naturels — Cycle 2 (2e année)',
      programLabel: 'Science et technologie — Cycle 2, 2e année',
      level: 'primaire',
      subtopics: [
        'Les systèmes de la Terre (lithosphère, hydrosphère, atmosphère)',
        'Le cycle de l\'eau',
        'Les types de sols et leur composition',
        'Les animaux vertébrés et invertébrés',
        'Les chaînes alimentaires',
        'La reproduction des plantes',
        'L\'électricité statique',
        'Les aimants et le magnétisme',
      ],
    },
    5: {
      topic: 'Énergie et environnement — Cycle 3 (1re année)',
      programLabel: 'Science et technologie — Cycle 3, 1re année',
      level: 'primaire',
      subtopics: [
        'Les sources d\'énergie (renouvelables et non renouvelables)',
        'La transformation de l\'énergie',
        'Les circuits électriques simples (série et parallèle)',
        'La photosynthèse et la respiration cellulaire (intro)',
        'Les biomes et les écosystèmes',
        'L\'impact humain sur l\'environnement',
        'Les mélanges et solutions',
        'Introduction à la chimie (atomes et molécules)',
      ],
    },
    6: {
      topic: 'Technologie et univers — Cycle 3 (2e année)',
      programLabel: 'Science et technologie — Cycle 3, 2e année',
      level: 'primaire',
      subtopics: [
        'Le système solaire',
        'La gravité et les forces',
        'Les machines simples (levier, plan incliné, poulie)',
        'Les ondes lumineuses (réflexion, réfraction)',
        'La génétique simple (hérédité, traits)',
        'Les réactions chimiques visibles (effervescence, changement de couleur)',
        'Les ressources naturelles et leur exploitation',
        'Conception technologique — résolution de problèmes',
      ],
    },
    7: {
      topic: 'Science et technologie — Secondaire 1',
      programLabel: 'Science et technologie — Secondaire 1',
      level: 'secondaire',
      subtopics: [
        'La cellule — structure et fonctions',
        'La reproduction sexuée et asexuée',
        'La classification des êtres vivants',
        'L\'atome — protons, neutrons, électrons',
        'Le tableau périodique des éléments',
        'Les liaisons chimiques (ionique, covalente)',
        'La cinématique — position, vitesse, accélération',
        'Les forces et les mouvements (loi de Newton intro)',
      ],
    },
    8: {
      topic: 'Science et technologie — Secondaire 2',
      programLabel: 'Science et technologie — Secondaire 2',
      level: 'secondaire',
      subtopics: [
        'La transformation chimique — réactifs et produits',
        'Les acides et les bases (pH)',
        'L\'énergie thermique et la chaleur',
        'L\'électricité — tension, intensité, résistance (loi d\'Ohm)',
        'Le système nerveux humain',
        'La digestion et la nutrition',
        'La tectonique des plaques',
        'L\'écologie — flux d\'énergie et cycles biogéochimiques',
      ],
    },
    9: {
      topic: 'Applications technologiques — Secondaire 3',
      programLabel: 'Science et technologie — Secondaire 3',
      level: 'secondaire',
      subtopics: [
        'L\'optique géométrique (réflexion, réfraction, lentilles)',
        'Les ondes mécaniques (son) et électromagnétiques (lumière)',
        'La reproduction humaine et la génétique',
        'L\'évolution des espèces (sélection naturelle)',
        'L\'électromagnétisme (champs magnétiques, induction)',
        'Les hydrocarbures et la chimie organique',
        'Les ressources énergétiques et l\'impact environnemental',
        'Démarche scientifique complète — expérimentation et rapport',
      ],
    },
    10: {
      topic: 'Physique et chimie — Secondaire 4',
      programLabel: 'Physique-chimie — Secondaire 4',
      level: 'secondaire',
      subtopics: [
        'Cinématique — mouvements uniformes et uniformément accélérés',
        'Dynamique — les trois lois de Newton',
        'Travail, énergie cinétique et potentielle',
        'Quantité de mouvement et impulsion',
        'Structure atomique et modèles atomiques',
        'Réactions chimiques — équilibrage et stœchiométrie',
        'Les solutions — concentration molaire',
        'Électrolyse et piles électrochimiques',
      ],
    },
    11: {
      topic: 'Physique avancée — Secondaire 5',
      programLabel: 'Physique — Secondaire 5',
      level: 'secondaire',
      subtopics: [
        'Mécanique — mouvement circulaire et gravitation universelle',
        'Travail et énergie — conservation de l\'énergie',
        'Thermodynamique — gaz parfaits, chaleur, entropie',
        'Ondes et lumière — interférence, diffraction',
        'Électricité — champs électriques, potentiel',
        'Électromagnétisme — loi de Faraday et induction',
        'Physique moderne — effet photoélectrique, radioactivité',
        'Préparation à l\'épreuve ministérielle',
      ],
    },
  },
}

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

export function getTopicsForGrade(subject: Subject, grade: GradeLevel): CurriculumTopic {
  return CURRICULUM[subject][grade]
}

export function getSubjectLabel(subject: Subject): string {
  const labels: Record<Subject, string> = {
    mathematiques: 'Mathématiques',
    francais:      'Français',
    histoire:      'Histoire et éducation à la citoyenneté',
    sciences:      'Sciences et technologie / Physique-chimie',
  }
  return labels[subject]
}

export function getLevelLabel(grade: GradeLevel): string {
  if (grade <= 6) return `${grade}e année (primaire)`
  const sec = grade - 6
  return `Secondaire ${sec}`
}

export function isSecondary(grade: GradeLevel): boolean {
  return grade >= 7
}

export const ALL_SUBJECTS: Subject[] = ['mathematiques', 'francais', 'histoire', 'sciences']
export const PRIMARY_GRADES: GradeLevel[]   = [3, 4, 5, 6]
export const SECONDARY_GRADES: GradeLevel[] = [7, 8, 9, 10, 11]
export const ALL_GRADES: GradeLevel[]       = [...PRIMARY_GRADES, ...SECONDARY_GRADES]

