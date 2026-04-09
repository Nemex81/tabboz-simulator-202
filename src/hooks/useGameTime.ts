import { useCallback, useRef } from 'react'
import { useKV } from '@/hooks/useHydratedKV'
import { GameTime, SubjectGrades, GameStats, SchoolType, ScheduledExam, DayPhase, DayType, SchoolRecord } from '@/lib/types'
import { DEFAULT_GAME_STATE, DEFAULT_SCHOOL_RECORD, getDefaultGradesForSchoolType, getSubjectDisplayName } from '@/lib/types'
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
import { generateScheduledExam, calculateExamGrade, getDifficultyText, getScheduledExamAnnouncement } from '@/lib/exam-system'
import { getParentEventByMedia, getConductEvent, getScaledTeacherEvent } from '@/lib/school-events'
import { calculateMedia, clampStat, getGPASubjectsForYear } from '@/lib/game-utils'
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
  announce: (msg: string, priority?: 'polite' | 'assertive') => void
  setSchoolRecord: (updater: ((prev: SchoolRecord) => SchoolRecord) | SchoolRecord) => void
  schoolRecord: SchoolRecord
  setGameOver: (v: boolean) => void
  setGameOverReason: (v: string) => void
  addLogEntry: (
    type: import('@/lib/types').LogEntryType,
    title: string,
    description: string,
    result: import('@/lib/types').GameLogEntry['result'],
    date: import('@/lib/types').GameDate,
    phase: import('@/lib/types').DayPhase
  ) => void
  tickConditions: (currentDate: import('@/lib/types').GameDate) => void
  checkAutoConditions: (currentDate: import('@/lib/types').GameDate, currentPhase: import('@/lib/types').DayPhase) => void
  /** Callback opzionale invocato a fine di ogni avanzamento giorno (C1). */
  onDayAdvanced?: (newDate: import('@/lib/types').GameDate) => void
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
  schoolRecord,
  setGameOver,
  setGameOverReason,
  addLogEntry,
  tickConditions,
  checkAutoConditions,
  onDayAdvanced,
}: UseGameTimeParams) {
  const [rawGameTime, setRawGameTime] = useKV<GameTime>('tabboz-time', DEFAULT_GAME_STATE.gameTime)
  const [rawScheduledExams, setRawScheduledExams] = useKV<ScheduledExam[]>('tabboz-exams', [])

  // Fasce orarie — stato persistito separatamente per retrocompatibilità
  const [currentPhase, setCurrentPhase] = useKV<DayPhase>('tabboz-phase', 'mattina')
  const [dayType, setDayType] = useKV<DayType>('tabboz-day-type', 'feriale')
  const [phaseActionsRemaining, setPhaseActionsRemaining] = useKV<number>('tabboz-phase-actions', 2)
  const [interazioniRimaste, setInterazioniRimaste] = useKV<number>('tabboz-interazioni', 3)
  const [maxInterazioni, setMaxInterazioni] = useKV<number>('tabboz-max-interazioni', 3)

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
  const gameTimeRef = useRef(gameTime)
  gameTimeRef.current = gameTime

  const consumeAction = useCallback(() => {
    // Solo phaseActionsRemaining viene decrementata (Fix5)
    setPhaseActionsRemaining((n) => Math.max(0, (n ?? 0) - 1))
  }, [setPhaseActionsRemaining])

  const consumeInterazione = useCallback(() => {
    setInterazioniRimaste((current) => {
      const next = current ?? 0
      if (next <= 0) {
        announce('Non hai più interazioni disponibili in questa fase.', 'assertive')
        return 0
      }
      return next - 1
    })
  }, [announce, setInterazioniRimaste])

  // C10 — Consuma tutte le azioni mattutine rimanenti quando il giocatore va a scuola.
  // La mattinata scolastica sostituisce completamente il tempo libero della mattina.
  const consumeAllMorningActions = useCallback(() => {
    setPhaseActionsRemaining(0)
  }, [setPhaseActionsRemaining])

  /** Avanza alla fase successiva; se torna a 'mattina' avanza anche il giorno. */
  const advancePhaseOnly = useCallback(() => {
    const currentIdx = PHASE_SEQUENCE.indexOf(currentPhase ?? 'mattina')
    const nextIdx = (currentIdx + 1) % PHASE_SEQUENCE.length
    const nextPhase = PHASE_SEQUENCE[nextIdx]

    // 8B-5: estrarre prima del setter per chiamare addLogEntry dopo (fuori da ogni setter)
    const wasAbsent =
      !schoolRecord.wentToSchoolToday &&
      dayType === 'feriale' &&
      gameTime.schoolYear.isSchoolPeriod &&
      nextPhase === 'mattina'

    const newMaxInterazioni = Math.min(5, 3 + Math.floor((statsRef.current.carisma ?? 0) / 40))
    if (nextPhase === 'mattina') {
      const nightRecovery = DAY_PHASE_CONFIG[(dayType ?? 'feriale')]['notte'].nightRecovery
      if (nightRecovery !== 0) {
        setStats((current) => ({
          ...current!,
          stanchezza: clampStat(current!.stanchezza + nightRecovery)
        }))
      }
      setRawGameTime((current) => {
        const newGt = advanceGameTime(current!)
        const newDayType = getDayType(newGt.currentDate)
        setDayType(newDayType)
        setCurrentPhase('mattina')
        setPhaseActionsRemaining(DAY_PHASE_CONFIG[newDayType]['mattina'].maxActions)
        setMaxInterazioni(newMaxInterazioni)
        setInterazioniRimaste(newMaxInterazioni)

        if (!schoolRecord.wentToSchoolToday && newDayType === 'feriale' && newGt.schoolYear.isSchoolPeriod) {
          announce('Non sei andato a scuola ieri! La giornata è contata come assenza.')
          setSchoolRecord((prev): SchoolRecord => ({
            ...(prev ?? DEFAULT_SCHOOL_RECORD),
            assenze: (prev ?? DEFAULT_SCHOOL_RECORD).assenze + 1,
            condotta: clampStat((prev ?? DEFAULT_SCHOOL_RECORD).condotta - 0.2, 0, 10),
            consecutiveGoodDays: 0,
            wentToSchoolToday: false,
            isAtSchool: false
          }))
          // F4: soglie assenze
          const newAssenze = schoolRecord.assenze + 1
          if (newAssenze >= 35) {
            setGameOver(true)
            setGameOverReason('Troppe assenze! Non sei stato AMMESSO allo scrutinio. Bocciato per assenze!')
            playSound.gameOver()
          } else if (newAssenze === 25) {
            announce('ATTENZIONE: 25 assenze! Rischi di non essere ammesso allo scrutinio!')
            playSound.eventTrigger()
          } else if (newAssenze === 15) {
            announce('I tuoi genitori hanno ricevuto una LETTERA dalla scuola! -50 Soldi (punizione)')
            setStats((s) => ({ ...(s!), soldi: clampStat(s!.soldi - 50, 0, 1000) }))
            playSound.moneySpent()
          }
        } else if (schoolRecord.wentToSchoolToday && newDayType === 'feriale' && newGt.schoolYear.isSchoolPeriod) {
          const newCGD = (schoolRecord.consecutiveGoodDays ?? 0) + 1
          const conductaBonus = newCGD % 5 === 0
          setSchoolRecord((prev): SchoolRecord => ({
        ...(prev ?? DEFAULT_SCHOOL_RECORD),
        consecutiveGoodDays: newCGD,
        condotta: conductaBonus ? clampStat((prev ?? DEFAULT_SCHOOL_RECORD).condotta + 0.3, 0, 10) : (prev ?? DEFAULT_SCHOOL_RECORD).condotta,
        wentToSchoolToday: false,
        isAtSchool: false
      }))
          if (conductaBonus) announce(`${newCGD} giorni di comportamento esemplare! +0.3 Condotta`)
        } else {
          setSchoolRecord((prev): SchoolRecord => ({
          ...(prev ?? DEFAULT_SCHOOL_RECORD),
          wentToSchoolToday: false,
          isAtSchool: false
        }))
        }

        return newGt
      })
    } else {
      const cfg = DAY_PHASE_CONFIG[(dayType ?? 'feriale')][nextPhase]
      setCurrentPhase(nextPhase)
      setPhaseActionsRemaining(cfg.maxActions)
      setMaxInterazioni(newMaxInterazioni)
      setInterazioniRimaste(newMaxInterazioni)
    }
    playSound.buttonClick()
    announce(`Fascia oraria: ${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)}`)
    // F5: check condotta dopo ogni avanzamento fase
    if (schoolRecord.condotta < 5 && schoolRecord.condotta > 0) {
      announce('🚨 Condotta CRITICA! Ancora qualche nota e vieni ESPULSO!')
      playSound.eventTrigger()
    }
    if (schoolRecord.condotta <= 0) {
      setGameOver(true)
      setGameOverReason('Sei stato ESPULSO dalla scuola per condotta pessima! Game Over.')
      playSound.gameOver()
    }
    // STEP 4: eventi condotta — solo mattina o pomeriggio, non sera/notte
    if (gameTime.schoolYear.isSchoolPeriod
      && (currentPhase === 'mattina' || currentPhase === 'pomeriggio')) {
      const conductEvent = getConductEvent(schoolRecord.condotta, schoolRecord.note)
      if (conductEvent && Math.random() < 0.25) {
        setSchoolEvent(conductEvent)
        setShowSchoolEvent(true)
      }
    }
    // 8B-5: log assenza fuori da ogni setter
    if (wasAbsent) {
      addLogEntry('school', 'Assenza scolastica', '📋 Non sei andato a scuola ieri! La giornata è contata come assenza.', 'negative', gameTime.currentDate, 'mattina')
    }
    // STEP 9C: check condizioni automatiche dopo ogni cambio fase
    checkAutoConditions(gameTime.currentDate, nextPhase)
  }, [currentPhase, dayType, setStats, setRawGameTime, setCurrentPhase, setDayType, setPhaseActionsRemaining,
      setSchoolMorningEvents, setShowSchoolMorning, announce, schoolRecord, setSchoolRecord, setGameOver, setGameOverReason,
      setSchoolEvent, setShowSchoolEvent, gameTime, addLogEntry, checkAutoConditions])

  const advanceToNextDay = useCallback(() => {
    setRawGameTime((current) => {
      const cur = current ?? DEFAULT_GAME_STATE.gameTime
      const newGameTime = advanceGameTime(cur)

      // Reset fasce orarie al nuovo giorno
      const newDayType = getDayType(newGameTime.currentDate)
      setDayType(newDayType)
      setCurrentPhase('mattina')
      setPhaseActionsRemaining(DAY_PHASE_CONFIG[newDayType]['mattina'].maxActions)
      const newMaxInterazioni = Math.min(5, 3 + Math.floor((statsRef.current.carisma ?? 0) / 40))
      setMaxInterazioni(newMaxInterazioni)
      setInterazioniRimaste(newMaxInterazioni)

      const currentMedia = calculateMedia(gradesRef.current)
      const st = schoolTypeRef.current

      if (shouldReceivePaghetta(newGameTime.currentDate, cur.lastPaghettaDate)) {
        if (currentMedia >= 7) {
          const paghetta = 50
          setStats((s) => ({ ...(s!), soldi: clampStat(s!.soldi + paghetta, 0, 1000) }))
          playSound.moneyEarned()
          announce(`SABATO! I tuoi ti hanno dato la PAGHETTA! +${paghetta}€ (media ≥ 7)`)
          addLogEntry('system', 'Paghetta ricevuta!', `SABATO! I tuoi ti hanno dato la PAGHETTA! +${paghetta}€ (media ≥ 7)`, 'positive', newGameTime.currentDate, 'mattina')
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
        const media = calculateMedia(gradesRef.current)
        const teacherEvent = getScaledTeacherEvent(st, media, schoolRecord.condotta)
        setSchoolEvent(teacherEvent)
        setShowSchoolEvent(true)
      }

      setRawScheduledExams((currentExams) => {
        const g = gradesRef.current
        const s = statsRef.current
        const updatedExams = (currentExams ?? [])
          .map((exam) => {
            const newDaysUntil = (exam.daysUntil ?? 0) - 1

            if (newDaysUntil === 3 && !exam.announced) {
              const announcementText = getScheduledExamAnnouncement(
                getSubjectDisplayName(exam.subject),
                exam.difficulty,
                exam.type
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
              setRawGameTime((gt) => gt!) // no-op to flush; grade set separately
              // setGrades must be called from outside — return exam data via side effect
              const diffText = getDifficultyText(exam.difficulty)
              const examLabel = exam.type === 'orale' ? 'INTERROGAZIONE' : 'VERIFICA'
              const resultText = exam.isPrepared
                ? `${examLabel} ${diffText} di ${getSubjectDisplayName(exam.subject)}! Eri PREPARATO! Voto: ${examGrade.toFixed(1)}`
                : `${examLabel} ${diffText} di ${getSubjectDisplayName(exam.subject)}! Non eri preparato... Voto: ${examGrade.toFixed(1)}`
              announce(resultText)
              return null
            }
            return { ...exam, daysUntil: newDaysUntil }
          })
          .filter((e) => e !== null) as ScheduledExam[]

        if (newGameTime.schoolYear.isSchoolPeriod && updatedExams.length < 3 && Math.random() < 0.3 && st) {
          const currentYear = newGameTime.schoolYear.currentYear
          const examSubjects = getGPASubjectsForYear(st, currentYear).map(s => s.key)
          const subjects = examSubjects.length > 0 ? examSubjects : Object.keys(gradesRef.current)
          const newExam = generateScheduledExam(subjects)
          const examLabel = newExam.type === 'orale' ? 'INTERROGAZIONE' : 'VERIFICA'
          announce(
            `NUOVA ${examLabel} programmata di ${getSubjectDisplayName(newExam.subject)} tra ${newExam.daysUntil} giorni! Difficoltà: ${getDifficultyText(newExam.difficulty)}`
          )
          return [...updatedExams, newExam]
        }
        return updatedExams
      })

      return newGameTime
    })
    // FIX2-DORMI: controlla assenza non registrata prima di resettare la flag
    const currentGt = validateGameTime(rawGameTime)
    const currentDayType = getDayType(currentGt.currentDate)
    if (!schoolRecord.wentToSchoolToday && currentDayType === 'feriale' && currentGt.schoolYear.isSchoolPeriod) {
      announce('📋 Sei andato a dormire senza andare a scuola! +1 Assenza, -0.2 Condotta.')
      addLogEntry('school', 'Assenza non giustificata', '📋 Sei andato a dormire senza andare a scuola! +1 Assenza, -0.2 Condotta.', 'negative', currentGt.currentDate, 'notte')
      setSchoolRecord((prev): SchoolRecord => ({
        ...(prev ?? DEFAULT_SCHOOL_RECORD),
        assenze: (prev ?? DEFAULT_SCHOOL_RECORD).assenze + 1,
        condotta: clampStat((prev ?? DEFAULT_SCHOOL_RECORD).condotta - 0.2, 0, 10),
        consecutiveGoodDays: 0,
      }))
      const newAssenze = schoolRecord.assenze + 1
      if (newAssenze >= 35) {
        setGameOver(true)
        setGameOverReason('Troppe assenze! Non sei stato AMMESSO allo scrutinio. Bocciato per assenze!')
        playSound.gameOver()
      } else if (newAssenze === 25) {
        announce('⚠️ ATTENZIONE: 25 assenze! Rischi di non essere ammesso allo scrutinio!')
        playSound.eventTrigger()
      } else if (newAssenze === 15) {
        announce('📬 I tuoi genitori hanno ricevuto una LETTERA dalla scuola! -50 Soldi (punizione)')
          setStats((s) => ({ ...(s!), soldi: clampStat(s!.soldi - 50, 0, 1000) }))
        playSound.moneySpent()
      }
    }
    // F3: reset flag presenza giornaliera (per handleDormi che salta le fasi)
    setSchoolRecord((prev): SchoolRecord => ({ ...(prev ?? DEFAULT_SCHOOL_RECORD), wentToSchoolToday: false, isAtSchool: false }))
    // STEP 9C: tick condizioni di salute per il nuovo giorno
    // ⚠️ rawGameTime è il valore pre-mutazione nello scope (corretto per l'invariante)
    const nextDate = advanceGameTime(validateGameTime(rawGameTime)).currentDate
    tickConditions(nextDate)
    // C1: notifica i listener (es. erosione relazioni) del nuovo giorno
    onDayAdvanced?.(nextDate)
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
    setPhaseActionsRemaining,
    schoolRecord,
    setSchoolRecord,
    setGameOver,
    setGameOverReason,
    rawGameTime,
    addLogEntry,
    tickConditions,
    onDayAdvanced,
  ])

  const gainExtraAction = useCallback(() => {
    setPhaseActionsRemaining((n) => (n ?? 0) + 1)
    announce('Hai guadagnato un\'AZIONE EXTRA! Usala saggiamente.')
  }, [setPhaseActionsRemaining, announce])

  const canInteract = (interazioniRimaste ?? 0) > 0

  // A6 — Nuova azione dormi
  const handleDormi = useCallback(() => {
    const phase = currentPhaseRef.current
    if (phase !== 'sera' && phase !== 'notte') {
      playSound.failure()
      announce('Puoi dormire solo la sera o di notte!', 'assertive')
      return
    }
    playSound.buttonClick()
    const isNight = phase === 'notte'
    setStats((current) => {
      const recovery = isNight ? Math.round(current!.stanchezza * 0.80) : current!.stanchezza
      return { ...current!, stanchezza: clampStat(current!.stanchezza - recovery) }
    })
    const msg = isNight
      ? 'Sei crollato di notte! Riposo parziale (80%). Ci si vede domani!'
      : 'Dormi come un ghiro! Stanchezza AZZERATA. Buonanotte!'
    announce(msg)
    const dormiResult: 'neutral' | 'positive' = isNight ? 'neutral' : 'positive'
    addLogEntry(
      'system',
      isNight ? 'Notte insonne' : 'Notte di sonno',
      msg,
      dormiResult,
      gameTimeRef.current.currentDate,
      currentPhaseRef.current ?? 'sera'
    )
    playSound.success()
    advanceToNextDay()
  }, [setStats, announce, advanceToNextDay, addLogEntry])

  return {
    gameTime,
    setGameTime: setRawGameTime,
    scheduledExams,
    setScheduledExams: setRawScheduledExams,
    consumeAction,
    consumeInterazione,
    consumeAllMorningActions,
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
    interazioniRimaste,
    maxInterazioni,
    canInteract,
    advancePhaseOnly,
  }
}
