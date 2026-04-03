export interface GameStats {
  coattaggine: number
  muscoli: number
  soldi: number
  media: number
  stanchezza: number
  figosita: number
  reputazione: number
}

export type ReputationLevel = 
  | 'Sfigato Totale' 
  | 'Nessuno' 
  | 'Coatto Base' 
  | 'Rispettato' 
  | 'Leggenda del Quartiere'

export interface SubjectGrades {
  matematica: number
  italiano: number
  storia: number
  edFisica: number
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
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameTime: GameTime
  gameOver: boolean
  gameOverReason: string
}

export const DEFAULT_STATS: GameStats = {
  coattaggine: 50,
  muscoli: 50,
  soldi: 100,
  media: 6,
  stanchezza: 0,
  figosita: 50,
  reputazione: 50
}

export const DEFAULT_GRADES: SubjectGrades = {
  matematica: 6,
  italiano: 6,
  storia: 6,
  edFisica: 6
}

export const DEFAULT_GAME_TIME: GameTime = {
  currentDate: { day: 15, month: 9, year: 2024 },
  actionsRemaining: 3,
  maxActionsPerDay: 3,
  schoolYear: {
    currentYear: 1,
    isSchoolPeriod: true,
    schoolStartDate: { day: 15, month: 9, year: 2024 },
    schoolEndDate: { day: 10, month: 6, year: 2025 },
    reportCardDate: { day: 10, month: 6, year: 2025 }
  },
  age: 14
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,
  grades: DEFAULT_GRADES,
  gameTime: DEFAULT_GAME_TIME,
  gameOver: false,
  gameOverReason: ''
}
