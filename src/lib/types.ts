import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  figosita: number
  stanchezza: number
  reputazione: number
  carisma: number
  intelligenza: number
  coattaggine: number
  muscoli: number
  soldi: number
}

export type ReputationLevel =
  | 'Sfigato Totale'
  | 'Conosciuto'
  | 'Popolare'
  | 'Leggenda del Quartiere'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type PlayerGender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export type SocialBondType = 'conoscente' | 'amico' | 'amico_stretto'

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  tecnico: {
    matematica: 1.5,
    fisica: 1.4,
    informatica: 1.3,
    italiano: 1.0,
    inglese: 1.0,
    storia: 0.8,
    edFisica: 0.5,
  },
  agraria: {
    scienze: 1.5,
    biologia: 1.4,
    chimica: 1.3,
    italiano: 1.0,
    inglese: 1.0,
    matematica: 0.9,
    edFisica: 0.6,
  },
  artistico: {
    disegno: 1.5,
    storiaArte: 1.4,
    italiano: 1.2,
    inglese: 1.0,
    matematica: 0.7,
    scienze: 0.6,
    edFisica: 0.5,
  },
}

export interface GameDate {
  day: number
  month: number
  year: number
}

export interface SchoolYear {
  isSchoolPeriod: boolean
  currentYear: number
  schoolEndDate: GameDate
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export interface GameTime {
  currentDate: GameDate
  age: number
  schoolYear: SchoolYear
  currentPhase: DayPhase
  phaseActionsRemaining: number
  maxActionsPerPhase: number
  extraActions?: number
}

export type DayType = 'feriale' | 'sabato' | 'domenica'

export type ExamDifficulty = 'facile' | 'normale' | 'difficile' | 'brutale'

export interface ScheduledExam {
  id: string
  subject: string
  difficulty: ExamDifficulty
  isPrepared: boolean
  announced: boolean
}

export type ThemeVariant = 'default' | 'dark' | 'green'

export interface PlayerProfile {
  name: string
  gender: PlayerGender
  traits?: TraitId[]
}

export interface GamePreferences {
  theme: ThemeVariant
}

export interface SchoolRecord {
  assenze: number
  condotta: number
  note: number
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays: number
}

export interface Friend {
  id: string
  name: string
  type: FriendType
  affinity: number
  intelligence?: number
  charisma?: number
  bondType: SocialBondType
  lastInteraction?: GameDate
}

export interface Relationship {
  id: string
  name: string
  attractiveness: number
  affinity: number
  metAt?: string
}

export type SubjectGrades = Record<string, number>

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameTime: GameTime
  gameOver: boolean
  gameOverReason: string
  schoolType?: SchoolType
  playerProfile?: PlayerProfile
  friends?: Friend[]
  relationships?: Relationship[]
  scheduledExams?: ScheduledExam[]
  schoolRecord?: SchoolRecord
}

export const DEFAULT_STATS: GameStats = {
  figosita: 50,
  carisma: 10,
  intelligenza: 50,
  stanchezza: 0,
  reputazione: 0,
  coattaggine: 20,
  muscoli: 30,
  soldi: 100,
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  condotta: 8.0,
  note: 0,
  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0,
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,
  grades: {},
  gameTime: {
    currentDate: { day: 15, month: 9, year: 2024 },
    age: 14,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolEndDate: { day: 10, month: 6, year: 2025 },
    },
    currentPhase: 'mattina',
    phaseActionsRemaining: 3,
    maxActionsPerPhase: 3,
  },
  gameOver: false,
  gameOverReason: '',
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const subjects = Object.keys(SUBJECT_WEIGHTS[schoolType])
  return subjects.reduce((acc, subject) => {
    acc[subject] = 6.0
    return acc
  }, {} as SubjectGrades)
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
    informatica: 'Informatica',
    italiano: 'Italiano',
    inglese: 'Inglese',
    storia: 'Storia',
    edFisica: 'Ed. Fisica',
    scienze: 'Scienze',
    biologia: 'Biologia',
    chimica: 'Chimica',
    disegno: 'Disegno',
    storiaArte: 'Storia dell\'Arte',
  }
  return displayNames[subject] || subject
}
