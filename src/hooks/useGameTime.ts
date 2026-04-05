import { useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { GameTime, SubjectGrades, GameStats, SchoolType, ScheduledExam, DayPhase, DayType, SchoolRecord } from '@/lib/types'
import { DEFAULT_GAME_STATE, getDefaultGradesForSchoolType, getSubjectDisplayName } from '@/lib/types'
import { validateGameTime, validateScheduledExams } from '@/lib/data-validation'
import {
  advanceGameTime,
  shouldShowReportCard,
  calculateNextSchoolYear,
  shouldReceivePaghetta,
  getDayType,
  DAY_PHASE_CONFIG,
  PHASE_SEQUENCE,
} from '@/lib/time-utils'
import { generateScheduledExam, calculateExamGrade, getDifficultyText, getDifficultyAnnouncement } from '@/lib/exam-system'
import { getParentEventByMedia, getTeacherEvent } from '@/lib/school-events'
import { calculateMedia, clampStat } from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'
import { SchoolEvent } from '@/lib/school-events'
import { drawSchoolMorningEvents, SchoolMorningEvent } from '@/lib/school-morning-events'

interface UseGameTimeParams {
  grades: SubjectGrades
  stats: GameStats
  schoolType: SchoolType | null
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  setReportCardPassed: (v: boolean) => void
  setShowReportCard: (v: boolean) => void
  setGameWon: (v: boolean) => void
  setSchoolEvent: (v: SchoolEvent | null) => void
  setShowSchoolEvent: (v: boolean) => void
  setSchoolMorningEvents: (events: SchoolMorningEvent[]) => void
  setShowSchoolMorning: (v: boolean) => void
  announce: (msg: string) => void
  setSchoolRecord: (updater: ((prev: SchoolRecord) => SchoolRecord) | SchoolRecord) => void
  schoolRecord: SchoolRecord
}

export function useGameTime({
  grades,
  stats,
  schoolType,
  setStats,
  setReportCardPassed,
  setShowReportCard,
  setGameWon,
  setSchoolEvent,
  setShowSchoolEvent,
  setSchoolMorningEvents,
  setShowSchoolMorning,
  announce,
  setSchoolRecord,
  schoolRecord
}: UseGameTimeParams) {
  const [rawGameTime, setRawGameTime] = useKV<GameTime>('tabboz-time', DEFAULT_GAME_STATE.gameTime)
  const [rawScheduledExams, setRawScheduledExams] = useKV<ScheduledExam[]>('tabboz-exams', [])

  // Fasce orarie — stato persistito separatamente per retrocompatibilità
  const [currentPhase, setCurrentPhase] = useKV<DayPhase>('tabboz-phase', 'mattina')
  const [dayType, setDayType] = useKV<DayType>('tabboz-day-type', 'feriale')
  const [phaseActionsRemaining, setPhaseActionsRemaining] = useKV<number>('tabboz-phase-actions', 2)

  const gameTime = validateGameTime(rawGameTime)
  const scheduledExams = validateScheduledExams(rawScheduledExams)

  // Refs per accesso stabile nei callback
  const gradesRef = useRef(grades)
  gradesRef.current = grades
  const statsRef = useRef(stats)
  statsRef.current = stats
  const schoolTypeRef = useRef(schoolType)
  schoolTypeRef.current = schoolType
  // A6: refs per handleDormi
  const phaseActionsRemainingRef = useRef(phaseActionsRemaining)
  phaseActionsRemainingRef.current = phaseActionsRemaining
  const currentPhaseRef = useRef(currentPhase)
  currentPhaseRef.current = currentPhase

  const consumeAction = useCallback(() => {
    // Solo phaseActionsRemaining viene decrementata (Fix5)
    setPhaseActionsRemaining((n) => Math.max(0, n - 1))
  }, [setPhaseActionsRemaining])

  /** Avanza alla fase successiva; se torna a 'mattina' avanza anche il giorno. */
  const advancePhaseOnly = useCallback(() => {
    const currentIdx = PHASE_SEQUENCE.indexOf(currentPhase)
    const nextIdx = (currentIdx + 1) % PHASE_SEQUENCE.length
    const nextPhase = PHASE_SEQUENCE[nextIdx]

    if (nextPhase === 'mattina') {
      const nightRecovery = DAY_PHASE_CONFIG[dayType]['notte'].nightRecovery
      if (nightRecovery !== 0) {
        setStats((current) => ({
          ...current,
          stanchezza: clampStat(current.stanchezza + nightRecovery)
        }))
      }
      setRawGameTime((current) => {
        const newGt = advanceGameTime(current)
        const newDayType = getDayType(newGt.currentDate)
        setDayType(newDayType)
        setCurrentPhase('mattina')
        setPhaseActionsRemaining(DAY_PHASE_CONFIG[newDayType]['mattina'].maxActions)

        if (!schoolRecord.wentToSchoolToday && newDayType === 'feriale' && newGt.schoolYear.isSchoolPeriod) {
          setSchoolRecord((prev) => ({
            ...prev,
            assenze: prev.assenze + 1,
            condotta: clampStat(prev.condotta - 0.2, 0, 10),
            consecutiveGoodDays: 0,
            wentToSchoolToday: false
          }))
          announce('Non sei andato a scuola ieri! +1 Assenza, -0.2 Condotta')
        } else if (schoolRecord.wentToSchoolToday && newDayType === 'feriale' && newGt.schoolYear.isSchoolPeriod) {
          const newCGD = (schoolRecord.consecutiveGoodDays ?? 0) + 1
          const conductaBonus = newCGD % 5 === 0
          setSchoolRecord((prev) => ({
            ...prev,
            consecutiveGoodDays: newCGD,
            condotta: conductaBonus ? clampStat(prev.condotta + 0.3, 0, 10) : prev.condotta,
            wentToSchoolToday: false
          }))
          if (conductaBonus) announce(`🌟 ${newCGD} giorni di comportamento esemplare! +0.3 Condotta`)
        } else {
          setSchoolRecord((prev) => ({
            ...prev,
            wentToSchoolToday: false
          }))
        }

        return newGt
      })
    } else {
      const cfg = DAY_PHASE_CONFIG[dayType][nextPhase]
      setCurrentPhase(nextPhase)
      setPhaseActionsRemaining(cfg.maxActions)
    }
    playSound.buttonClick()
    announce(`Fascia oraria: ${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)}`)
  }, [currentPhase, dayType, setStats, setRawGameTime, setCurrentPhase, setDayType, setPhaseActionsRemaining,
      setSchoolMorningEvents, setShowSchoolMorning, announce, schoolRecord, setSchoolRecord])

  const advanceToNextDay = useCallback(() => {
    setRawGameTime((current) => {
      const newGameTime = advanceGameTime(current)

      // Reset fasce orarie al nuovo giorno
      const newDayType = getDayType(newGameTime.currentDate)
      setDayType(newDayType)
      setCurrentPhase('mattina')
      setPhaseActionsRemaining(DAY_PHASE_CONFIG[newDayType]['mattina'].maxActions)

      const currentMedia = calculateMedia(gradesRef.current)
      const st = schoolTypeRef.current

      if (shouldReceivePaghetta(newGameTime.currentDate, current.lastPaghettaDate)) {
        if (currentMedia >= 7) {
          const paghetta = 50
          setStats((s) => ({ ...s, soldi: clampStat(s.soldi + paghetta, 0, 1000) }))
          playSound.moneyEarned()
          announce(`SABATO! I tuoi ti hanno dato la PAGHETTA! +${paghetta}€ (media ≥ 7)`)
          return { ...newGameTime, lastPaghettaDate: newGameTime.currentDate }
        } else {
          const parentEvent = getParentEventByMedia(currentMedia, statsRef.current)
          if (parentEvent) {
            setSchoolEvent(parentEvent)
            setShowSchoolEvent(true)
          }
          return { ...newGameTime, lastPaghettaDate: newGameTime.currentDate }
        }
      }

      if (shouldShowReportCard(newGameTime.currentDate, newGameTime.schoolYear.reportCardDate)) {
        const media = calculateMedia(gradesRef.current)
        const passed = media >= 6
        setReportCardPassed(passed)
        setShowReportCard(true)
        if (passed && newGameTime.schoolYear.currentYear === 5) {
          setGameWon(true)
        }
      }

      if (Math.random() < 0.15 && newGameTime.schoolYear.isSchoolPeriod && st && schoolRecord.wentToSchoolToday) {
        const teacherEvent = getTeacherEvent(st)
        setSchoolEvent(teacherEvent)
        setShowSchoolEvent(true)
      }

      setRawScheduledExams((currentExams) => {
        const g = gradesRef.current
        const s = statsRef.current
        const updatedExams = currentExams
          .map((exam) => {
            const newDaysUntil = exam.daysUntil - 1

            if (newDaysUntil === 3 && !exam.announced) {
              const announcementText = getDifficultyAnnouncement(
                getSubjectDisplayName(exam.subject),
                exam.difficulty
              )
              playSound.eventTrigger()
              announce(announcementText)
              return { ...exam, daysUntil: newDaysUntil, announced: true }
            }

            if (newDaysUntil <= 0) {
              const currentMedia = calculateMedia(g)
              const examGrade = calculateExamGrade(
                g[exam.subject] || 6,
                s.intelligenza,
                exam.isPrepared,
                currentMedia,
                exam.difficulty
              )
              setRawGameTime((gt) => gt) // no-op to flush; grade set separately
              // setGrades must be called from outside — return exam data via side effect
              const diffText = getDifficultyText(exam.difficulty)
              const resultText = exam.isPrepared
                ? `VERIFICA ${diffText} di ${getSubjectDisplayName(exam.subject)}! Eri PREPARATO! Voto: ${examGrade.toFixed(1)}`
                : `VERIFICA ${diffText} di ${getSubjectDisplayName(exam.subject)}! Non eri preparato... Voto: ${examGrade.toFixed(1)}`
              announce(resultText)
              return null
            }
            return { ...exam, daysUntil: newDaysUntil }
          })
          .filter((e): e is ScheduledExam => e !== null)

        if (newGameTime.schoolYear.isSchoolPeriod && updatedExams.length < 3 && Math.random() < 0.3 && st) {
          const subjects = Object.keys(gradesRef.current)
          const newExam = generateScheduledExam(subjects)
          announce(
            `NUOVA VERIFICA programmata di ${getSubjectDisplayName(newExam.subject)} tra ${newExam.daysUntil} giorni! Difficoltà: ${getDifficultyText(newExam.difficulty)}`
          )
          return [...updatedExams, newExam]
        }
        return updatedExams
      })

      return newGameTime
    })
    // F3: reset flag presenza giornaliera (per handleDormi che salta le fasi)
    setSchoolRecord((prev) => ({ ...prev, wentToSchoolToday: false }))
    playSound.success()
    announce('Nuovo giorno! Azioni ripristinate.')
  }, [
    setRawGameTime,
    setRawScheduledExams,
    setStats,
    setReportCardPassed,
    setShowReportCard,
    setGameWon,
    setSchoolEvent,
    setShowSchoolEvent,
    announce,
    setDayType,
    setCurrentPhase,
    setPhaseActionsRemaining
  ])

  const gainExtraAction = useCallback(() => {
    setPhaseActionsRemaining((n) => n + 1)
    announce('Hai guadagnato un\'AZIONE EXTRA! Usala saggiamente.')
  }, [setPhaseActionsRemaining, announce])

  // A6 — Nuova azione dormi
  const handleDormi = useCallback(() => {
    const phase = currentPhaseRef.current
    if (phase !== 'sera' && phase !== 'notte') {
      playSound.failure()
      announce('Puoi dormire solo la sera o di notte!')
      return
    }
    playSound.buttonClick()
    const isNight = phase === 'notte'
    setStats((current) => {
      const recovery = isNight ? Math.round(current.stanchezza * 0.80) : current.stanchezza
      return { ...current, stanchezza: clampStat(current.stanchezza - recovery) }
    })
    const msg = isNight
      ? 'Sei crollato di notte! Riposo parziale (80%). Ci si vede domani!'
      : 'Dormi come un ghiro! Stanchezza AZZERATA. Buonanotte!'
    announce(msg)
    playSound.success()
    advanceToNextDay()
  }, [setStats, announce, advanceToNextDay])

  return {
    gameTime,
    setGameTime: setRawGameTime,
    scheduledExams,
    setScheduledExams: setRawScheduledExams,
    consumeAction,
    advanceToNextDay,
    gainExtraAction,
    handleDormi,
    // Fasce orarie
    currentPhase,
    setCurrentPhase,
    dayType,
    setDayType,
    phaseActionsRemaining,
    setPhaseActionsRemaining,
    advancePhaseOnly,
  }
}
