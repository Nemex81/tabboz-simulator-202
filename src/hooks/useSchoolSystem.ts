import { useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import type {
  SchoolType,
  Teacher,
  Classmate,
  WeeklyTimetable,
  SchoolDayState,
  TimetableSlot,
} from '@/lib/types'
import { DEFAULT_SCHOOL_DAY_STATE } from '@/lib/types'
import { generateTeachers } from '@/lib/school-teachers'
import { generateClassRoster } from '@/lib/school-roster'
import { generateWeeklyTimetable, getTodaySchedule as getTodayScheduleFromLib } from '@/lib/school-timetable'

// ─── Costanti KV ─────────────────────────────────────────────────────────────

const KV_TEACHERS = 'tabboz-teachers'
const KV_CLASS_ROSTER = 'tabboz-class-roster'
const KV_WEEKLY_TIMETABLE = 'tabboz-weekly-timetable'
const KV_SCHOOL_DAY_STATE = 'tabboz-school-day-state'

// ─── Tipi di ritorno ──────────────────────────────────────────────────────────

export interface UseSchoolSystemReturn {
  // Stato persisted
  teachers: Teacher[]
  setTeachers: (updater: ((prev: Teacher[]) => Teacher[]) | Teacher[]) => void
  classRoster: Classmate[]
  setClassRoster: (updater: ((prev: Classmate[]) => Classmate[]) | Classmate[]) => void
  timetable: WeeklyTimetable | null
  setTimetable: (updater: ((prev: WeeklyTimetable | null) => WeeklyTimetable | null) | WeeklyTimetable | null) => void
  schoolDayState: SchoolDayState
  setSchoolDayState: (updater: ((prev: SchoolDayState) => SchoolDayState) | SchoolDayState) => void

  // Azioni
  /** Genera teachers, classRoster e timetable per l'anno scolastico indicato.
   *  L'ordine è obbligatorio: teachers prima perché servono a generateWeeklyTimetable. */
  initSchoolYear: (schoolType: SchoolType, schoolYear: number) => void
  /** Lookup veloce: restituisce il Teacher per la materia indicata, o undefined. */
  getTeacherForSubject: (subjectKey: string) => Teacher | undefined
  /** Restituisce i 6 TimetableSlot del giorno scolastico indicato (0=lun, 4=ven).
   *  Restituisce [] se il timetable non è ancora stato generato. */
  getTodaySchedule: (dayOfWeek: number) => TimetableSlot[]
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSchoolSystem(): UseSchoolSystemReturn {
  const [rawTeachers, setTeachers] = useKV<Teacher[]>(KV_TEACHERS, [])
  const [rawClassRoster, setClassRoster] = useKV<Classmate[]>(KV_CLASS_ROSTER, [])
  const [rawTimetable, setTimetable] = useKV<WeeklyTimetable | null>(KV_WEEKLY_TIMETABLE, null)
  const [rawSchoolDayState, setSchoolDayState] = useKV<SchoolDayState>(KV_SCHOOL_DAY_STATE, DEFAULT_SCHOOL_DAY_STATE)

  // Backward compatibility: valori null/undefined → vuoti o default
  const teachers: Teacher[] = rawTeachers ?? []
  const classRoster: Classmate[] = rawClassRoster ?? []
  const timetable: WeeklyTimetable | null = rawTimetable ?? null
  const schoolDayState: SchoolDayState = rawSchoolDayState ?? DEFAULT_SCHOOL_DAY_STATE

  // Genera le 3 strutture nell'ordine corretto e le persiste in KV.
  // Teachers vengono generati prima perché servono come input a generateWeeklyTimetable.
  const initSchoolYear = useCallback(
    (schoolType: SchoolType, schoolYear: number) => {
      const newTeachers = generateTeachers(schoolType, schoolYear)
      const newClassRoster = generateClassRoster(schoolYear)
      const newTimetable = generateWeeklyTimetable(schoolType, schoolYear, newTeachers)

      setTeachers(newTeachers)
      setClassRoster(newClassRoster)
      setTimetable(newTimetable)
      setSchoolDayState(DEFAULT_SCHOOL_DAY_STATE)
    },
    // setters da useKV sono stabili — non servono come deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const getTeacherForSubject = useCallback(
    (subjectKey: string): Teacher | undefined =>
      teachers.find(t => t.subjectKey === subjectKey),
    [teachers]
  )

  const getTodaySchedule = useCallback(
    (dayOfWeek: number): TimetableSlot[] => {
      if (!timetable) return []
      return getTodayScheduleFromLib(timetable, dayOfWeek)
    },
    [timetable]
  )

  return {
    teachers,
    setTeachers,
    classRoster,
    setClassRoster,
    timetable,
    setTimetable,
    schoolDayState,
    setSchoolDayState,
    initSchoolYear,
    getTeacherForSubject,
    getTodaySchedule,
  }
}
