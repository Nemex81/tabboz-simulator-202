/**
 * useSchoolHandlers.ts — hook che centralizza tutti gli handler scolastici.
 * Estratti da App.tsx (STEP 9.2) per ridurre le dimensioni del file principale.
 * Non contiene logica di dominio propria: orchestra le funzioni pure di lib/.
 */
import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import {
  GameStats,
  SubjectGrades,
  SchoolRecord,
  DEFAULT_SCHOOL_RECORD,
  DEFAULT_SCHOOL_DAY_STATE,
  DEFAULT_GAME_STATE,
  DEFAULT_HEALTH_RECORD,
  SchoolType,
  Friend,
  Teacher,
  Classmate,
  TeacherMemoryEntry,
  PlayerProfile,
  ThemeVariant,
  getDefaultGradesForSchoolType,
  WeeklyTimetable,
  TimetableSlot,
  HealthRecord,
  CharacterActivities,
} from '@/lib/types'
import type { GameTime, SchoolDayState, Relationship, ScheduledExam } from '@/lib/types'
import type { ActivePartner } from '@/lib/girlfriend-system'
import { clampStat, calculateMedia, archiveYearGrades } from '@/lib/game-utils'
import { calculateNextSchoolYear } from '@/lib/time-utils'
import { playSound } from '@/lib/sound-effects'
import type { SchoolEvent } from '@/lib/school-events'
import { getParentEventByMedia, EventOutcome } from '@/lib/school-events'
import { drawStreetMorningEvents } from '@/lib/street-morning-events'
import { buildSchoolDayState } from '@/lib/school-actions'
import { resolveSchoolDayBlock } from '@/lib/school-activities'
import { computeEventGradeChange, computeReportCardVerdict } from '@/lib/school-event-handlers'
import { promoteToFriend } from '@/lib/classmate-relations'
import { applyTeacherRelationChange } from '@/lib/teacher-relations'
import { applyYearTransition } from '@/lib/school-roster-transitions'
import { toast } from 'sonner'

// ── Tipi helper ──────────────────────────────────────────────────────────────

type SetState<T> = Dispatch<SetStateAction<T>>
type Phase = string | null
type DayType = string | null
type TeacherActionType = 'corrompi' | 'minaccia'
type AddLogEntry = (
  category: string,
  title: string,
  message: string,
  type: 'positive' | 'negative' | 'neutral',
  date: GameTime['currentDate'],
  phase: string
) => void

// ── Parametri del hook ───────────────────────────────────────────────────────

