import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  muscoli: number
  figosita: number
  stanchezza: number
  coattaggine: number
  soldi: number
  media: number
  reputazione: number
  intelligenza: number
  carisma: number
}

export interface ScheduledExam {
  id: string
  subject: string
  date: { day: number; month: number; year: number }
  difficulty: number
  prepared: boolean
}

export type SchoolType = 'liceo' | 'tecnico' | 'artistico'

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
  currentPhase: DayPhase
  age: number
  schoolYear: SchoolYear
  phaseActions: PhaseActions
  actionsRemaining: number
  maxActionsPerDay: number
  lastPaghettaDate?: GameDate
  extraActions: number
}

export interface SchoolRecord {
  wentToSchoolToday: boolean
  assenze: number
  note: number
  condotta: number
  sospensioni: number
  consecutiveGoodDays: number
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  wentToSchoolToday: false,
  assenze: 0,
  note: 0,
  condotta: 8.0,
  sospensioni: 0,
  consecutiveGoodDays: 0
}

export interface Friend {
  id: string
  name: string
  intelligenza: number
  carisma: number
  relationship: number
}

export interface Relationship {
  id: string
  name: string
  type: 'ape' | 'dark' | 'metallara' | 'alternativa' | 'sportiva'
  compatibility: number
  met: boolean
}

export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  traits: TraitId[]
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export type ReputationLevel = 'scarso' | 'basso' | 'medio' | 'alto' | 'leggenda'

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    matematica: 1.5,
    fisica: 1.5,
    italiano: 1.0,
    inglese: 1.0,
    storia: 1.0,
    scienze: 1.2,
    edFisica: 0.8
  },
  tecnico: {
    matematica: 1.5,
    fisica: 1.5,
    italiano: 1.0,
    inglese: 1.2,
    storia: 0.8,
    scienze: 1.5,
    edFisica: 0.8
  },
  artistico: {
    matematica: 0.8,
    fisica: 0.8,
    italiano: 1.2,
    inglese: 1.0,
    storia: 1.5,
    scienze: 1.0,
    edFisica: 1.0
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
    case 'artistico':
      return {
        matematica: 6,
        fisica: 6,
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
    figosita: 50,
    soldi: 100,
    media: 6,
    stanchezza: 0,
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
