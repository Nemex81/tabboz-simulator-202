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
