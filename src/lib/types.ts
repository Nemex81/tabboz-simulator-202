
import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  muscoli: number
  coattaggine: number
  soldi: number
  media: number
  stanchezza: number
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
}

export interface ScheduledExam {
  id?: string
  subject: string
  date?: { day: number; month: number; year: number }
  daysUntil?: number
  isPrepared: boolean
  difficulty: 'facile' | 'normale' | 'difficile' | 'brutale'
  announced?: boolean
}

export type SchoolType = 'liceo' | 'tecnico' | 'artistico' | 'tecnico' | 'agraria'

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

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    matematica: 1.5,
    fisica: 1.3,
    italiano: 1.0,
    inglese: 1.0,
    storia: 1.0,
    scienze: 1.0,
    edFisica: 0.8
  },
  tecnico: {
    fisica: 1.5,
    matematica: 1.3,
    inglese: 1.2,
    italiano: 1.0,
    storia: 0.8,
    scienze: 1.0,
    edFisica: 0.7
  },
  agraria: {
    scienze: 1.5,
    matematica: 1.0,
    italiano: 1.0,
    inglese: 0.9,
    storia: 0.8,
    fisica: 1.2,
    edFisica: 0.9
  },
  artistico: {
    disegno: 1.5,
    storiaArte: 1.3,
    matematica: 0.8,
    italiano: 1.2,
    inglese: 1.0,
    storia: 1.5,
    scienze: 0.8,
    edFisica: 0.7
  }
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  switch (schoolType) {
    case 'liceo':
      return {
        matematica: 6,
        fisica: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        scienze: 6,
        edFisica: 6
      }
    case 'tecnico':
      return {
        matematica: 6,
        fisica: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        scienze: 6,
        edFisica: 6
      }
    case 'agraria':
      return {
        matematica: 6,
        fisica: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        scienze: 6,
        edFisica: 6
      }
    case 'artistico':
      return {
        matematica: 6,
        disegno: 6,
        storiaArte: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        scienze: 6,
        edFisica: 6
      }
  }
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
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

export function getSchoolTypeName(schoolType: SchoolType): string {
  const names: Record<SchoolType, string> = {
    liceo: 'Liceo',
    tecnico: 'Istituto Tecnico',
    agraria: 'Istituto Agrario',
    artistico: 'Istituto Artistico'
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
  tier?: RelationshipTier
  bondType?: SocialBondType
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
