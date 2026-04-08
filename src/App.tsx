import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  GraduationCap, 
  Buildings,
  Chats,
  Keyboard,
  ChartBar,
  User,
  IdentificationCard
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { TimeDisplay } from '@/components/TimeDisplay'
import { ThemeSelector } from '@/components/ThemeSelector'
import { GameDialogs } from '@/components/GameDialogs'
import { SchoolSelection } from '@/components/SchoolSelection'
import { StatusTab } from '@/components/tabs/StatusTab'
import { CityTab } from '@/components/tabs/CityTab'
import { SocialTab } from '@/components/tabs/SocialTab'
import { SchoolTab } from '@/components/tabs/SchoolTab'
import { CharacterSheet } from '@/components/CharacterSheet'
import { DailyControls } from '@/components/DailyControls'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GameStats, SubjectGrades, GameTime, DEFAULT_GAME_STATE, SchoolType, getDefaultGradesForSchoolType, Friend, Relationship, ScheduledExam, PlayerProfile, ThemeVariant, SchoolRecord, DEFAULT_SCHOOL_RECORD, DEFAULT_HEALTH_RECORD } from '@/lib/types'
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
  validateGrades, 
  validateFriends, 
  validateRelationships, 
  validateSchoolType 
} from '@/lib/data-validation'
import { 
  clampStat, 
  calculateMedia, 
  calculateWeightedMedia,
  checkGameOver,
  calculateReputationFromStats,
  getReputationLevel,
  getReputationEventModifier
} from '@/lib/game-utils'
import { 
  advanceGameTime, 
  shouldShowReportCard, 
  shouldReceivePaghetta
} from '@/lib/time-utils'
import { playSound } from '@/lib/sound-effects'
import type { SchoolEvent } from '@/lib/school-events'
import type { SchoolMorningEvent } from '@/lib/school-morning-events'
import { migrateLegacyFriend, applyDailyErosion, dateToDayIndex } from '@/lib/relation-system'
import { useGameRelations } from '@/hooks/useGameRelations'
import { useSchoolSystem } from '@/hooks/useSchoolSystem'
import type { SchoolDayState, Teacher, Classmate } from '@/lib/types'
import type { BetInfo } from '@/lib/bet-system'
import { useSchoolHandlers } from '@/hooks/useSchoolHandlers'
import { useSchoolEffects } from '@/hooks/useSchoolEffects'
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
  // Blocco 4 — navigazione sotto-pannelli scolastici
  const [schoolSubPanel, setSchoolSubPanel] = useState<'home' | 'teachers' | 'break'>('home')

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
    consumeAction, consumeAllMorningActions, advanceToNextDay, gainExtraAction, handleDormi,
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
    handleDormi,
    onOpenStreetRace: (race: BetInfo) => {
      events.setBetInfo(race)
      setShowStreetRaceEvent(true)
    },
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

  // Sistema scolastico avanzato (Fase 1F / Blocco 2)
  const {
    timetable,
    teachers,
    setTeachers,
    classRoster,
    setClassRoster,
    schoolDayState: _schoolDayStateFromHook,
    setSchoolDayState,
    getTodaySchedule,
    initSchoolYear,
  } = useSchoolSystem()

  const isSchoolMorningSequenceInProgress =
    currentPhase === 'mattina' &&
    showSchoolMorning &&
    schoolRecord.wentToSchoolToday &&
    ((_schoolDayStateFromHook?.slots.length ?? 0) > 0) &&
    !_schoolDayStateFromHook?.isComplete

  const handleAdvancePhaseGuarded = useCallback(() => {
    if ((phaseActionsRemaining ?? 0) > 0) {
      announce(`Devi consumare prima le ${phaseActionsRemaining ?? 0} azioni rimaste!`)
      return
    }

    if (isSchoolMorningSequenceInProgress) {
      announce('Completa prima tutte le ore di scuola prima di avanzare alla fase successiva.')
      return
    }

    advancePhaseOnly()
  }, [advancePhaseOnly, announce, isSchoolMorningSequenceInProgress, phaseActionsRemaining])

  const handleRiposa = () => actions.handleRiposa()

  // Blocco 4 \u2014 Promozione compagno ad amico dall'elenco classe
  // ── useSchoolHandlers ──────────────────────────────────────────────────────
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
    onTeacherInteraction,
    onSlotComplete,
    onBreakComplete,
    onTeacherChange,
    onClassmateChange,
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
    setGirlfriend,
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
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const htmlElement = document.querySelector('html')
    if (htmlElement) {
      htmlElement.setAttribute('data-theme', currentTheme ?? 'default')
    }
  }, [currentTheme])

  // ── useSchoolEffects — 4 useEffect scolastici ─────────────────────────────
  useSchoolEffects({
    currentPhase: currentPhase ?? null,
    dayType: dayType ?? null,
    gameTime,
    schoolRecord,
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
    setStats,
    setSchoolEvent,
    setShowSchoolEvent,
    setGameOver,
    setGameOverReason,
    announce,
  })
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const checkStatus = checkGameOver({ ...stats, media: calculateMedia(grades) })
    if (checkStatus.isOver) {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason(checkStatus.reason)
      announce(checkStatus.reason)
    }
  }, [stats, grades])

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
    advancePhaseOnly: handleAdvancePhaseGuarded,
    setShowKeyboardHelp,
    announce
  })

  // ── Derivati memoizzati (devono stare prima del return condizionale) ──────────
  const currentMedia = useMemo(
    () => schoolType ? calculateWeightedMedia(grades, schoolType) : 0,
    [grades, schoolType]
  )

  const schoolDialogProps = useMemo(() => ({
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
    showTeacherDialog,
    setShowTeacherDialog,
    handleTeacherSelection,
    teacherActionType,
  }), [showReportCard, grades, currentMedia, reportCardPassed,
       gameTime.schoolYear.currentYear, handleReportCardContinue,
       schoolRecord.condotta, schoolRecord.assenze, showSchoolEvent,
       schoolEvent, handleSchoolEventChoice, showSubjectDialog,
       handleStudySubject, showTeacherDialog, handleTeacherSelection,
       teacherActionType])

  const cityDialogProps = useMemo(() => ({
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
    soldi: stats.soldi,
    betInfo: events.betInfo,
  }), [showMetallariEvent, currentEvent, handleMetallariScappa,
       handleMetallariCombatti, showPoliceEvent, handlePoliceScappa,
       handlePoliceCollabora, showStreetRaceEvent, raceWinChance,
       handleStreetRaceRifiuta, handleStreetRaceAccetta, stats.soldi, events.betInfo])

  const socialDialogProps = useMemo(() => ({
    showAtipaEvent,
    setShowAtipaEvent,
    atipaSuccessChance,
    handleAtipaRinuncia,
    handleAtipaProva,
    showBulliEvent,
    setShowBulliEvent,
    handleBulliCedi,
    handleBulliResisti,
    showKeyboardHelp,
    setShowKeyboardHelp,
    stanchezza: stats.stanchezza,
    gameOver,
    gameOverReason,
    handleReset,
    showResetDialog,
    setShowResetDialog,
  }), [showAtipaEvent, atipaSuccessChance, handleAtipaRinuncia, handleAtipaProva,
       showBulliEvent, handleBulliCedi, handleBulliResisti,
       showKeyboardHelp, stats.stanchezza, gameOver, gameOverReason,
       handleReset, showResetDialog])
  // ─────────────────────────────────────────────────────────────────────────────

  if (!schoolType) {
    return (
      <SchoolSelection
        onSelectSchool={handleSchoolSelection}
        onSchoolSelected={(st) => initSchoolYear(st, gameTime.schoolYear.currentYear)}
      />
    )
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
        <DailyControls
          currentPhase={currentPhase ?? null}
          dayType={dayType ?? null}
          phaseActionsRemaining={phaseActionsRemaining ?? 0}
          isSchoolMorningSequenceInProgress={isSchoolMorningSequenceInProgress}
          isSchoolPeriod={gameTime.schoolYear.isSchoolPeriod}
          handleRiposa={handleRiposa}
          handleDormi={handleDormi}
          handleAdvancePhaseGuarded={handleAdvancePhaseGuarded}
        />
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
            <StatusTab
              currentTheme={(currentTheme ?? 'default') as ThemeVariant}
              onThemeChange={handleThemeChange}
              schoolYear={gameTime.schoolYear.currentYear}
              playerProfile={playerProfile ?? null}
              schoolType={schoolType}
              age={gameTime.age}
              onResetRequest={() => setShowResetDialog(true)}
            />
          </TabsContent>

          <TabsContent value="school" className="space-y-6 mt-6">
            <SchoolTab
              schoolType={schoolType}
              schoolYear={gameTime.schoolYear.currentYear}
              grades={grades}
              currentMedia={currentMedia}
              rawGradesHistory={rawGradesHistory ?? {}}
              scheduledExams={scheduledExams}
              stats={stats}
              friends={friends}
              teachers={teachers ?? []}
              classRoster={classRoster ?? []}
              schoolRecord={schoolRecord}
              girlfriend={girlfriend ?? null}
              phaseActionsLeft={phaseActionsLeft}
              phaseActionsRemaining={phaseActionsRemaining ?? 0}
              dayType={dayType}
              currentPhase={currentPhase}
              currentDate={gameTime.currentDate}
              isSchoolPeriod={gameTime.schoolYear.isSchoolPeriod}
              schoolSubPanel={schoolSubPanel}
              setSchoolSubPanel={setSchoolSubPanel}
              schoolDayState={_schoolDayStateFromHook}
              timetable={timetable ?? null}
              showSchoolMorning={showSchoolMorning}
              schoolMorningEvents={schoolMorningEvents}
              showStreetMorning={showStreetMorning}
              streetMorningEvents={streetMorningEvents}
              morningChoicePending={morningChoicePending}
              marinatoOggi={marinatoOggi}
              afternoonEvent={afternoonEvent}
              handleVaiAScuola={handleVaiAScuola}
              handleMarina={handleMarina}
              handleOpenCorrompiDialog={handleOpenCorrompiDialog}
              handleOpenMinacciaDialog={handleOpenMinacciaDialog}
              handleFriendAction={handleFriendAction}
              handleGirlfriendAction={handleGirlfriendAction}
              handleGirlfriendBreakup={handleGirlfriendBreakup}
              handlePrepareExam={handlePrepareExam}
              handleAfternoonChoice={handleAfternoonChoice}
              handlePromoteToFriend={handlePromoteToFriend}
              doInteraction={doInteraction}
              onTeacherInteraction={onTeacherInteraction}
              onStatChange={setStats}
              onTeacherChange={onTeacherChange}
              onClassmateChange={onClassmateChange}
              onNewFriend={onNewFriend}
              onSlotComplete={onSlotComplete}
              onBreakComplete={onBreakComplete}
              gainExtraAction={gainExtraAction}
              consumeAction={consumeAction}
              announce={announce}
              addLogEntry={addLogEntry}
            />
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
            <SocialTab
              morningChoicePending={morningChoicePending}
              phaseActionsLeft={phaseActionsLeft}
              isSchoolPeriod={gameTime.schoolYear.isSchoolPeriod}
              stanchezza={stats.stanchezza}
              soldi={stats.soldi}
              intelligenza={stats.intelligenza}
              handleStudia={handleStudia}
              handleChiacchiera={handleChiacchiera}
              handleParco={handleParco}
              handleTelefona={handleTelefona}
              handleProvarciConAtipa={handleProvarciConAtipa}
              handleMotorino={handleMotorino}
              announce={announce}
            />
          </TabsContent>

          <TabsContent value="city" className="space-y-6 mt-6">
            <CityTab
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
              availableActions={actions.availableActions}
              onAction={actions.getHandlerForAction}
            />
          </TabsContent>
        </Tabs>
      </div>

      <GameDialogs {...schoolDialogProps} {...cityDialogProps} {...socialDialogProps} />
    </main>
  )
}

export default App
