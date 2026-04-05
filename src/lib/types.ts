import type { TraitId } from '@/lib/character-traits'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type Gender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export type RelationshipDifficulty = 'facile' | 'media' | 'difficile'

export type RelationshipPreference = 'muscoli' | 'figosita' | 'intelligenza'

export type TimePhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'weekend'

export type ExamDifficulty = 'facile' | 'media' | 'difficile'

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface GameStats {
  intelligenza: number
  coattaggine: number
  muscoli: number
  figosita: number
  carisma: number
  reputazione: number
  stanchezza: number
  soldi: number
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
  schoolStartDate: GameDate
  schoolEndDate: GameDate
  reportCardDate: GameDate
}

export interface GameTime {
  currentDate: GameDate
  age: number
  schoolYear: SchoolYear
  currentPhase: TimePhase
  actionsRemaining: number
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

export const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
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
  disegno: 'Disegno',
  storia: 'Storia'
}

export const DEFAULT_STATS: GameStats = {
  intelligenza: 10,
  coattaggine: 50,
  muscoli: 50,
  figosita: 50,
  carisma: 50,
  reputazione: 50,
  stanchezza: 0,
  soldi: 100,
  media: 6
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
    matematica: 6,
    italiano: 6,
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
    currentPhase: 'mattina' as TimePhase,
    actionsRemaining: 3
  } as GameTime
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const subjects = Object.keys(SUBJECT_WEIGHTS[schoolType])
  const grades: SubjectGrades = {}
  subjects.forEach(subject => {
    grades[subject] = 6
  })
  return grades
}

export function getSubjectDisplayName(subject: string): string {
  return SUBJECT_DISPLAY_NAMES[subject] || subject
}
