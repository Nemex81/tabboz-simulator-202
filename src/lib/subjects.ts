import type { SchoolType, SubjectGrades } from '@/lib/types'

export interface SubjectDefinition {
  key: string
  displayName: string
  weight: number
  fromYear: number
  toYear: number
  isCommon: boolean
  countsForGPA: boolean
  weeklyHours?: number
  weightBySchoolType?: Partial<Record<SchoolType, number>>
}

// ─── Materie Comuni (7) ───────────────────────────────────────────────────────

export const COMMON_SUBJECTS: SubjectDefinition[] = [
  {
    key: 'italiano',
    displayName: 'Lingua e Letteratura Italiana',
    weight: 1.3,
    fromYear: 1,
    toYear: 5,
    isCommon: true,
    countsForGPA: true,
    weeklyHours: 4,
  },
  {
    key: 'storia',
    displayName: 'Storia',
    weight: 1.0,
    fromYear: 1,
    toYear: 5,
    isCommon: true,
    countsForGPA: true,
    weeklyHours: 2,
  },
  {
    key: 'inglese',
    displayName: 'Lingua Inglese',
    weight: 1.1,
    fromYear: 1,
    toYear: 5,
    isCommon: true,
    countsForGPA: true,
    weeklyHours: 3,
  },
  {
    key: 'matematica',
    displayName: 'Matematica',
    weight: 1.2,
    fromYear: 1,
    toYear: 5,
    isCommon: true,
    countsForGPA: true,
    weeklyHours: 4,
    weightBySchoolType: {
      liceoScientifico: 1.5,
      tecnico: 1.3,
      agraria: 1.1,
      artistico: 0.9,
      conservatorio: 0.9,
      alberghiero: 1.0,
    },
  },
  {
    key: 'edFisica',
    displayName: 'Scienze Motorie e Sportive',
    weight: 0.7,
    fromYear: 1,
    toYear: 5,
    isCommon: true,
    countsForGPA: true,
    weeklyHours: 2,
  },
  {
    key: 'religione',
    displayName: 'Religione / Attività Alternative',
    weight: 0.0,
    fromYear: 1,
    toYear: 5,
    isCommon: true,
    countsForGPA: false,
    weeklyHours: 1,
  },
  {
    key: 'fisica',
    displayName: 'Fisica',
    weight: 1.0,
    fromYear: 1,
    toYear: 2,
    isCommon: true,
    countsForGPA: true,
    weeklyHours: 2,
    weightBySchoolType: {
      liceoScientifico: 1.1,
      tecnico: 1.1,
      agraria: 0.9,
      artistico: 0.8,
      conservatorio: 0.7,
      alberghiero: 0.8,
    },
  },
]

// ─── Materie Specifiche per Istituto ─────────────────────────────────────────

