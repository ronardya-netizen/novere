export type Topic = { id: string; label: string; grades: number[] }
export type SubjectCurriculum = { topics: Topic[] }

export const CURRICULUM: Record<string, SubjectCurriculum> = {
  'Mathématiques': {
    topics: [
      { id: 'nb-naturels-c1',   label: 'Nombres naturels (< 1000)',           grades: [1,2] },
      { id: 'operations-c1',    label: 'Addition et soustraction',             grades: [1,2] },
      { id: 'geo-c1',           label: 'Solides et figures planes',            grades: [1,2] },
      { id: 'mesure-c1',        label: 'Longueurs et temps',                   grades: [1,2] },
      { id: 'nb-naturels-c2',   label: 'Nombres naturels (< 100 000)',         grades: [3,4] },
      { id: 'fractions-c2',     label: 'Fractions',                            grades: [3,4] },
      { id: 'decimaux-c2',      label: 'Nombres décimaux',                     grades: [3,4] },
      { id: 'mult-div-c2',      label: 'Multiplication et division',           grades: [3,4] },
      { id: 'geo-c2',           label: 'Figures planes et solides',            grades: [3,4] },
      { id: 'mesure-c2',        label: 'Longueurs, aires et volumes',          grades: [3,4] },
      { id: 'stats-c2',         label: 'Statistique et diagrammes',            grades: [3,4] },
      { id: 'proba-c2',         label: 'Probabilité',                          grades: [3,4] },
      { id: 'nb-naturels-c3',   label: 'Nombres naturels (< 1 000 000)',       grades: [5,6] },
      { id: 'fractions-c3',     label: 'Fractions et pourcentages',            grades: [5,6] },
      { id: 'decimaux-c3',      label: 'Nombres décimaux et entiers',          grades: [5,6] },
      { id: 'operations-c3',    label: 'Opérations et priorité',               grades: [5,6] },
      { id: 'geo-c3',           label: 'Géométrie avancée',                    grades: [5,6] },
      { id: 'mesure-c3',        label: 'Angles, aires et volumes',             grades: [5,6] },
      { id: 'stats-c3',         label: 'Statistique et probabilité',           grades: [5,6] },
    ]
  },
  'Français — Lecture': {
    topics: [
      { id: 'lecture-c2',       label: 'Lecture de textes variés',             grades: [3,4] },
      { id: 'sens-mots-c2',     label: 'Sens des mots',                        grades: [3,4] },
      { id: 'dico-c2',          label: 'Utilisation du dictionnaire',           grades: [3,4] },
      { id: 'oral-c2',          label: 'Communication orale',                  grades: [3,4] },
      { id: 'org-texte-c2',     label: 'Organisation du texte',                grades: [3,4] },
      { id: 'lecture-c3',       label: 'Lecture et interprétation',            grades: [5,6] },
      { id: 'oeuvres-c3',       label: 'Appréciation des œuvres littéraires',  grades: [5,6] },
      { id: 'oral-c3',          label: 'Communication orale',                  grades: [5,6] },
      { id: 'org-coherence-c3', label: 'Organisation et cohérence du texte',   grades: [5,6] },
    ]
  },
  'Français — Écriture': {
    topics: [
      { id: 'lexique-c2',       label: 'Lexique et formation des mots',        grades: [3,4] },
      { id: 'ortho-c2',         label: 'Orthographe d\'usage',                 grades: [3,4] },
      { id: 'conjugaison-c2',   label: 'Conjugaison des verbes',               grades: [3,4] },
      { id: 'temps-c2',         label: 'Temps simples de l\'indicatif',        grades: [3,4] },
      { id: 'accords-c2',       label: 'Accords grammaticaux',                 grades: [3,4] },
      { id: 'classes-c2',       label: 'Classes de mots',                      grades: [3,4] },
      { id: 'syntaxe-c2',       label: 'Syntaxe et ponctuation',               grades: [3,4] },
      { id: 'lexique-c3',       label: 'Lexique et relations entre mots',      grades: [5,6] },
      { id: 'ortho-c3',         label: 'Orthographe et constantes',            grades: [5,6] },
      { id: 'conjugaison-c3',   label: 'Conjugaison modes et temps',           grades: [5,6] },
      { id: 'accord-gn-c3',     label: 'Accords dans le groupe du nom',        grades: [5,6] },
      { id: 'accord-sujet-c3',  label: 'Accords régis par le sujet',           grades: [5,6] },
      { id: 'syntaxe-c3',       label: 'Syntaxe de la phrase',                 grades: [5,6] },
      { id: 'types-phrases-c3', label: 'Types et formes de phrases',           grades: [5,6] },
      { id: 'fonctions-c3',     label: 'Fonctions syntaxiques',                grades: [5,6] },
    ]
  },
  'Science et technologie': {
    topics: [
      { id: 'matiere-c1',       label: 'Propriétés de la matière',             grades: [1,2] },
      { id: 'vivant-c1',        label: 'Caractéristiques du vivant',           grades: [1,2] },
      { id: 'terre-c1',         label: 'La Terre et les saisons',              grades: [1,2] },
      { id: 'matiere-c2',       label: 'Matière et mélanges',                  grades: [3,4] },
      { id: 'energie-c2',       label: 'Formes d\'énergie',                    grades: [3,4] },
      { id: 'forces-c2',        label: 'Forces et mouvements',                 grades: [3,4] },
      { id: 'machines-c2',      label: 'Machines simples',                     grades: [3,4] },
      { id: 'vivant-c2',        label: 'Organisation du vivant',               grades: [3,4] },
      { id: 'eau-c2',           label: 'Cycle de l\'eau et météo',             grades: [3,4] },
      { id: 'espace-c2',        label: 'Système Soleil-Terre-Lune',            grades: [3,4] },
      { id: 'matiere-c3',       label: 'Transformations de la matière',        grades: [5,6] },
      { id: 'energie-c3',       label: 'Transmission de l\'énergie',           grades: [5,6] },
      { id: 'electricite-c3',   label: 'Électricité et magnétisme',            grades: [5,6] },
      { id: 'vivant-c3',        label: 'Photosynthèse et chaînes alimentaires',grades: [5,6] },
      { id: 'terre-c3',         label: 'Roches, minéraux et phénomènes',      grades: [5,6] },
      { id: 'solaire-c3',       label: 'Système solaire',                      grades: [5,6] },
      { id: 'techno-c3',        label: 'Technologies et robots',               grades: [5,6] },
    ]
  },
  'Univers social': {
    topics: [
      { id: 'iroquois-1500',    label: 'Société iroquoienne vers 1500',        grades: [3,4] },
      { id: 'francais-1645',    label: 'Société française (NF) vers 1645',     grades: [3,4] },
      { id: 'canadien-1745',    label: 'Société canadienne (NF) vers 1745',    grades: [3,4] },
      { id: 'chgmt-iroquois',   label: 'Changements société iroquoienne',      grades: [3,4] },
      { id: 'chgmt-nf',         label: 'Changements société française/canadienne', grades: [3,4] },
      { id: 'div-iroq-algo',    label: 'Diversité: Iroquois et Algonquins',    grades: [3,4] },
      { id: 'div-iroq-inca',    label: 'Diversité: Iroquois et Incas',         grades: [3,4] },
      { id: 'div-nf-col',       label: 'Diversité: NF et Treize colonies',     grades: [3,4] },
      { id: 'demarche-c2',      label: 'Démarche de recherche',                grades: [3,4] },
      { id: 'techniques-c2',    label: 'Techniques géographiques et historiques', grades: [3,4] },
      { id: 'canadien-1820',    label: 'Société canadienne vers 1820',         grades: [5,6] },
      { id: 'quebec-1905',      label: 'Société québécoise vers 1905',         grades: [5,6] },
      { id: 'quebec-1980',      label: 'Société québécoise vers 1980',         grades: [5,6] },
      { id: 'chgmt-canadien',   label: 'Changements société canadienne',       grades: [5,6] },
      { id: 'chgmt-quebec',     label: 'Changements société québécoise',       grades: [5,6] },
      { id: 'div-qc-prairies',  label: 'Diversité: Québec et Prairies',        grades: [5,6] },
      { id: 'div-prai-cote',    label: 'Diversité: Prairies et Côte Ouest',    grades: [5,6] },
      { id: 'div-demo',         label: 'Diversité: démocratie et non-démocratie', grades: [5,6] },
      { id: 'div-mic-inuit',    label: 'Diversité: Micmacs et Inuits',         grades: [5,6] },
      { id: 'demarche-c3',      label: 'Démarche de recherche',                grades: [5,6] },
      { id: 'techniques-c3',    label: 'Techniques géographiques et historiques', grades: [5,6] },
    ]
  },
  'Anglais langue seconde': {
    topics: [
      { id: 'oral-c2',          label: 'Oral communication',                   grades: [3,4] },
      { id: 'reading-c2',       label: 'Reading simple texts',                 grades: [3,4] },
      { id: 'writing-c2',       label: 'Writing words and sentences',          grades: [3,4] },
      { id: 'vocab-c2',         label: 'Vocabulary building',                  grades: [3,4] },
      { id: 'oral-c3',          label: 'Oral interaction',                     grades: [5,6] },
      { id: 'reading-c3',       label: 'Reading varied texts',                 grades: [5,6] },
      { id: 'writing-c3',       label: 'Writing short texts',                  grades: [5,6] },
      { id: 'grammar-c3',       label: 'Grammar and syntax',                   grades: [5,6] },
      { id: 'vocab-c3',         label: 'Vocabulary in context',                grades: [5,6] },
    ]
  },
}

export function getTopicsForGrade(subject: string, grade: number): Topic[] {
  return (CURRICULUM[subject]?.topics || []).filter(t => t.grades.includes(grade))
}

