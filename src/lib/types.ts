import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  figosita: number
  carisma: number
  muscoli: number
  soldi: number
  coattaggine: number
  stanchezza: number
  intelligenza: number
  reputazione: number
}

export type ReputationLevel = 
  | 'Sfigato Totale' 
  | 'Sconosciuto'
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
    informatica: 1.4,
    elettronica: 1.3,
    meccanica: 1.2,
    italiano: 1.0,
    storia: 0.8,
    inglese: 0.9,
    edFisica: 0.5,
  },
  agraria: {
    matematica: 1.3,
    agronomia: 1.4,
    chimica: 1.3,
    zootecnia: 1.2,
    ecologia: 1.1,
    botanica: 1.1,
    italiano: 1.0,
    storia: 0.8,
    inglese: 0.9,
    edFisica: 0.5,
  },
  artistico: {
    matematica: 1.0,
    italiano: 1.3,
    storiaArte: 1.5,
    disegno: 1.4,
    pittura: 1.3,
    scultura: 1.2,
    anatomia: 1.1,
    grafica: 1.1,
    architettura: 1.0,
    storia: 0.9,
    inglese: 0.8,
    edFisica: 0.5,
  }
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
  schoolType?: SchoolType
}

export interface GameTime {
  currentDate: GameDate
  actionsRemaining: number
  maxActionsPerDay: number
  age: number
  schoolYear: SchoolYear
  lastPaghettaDate?: GameDate
  extraActions?: number
}

export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

export interface DayPhaseConfig {
  label: string
  timeRange: string
  maxActions: number
}

export interface GameTimeV2 extends GameTime {
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
}

export interface EventConstraint {
  allowedPhases: DayPhase[]
  allowedDayTypes: DayType[]
  requiresSchoolPeriod?: boolean
  minSchoolYear?: number
  blockedWhenExhausted?: boolean
}

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

export type SubjectGrades = Record<string, number>

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
  intelligence: number
  charisma: number
  strength: number
  bondType: SocialBondType
  metAt?: string
  lastInteraction?: GameDate
}

export interface Relationship {
  id: string
  name: string
  attractiveness: number
  intelligence: number
  affinity: number
  preferredType: 'coatto' | 'secchione' | 'sportivo' | 'carismatico'
  metAt?: string
  lastInteraction?: GameDate
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
  relationships?: Relationship[]
  scheduledExams?: ScheduledExam[]
  schoolRecord?: SchoolRecord
}

export const DEFAULT_STATS: GameStats = {
  figosita: 50,
  carisma: 10,
  muscoli: 10,
  soldi: 100,
  coattaggine: 50,
  stanchezza: 0,
  intelligenza: 10,
  reputazione: 10,
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
    actionsRemaining: 8,
    maxActionsPerDay: 8,
    age: 14,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2024 },
      schoolEndDate: { day: 10, month: 6, year: 2025 },
      reportCardDate: { day: 10, month: 6, year: 2025 },
    },
  },
  gameOver: false,
  gameOverReason: '',
  schoolRecord: DEFAULT_SCHOOL_RECORD,
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const weights = SUBJECT_WEIGHTS[schoolType]
  const grades: SubjectGrades = {}
  
  for (const subject of Object.keys(weights)) {
    grades[subject] = 6.0
  }
  
  return grades
}

export function getSubjectDisplayName(subject: string): string {
  const displayNames: Record<string, string> = {
    matematica: 'Matematica',
    fisica: 'Fisica',
    informatica: 'Informatica',
    elettronica: 'Elettronica',
    meccanica: 'Meccanica',
    italiano: 'Italiano',
    storia: 'Storia',
    inglese: 'Inglese',
    edFisica: 'Ed. Fisica',
    agronomia: 'Agronomia',
    chimica: 'Chimica',
    zootecnia: 'Zootecnia',
    ecologia: 'Ecologia',
    botanica: 'Botanica',
    storiaArte: 'Storia dell\'Arte',
    disegno: 'Disegno',
    pittura: 'Pittura',
    scultura: 'Scultura',
    anatomia: 'Anatomia',
    grafica: 'Grafica',
    architettura: 'Architettura',
  }
  
  return displayNames[subject] || subject
}
