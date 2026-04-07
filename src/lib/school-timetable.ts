import type { SchoolType, WeeklyTimetable, TimetableSlot, Teacher } from '@/lib/types'
import { getActiveSubjectsForYear } from '@/lib/subjects'
import type { SubjectDefinition } from '@/lib/subjects'

// ─── generateWeeklyTimetable ──────────────────────────────────────────────────
//
// Produce una griglia settimanale 5×6 (lun-ven, 6 ore/giorno).
//
// Vincoli implementati:
// 1. Max 2 occorrenze della stessa materia per giorno
// 2. Materie pesanti (weight >= 1.3) posizionate nelle prime 3 ore
// 3. Orario pieno: ogni giorno ha esattamente 6 slot
// 4. Ogni slot riceve il teacherId del professore associato alla materia

export function generateWeeklyTimetable(
  schoolType: SchoolType,
  schoolYear: number,
  teachers: Teacher[]
): WeeklyTimetable {
  const activeSubjects = getActiveSubjectsForYear(schoolType, schoolYear)
    .filter(s => (s.weeklyHours ?? 0) > 0)

  // Pool di slot: ogni materia viene espansa in N slot (N = weeklyHours)
  const slotPool: SubjectDefinition[] = []
  for (const subject of activeSubjects) {
    const hours = subject.weeklyHours ?? 2
    for (let i = 0; i < hours; i++) {
      slotPool.push(subject)
    }
  }

  // Lookup professore per materia
  const teacherBySubject: Map<string, string> = new Map()
  for (const teacher of teachers) {
    teacherBySubject.set(teacher.subjectKey, teacher.id)
  }

  // Separa materie pesanti (preferite nelle prime 3 ore) dalle leggere
  const isHeavy = (s: SubjectDefinition) => s.weight >= 1.3

  // Griglia: 5 giorni x 6 slot, inizialmente vuota
  type Grid = (SubjectDefinition | null)[][]
  const grid: Grid = Array.from({ length: 5 }, () => Array(6).fill(null))

  // Contatore occorrenze per giorno per materia
  const dailyCount: Record<number, Record<string, number>> = {}
  for (let d = 0; d < 5; d++) dailyCount[d] = {}

  // Shuffle deterministicamente stabile (Fisher-Yates)
  const pool = [...slotPool]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }

  // Fase 1: piazza prima i heavy nelle ore 0-2 (prime 3 ore)
  const heavy = pool.filter(isHeavy)
  const light = pool.filter(s => !isHeavy(s))

  const tryPlace = (
    subject: SubjectDefinition,
    preferredHours: number[]
  ): boolean => {
    for (const hour of preferredHours) {
      for (let day = 0; day < 5; day++) {
        if (grid[day][hour] !== null) continue
        const count = dailyCount[day][subject.key] ?? 0
        if (count >= 2) continue
        grid[day][hour] = subject
        dailyCount[day][subject.key] = count + 1
        return true
      }
    }
    return false
  }

  // Materie pesanti: preferenza ore 0-2, fallback su tutto
  for (const subject of heavy) {
    const placed = tryPlace(subject, [0, 1, 2])
    if (!placed) tryPlace(subject, [3, 4, 5])
  }

  // Materie leggere: preferenza ore 3-5, fallback su tutto
  for (const subject of light) {
    const placed = tryPlace(subject, [3, 4, 5])
    if (!placed) tryPlace(subject, [0, 1, 2])
  }

  // Fase 2: riempi eventuali slot vuoti con materie gia usate
  // (overflow: se weeklyHours totali < 30, riusa le materie con piu ore)
  const fallbackPool = [...activeSubjects]
    .sort((a, b) => (b.weeklyHours ?? 0) - (a.weeklyHours ?? 0))

  for (let day = 0; day < 5; day++) {
    for (let hour = 0; hour < 6; hour++) {
      if (grid[day][hour] !== null) continue
      // Trova la prima materia che non supera quota giornaliera
      for (const subject of fallbackPool) {
        const count = dailyCount[day][subject.key] ?? 0
        if (count >= 2) continue
        grid[day][hour] = subject
        dailyCount[day][subject.key] = count + 1
        break
      }
    }
  }

  // Converti grid in WeeklyTimetable
  const timetable: WeeklyTimetable = {
    0: buildDaySlots(grid[0], teacherBySubject),
    1: buildDaySlots(grid[1], teacherBySubject),
    2: buildDaySlots(grid[2], teacherBySubject),
    3: buildDaySlots(grid[3], teacherBySubject),
    4: buildDaySlots(grid[4], teacherBySubject),
  }

  return timetable
}

function buildDaySlots(
  dayGrid: (SubjectDefinition | null)[],
  teacherBySubject: Map<string, string>
): TimetableSlot[] {
  return dayGrid.map(subject => {
    const key = subject?.key ?? '_unknown'
    const teacherId = teacherBySubject.get(key) ?? '_missing'
    return { subjectKey: key, teacherId }
  })
}

// ─── Helper: restituisce i 6 slot del giorno corrente ─────────────────────────

export function getTodaySchedule(
  timetable: WeeklyTimetable,
  dayOfWeek: number   // 0=lunedi, 4=venerdi
): TimetableSlot[] {
  const key = Math.max(0, Math.min(4, dayOfWeek)) as 0 | 1 | 2 | 3 | 4
  return timetable[key]
}
