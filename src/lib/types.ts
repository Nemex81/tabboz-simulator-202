import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  muscoli: number
  carisma: number
  reputazione: number
  intelligenza: number
  soldi: number
  figosita: number
  coattaggine: number
  stanchezza: number
  media: number
}

export interface ScheduledExam {
  id: string
  date: { day: number; month: number; year: number }
  subject: string
  difficulty: number
  prepared: boolean
}

export type SchoolType = 'liceo' | 'tecnico' | 'artistico'

export const SCHOOL_TYPE_NAMES: Record<SchoolType, string> = {
  liceo: 'Liceo Scientifico',
  tecnico: 'Istituto Tecnico',
  artistico: 'Istituto Artistico'
}

export interface SubjectGrades {
  [key: string]: number
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
  muscoli: number
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
    italiano: 1.2,
    inglese: 1.0,
    storia: 1.0,
    scienze: 1.2,
    edFisica: 0.8
  },
  tecnico: {
    matematica: 1.5,
    fisica: 1.2,
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
    edFisica: 1.2
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
    reputazione: 50,
    soldi: 100,
    figosita: 50,
    intelligenza: 50,
    stanchezza: 0,
    carisma: 50,
    media: 6
  },
  grades: {
    matematica: 6,
    fisica: 6,
    italiano: 6,
    inglese: 6,
    storia: 6,
    scienze: 6,
    edFisica: 6
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 1, month: 9, year: 2026 },
    currentPhase: 'mattina' as DayPhase,
    age: 14,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      daysUntilBreak: 30
    },
    phaseActions: {
      mattina: 2,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  } as GameTime
}
