import type { TraitId } from '@/lib/character-traits'

export type ExamDifficulty = 'facile' | 'media' | 'difficile'

export interface GameStats {
  coattaggine: number
  muscoli: number
  soldi: number
  stanchezza: number
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
  media?: number
}

export interface Friend {
  name: string
  relationshipLevel: number
  intelligenza: number
  muscoli: number
  carisma: number
  traits?: TraitId[]
}

export interface Relationship {
  name: string
  preference: RelationshipPreference
  attraction?: number
}

export type RelationshipPreference = 'muscoli' | 'intelligenza' | 'figosita' | 'coattaggine' | 'carisma'

export interface ScheduledExam {
  subject: string
  month: number
  day: number
  daysUntil: number
  difficulty: ExamDifficulty
  prepared: boolean
}

export interface PlayerProfile {
  name: string
  gender: 'maschio' | 'femmina'
  traits?: TraitId[]
}

export type SchoolType = 'liceo' | 'tecnico' | 'artistico' | 'agrario'

export function getSchoolTypeName(schoolType: SchoolType): string {
  const names: Record<SchoolType, string> = {
    liceo: 'Liceo Scientifico',
    tecnico: 'Istituto Tecnico',
    artistico: 'Liceo Artistico',
    agrario: 'Istituto Agrario'
  }
  return names[schoolType]
}

export interface SubjectGrades {
  [subject: string]: number
}

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  daysUntilBreak: number
  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'
export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

export interface DayPhaseConfig {
  label: string
  timeRange: string
  maxActions: number
}

export interface GameTime {
  currentDate: GameDate
  actionsRemaining: number
  age: number
  schoolYear: SchoolYear
  currentPhase?: DayPhase
  maxActionsPerDay?: number
  phaseActions?: {
    mattina: number
    pomeriggio: number
    sera: number
    notte: number
  }
}

export interface PhaseTimeState {
  currentPhase: DayPhase
  phaseActionsRemaining: number
}

export interface SchoolRecord {
  note: number
  assenze: number
  condotta: number
  sospensioni: number
  consecutiveGoodDays: number
  wentToSchoolToday: boolean
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  note: 0,
  assenze: 0,
  condotta: 8.0,
  sospensioni: 0,
  consecutiveGoodDays: 0,
  wentToSchoolToday: false
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    matematica: 1.5,
    fisica: 1.3,
    italiano: 1.2,
    storia: 1.0,
    inglese: 1.0,
    scienze: 1.0,
    edFisica: 0.5
  },
  tecnico: {
    pratica: 1.5,
    matematica: 1.2,
    elettronica: 1.2,
    italiano: 1.0,
    inglese: 1.0,
    fisica: 0.8,
    edFisica: 0.5
  },
  artistico: {
    disegno: 1.5,
    arte: 1.3,
    italiano: 1.0,
    inglese: 1.0,
    storia: 1.0,
    matematica: 0.8,
    edFisica: 0.6
  },
  agrario: {
    pratica: 1.4,
    scienze: 1.2,
    italiano: 1.0,
    matematica: 1.0,
    inglese: 0.8,
    storia: 0.8,
    edFisica: 0.6
  }
}

export const DEFAULT_SCHOOL_YEAR: SchoolYear = {
  currentYear: 1,
  isSchoolPeriod: true,
  daysUntilBreak: 180,
  schoolStartDate: { day: 15, month: 9, year: 2026 },
  schoolEndDate: { day: 10, month: 6, year: 2027 },
  reportCardDate: { day: 10, month: 6, year: 2027 }
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  switch (schoolType) {
    case 'liceo':
      return {
        matematica: 6,
        fisica: 6,
        italiano: 6,
        storia: 6,
        inglese: 6,
        scienze: 6,
        edFisica: 6
      }
    case 'tecnico':
      return {
        pratica: 6,
        matematica: 6,
        elettronica: 6,
        italiano: 6,
        inglese: 6,
        fisica: 6,
        edFisica: 6
      }
    case 'artistico':
      return {
        disegno: 6,
        arte: 6,
        italiano: 6,
        inglese: 6,
        storia: 6,
        matematica: 6,
        edFisica: 6
      }
    case 'agrario':
      return {
        pratica: 6,
        scienze: 6,
        italiano: 6,
        matematica: 6,
        inglese: 6,
        storia: 6,
        edFisica: 6
      }
  }
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
    italiano: 'Italiano',
    storia: 'Storia',
    inglese: 'Inglese',
    scienze: 'Scienze',
    edFisica: 'Ed. Fisica',
    pratica: 'Pratica',
    elettronica: 'Elettronica',
    disegno: 'Disegno',
    arte: 'Arte'
  }
  return displayNames[subject] || subject
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export const DEFAULT_GAME_STATE = {
  stats: {
    coattaggine: 0,
    muscoli: 50,
    soldi: 100,
    stanchezza: 0,
    figosita: 50,
    reputazione: 50,
    intelligenza: 50,
    carisma: 50,
    media: 6
  } as GameStats,
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
    actionsRemaining: 3,
    currentPhase: 'mattina' as const,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      daysUntilBreak: 180,
      schoolStartDate: { day: 15, month: 9, year: 2026 },
      schoolEndDate: { day: 10, month: 6, year: 2027 },
      reportCardDate: { day: 10, month: 6, year: 2027 }
    },
    age: 14,
    phaseActions: {
      mattina: 3,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  } as GameTime
}
