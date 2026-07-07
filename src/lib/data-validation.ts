import { GameStats, SubjectGrades, GameTime, Friend, Relationship, ScheduledExam, SchoolType, getDefaultGradesForSchoolType } from '@/lib/types'
import { clampStat } from '@/lib/game-utils'
import { DEFAULT_SEXUAL_ORIENTATION, normalizeCharacterGenderCode } from '@/lib/gender-utils'

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
      carisma: 10,
      stress: 0,
      morale: 60,
      salute: 100,
      hasMotorino: false,
      motorinoTuning: 0,
      motorinoPezzi: [],
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
    carisma: clampStat(stats.carisma ?? 10),
    stress: clampStat(stats.stress ?? 0),
    morale: clampStat(stats.morale ?? 60),
    salute: clampStat(stats.salute ?? 100),
    hasMotorino: typeof stats.hasMotorino === 'boolean' ? stats.hasMotorino : false,
    motorinoTuning: typeof stats.motorinoTuning === 'number' ? clampStat(stats.motorinoTuning) : 0,
    motorinoPezzi: Array.isArray(stats.motorinoPezzi) ? stats.motorinoPezzi : [],
  }
}

export const validateGrades = (grades: Partial<SubjectGrades> | null | undefined, schoolType?: SchoolType | null): SubjectGrades => {
  const defaults = schoolType ? getDefaultGradesForSchoolType(schoolType) : {
    matematica: 6,
    italiano: 6,
    storia: 6,
    edFisica: 6
  }

  if (!grades || typeof grades !== 'object') {
    return defaults
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
      currentDate: { day: 15, month: 9, year: 2026 },
      actionsRemaining: 3,
      maxActionsPerDay: 3,
      schoolYear: {
        currentYear: 1,
        isSchoolPeriod: true,
        daysUntilBreak: 180,
        schoolStartDate: { day: 15, month: 9, year: 2026 },
        schoolEndDate: { day: 10, month: 6, year: 2027 },
        reportCardDate: { day: 10, month: 6, year: 2027 }
      },
      age: 14,
      lastPaghettaDate: undefined,
      extraActions: 0,
      currentPhase: 'mattina',
      phaseActions: {
        mattina: 3,
        pomeriggio: 3,
        sera: 2,
        notte: 1
      }
    }
  }

  const currentDate = gameTime.currentDate && 
    typeof gameTime.currentDate === 'object' &&
    typeof gameTime.currentDate.year === 'number' &&
    typeof gameTime.currentDate.month === 'number' &&
    typeof gameTime.currentDate.day === 'number'
    ? gameTime.currentDate
    : { day: 15, month: 9, year: 2026 }

  const schoolYear = gameTime.schoolYear && typeof gameTime.schoolYear === 'object'
    ? {
        currentYear: gameTime.schoolYear.currentYear ?? 1,
        isSchoolPeriod: gameTime.schoolYear.isSchoolPeriod ?? true,
        daysUntilBreak: gameTime.schoolYear.daysUntilBreak ?? 180,
        schoolStartDate: gameTime.schoolYear.schoolStartDate && 
          typeof gameTime.schoolYear.schoolStartDate === 'object' &&
          typeof gameTime.schoolYear.schoolStartDate.year === 'number'
          ? gameTime.schoolYear.schoolStartDate
          : { day: 15, month: 9, year: currentDate.year },
        schoolEndDate: gameTime.schoolYear.schoolEndDate &&
          typeof gameTime.schoolYear.schoolEndDate === 'object' &&
          typeof gameTime.schoolYear.schoolEndDate.year === 'number'
          ? gameTime.schoolYear.schoolEndDate
          : { day: 10, month: 6, year: currentDate.year + 1 },
        reportCardDate: gameTime.schoolYear.reportCardDate &&
          typeof gameTime.schoolYear.reportCardDate === 'object' &&
          typeof gameTime.schoolYear.reportCardDate.year === 'number'
          ? gameTime.schoolYear.reportCardDate
          : { day: 10, month: 6, year: currentDate.year + 1 }
      }
    : {
        currentYear: 1,
        isSchoolPeriod: true,
        daysUntilBreak: 180,
        schoolStartDate: { day: 15, month: 9, year: 2026 },
        schoolEndDate: { day: 10, month: 6, year: 2027 },
        reportCardDate: { day: 10, month: 6, year: 2027 }
      }

  return {
    currentDate,
    actionsRemaining: clampStat(gameTime.actionsRemaining ?? 3, 0, gameTime.maxActionsPerDay ?? 3),
    maxActionsPerDay: gameTime.maxActionsPerDay ?? 3,
    schoolYear,
    age: Math.max(14, Math.min(gameTime.age ?? 14, 25)),
    lastPaghettaDate: gameTime.lastPaghettaDate && 
      typeof gameTime.lastPaghettaDate === 'object' &&
      typeof gameTime.lastPaghettaDate.year === 'number'
      ? gameTime.lastPaghettaDate
      : undefined,
    extraActions: Math.max(0, gameTime.extraActions ?? 0),
    currentPhase: gameTime.currentPhase ?? 'mattina',
    phaseActions: gameTime.phaseActions ?? {
      mattina: 3,
      pomeriggio: 3,
      sera: 2,
      notte: 1
    }
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
          ? clampStat(friend.affinita)
          : typeof friend.legameLevel === 'number'
          ? clampStat((friend.legameLevel as number) * 10)
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
        gender: normalizeCharacterGenderCode(friend.gender as Friend['gender'] | undefined, 'F'),
        orientamentoSessuale: (friend.orientamentoSessuale as Friend['orientamentoSessuale']) ?? DEFAULT_SEXUAL_ORIENTATION,
        intelligenza: typeof friend.intelligenza === 'number' ? (friend.intelligenza as number) : undefined,
        unlocked: typeof friend.unlocked === 'boolean' ? (friend.unlocked as boolean) : true,
        // Preserva i nuovi campi se presenti nel KV (dati già migrati)
        originType: (friend.originType as Friend['originType']) ?? 'extrascolastico',
        metAt: friend.metAt as Friend['metAt'] ?? undefined,
        schoolYearMet: typeof friend.schoolYearMet === 'number' ? (friend.schoolYearMet as number) : undefined,
        rel: friend.rel as import('@/lib/relation-system').RelationStats ?? undefined,
        lastInteractionDay: typeof friend.lastInteractionDay === 'number' ? (friend.lastInteractionDay as number) : undefined,
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
      const type = exam.type === 'orale' ? 'orale' : 'scritto'
      
      return {
        subject: exam.subject,
        daysUntil: exam.daysUntil,
        type,
        isPrepared: exam.isPrepared,
        difficulty,
        announced: typeof exam.announced === 'boolean' ? exam.announced : false
      }
    }
    return {
      subject: 'matematica',
      daysUntil: 5,
      type: 'scritto',
      isPrepared: false,
      difficulty: 'normale',
      announced: false
    }
  }).filter(exam => (exam.daysUntil ?? 0) >= 0)
}

export const validateSchoolType = (schoolType: unknown): SchoolType | null => {
  const VALID_SCHOOL_TYPES = ['tecnico', 'agraria', 'artistico', 'conservatorio', 'alberghiero', 'liceoScientifico'] as const
  if (VALID_SCHOOL_TYPES.includes(schoolType as SchoolType)) return schoolType as SchoolType
  return null
}
