
import type { TraitId } from '@/lib/character-traits'
import { getActiveSubjectsForYear, COMMON_SUBJECTS, SPECIFIC_SUBJECTS } from '@/lib/subjects'
export type { SubjectDefinition } from '@/lib/subjects'

export interface GameStats {
  muscoli: number
  coattaggine: number
  soldi: number
  media: number
  stanchezza: number
  stress: number       // 0-100: stanchezza mentale
  morale: number       // 0-100: stato emotivo
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
  salute: number
  hasMotorino: boolean  // true dopo la prima azione motorino riuscita
}

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export interface ScheduledExam {
  id?: string
  subject: string
  date?: { day: number; month: number; year: number }
  daysUntil?: number
  type?: 'scritto' | 'orale'
  isPrepared: boolean
  difficulty: ExamDifficulty
  announced?: boolean
}

export type SchoolType =
  | 'tecnico'
  | 'agraria'
  | 'artistico'
  | 'conservatorio'
  | 'alberghiero'
  | 'liceoScientifico'

export interface SubjectGrades {
  [subject: string]: number
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  daysUntilBreak: number
  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

export interface DayPhaseConfig {
  label: string
  timeRange: string
  maxActions: number
  energyCost: number
  nightRecovery: number
}

export interface PhaseActions {
  mattina: number
  pomeriggio: number
  sera: number
  notte: number
}

export interface GameTime {
  currentDate: GameDate
  actionsRemaining: number
  maxActionsPerDay: number
  schoolYear: SchoolYear
  age: number
  lastPaghettaDate?: GameDate
  extraActions: number
  currentPhase: DayPhase
  phaseActions: PhaseActions
}

export interface GameTimeV2 extends GameTime {
  dayType: DayType
  phaseActionsRemaining: number
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export type NarrativePlayerGender = 'maschio' | 'femmina'

export type BinaryGenderCode = 'M' | 'F'

export type CharacterGender = BinaryGenderCode | NarrativePlayerGender

export type SexualOrientation =
  | 'eterosessuale'
  | 'omosessuale'
  | 'bisessuale'
  | 'pansessuale'
  | 'asessuale'

export type ReputationLevel = 'sfigato' | 'normale' | 'popolare' | 'leggenda'

export type RelationshipTier =
  | 'sconosciuto'
  | 'conoscente'
  | 'amico'
  | 'amico_stretto'
  | 'migliore_amico'
  | 'trombamica'
  | 'fidanzata'

export type SocialBondType = 'amicizia' | 'romantico'

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  return Object.fromEntries(
    getActiveSubjectsForYear(schoolType, 1)
      .filter(s => s.countsForGPA)
      .map(s => [s.key, 6])
  )
}

export function getSubjectDisplayName(subject: string): string {
  for (const s of COMMON_SUBJECTS) {
    if (s.key === subject) return s.displayName
  }
  for (const subjects of Object.values(SPECIFIC_SUBJECTS)) {
    const found = subjects.find(s => s.key === subject)
    if (found) return found.displayName
  }
  return subject.replace(/([A-Z])/g, ' $1').trim()
}

export function getSchoolTypeName(schoolType: SchoolType): string {
  const names: Record<SchoolType, string> = {
    liceoScientifico: 'Liceo Scientifico',
    tecnico:          'Istituto Tecnico Informatico',
    agraria:          'Istituto Tecnico Agrario',
    artistico:        'Liceo Artistico',
    conservatorio:    'Liceo Musicale',
    alberghiero:      'Istituto Alberghiero',
  }
  return names[schoolType] || schoolType
}

export const getRelationshipTier = (
  affinita: number,
  bondType: SocialBondType = 'amicizia'
): RelationshipTier => {
  if (affinita <= 0) return 'sconosciuto'
  if (bondType === 'romantico') {
    if (affinita >= 80) return 'fidanzata'
    if (affinita >= 70) return 'trombamica'
    return 'conoscente'
  }
  if (affinita >= 90) return 'migliore_amico'
  if (affinita >= 60) return 'amico_stretto'
  if (affinita >= 30) return 'amico'
  return 'conoscente'
}

export const getRelationshipTierLabel = (tier: RelationshipTier): string => {
  const labels: Record<RelationshipTier, string> = {
    sconosciuto:    '\u{1F494} Sconosciuto',
    conoscente:     '\u{1F610} Conoscente',
    amico:          '\u{1F60A} Amico',
    amico_stretto:  '\u{1F60E} Amico Stretto',
    migliore_amico: '\u{1F451} Migliore Amico',
    trombamica:     '\u{1F48B} Trombamica',
    fidanzata:      '\u2764\uFE0F Fidanzata',
  }
  return labels[tier]
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gradesHistory: Record<number, SubjectGrades>
  gameTime: GameTime
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: {
    muscoli: 50,
    coattaggine: 50,
    soldi: 100,
    media: 6,
    stanchezza: 0,
    stress: 10,
    morale: 60,
    figosita: 50,
    reputazione: 50,
    intelligenza: 10,
    carisma: 10,
    salute: 100,
    hasMotorino: false,
  },
  grades: {
    matematica: 6,
    fisica: 6,
    italiano: 6,
    inglese: 6,
    storia: 6,
    edFisica: 6,
    diritto: 6,
    scienzeInt: 6,
    chimicaInt: 6,
    tecnInfo: 6,
  },
  gradesHistory: {},
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2026 },
    actionsRemaining: 3,
    maxActionsPerDay: 3,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      daysUntilBreak: 180,
      schoolStartDate: { day: 15, month: 9, year: 2026 },
      schoolEndDate: { day: 10, month: 6, year: 2027 },
      reportCardDate: { day: 10, month: 6, year: 2027 }
    },
    age: 14,
    extraActions: 0,
    currentPhase: 'mattina',
    phaseActions: {
      mattina: 3,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  }
}

