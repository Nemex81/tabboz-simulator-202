import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useKV } from '@/hooks/useHydratedKV'
import { AppHeader } from '@/components/AppHeader'
import { A11yLiveRegion, useA11y } from '@/components/A11yLiveRegion'
import { GameDialogs } from '@/components/GameDialogs'
import { MainGameTabs } from '@/components/MainGameTabs'
import { SchoolSelection } from '@/components/SchoolSelection'
import { CharacterSheet } from '@/components/CharacterSheet'
import { GameStats, SubjectGrades, GameTime, DEFAULT_GAME_STATE, SchoolType, Friend, Relationship, ScheduledExam, PlayerProfile, ThemeVariant, SchoolRecord, DEFAULT_SCHOOL_RECORD, DEFAULT_HEALTH_RECORD } from '@/lib/types'
import { useGameStats } from '@/hooks/useGameStats'
import { useGameTime } from '@/hooks/useGameTime'
import { useEventEngine } from '@/hooks/useEventEngine'
import { useGameActions } from '@/hooks/useGameActions'
import { useAppDialogs } from '@/hooks/useAppDialogs'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useGameLog } from '@/hooks/useGameLog'
import { useHealthSystem } from '@/hooks/useHealthSystem'
import type { ActivePartner, Ragazza } from '@/lib/girlfriend-system'
import { 
  validateGrades, 
  validateFriends, 
  validateRelationships, 
  validateSchoolType 
} from '@/lib/data-validation'
import { 
  clampStat, 
  calculateMedia, 
  calculateWeightedMedia,
  checkGameOver
} from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'
import { migrateLegacyFriend, applyDailyErosion, dateToDayIndex } from '@/lib/relation-system'
import { useGameRelations } from '@/hooks/useGameRelations'
import { useSchoolSystem } from '@/hooks/useSchoolSystem'
import type { BetInfo } from '@/lib/bet-system'
import type { JobDefinition, JobId } from '@/lib/job-system'
import { useSchoolHandlers } from '@/hooks/useSchoolHandlers'
import { useSchoolEffects } from '@/hooks/useSchoolEffects'
import { useAppEffects } from '@/hooks/useAppEffects'
import { useAppViewModels } from '@/hooks/useAppViewModels'
import { useGameNarrator } from '@/hooks/useGameNarrator'
import {
  adaptNarrativeText,
  DEFAULT_SEXUAL_ORIENTATION,
  normalizePlayerProfile,
  normalizePlayerProfileNullable,
  normalizeRelationshipCandidate,
  normalizeRomanticPartner,
} from '@/lib/gender-utils'

