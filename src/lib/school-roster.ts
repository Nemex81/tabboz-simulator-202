import type { Classmate, ClassmatePersonality, FriendType } from '@/lib/types'

const MALE_NAMES = [
  'Davide', 'Mirko', 'Cristian', 'Fabio', 'Luca', 'Kevin', 'Daniele',
  'Marco', 'Simone', 'Andrea', 'Alessandro', 'Matteo', 'Lorenzo',
  'Stefano', 'Giovanni', 'Francesco', 'Riccardo', 'Tommaso', 'Federico', 'Paolo'
]

const FEMALE_NAMES = [
  'Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer',
  'Melissa', 'Cristina', 'Nicole', 'Daniela', 'Federica', 'Valentina',
  'Alessia', 'Martina', 'Chiara', 'Elisa', 'Francesca', 'Giulia'
]

const SURNAMES = [
  'Rossi', 'Bianchi', 'Ferrari', 'Russo', 'Marino', 'Greco',
  'Romano', 'Gallo', 'Costa', 'Ricci', 'Fontana', 'Barbieri'
]

const PERSONALITY_DISTRIBUTION: Array<{ personality: ClassmatePersonality | 'altro'; percentage: number }> = [
  { personality: 'secchione', percentage: 0.20 },
  { personality: 'bullo', percentage: 0.15 },
  { personality: 'simpatico', percentage: 0.20 },
  { personality: 'silenzioso', percentage: 0.15 },
  { personality: 'sportivo', percentage: 0.10 },
  { personality: 'ribelle', percentage: 0.10 },
  { personality: 'altro', percentage: 0.10 },
]

const ALTRO_PERSONALITIES: ClassmatePersonality[] = ['nerd', 'popolare', 'timido', 'leader']

export function generateClassRoster(schoolYear: number): Classmate[] {
  const totalClassmates = randomInt(18, 25)
  const plannedCounts = calculatePersonalityCounts(totalClassmates)
  const personalities = buildPersonalityPool(plannedCounts)
  const usedNames: Set<string> = new Set()

  return shuffle(personalities).map((personality, index) => ({
    id: `classmate_${schoolYear}_${index + 1}_${Math.floor(Math.random() * 100000)}`,
    name: generateUniqueName(usedNames),
    type: mapPersonalityToFriendType(personality),
    intelligenza: generateIntelligence(personality),
    relation: randomInt(-10, 10),
    personality,
    promotedToFriend: false,
    yearJoined: schoolYear,
  }))
}

function calculatePersonalityCounts(totalClassmates: number): Record<string, number> {
  const counts: Record<string, number> = {}
  let assigned = 0

  const withRemainders = PERSONALITY_DISTRIBUTION.map(entry => {
    const rawCount = totalClassmates * entry.percentage
    const baseCount = Math.floor(rawCount)
    counts[entry.personality] = baseCount
    assigned += baseCount
    return {
      personality: entry.personality,
      remainder: rawCount - baseCount,
    }
  })

  const remaining = totalClassmates - assigned
  withRemainders
    .sort((left, right) => right.remainder - left.remainder)
    .slice(0, remaining)
    .forEach(entry => {
      counts[entry.personality] += 1
    })

  return counts
}

function buildPersonalityPool(counts: Record<string, number>): ClassmatePersonality[] {
  const personalities: ClassmatePersonality[] = []

  for (let index = 0; index < (counts.secchione ?? 0); index++) {
    personalities.push('secchione')
  }
  for (let index = 0; index < (counts.bullo ?? 0); index++) {
    personalities.push('bullo')
  }
  for (let index = 0; index < (counts.simpatico ?? 0); index++) {
    personalities.push('simpatico')
  }
  for (let index = 0; index < (counts.silenzioso ?? 0); index++) {
    personalities.push('silenzioso')
  }
  for (let index = 0; index < (counts.sportivo ?? 0); index++) {
    personalities.push('sportivo')
  }
  for (let index = 0; index < (counts.ribelle ?? 0); index++) {
    personalities.push('ribelle')
  }

  const otherCount = counts.altro ?? 0
  for (let index = 0; index < otherCount; index++) {
    personalities.push(ALTRO_PERSONALITIES[index % ALTRO_PERSONALITIES.length])
  }

  return personalities
}

function mapPersonalityToFriendType(personality: ClassmatePersonality): FriendType {
  switch (personality) {
    case 'secchione':
    case 'nerd':
      return 'secchione'
    case 'bullo':
      return 'coatto'
    case 'sportivo':
      return 'sportivo'
    case 'ribelle':
      return 'ribelle'
    default:
      return 'generico'
  }
}

function generateIntelligence(personality: ClassmatePersonality): number {
  switch (personality) {
    case 'secchione':
      return randomInt(78, 100)
    case 'nerd':
      return randomInt(72, 95)
    case 'leader':
      return randomInt(50, 85)
    case 'timido':
    case 'silenzioso':
      return randomInt(45, 80)
    case 'simpatico':
    case 'popolare':
      return randomInt(35, 75)
    case 'sportivo':
      return randomInt(30, 70)
    case 'ribelle':
      return randomInt(25, 60)
    case 'bullo':
      return randomInt(20, 55)
  }
}

function generateUniqueName(usedNames: Set<string>): string {
  const firstNamePool = [...MALE_NAMES, ...FEMALE_NAMES]

  for (let attempt = 0; attempt < 100; attempt++) {
    const firstName = firstNamePool[Math.floor(Math.random() * firstNamePool.length)]
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]
    const fullName = `${firstName} ${surname}`
    if (usedNames.has(fullName)) {
      continue
    }
    usedNames.add(fullName)
    return fullName
  }

  const fallbackName = `Studente ${usedNames.size + 1}`
  usedNames.add(fallbackName)
  return fallbackName
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}