export interface Friend extends BaseCharacter {
  // ── campi esistenti (INVARIATI) ──────────────────────────────
  id:           string
  name:         string
  type:         FriendType
  intelligenza?: number
  gender?:      BinaryGenderCode
  carisma?:     number
  relazione?:   number
  unlocked:     boolean

  // ── NUOVO: contesto di origine ───────────────────────────────
  originType:   'compagno_classe' | 'compagno_istituto' | 'extrascolastico'
  metAt?:       'classe' | 'corridoio' | 'quartiere' | 'palestra'
              | 'online' | 'festa' | 'sport' | 'lavoro'
  schoolYearMet?: number

  // ── NUOVO: assi relazionali (import type da relation-system) ─
  rel?: import('@/lib/relation-system').RelationStats

  // ── NUOVO: tracking temporale per erosione inattività ────────
  lastInteractionDay?: number   // dayIndex (dateToDayIndex) dell'ultima interazione

  // ── DEPRECATO — mantenuto per migrazione KV legacy ───────────
  affinita?: number             // letto solo da migrateLegacyFriend()
  tier?:     RelationshipTier   // ora derivato, non stored
  bondType?: SocialBondType     // ora derivato, non stored
}

export interface BaseCharacter {
  id?: string
  name: string
  gender?: CharacterGender
  orientamentoSessuale?: SexualOrientation
  age?: number
  carisma?: number
  intelligenza?: number
  relazione?: number
  originType?: 'compagno_classe' | 'compagno_istituto' | 'extrascolastico' | 'player'
  metAt?: string
  interazioniPerFase?: number
}

export interface Relationship {
  id: string
  name: string
  sourceKey?: string
  sourceType?: 'generated_interest' | 'pickup' | 'direct_girlfriend'
  metAt?: Friend['metAt']
  gender?: BinaryGenderCode
  orientamentoSessuale?: SexualOrientation
  difficulty: 'facile' | 'media' | 'difficile'
  preference: 'muscoli' | 'figosita' | 'intelligenza'
  relationshipLevel: number
  isActive: boolean
}

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export interface EventConstraint {
  allowedPhases?: DayPhase[]
  allowedDayTypes?: DayType[]
  requiresSchoolPeriod?: boolean
  minSchoolYear?: number
  blockedWhenExhausted?: boolean
}

export interface PlayerProfile extends BaseCharacter {
  name: string
  gender: NarrativePlayerGender
  orientamentoSessuale: SexualOrientation
  selectedTraits?: TraitId[]
  traits?: string[]
}

export type MorningEventCategory =
  | 'didattica' | 'sociale' | 'istituto'
  | 'strada' | 'casa' | 'citta' | 'amici'

