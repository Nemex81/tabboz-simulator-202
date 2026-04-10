import type { BinaryGenderCode, GameStats, Relationship } from '@/lib/types'
import { DEFAULT_SEXUAL_ORIENTATION } from '@/lib/gender-utils'

export const createRelationshipSourceKey = (prefix: string = 'relationship'): string => {
  const randomUuid = globalThis.crypto?.randomUUID?.()
  if (randomUuid) {
    return `${prefix}:${randomUuid}`
  }

  const randomPart = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
  return `${prefix}:${Date.now()}_${randomPart}`
}

export const FEMALE_PARTNER_NAMES = [
  'Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer',
  'Melissa', 'Cristina', 'Nicole', 'Daniela', 'Federica', 'Valentina'
]

export const MALE_PARTNER_NAMES = [
  'Davide', 'Mirko', 'Cristian', 'Fabio', 'Luca', 'Kevin',
  'Daniele', 'Marco', 'Simone', 'Andrea', 'Alessandro', 'Matteo'
]

export const generateRandomRelationship = (
  targetGender: BinaryGenderCode = 'F',
  metAt?: Relationship['metAt'],
  targetOrientation = DEFAULT_SEXUAL_ORIENTATION,
): Relationship => {
  const namePool = targetGender === 'M' ? MALE_PARTNER_NAMES : FEMALE_PARTNER_NAMES
  const name = namePool[Math.floor(Math.random() * namePool.length)]
  const difficulties: Relationship['difficulty'][] = ['facile', 'media', 'difficile']
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
  const preferences: Relationship['preference'][] = ['muscoli', 'figosita', 'intelligenza']
  const preference = preferences[Math.floor(Math.random() * preferences.length)]
  const relationshipId = `relationship_${Date.now()}_${Math.random()}`

  return {
    id: relationshipId,
    name,
    sourceKey: createRelationshipSourceKey('relationship'),
    sourceType: 'generated_interest',
    metAt,
    gender: targetGender,
    orientamentoSessuale: targetOrientation,
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
      return 'Apprezza chi ha un fisico atletico'
    case 'figosita':
      return 'Apprezza chi ha stile e presenza'
    case 'intelligenza':
      return 'Apprezza chi e intelligente'
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