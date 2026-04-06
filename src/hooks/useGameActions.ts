import { useCallback, useRef } from 'react'
import { GameStats, SubjectGrades, GameTime, SchoolType, Friend, Relationship, ScheduledExam, SchoolRecord } from '@/lib/types'
import { Ragazza, performGirlfriendAction, shouldGirlfriendBreakup, generateGirlfriendFromRelationship } from '@/lib/girlfriend-system'
import {
  clampStat,
  randomChance,
  calculateStudyGradeIncrease,
  getReputationEventModifier,
  getMentalStateModifiers
} from '@/lib/game-utils'
import {
  calculateRelationshipSuccess,
  getFriendStudyBonus
} from '@/lib/social-system'
import { applyFriendActionEffects, FRIEND_ACTIONS } from '@/lib/enhanced-friend-system'
import {
  calculateExamGrade,
  calculateSurpriseQuizGrade,
  shouldTriggerSurpriseQuiz,
  prepareForExam
} from '@/lib/exam-system'
import { getSubjectDisplayName, getDifficultyText } from '@/lib/types'
import { playSound } from '@/lib/sound-effects'

interface UseGameActionsParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  grades: SubjectGrades
  setGrades: (updater: ((prev: SubjectGrades) => SubjectGrades) | SubjectGrades) => void
  gameTime: GameTime
  schoolType: SchoolType | null
  scheduledExams: ScheduledExam[]
  setScheduledExams: (updater: ((prev: ScheduledExam[]) => ScheduledExam[]) | ScheduledExam[]) => void
  friends: Friend[]
  relationships: Relationship[]
  setRelationships: (updater: ((prev: Relationship[]) => Relationship[]) | Relationship[]) => void
  girlfriend: Ragazza | null
  setGirlfriend: (v: Ragazza | null | ((prev: Ragazza | null) => Ragazza | null)) => void
  setGameOver: (v: boolean) => void
  setGameOverReason: (v: string) => void
  consumeAction: () => void
  announce: (msg: string) => void
  triggerRandomEvent: () => void
  checkForNewFriend: (location: string) => void
  checkForNewRelationship: () => void
  checkForNewGirlfriend: () => void
  setShowSubjectDialog: (v: boolean) => void
  currentPhase: import('@/lib/types').DayPhase
  dayType: import('@/lib/types').DayType
  phaseActionsRemaining: number
  schoolRecord: SchoolRecord
  setSchoolRecord: (updater: ((prev: SchoolRecord) => SchoolRecord) | SchoolRecord) => void
  gainExtraAction: () => void
  addLogEntry: (
    type: import('@/lib/types').LogEntryType,
    title: string,
    description: string,
    result: import('@/lib/types').GameLogEntry['result'],
    date: import('@/lib/types').GameDate,
    phase: import('@/lib/types').DayPhase
  ) => void
  marinatoOggi: boolean
}

