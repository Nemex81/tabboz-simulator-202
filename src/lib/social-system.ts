import { Friend, Relationship, GameStats, FriendType } from '@/lib/types'
import { randomChance } from '@/lib/game-utils'
import { LOCATION_PROB_BONUS } from '@/lib/relation-system'

export const FRIEND_NAMES = [
  'Marco', 'Luca', 'Andrea', 'Simone', 'Davide', 'Francesco', 'Alessandro', 'Matteo',
  'Giulia', 'Chiara', 'Sara', 'Elena', 'Francesca', 'Martina', 'Alice', 'Sofia'
]

export const GIRL_NAMES = [
  'Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer',
  'Melissa', 'Cristina', 'Nicole', 'Daniela', 'Federica', 'Valentina'
]

export const generateRandomFriend = (): Friend => {
  const name = FRIEND_NAMES[Math.floor(Math.random() * FRIEND_NAMES.length)]
  const friendTypes: FriendType[] = ['coatto', 'secchione', 'sportivo', 'ribelle']
  const type = friendTypes[Math.floor(Math.random() * friendTypes.length)]

  let intelligenza = Math.floor(Math.random() * 60) + 20
  if (type === 'secchione') {
    intelligenza = Math.floor(Math.random() * 30) + 70
  } else if (type === 'ribelle' || type === 'coatto') {
    intelligenza = Math.floor(Math.random() * 30) + 20
  }

  return {
    id: `friend_${Date.now()}_${Math.random()}`,
    name,
    type,
    affinita: 50,
    intelligenza,
    unlocked: true,
    originType: 'extrascolastico' as const,
  }
}

export const generateRandomRelationship = (): Relationship => {
  const name = GIRL_NAMES[Math.floor(Math.random() * GIRL_NAMES.length)]
  const difficulties: Array<'facile' | 'media' | 'difficile'> = ['facile', 'media', 'difficile']
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
  const preferences: Array<'muscoli' | 'figosita' | 'intelligenza'> = ['muscoli', 'figosita', 'intelligenza']
  const preference = preferences[Math.floor(Math.random() * preferences.length)]
  
  return {
    id: `relationship_${Date.now()}_${Math.random()}`,
    name,
    difficulty,
    preference,
    relationshipLevel: 0,
    isActive: false
  }
}

export const checkNewFriendEvent = (carisma: number, location: string): boolean => {
  const baseChance = 15
  const carismaBonus = Math.floor(carisma / 10)
  const locationBonus = LOCATION_PROB_BONUS[location] ?? 0
  const totalChance = baseChance + carismaBonus + locationBonus
  
  return randomChance(totalChance)
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
  
  const totalChance = Math.min(95, baseChance + statBonus + carismaBonus)
  
  return totalChance
}

export const getRelationshipPreferenceText = (preference: string): string => {
  switch (preference) {
    case 'muscoli':
      return 'Le piacciono i MUSCOLOSI'
    case 'figosita':
      return 'Le piacciono i FIGHI'
    case 'intelligenza':
      return 'Le piacciono gli INTELLIGENTI'
    default:
      return 'Preferenze sconosciute'
  }
}

export const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case 'facile':
      return 'FACILE da conquistare'
    case 'media':
      return 'Difficoltà MEDIA'
    case 'difficile':
      return 'DIFFICILISSIMA da conquistare'
    default:
      return 'Difficoltà sconosciuta'
  }
}

export const getFriendStudyBonus = (friends: Friend[]): number => {
  const highIntFriends = friends.filter(f => (f.intelligenza || 0) > 60)
  return highIntFriends.length > 0 ? 0.5 : 0
}
