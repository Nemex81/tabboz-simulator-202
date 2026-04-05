import type { TraitId } from '@/lib/character-traits'

export interface GameStats {
  figosita: number
  coattaggine: numbe
  soldi: number

  | 'Sfigato Totale'
  | 'Popolare'





  tecnico: {
    fisica: 1.4,
    italiano: 
    storia: 0.8,

    scienze: 1.5,

    inglese: 1.0,

  artistico: {

    inglese: 1.0,

  },

  day: number
  year: number

  isSchoolPeriod: 
  schoolEndDate: 


  cu
  schoolYear
  phaseActionsRem
  extraActions?: n



  id: string
  difficulty: Exam
  an


  name: string
  traits?: TraitId

  theme: ThemeVarian

  assenze: number
  no
 

export interface Friend {
  name: strin
  affinity: num
  charisma?: n
 

  id: string
  attractiveness: number
  metAt?: string



  gameTime: GameTime

  playerProfile?: PlayerPro
  relationships?: Relat
  schoolRecor

  figosita: 50,
  intelligenza: 50,
  reputazione: 0,
  muscoli: 30,
}

  condotta: 8.0,

  consecutiveGoodDays: 0,

  stats: DEFAULT_STATS,
  gameTime: 
    age: 14,
      currentYear: 1,
      schoolEndDate: 
    currentPhase: 'm
 

}

  return subjects.reduce((acc, s
    return acc
  gender: PlayerGender
export function getS
}

export interface GamePreferences {
  theme: ThemeVariant
}

  }
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














































