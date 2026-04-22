import { GameStats, SubjectGrades, SchoolType } from '@/lib/types'
import { getGradeWeight, getActiveSubjectsForYear, SubjectDefinition } from '@/lib/subjects'
import { STAT_CAPS, REPUTATION_WEIGHTS } from '@/lib/game-balance.constants'

/**
 * Clamp di un valore statistico.
 * - clampStat(v)               → [0, 100]
 * - clampStat(v, 0, 200)       → [0, 200]
 * - clampStat(v, 'soldi')      → [0, 1000]  (legge STAT_CAPS)
 * - clampStat(v, 'media')      → [0, 10]
 */
export function clampStat(value: number, minOrKey?: number | keyof typeof STAT_CAPS, max?: number): number {
  if (typeof minOrKey === 'string') {
    const caps = STAT_CAPS[minOrKey] ?? STAT_CAPS.default
    return Math.max(caps.min, Math.min(caps.max, value))
  }
  return Math.max(minOrKey ?? 0, Math.min(max ?? 100, value))
}

// A1 — Guardia centralizzata per le spese
export const spendMoney = (
  currentSoldi: number,
  amount: number,
  actionName: string
): { success: boolean; newSoldi: number; errorMessage?: string } => {
  if (amount < 0) {
    return { success: false, newSoldi: currentSoldi, errorMessage: 'Importo non valido' }
  }
  if (currentSoldi < amount) {
    return {
      success: false,
      newSoldi: currentSoldi,
      errorMessage: `Non hai abbastanza soldi per "${actionName}". Servono ${amount}€, hai ${currentSoldi}€.`
    }
  }
  return { success: true, newSoldi: currentSoldi - amount }
}

// A5 — Generatore random con seed LCG (Linear Congruential Generator)
let _seed = Date.now()

export const initRandom = (seed: number): void => {
  _seed = seed >>> 0
}

export const seededRandom = (): number => {
  _seed = ((_seed * 1664525 + 1013904223) & 0xffffffff) >>> 0
  return _seed / 0xffffffff
}

export const calculateMedia = (grades: { [key: string]: number }): number => {
  const values = Object.values(grades)
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  const average = sum / values.length
  return Number(average.toFixed(1))
}

// Media pesata per materia (Step 2): materie fondamentali contano di più
export const calculateWeightedMedia = (grades: SubjectGrades, schoolType: SchoolType | null): number => {
  if (!schoolType) return calculateMedia(grades)
  const entries = Object.entries(grades)
  if (entries.length === 0) return 0
  const allSubjects = getActiveSubjectsForYear(schoolType, 1) // fallback year=1; caller passa voti già filtrati
  let totalWeight = 0
  let weightedSum = 0
  for (const [subject, grade] of entries) {
    const subjectDef = allSubjects.find(s => s.key === subject)
    const weight = subjectDef ? getGradeWeight(subjectDef, schoolType) : 1.0
    totalWeight += weight
    weightedSum += grade * weight
  }
  return Number((weightedSum / totalWeight).toFixed(2))
}

// Restituisce le N materie con voto più basso (Step 2: selezione pesata negli eventi)
export const getWorstSubjects = (grades: SubjectGrades, count: number = 3): string[] => {
  const subjects = Object.keys(grades)
  if (subjects.length === 0) return []
  return [...subjects]
    .sort((a, b) => (grades[a] ?? 10) - (grades[b] ?? 10))
    .slice(0, Math.min(count, subjects.length))
}

export const randomChance = (percentage: number): boolean => {
  return seededRandom() * 100 < percentage
}

export function getGPASubjectsForYear(schoolType: SchoolType, year: number): SubjectDefinition[] {
  return getActiveSubjectsForYear(schoolType, year).filter(s => s.countsForGPA)
}

export function archiveYearGrades(
  grades: SubjectGrades,
  schoolType: SchoolType,
  fromYear: number
): { archived: SubjectGrades; next: SubjectGrades } {
  const nextYearSubjectKeys = new Set(
    getActiveSubjectsForYear(schoolType, fromYear + 1).map(s => s.key)
  )
  const archived: SubjectGrades = {}
  const next: SubjectGrades = {}
  for (const [key, value] of Object.entries(grades)) {
    if (nextYearSubjectKeys.has(key)) {
      next[key] = value
    } else {
      archived[key] = value
    }
  }
  return { archived, next }
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

export const getReputationLevel = (reputazione: number): { label: string; description: string } => {
  if (reputazione < 20) return { label: 'Sfigato Totale', description: 'Nessuno ti conosce. Sei un fantasma.' }
  if (reputazione < 40) return { label: 'Nessuno', description: 'Qualcuno sa chi sei, ma non abbastanza.' }
  if (reputazione < 60) return { label: 'Coatto Base', description: 'Hai rispetto nel quartiere.' }
  if (reputazione < 80) return { label: 'Rispettato', description: 'Tutti ti conoscono. Hai peso.' }
  return { label: 'Leggenda del Quartiere', description: 'Sei una leggenda. Le storie su di te durano anni.' }
}

export const calculateReputationFromStats = (stats: GameStats): number => {
  const reputationScore =
    (stats.coattaggine * REPUTATION_WEIGHTS.coattaggine) +
    (stats.muscoli * REPUTATION_WEIGHTS.muscoli) +
    (stats.figosita * REPUTATION_WEIGHTS.figosita) +
    (clampStat(stats.soldi, 'soldi') / 10 * REPUTATION_WEIGHTS.soldi) +
    (clampStat(stats.media, 'media') * 10 * REPUTATION_WEIGHTS.media) +
    (stats.carisma * REPUTATION_WEIGHTS.carisma)

  return clampStat(reputationScore)
}

export const calculateStudyGradeIncrease = (intelligenza: number, hasFriendBonus: boolean = false): number => {
  const baseIncrease = 0.2 * (intelligenza / 50)
  const friendMultiplier = hasFriendBonus ? 1.5 : 1
  return Number((baseIncrease * friendMultiplier).toFixed(2))
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
  
  switch (level.label) {
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
    default:
      return { encounterChanceMultiplier: 1.0, positiveOutcomeBonus: 0, respectBonus: 0 }
  }
}

export function getMentalStateModifiers(stress: number, morale: number): {
  studyEfficiencyMultiplier: number
  socialSuccessBonus: number
  carismaBonus: number
  isDiscoBlocked: boolean
  crisiNervosa: boolean
} {
  const studyEfficiencyMultiplier =
    stress > 80 ? 0.6 :
    stress > 60 ? 0.8 :
    1.0

  const socialSuccessBonus =
    morale > 80 ? 10 :
    morale < 30 ? -15 :
    0

  const carismaBonus = morale > 80 ? 10 : 0

  const isDiscoBlocked = morale < 20
  const crisiNervosa = stress > 80 && morale < 30

  return { studyEfficiencyMultiplier, socialSuccessBonus, carismaBonus, isDiscoBlocked, crisiNervosa }
}
