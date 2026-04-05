import type { TraitId } from '@/lib/character-traits'

export type Gender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export type RelationshipDifficulty = 'facile' | 'media' | 'difficile'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type ThemeVariant = 'default' | 'dark' | 'green'

export type DayType = 'feriale' | 'weekend'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type ExamDifficulty = 'easy' | 'medium' | 'hard'

export type TimePhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export interface GameStats {
  soldi: number
  figosita: number
  intelligenza: number
  coattaggine: number
  muscoli: number
  carisma: number
  reputazione: number
  stanchezza: number
  media: number
}

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
}

export interface GameTime {
  currentDate: GameDate
  schoolYear: SchoolYear
  age: number
  phase: TimePhase
  phaseActions: {
    mattina: number
    pomeriggio: number
    sera: number
    notte: number
  }
}

export interface Friend {
  id: string
  name: string
  type: FriendType
  friendshipLevel: number
  unlocked: boolean
  lastInteraction?: number
}

export interface Relationship {
  id: string
  name: string
  difficulty: RelationshipDifficulty
  preference: RelationshipPreference
  relationshipLevel: number
  isActive: boolean
  attraction: number
  lastInteraction?: number
}

export interface ScheduledExam {
  subject: string
  daysUntil: number
  difficulty: ExamDifficulty
  isPrepared: boolean
  announced: boolean
}

export interface PlayerProfile {
  name: string
  gender: Gender
  traits: TraitId[]
}

export interface SchoolRecord {
  condotta: number
  assenze: number
  note: number
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays: number
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  tecnico: {
    matematica: 1.5,
    fisica: 1.4,
    informatica: 1.5,
    elettronica: 1.3,
    italiano: 1.0,
    inglese: 1.0,
    edFisica: 0.7
  },
  agraria: {
    matematica: 1.2,
    scienze: 1.5,
    agronomia: 1.6,
    chimica: 1.4,
    italiano: 1.0,
    edFisica: 0.8
  },
  artistico: {
    arte: 1.7,
    storia_arte: 1.5,
    disegno: 1.6,
    italiano: 1.1,
    edFisica: 0.7
  }
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  condotta: 8.0,
  assenze: 0,
  note: 0,
  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0
}

export const DEFAULT_GAME_STATE = {
  stats: {
    soldi: 100,
    figosita: 50,
    intelligenza: 50,
    coattaggine: 50,
    muscoli: 50,
    carisma: 50,
    reputazione: 50,
    stanchezza: 0,
    media: 6.0
  } as GameStats,
  grades: {
    matematica: 6.0,
    italiano: 6.0,
    inglese: 6.0,
    fisica: 6.0,
    edFisica: 6.0
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 1, month: 9, year: 2024 },
    schoolYear: { currentYear: 1, isSchoolPeriod: true },
    age: 14,
    phase: 'mattina' as TimePhase,
    phaseActions: {
      mattina: 3,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
  } as GameTime
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const baseGrade = 6.0
  
  switch (schoolType) {
    case 'tecnico':
      return {
        matematica: baseGrade,
        fisica: baseGrade,
        informatica: baseGrade,
        elettronica: baseGrade,
        italiano: baseGrade,
        inglese: baseGrade,
        edFisica: baseGrade
      }
    case 'agraria':
      return {
        matematica: baseGrade,
        scienze: baseGrade,
        agronomia: baseGrade,
        chimica: baseGrade,
        italiano: baseGrade,
        edFisica: baseGrade
      }
    case 'artistico':
      return {
        arte: baseGrade,
        storia_arte: baseGrade,
        disegno: baseGrade,
        italiano: baseGrade,
        edFisica: baseGrade
      }
    default:
      return {
        matematica: baseGrade,
        italiano: baseGrade,
        inglese: baseGrade,
        fisica: baseGrade,
        edFisica: baseGrade
      }
  }
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    italiano: 'Italiano',
    inglese: 'Inglese',
    edFisica: 'Ed. Fisica',
    scienze: 'Scienze',
    agronomia: 'Agronomia',
    chimica: 'Chimica',
    arte: 'Arte',
    storia_arte: 'Storia dell\'Arte',
    disegno: 'Disegno'
  }
  return displayNames[subject] || subject
}
