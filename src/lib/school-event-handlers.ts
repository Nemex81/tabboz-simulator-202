/**
 * school-event-handlers.ts — logica pura per eventi scolastici e scrutinio.
 * Estratte da App.tsx (R9d) per separare logica pura dai side-effect React.
 */
import {
  SubjectGrades,
  SchoolType,
  getSubjectDisplayName,
} from '@/lib/types'
import {
  clampStat,
  calculateWeightedMedia,
  getWorstSubjects,
} from '@/lib/game-utils'
import { EventOutcome } from '@/lib/school-events'

// ---------------------------------------------------------------------------
// computeEventGradeChange
// Calcola la variazione di voto derivante dall'outcome di un evento.
// Restituisce null se l'outcome non prevede gradeChanges.
// ---------------------------------------------------------------------------

export interface EventGradeResult {
  targetSubject: string
  oldGrade: number
  newGrade: number
  /** Stringa di feedback già formattata con simboli emoji e medie. */
  deltaMsg: string
}

export function computeEventGradeChange(
  outcome: EventOutcome,
  grades: SubjectGrades,
  schoolType: SchoolType | null,
): EventGradeResult | null {
  if (!outcome.gradeChanges) return null

  const worstSubs = getWorstSubjects(grades, 3)
  const targetSubject =
    outcome.gradeChanges.subject === 'random'
      ? worstSubs[Math.floor(Math.random() * worstSubs.length)]
      : outcome.gradeChanges.subject

  const oldGrade = grades[targetSubject] ?? 0
  const newGrade = clampStat(oldGrade + outcome.gradeChanges.change, 0, 10)
  const newGrades: SubjectGrades = { ...grades, [targetSubject]: newGrade }
  const oldMedia = calculateWeightedMedia(grades, schoolType)
  const newMedia = calculateWeightedMedia(newGrades, schoolType)

  const deltaMsg =
    `\u{1F4CA} ${getSubjectDisplayName(targetSubject)}: ` +
    `${oldGrade.toFixed(1)} \u2192 ${newGrade.toFixed(1)} | ` +
    `Media: ${oldMedia.toFixed(2)} \u2192 ${newMedia.toFixed(2)}`

  return { targetSubject, oldGrade, newGrade, deltaMsg }
}

// ---------------------------------------------------------------------------
// computeReportCardVerdict
// Restituisce il verdetto dello scrutinio come unione discriminata.
// Funzione pura: nessun side-effect, facilmente testabile.
// ---------------------------------------------------------------------------

export type ReportCardVerdict =
  | { type: 'game_won' }
  | { type: 'too_many_absences'; reason: string }
  | { type: 'bad_conduct'; reason: string }
  | { type: 'passed'; completedYear: number; newYear: number }
  | { type: 'failed'; reason: string }

export function computeReportCardVerdict(
  grades: SubjectGrades,
  schoolType: SchoolType | null,
  condotta: number,
  assenze: number,
  gameWon: boolean,
  currentYear: number,
): ReportCardVerdict {
  if (gameWon) return { type: 'game_won' }

  if (assenze >= 35) {
    return {
      type: 'too_many_absences',
      reason: `BOCCIATO! Troppe assenze (${assenze} giorni)! Non sei stato ammesso allo scrutinio!`,
    }
  }

  let promotionThreshold = 6.0
  if (condotta >= 9) {
    promotionThreshold = 5.8
  } else if (condotta >= 7) {
    promotionThreshold = 6.0
  } else if (condotta >= 6) {
    promotionThreshold = 6.3
  } else {
    return {
      type: 'bad_conduct',
      reason: `BOCCIATO! Condotta insufficiente (${condotta.toFixed(1)}/10)! Il Consiglio di Classe non ti ha promosso!`,
    }
  }

  const weightedMedia = calculateWeightedMedia(grades, schoolType)
  if (weightedMedia >= promotionThreshold) {
    return { type: 'passed', completedYear: currentYear, newYear: currentYear + 1 }
  }

  return {
    type: 'failed',
    reason: `BOCCIATO! Media pesata ${weightedMedia.toFixed(2)} sotto la soglia ${promotionThreshold.toFixed(1)}! Devi ripetere l'anno!`,
  }
}
