import { GameStats, SubjectGrades, GameTime, Friend, Relationship, ScheduledExam, SchoolType } from '@/lib/types'
import { clampStat } from '@/lib/game-utils'

export const validateStats = (stats: Partial<GameStats> | null | undefined): GameStats => {
  if (!stats || typeof stats !== 'object') {
    return {
      coattaggine: 50,
      muscoli: 50,
      soldi: 100,
      media: 6,
      stanchezza: 0,
      figosita: 50,
      reputazione: 50,
      intelligenza: 10,
      carisma: 10
    }
  }

  return {
    coattaggine: clampStat(stats.coattaggine ?? 50),
    muscoli: clampStat(stats.muscoli ?? 50),
    soldi: clampStat(stats.soldi ?? 100, 0, 1000),
    media: clampStat(stats.media ?? 6, 0, 10),
    stanchezza: clampStat(stats.stanchezza ?? 0),
    figosita: clampStat(stats.figosita ?? 50),
    reputazione: clampStat(stats.reputazione ?? 50),
    intelligenza: clampStat(stats.intelligenza ?? 10),
    carisma: clampStat(stats.carisma ?? 10)
  }
}

export const validateGrades = (grades: Partial<SubjectGrades> | null | undefined, schoolType?: SchoolType | null): SubjectGrades => {
  if (!grades || typeof grades !== 'object') {
    return {
      matematica: 6,
      italiano: 6,
      storia: 6,
      edFisica: 6
    }
  }

  const validated: SubjectGrades = {}
  
  for (const [key, value] of Object.entries(grades)) {
    if (typeof value === 'number' && !isNaN(value)) {
      validated[key] = clampStat(value, 0, 10)
    } else {
      validated[key] = 6
    }
  }

  return validated
}

export const validateGameTime = (gameTime: Partial<GameTime> | null | undefined): GameTime => {
  if (!gameTime || typeof gameTime !== 'object') {
    return {
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
      age: 14,
      lastPaghettaDate: undefined
    }
  }

  return {
    currentDate: gameTime.currentDate ?? { day: 15, month: 9, year: 2024 },
    actionsRemaining: Math.max(0, Math.min(gameTime.actionsRemaining ?? 3, gameTime.maxActionsPerDay ?? 3)),
    maxActionsPerDay: gameTime.maxActionsPerDay ?? 3,
    schoolYear: gameTime.schoolYear ?? {
      currentYear: 1,
      isSchoolPeriod: true,
      schoolStartDate: { day: 15, month: 9, year: 2024 },
      schoolEndDate: { day: 10, month: 6, year: 2025 },
      reportCardDate: { day: 10, month: 6, year: 2025 }
    },
    age: Math.max(14, Math.min(gameTime.age ?? 14, 25)),
    lastPaghettaDate: gameTime.lastPaghettaDate
  }
}

export const validateFriends = (friends: unknown): Friend[] => {
  if (!Array.isArray(friends)) {
    return []
  }

  const validTypes = ['coatto', 'secchione', 'sportivo', 'ribelle', 'generico']

  return friends
    .filter((friend): friend is Record<string, unknown> => {
      return (
        friend !== null &&
        typeof friend === 'object' &&
        typeof (friend as Record<string, unknown>).id === 'string' &&
        typeof (friend as Record<string, unknown>).name === 'string'
      )
    })
    .map((friend): Friend => {
      // Migrazione dati legacy: legameLevel (1-10) -> affinita (0-100)
      const affinita: number =
        typeof friend.affinita === 'number'
          ? Math.min(100, Math.max(0, friend.affinita))
          : typeof friend.legameLevel === 'number'
          ? Math.min(100, Math.max(0, (friend.legameLevel as number) * 10))
          : 50

      const type =
        typeof friend.type === 'string' && validTypes.includes(friend.type as string)
          ? (friend.type as Friend['type'])
          : 'generico'

      return {
        id: friend.id as string,
        name: friend.name as string,
        type,
        affinita,
        intelligenza: typeof friend.intelligenza === 'number' ? (friend.intelligenza as number) : undefined,
        unlocked: typeof friend.unlocked === 'boolean' ? (friend.unlocked as boolean) : true
      }
    })
}

export const validateRelationships = (relationships: unknown): Relationship[] => {
  if (!Array.isArray(relationships)) {
    return []
  }

  return relationships.filter((rel): rel is Relationship => {
    return (
      rel &&
      typeof rel === 'object' &&
      typeof rel.id === 'string' &&
      typeof rel.name === 'string' &&
      ['facile', 'media', 'difficile'].includes(rel.difficulty) &&
      ['muscoli', 'figosita', 'intelligenza'].includes(rel.preference) &&
      typeof rel.relationshipLevel === 'number' &&
      typeof rel.isActive === 'boolean'
    )
  })
}

export const validateScheduledExams = (exams: unknown): ScheduledExam[] => {
  if (!Array.isArray(exams)) {
    return []
  }

  return exams.map((exam): ScheduledExam => {
    if (
      exam &&
      typeof exam === 'object' &&
      typeof exam.subject === 'string' &&
      typeof exam.daysUntil === 'number' &&
      typeof exam.isPrepared === 'boolean' &&
      exam.daysUntil >= 0
    ) {
      const difficulty = ['facile', 'normale', 'difficile', 'brutale'].includes(exam.difficulty as string)
        ? (exam.difficulty as 'facile' | 'normale' | 'difficile' | 'brutale')
        : 'normale'
      
      return {
        subject: exam.subject,
        daysUntil: exam.daysUntil,
        isPrepared: exam.isPrepared,
        difficulty,
        announced: typeof exam.announced === 'boolean' ? exam.announced : false
      }
    }
    return {
      subject: 'matematica',
      daysUntil: 5,
      isPrepared: false,
      difficulty: 'normale',
      announced: false
    }
  }).filter(exam => exam.daysUntil >= 0)
}

export const validateSchoolType = (schoolType: unknown): SchoolType | null => {
  if (schoolType === 'tecnico' || schoolType === 'agraria' || schoolType === 'artistico') {
    return schoolType
  }
  return null
}
