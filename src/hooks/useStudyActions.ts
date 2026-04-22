import { useCallback, useRef } from 'react'
import {
  GameStats,
  SubjectGrades,
  GameTime,
  Friend,
  ScheduledExam,
  SchoolRecord,
  getSubjectDisplayName,
  DayPhase,
  DayType,
  LogEntryType,
  GameLogEntry,
  GameDate,
} from '@/lib/types'
import {
  clampStat,
  calculateStudyGradeIncrease,
  getMentalStateModifiers,
} from '@/lib/game-utils'
import { getFriendStudyBonus } from '@/lib/enhanced-friend-system'
import {
  calculateSurpriseQuizGrade,
  shouldTriggerSurpriseQuiz,
  prepareForExam,
} from '@/lib/exam-system'
import { playSound } from '@/lib/sound-effects'
import { STUDY } from '@/lib/game-balance.constants'

interface UseStudyActionsParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  grades: SubjectGrades
  setGrades: (updater: ((prev: SubjectGrades) => SubjectGrades) | SubjectGrades) => void
  gameTime: GameTime
  scheduledExams: ScheduledExam[]
  setScheduledExams: (updater: ((prev: ScheduledExam[]) => ScheduledExam[]) | ScheduledExam[]) => void
  friends: Friend[]
  setGameOver: (v: boolean) => void
  setGameOverReason: (v: string) => void
  consumeAction: () => void
  announce: (msg: string, priority?: 'polite' | 'assertive') => void
  setShowSubjectDialog: (v: boolean) => void
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
  setSchoolRecord: (updater: ((prev: SchoolRecord) => SchoolRecord) | SchoolRecord) => void
  marinatoOggi: boolean
  addLogEntry: (
    type: LogEntryType,
    title: string,
    description: string,
    result: GameLogEntry['result'],
    date: GameDate,
    phase: DayPhase
  ) => void
}

