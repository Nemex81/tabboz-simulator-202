import type { TraitId } from '@/lib/character-traits'

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type ThemeVariant = 'default' | 'dark' | 'green'

export type Gender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export type RelationshipDifficulty = 'facile' | 'media' | 'difficile'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type TimePhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'weekend'

export interface GameStats {
  coattaggine: number
  muscoli: number
  soldi: number
  media: number
  stanchezza: number
  figosita: number
  reputazione: number
  intelligenza: number
  carisma: number
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
  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
}

export interface GameTime {
  currentDate: GameDate
  actionsRemaining: number
  maxActionsPerDay: number
  schoolYear: SchoolYear
  age: number
  lastPaghettaDate?: GameDate
  currentPhase?: TimePhase
  extraActions: number
}

export interface Friend {
  id: string
  name: string
  type: FriendType
  affinita: number
  intelligenza?: number
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
    matematica: 0.9,
    edFisica: 0.7
  }
}

export const DEFAULT_STATS: GameStats = {
  coattaggine: 50,
  muscoli: 50,
  soldi: 100,
  media: 6,
  stanchezza: 0,
  figosita: 50,
  reputazione: 50,
  intelligenza: 10,
  carisma: 10
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
  stats: DEFAULT_STATS,
  grades: {
    italiano: 6,
    matematica: 6,
    storia: 6,
    inglese: 6,
    edFisica: 6
  } as SubjectGrades,
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2026 },
    age: 14,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2026 },
      schoolEndDate: { day: 10, month: 6, year: 2027 },
      reportCardDate: { day: 10, month: 6, year: 2027 }
    },
    actionsRemaining: 3,
    maxActionsPerDay: 3,
    currentPhase: 'mattina' as const,
    extraActions: 0
  } as GameTime,
  gameOverReason: ''
}

export const SCHOOL_SUBJECTS: Record<SchoolType, string[]> = {
  tecnico: ['matematica', 'fisica', 'informatica', 'elettronica', 'italiano', 'inglese', 'edFisica'],
  agraria: ['matematica', 'scienze', 'agronomia', 'chimica', 'italiano', 'edFisica'],
  artistico: ['arte', 'storia_arte', 'disegno', 'italiano', 'matematica', 'edFisica']
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const subjects = SCHOOL_SUBJECTS[schoolType]
  return subjects.reduce((acc, subject) => {
    acc[subject] = 6
    return acc
  }, {} as SubjectGrades)
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    italiano: 'Italiano',
    latino: 'Latino',
    filosofia: 'Filosofia',
    storia: 'Storia',
    inglese: 'Inglese',
    edFisica: 'Ed. Fisica',
    fisica: 'Fisica',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    laboratorio: 'Laboratorio',
    economia: 'Economia',
    tecnologia: 'Tecnologia',
    arte: 'Arte',
    storia_arte: 'Storia dell\'Arte',
    disegno: 'Disegno',
    scienze: 'Scienze',
    agronomia: 'Agronomia',
    chimica: 'Chimica'
  }
  return displayNames[subject] || subject
}
