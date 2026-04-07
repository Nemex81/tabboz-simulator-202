import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  GraduationCap, 
  Motorcycle,
  Brain,
  Heart,
  User,
  Buildings,
  Trophy,
  UserCircle,
  Chats,
  Keyboard,
  ChartBar,
  HandCoins,
  HandFist,
  PersonSimpleRun,
  ShieldWarning,
  IdentificationCard
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { StatDisplay } from '@/components/StatDisplay'
import { ActionButton } from '@/components/ActionButton'
import { TimeDisplay } from '@/components/TimeDisplay'
import { ThemeSelector } from '@/components/ThemeSelector'
import { GameDialogs } from '@/components/GameDialogs'
import { EnhancedFriendsPanel } from '@/components/EnhancedFriendsPanel'
// Pannelli voti/esami caricati in lazy (tab non visibile all'avvio)
const GradeProgressPanel = lazy(() => import('@/components/GradeProgressPanel').then(m => ({ default: m.GradeProgressPanel })))
// const GirlfriendPanel = lazy(() => import('@/components/GirlfriendPanel').then(m => ({ default: m.GirlfriendPanel })))
const ExamsPanel = lazy(() => import('@/components/ExamsPanel').then(m => ({ default: m.ExamsPanel })))
// Dashboard lazy (tab nascosto all'avvio)
const StatsDashboard = lazy(() => import('@/components/StatsDashboard').then(m => ({ default: m.StatsDashboard })))
// SchoolMorningPanel lazy (solo mattina feriale scolastica)
const SchoolMorningPanel = lazy(() => import('@/components/SchoolMorningPanel').then(m => ({ default: m.SchoolMorningPanel })))
// AfternoonEventPanel lazy (pomeriggio/sera)
const AfternoonEventPanel = lazy(() => import('@/components/AfternoonEventPanel').then(m => ({ default: m.AfternoonEventPanel })))
import { SchoolSelection } from '@/components/SchoolSelection'
import { CityPanel } from '@/components/CityPanel'
import { CharacterSheet } from '@/components/CharacterSheet'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GameStats, SubjectGrades, GameTime, DEFAULT_GAME_STATE, SchoolType, getDefaultGradesForSchoolType, getSubjectDisplayName, Friend, Relationship, ScheduledExam, PlayerProfile, ThemeVariant, SchoolRecord, DEFAULT_SCHOOL_RECORD, DEFAULT_HEALTH_RECORD } from '@/lib/types'
import { useGameStats } from '@/hooks/useGameStats'
import { useGameTime } from '@/hooks/useGameTime'
import { useEventEngine } from '@/hooks/useEventEngine'
import { useGameActions } from '@/hooks/useGameActions'
import { useAppDialogs } from '@/hooks/useAppDialogs'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useGameLog } from '@/hooks/useGameLog'
import { useHealthSystem } from '@/hooks/useHealthSystem'
import { Ragazza, generateRandomGirlfriend, performGirlfriendAction, shouldGirlfriendBreakup } from '@/lib/girlfriend-system'
import { 
  validateStats, 
  validateGrades, 
  validateGameTime, 
  validateFriends, 
  validateRelationships, 
  validateScheduledExams, 
  validateSchoolType 
} from '@/lib/data-validation'
import { 
  clampStat, 
  calculateMedia, 
  calculateWeightedMedia,
  getWorstSubjects,
  randomChance, 
  checkGameOver,
  calculateReputationFromStats,
  getReputationLevel,
  getReputationEventModifier,
  calculateStudyGradeIncrease,
  canAvoidNegativeEventWithCharisma,
  archiveYearGrades
} from '@/lib/game-utils'
import { 
  advanceGameTime, 
  shouldShowReportCard, 
  calculateNextSchoolYear,
  shouldReceivePaghetta
} from '@/lib/time-utils'
import { playSound } from '@/lib/sound-effects'
import { getTeacherEvent, getParentEventByMedia, SchoolEvent, EventOutcome } from '@/lib/school-events'
import { drawSchoolMorningEvents, SchoolMorningEvent } from '@/lib/school-morning-events'
import { drawStreetMorningEvents } from '@/lib/street-morning-events'
import { 
  generateRandomFriend, 
  generateRandomRelationship, 
  checkNewFriendEvent,
  calculateRelationshipSuccess,
  getFriendStudyBonus
} from '@/lib/social-system'
import { migrateLegacyFriend, applyDailyErosion, dateToDayIndex } from '@/lib/relation-system'
import { useGameRelations } from '@/hooks/useGameRelations'
import {
  generateScheduledExam,
  calculateExamGrade,
  calculateSurpriseQuizGrade,
  shouldTriggerSurpriseQuiz,
  prepareForExam,
  getDifficultyText,
  getDifficultyAnnouncement
} from '@/lib/exam-system'

