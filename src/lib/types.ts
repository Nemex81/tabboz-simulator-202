import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  figosita: number
  soldi: number
  carisma: number
  coattaggine: number
  media: number
  muscoli: number
  intelligenza: number
  reputazione: number
  stanchezza: number
}

export type ReputationLevel =
  | 'Sfigato Totale'
  | 'Invisibile'
  | 'Coatto Base'
  | 'Rispettato'
  | 'Popolare'
  | 'Leggenda del Quartiere'

export type SchoolType = 'liceo' | 'tecnico' | 'professionale' | 'artistico'

export type SubjectGrades = {
  [subject: string]: number
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  liceo: {
    matematica: 1.5,
    italiano: 1.5,
    fisica: 1.2,
    inglese: 1.0,
    storia: 1.0,
    latino: 1.3,
    filosofia: 1.1,
    scienze: 1.0,
    edFisica: 0.7,
    arte: 0.8
  },
  tecnico: {
    matematica: 1.5,
    fisica: 1.3,
    italiano: 1.0,
    storia: 0.8,
    informatica: 1.4,
    scienze: 1.0,
    elettronica: 1.3,
    inglese: 1.0,
    edFisica: 0.7
  },
  professionale: {
    matematica: 1.0,
    italiano: 1.0,
    laboratorio: 1.5,
    tecnologia: 1.4,
    economia: 1.2,
    inglese: 0.9,
    storia: 0.8,
    edFisica: 0.7
  },
  artistico: {
    arte: 1.7,
    disegno: 1.7,
    storia_arte: 1.5,
    italiano: 1.2,
    matematica: 0.8,
    inglese: 1.0,
    edFisica: 0.7
  }
}

export interface SchoolYear {
  currentYear: number
  isSchoolPeriod: boolean
  schoolEndDate: { day: number; month: number }
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'
export type DayType = 'feriale' | 'sabato' | 'domenica'

export interface GameTime {
  currentDate: GameDate
  schoolYear: SchoolYear
  currentPhase: DayPhase
  age: number
  phaseActionsRemaining: number
  extraActions?: number
}

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export interface ScheduledExam {
  subject: string
  daysUntil: number
  isPrepared: boolean
  difficulty: ExamDifficulty
  announced: boolean
}

export type PlayerGender = 'maschio' | 'femmina'

export interface PlayerProfile {
  name: string
  gender: PlayerGender
  traits?: TraitId[]
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface SchoolRecord {
  assenze: number
  note: number
  condotta: number
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays: number
}

export interface Friend {
  id: string
  name: string
  affinity: number
  intelligence?: number
  charisma?: number
  lastInteraction?: number
}

export interface Relationship {
  id: string
  name: string
  attractiveness: number
  successChance: number
  metAt?: string
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameTime: GameTime
  gameOver: boolean
  gameOverReason: string
  schoolType?: SchoolType
  playerProfile?: PlayerProfile
  friends?: Friend[]
  scheduledExams?: ScheduledExam[]
  schoolRecord?: SchoolRecord
}

export const DEFAULT_STATS: GameStats = {
  figosita: 20,
  soldi: 50,
  carisma: 10,
  coattaggine: 50,
  intelligenza: 50,
  reputazione: 0,
  muscoli: 30,
  stanchezza: 0,
  media: 6
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  note: 0,
  condotta: 8.0,
  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,
  grades: {
    matematica: 6,
    italiano: 6,
    storia: 6,
    edFisica: 6
  },
  gameTime: {
    age: 14,
    currentDate: { day: 15, month: 9, year: 2025 },
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolEndDate: { day: 10, month: 6 }
    },
    currentPhase: 'mattina',
    phaseActionsRemaining: 2
  },
  gameOver: false,
  gameOverReason: ''
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const baseGrade = 6
  const subjects: Record<SchoolType, string[]> = {
    liceo: ['matematica', 'italiano', 'fisica', 'inglese', 'storia', 'latino', 'filosofia', 'scienze', 'edFisica', 'arte'],
    tecnico: ['matematica', 'fisica', 'italiano', 'storia', 'informatica', 'scienze', 'elettronica', 'inglese', 'edFisica'],
    professionale: ['matematica', 'italiano', 'laboratorio', 'tecnologia', 'economia', 'inglese', 'storia', 'edFisica'],
    artistico: ['arte', 'disegno', 'storia_arte', 'italiano', 'matematica', 'inglese', 'edFisica']
  }

  return subjects[schoolType].reduce((acc, subject) => {
    acc[subject] = baseGrade
    return acc
  }, {} as SubjectGrades)
}

export function getSubjectDisplayName(subject: string): string {
  const names: Record<string, string> = {
    matematica: 'Matematica',
    italiano: 'Italiano',
    fisica: 'Fisica',
    inglese: 'Inglese',
    storia: 'Storia',
    latino: 'Latino',
    filosofia: 'Filosofia',
    scienze: 'Scienze',
    edFisica: 'Ed. Fisica',
    arte: 'Arte',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    laboratorio: 'Laboratorio',
    tecnologia: 'Tecnologia',
    economia: 'Economia',
    disegno: 'Disegno',
    storia_arte: 'Storia dell\'Arte'
  }
  return names[subject] || subject
}

export interface GamePreferences {
  theme: ThemeVariant
}
