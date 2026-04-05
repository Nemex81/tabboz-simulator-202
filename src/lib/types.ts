import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  figosita: number
  media: number
  muscoli: number
  carisma: numb
  coattaggine: number
}
  carisma: number
  | 'Sfigato To
  stanchezza: number
 

export type ReputationLevel = 
  | 'Sfigato Totale' 

  | 'Conosciuto'
export type Relat
  | 'Leggenda del Quartiere'

export type SchoolType = 'tecnico' | 'agraria' | 'artistico'

export type PlayerGender = 'maschio' | 'femmina'

export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export type RelationshipTier =
  affinita: numbe
  | 'conoscente'
}
  | 'amico_stretto'
  | 'migliore_amico'
  | 'trombamica'
  preference: '

export type SocialBondType = 'amicizia' | 'romantico'

}
  id: string
  name: string
  type: FriendType
  sospensioni: num
  unlocked: boolean
  bondType?: SocialBondType
}

export interface Relationship {
  id: string
  name: string
  elettronica: number
  preference: 'muscoli' | 'figosita' | 'intelligenza'
  isActive: boolean
 

export interface SubjectGrades {
  [key: string]: number
 

export interface SchoolRecord {
  assenze: number
  condotta: number
  note: number
  sospensioni: number
    agronomia: 1.3,
    chimica: 1.2,
    ecologia: 1.0,
 

  artistico: {
    italiano: 1.5,
    disegno: 1.3,
    scultura: 1.
    grafica: 1.0,
    storia: 0.8,
  }

  day: number
  year: number

  currentYear: numbe
 

}
export interface Gam
  actionsRemaining
  age: number
  lastPaghettaDate
}
export type DayPha
export type DayType
export interface D
  timeRange: stri
}
export interface G
 

export interface EventConstraint {
  allowedDayTypes: D
  minSchoolYear?: 
}
export type ExamDi
export interface 
  subject: string
  isPrepared: boolea
}
export type ThemeV
export interface 
  gender: PlayerGender
}

}
export inter
  grades: SubjectGra
  gameOver: boolea
  schoolType?: School
  friends?: Friend[]
  scheduledExams?
  schoolRecord?: Sc

  coattaggine: 5
  media: 6,
  figosita: 50,
  intelligenza: 10
  ca

  assenze: 0,
  note: 0,
    agronomia: 1.3,
    biologia: 1.2,
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










































































































