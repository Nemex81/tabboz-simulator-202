import { GameStats, ReputationLevel } from '@/lib/types'

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

export const getReputationLevel = (reputazione: number): ReputationLevel => {
  if (reputazione < 20) return 'Sfigato Totale'
  if (reputazione < 40) return 'Nessuno'
  if (reputazione < 60) return 'Coatto Base'
  if (reputazione < 80) return 'Rispettato'
  return 'Leggenda del Quartiere'
}

export const calculateReputationFromStats = (stats: GameStats): number => {
  const coattaggineWeight = 0.25
  const muscoliWeight = 0.15
  const figositaWeight = 0.2
  const soldiWeight = 0.1
  const mediaWeight = 0.1
  const carismaWeight = 0.2
  
  const reputationScore = 
    (stats.coattaggine * coattaggineWeight) +
    (stats.muscoli * muscoliWeight) +
    (stats.figosita * figositaWeight) +
    (Math.min(stats.soldi / 10, 100) * soldiWeight) +
    (Math.min(stats.media * 10, 100) * mediaWeight) +
    (stats.carisma * carismaWeight)
  
  return clampStat(reputationScore)
}

export const calculateStudyGradeIncrease = (intelligenza: number, hasFriendBonus: boolean = false): number => {
  const baseIncrease = 0.2 * (intelligenza / 50)
  const friendMultiplier = hasFriendBonus ? 1.5 : 1
  return Number((baseIncrease * friendMultiplier).toFixed(1))
}

export const calculateSocialSuccessChance = (
  stats: GameStats,
  baseStats: { figosita?: number; muscoli?: number; intelligenza?: number },
  carismaBoost: boolean = true
): number => {
  let totalChance = 0
  let statCount = 0
  
  if (baseStats.figosita) {
    totalChance += stats.figosita * 0.4
    statCount++
  }
  if (baseStats.muscoli) {
    totalChance += stats.muscoli * 0.3
    statCount++
  }
  if (baseStats.intelligenza) {
    totalChance += stats.intelligenza * 0.3
    statCount++
  }
  
  if (carismaBoost && stats.carisma > 0) {
    totalChance += stats.carisma * 0.3
  }
  
  return Math.min(95, Math.max(5, totalChance))
}

export const canAvoidNegativeEventWithCharisma = (carisma: number): boolean => {
  if (carisma > 70) {
    return randomChance(20)
  }
  return false
}

export const getReputationEventModifier = (reputazione: number): {
  encounterChanceMultiplier: number
  positiveOutcomeBonus: number
  respectBonus: number
} => {
  const level = getReputationLevel(reputazione)
  
  switch (level) {
    case 'Sfigato Totale':
      return { 
        encounterChanceMultiplier: 1.5, 
        positiveOutcomeBonus: -20,
        respectBonus: 0
      }
    case 'Nessuno':
      return { 
        encounterChanceMultiplier: 1.2, 
        positiveOutcomeBonus: -10,
        respectBonus: 0
      }
    case 'Coatto Base':
      return { 
        encounterChanceMultiplier: 1.0, 
        positiveOutcomeBonus: 0,
        respectBonus: 5
      }
    case 'Rispettato':
      return { 
        encounterChanceMultiplier: 0.8, 
        positiveOutcomeBonus: 15,
        respectBonus: 10
      }
    case 'Leggenda del Quartiere':
      return { 
        encounterChanceMultiplier: 0.5, 
        positiveOutcomeBonus: 30,
        respectBonus: 20
      }
  }
}