export interface UseSchoolHandlersParams {
  stats: GameStats
  setStats: SetState<GameStats>
  grades: SubjectGrades
  setGrades: SetState<SubjectGrades>
  schoolRecord: SchoolRecord
  setSchoolRecord: SetState<SchoolRecord>
  schoolType: SchoolType | null
  schoolEvent: SchoolEvent | null
  setSchoolEvent: SetState<SchoolEvent | null>
  gameTime: GameTime
  setGameTime: SetState<GameTime>
  timetable: WeeklyTimetable | null
  teachers: Teacher[]
  setTeachers: SetState<Teacher[]>
  classRoster: Classmate[]
  setClassRoster: SetState<Classmate[]>
  friends: Friend[]
  setRawFriends: SetState<Friend[]>
  setRelationships: SetState<Relationship[]>
  setScheduledExams: SetState<ScheduledExam[]>
  setActivePartners: SetState<ActivePartner[]>
  gameWon: boolean
  phaseActionsRemaining: number
  currentPhase: Phase
  dayType: DayType
  activities: CharacterActivities
  marinatoOggi: boolean
  teacherActionType: TeacherActionType
  setTeacherActionType: SetState<TeacherActionType>
  setShowTeacherDialog: SetState<boolean>
  setShowSchoolMorning: SetState<boolean>
  setSchoolMorningEvents: SetState<import('@/lib/school-morning-events').SchoolMorningEvent[]>
  setShowStreetMorning: SetState<boolean>
  setStreetMorningEvents: SetState<ReturnType<typeof drawStreetMorningEvents>>
  setShowSchoolEvent: SetState<boolean>
  setShowReportCard: SetState<boolean>
  setGameOver: SetState<boolean>
  setGameOverReason: SetState<string>
  setShowResetDialog: SetState<boolean>
  setGameWon: SetState<boolean>
  rawGradesHistory: Record<number, SubjectGrades>
  setRawGradesHistory: SetState<Record<number, SubjectGrades>>
  setSchoolType: SetState<SchoolType | null>
  setPlayerProfile: SetState<PlayerProfile | null>
  setCurrentTheme: SetState<ThemeVariant>
  setSchoolDayState: SetState<SchoolDayState>
  setTimetable: SetState<WeeklyTimetable | null>
  consumeAllMorningActions: () => void
  getTodaySchedule: (day: number) => TimetableSlot[]
  canAttendSchool: () => boolean
  handleMarinaFromHook: () => void
  handleCorrompiSubject: (subject: string) => void
  handleMinacciaSubject: (subject: string) => void
  handleStudySubject: (subject: string) => void
  setMorningChoicePending: SetState<boolean>
  setMarinatoOggi: SetState<boolean>
  clearLog: () => void
  setHealthRecord: SetState<HealthRecord>
  announce: (msg: string, priority?: 'polite' | 'assertive') => void
  addLogEntry: AddLogEntry
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSchoolHandlers(p: UseSchoolHandlersParams) {
  const scheduleAcrossFrames = useCallback((tasks: Array<() => void>) => {
    const runTask = (index: number) => {
      if (index >= tasks.length) return

      if (typeof window === 'undefined') {
        tasks[index]()
        runTask(index + 1)
        return
      }

      window.requestAnimationFrame(() => {
        tasks[index]()
        runTask(index + 1)
      })
    }

    runTask(0)
  }, [])

  // ── handlePromoteToFriend ─────────────────────────────────────────────────
  const handlePromoteToFriend = useCallback((classmateId: string) => {
    const classmate = (p.classRoster ?? []).find(c => c.id === classmateId)
    if (!classmate) return
    try {
      const newFriend = promoteToFriend(classmate, p.gameTime.schoolYear.currentYear)
      p.setRawFriends(prev => [...(prev ?? []), newFriend])
      p.setClassRoster(prev => (prev ?? []).map(c =>
        c.id === classmateId ? { ...c, promotedToFriend: true } : c
      ))
      playSound.success()
      p.announce(`🎉 ${classmate.name} è ora un tuo amico!`)
    } catch {
      p.announce(`Non puoi ancora aggiungere ${classmate.name} agli amici (relazione insufficiente).`)
    }
  }, [p.classRoster, p.gameTime.schoolYear.currentYear, p.setRawFriends, p.setClassRoster, p.announce])

  // ── handleOpenCorrompiDialog ──────────────────────────────────────────────
  const handleOpenCorrompiDialog = useCallback(() => {
    if (p.phaseActionsRemaining <= 0) {
      playSound.failure()
      p.announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    if (p.stats.soldi < 100) {
      playSound.failure()
      p.announce('Non hai abbastanza GRANA per la MAZZETTA! Servono 100€')
      return
    }
    p.setTeacherActionType('corrompi')
    p.setShowTeacherDialog(true)
  }, [p.phaseActionsRemaining, p.stats.soldi, p.setTeacherActionType, p.setShowTeacherDialog, p.announce])

  // ── handleOpenMinacciaDialog ──────────────────────────────────────────────
  const handleOpenMinacciaDialog = useCallback(() => {
    if (p.phaseActionsRemaining <= 0) {
      playSound.failure()
      p.announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    p.setTeacherActionType('minaccia')
    p.setShowTeacherDialog(true)
  }, [p.phaseActionsRemaining, p.setTeacherActionType, p.setShowTeacherDialog, p.announce])

  // ── handleTeacherSelection ────────────────────────────────────────────────
  const handleTeacherSelection = useCallback((subject: string) => {
    if (p.teacherActionType === 'corrompi') {
      p.handleCorrompiSubject(subject)
    } else {
      p.handleMinacciaSubject(subject)
    }
  }, [p.teacherActionType, p.handleCorrompiSubject, p.handleMinacciaSubject])

  // ── handleVaiAScuola ──────────────────────────────────────────────────────
  const handleVaiAScuola = useCallback(() => {
    if (p.phaseActionsRemaining <= 0) {
      playSound.failure()
      p.announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    if (p.dayType !== 'feriale' || p.currentPhase !== 'mattina' || !p.gameTime.schoolYear.isSchoolPeriod) {
      playSound.failure()
      p.announce('Puoi andare a scuola solo la mattina dei giorni feriali durante il periodo scolastico!')
      return
    }
    if (p.schoolRecord.wentToSchoolToday) {
      playSound.failure()
      p.announce('Sei già andato a scuola oggi!')
      return
    }
    if (!p.canAttendSchool()) {
      playSound.failure()
      p.announce('Non puoi andare a scuola: sei troppo malato! Resta a casa.')
      p.addLogEntry('health', 'Assenza forzata', 'Non puoi andare a scuola a causa delle condizioni di salute.', 'negative', p.gameTime.currentDate, p.currentPhase ?? 'mattina')
      return
    }
    playSound.buttonClick()

    const schoolDay = buildSchoolDayState(p.timetable, p.gameTime.currentDate, p.teachers, p.stats, p.getTodaySchedule)

    if (p.activities.school.mode === 'rapida' && schoolDay.type === 'sequence') {
      const report = resolveSchoolDayBlock(
        schoolDay.state.slots,
        p.teachers,
        p.stats,
        p.activities.school
      )

      const baseDelta = { intelligenza: 2, stanchezza: 10 }
      p.setStats((current) => {
        const updated = { ...current! }
        const numeric = updated as unknown as Record<string, number>

        // Applica base delta
        for (const [k, v] of Object.entries(baseDelta)) {
          numeric[k] = clampStat(numeric[k] + v)
        }

        // Applica report delta
        for (const [k, v] of Object.entries(report.totalDelta)) {
          if (typeof v !== 'number') continue
          if (k === 'soldi') {
            numeric[k] = clampStat(numeric[k] + v, 0, 1000)
          } else {
            numeric[k] = clampStat(numeric[k] + v)
          }
        }
        return updated
      })

      p.setSchoolRecord((current): SchoolRecord => ({
        ...(current ?? DEFAULT_SCHOOL_RECORD),
        wentToSchoolToday: true,
        isAtSchool: true
      }))
      p.setMorningChoicePending(false)

      p.addLogEntry(
        'school', 
        'Scuola in modalità rapida', 
        `Sei andato a scuola con condotta "${p.activities.school.archetype}". Risoluzione automatica in blocco completata.`, 
        'positive', 
        p.gameTime.currentDate, 
        p.currentPhase ?? 'mattina'
      )

      for (const lesson of report.lessonsResolved) {
        if (lesson.eventMsg) {
          p.addLogEntry(
            'school',
            `Ora ${lesson.hour}: ${lesson.subject}`,
            `Evento: ${lesson.eventMsg} (Scelta automatica: ${lesson.autoChoiceLabel})`,
            'neutral',
            p.gameTime.currentDate,
            p.currentPhase ?? 'mattina'
          )
        }
      }

      if (report.breakMsg) {
        p.addLogEntry(
          'school',
          'Intervallo',
          report.breakMsg,
          'neutral',
          p.gameTime.currentDate,
          p.currentPhase ?? 'mattina'
        )
      }

      if (report.newFriends.length > 0) {
        p.setRawFriends((prev) => [...(prev ?? []), ...report.newFriends])
        for (const f of report.newFriends) {
          p.addLogEntry(
            'social',
            'Nuova amicizia',
            `Hai stretto amicizia con ${f.name}!`,
            'positive',
            p.gameTime.currentDate,
            p.currentPhase ?? 'mattina'
          )
        }
      }

      const completedSlots = schoolDay.state.slots.map(s => ({ ...s, completed: true }))
      p.setSchoolDayState({
        ...schoolDay.state,
        slots: completedSlots,
        currentSlotIndex: completedSlots.length,
        isComplete: true,
        report
      })

      p.setShowSchoolMorning(true)
      p.announce('Giornata scolastica risolta automaticamente. Leggi il resoconto.')
    } else {
      p.setSchoolRecord((current): SchoolRecord => ({
        ...(current ?? DEFAULT_SCHOOL_RECORD),
        wentToSchoolToday: true,
        isAtSchool: true
      }))
      p.setMorningChoicePending(false)
      p.announce('Sei andato a scuola! +2 Intelligenza, +10 Stanchezza. Segui le lezioni!')
      p.addLogEntry('school', 'Vai a scuola', 'Sei andato a scuola! +2 Intelligenza, +10 Stanchezza. Segui le lezioni!', 'positive', p.gameTime.currentDate, p.currentPhase ?? 'mattina')

      scheduleAcrossFrames([
        () => p.setStats((current) => ({
          ...current!,
          intelligenza: clampStat(current!.intelligenza + 2),
          stanchezza: clampStat(current!.stanchezza + 10)
        })),
        () => {
          if (schoolDay.type === 'sequence') {
            p.setSchoolDayState(schoolDay.state)
          } else {
            p.setSchoolMorningEvents(schoolDay.morningEvents)
          }
          p.setShowSchoolMorning(true)
        },
      ])
    }
  }, [
    p.phaseActionsRemaining, p.dayType, p.currentPhase, p.gameTime,
    p.schoolRecord, p.canAttendSchool, p.setStats, p.setSchoolRecord,
    p.setMorningChoicePending, p.announce, p.activities, p.setRawFriends,
    p.addLogEntry, p.timetable, p.teachers, p.stats, p.getTodaySchedule,
    p.setSchoolDayState, p.setSchoolMorningEvents, p.setShowSchoolMorning,
    scheduleAcrossFrames,
  ])

  // ── handleMarina ──────────────────────────────────────────────────────────
  const handleMarina = useCallback(() => {
    if (p.schoolRecord.wentToSchoolToday || p.marinatoOggi) {
      playSound.failure()
      p.announce('Hai già scelto per questa mattina!')
      return
    }
    p.setMarinatoOggi(true)
    p.setShowSchoolMorning(false)
    p.setSchoolMorningEvents([])
    p.setMorningChoicePending(false)
    p.setSchoolRecord((current): SchoolRecord => ({
      ...(current ?? DEFAULT_SCHOOL_RECORD),
      isAtSchool: false
    }))
    const streetEvents = drawStreetMorningEvents(6)
    p.setStreetMorningEvents(streetEvents)
    p.setShowStreetMorning(true)
    p.handleMarinaFromHook()
  }, [
    p.schoolRecord, p.marinatoOggi, p.setMarinatoOggi, p.setShowSchoolMorning,
    p.setSchoolMorningEvents, p.setMorningChoicePending, p.setSchoolRecord,
    p.setStreetMorningEvents, p.setShowStreetMorning, p.handleMarinaFromHook, p.announce,
  ])

  // ── handleSchoolEventChoice ───────────────────────────────────────────────
  const handleSchoolEventChoice = useCallback((choiceIndex: number) => {
    if (!p.schoolEvent) return
    const outcome: EventOutcome = p.schoolEvent.choices[choiceIndex].action()

    if (outcome.statChanges) {
      p.setStats((current) => {
        const updated = { ...current! }
        Object.entries(outcome.statChanges!).forEach(([key, value]) => {
          if (typeof value !== 'number') return
          const statKey = key as keyof GameStats
          if (statKey === 'soldi') {
            ;(updated as unknown as Record<string, number>)[statKey] = clampStat((updated[statKey] as number) + value, 0, 1000)
          } else {
            ;(updated as unknown as Record<string, number>)[statKey] = clampStat((updated[statKey] as number) + value)
          }
        })
        return updated
      })
    }

    const gradeResult = computeEventGradeChange(outcome, p.grades, p.schoolType)
    let deltaMsg = ''
    if (gradeResult) {
      deltaMsg = gradeResult.deltaMsg
      p.setGrades((current) => ({
        ...current,
        [gradeResult.targetSubject]: gradeResult.newGrade,
      }))
    }

    if (outcome.conductChange !== undefined || outcome.noteChange !== undefined) {
      const oldCondotta = p.schoolRecord.condotta
      const newCondotta = outcome.conductChange !== undefined
        ? clampStat(oldCondotta + outcome.conductChange, 0, 10)
        : oldCondotta
      if (outcome.conductChange !== undefined) {
        const conductStr = ` | Condotta: ${oldCondotta.toFixed(1)} → ${newCondotta.toFixed(1)}`
        deltaMsg = deltaMsg ? deltaMsg + conductStr : `📊${conductStr.trimStart()}`
      }
      p.setSchoolRecord((current): SchoolRecord => ({
        ...(current ?? DEFAULT_SCHOOL_RECORD),
        condotta: outcome.conductChange !== undefined
          ? clampStat((current ?? DEFAULT_SCHOOL_RECORD).condotta + outcome.conductChange, 0, 10)
          : (current ?? DEFAULT_SCHOOL_RECORD).condotta,
        note: outcome.noteChange !== undefined
          ? (current ?? DEFAULT_SCHOOL_RECORD).note + outcome.noteChange
          : (current ?? DEFAULT_SCHOOL_RECORD).note,
        consecutiveGoodDays: (outcome.conductChange !== undefined && outcome.conductChange < 0)
          ? 0
          : (current ?? DEFAULT_SCHOOL_RECORD).consecutiveGoodDays
      }))
    }

    playSound.eventTrigger()
    p.announce(outcome.message)
    p.addLogEntry(
      'school',
      p.schoolEvent?.title ?? 'Evento scolastico',
      outcome.message,
      outcome.statChanges
        ? (Object.values(outcome.statChanges).filter((value): value is number => typeof value === 'number').reduce((a, b) => a + b, 0) >= 0 ? 'positive' : 'negative')
        : 'neutral',
      p.gameTime.currentDate,
      p.currentPhase ?? 'mattina'
    )
    if (deltaMsg) toast(deltaMsg)
    p.setShowSchoolEvent(false)
    p.setSchoolEvent(null)
  }, [
    p.schoolEvent, p.setStats, p.grades, p.schoolType, p.setGrades,
    p.schoolRecord, p.setSchoolRecord, p.announce, p.addLogEntry,
    p.gameTime.currentDate, p.currentPhase, p.setShowSchoolEvent, p.setSchoolEvent,
  ])

  // ── handleReportCardContinue ──────────────────────────────────────────────
  const handleReportCardContinue = useCallback(() => {
    p.setShowReportCard(false)
    const verdict = computeReportCardVerdict(
      p.grades, p.schoolType, p.schoolRecord.condotta, p.schoolRecord.assenze,
      p.gameWon, p.gameTime.schoolYear.currentYear
    )
    if (verdict.type === 'game_won') {
      playSound.bigWin()
      p.setGameOver(true)
      p.setGameOverReason('HAI VINTO! Hai superato la MATURITÀ! Sei una LEGGENDA!')
      return
    }
    if (verdict.type === 'too_many_absences' || verdict.type === 'failed' || verdict.type === 'bad_conduct') {
      playSound.gameOver()
      p.setGameOver(true)
      p.setGameOverReason(verdict.reason)
      return
    }
    const { completedYear, newYear } = verdict
    if (p.schoolType) {
      const { archived, next } = archiveYearGrades(p.grades, p.schoolType, completedYear)
      p.setRawGradesHistory(prev => ({ ...(prev ?? {}), [completedYear]: archived }))
      p.setGrades(next)
    } else {
      p.setGrades(getDefaultGradesForSchoolType('tecnico'))
    }
    p.setGameTime((current) => ({
      ...current!,
      schoolYear: calculateNextSchoolYear(current!.schoolYear),
      age: current!.age + 1
    }))
    p.setSchoolRecord(DEFAULT_SCHOOL_RECORD)
    if (p.schoolType) {
      const transition = applyYearTransition(p.classRoster, p.teachers, p.schoolType, newYear, p.friends)
      p.setTeachers(transition.newTeachers)
      p.setClassRoster(transition.newRoster)
      p.setRawFriends(transition.updatedFriends)
    }
    playSound.success()
    p.announce(`PROMOSSO! Ora sei in ${newYear}° superiore! I voti sono stati resettati.`)
  }, [
    p.setShowReportCard, p.grades, p.schoolType, p.schoolRecord, p.gameWon,
    p.gameTime.schoolYear.currentYear, p.setGameOver, p.setGameOverReason,
    p.setRawGradesHistory, p.setGrades, p.setGameTime, p.setSchoolRecord,
    p.classRoster, p.teachers, p.setTeachers, p.setClassRoster,
    p.setRawFriends, p.friends, p.announce,
  ])

  // ── handleSchoolSelection ─────────────────────────────────────────────────
  const handleSchoolSelection = useCallback((
    selected: SchoolType,
    profile: PlayerProfile,
    theme: ThemeVariant,
    startingMoped: string
  ) => {
    playSound.success()
    p.setSchoolType(selected)
    p.setPlayerProfile(profile)
    p.setCurrentTheme(theme)
    p.setGrades(getDefaultGradesForSchoolType(selected))
    p.setRawGradesHistory({})

    p.setStats((current) => {
      let coattaggineBonus = 0
      let figositaBonus = 0
      if (startingMoped === 'califfone') {
        coattaggineBonus = 10
      } else if (startingMoped === 'vespa50') {
        figositaBonus = 15
      }

      return {
        ...current,
        hasMotorino: true,
        motorinoModello: startingMoped,
        motorinoTuning: 0,
        motorinoPezzi: [],
        coattaggine: Math.min(100, current.coattaggine + coattaggineBonus),
        figosita: Math.min(100, current.figosita + figositaBonus),
      }
    })

    const mopedLabel = startingMoped === 'ciao' ? 'Piaggio Ciao' : startingMoped === 'califfone' ? 'Garelli Califfone' : 'Vespa 50 Special'
    p.announce(`Ciao ${profile.name}! Hai scelto: ${selected.toUpperCase()} e inizierai con un ${mopedLabel}! Buona fortuna!`)
  }, [p.setSchoolType, p.setPlayerProfile, p.setCurrentTheme, p.setGrades, p.setRawGradesHistory, p.setStats, p.announce])

  // ── handleThemeChange ─────────────────────────────────────────────────────
  const handleThemeChange = useCallback((theme: ThemeVariant) => {
    p.setCurrentTheme(theme)
    p.announce(`Tema cambiato: ${theme === 'default' ? 'Default Neon Blu' : theme === 'dark' ? 'Dark Nero Viola' : 'Green Ganja Style'}`)
  }, [p.setCurrentTheme, p.announce])

  // ── handleReset ───────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    playSound.reset()
    p.setGameOver(false)
    p.setGameOverReason('')
    p.setShowResetDialog(false)
    p.setGameWon(false)
    p.setShowSchoolMorning(false)
    p.setSchoolMorningEvents([])
    p.setShowStreetMorning(false)
    p.setStreetMorningEvents([])
    p.setMorningChoicePending(false)
    p.setMarinatoOggi(false)
    p.clearLog()
    p.announce('Gioco RESETTATO! Crea di nuovo il tuo personaggio!')

    scheduleAcrossFrames([
      () => p.setStats(DEFAULT_GAME_STATE.stats),
      () => p.setGrades(p.schoolType ? getDefaultGradesForSchoolType(p.schoolType) : DEFAULT_GAME_STATE.grades),
      () => p.setGameTime(DEFAULT_GAME_STATE.gameTime),
      () => p.setRawFriends([]),
      () => p.setRelationships([]),
      () => p.setScheduledExams([]),
      () => p.setActivePartners([]),
      () => p.setSchoolType(null),
      () => p.setPlayerProfile(null),
      () => p.setSchoolRecord(DEFAULT_SCHOOL_RECORD),
      () => p.setRawGradesHistory({}),
      () => p.setHealthRecord(DEFAULT_HEALTH_RECORD),
      () => p.setTeachers([]),
      () => p.setClassRoster([]),
      () => p.setTimetable(null),
      () => p.setSchoolDayState(DEFAULT_SCHOOL_DAY_STATE),
    ])
  }, [
    p.setStats, p.setGrades, p.schoolType, p.setGameTime,
    p.setRawFriends, p.setRelationships, p.setScheduledExams, p.setActivePartners,
    p.setGameOver, p.setGameOverReason, p.setShowResetDialog, p.setGameWon,
    p.setSchoolType, p.setPlayerProfile, p.setSchoolRecord,
    p.setRawGradesHistory, p.clearLog, p.setHealthRecord, p.announce,
    p.setShowSchoolMorning, p.setSchoolMorningEvents, p.setShowStreetMorning,
    p.setStreetMorningEvents, p.setMorningChoicePending, p.setMarinatoOggi,
    p.setTeachers, p.setClassRoster, p.setTimetable, p.setSchoolDayState,
    scheduleAcrossFrames,
  ])

  // ── Callback per SchoolTab ────────────────────────────────────────────────
  const onTeacherInteraction = useCallback((
    teacherId: string,
    delta: number,
    reason: TeacherMemoryEntry['type'],
    date: GameTime['currentDate']
  ) => {
    p.setTeachers(prev => {
      const teacher = prev.find(t => t.id === teacherId)
      if (!teacher) return prev
      const updated = applyTeacherRelationChange(teacher, delta, reason, date)
      return prev.map(t => t.id === teacherId ? updated : t)
    })
  }, [p.setTeachers])

  const onSlotComplete = useCallback((idx: number) => {
    p.setSchoolDayState((prev) => {
      const next = idx + 1
      return { ...prev, currentSlotIndex: next, isComplete: next >= prev.slots.length }
    })
  }, [p.setSchoolDayState])

  const onBreakComplete = useCallback(() => {
    p.setSchoolDayState((prev) => {
      const next = prev.currentSlotIndex + 1
      return { ...prev, currentSlotIndex: next, isComplete: next >= prev.slots.length }
    })
  }, [p.setSchoolDayState])

  const onTeacherChange = useCallback((updater: (prev: Teacher[]) => Teacher[]) => {
    p.setTeachers(prev => updater(prev ?? []))
  }, [p.setTeachers])

  const onClassmateChange = useCallback((updater: (prev: Classmate[]) => Classmate[]) => {
    p.setClassRoster(prev => updater(prev ?? []))
  }, [p.setClassRoster])

  const onNewFriend = useCallback((f: Friend) => {
    p.setRawFriends(prev => [...(prev ?? []), f])
  }, [p.setRawFriends])

  // ─────────────────────────────────────────────────────────────────────────
  return {
    handlePromoteToFriend,
    handleOpenCorrompiDialog,
    handleOpenMinacciaDialog,
    handleTeacherSelection,
    handleVaiAScuola,
    handleMarina,
    handleSchoolEventChoice,
    handleReportCardContinue,
    handleSchoolSelection,
    handleThemeChange,
    handleReset,
    onTeacherInteraction,
    onSlotComplete,
    onBreakComplete,
    onTeacherChange,
    onClassmateChange,
    onNewFriend,
  }
}