export interface SchoolRecord {
  assenze: number
  note: number
  sospensioni: number
  condotta: number
  wentToSchoolToday: boolean
  isAtSchool: boolean          // true solo se fisicamente a scuola oggi
  consecutiveGoodDays: number
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  note: 0,
  sospensioni: 0,
  condotta: 8.0,
  wentToSchoolToday: false,
  isAtSchool: false,
  consecutiveGoodDays: 0
}
import type { TraitId } from '@/lib/character-traits'

  coattaggine: number
  media: number
  figosita: number
  intelligenza:
}
export interface Sch
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
 

export interface ScheduledExam {
  id?: string
  month: number
}
export interface Sch
  isSchoolPeriod: boo
  schoolStartDate: GameDate
  reportCardDate: Gam


  mattina: number

}
export interface GameTime {
 

  lastPaghettaDate?: GameDa
  currentPhas
  month: number
  year: number
e

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  daysUntilBreak: number
  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export interface PhaseActions {
  mattina: number
  pomeriggio: number
  sera: number
  notte: number
}

export interface GameTime {
  currentDate: GameDate
  actionsRemaining: number
  maxActionsPerDay: number
  schoolYear: SchoolYear
  age: number
  lastPaghettaDate?: GameDate
  extraActions: number
  currentPhase: DayPhase
  phaseActions: PhaseActions
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export type ReputationLevel = 'sfigato' | 'normale' | 'popolare' | 'leggenda'

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
}
    fisica: 1.3,
  switch (schoolTy
    inglese: 1.0,
        matemati
    scienze: 1.0,
        inglese: 
    
    italiano
    storia: 'Sto
    disegno: 'Disegn
    edFisica: 'Ed
  return displayNa

  stats: GameStat
  gameTime: GameT

  stats: {
    coattaggine: 
    media: 6,
    figosita: 50,
    intelligenza:
  },
    matematica: 
    italiano: 6,
    
    edFisica: 
  gameTime: {
    actionsRemaining
    schoolYear: {
      isSchoolPeri
      schoolStart
      reportCard
    age: 14,
    currentPhase:
   
 

}
export interface Friend
  name: string
  affinita: nu
  unlocked: boolean

  id: string
  difficulty: 'faci
  relationshipLeve
}
export interface Pl
  gende
}
export interfa
  note: number
  condotta: number
  consecutiveGoodDay

  assenze: 0,
  sospensioni: 0,
  wentToSchoolToday
}




























    italiano: 'Italiano',
    inglese: 'Inglese',
    storia: 'Storia',
    scienze: 'Scienze',
    disegno: 'Disegno',
    storiaArte: 'Storia dell\'Arte',
    edFisica: 'Ed. Fisica'
  }
  return displayNames[subject] || subject
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameTime: GameTime
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: {
    muscoli: 50,
    coattaggine: 50,
    soldi: 100,
    media: 6,
    stanchezza: 0,
    figosita: 50,
    reputazione: 50,
    intelligenza: 10,
    carisma: 10
  },
  grades: {
    matematica: 6,
    fisica: 6,
    italiano: 6,
    inglese: 6,
    storia: 6,
    scienze: 6,
    edFisica: 6
  },
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2026 },
    actionsRemaining: 3,
    maxActionsPerDay: 3,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      daysUntilBreak: 180,
      schoolStartDate: { day: 15, month: 9, year: 2026 },
      schoolEndDate: { day: 10, month: 6, year: 2027 },
      reportCardDate: { day: 10, month: 6, year: 2027 }
    },
    age: 14,
    extraActions: 0,
    currentPhase: 'mattina',
    phaseActions: {
      mattina: 3,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  }
}

export interface Friend {
  id: string
  name: string
  type: 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'
  affinita: number
  intelligenza?: number
  unlocked: boolean
}

export interface Relationship {
  id: string
  name: string
  difficulty: 'facile' | 'media' | 'difficile'
  preference: 'muscoli' | 'figosita' | 'intelligenza'
  relationshipLevel: number
  isActive: boolean
}

export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  selectedTraits: TraitId[]
}

export interface SchoolRecord {
  assenze: number
  note: number
  sospensioni: number
  condotta: number
  wentToSchoolToday: boolean
  consecutiveGoodDays: number
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  note: 0,
  sospensioni: 0,
  condotta: 8.0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0
}
>>>>>>> Stashed changes
