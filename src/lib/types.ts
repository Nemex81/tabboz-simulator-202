export interface GameStats {
  coattaggine: number
  muscoli: number
  soldi: number
  media: number
  stanchezza: number
  figosita: number
}

export interface SubjectGrades {
  matematica: number
  italiano: number
  storia: number
  edFisica: number
}

export interface GameState {
  stats: GameStats
  grades: SubjectGrades
  gameOver: boolean
  gameOverReason: string
}

export const DEFAULT_STATS: GameStats = {
  coattaggine: 50,
  muscoli: 50,
  soldi: 100,
  media: 6,
  stanchezza: 0,
  figosita: 50
}

export const DEFAULT_GRADES: SubjectGrades = {
  matematica: 6,
  italiano: 6,
  storia: 6,
  edFisica: 6
}

export const DEFAULT_GAME_STATE: GameState = {
  stats: DEFAULT_STATS,
  grades: DEFAULT_GRADES,
  gameOver: false,
  gameOverReason: ''
}