function App() {
  const { announce: baseAnnounce } = useA11y()
  const keyboardHelpRestoreTargetRef = useRef<HTMLElement | null>(null)
  const [rawSchoolType, setRawSchoolType] = useKV<SchoolType | null>('tabboz-school-type', null)
  const [rawPlayerProfile, setRawPlayerProfile] = useKV<PlayerProfile | null>('tabboz-player-profile', null)
  const [rawGrades, setRawGrades] = useKV<SubjectGrades>('tabboz-grades', DEFAULT_GAME_STATE.grades)
  const [rawFriends, setRawFriends] = useKV<Friend[]>('tabboz-friends', [])
  const [rawRelationships, setRawRelationships] = useKV<Relationship[]>('tabboz-relationships', [])
  const [rawActivePartners, setRawActivePartners] = useKV<ActivePartner[]>('tabboz-active-partners', [])
  const [rawLegacyGirlfriend, setRawLegacyGirlfriend] = useKV<Ragazza | null>('tabboz-girlfriend', null)
  const [currentTheme, setCurrentTheme] = useKV<ThemeVariant>('tabboz-theme', 'default')
  const [rawSchoolRecord, setRawSchoolRecord] = useKV<SchoolRecord>('tabboz-school-record', DEFAULT_SCHOOL_RECORD)
  const [rawGradesHistory, setRawGradesHistory] = useKV<Record<number, SubjectGrades>>('tabboz-grades-history', {})

  const schoolType = validateSchoolType(rawSchoolType)
  const playerProfile = useMemo(() => normalizePlayerProfileNullable(rawPlayerProfile), [rawPlayerProfile])
  const grades = validateGrades(rawGrades, schoolType)
  const friends = validateFriends(rawFriends).map(migrateLegacyFriend)
  const relationships = useMemo(
    () => validateRelationships(rawRelationships).map(normalizeRelationshipCandidate),
    [rawRelationships]
  )
  const activePartners = useMemo(
    () => (rawActivePartners ?? []).map((partner) => ({
      ...(normalizeRomanticPartner(partner) ?? partner),
      relationshipSourceKey: partner.relationshipSourceKey,
    })),
    [rawActivePartners]
  )
  const schoolRecord = rawSchoolRecord || DEFAULT_SCHOOL_RECORD

  const setSchoolType = setRawSchoolType
  const setPlayerProfile = setRawPlayerProfile
  const setGrades = setRawGrades
  const setFriends = setRawFriends
  const setRelationships = setRawRelationships
  const setActivePartners = setRawActivePartners
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
    streetMorningEvents,
    setStreetMorningEvents,
    morningDisplay,
    setMorningDisplay,
    showJobSelectionDialog,
    setShowJobSelectionDialog,
    availableJobsForDialog,
    setAvailableJobsForDialog,
  } = useAppDialogs()

  const showSchoolMorning = morningDisplay === 'school'
  const showStreetMorning = morningDisplay === 'street'
  const setShowSchoolMorning = useCallback((value: boolean) => {
    setMorningDisplay(value ? 'school' : null)
  }, [setMorningDisplay])
  const setShowStreetMorning = useCallback((value: boolean) => {
    setMorningDisplay(value ? 'street' : null)
  }, [setMorningDisplay])

  const [marinatoOggi, setMarinatoOggi] = useState(false)
  const [morningChoicePending, setMorningChoicePending] = useState(false)
  const [schoolSubPanel, setSchoolSubPanel] = useState<'home' | 'teachers' | 'break'>('home')
  const [activeTab, setActiveTab] = useState<string>('school')
  const [schoolMorningChoiceFocusNonce, setSchoolMorningChoiceFocusNonce] = useState(0)
  const schoolBootstrapStartedRef = useRef(false)

  const announce = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const adaptedMessage = adaptNarrativeText(message, playerProfile?.gender)
    baseAnnounce(adaptedMessage, priority)
  }, [baseAnnounce, playerProfile?.gender])

  const { stats, setStats } = useGameStats(announce)
  const { gameLog, addLogEntry: rawAddLogEntry, clearLog } = useGameLog()
  const addLogEntry = useCallback((
    type: import('@/lib/types').LogEntryType,
    title: string,
    description: string,
    result: import('@/lib/types').GameLogEntry['result'],
    date: import('@/lib/types').GameDate,
    phase: import('@/lib/types').DayPhase,
  ) => {
    rawAddLogEntry(
      type,
      adaptNarrativeText(title, playerProfile?.gender),
      adaptNarrativeText(description, playerProfile?.gender),
      result,
      date,
      phase,
    )
  }, [playerProfile?.gender, rawAddLogEntry])

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
    consumeAction, consumeInterazione, consumeAllMorningActions, advanceToNextDay, gainExtraAction, handleDormi,
    currentPhase, dayType, phaseActionsRemaining, phaseActionsMax, interazioniRimaste, advancePhaseOnly, canInteract,
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
      setRawFriends(prev =>
        applyDailyErosion(
          (prev ?? []).map(migrateLegacyFriend),
          dateToDayIndex(newDate)
        )
      )
    },
  })

  const phaseActionsLeft = phaseActionsRemaining ?? 0

  const events = useEventEngine({
    stats,
    setStats,
    friends,
    setFriends,
    relationships,
    setRelationships,
    setActivePartners,
    gameTime,
    consumeAction,
    announce,
    phaseActionsRemaining: phaseActionsRemaining ?? 0,
    addLogEntry,
    currentPhase: currentPhase ?? 'mattina',
    playerProfile,
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
    activePartners,
    setActivePartners,
    setGameOver,
    setGameOverReason,
    consumeAction,
    consumeInterazione,
    announce,
    triggerRandomEvent: events.triggerRandomEvent,
    checkForNewFriend: events.checkForNewFriend,
    checkForNewRelationship: events.checkForNewRelationship,
    checkForNewGirlfriend: events.checkForNewGirlfriend,
    setShowSubjectDialog,
    currentPhase: currentPhase ?? 'mattina',
    dayType: dayType ?? 'feriale',
    phaseActionsRemaining: phaseActionsRemaining ?? 0,
    canInteract,
    schoolRecord,
    setSchoolRecord,
    gainExtraAction,
    addLogEntry,
    marinatoOggi,
    applyCondition,
    handleDormi,
    onOpenStreetRace: (race: BetInfo) => {
      events.setBetInfo(race)
      setShowStreetRaceEvent(true)
    },
    onOpenJobSelection: (jobs: JobDefinition[]) => {
      setAvailableJobsForDialog(jobs)
      setShowJobSelectionDialog(true)
    },
  })

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

  const {
    handlePalestra,
    handleLampada,
    handleLavoro,
    handleJobSelection,
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
    handleNavigaOnline,
    handleParco,
    handleTelefona,
    handleMarina: handleMarinaFromHook,
  } = actions

  const handleSelectJob = useCallback((jobId: JobId) => {
    handleJobSelection(jobId)
    setShowJobSelectionDialog(false)
  }, [handleJobSelection, setShowJobSelectionDialog])

  const {
    timetable,
    setTimetable,
    teachers,
    setTeachers,
    classRoster,
    setClassRoster,
    schoolDayState: _schoolDayStateFromHook,
    setSchoolDayState,
    getTodaySchedule,
    initSchoolYear,
  } = useSchoolSystem()

  const { doInteraction, doClassmateInteraction, doTeacherInteraction } = useGameRelations({
    friends,
    setFriends: setRawFriends,
    stats,
    setStats,
    gameDate: gameTime.currentDate,
    announce,
    classRoster,
    setClassRoster,
    teachers,
    setTeachers,
  })

  const isSchoolMorningSequenceInProgress =
    currentPhase === 'mattina' &&
    schoolRecord.wentToSchoolToday &&
    ((_schoolDayStateFromHook?.slots.length ?? 0) > 0) &&
    !_schoolDayStateFromHook?.isComplete

  const handleAdvancePhaseGuarded = useCallback(() => {
    if (currentPhase === 'notte') {
      announce('Di notte usa Vai a dormire per passare al giorno successivo.', 'assertive')
      return
    }

    if (morningChoicePending) {
      announce('Scegli prima se andare a lezione o saltare la scuola.', 'assertive')
      return
    }

    if (isSchoolMorningSequenceInProgress) {
      announce('Completa prima tutte le ore di scuola prima di avanzare alla fase successiva.', 'assertive')
      return
    }

    advancePhaseOnly()
  }, [advancePhaseOnly, announce, currentPhase, isSchoolMorningSequenceInProgress, morningChoicePending])

  const handleRiposa = () => actions.handleRiposa()

  const {
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
    onSlotComplete,
    onBreakComplete,
    onNewFriend,
  } = useSchoolHandlers({
    stats,
    setStats,
    grades,
    setGrades,
    schoolRecord,
    setSchoolRecord,
    schoolType,
    schoolEvent,
    setSchoolEvent,
    gameTime,
    setGameTime,
    timetable,
    teachers,
    setTeachers,
    classRoster,
    setClassRoster,
    friends,
    setRawFriends,
    setRelationships,
    setScheduledExams,
    setActivePartners,
    gameWon,
    phaseActionsRemaining: phaseActionsRemaining ?? 0,
    currentPhase: currentPhase ?? null,
    dayType: dayType ?? null,
    marinatoOggi,
    teacherActionType,
    setTeacherActionType,
    setShowTeacherDialog,
    setShowSchoolMorning,
    setSchoolMorningEvents,
    setShowStreetMorning,
    setStreetMorningEvents,
    setShowSchoolEvent,
    setShowReportCard,
    setGameOver,
    setGameOverReason,
    setShowResetDialog,
    setGameWon,
    rawGradesHistory: rawGradesHistory ?? {},
    setRawGradesHistory,
    setSchoolType,
    setPlayerProfile,
    setCurrentTheme,
    setSchoolDayState,
    setTimetable,
    consumeAllMorningActions,
    getTodaySchedule,
    canAttendSchool,
    handleMarinaFromHook,
    handleCorrompiSubject,
    handleMinacciaSubject,
    handleStudySubject,
    setMorningChoicePending,
    setMarinatoOggi,
    clearLog,
    setHealthRecord,
    announce,
    addLogEntry,
  })

  useAppEffects({
    currentTheme,
    rawPlayerProfile: rawPlayerProfile ?? null,
    setRawPlayerProfile,
    rawRelationships: rawRelationships ?? [],
    setRawRelationships,
    rawActivePartners: rawActivePartners ?? [],
    setRawActivePartners,
    rawLegacyGirlfriend: rawLegacyGirlfriend ?? null,
    setRawLegacyGirlfriend,
    rawFriends: rawFriends ?? [],
    setRawFriends,
    schoolType,
    gameYear: gameTime.schoolYear.currentYear,
    timetable,
    teachersLength: teachers.length,
    classRosterLength: classRoster.length,
    initSchoolYear,
    schoolBootstrapStartedRef,
    gameOver,
    stats,
    grades,
    setGameOver,
    setGameOverReason,
    announce,
  })

  useSchoolEffects({
    currentPhase: currentPhase ?? null,
    dayType: dayType ?? null,
    gameTime,
    schoolRecord,
    schoolDayState: _schoolDayStateFromHook,
    grades,
    stats,
    gameOver,
    marinatoOggi,
    setMarinatoOggi,
    setShowStreetMorning,
    setStreetMorningEvents: setStreetMorningEvents as import('react').Dispatch<import('react').SetStateAction<never[]>>,
    setShowSchoolMorning,
    setSchoolMorningEvents: setSchoolMorningEvents as import('react').Dispatch<import('react').SetStateAction<never[]>>,
    setMorningChoicePending,
    setSchoolDayState,
    setStats,
    setSchoolEvent,
    showSchoolEvent,
    setShowSchoolEvent,
    setGameOver,
    setGameOverReason,
    announce,
  })

  const openKeyboardHelp = useCallback((trigger?: HTMLElement | null) => {
    if (typeof document !== 'undefined') {
      keyboardHelpRestoreTargetRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    }

    setShowKeyboardHelp(true)
  }, [setShowKeyboardHelp])

  const handleKeyboardHelpCloseAutoFocus = useCallback((event: Event) => {
    event.preventDefault()

    const restoreTarget = keyboardHelpRestoreTargetRef.current
    const fallbackTarget = typeof document !== 'undefined'
      ? document.getElementById('main-content')
      : null

    window.requestAnimationFrame(() => {
      if (restoreTarget?.isConnected) {
        restoreTarget.focus()
        return
      }

      if (fallbackTarget instanceof HTMLElement) {
        fallbackTarget.focus()
      }
    })
  }, [])

  useEffect(() => {
    if (schoolMorningChoiceFocusNonce === 0 || activeTab !== 'school') {
      return
    }

    const focusMorningChoiceButton = () => {
      const button = document.getElementById('school-go-to-school-action')

      if (button instanceof HTMLElement) {
        button.focus()
        return
      }

      window.requestAnimationFrame(() => {
        const retryButton = document.getElementById('school-go-to-school-action')

        if (retryButton instanceof HTMLElement) {
          retryButton.focus()
        }
      })
    }

    window.requestAnimationFrame(focusMorningChoiceButton)
  }, [activeTab, schoolMorningChoiceFocusNonce])

  const handleGoToSchoolMorningChoice = useCallback(() => {
    setActiveTab('school')
    setSchoolMorningChoiceFocusNonce((value) => value + 1)
  }, [])

  useKeyboardShortcuts({
    currentPhase,
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
    handleDormi,
    handleProvarciConAtipa,
    handleDisco,
    handleCinema,
    handleShoppingMall,
    setShowResetDialog,
    advancePhaseOnly: handleAdvancePhaseGuarded,
    openKeyboardHelp,
    setActiveTab,
    announce
  })

  const currentMedia = useMemo(
    () => schoolType ? calculateWeightedMedia(grades, schoolType) : 0,
    [grades, schoolType]
  )

  useGameNarrator({
    currentDate: gameTime.currentDate,
    currentPhase: currentPhase ?? null,
    phaseActionsRemaining: phaseActionsRemaining ?? 0,
    stats,
    afternoonEvent,
    activeConditionIds: healthRecord.conditions.map((condition) => condition.id),
  })

  const nextPhaseLabelStr =
    currentPhase === 'mattina' ? 'Pomeriggio' :
    currentPhase === 'pomeriggio' ? 'Sera' :
    currentPhase === 'sera' ? 'Notte' : 'Mattina'

  const {
    statusTabProps,
    schoolTabProps,
    characterTabProps,
    socialTabProps,
    cityTabProps,
    schoolDialogProps,
    cityDialogProps,
    socialDialogProps,
  } = useAppViewModels({
    currentTheme,
    handleThemeChange,
    schoolYear: gameTime.schoolYear.currentYear,
    playerProfile: playerProfile ?? null,
    schoolType,
    age: gameTime.age,
    onResetRequest: () => setShowResetDialog(true),
    schoolTabInput: {
      schoolType,
      schoolYear: gameTime.schoolYear.currentYear,
      grades,
      currentMedia,
      rawGradesHistory: rawGradesHistory ?? {},
      scheduledExams,
      stats,
      friends,
      teachers: teachers ?? [],
      classRoster: classRoster ?? [],
      schoolRecord,
      activePartners,
      phaseActionsLeft,
      phaseActionsRemaining: phaseActionsRemaining ?? 0,
      interactionsRemaining: interazioniRimaste ?? 0,
      dayType,
      currentPhase,
      currentDate: gameTime.currentDate,
      isSchoolPeriod: gameTime.schoolYear.isSchoolPeriod,
      schoolSubPanel,
      setSchoolSubPanel,
      schoolDayState: _schoolDayStateFromHook,
      timetable: timetable ?? null,
      schoolMorningEvents,
      morningDisplay,
      streetMorningEvents,
      morningChoicePending,
      marinatoOggi,
      afternoonEvent,
      handleVaiAScuola,
      handleMarina,
      handleOpenCorrompiDialog,
      handleOpenMinacciaDialog,
      handleFriendAction,
      handleGirlfriendAction,
      handleGirlfriendBreakup,
      handlePrepareExam,
      handleAfternoonChoice,
      handlePromoteToFriend,
      doInteraction,
      doClassmateInteraction,
      doTeacherInteraction,
      onStatChange: setStats,
      onNewFriend,
      onSlotComplete,
      onBreakComplete,
      gainExtraAction,
      consumeAction,
      announce,
      addLogEntry,
      onAdvance: handleAdvancePhaseGuarded,
      nextPhaseLabel: nextPhaseLabelStr,
    },
    characterTabInput: {
      playerProfile: playerProfile ?? null,
      stats,
      schoolType,
      schoolYear: gameTime.schoolYear.currentYear,
      age: gameTime.age,
      schoolRecord,
      currentMedia,
      gameLog,
      healthRecord: healthRecord ?? DEFAULT_HEALTH_RECORD,
      grades,
      gradesHistory: rawGradesHistory ?? {},
      friends,
      relationships,
      actionsRemaining: phaseActionsRemaining ?? 0,
      interactionsRemaining: interazioniRimaste ?? 0,
      onFriendAction: handleFriendAction,
      onRelationInteraction: doInteraction,
      activePartners,
      onGirlfriendAction: handleGirlfriendAction,
      onGirlfriendBreakup: handleGirlfriendBreakup,
      onTryRelationship: handleTryRelationship,
    },
    socialTabInput: {
      playerGender: playerProfile?.gender ?? 'maschio',
      currentPhase,
      morningChoicePending,
      phaseActionsLeft,
      isSchoolPeriod: gameTime.schoolYear.isSchoolPeriod,
      stanchezza: stats.stanchezza,
      soldi: stats.soldi,
      intelligenza: stats.intelligenza,
      handleStudia,
      handleChiacchiera,
      handleNavigaOnline,
      handleParco,
      handleTelefona,
      handleProvarciConAtipa,
      handleMotorino,
      onAdvance: handleAdvancePhaseGuarded,
      nextPhaseLabel: nextPhaseLabelStr,
    },
    cityTabInput: {
      playerGender: playerProfile?.gender ?? 'maschio',
      onDisco: handleDisco,
      onCinema: handleCinema,
      onShopping: handleShoppingMall,
      onPalestra: handlePalestra,
      onLampada: handleLampada,
      onLavoro: handleLavoro,
      morningChoicePending,
      actionsRemaining: phaseActionsRemaining ?? 0,
      soldi: stats.soldi,
      muscoli: stats.muscoli,
      stanchezza: stats.stanchezza,
      availableActions: actions.availableActions,
      onAction: actions.getHandlerForAction,
      onAdvance: handleAdvancePhaseGuarded,
      nextPhaseLabel: nextPhaseLabelStr,
    },
    schoolDialogsInput: {
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
      showSubjectDialog,
      setShowSubjectDialog,
      handleStudySubject,
      stanchezza: stats.stanchezza,
      playerGender: playerProfile?.gender ?? 'maschio',
      showTeacherDialog,
      setShowTeacherDialog,
      handleTeacherSelection,
      teacherActionType,
      soldi: stats.soldi,
    },
    cityDialogsInput: {
      showMetallariEvent,
      setShowMetallariEvent,
      currentEvent,
      handleMetallariScappa,
      handleMetallariCombatti,
      showPoliceEvent,
      setShowPoliceEvent,
      handlePoliceScappa,
      handlePoliceCollabora,
      showStreetRaceEvent,
      setShowStreetRaceEvent,
      raceWinChance,
      handleStreetRaceRifiuta,
      handleStreetRaceAccetta,
      betInfo: events.betInfo,
      showJobSelectionDialog,
      setShowJobSelectionDialog,
      availableJobsForDialog,
      onSelectJob: handleSelectJob,
      playerStats: stats,
      playerSchoolYear: gameTime.schoolYear.currentYear,
    },
    socialDialogsInput: {
      showAtipaEvent,
      setShowAtipaEvent,
      atipaSuccessChance,
      handleAtipaRinuncia,
      handleAtipaProva,
      showBulliEvent,
      setShowBulliEvent,
      handleBulliCedi,
      handleBulliResisti,
      gameOver,
      gameOverReason,
      handleReset,
      showResetDialog,
      setShowResetDialog,
      showKeyboardHelp,
      setShowKeyboardHelp,
      onKeyboardHelpCloseAutoFocus: handleKeyboardHelpCloseAutoFocus,
      stanchezza: stats.stanchezza,
    },
  })
  // ─────────────────────────────────────────────────────────────────────────────

  if (!schoolType) {
    return (
      <SchoolSelection
        onSelectSchool={handleSchoolSelection}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Salta al contenuto principale
      </a>
      <main id="main-content" role="main" tabIndex={-1} className="outline-none">
        <div className="max-w-6xl mx-auto space-y-6">
          <AppHeader
            playerProfile={playerProfile ?? null}
            gameTime={gameTime}
            currentPhase={currentPhase}
            dayType={dayType}
            phaseActionsRemaining={phaseActionsRemaining ?? 0}
            phaseActionsMax={phaseActionsMax}
            interazioniRimaste={interazioniRimaste ?? 0}
            isSchoolMorningSequenceInProgress={isSchoolMorningSequenceInProgress}
            morningChoicePending={morningChoicePending}
            onOpenKeyboardHelp={openKeyboardHelp}
            onGoToSchool={handleGoToSchoolMorningChoice}
            handleRiposa={handleRiposa}
            handleDormi={handleDormi}
            handleAdvancePhaseGuarded={handleAdvancePhaseGuarded}
          />
          <A11yLiveRegion />
          <MainGameTabs
            activeTab={activeTab}
            onValueChange={setActiveTab}
            currentPhase={currentPhase}
            statusTab={statusTabProps}
            schoolTab={schoolTabProps}
            characterTab={characterTabProps}
            socialTab={socialTabProps}
            cityTab={cityTabProps}
          />
        </div>
      </main>

      <GameDialogs school={schoolDialogProps} city={cityDialogProps} social={socialDialogProps} />
    </div>
  )
}

export default App
