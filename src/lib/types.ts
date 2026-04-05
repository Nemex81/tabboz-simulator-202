import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  figosita: number
  media: number
  muscoli: number
  carisma: number
  coattaggine: number
  stanchezza: number
  soldi: number
  intelligenza: number
  reputazione: number
}

export type ReputationLevel = 
  | 'Sfigato Totale' 
  | 'Nullità'
  | 'Sconosciuto'
  | 'Conosciuto'
  | 'Popolare'
  | 'Leggenda del Quartiere'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type PlayerGender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export type RelationshipTier =
  | 'conoscente'
  | 'simpatia'
  | 'amico_stretto'
  | 'migliore_amico'
  | 'trombamica'

export type SocialBondType = 'amicizia' | 'romantico'

export interface Friend {
  id: string
  name: string
  type: FriendType
  unlocked: boolean
  bondType?: SocialBondType
}

export interface Relationship {
  id: string
  name: string
  affinita: number
  preference: 'muscoli' | 'figosita' | 'intelligenza'
  isActive: boolean
}

export interface SubjectGrades {
  [key: string]: number
}

export interface SchoolRecord {
  assenze: number
  condotta: number
  note: number
  sospensioni: number
  wentToSchoolToday: boolean
  consecutiveGoodDays: number
}

export const SUBJECT_WEIGHTS: Record<SchoolType, Record<string, number>> = {
  tecnico: {
    matematica: 1.5,
    fisica: 1.4,
    informatica: 1.4,
    elettronica: 1.3,
    sistemi: 1.3,
    telecomunicazioni: 1.2,
    italiano: 1.0,
    inglese: 1.0,
    storia: 0.8,
    edFisica: 0.5,
  },
  agraria: {
    matematica: 1.4,
    biologia: 1.3,
    agronomia: 1.3,
    chimica: 1.2,
    zootecnia: 1.1,
    ecologia: 1.0,
    botanica: 1.0,
    storia: 0.8,
    inglese: 0.9,
    edFisica: 0.5,
  },
  artistico: {
    matematica: 1.5,
    italiano: 1.5,
    storiaArte: 1.4,
    disegno: 1.3,
    pittura: 1.2,
    scultura: 1.2,
    anatomia: 1.1,
    grafica: 1.0,
    architettura: 1.0,
    storia: 0.8,
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
  age: number
}

export interface GamePreferences {
  theme: ThemeVariant
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
  traits?: TraitId[]
  schoolRecord?: SchoolRecord
}

export const DEFAULT_STATS: GameStats = {
  coattaggine: 50,
  muscoli: 50,
  media: 6,
  stanchezza: 0,
  figosita: 50,
  soldi: 100,
  intelligenza: 10,
  reputazione: 50,
  carisma: 10,
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
    currentDate: { day: 15, month: 9, year: 2026 },
    actionsRemaining: 20,
    maxActionsPerDay: 20,
    age: 14,
    schoolYear: {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2026 },
      schoolEndDate: { day: 10, month: 6, year: 2027 },
      reportCardDate: { day: 10, month: 6, year: 2027 },
    },
  },
  gameOver: false,
  gameOverReason: '',
}

export function getDefaultGradesForSchoolType(schoolType: SchoolType): SubjectGrades {
  const weights = SUBJECT_WEIGHTS[schoolType]
  const grades: SubjectGrades = {}
  
  for (const subject in weights) {
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
    sistemi: 'Sistemi',
    telecomunicazioni: 'Telecomunicazioni',
    italiano: 'Italiano',
    inglese: 'Inglese',
    storia: 'Storia',
    edFisica: 'Ed. Fisica',
    biologia: 'Biologia',
    agronomia: 'Agronomia',
    chimica: 'Chimica',
    zootecnia: 'Zootecnia',
    ecologia: 'Ecologia',
    botanica: 'Botanica',
    storiaArte: 'Storia dell\'Arte',
    disegno: 'Disegno',
    pittura: 'Pittura',
    scultura: 'Scultura',
    anatomia: 'Anatomia Artistica',
    grafica: 'Grafica',
    architettura: 'Architettura',
  }
  
  return displayNames[subject] || subject
}
