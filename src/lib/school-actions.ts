/**
 * school-actions.ts — funzioni pure per le azioni scolastiche.
 * Estratte da App.tsx (R9d) per separare logica pura dai side-effect React.
 */
import {
  WeeklyTimetable,
  SchoolDayState,
  GameDate,
  Teacher,
  TimetableSlot,
} from '@/lib/types'
import { GameStats } from '@/lib/types'
import { generateSchoolDaySlots } from '@/lib/school-day-engine'
import { drawSchoolMorningEvents, SchoolMorningEvent } from '@/lib/school-morning-events'

// ---------------------------------------------------------------------------
// Tipi risultato
// ---------------------------------------------------------------------------

export type SchoolDayResult =
  | { type: 'sequence'; state: SchoolDayState }
  | { type: 'legacy'; morningEvents: SchoolMorningEvent[] }

// ---------------------------------------------------------------------------
// buildSchoolDayState
// Determina il contenuto della mattinata scolastica (sequenza slot o
// fallback legacy) a partire dal timetable e dalla data odierna.
// Funzione pura: nessuna dipendenza da state React, facilmente testabile.
// ---------------------------------------------------------------------------

export function buildSchoolDayState(
  timetable: WeeklyTimetable | null,
  currentDate: GameDate,
  teachers: Teacher[],
  stats: GameStats,
  getTodaySchedule: (day: number) => TimetableSlot[],
): SchoolDayResult {
  if (timetable !== null) {
    const jsDay = new Date(
      currentDate.year,
      currentDate.month - 1,
      currentDate.day,
    ).getDay()
    const dayOfWeek = jsDay - 1  // 0 = Lun … 4 = Ven
    const daySchedule = getTodaySchedule(dayOfWeek)
    if (daySchedule.length >= 6) {
      const slots = generateSchoolDaySlots(daySchedule, teachers, stats)
      const state: SchoolDayState = {
        date: currentDate,
        slots,
        currentSlotIndex: 0,
        isComplete: false,
      }
      return { type: 'sequence', state }
    }
  }
  // Fallback legacy: timetable assente o incompleto
  const morningEvents = drawSchoolMorningEvents(6)
  return { type: 'legacy', morningEvents }
}
