import { GameStats } from '@/lib/types'

export const clampStat = (value: number, min: number = 0, max: number = 100): number => {
  return Math.max(min, Math.min(max, value))
}

export const calculateMedia = (grades: { [key: string]: number }): number => {
  const values = Object.values(grades)
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  const average = sum / values.length
  return Number(average.toFixed(1))
}

export const randomChance = (percentage: number): boolean => {
  return Math.random() * 100 < percentage
}

export const checkGameOver = (stats: GameStats): { isOver: boolean; reason: string } => {
  if (stats.media < 4) {
    return { isOver: true, reason: 'SEI STATO BOCCIATO! Media sotto il 4. Torna a settembre, sfigato!' }
  }
  return { isOver: false, reason: '' }
}

export const announceToScreenReader = (message: string, element: HTMLElement | null) => {
  if (element) {
    element.textContent = message
  }
}
