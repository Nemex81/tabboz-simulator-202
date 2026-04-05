import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  figosita: number
  stanchezza: num
  reputazione: nu

  | 'Sfigato Totale' 
  | 'Conosciuto'
  | 'Leggenda del Quar
export type SchoolTyp
e

export type SocialBondType = '
export const SUBJECT_
    matematica: 1
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
    edFisica: 0.5,
}
export interface Ga
  month: number
}
export interface 
  isSchoolPeriod: 
  sc
  schoolType

  currentDate: Game
  maxActionsPerDa
  schoolYear: Schoo
  extraActions?: n



  label: string
  maxActions: numb

  currentPhase
  phaseActionsRemain

  allowedPhases: Day
  requiresSchoolP
  blockedWhenExha


  id: string
  difficulty: ExamDiff
  announced: boo


  n
 

  theme: ThemeVariant


  assenze: num
 

}
export interface Frie
  name: string
  affinity: number
  charisma: number
  bondType: SocialBondType
  lastInteraction?: GameD


  attractiveness: number
  affinity: number
  metAt?: string
}
export interf
  grades: SubjectGrades
  gameOver: boolean
  schoolType?: SchoolTy
 

}

  carisma: 10,

  stanchezza: 0,
  reputazione: 

  assenze: 0,
 

}
export const DEFAULT_GAM
  grades: {},
    currentDate: { day: 15, mon
 

      isSchoolPeriod: true,
      schoolEndDate: { day:
    },
  gameOver: false,
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
    anatomia: 
  gender: PlayerGender
  
}

export interface GamePreferences {
  theme: ThemeVariant
}




































export interface GameState {

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
  figosita: 50,
  carisma: 10,








export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  condotta: 8.0,
  note: 0,
  sospensioni: 0,
  wentToSchoolToday: false,
  consecutiveGoodDays: 0,





























