function App() {
  const [rawSchoolType, setRawSchoolType] = useKV<SchoolType | null>('tabboz-school-type', null)
  const [rawPlayerProfile, setRawPlayerProfile] = useKV<PlayerProfile | null>('tabboz-player-profile', null)
  const [rawGrades, setRawGrades] = useKV<SubjectGrades>('tabboz-grades', DEFAULT_GAME_STATE.grades)
  const [rawFriends, setRawFriends] = useKV<Friend[]>('tabboz-friends', [])
  const [rawRelationships, setRawRelationships] = useKV<Relationship[]>('tabboz-relationships', [])
  const [rawGirlfriend, setRawGirlfriend] = useKV<Ragazza | null>('tabboz-girlfriend', null)
  const [currentTheme, setCurrentTheme] = useKV<ThemeVariant>('tabboz-theme', 'default')
  const [rawSchoolRecord, setRawSchoolRecord] = useKV<SchoolRecord>('tabboz-school-record', DEFAULT_SCHOOL_RECORD)
  const [rawGradesHistory, setRawGradesHistory] = useKV<Record<number, SubjectGrades>>('tabboz-grades-history', {})

  const schoolType = validateSchoolType(rawSchoolType)
  const playerProfile = rawPlayerProfile
  const grades = validateGrades(rawGrades, schoolType)
  const friends = validateFriends(rawFriends).map(migrateLegacyFriend)
  const relationships = validateRelationships(rawRelationships)
  const girlfriend = rawGirlfriend
  const schoolRecord = rawSchoolRecord || DEFAULT_SCHOOL_RECORD

  const setSchoolType = setRawSchoolType
  const setPlayerProfile = setRawPlayerProfile
  const setGrades = setRawGrades
  const setFriends = setRawFriends
  const setRelationships = setRawRelationships
  const setGirlfriend = setRawGirlfriend
  const setSchoolRecord = setRawSchoolRecord

  const {
    gameOver,
    setGameOver,
    gameOverReason,
    setGameOverReason,
    showResetDialog,
    setShowResetDialog,
    showReportCard,
    setShowReportCard,
    reportCardPassed,
    setReportCardPassed,
    gameWon,
    setGameWon,
    schoolEvent,
    setSchoolEvent,
    showSchoolEvent,
    setShowSchoolEvent,
    showKeyboardHelp,
    setShowKeyboardHelp,
    showSubjectDialog,
    setShowSubjectDialog,
    showTeacherDialog,
    setShowTeacherDialog,
    teacherActionType,
    setTeacherActionType,
    schoolMorningEvents,
    setSchoolMorningEvents,
    showSchoolMorning,
    setShowSchoolMorning,
    streetMorningEvents,
    setStreetMorningEvents,
    showStreetMorning,
    setShowStreetMorning,
  } = useAppDialogs()

  const ariaLiveRef = useRef<HTMLDivElement>(null)
  // F6: stato locale per mutua esclusività Vai a Scuola / Marina (si resetta al cambio giorno)
  const [marinatoOggi, setMarinatoOggi] = useState(false)
  const [morningChoicePending, setMorningChoicePending] = useState(false)

  const announce = useCallback((message: string) => {
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = message
    }
    toast(message)
  }, [])

  // --- Custom Hooks ---
  const { stats, setStats } = useGameStats(announce)
  const { gameLog, addLogEntry, clearLog } = useGameLog()

  const {
    healthRecord,
    setHealthRecord,
    applyCondition,
    tickConditions,
    checkAutoConditions,
    canAttendSchool,
  } = useHealthSystem({
    stats,
    setStats,
    playerGender: playerProfile?.gender ?? 'maschio',
    addLogEntry,
  })

  const {
    gameTime, setGameTime, scheduledExams, setScheduledExams,
    consumeAction, advanceToNextDay, gainExtraAction, handleDormi,
    currentPhase, dayType, phaseActionsRemaining, advancePhaseOnly,
  } = useGameTime({
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
    onDayAdvanced: (newDate) => {
      // C2: erosione giornaliera relazioni
      setRawFriends(prev =>
        applyDailyErosion(
          (prev ?? []).map(migrateLegacyFriend),
          dateToDayIndex(newDate)
        )
      )
    },
  })

  // Alias non-undefined per compatibilità JSX
  const phaseActionsLeft = phaseActionsRemaining ?? 0

  const events = useEventEngine({
    stats,
    setStats,
    friends,
    setFriends,
    relationships,
    setRelationships,
    girlfriend: girlfriend ?? null,
    setGirlfriend,
    gameTime,
    consumeAction,
    announce,
    phaseActionsRemaining: phaseActionsRemaining ?? 0,
    addLogEntry,
    currentPhase: currentPhase ?? 'mattina'
  })

  const actions = useGameActions({
    stats,
    setStats,
    grades,
    setGrades,
    gameTime,
    schoolType,
    scheduledExams,
    setScheduledExams,
    friends,
    setFriends: setRawFriends,
    relationships,
    setRelationships,
    girlfriend: girlfriend ?? null,
    setGirlfriend,
    setGameOver,
    setGameOverReason,
    consumeAction,
    announce,
    triggerRandomEvent: events.triggerRandomEvent,
    checkForNewFriend: events.checkForNewFriend,
    checkForNewRelationship: events.checkForNewRelationship,
    checkForNewGirlfriend: events.checkForNewGirlfriend,
    setShowSubjectDialog,
    currentPhase: currentPhase ?? 'mattina',
    dayType: dayType ?? 'feriale',
    phaseActionsRemaining: phaseActionsRemaining ?? 0,
    schoolRecord,
    setSchoolRecord,
    gainExtraAction,
    addLogEntry,
    marinatoOggi,
    applyCondition,
  })

  // Destructure event engine results per compatibilità con JSX esistente
  const {
    showMetallariEvent, setShowMetallariEvent,
    showAtipaEvent, setShowAtipaEvent,
    atipaName, atipaSuccessChance,
    showPoliceEvent, setShowPoliceEvent,
    showStreetRaceEvent, setShowStreetRaceEvent,
    showBulliEvent, setShowBulliEvent,
    raceWinChance,
    currentEvent,
    checkForNewFriend,
    checkForNewRelationship,
    checkForNewGirlfriend,
    triggerRandomEvent,
    handleMetallariScappa, handleMetallariCombatti,
    handlePoliceScappa, handlePoliceCollabora,
    handleStreetRaceAccetta, handleStreetRaceRifiuta,
    handleBulliResisti, handleBulliCedi,
    handleProvarciConAtipa, handleAtipaRinuncia, handleAtipaProva,
    afternoonEvent, handleAfternoonChoice,
  } = events

  // Destructure game actions per compatibilità con JSX esistente
  const {
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
    handleMarina: handleMarinaFromHook,
  } = actions

  const { doInteraction } = useGameRelations({
    friends,
    setFriends: setRawFriends,
    stats,
    setStats,
    gameDate: gameTime.currentDate,
    announce,
  })

  const handleRiposa = () => actions.handleRiposa()

  const handleOpenCorrompiDialog = () => {
    if ((phaseActionsRemaining ?? 0) <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    if (stats.soldi < 100) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per la MAZZETTA! Servono 100€')
      return
    }
    setTeacherActionType('corrompi')
    setShowTeacherDialog(true)
  }

  const handleOpenMinacciaDialog = () => {
    if ((phaseActionsRemaining ?? 0) <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    setTeacherActionType('minaccia')
    setShowTeacherDialog(true)
  }

  const handleTeacherSelection = (subject: string) => {
    if (teacherActionType === 'corrompi') {
      handleCorrompiSubject(subject)
    } else {
      handleMinacciaSubject(subject)
    }
  }

  const handleVaiAScuola = () => {
    if ((phaseActionsRemaining ?? 0) <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    if (dayType !== 'feriale' || currentPhase !== 'mattina' || !gameTime.schoolYear.isSchoolPeriod) {
      playSound.failure()
      announce('Puoi andare a scuola solo la mattina dei giorni feriali durante il periodo scolastico!')
      return
    }
    if (schoolRecord.wentToSchoolToday) {
      playSound.failure()
      announce('Sei già andato a scuola oggi!')
      return
    }
    if (!canAttendSchool()) {
      playSound.failure()
      announce('Non puoi andare a scuola: sei troppo malato! Resta a casa.')
      addLogEntry('health', 'Assenza forzata', 'Non puoi andare a scuola a causa delle condizioni di salute.', 'negative', gameTime.currentDate, currentPhase ?? 'mattina')
      return
    }
    playSound.buttonClick()
    setStats((current) => ({
      ...current!,
      intelligenza: clampStat(current!.intelligenza + 2),
      stanchezza: clampStat(current!.stanchezza + 10)
    }))
    setSchoolRecord((current): SchoolRecord => ({
      ...(current ?? DEFAULT_SCHOOL_RECORD),
      wentToSchoolToday: true,
      isAtSchool: true
    }))
    consumeAction()
    setMorningChoicePending(false)
    announce('Sei andato a scuola! +2 Intelligenza, +10 Stanchezza. Segui le lezioni!')
    addLogEntry('school', 'Vai a scuola', 'Sei andato a scuola! +2 Intelligenza, +10 Stanchezza. Segui le lezioni!', 'positive', gameTime.currentDate, currentPhase ?? 'mattina')

    const morningEvents = drawSchoolMorningEvents(6)
    setSchoolMorningEvents(morningEvents)
    setShowSchoolMorning(true)
  }

  // F6: handleMarina dal hook — wrapper che imposta marinatoOggi per la mutua esclusività UI
  const handleMarina = () => {
    if (schoolRecord.wentToSchoolToday || marinatoOggi) {
      playSound.failure()
      announce('Hai già scelto per questa mattina!')
      return
    }
    setMarinatoOggi(true)
    setShowSchoolMorning(false)
    setSchoolMorningEvents([])
    setMorningChoicePending(false)

    setSchoolRecord((current): SchoolRecord => ({
      ...(current ?? DEFAULT_SCHOOL_RECORD),
      isAtSchool: false
    }))

    const streetEvents = drawStreetMorningEvents(6)
    setStreetMorningEvents(streetEvents)
    setShowStreetMorning(true)

    handleMarinaFromHook()
  }

  useEffect(() => {
    const htmlElement = document.querySelector('html')
    if (htmlElement) {
      htmlElement.setAttribute('data-theme', currentTheme ?? 'default')
    }
  }, [currentTheme])

  // F6: reset marinatoOggi al cambio di giorno
  useEffect(() => {
    setMarinatoOggi(false)
    setShowStreetMorning(false)
    setStreetMorningEvents([])
    setShowSchoolMorning(false)
    setSchoolMorningEvents([])
  }, [gameTime.currentDate.day, gameTime.currentDate.month, gameTime.currentDate.year])

  // BUG 2: nascondi SchoolMorningPanel quando si esce dalla mattina
  useEffect(() => {
    if (currentPhase !== 'mattina') {
      setShowSchoolMorning(false)
      setShowStreetMorning(false)
    }
  }, [currentPhase])

  useEffect(() => {
    if (currentPhase === 'mattina' && dayType === 'feriale' && gameTime.schoolYear.isSchoolPeriod) {
      if (!schoolRecord.wentToSchoolToday && !marinatoOggi) {
        setMorningChoicePending(true)
      } else {
        setMorningChoicePending(false)
      }
    } else {
      setMorningChoicePending(false)
    }
  }, [currentPhase, dayType, gameTime.schoolYear.isSchoolPeriod, schoolRecord.wentToSchoolToday, marinatoOggi])

  // F4: soglie assenze con conseguenze scalari
  useEffect(() => {
    if (!gameTime.schoolYear.isSchoolPeriod || gameOver) return
    const a = schoolRecord.assenze
    if (a === 15) {
      announce('📬 I tuoi genitori hanno ricevuto una LETTERA dalla scuola per le assenze! -50 Soldi (punizione)')
      setStats((s) => ({ ...(s!), soldi: clampStat(s!.soldi - 50, 0, 1000) }))
      playSound.moneySpent()
    } else if (a === 25) {
      announce('⚠️ ATTENZIONE: 25 assenze! Rischi di NON essere ammesso allo scrutinio!')
      playSound.eventTrigger()
      const parentEvent = getParentEventByMedia(calculateMedia(grades), stats)
      if (parentEvent) {
        setSchoolEvent(parentEvent)
        setShowSchoolEvent(true)
      }
    } else if (a >= 35) {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason(`BOCCIATO! Troppe assenze (${a} giorni)! Non sei stato ammesso allo scrutinio!`)
    }
  }, [schoolRecord.assenze]) // eslint-disable-line react-hooks/exhaustive-deps

  // F5: condotta — warning < 5, game over < 1
  useEffect(() => {
    if (!gameTime.schoolYear.isSchoolPeriod || gameOver) return
    const c = schoolRecord.condotta
    if (c < 1 && c >= 0) {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason(`ESPULSO! Condotta ${c.toFixed(1)}/10 — comportamento insostenibile. Game Over!`)
    } else if (c < 5 && c >= 1) {
      announce(`🚨 Condotta CRITICA (${c.toFixed(1)}/10)! Ancora una nota e verrai ESPULSO dalla scuola!`)
      playSound.eventTrigger()
    }
  }, [schoolRecord.condotta]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSchoolSelection = (selected: SchoolType, profile: PlayerProfile, theme: ThemeVariant) => {
    playSound.success()
    setSchoolType(selected)
    setPlayerProfile(profile)
    setCurrentTheme(theme)
    setGrades(getDefaultGradesForSchoolType(selected))
    setRawGradesHistory({})
    announce(`Ciao ${profile.name}! Hai scelto: ${selected.toUpperCase()}! Buona fortuna!`)
  }

  const handleThemeChange = (theme: ThemeVariant) => {
    setCurrentTheme(theme)
    announce(`Tema cambiato: ${theme === 'default' ? 'Default Neon Blu' : theme === 'dark' ? 'Dark Nero Viola' : 'Green Ganja Style'}`)
  }

  const handleReset = () => {
    playSound.reset()
    setStats(DEFAULT_GAME_STATE.stats)
    setGrades(schoolType ? getDefaultGradesForSchoolType(schoolType) : DEFAULT_GAME_STATE.grades)
    setGameTime(DEFAULT_GAME_STATE.gameTime)
    setFriends([])
    setRelationships([])
    setScheduledExams([])
    setGirlfriend(null)
    setGameOver(false)
    setGameOverReason('')
    setShowResetDialog(false)
    setGameWon(false)
    setSchoolType(null)
    setPlayerProfile(null)
    setSchoolRecord(DEFAULT_SCHOOL_RECORD)
    setRawGradesHistory({})
    clearLog()
    setHealthRecord(DEFAULT_HEALTH_RECORD)
    announce('Gioco RESETTATO! Crea di nuovo il tuo personaggio!')
  }

  useEffect(() => {
    const checkStatus = checkGameOver({ ...stats, media: calculateMedia(grades) })
    if (checkStatus.isOver) {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason(checkStatus.reason)
      announce(checkStatus.reason)
    }
  }, [stats, grades])

  const handleSchoolEventChoice = (choiceIndex: number) => {
    if (!schoolEvent) return

    const outcome: EventOutcome = schoolEvent.choices[choiceIndex].action()

    if (outcome.statChanges) {
      setStats((current) => {
        const updated = { ...current! }
        Object.entries(outcome.statChanges!).forEach(([key, value]) => {
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

    // Step 1: feedback delta | Step 2: selezione materia pesata (peggiori 3)
    let deltaMsg = ''
    if (outcome.gradeChanges) {
      const worstSubs = getWorstSubjects(grades, 3)
      const targetSubject = outcome.gradeChanges.subject === 'random'
        ? worstSubs[Math.floor(Math.random() * worstSubs.length)]
        : outcome.gradeChanges.subject

      const oldGrade = grades[targetSubject] ?? 0
      const newGrade = clampStat(oldGrade + outcome.gradeChanges.change, 0, 10)
      const newGrades = { ...grades, [targetSubject]: newGrade }
      const oldMedia = calculateWeightedMedia(grades, schoolType)
      const newMedia = calculateWeightedMedia(newGrades, schoolType)

      deltaMsg = `📊 ${getSubjectDisplayName(targetSubject)}: ${oldGrade.toFixed(1)} → ${newGrade.toFixed(1)} | Media: ${oldMedia.toFixed(2)} → ${newMedia.toFixed(2)}`

      setGrades((current) => ({
        ...current,
        [targetSubject]: clampStat(((current ?? {})[targetSubject] ?? 0) + outcome.gradeChanges!.change, 0, 10)
      }))
    }

    if (outcome.conductChange !== undefined || outcome.noteChange !== undefined) {
      const oldCondotta = schoolRecord.condotta
      const newCondotta = outcome.conductChange !== undefined
        ? clampStat(oldCondotta + outcome.conductChange, 0, 10)
        : oldCondotta
      if (outcome.conductChange !== undefined) {
        const conductStr = ` | Condotta: ${oldCondotta.toFixed(1)} → ${newCondotta.toFixed(1)}`
        deltaMsg = deltaMsg ? deltaMsg + conductStr : `📊${conductStr.trimStart()}`
      }
      setSchoolRecord((current): SchoolRecord => ({
        ...(current ?? DEFAULT_SCHOOL_RECORD),
        condotta: outcome.conductChange !== undefined ? clampStat((current ?? DEFAULT_SCHOOL_RECORD).condotta + outcome.conductChange, 0, 10) : (current ?? DEFAULT_SCHOOL_RECORD).condotta,
        note: outcome.noteChange !== undefined ? (current ?? DEFAULT_SCHOOL_RECORD).note + outcome.noteChange : (current ?? DEFAULT_SCHOOL_RECORD).note,
        // Reset giorni consecutivi se comportamento negativo
        consecutiveGoodDays: (outcome.conductChange !== undefined && outcome.conductChange < 0)
          ? 0
          : (current ?? DEFAULT_SCHOOL_RECORD).consecutiveGoodDays
      }))
    }

    playSound.eventTrigger()
    announce(outcome.message)
    addLogEntry(
      'school',
      schoolEvent?.title ?? 'Evento scolastico',
      outcome.message,
      outcome.statChanges
        ? (Object.values(outcome.statChanges).reduce((a, b) => a + b, 0) >= 0 ? 'positive' : 'negative')
        : 'neutral',
      gameTime.currentDate,
      currentPhase ?? 'mattina'
    )
    if (deltaMsg) toast(deltaMsg)
    setShowSchoolEvent(false)
    setSchoolEvent(null)
  }

  const handleReportCardContinue = () => {
    setShowReportCard(false)

    if (gameWon) {
      playSound.bigWin()
      setGameOver(true)
      setGameOverReason('HAI VINTO! Hai superato la MATURITÀ! Sei una LEGGENDA!')
      return
    }

    // Step 6: scrutinio integrato — media pesata + condotta + assenze
    const weightedMedia = calculateWeightedMedia(grades, schoolType)
    const condotta = schoolRecord.condotta
    const assenze = schoolRecord.assenze

    // Veto assenze >= 35
    if (assenze >= 35) {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason(`BOCCIATO! Troppe assenze (${assenze} giorni)! Non sei stato ammesso allo scrutinio!`)
      return
    }

    // Soglia promozione modificata dalla condotta (Step 4)
    let promotionThreshold = 6.0
    if (condotta >= 9) promotionThreshold = 5.8
    else if (condotta >= 7) promotionThreshold = 6.0
    else if (condotta >= 6) promotionThreshold = 6.3
    else {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason(`BOCCIATO! Condotta insufficiente (${condotta.toFixed(1)}/10)! Il Consiglio di Classe non ti ha promosso!`)
      return
    }

    const actuallyPassed = weightedMedia >= promotionThreshold

    if (actuallyPassed) {
      const completedYear = gameTime.schoolYear.currentYear
      const newYear = completedYear + 1
      // Archivia i voti dell'anno appena concluso
      if (schoolType) {
        const { archived, next } = archiveYearGrades(grades, schoolType, completedYear)
        setRawGradesHistory(prev => ({ ...(prev ?? {}), [completedYear]: archived }))
        setGrades(next)
      } else {
        setGrades(getDefaultGradesForSchoolType(schoolType ?? 'tecnico'))
      }
      setGameTime((current) => ({
        ...current!,
        schoolYear: calculateNextSchoolYear(current!.schoolYear),
        age: current!.age + 1
      }))
      setSchoolRecord(DEFAULT_SCHOOL_RECORD)  // reset annuale
      playSound.success()
      announce(`PROMOSSO! Ora sei in ${newYear}° superiore! I voti sono stati resettati.`)
    } else {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason(`BOCCIATO! Media pesata ${weightedMedia.toFixed(2)} sotto la soglia ${promotionThreshold.toFixed(1)}! Devi ripetere l'anno!`)
    }
  }

  useKeyboardShortcuts({
    gameOver,
    showResetDialog,
    showMetallariEvent,
    showAtipaEvent,
    showPoliceEvent,
    showStreetRaceEvent,
    showBulliEvent,
    showReportCard,
    schoolType,
    phaseActionsRemaining: phaseActionsRemaining ?? 0,
    handlePalestra,
    handleLampada,
    handleLavoro,
    handleMotorino,
    handleStudia,
    handleOpenCorrompiDialog,
    handleOpenMinacciaDialog,
    handleRiposa,
    handleProvarciConAtipa,
    handleDisco,
    handleCinema,
    handleShoppingMall,
    setShowResetDialog,
    advancePhaseOnly,
    setShowKeyboardHelp,
    announce
  })

  if (!schoolType) {
    return <SchoolSelection onSelectSchool={handleSchoolSelection} />
  }

  const currentMedia = calculateWeightedMedia(grades, schoolType)

  const gameDialogsProps = {
    showMetallariEvent,
    setShowMetallariEvent,
    currentEvent,
    handleMetallariScappa,
    handleMetallariCombatti,
    showAtipaEvent,
    setShowAtipaEvent,
    atipaSuccessChance,
    handleAtipaRinuncia,
    handleAtipaProva,
    showPoliceEvent,
    setShowPoliceEvent,
    handlePoliceScappa,
    handlePoliceCollabora,
    showStreetRaceEvent,
    setShowStreetRaceEvent,
    raceWinChance,
    handleStreetRaceRifiuta,
    handleStreetRaceAccetta,
    showBulliEvent,
    setShowBulliEvent,
    handleBulliCedi,
    handleBulliResisti,
    gameOver,
    gameOverReason,
    handleReset,
    showResetDialog,
    setShowResetDialog,
    showReportCard,
    grades,
    currentMedia,
    reportCardPassed,
    schoolYear: gameTime.schoolYear.currentYear,
    handleReportCardContinue,
    condotta: schoolRecord.condotta,
    assenze: schoolRecord.assenze,
    showSchoolEvent,
    schoolEvent,
    handleSchoolEventChoice,
    setShowSchoolEvent,
    showKeyboardHelp,
    setShowKeyboardHelp,
    showSubjectDialog,
    setShowSubjectDialog,
    handleStudySubject,
    stanchezza: stats.stanchezza,
    showTeacherDialog,
    setShowTeacherDialog,
    handleTeacherSelection,
    teacherActionType,
    soldi: stats.soldi,
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div 
        ref={ariaLiveRef}
        role="status" 
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-4xl md:text-6xl font-black text-primary neon-text-glow mb-2 tracking-wider">
            TABBOZ SIMULATOR
          </h1>
          <p className="text-xl md:text-2xl text-secondary font-bold">2026 EDITION - VITA DA COATTO</p>
          {playerProfile && (
            <div className="mt-3 flex items-center justify-center gap-3 text-lg text-accent">
              <User size={24} weight="fill" />
              <span className="font-bold">{playerProfile.name}</span>
              <span className="text-muted-foreground">•</span>
              <span>{playerProfile.gender === 'maschio' ? '♂ Maschio' : '♀ Femmina'}</span>
              <span className="text-muted-foreground">•</span>
              <span>{gameTime.age} anni</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Usa <kbd className="px-2 py-1 bg-muted rounded text-primary">Ctrl+numero</kbd> o <kbd className="px-2 py-1 bg-muted rounded text-primary">Ctrl+lettera</kbd> per le scorciatoie.
            </p>
            <Button 
              onClick={() => setShowKeyboardHelp(true)}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Keyboard size={20} className="mr-2" weight="fill" />
              Aiuto Tasti (Alt+H)
            </Button>
          </div>
        </header>

        <TimeDisplay
          gameTime={gameTime}
          currentPhase={currentPhase}
          dayType={dayType}
          phaseActionsRemaining={phaseActionsRemaining}
        />

        {/* ── Controlli Giornata ────────────────────────────────────────────── */}
        {(() => {
          const nextPhaseLabel =
            currentPhase === 'mattina' ? 'Pomeriggio' :
            currentPhase === 'pomeriggio' ? 'Sera' :
            currentPhase === 'sera' ? 'Notte' : 'Mattina'
          const canAdvance = (phaseActionsRemaining ?? 0) === 0
          const showRiposa =
            currentPhase === 'pomeriggio' ||
            (currentPhase === 'mattina' && (dayType !== 'feriale' || !gameTime.schoolYear.isSchoolPeriod))
          const showDormi = currentPhase === 'sera' || currentPhase === 'notte'
          return (
            <div className="mb-4 p-4 bg-muted/30 rounded-sm border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Gestione Giornata
                </span>
                <span
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  canAdvance
                    ? 'bg-primary/20 text-primary'
                    : 'bg-destructive/15 text-destructive'
                }`}>
                  {canAdvance ? '✓ Pronto ad avanzare' : `${phaseActionsRemaining ?? 0} azioni rimaste`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {showRiposa && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRiposa}
                    disabled={(phaseActionsRemaining ?? 0) <= 0}
                    title="Recupera parte della stanchezza (consuma 1 azione)"
                    className="flex items-center gap-1"
                  >
                    😴 <span>Riposa</span>
                  </Button>
                )}
                {showDormi && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDormi}
                    title="Vai a dormire: recupero totale, avanza al giorno dopo (sempre disponibile)"
                    className="flex items-center gap-1"
                  >
                    🌙 <span>Vai a dormire</span>
                  </Button>
                )}
                <Button
                  variant={canAdvance ? 'default' : 'secondary'}
                  size="sm"
                  onClick={advancePhaseOnly}
                  disabled={!canAdvance}
                  title={canAdvance ? `Avanza a: ${nextPhaseLabel} (Ctrl+N)` : `Consuma prima le ${phaseActionsRemaining ?? 0} azioni rimaste`}
                  aria-label={`Avanza alla prossima fase della giornata: ${nextPhaseLabel}. Azioni rimaste per questa fase: ${phaseActionsRemaining ?? 0}. ${canAdvance ? 'Pulsante abilitato. Premi per avanzare.' : 'Pulsante disabilitato. Devi consumare tutte le azioni prima di avanzare.'} Scorciatoia da tastiera: Ctrl+N`}
                  className="flex items-center gap-1"
                >
                  ▶ <span>Prossima fase</span>
                  <span className="ml-1 text-xs opacity-70">({nextPhaseLabel})</span>
                </Button>
              </div>
            </div>
          )
        })()}
        {/* ──────────────────────────────────────────────────────────────────── */}

        {morningChoicePending && (
          <div
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="mb-4 p-4 bg-destructive/20 border-2 border-destructive rounded-lg text-center animate-pulse"
          >
            <p className="text-destructive font-bold text-lg">
              🏫 È mattina! Prima devi scegliere: vai a scuola o la marini?
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Vai al tab <strong>Scuola → Voti</strong> e fai la tua scelta per sbloccare tutte le altre attività.
            </p>
          </div>
        )}

        <Tabs defaultValue="school" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 bg-muted/50 p-1 h-auto">
            <TabsTrigger value="school" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <GraduationCap size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Scuola</span>
              <span className="sm:hidden">Scuola</span>
            </TabsTrigger>
            <TabsTrigger value="city" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Buildings size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Città</span>
              <span className="sm:hidden">Roma</span>
            </TabsTrigger>
            <TabsTrigger value="character" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <IdentificationCard size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Personaggio</span>
              <span className="sm:hidden">👤</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Chats size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Attività</span>
              <span className="sm:hidden">Attività</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Controllo</span>
              <span className="sm:hidden">⚙️</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6 mt-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-primary mb-2">⚙️ PANNELLO DI CONTROLLO</h2>
              <p className="text-muted-foreground">Gestisci le impostazioni del gioco</p>
            </div>

            <ThemeSelector currentTheme={currentTheme ?? 'default'} onThemeChange={handleThemeChange} />

            <Card className="p-6 border-2 border-accent bg-card">
              <h3 className="text-2xl font-bold mb-4 text-accent flex items-center gap-2">
                <Trophy size={32} weight="fill" />
                🎯 OBIETTIVO DEL GIOCO
              </h3>
              <p className="text-foreground mb-3">
                Completa tutti e 5 gli anni di scuola superiore e supera la MATURITÀ per vincere!
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${gameTime.schoolYear.currentYear >= 1 ? 'bg-accent' : 'bg-muted'}`} />
                  <span className={gameTime.schoolYear.currentYear === 1 ? 'text-accent font-bold' : ''}>
                    1° Superiore (14 anni)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${gameTime.schoolYear.currentYear >= 2 ? 'bg-accent' : 'bg-muted'}`} />
                  <span className={gameTime.schoolYear.currentYear === 2 ? 'text-accent font-bold' : ''}>
                    2° Superiore (15 anni)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${gameTime.schoolYear.currentYear >= 3 ? 'bg-accent' : 'bg-muted'}`} />
                  <span className={gameTime.schoolYear.currentYear === 3 ? 'text-accent font-bold' : ''}>
                    3° Superiore (16 anni)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${gameTime.schoolYear.currentYear >= 4 ? 'bg-accent' : 'bg-muted'}`} />
                  <span className={gameTime.schoolYear.currentYear === 4 ? 'text-accent font-bold' : ''}>
                    4° Superiore (17 anni)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${gameTime.schoolYear.currentYear >= 5 ? 'bg-accent' : 'bg-muted'}`} />
                  <span className={gameTime.schoolYear.currentYear === 5 ? 'text-accent font-bold' : ''}>
                    5° Superiore - MATURITÀ (18 anni)
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  ⚠️ <strong>Attenzione:</strong> Se la tua media scende sotto il 6 alla pagella, sarai BOCCIATO e il gioco finirà!
                </p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-destructive bg-card">
              <h3 className="text-2xl font-bold mb-4 text-destructive flex items-center gap-2">
                <ShieldWarning size={32} weight="fill" />
                GESTIONE GIOCO
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-bold text-lg mb-2">📊 Stato Salvataggio</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Il gioco salva automaticamente ogni tua azione. I tuoi progressi sono sempre al sicuro!
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Anno scolastico: <strong className="text-primary">{gameTime.schoolYear.currentYear}°</strong></p>
                    <p>✓ Giocatore: <strong className="text-primary">{playerProfile?.name}</strong></p>
                    <p>✓ Indirizzo: <strong className="text-primary">{schoolType?.toUpperCase()}</strong></p>
                    <p>✓ Età: <strong className="text-primary">{gameTime.age} anni</strong></p>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button
                    onClick={() => setShowResetDialog(true)}
                    variant="outline"
                    size="lg"
                    className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground w-full md:w-auto"
                  >
                    🔄 Reset Gioco Completo (Ctrl+R)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Attenzione: questa azione cancellerà TUTTA la tua progressione!
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="school" className="space-y-6 mt-6">
            <Tabs defaultValue="home" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 bg-card/50 p-1">
                <TabsTrigger value="home" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  <GraduationCap size={18} className="mr-2" weight="fill" />
                  Home
                </TabsTrigger>
                <TabsTrigger value="voti" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  <GraduationCap size={18} className="mr-2" weight="fill" />
                  Voti
                </TabsTrigger>
                <TabsTrigger value="verifiche" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Brain size={18} className="mr-2" weight="fill" />
                  Verifiche
                </TabsTrigger>
                <TabsTrigger value="amici" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  <UserCircle size={18} className="mr-2" weight="fill" />
                  Amici
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Trophy size={18} className="mr-2" weight="fill" />
                  Dashboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="space-y-6 mt-6">
                {/* ── Sommario scolastico ── */}
                <Card className="p-4 border-2 border-secondary bg-card">
                  <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                    <GraduationCap size={20} weight="fill" aria-hidden="true" />
                    SITUAZIONE SCOLASTICA
                  </h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Media voti</dt>
                      <dd className={`text-2xl font-bold ${currentMedia < 6 ? 'text-destructive' : 'text-secondary'}`}>
                        {currentMedia.toFixed(1)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Condotta</dt>
                      <dd className={`text-2xl font-bold ${schoolRecord.condotta < 6 ? 'text-destructive' : 'text-primary'}`}>
                        {schoolRecord.condotta.toFixed(1)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Assenze</dt>
                      <dd className={`text-2xl font-bold ${schoolRecord.assenze >= 25 ? 'text-destructive' : 'text-foreground'}`}>
                        {schoolRecord.assenze}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Note disciplinari</dt>
                      <dd className="text-2xl font-bold text-foreground">{schoolRecord.note}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Compagni di classe</dt>
                      <dd className="text-2xl font-bold text-accent">
                        {friends.filter(f => f.originType === 'compagno_classe').length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Anno scolastico</dt>
                      <dd className="text-2xl font-bold text-foreground">{gameTime.schoolYear.currentYear}°</dd>
                    </div>
                  </dl>
                </Card>

                {/* Messaggio contestuale */}
                {(() => {
                  if (schoolRecord.assenze >= 20) return (
                    <Card className="p-3 border border-destructive bg-destructive/5">
                      <p className="text-sm text-destructive font-medium">⚠️ Attenzione: stai accumulando troppe assenze.</p>
                    </Card>
                  )
                  if (currentMedia < 6) return (
                    <Card className="p-3 border border-destructive bg-destructive/5">
                      <p className="text-sm text-destructive font-medium">⚠️ La tua media è insufficiente. Studia di più!</p>
                    </Card>
                  )
                  if (currentMedia >= 8) return (
                    <Card className="p-3 border border-secondary bg-secondary/5">
                      <p className="text-sm text-secondary font-medium">⭐ Ottima media! Continua così.</p>
                    </Card>
                  )
                  return (
                    <Card className="p-3 border border-muted bg-muted/20">
                      <p className="text-sm text-muted-foreground">📚 Settimana nella norma. Niente di urgente.</p>
                    </Card>
                  )
                })()}

                {/* Azioni scuola — solo mattina feriale nel periodo scolastico */}
                {currentPhase === 'mattina' && dayType === 'feriale' && gameTime.schoolYear.isSchoolPeriod && (
                <>
                <Card className="p-3 border-2 border-primary bg-card">
                  <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                    <GraduationCap size={24} weight="fill" />
                    VAI A SCUOLA
                  </h3>
                  <ActionButton
                    icon={<GraduationCap size={48} />}
                    label="Vai a Scuola"
                    onClick={handleVaiAScuola}
                    disabled={
                      phaseActionsLeft <= 0 ||
                      dayType !== 'feriale' ||
                      currentPhase !== 'mattina' ||
                      !gameTime.schoolYear.isSchoolPeriod ||
                      marinatoOggi
                    }
                    blockedReason={
                      marinatoOggi
                        ? 'Hai già marinato stamattina'
                        : phaseActionsLeft <= 0 
                          ? 'Nessuna azione per questa fascia oraria' 
                          : dayType !== 'feriale' 
                            ? 'Disponibile solo nei giorni feriali' 
                            : currentPhase !== 'mattina'
                              ? 'Disponibile solo la mattina'
                              : 'Non è periodo scolastico'
                    }
                    variant="default"
                    ariaLabel="Vai a scuola durante la mattina dei giorni feriali. +2 Intelligenza, +10 Stanchezza."
                    helpText="Frequenta le lezioni a scuola. Disponibile solo la mattina dei giorni feriali durante il periodo scolastico. +2 Intelligenza, +10 Stanchezza."
                    announce={announce}
                  />
                  <div className="mt-3 text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                    <p className="font-semibold mb-1">Effetti:</p>
                    <p>• +2 Intelligenza</p>
                    <p>• +10 Stanchezza</p>
                    <p className="mt-2 text-primary font-semibold">📅 Disponibile: Mattina dei giorni feriali (periodo scolastico)</p>
                  </div>
                </Card>

                {/* F6: Pulsante Marina — nascosto se già andato a scuola o già marinato */}
                {!schoolRecord.wentToSchoolToday && !marinatoOggi && (
                <Card className="p-3 border-2 border-destructive bg-card">
                  <h3 className="text-xl font-bold mb-4 text-destructive flex items-center gap-2">
                    <GraduationCap size={24} weight="fill" />
                    MARINA LA SCUOLA
                  </h3>
                  <ActionButton
                    icon={<GraduationCap size={48} />}
                    label="Marina!"
                    onClick={handleMarina}
                    disabled={
                      phaseActionsLeft <= 0 ||
                      dayType !== 'feriale' ||
                      currentPhase !== 'mattina' ||
                      !gameTime.schoolYear.isSchoolPeriod
                    }
                    blockedReason={
                      phaseActionsLeft <= 0
                        ? 'Nessuna azione per questa fascia oraria'
                        : dayType !== 'feriale'
                          ? 'Disponibile solo nei giorni feriali'
                          : currentPhase !== 'mattina'
                            ? 'Disponibile solo la mattina'
                            : 'Non è periodo scolastico'
                    }
                    variant="destructive"
                    ariaLabel="Marina la scuola. +1 Assenza conta per le soglie bocciatura, +5 Coattaggine, 1 azione extra."
                    helpText="Non vai a scuola. Guadagni 1 azione extra ma accumuli 1 Assenza che conta verso le soglie 15/25/35. Oltre 35 assenze sei bocciato automaticamente!"
                    announce={announce}
                  />
                  <div className="mt-3 text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                    <p className="font-semibold mb-1">Effetti:</p>
                    <p>• +1 Assenza (conta verso le soglie 15 / 25 / 35)</p>
                    <p>• +5 Coattaggine</p>
                    <p>• +1 Azione extra</p>
                    <p className="mt-2 text-destructive font-semibold">⚠️ Oltre 35 assenze = BOCCIATO automaticamente!</p>
                  </div>
                </Card>
                )}
                </>
                )}

                {showSchoolMorning && dayType === 'feriale' && currentPhase === 'mattina' && gameTime.schoolYear.isSchoolPeriod && schoolRecord.wentToSchoolToday && (
                  <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento mattina scolastica...</div>}>
                    <SchoolMorningPanel
                      context="school"
                      events={schoolMorningEvents}
                      stats={stats}
                      onStatChange={setStats}
                      onGainExtraAction={gainExtraAction}
                      onConsumeAction={consumeAction}
                      announce={announce}
                      onNewFriend={(f) => setFriends((current) => [...current, f])}
                      addLogEntry={addLogEntry}
                      currentDate={gameTime.currentDate}
                    />
                  </Suspense>
                )}

                {showStreetMorning && dayType === 'feriale' && currentPhase === 'mattina' && marinatoOggi && (
                  <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento mattina per strada...</div>}>
                    <SchoolMorningPanel
                      context="street"
                      events={streetMorningEvents}
                      stats={stats}
                      onStatChange={setStats}
                      onGainExtraAction={gainExtraAction}
                      onConsumeAction={consumeAction}
                      announce={announce}
                      onNewFriend={(f) => setFriends((current) => [...current, f])}
                      addLogEntry={addLogEntry}
                      currentDate={gameTime.currentDate}
                    />
                  </Suspense>
                )}

                {afternoonEvent && (currentPhase === 'pomeriggio' || currentPhase === 'sera') && (
                  <Suspense fallback={null}>
                    <AfternoonEventPanel
                      event={afternoonEvent}
                      onChoice={handleAfternoonChoice}
                    />
                  </Suspense>
                )}
              </TabsContent>

              <TabsContent value="voti" className="space-y-6 mt-6">
                <Card className="p-6 border-2 border-secondary bg-card">
                  <h3 className="text-2xl font-bold mb-4 text-secondary flex items-center gap-2">
                    <GraduationCap size={32} weight="fill" />
                    📊 PAGELLA
                  </h3>
                  <div role="table" aria-label="Tabella dei voti scolastici" className="space-y-1">
                    {Object.entries(grades).map(([subject, grade]) => (
                      <div
                        key={subject}
                        role="row"
                        aria-label={`${getSubjectDisplayName(subject)}: ${grade.toFixed(1)} su 10${grade < 6 ? ' — INSUFFICIENTE' : ''}`}
                        className="flex items-center gap-2 py-1.5 px-2"
                      >
                        <span className="text-xs text-muted-foreground flex-1">
                          {getSubjectDisplayName(subject)}
                        </span>
                        <span className={`text-sm font-bold w-8 text-right ${grade < 6 ? 'text-destructive' : 'text-secondary'}`}>
                          {grade.toFixed(1)}
                        </span>
                        <div className="w-16 h-1.5 bg-muted rounded-sm overflow-hidden" aria-hidden="true">
                          <div
                            className={`h-full ${grade < 6 ? 'bg-destructive' : 'bg-secondary'}`}
                            style={{ width: `${(grade / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg text-muted-foreground">Media totale:</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-3xl font-bold ${currentMedia < 6 ? 'text-destructive' : 'text-accent'}`}>
                          {currentMedia.toFixed(1)}
                        </span>
                        {currentMedia < 4 && (
                          <span className="text-destructive font-bold animate-pulse">BOCCIATO!</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                      <div>
                        <span className="text-sm text-muted-foreground">Condotta:</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${schoolRecord.condotta < 6 ? 'text-destructive' : 'text-primary'}`}>
                            {schoolRecord.condotta.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Assenze:</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${schoolRecord.assenze > 20 ? 'text-destructive' : 'text-foreground'}`}>
                            {schoolRecord.assenze}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Note:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-foreground">
                            {schoolRecord.note}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Sospensioni:</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${schoolRecord.sospensioni > 0 ? 'text-destructive' : 'text-foreground'}`}>
                            {schoolRecord.sospensioni}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* GradeProgressPanel + storico anni precedenti */}
                {schoolType ? (
                  <>
                    <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Caricamento voti...</div>}>
                      <GradeProgressPanel
                        grades={grades}
                        schoolType={schoolType}
                        schoolYear={gameTime.schoolYear.currentYear}
                      />
                    </Suspense>
                    {Object.keys(rawGradesHistory ?? {}).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                          Storico anni precedenti
                        </h4>
                        {Object.entries(rawGradesHistory ?? {})
                          .sort(([a], [b]) => Number(b) - Number(a))
                          .map(([year, histGrades]) => {
                            const avg = Object.values(histGrades).length
                              ? (Object.values(histGrades).reduce((s, v) => s + v, 0) /
                                  Object.values(histGrades).length).toFixed(1)
                              : '—'
                            return (
                              <div key={year} className="flex items-center justify-between px-2 py-1.5 rounded bg-muted/20 text-sm">
                                <span className="text-muted-foreground">Anno {year}°</span>
                                <span className="font-semibold">{avg}</span>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Seleziona prima un indirizzo scolastico.
                  </p>
                )}

                <Card className="p-3 border-2 border-destructive bg-card">
                  <h3 className="text-xl font-bold mb-4 text-destructive flex items-center gap-2">
                    <HandCoins size={24} weight="fill" />
                    METODI ALTERNATIVI
                  </h3>
                  <div className="space-y-3">
                    <ActionButton
                      icon={<HandCoins size={48} />}
                      label="Corrompi Professore"
                      shortcut="Ctrl+6"
                      onClick={handleOpenCorrompiDialog}
                      disabled={phaseActionsLeft <= 0 || stats.soldi < 100}
                      blockedReason={phaseActionsLeft <= 0 ? 'Nessuna azione per questa fascia oraria' : 'Servono almeno 100€'}
                      variant="default"
                      ariaLabel="Corrompi un professore con una mazzetta da 100 euro. Aumenta i voti. Tasto rapido: Ctrl+6"
                      helpText="Corrompi un professore con 100 euro. Scegli quale professore corrompere. Aumenta i voti di 0.5 punti nella materia scelta."
                      announce={announce}
                    />
                    <ActionButton
                      icon={<HandFist size={48} />}
                      label="Minaccia Professore"
                      shortcut="Ctrl+7"
                      onClick={handleOpenMinacciaDialog}
                      disabled={phaseActionsLeft <= 0}
                      blockedReason="Nessuna azione per questa fascia oraria"
                      variant="destructive"
                      ariaLabel="Minaccia un professore. Rischio 30% di espulsione! Aumenta molto i voti e la coattaggine. Tasto rapido: Ctrl+7"
                      helpText="Minaccia un professore. Scegli quale professore minacciare. Rischio del 30% di essere espulso dal gioco! Se riesce, +1.5 al voto e +15 coattaggine. Usare con cautela."
                      announce={announce}
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t border-border text-xs text-destructive">
                    <p className="font-bold">⚠️ ATTENZIONE: Metodi rischiosi! L'opzione Minaccia ha 30% di probabilità di ESPULSIONE!</p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="verifiche" className="space-y-6 mt-6">
                <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento...</div>}>
                  <ExamsPanel
                    exams={scheduledExams}
                    onPrepareExam={handlePrepareExam}
                    actionsRemaining={phaseActionsRemaining ?? 0}
                    stanchezza={stats.stanchezza}
                  />
                </Suspense>
                <Card className="p-3 border-2 border-accent bg-card">
                  <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
                    <Brain size={28} weight="fill" />
                    SISTEMA INTELLIGENZA
                  </h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-accent">L'Intelligenza</strong> è la tua arma segreta per dominare la scuola!
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Studiare aumenta i voti in modo DECIMALE basato sulla tua Intelligenza</li>
                      <li>Formula: <code className="bg-muted px-2 py-1 rounded">+{calculateStudyGradeIncrease(stats.intelligenza).toFixed(1)}</code> per ogni studio</li>
                      <li>Preparare le verifiche aumenta l'Intelligenza e moltiplica il voto finale!</li>
                      <li>Le interrogazioni a sorpresa dipendono da (Media + Intelligenza) / 2</li>
                      <li>Amici intelligenti (INT {'>'} 60) aumentano del 50% l'efficacia dello studio!</li>
                    </ul>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="amici" className="space-y-6 mt-6">
                <EnhancedFriendsPanel
                  friends={friends.filter(f =>
                    f.originType === 'compagno_classe' || f.originType === 'compagno_istituto'
                  )}
                  stats={stats}
                  actionsRemaining={phaseActionsRemaining ?? 0}
                  onFriendAction={handleFriendAction}
                  onRelationInteraction={doInteraction}
                  girlfriend={null}
                  onGirlfriendAction={handleGirlfriendAction}
                  onGirlfriendBreakup={handleGirlfriendBreakup}
                />
                <Card className="p-3 border-2 border-accent bg-card">
                  <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
                    <Chats size={28} weight="fill" />
                    SISTEMA CARISMA
                  </h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-accent">Il Carisma</strong> è la tua capacità di convincere e socializzare!
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Influenza TUTTE le interazioni sociali (Disco, Cinema, Rimorchio)</li>
                      <li>Con Carisma {'>'} 70 hai 20% di evitare eventi negativi con la PARLANTINA!</li>
                      <li>Aumenta le probabilità di fare nuove amicizie (base 15% + bonus Carisma)</li>
                      <li>Migliora le chance con le ragazze (ogni tipo ha preferenze diverse!)</li>
                      <li>Contribuisce al 20% della tua REPUTAZIONE totale!</li>
                    </ul>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-6 mt-6">
                <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento dashboard...</div>}>
                  <StatsDashboard stats={stats} grades={grades} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="character">
            <CharacterSheet
              playerProfile={playerProfile ?? null}
              stats={stats}
              schoolType={schoolType}
              schoolYear={gameTime.schoolYear.currentYear}
              age={gameTime.age}
              schoolRecord={schoolRecord}
              currentMedia={currentMedia}
              gameLog={gameLog}
              healthRecord={healthRecord ?? DEFAULT_HEALTH_RECORD}
              grades={grades}
              gradesHistory={rawGradesHistory ?? {}}
              friends={friends}
              relationships={relationships}
              actionsRemaining={phaseActionsRemaining ?? 0}
              onFriendAction={handleFriendAction}
              onRelationInteraction={doInteraction}
              girlfriend={girlfriend ?? null}
              onGirlfriendAction={handleGirlfriendAction}
              onGirlfriendBreakup={handleGirlfriendBreakup}
              onTryRelationship={handleTryRelationship}
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-3 border-2 border-secondary bg-card">
                <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
                  <Brain size={24} weight="fill" />
                  STUDIO E APPRENDIMENTO
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    icon={<Brain size={48} />}
                    label="Studia"
                    shortcut="Ctrl+5"
                    onClick={handleStudia}
                    disabled={morningChoicePending || phaseActionsLeft <= 0 || stats.stanchezza > 80 || !gameTime.schoolYear.isSchoolPeriod}
                    blockedReason={morningChoicePending ? '🏫 Scegli prima se andare a scuola o marinare!' : phaseActionsLeft <= 0 ? 'Nessuna azione per questa fascia oraria' : stats.stanchezza > 80 ? 'Sei troppo stanco per studiare!' : 'Non è periodo scolastico'}
                    variant="secondary"
                    ariaLabel="Studia per migliorare i voti. Aumenta l'intelligenza e i voti scolastici. Richiede periodo scolastico. Tasto rapido: Ctrl+5"
                    helpText="Studia per migliorare i voti. Aumenta l'intelligenza e i voti in una materia a scelta. L'incremento dipende dalla tua intelligenza. Richiede periodo scolastico."
                    announce={announce}
                  />
                </div>
              </Card>

              <Card className="p-3 border-2 border-primary bg-card">
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                  <Chats size={24} weight="fill" />
                  SOCIALIZZA GRATIS
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    icon={<Chats size={48} />}
                    label="Chiacchiera"
                    onClick={handleChiacchiera}
                    disabled={morningChoicePending || phaseActionsLeft <= 0}
                    blockedReason={morningChoicePending ? '🏫 Scegli prima se andare a scuola o marinare!' : 'Nessuna azione per questa fascia oraria'}
                    variant="secondary"
                    ariaLabel="Chiacchiera con qualcuno. Gratis. +5 Carisma, +3 Reputazione"
                    helpText="Chiacchiera con qualcuno. Gratis. Aumenta il Carisma di 5 e la Reputazione di 3."
                    announce={announce}
                  />
                  <ActionButton
                    icon={<PersonSimpleRun size={48} />}
                    label="Giro al Parco"
                    onClick={handleParco}
                    disabled={morningChoicePending || phaseActionsLeft <= 0}
                    blockedReason={morningChoicePending ? '🏫 Scegli prima se andare a scuola o marinare!' : 'Nessuna azione per questa fascia oraria'}
                    variant="secondary"
                    ariaLabel="Giro rilassante al parco. Gratis. +5 Carisma, -5 Stanchezza, +2 Reputazione"
                    helpText="Giro rilassante al parco. Gratis. Aumenta il Carisma di 5, riduce la Stanchezza di 5 e aumenta la Reputazione di 2."
                    announce={announce}
                  />
                  <ActionButton
                    icon={<UserCircle size={48} />}
                    label="Telefona"
                    onClick={handleTelefona}
                    disabled={morningChoicePending || phaseActionsLeft <= 0}
                    blockedReason={morningChoicePending ? '🏫 Scegli prima se andare a scuola o marinare!' : 'Nessuna azione per questa fascia oraria'}
                    variant="secondary"
                    ariaLabel="Telefona a un amico. Gratis. +3 Carisma (richiede almeno un amico)"
                    helpText="Telefona a un amico. Gratis. Aumenta il Carisma di 3. Richiede almeno un amico sbloccato."
                    announce={announce}
                  />
                </div>
              </Card>

              <Card className="p-6 border-2 border-accent bg-card">
                <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
                  <Heart size={24} weight="fill" />
                  RIMORCHIO
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    icon={<Heart size={48} />}
                    label="Atipa"
                    shortcut="Ctrl+9"
                    onClick={handleProvarciConAtipa}
                    disabled={morningChoicePending || phaseActionsLeft <= 0}
                    blockedReason={morningChoicePending ? '🏫 Scegli prima se andare a scuola o marinare!' : 'Nessuna azione per questa fascia oraria'}
                    variant="default"
                    ariaLabel="Prova a rimorchiare un'atipa. Se rifiuta perdi Figosiità e Carisma; se accetta guadagni entrambi. Tasto rapido: Ctrl+9"
                    helpText="Prova a rimorchiare. In caso di successo guadagni Figosiità e Carisma; in caso di rifiuto li perdi. Tasto rapido: Ctrl+9."
                    announce={announce}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  <p>💡 Altri modi per socializzare: vai in <strong>Città</strong> per visitare discoteca, cinema, centro commerciale!</p>
                </div>
              </Card>

              <Card className="p-3 border-2 border-secondary bg-card">
                <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
                  <Motorcycle size={24} weight="fill" />
                  MOTORINO
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    icon={<Motorcycle size={48} />}
                    label="Trucca Motorino"
                    shortcut="Ctrl+4"
                    onClick={handleMotorino}
                    disabled={morningChoicePending || phaseActionsLeft <= 0 || stats.soldi < 50 || stats.stanchezza > 80}
                    blockedReason={morningChoicePending ? '🏫 Scegli prima se andare a scuola o marinare!' : phaseActionsLeft <= 0 ? 'Nessuna azione per questa fascia oraria' : stats.soldi < 50 ? 'Servono almeno 50€' : 'Sei troppo stanco per trafficare col motorino!'}
                    ariaLabel="Trucca il motorino per aumentare molto la coattaggine. Costa 50 euro. Tasto rapido: Ctrl+4"
                  />
                  <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                    <p className="font-semibold mb-1">Effetti:</p>
                    <p>• +15 Coattaggine</p>
                    <p>• +10 Figosità</p>
                    <p className="mt-2 text-destructive font-semibold">Costo: 50€</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="city" className="space-y-6 mt-6">
            <CityPanel
              onDisco={handleDisco}
              onCinema={handleCinema}
              onShopping={handleShoppingMall}
              onPalestra={handlePalestra}
              onLampada={handleLampada}
              onLavoro={handleLavoro}
              morningChoicePending={morningChoicePending}
              actionsRemaining={phaseActionsRemaining ?? 0}
              soldi={stats.soldi}
              muscoli={stats.muscoli}
              stanchezza={stats.stanchezza}
            />
          </TabsContent>
        </Tabs>
      </div>

      <GameDialogs {...gameDialogsProps} />
    </main>
  )
}

export default App
