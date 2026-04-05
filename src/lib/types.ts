import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  figosita: number
  carisma: numb
  muscoli: number
  soldi: number
  coattaggine: number
  stanchezza: number
  soldi: number
  intelligenza: number
  reputazione: number
 

export type ReputationLevel = 
  | 'Sfigato Totale' 
export type P
  | 'Sconosciuto'
  | 'Conosciuto'
  | 'Popolare'
  | 'Leggenda del Quartiere'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type PlayerGender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

  bondType?: SocialBondType
  | 'conoscente'
export interfa
  | 'amico_stretto'
}
export const SUB

    informatica: 1.4,

    italiano: 1.0,
    storia: 
  },
    matematica: 1.
    agronomia: 1.3,
    zootecnia: 1.1,
 

  },
    matemati
    storiaArte
    pittura: 1.2,
    anatomia: 1.1,
    architettura: 1
 

export interface GameDate {
  month: number
}

  isSchoolPeriod: boolean
  schoolEndDate: 
  schoolType?: Sch

  currentDate: GameDa
  maxActionsPerDay: number
  schoolYear: SchoolYear
 



  label: string
  maxActions: nu

  currentPhase: DayPh
  phaseActionsRem

  allowedPhases: D
  requiresSchoolP
  blockedWhenExh


  id: string
  difficulty: ExamDi
  announced: boole
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
    italiano: 
  gender: PlayerGender
    edFisica:
}

export interface GamePreferences {
  theme: ThemeVariant
}

export interface GameState {
    grafica: 'Graf
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


export const DEFAULT_STATS: GameStats = {
  coattaggine: 50,

  media: 6,

  figosita: 50,

  intelligenza: 10,

  carisma: 10,


export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  condotta: 8.0,
  note: 0,
  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0,






























