export function useStudyActions({
  stats,
  setStats,
  grades,
  setGrades,
  gameTime,
  scheduledExams,
  setScheduledExams,
  friends,
  setGameOver,
  setGameOverReason,
  consumeAction,
  announce,
  setShowSubjectDialog,
  currentPhase,
  dayType,
  phaseActionsRemaining,
  setSchoolRecord,
  marinatoOggi,
  addLogEntry,
}: UseStudyActionsParams) {
  const statsRef = useRef(stats)
  statsRef.current = stats
  const gradesRef = useRef(grades)
  gradesRef.current = grades
  const gameTimeRef = useRef(gameTime)
  gameTimeRef.current = gameTime
  const friendsRef = useRef(friends)
  friendsRef.current = friends
  const scheduledExamsRef = useRef(scheduledExams)
  scheduledExamsRef.current = scheduledExams
  const phaseActionsRemainingRef = useRef(phaseActionsRemaining)
  phaseActionsRemainingRef.current = phaseActionsRemaining
  const currentPhaseRef = useRef(currentPhase)
  currentPhaseRef.current = currentPhase
  const dayTypeRef = useRef(dayType)
  dayTypeRef.current = dayType
  const marinatoOggiRef = useRef(marinatoOggi)
  marinatoOggiRef.current = marinatoOggi

  const handleStudia = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    // Fix2: studia non disponibile durante le ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi studiare per conto tuo adesso.', 'assertive')
      return
    }
    if (!gt.schoolYear.isSchoolPeriod) {
      playSound.failure()
      announce('Non puoi studiare durante le VACANZE ESTIVE! Goditi l\'estate!', 'assertive')
      return
    }
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per studiare! Riposa!', 'assertive')
      return
    }
    playSound.buttonClick()
    setShowSubjectDialog(true)
  }, [announce, setShowSubjectDialog])

  const handleStudySubject = useCallback((selectedSubject: string) => {
    setShowSubjectDialog(false)
    const s = statsRef.current
    const g = gradesRef.current
    const hasFriendBonus = getFriendStudyBonus(friendsRef.current) > 0
    const gradeIncrease = calculateStudyGradeIncrease(s.intelligenza, hasFriendBonus)
    const mentalState = getMentalStateModifiers(s.stress ?? 0, s.morale ?? 60)
    const adjustedGradeIncrease = Math.max(0.05, gradeIncrease * mentalState.studyEfficiencyMultiplier)
    const intelligenzaGain = Number((0.01 + (s.intelligenza / 100) * 0.04).toFixed(2))

    setGrades((current) => ({
      ...current,
      [selectedSubject]: clampStat(current[selectedSubject] + adjustedGradeIncrease, 0, 10)
    }))
    setStats((current) => ({
      ...current,
      stanchezza: clampStat(current.stanchezza + 20),
      stress: clampStat(current.stress + 15),
      coattaggine: clampStat(current.coattaggine - 5),
      intelligenza: clampStat(current.intelligenza + intelligenzaGain)
    }))
    consumeAction()
    playSound.statIncrease()

    const bonusText = hasFriendBonus ? ' (BONUS AMICO INTELLIGENTE!)' : ''
    const stressText = mentalState.studyEfficiencyMultiplier < 1 ? ' (STRESS ALTO: efficacia ridotta!)' : ''
    const studyMsg = `Hai studiato ${getSubjectDisplayName(selectedSubject)}! +${adjustedGradeIncrease.toFixed(2)} al voto, +${intelligenzaGain} Intelligenza${bonusText}${stressText}, +20 Stanchezza, -5 Coattaggine`
    announce(studyMsg)
    const studyLogTitle = stressText !== '' ? `Studiato ${getSubjectDisplayName(selectedSubject)} — stress alto` : `Studiato ${getSubjectDisplayName(selectedSubject)}`
    const studyLogResult: 'positive' | 'negative' | 'neutral' = stressText !== '' ? 'neutral' : 'positive'
    addLogEntry('school', studyLogTitle, studyMsg, studyLogResult, gameTimeRef.current.currentDate, currentPhaseRef.current)

    const gt = gameTimeRef.current
    if (shouldTriggerSurpriseQuiz() && gt.schoolYear.isSchoolPeriod) {
      const subjects = Object.keys(g)
      const surpriseSubject = subjects[Math.floor(Math.random() * subjects.length)]
      const quizResult = calculateSurpriseQuizGrade(g[surpriseSubject], s)
      setGrades((current) => ({
        ...current,
        [surpriseSubject]: quizResult.newGrade
      }))
      playSound.eventTrigger()
      announce(`${quizResult.message} in ${getSubjectDisplayName(surpriseSubject)}!`)
    }
  }, [setGrades, setStats, consumeAction, announce, setShowSubjectDialog, addLogEntry])

  const handleCorrompi = useCallback(() => {
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    if (s.soldi < 100) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per la MAZZETTA! Servono 100€', 'assertive')
      return
    }
    playSound.buttonClick()
    setShowSubjectDialog(true)
  }, [announce, setShowSubjectDialog])

  const handleCorrompiSubject = useCallback((subject: string) => {
    const s = statsRef.current
    if (s.soldi < 100) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per la MAZZETTA! Servono 100€', 'assertive')
      return
    }
    playSound.buttonClick()
    playSound.moneySpent()
    setGrades((current) => ({
      ...current,
      [subject]: clampStat(current[subject] + 0.5, 0, 10)
    }))
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - 100, 0, 1000)
    }))
    consumeAction()
    playSound.success()
    announce(`MAZZETTA al prof di ${getSubjectDisplayName(subject)}! +0.5 al voto, -100 Soldi. EZPZ!`)
    addLogEntry('school', `Mazzetta al prof di ${getSubjectDisplayName(subject)}`, `MAZZETTA al prof di ${getSubjectDisplayName(subject)}! +0.5 al voto, -100 Soldi. EZPZ!`, 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setGrades, setStats, consumeAction, announce, addLogEntry])

  const handleMinaccia = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    playSound.buttonClick()
    setShowSubjectDialog(true)
  }, [announce, setShowSubjectDialog])

  const handleMinacciaSubject = useCallback((subject: string) => {
    playSound.buttonClick()
    const roll = Math.random() * 100
    
    if (roll < 5) {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason('Hai AGGREDITO il prof e ti hanno ESPULSO DEFINITIVAMENTE! Game Over!')
      announce('ESPULSO dalla scuola per violenza!')
      return
    } else if (roll < 15) {
      playSound.failure()
      setSchoolRecord((current) => ({
        ...current,
        sospensioni: current.sospensioni + 1,
        condotta: clampStat(current.condotta - 2, 0, 10)
      }))
      announce(`SOSPESO per 3 giorni! +1 Sospensione, -2 Condotta. Hai esagerato!`)
      addLogEntry('school', 'Sospeso!', 'SOSPESO per 3 giorni! +1 Sospensione, -2 Condotta. Hai esagerato!', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
      consumeAction()
      return
    } else if (roll < 30) {
      playSound.failure()
      setSchoolRecord((current) => ({
        ...current,
        note: current.note + 1,
        condotta: clampStat(current.condotta - 0.5, 0, 10)
      }))
      announce(`Ti hanno dato una NOTA disciplinare! +1 Nota, -0.5 Condotta.`)
      addLogEntry('school', 'Nota disciplinare', 'Ti hanno dato una NOTA disciplinare! +1 Nota, -0.5 Condotta.', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
      consumeAction()
      return
    }
    
    playSound.bigWin()
    setGrades((current) => ({
      ...current,
      [subject]: clampStat(current[subject] + 1.5, 0, 10)
    }))
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 15)
    }))
    setSchoolRecord((current) => ({
      ...current,
      condotta: clampStat(current.condotta - 0.3, 0, 10)
    }))
    consumeAction()
    announce(`Hai MINACCIATO il prof di ${getSubjectDisplayName(subject)}! +1.5 al voto, +15 Coattaggine, -0.3 Condotta. Rischiosa ma ha funzionato!`)
    addLogEntry('school', `Minacciato il prof di ${getSubjectDisplayName(subject)}`, `Hai MINACCIATO il prof di ${getSubjectDisplayName(subject)}! +1.5 al voto, +15 Coattaggine, -0.3 Condotta. Rischiosa ma ha funzionato!`, 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setGrades, setStats, setGameOver, setGameOverReason, consumeAction, announce, setSchoolRecord, addLogEntry])

  // STEP 12 — studia_gruppo: handler azione studio di gruppo
  const handleStudiaGruppo = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    if (!gt.schoolYear.isSchoolPeriod) {
      playSound.failure()
      announce('Non puoi studiare in gruppo durante le VACANZE ESTIVE!', 'assertive')
      return
    }
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per studiare in gruppo! Riposa prima.', 'assertive')
      return
    }
    if (friendsRef.current.length === 0) {
      playSound.failure()
      announce('Non hai amici con cui studiare in gruppo! Fatti qualche amico prima.', 'assertive')
      return
    }
    const hasFriendBonus = getFriendStudyBonus(friendsRef.current) > 0
    const mentalState = getMentalStateModifiers(s.stress ?? 0, s.morale ?? 60)
    const baseIncrease = calculateStudyGradeIncrease(s.intelligenza, true)
    const groupBoost = Math.max(
      STUDY.GROUP_MIN_GRADE_BOOST,
      baseIncrease * mentalState.studyEfficiencyMultiplier
    )
    const intelligenzaGain = Number(
      (STUDY.GROUP_INTEL_BASE + (s.intelligenza / 100) * STUDY.GROUP_INTEL_SCALE).toFixed(2)
    )
    setGrades((current) => {
      const updated: SubjectGrades = { ...current }
      for (const subject of Object.keys(current)) {
        updated[subject] = clampStat((current[subject] ?? 0) + groupBoost, 0, 10)
      }
      return updated
    })
    setStats((current) => ({
      ...current,
      stanchezza: clampStat(current.stanchezza + STUDY.GROUP_STANCHEZZA),
      stress: clampStat(current.stress + STUDY.GROUP_STRESS),
      coattaggine: clampStat(current.coattaggine - STUDY.GROUP_COATTAGGINE_PENALTY),
      intelligenza: clampStat(current.intelligenza + intelligenzaGain),
      carisma: clampStat(current.carisma + STUDY.GROUP_CARISMA_BONUS),
    }))
    consumeAction()
    playSound.statIncrease()
    const bonusText = hasFriendBonus ? ' (AMICO INTELLIGENTE: bonus attivo!)' : ''
    const stressText = mentalState.studyEfficiencyMultiplier < 1 ? ' (STRESS ALTO: efficacia ridotta!)' : ''
    const msg = `Studio in gruppo! +${groupBoost.toFixed(2)} a tutti i voti, +${intelligenzaGain} Intelligenza, +${STUDY.GROUP_CARISMA_BONUS} Carisma${bonusText}${stressText}`
    announce(msg)
    addLogEntry(
      'school',
      'Studio in gruppo',
      msg,
      stressText !== '' ? 'neutral' : 'positive',
      gameTimeRef.current.currentDate,
      currentPhaseRef.current
    )
  }, [setGrades, setStats, consumeAction, announce, addLogEntry])

  const handlePrepareExam = useCallback((examSubject: string) => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Troppo stanco per studiare!', 'assertive')
      return
    }
    const examIndex = scheduledExamsRef.current.findIndex(e => e.subject === examSubject)
    if (examIndex === -1) return
    const exam = scheduledExamsRef.current[examIndex]
    const result = prepareForExam(exam, s.intelligenza)
    setScheduledExams((current) =>
      current.map((e, i) => (i === examIndex ? { ...e, isPrepared: true } : e))
    )
    setStats((current) => ({
      ...current,
      intelligenza: clampStat(current.intelligenza + result.intelligenceGain),
      stanchezza: clampStat(current.stanchezza + 25)
    }))
    consumeAction()
    playSound.success()
    announce(result.message)
  }, [setScheduledExams, setStats, consumeAction, announce])

  return {
    handleStudia,
    handleStudySubject,
    handleStudiaGruppo,
    handleCorrompi,
    handleCorrompiSubject,
    handleMinaccia,
    handleMinacciaSubject,
    handlePrepareExam,
  }
}