export function useGameActions({
  stats,
  setStats,
  grades,
  setGrades,
  gameTime,
  schoolType,
  scheduledExams,
  setScheduledExams,
  friends,
  relationships,
  setRelationships,
  girlfriend,
  setGirlfriend,
  setGameOver,
  setGameOverReason,
  consumeAction,
  announce,
  triggerRandomEvent,
  checkForNewFriend,
  checkForNewRelationship,
  checkForNewGirlfriend,
  setShowSubjectDialog,
  currentPhase,
  dayType,
  phaseActionsRemaining,
  schoolRecord,
  setSchoolRecord,
  gainExtraAction,
  addLogEntry,
  marinatoOggi,
}: UseGameActionsParams) {
  // Refs per accesso stabile
  const statsRef = useRef(stats)
  statsRef.current = stats
  const gradesRef = useRef(grades)
  gradesRef.current = grades
  const gameTimeRef = useRef(gameTime)
  gameTimeRef.current = gameTime
  const friendsRef = useRef(friends)
  friendsRef.current = friends
  const girlfriendRef = useRef(girlfriend)
  girlfriendRef.current = girlfriend
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
  // B1-FIX-4: limita messaggi alla ragazza a 1 per fascia oraria
  const messaggioUsatoRef = useRef(false)
  const lastPhaseRef = useRef(currentPhase)
  if (currentPhase !== lastPhaseRef.current) {
    lastPhaseRef.current = currentPhase
    messaggioUsatoRef.current = false
  }

  const handlePalestra = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // C1-5: blocca durante ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi farlo adesso.')
      return
    }
    if (s.soldi < 20) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per la palestra! Servono 20€')
      return
    }
    playSound.buttonClick()
    playSound.statIncrease()
    setStats((current) => ({
      ...current,
      muscoli: clampStat(current.muscoli + 10),
      figosita: clampStat(current.figosita + 5),
      soldi: clampStat(current.soldi - 20, 0, 1000),
      stanchezza: clampStat(current.stanchezza + 15),
      morale: clampStat(current.morale + 5)
    }))
    consumeAction()
    announce('Hai pompato FERRO! +10 Muscoli, +5 Figosità, -20 Soldi, +15 Stanchezza')
    addLogEntry('action_neutral', 'Sessione in palestra', 'Hai pompato FERRO! +10 Muscoli, +5 Figosità, -20 Soldi, +15 Stanchezza', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    checkForNewFriend('in palestra')
    checkForNewRelationship()
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, checkForNewFriend, checkForNewRelationship, addLogEntry])

  const handleLampada = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // Fix2: lampada non disponibile la mattina feriale (sei a scuola)
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina') {
      playSound.failure()
      announce('Vai a scuola! Non è ora di abbronzature.')
      return
    }
    if (s.soldi < 30) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per la lampada! Servono 30€')
      return
    }
    playSound.buttonClick()
    playSound.statIncrease()
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 15),
      figosita: clampStat(current.figosita + 10),
      soldi: clampStat(current.soldi - 30, 0, 1000)
    }))
    consumeAction()
    announce('Ora sei ABBRONZATISSIMO! +15 Coattaggine, +10 Figosità, -30 Soldi')
    addLogEntry('action_neutral', 'Lampada abbronzante', 'Ora sei ABBRONZATISSIMO! +15 Coattaggine, +10 Figosità, -30 Soldi', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, addLogEntry])

  const handleLavoro = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // C1-5: blocca durante ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi farlo adesso.')
      return
    }
    if (s.muscoli < 40) {
      playSound.failure()
      announce('Sei troppo SMILZO per fare il buttadifuori! Servono 40 Muscoli')
      return
    }
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per lavorare! Riposa!')
      return
    }
    playSound.buttonClick()
    playSound.moneyEarned()
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi + 80, 0, 1000),
      stanchezza: clampStat(current.stanchezza + 20),
      coattaggine: clampStat(current.coattaggine + 5)
    }))
    consumeAction()
    announce('Hai lavorato come BUTTADIFUORI! +80 Soldi, +5 Coattaggine, +20 Stanchezza')
    addLogEntry('action_neutral', 'Lavoro come buttafuori', 'Hai lavorato come BUTTADIFUORI! +80 Soldi, +5 Coattaggine, +20 Stanchezza', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, addLogEntry])

  const handleMotorino = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // C1-5: blocca durante ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi farlo adesso.')
      return
    }
    if (s.soldi < 50) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per truccare il motorino! Servono 50€')
      return
    }
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per trafficare col motorino! Riposa prima!')
      return
    }
    playSound.buttonClick()
    playSound.statIncrease()
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 20),
      figosita: clampStat(current.figosita + 15),
      soldi: clampStat(current.soldi - 50, 0, 1000)
    }))
    consumeAction()
    announce('Motorino TRUCCATO! Ora SGASA di brutto! +20 Coattaggine, +15 Figosità, -50 Soldi')
    addLogEntry('action_neutral', 'Motorino truccato', 'Motorino TRUCCATO! Ora SGASA di brutto! +20 Coattaggine, +15 Figosità, -50 Soldi', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, addLogEntry])

  const handleStudia = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // Fix2: studia non disponibile durante le ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi studiare per conto tuo adesso.')
      return
    }
    if (!gt.schoolYear.isSchoolPeriod) {
      playSound.failure()
      announce('Non puoi studiare durante le VACANZE ESTIVE! Goditi l\'estate!')
      return
    }
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per studiare! Riposa!')
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
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    if (s.soldi < 100) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per la MAZZETTA! Servono 100€')
      return
    }
    playSound.buttonClick()
    setShowSubjectDialog(true)
  }, [announce, setShowSubjectDialog])

  const handleCorrompiSubject = useCallback((subject: string) => {
    const s = statsRef.current
    if (s.soldi < 100) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per la MAZZETTA! Servono 100€')
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
      announce('Hai esaurito le azioni per questa fascia oraria!')
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

  const handleRiposa = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // A1: riposa non disponibile durante la mattina scolastica feriale
    const gt = gameTimeRef.current
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi riposare adesso.')
      return
    }
    // A7: riposa disponibile solo in pomeriggio o mattina non-feriale
    const ph = currentPhaseRef.current
    const dt = dayTypeRef.current
    const isRestAllowed = ph === 'pomeriggio' || (ph === 'mattina' && dt !== 'feriale')
    if (!isRestAllowed) {
      playSound.failure()
      announce('Il riposo parziale è disponibile solo al pomeriggio (o la mattina nei giorni non scolastici)!')
      return
    }
    // A7: recupero parziale 25-35%
    const recoveryPct = 0.25 + Math.random() * 0.10
    playSound.buttonClick()
    setStats((current) => ({
      ...current,
      stanchezza: clampStat(current.stanchezza - Math.round(current.stanchezza * recoveryPct)),
      stress: clampStat(current.stress - 10),
      morale: clampStat(current.morale + 3)
    }))
    consumeAction()
    announce(`Hai riposato un po'! Recuperato il ${Math.round(recoveryPct * 100)}% di Stanchezza`)
    addLogEntry('action_neutral', 'Riposo pomeridiano', `Hai riposato un po'! Recuperato il ${Math.round(recoveryPct * 100)}% di Stanchezza`, 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, consumeAction, announce, addLogEntry])

  const handleDisco = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // Fix2: discoteca non disponibile di mattina
    if (currentPhaseRef.current === 'mattina') {
      playSound.failure()
      announce('La discoteca di mattina?! Ci vuoi andare a quest\'ora?!')
      return
    }
    if (s.soldi < 60) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per entrare in discoteca! Servono 60€')
      return
    }
    if (s.stanchezza > 70) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per andare in disco! Riposa!')
      return
    }
    if (getMentalStateModifiers(s.stress ?? 0, s.morale ?? 60).isDiscoBlocked) {
      playSound.failure()
      announce('Sei troppo giù di morale per andare in disco!')
      addLogEntry('action_failure', 'Troppo giù per il disco', 'Sei troppo giù di morale per andare in disco!', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
      return
    }
    playSound.buttonClick()
    const reputationModifier = getReputationEventModifier(s.reputazione)
    const successChance = Math.min(85, Math.max(20,
      (s.figosita * 0.4) +
      (s.coattaggine * 0.3) +
      (s.muscoli * 0.2) +
      (s.carisma * 0.25) +
      reputationModifier.positiveOutcomeBonus
    ))
    if (randomChance(successChance)) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 25),
        coattaggine: clampStat(current.coattaggine + 15),
        carisma: clampStat(current.carisma + 10),
        soldi: clampStat(current.soldi - 60, 0, 1000),
        stanchezza: clampStat(current.stanchezza + 25),
        stress: clampStat(current.stress - 20),
        morale: clampStat(current.morale + 15)
      }))
      announce('Serata EPICA in disco! Hai fatto STRAGE! +25 Figosità, +15 Coattaggine, +10 Carisma, -60 Soldi, +25 Stanchezza')
      addLogEntry('action_success', 'Serata epica in disco', 'Serata EPICA in disco! Hai fatto STRAGE! +25 Figosità, +15 Coattaggine, +10 Carisma, -60 Soldi, +25 Stanchezza', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.failure()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 10),
        soldi: clampStat(current.soldi - 60, 0, 1000),
        stanchezza: clampStat(current.stanchezza + 20),
        stress: clampStat(current.stress - 5),
        morale: clampStat(current.morale - 10)
      }))
      announce('Serata SCARSA in disco! Nessuno ti ha filato! -10 Figosità, -60 Soldi, +20 Stanchezza')
      addLogEntry('action_failure', 'Serata scarsa in disco', 'Serata SCARSA in disco! Nessuno ti ha filato! -10 Figosità, -60 Soldi, +20 Stanchezza', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
    consumeAction()
    checkForNewFriend('in discoteca')
    checkForNewRelationship()
    checkForNewGirlfriend()
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend, addLogEntry])

  const handleCinema = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // C1-5: blocca durante ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi farlo adesso.')
      return
    }
    if (s.soldi < 40) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per il cinema! Servono 40€')
      return
    }
    playSound.buttonClick()
    const reputationModifier = getReputationEventModifier(s.reputazione)
    const successChance = Math.min(85, Math.max(20,
      (s.figosita * 0.4) +
      (s.carisma * 0.3) +
      reputationModifier.positiveOutcomeBonus
    ))
    if (randomChance(successChance)) {
      playSound.success()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 10),
        carisma: clampStat(current.carisma + 10),
        soldi: clampStat(current.soldi - 40, 0, 1000),
        stanchezza: clampStat(current.stanchezza - 10),
        stress: clampStat(current.stress - 10),
        morale: clampStat(current.morale + 10)
      }))
      announce('Film SPETTACOLARE! Serata fantastica! +10 Figosità, +10 Carisma, -40 Soldi, -10 Stanchezza')
      addLogEntry('action_success', 'Film spettacolare', 'Film SPETTACOLARE! Serata fantastica! +10 Figosità, +10 Carisma, -40 Soldi, -10 Stanchezza', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.failure()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 40, 0, 1000),
        stanchezza: clampStat(current.stanchezza - 15),
        stress: clampStat(current.stress - 10),
        morale: clampStat(current.morale + 10)
      }))
      announce('Hai visto un bel film! Serata tranquilla. -40 Soldi, -15 Stanchezza')
      addLogEntry('action_neutral', 'Serata al cinema', 'Hai visto un bel film! Serata tranquilla. -40 Soldi, -15 Stanchezza', 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
    consumeAction()
    checkForNewFriend('al cinema')
    checkForNewRelationship()
    checkForNewGirlfriend()
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend, addLogEntry])

  const handleShoppingMall = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // C1-5: blocca durante ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi farlo adesso.')
      return
    }
    if (s.soldi < 100) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per fare shopping! Servono 100€')
      return
    }
    playSound.buttonClick()
    playSound.statIncrease()
    setStats((current) => ({
      ...current,
      figosita: clampStat(current.figosita + 20),
      coattaggine: clampStat(current.coattaggine + 10),
      carisma: clampStat(current.carisma + 5),
      soldi: clampStat(current.soldi - 100, 0, 1000)
    }))
    consumeAction()
    announce('Hai comprato VESTITI FICHISSIMI! Ora sei una BOMBA! +20 Figosità, +10 Coattaggine, +5 Carisma, -100 Soldi')
    checkForNewFriend('al centro commerciale')
    checkForNewRelationship()
    checkForNewGirlfriend()
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend])

  const handleTryRelationship = useCallback((relationshipId: string) => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // C1-5: blocca durante ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi farlo adesso.')
      return
    }
    if (s.soldi < 80) {
      playSound.failure()
      announce('Servono 80€ per uscire!')
      return
    }
    const relationship = relationships.find(r => r.id === relationshipId)
    if (!relationship) return
    const successChance = calculateRelationshipSuccess(s, relationship)
    if (randomChance(successChance)) {
      playSound.bigWin()
      setRelationships((current) =>
        current.map(r =>
          r.id === relationshipId
            ? { ...r, isActive: true, relationshipLevel: 1 }
            : r
        )
      )
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 30),
        carisma: clampStat(current.carisma + 15),
      }))
      // Crea Ragazza dall'oggetto Relationship e imposta come fidanzata
      const gt = gameTimeRef.current
      const dateString = `${gt.currentDate.day}/${gt.currentDate.month}/${gt.currentDate.year}`
      const newGirlfriend = generateGirlfriendFromRelationship(relationship, dateString)
      setGirlfriend(newGirlfriend)
      consumeAction()
      announce(`${relationship.name} ha detto SÌ! Siete INSIEME! +30 Figosità, +15 Carisma`)
      addLogEntry('social', `${relationship.name} ha detto sì!`, `${relationship.name} ha detto SÌ! Siete INSIEME! +30 Figosità, +15 Carisma`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 20),
        carisma: clampStat(current.carisma - 10),
        soldi: clampStat(current.soldi - 40, 0, 1000)
      }))
      consumeAction()
      announce(`${relationship.name} ti ha dato il PALO! RIFIUTATO! -20 Figosità, -10 Carisma, -40 Soldi`)
      addLogEntry('social', `Palo da ${relationship.name}`, `${relationship.name} ti ha dato il PALO! RIFIUTATO! -20 Figosità, -10 Carisma, -40 Soldi`, 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [relationships, setRelationships, setStats, setGirlfriend, consumeAction, announce, addLogEntry])

  const handlePrepareExam = useCallback((examSubject: string) => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Troppo stanco per studiare!')
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

  const handleFriendAction = useCallback((friendId: string, actionId: string) => {
    const friend = friendsRef.current.find(f => f.id === friendId)
    const s = statsRef.current
    if (!friend) return
    const action = FRIEND_ACTIONS.find(a => a.id === actionId)
    if (!action) return
    const req = action.requirements(s, friend)
    if (!req.canDo) {
      playSound.failure()
      announce(req.reason || 'Non puoi fare questa azione')
      return
    }
    const result = applyFriendActionEffects(actionId, s, friend)
    if (Object.keys(result.newStats).length > 0) {
      setStats((current) => {
        const updated = { ...current }
        Object.entries(result.newStats).forEach(([k, v]) => {
          const key = k as keyof GameStats
          const val = v as number
          if (key === 'soldi') {
            updated[key] = clampStat(val, 0, 1000)
          } else {
            updated[key] = clampStat(val)
          }
        })
        return updated
      })
    }
    consumeAction()
    playSound.success()
    announce(result.message)
  }, [setStats, consumeAction, announce])

  // B1-FIX-4 applicato
  const handleGirlfriendAction = useCallback((action: string) => {
    const gf = girlfriendRef.current
    if (!gf) return
    const gt = gameTimeRef.current
    if (phaseActionsRemainingRef.current <= 0 && action !== 'messaggio') {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // B1-FIX-4: messaggio — un solo messaggio gratuito per fascia oraria
    if (action === 'messaggio' && messaggioUsatoRef.current) {
      playSound.failure()
      announce('Hai già mandato un messaggio in questa fascia oraria! Non essere troppo appiccicoso.')
      return
    }
    if (action === 'messaggio') {
      messaggioUsatoRef.current = true
    }
    const currentDateString = `${gt.currentDate.day}/${gt.currentDate.month}/${gt.currentDate.year}`
    const s = statsRef.current
    const g = gradesRef.current
    const result = performGirlfriendAction(action, s, gf, currentDateString)
    setGirlfriend(result.updatedGirlfriend)
    if (result.statChanges) {
      setStats((current) => {
        const updated = { ...current }
        Object.entries(result.statChanges).forEach(([key, value]) => {
          const statKey = key as keyof GameStats
          if (statKey === 'soldi') {
            updated[statKey] = clampStat((updated[statKey] as number) + value, 0, 1000)
          } else {
            updated[statKey] = clampStat((updated[statKey] as number) + value)
          }
        })
        return updated
      })
    }
    if (result.gradeChange && result.gradeChange > 0) {
      const subjects = Object.keys(g)
      subjects.forEach(subject => {
        setGrades((current) => ({
          ...current,
          [subject]: clampStat(current[subject] + result.gradeChange!, 0, 10)
        }))
      })
    }
    if (action !== 'messaggio') {
      consumeAction()
    }
    if (action === 'dichiarati' && result.updatedGirlfriend.relationshipStatus === 'fidanzata') {
      playSound.bigWin()
    } else if (action === 'dichiarati') {
      playSound.bigLoss()
    } else {
      playSound.success()
    }
    announce(result.message)
    const gfLogResult: 'positive' | 'negative' | 'neutral' = result.statChanges
      ? (Object.values(result.statChanges).reduce((a, b) => a + b, 0) > 0 ? 'positive'
         : Object.values(result.statChanges).reduce((a, b) => a + b, 0) < 0 ? 'negative'
         : 'neutral')
      : 'neutral'
    addLogEntry('social', `${action} con ${gf.nome}`, result.message, gfLogResult, gameTimeRef.current.currentDate, currentPhaseRef.current)
    if (shouldGirlfriendBreakup(result.updatedGirlfriend)) {
      playSound.gameOver()
      announce(`${gf.nome} ti ha lasciato! La relazione è finita...`)
      setGirlfriend(null)
    }
  }, [setGirlfriend, setStats, setGrades, consumeAction, announce, addLogEntry])

  const handleGirlfriendBreakup = useCallback(() => {
    const gf = girlfriendRef.current
    if (!gf) return
    playSound.failure()
    announce(`Hai lasciato ${gf.nome}. La storia è finita.`)
    setGirlfriend(null)
  }, [setGirlfriend, announce])

  // A8 — Nuove azioni sociali gratuite
  // B1-FIX-5 applicato
  const handleChiacchiera = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    const gt = gameTimeRef.current
    const isSchoolMorning = dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina' && gt.schoolYear.isSchoolPeriod
    playSound.buttonClick()
    setStats((current) => ({
      ...current,
      carisma: clampStat(current.carisma + 5),
      reputazione: clampStat(current.reputazione + 3),
      stanchezza: clampStat(current.stanchezza + 5),
      stress: clampStat(current.stress - 5),
      morale: clampStat(current.morale + 5)
    }))
    const chiacchieraMsg = isSchoolMorning
      ? 'Chiacchieri con un compagno tra una lezione e l\'altra! +5 Carisma, +3 Reputazione'
      : 'Hai chiacchierato con qualcuno! +5 Carisma, +3 Reputazione'
    consumeAction()
    announce(chiacchieraMsg)
    addLogEntry('social', 'Chiacchierata con qualcuno', chiacchieraMsg, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    checkForNewFriend('in giro per il paese')
    checkForNewRelationship()
  }, [setStats, consumeAction, announce, checkForNewFriend, checkForNewRelationship, addLogEntry])

  // B1-FIX-5 applicato
  const handleParco = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    const gt = gameTimeRef.current
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Concentrati sulle lezioni.')
      return
    }
    playSound.buttonClick()
    setStats((current) => ({
      ...current,
      carisma: clampStat(current.carisma + 5),
      stanchezza: clampStat(current.stanchezza - 5),
      reputazione: clampStat(current.reputazione + 2),
      stress: clampStat(current.stress - 15),
      morale: clampStat(current.morale + 8)
    }))
    consumeAction()
    announce('Giro rilassante al parco! +5 Carisma, -5 Stanchezza, +2 Reputazione')
    addLogEntry('action_neutral', 'Giro al parco', 'Giro rilassante al parco! +5 Carisma, -5 Stanchezza, +2 Reputazione', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    checkForNewFriend('al parco')
    checkForNewRelationship()
    checkForNewGirlfriend()
  }, [setStats, consumeAction, announce, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend, addLogEntry])

  // B1-FIX-5 applicato
  const handleTelefona = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    const gt = gameTimeRef.current
    const isSchoolMorning = dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina' && gt.schoolYear.isSchoolPeriod
    if (friendsRef.current.length === 0) {
      playSound.failure()
      announce('Non hai amici da chiamare! Esci e socializza prima.')
      return
    }
    playSound.buttonClick()
    const randomFriend = friendsRef.current[Math.floor(Math.random() * friendsRef.current.length)]
    setStats((current) => ({
      ...current,
      carisma: clampStat(current.carisma + 3)
    }))
    consumeAction()
    announce(isSchoolMorning
      ? `Hai mandato un messaggio a ${randomFriend.name} durante la ricreazione! +3 Carisma`
      : `Hai chiamato ${randomFriend.name}! Bella chiacchierata. +3 Carisma`
    )
  }, [setStats, consumeAction, announce])

  const handleMarina = useCallback(() => {
    const gt = gameTimeRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    if (!(dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina' && gt.schoolYear.isSchoolPeriod)) {
      playSound.failure()
      announce('Puoi marinare solo la mattina di un giorno scolastico!')
      return
    }
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 5),
    }))
    setSchoolRecord((prev) => ({
      ...prev,
      assenze: prev.assenze + 1,
      consecutiveGoodDays: 0,
      wentToSchoolToday: true,
    }))
    gainExtraAction()
    consumeAction()
    playSound.buttonClick()
    announce("Hai MARINATO la scuola! +1 Assenza, +5 Coattaggine, guadagni un'azione extra. Goditi la libertà... per ora.")
    addLogEntry('school', 'Marinato la scuola', "Hai MARINATO la scuola! +1 Assenza, +5 Coattaggine, guadagni un'azione extra. Goditi la libertà... per ora.", 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, setSchoolRecord, gainExtraAction, consumeAction, announce, addLogEntry])

  return {
    handlePalestra,
    handleLampada,
    handleLavoro,
    handleMotorino,
    handleStudia,
    handleStudySubject,
    handleCorrompi,
    handleCorrompiSubject,
    handleMinaccia,
    handleMinacciaSubject,
    handleRiposa,
    handleDisco,
    handleCinema,
    handleShoppingMall,
    handleTryRelationship,
    handlePrepareExam,
    handleFriendAction,
    handleGirlfriendAction,
    handleGirlfriendBreakup,
    handleChiacchiera,
    handleParco,
    handleTelefona,
    handleMarina,
  }
}
