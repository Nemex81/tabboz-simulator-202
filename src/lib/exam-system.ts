import { ScheduledExam, SubjectGrades, GameStats } from '@/lib/types'
import { randomChance, clampStat } from '@/lib/game-utils'

export const generateScheduledExam = (subjects: string[]): ScheduledExam => {
  const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
  const daysUntil = Math.floor(Math.random() * 4) + 2
  
  return {
    subject: randomSubject,
    daysUntil,
    isPrepared: false
  }
}

export const calculateExamGrade = (
  currentGrade: number,
  intelligenza: number,
  isPrepared: boolean,
  media: number
): number => {
  let gradeChange = 0
  
  if (isPrepared) {
    const intelligenceMultiplier = 1 + (intelligenza / 100)
    gradeChange = Number((2 * intelligenceMultiplier).toFixed(1))
  } else {
    const surpriseChance = (media + intelligenza) / 2
    if (surpriseChance > 60) {
      gradeChange = 0.5
    } else if (surpriseChance > 40) {
      gradeChange = 0
    } else {
      gradeChange = -0.5
    }
  }
  
  const newGrade = clampStat(currentGrade + gradeChange, 0, 10)
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
