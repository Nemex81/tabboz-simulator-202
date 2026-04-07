// ─── school-day-engine.ts ─────────────────────────────────────────────────────
//
// Genera i 7 HourSlot (3 ore + intervallo + 3 ore) per una mattinata scolastica.
// Layout:
//   index 0,1,2  → type: 'lesson'  (1ª-3ª ora)
//   index 3      → type: 'break'   (intervallo, 15 min)
//   index 4,5,6  → type: 'lesson'  (4ª-6ª ora)

import type { TimetableSlot, Teacher, HourSlot, GameStats } from '@/lib/types'
import { COMMON_SUBJECTS, SPECIFIC_SUBJECTS } from '@/lib/subjects'
import { pickTemplate, resolveTemplate } from '@/lib/school-day-templates'
import { getContextualEvents } from '@/lib/school-structured-events'

// ─── Mappa rapida key → displayName (costruita una sola volta) ────────────────

const _subjectNameCache: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const s of COMMON_SUBJECTS) {
    map[s.key] = s.displayName
  }
  for (const arr of Object.values(SPECIFIC_SUBJECTS)) {
    for (const s of arr) {
      map[s.key] = s.displayName
    }
  }
  return map
})()

function getSubjectDisplayName(key: string): string {
  return _subjectNameCache[key] ?? key
}

// ─── Slot helper: OrdinaryHourEvent ──────────────────────────────────────────

function buildLessonOrdinaryEvent(
  hourNumber: number,
  slot: TimetableSlot,
  teacher: Teacher
): { message: string; statDelta: Partial<GameStats> } {
  const displayName = getSubjectDisplayName(slot.subjectKey)
  const template = pickTemplate(slot.subjectKey)
  const message = resolveTemplate(template, hourNumber, teacher.name, displayName)

  const statDelta: Partial<GameStats> = teacher.severita >= 7
    ? { stanchezza: 3 }
    : { intelligenza: 1 }

  return { message, statDelta }
}

// ─── Slot helper: structuredEvent ────────────────────────────────────────────

function maybePickStructuredEvent(
  slot: TimetableSlot,
  teacher: Teacher
): import('@/lib/school-morning-events').SchoolMorningEvent | undefined {
  let base = 35
  if (teacher.severita >= 8) base += 10
  if (teacher.relazione > 30) base -= 10
  if (teacher.isOstile) base += 15
  // Clamp tra 5 e 80 per evitare probabilità degenerate
  base = Math.min(80, Math.max(5, base))

  if (Math.random() * 100 >= base) return undefined

  const pool = getContextualEvents(slot.subjectKey, teacher.severita, teacher.relazione)
  if (pool.length === 0) return undefined

  // Selezione pesata per probability
  const total = pool.reduce((acc, e) => acc + e.probability, 0)
  let rand = Math.random() * total
  for (const event of pool) {
    rand -= event.probability
    if (rand <= 0) return event
  }
  return pool[pool.length - 1]
}

// ─── generateSchoolDaySlots ───────────────────────────────────────────────────

/**
 * Genera i 7 HourSlot della mattinata scolastica.
 *
 * @param daySchedule 6 TimetableSlot (le 6 ore del giorno)
 * @param teachers    Array dei Teacher della classe
 * @param stats       Statistiche correnti del giocatore (per scelte contestuali)
 * @returns           7 HourSlot: indici 0-2 lezioni, 3 intervallo, 4-6 lezioni
 */
export function generateSchoolDaySlots(
  daySchedule: TimetableSlot[],
  teachers: Teacher[],
  _stats: GameStats
): HourSlot[] {
  // Mappa rapida teacher id → Teacher
  const teacherMap = new Map<string, Teacher>()
  for (const t of teachers) {
    teacherMap.set(t.id, t)
  }

  const slots: HourSlot[] = []

  // Pre-break: ore 1-3  (daySchedule[0,1,2] → HourSlot index 0,1,2)
  for (let i = 0; i < 3; i++) {
    const slot = daySchedule[i]
    const teacher = teacherMap.get(slot.teacherId)

    if (!teacher) {
      // Professore non trovato: slot sicuro con fallback
      slots.push({
        hourIndex: i,
        type: 'lesson',
        subjectKey: slot.subjectKey,
        teacherId: slot.teacherId,
        ordinaryEvent: {
          message: `${i + 1}ª ora — ${getSubjectDisplayName(slot.subjectKey)}. L'aula è silenziosa.`,
          statDelta: { stanchezza: 1 },
        },
        completed: false,
      })
      continue
    }

    const ordinaryEvent = buildLessonOrdinaryEvent(i + 1, slot, teacher)
    const structuredEvent = maybePickStructuredEvent(slot, teacher)

    slots.push({
      hourIndex: i,
      type: 'lesson',
      subjectKey: slot.subjectKey,
      teacherId: slot.teacherId,
      ordinaryEvent,
      structuredEvent,
      completed: false,
    })
  }

  // Intervallo (index 3)
  slots.push({
    hourIndex: 3,
    type: 'break',
    ordinaryEvent: {
      message: 'Intervallo. Hai 15 minuti liberi.',
      statDelta: { stanchezza: -10 },
    },
    completed: false,
  })

  // Post-break: ore 4-6  (daySchedule[3,4,5] → HourSlot index 4,5,6)
  for (let i = 0; i < 3; i++) {
    const slot = daySchedule[3 + i]
    const teacher = teacherMap.get(slot.teacherId)

    if (!teacher) {
      slots.push({
        hourIndex: 4 + i,
        type: 'lesson',
        subjectKey: slot.subjectKey,
        teacherId: slot.teacherId,
        ordinaryEvent: {
          message: `${4 + i}ª ora — ${getSubjectDisplayName(slot.subjectKey)}. L'aula è silenziosa.`,
          statDelta: { stanchezza: 1 },
        },
        completed: false,
      })
      continue
    }

    const ordinaryEvent = buildLessonOrdinaryEvent(4 + i, slot, teacher)
    const structuredEvent = maybePickStructuredEvent(slot, teacher)

    slots.push({
      hourIndex: 4 + i,
      type: 'lesson',
      subjectKey: slot.subjectKey,
      teacherId: slot.teacherId,
      ordinaryEvent,
      structuredEvent,
      completed: false,
    })
  }

  return slots
}
