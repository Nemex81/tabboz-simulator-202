import type { GameStats, Relationship } from '@/lib/types'

export const GIRL_NAMES = [
  'Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer',
  'Melissa', 'Cristina', 'Nicole', 'Daniela', 'Federica', 'Valentina'
]

export const generateRandomRelationship = (): Relationship => {
  const name = GIRL_NAMES[Math.floor(Math.random() * GIRL_NAMES.length)]
  const difficulties: Relationship['difficulty'][] = ['facile', 'media', 'difficile']
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
  const preferences: Relationship['preference'][] = ['muscoli', 'figosita', 'intelligenza']
  const preference = preferences[Math.floor(Math.random() * preferences.length)]

  return {
    id: `relationship_${Date.now()}_${Math.random()}`,
    name,
    difficulty,
    preference,
    relationshipLevel: 0,
    isActive: false,
  }
}

export const calculateRelationshipSuccess = (
  stats: GameStats,
  relationship: Relationship
): number => {
  let baseChance = 30

  switch (relationship.difficulty) {
    case 'facile':
      baseChance = 60
      break
    case 'media':
      baseChance = 40
      break
    case 'difficile':
      baseChance = 20
      break
  }

  const statValue = relationship.preference === 'muscoli'
    ? stats.muscoli
    : relationship.preference === 'figosita'
      ? stats.figosita
      : stats.intelligenza

  const statBonus = Math.floor(statValue / 5)
  const carismaBonus = Math.floor(stats.carisma / 3)

  return Math.min(95, baseChance + statBonus + carismaBonus)
}

export const getRelationshipPreferenceText = (
  preference: Relationship['preference']
): string => {
  switch (preference) {
    case 'muscoli':
      return 'Le piacciono i MUSCOLOSI'
    case 'figosita':
      return 'Le piacciono i FIGHI'
    case 'intelligenza':
      return 'Le piacciono gli INTELLIGENTI'
  }
}

export const getDifficultyText = (difficulty: Relationship['difficulty']): string => {
  switch (difficulty) {
    case 'facile':
      return 'FACILE da conquistare'
    case 'media':
      return 'Difficoltà MEDIA'
    case 'difficile':
      return 'DIFFICILISSIMA da conquistare'
  }
}