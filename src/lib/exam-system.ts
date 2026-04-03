import { ScheduledExam, SubjectGrades, GameStats, ExamDifficulty } from '@/lib/types'
import { randomChance, clampStat } from '@/lib/game-utils'

const DIFFICULTY_MULTIPLIERS: Record<ExamDifficulty, number> = {
  facile: 1.5,
  normale: 1.0,
  difficile: 0.6,
  brutale: 0.35
}

export const generateScheduledExam = (subjects: string[]): ScheduledExam => {
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
  const daysUntil = Math.floor(Math.random() * 4) + 2
  
  const rand = Math.random()
  const difficulty: ExamDifficulty = 
    rand < 0.30 ? 'facile' :
    rand < 0.70 ? 'normale' :
    rand < 0.90 ? 'difficile' : 'brutale'
  
  return {
    subject: randomSubject,
    daysUntil,
    isPrepared: false,
    difficulty,
    announced: false
  }
}

export const getDifficultyMultiplier = (difficulty: ExamDifficulty): number => {
  return DIFFICULTY_MULTIPLIERS[difficulty]
}

export const getDifficultyText = (difficulty: ExamDifficulty): string => {
  switch (difficulty) {
    case 'facile':
      return 'FACILE'
    case 'normale':
      return 'NORMALE'
    case 'difficile':
      return 'DIFFICILE'
    case 'brutale':
      return 'BRUTALE'
  }
}

export const getDifficultyAnnouncement = (subject: string, difficulty: ExamDifficulty): string => {
  switch (difficulty) {
    case 'facile':
      return `Il prof di ${subject} ha detto che la verifica sarà una passeggiata. Forse studia un po' per sicurezza.`
    case 'normale':
      return `Verifica di ${subject} tra 3 giorni. Mettiti sotto.`
    case 'difficile':
      return `Il prof di ${subject} ha fatto vedere la verifica a un collega e quello ha pianto. Preparati bene.`
    case 'brutale':
      return `Si vocifera che l'ultima volta che il prof di ${subject} ha fatto questa verifica, metà classe è stata bocciata. STUDIA ORA.`
  }
}

export const calculateExamGrade = (
  currentGrade: number,
  intelligenza: number,
  isPrepared: boolean,
  media: number,
  difficulty: ExamDifficulty
): number => {
  let gradeChange = 0
  const diffMultiplier = getDifficultyMultiplier(difficulty)
  
  if (isPrepared) {
    const intelligenceMultiplier = 1 + (intelligenza / 100)
    gradeChange = Number((2 * intelligenceMultiplier * diffMultiplier).toFixed(1))
  } else {
    const surpriseChance = (media + intelligenza) / 2
    if (surpriseChance > 60) {
      gradeChange = 0.5 * diffMultiplier
    } else if (surpriseChance > 40) {
      gradeChange = 0
    } else {
      gradeChange = -0.5
    }
  }
  
  const diffPenalty = {
    facile: 0.5,
    normale: 0,
    difficile: -0.5,
    brutale: -1.0
  }[difficulty]
  
  const newGrade = clampStat(currentGrade + gradeChange + diffPenalty, 0, 10)
  return Number(newGrade.toFixed(1))
}

export const calculateSurpriseQuizGrade = (
  currentGrade: number,
  stats: GameStats
): { newGrade: number; message: string } => {
  const surpriseScore = (stats.media + stats.intelligenza) / 2
  
  let gradeChange = 0
  let message = ''
  
  if (surpriseScore >= 70) {
    gradeChange = Number((1 + (stats.intelligenza / 100)).toFixed(1))
    message = `INTERROGAZIONE A SORPRESA! Sei andato BENISSIMO! +${gradeChange.toFixed(1)} al voto`
  } else if (surpriseScore >= 50) {
    gradeChange = 0.5
    message = 'INTERROGAZIONE A SORPRESA! Te la sei cavata! +0.5 al voto'
  } else if (surpriseScore >= 30) {
    gradeChange = 0
    message = 'INTERROGAZIONE A SORPRESA! Sei stato SUFFICIENTE! Voto invariato'
  } else {
    gradeChange = -0.8
    message = 'INTERROGAZIONE A SORPRESA! Hai fatto SCENA MUTA! -0.8 al voto'
  }
  
  const newGrade = clampStat(currentGrade + gradeChange, 0, 10)
  
  return {
    newGrade: Number(newGrade.toFixed(1)),
    message
  }
}

export const shouldTriggerSurpriseQuiz = (): boolean => {
  return randomChance(10)
}

export const prepareForExam = (exam: ScheduledExam, intelligenza: number): { 
  newIsPrepared: boolean
  intelligenceGain: number
  message: string
} => {
  const studyEfficiency = 0.5 + (intelligenza / 100)
  const intelligenceGain = Number((2 * studyEfficiency).toFixed(0))
  
  return {
    newIsPrepared: true,
    intelligenceGain,
    message: `Hai studiato per la verifica di ${exam.subject}! +${intelligenceGain} Intelligenza, Preparazione al 100%!`
  }
}