export const SPECIFIC_SUBJECTS: Record<SchoolType, SubjectDefinition[]> = {
  tecnico: [
    { key: 'diritto',        displayName: 'Diritto ed Economia',           weight: 0.8, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'scienzeInt',     displayName: 'Scienze Integrate',              weight: 1.0, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'chimicaInt',     displayName: 'Chimica Integrata',              weight: 1.0, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'tecnInfo',       displayName: 'Tecnologie Informatiche',        weight: 1.2, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'informatica',    displayName: 'Informatica',                    weight: 1.6, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 4 },
    { key: 'sistemi',        displayName: 'Sistemi e Reti',                 weight: 1.5, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'tpsit',          displayName: 'TPSIT',                          weight: 1.4, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'linguaggio',     displayName: 'Linguaggi di Programmazione',    weight: 1.4, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'basiDati',       displayName: 'Basi di Dati',                   weight: 1.3, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'webDev',         displayName: 'Sviluppo Web e Sicurezza',       weight: 1.2, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 1 },
    { key: 'stageAziendale', displayName: 'Stage Aziendale (PCTO)',         weight: 0.0, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: false, weeklyHours: 0 },
  ],

  agraria: [
    { key: 'diritto',          displayName: 'Diritto ed Economia',                 weight: 0.8, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'scienzeInt',       displayName: 'Scienze Integrate Bio+Terra',         weight: 1.1, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'chimicaInt',       displayName: 'Chimica Integrata',                   weight: 1.0, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'pedologia',        displayName: 'Pedologia e Chimica del Suolo',       weight: 0.9, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'agronomia',        displayName: 'Agronomia Territoriale',              weight: 1.4, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 4 },
    { key: 'zootecnia',        displayName: 'Zootecnia',                           weight: 1.2, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'chimicaAgraria',   displayName: 'Chimica Agraria e Agroindustria',     weight: 1.4, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'economiaAgraria',  displayName: 'Economia Agraria',                   weight: 1.3, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'biologia',         displayName: 'Biologia Applicata',                 weight: 1.3, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'ambienteRurale',   displayName: 'Gestione Ambiente Rurale',           weight: 1.1, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'stageAgricolo',    displayName: 'Stage Agricolo (PCTO)',               weight: 0.0, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: false, weeklyHours: 0 },
  ],

  artistico: [
    { key: 'storiaArte',       displayName: "Storia dell'Arte",                    weight: 1.3, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'disegnoGeo',       displayName: 'Disegno Geometrico e Proiettivo',     weight: 1.0, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'disegnoArtist',    displayName: 'Disegno Artistico',                   weight: 1.1, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'laboratorioPit',   displayName: 'Laboratorio Pittura',                 weight: 1.0, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'chimicaMat',       displayName: 'Chimica dei Materiali',               weight: 0.9, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'filosofia',        displayName: 'Filosofia',                           weight: 1.1, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'progettazioneArt', displayName: 'Progettazione Artistica',             weight: 1.5, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 4 },
    { key: 'laboratorioProg',  displayName: 'Laboratorio di Indirizzo',            weight: 1.4, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'discipline',       displayName: 'Discipline Plastiche e Scultoree',    weight: 1.3, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'stageCulturale',   displayName: 'Stage Culturale (PCTO)',              weight: 0.0, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: false, weeklyHours: 0 },
  ],

  conservatorio: [
    { key: 'strumento',        displayName: 'Esecuzione e Interpretazione',        weight: 2.0, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'teoriaMusicale',   displayName: 'Teoria, Analisi e Composizione',      weight: 1.5, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'storiaMusica',     displayName: 'Storia della Musica',                 weight: 1.3, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'musicaInsieme',    displayName: "Musica d'Insieme",                    weight: 1.2, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'tecnologieMusic',  displayName: 'Tecnologie Musicali',                 weight: 1.0, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 1 },
    { key: 'solfeggio',        displayName: 'Lettura, Solfeggio e Dettato',        weight: 1.2, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'scienze',          displayName: 'Scienze Naturali',                    weight: 0.9, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 1 },
    { key: 'filosofia',        displayName: 'Filosofia',                           weight: 1.1, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'armonia',          displayName: 'Armonia e Contrappunto',              weight: 1.4, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'stageMusica',      displayName: 'Stage Artistico (PCTO)',              weight: 0.0, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: false, weeklyHours: 0 },
  ],

  alberghiero: [
    { key: 'secondaLingua',    displayName: 'Seconda Lingua Straniera',            weight: 1.2, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'scienzeAlim',      displayName: 'Scienze degli Alimenti',              weight: 1.3, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'laboratorioCucina',displayName: 'Lab. Servizi Enogastronomici — Cucina', weight: 1.5, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'laboratorioSala',  displayName: 'Lab. Servizi Sala e Vendita',         weight: 1.4, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'diritto',          displayName: 'Diritto ed Economia',                 weight: 0.8, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'scienzeInt',       displayName: 'Scienze Integrate Bio+Terra',         weight: 1.0, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'chimicaAlb',       displayName: 'Chimica e Laboratorio',               weight: 1.0, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 1 },
    { key: 'alimentazione',    displayName: "Scienza e Cultura dell'Alimentazione",weight: 1.3, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'enologia',         displayName: 'Enologia e Cultura del Vino',         weight: 1.3, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'stageAlberghiero', displayName: 'Stage Alberghiero (PCTO)',            weight: 0.0, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: false, weeklyHours: 0 },
  ],

  liceoScientifico: [
    { key: 'scienze',          displayName: 'Scienze Naturali (Bio+Chim+Terra)',   weight: 1.2, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'latino',           displayName: 'Latino',                              weight: 1.2, fromYear: 1, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'geostoria',        displayName: 'Storia e Geografia',                  weight: 0.9, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 3 },
    { key: 'disegnoST',        displayName: "Disegno e Storia dell'Arte",          weight: 0.8, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'informaticaLiceo', displayName: 'Informatica',                         weight: 0.9, fromYear: 1, toYear: 2, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'filosofia',        displayName: 'Filosofia',                           weight: 1.2, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'fisicaAvanzata',   displayName: 'Fisica (triennio avanzato)',          weight: 1.4, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 4 },
    { key: 'chimicaOrg',       displayName: 'Chimica Organica e Biochimica',       weight: 1.2, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'laboratorioSci',   displayName: 'Laboratorio Scientifico',             weight: 1.0, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: true,  weeklyHours: 2 },
    { key: 'alternanzaSci',    displayName: 'PCTO Scientifico',                    weight: 0.0, fromYear: 3, toYear: 5, isCommon: false, countsForGPA: false, weeklyHours: 0 },
  ],
}

// ─── Funzioni ─────────────────────────────────────────────────────────────────

export function getActiveSubjectsForYear(
  schoolType: SchoolType,
  schoolYear: number
): SubjectDefinition[] {
  const specific = SPECIFIC_SUBJECTS[schoolType].filter(
    s => schoolYear >= s.fromYear && schoolYear <= s.toYear
  )
  const common = COMMON_SUBJECTS.filter(
    s => schoolYear >= s.fromYear && schoolYear <= s.toYear
  )
  return [...common, ...specific]
}

export function getGradeWeight(subject: SubjectDefinition, schoolType: SchoolType): number {
  return subject.weightBySchoolType?.[schoolType] ?? subject.weight
}

export function getDefaultGradesFromSubjects(schoolType: SchoolType): SubjectGrades {
  return Object.fromEntries(
    getActiveSubjectsForYear(schoolType, 1)
      .filter(s => s.countsForGPA)
      .map(s => [s.key, 6])
  )
}
