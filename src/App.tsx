import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { 
  Lightning, 
  Barbell, 
  CurrencyDollar, 
  GraduationCap, 
  Battery,
  Sun,
  Briefcase,
  Motorcycle,
  Brain,
  HandCoins,
  Fist,
  Running,
  Heart,
  Sparkle,
  Clock,
  SirenLight,
  Flag,
  ShieldWarning,
  MusicNotes,
  FilmSlate,
  ShoppingCart,
  Crown,
  ChartBar,
  User,
  Buildings,
  Trophy,
  UserCircle,
  Chats,
  Keyboard
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { StatDisplay } from '@/components/StatDisplay'
import { ActionButton } from '@/components/ActionButton'
import { TimeDisplay } from '@/components/TimeDisplay'
import { ThemeSelector } from '@/components/ThemeSelector'
// Dialog poco frequenti caricati in lazy per ridurre il bundle iniziale
const ReportCardDialog = lazy(() => import('@/components/ReportCardDialog').then(m => ({ default: m.ReportCardDialog })))
const SchoolEventDialog = lazy(() => import('@/components/SchoolEventDialog').then(m => ({ default: m.SchoolEventDialog })))
const KeyboardShortcutsDialog = lazy(() => import('@/components/KeyboardShortcutsDialog').then(m => ({ default: m.KeyboardShortcutsDialog })))
const SubjectSelectionDialog = lazy(() => import('@/components/SubjectSelectionDialog').then(m => ({ default: m.SubjectSelectionDialog })))
// Pannelli social caricati in lazy (tab non visibile all'avvio)
const FriendsPanel = lazy(() => import('@/components/FriendsPanel').then(m => ({ default: m.FriendsPanel })))
const EnhancedFriendsPanel = lazy(() => import('@/components/EnhancedFriendsPanel').then(m => ({ default: m.EnhancedFriendsPanel })))
// const GirlfriendPanel = lazy(() => import('@/components/GirlfriendPanel').then(m => ({ default: m.GirlfriendPanel })))
const RelationshipsPanel = lazy(() => import('@/components/RelationshipsPanel').then(m => ({ default: m.RelationshipsPanel })))
const ExamsPanel = lazy(() => import('@/components/ExamsPanel').then(m => ({ default: m.ExamsPanel })))
// Dashboard lazy (tab nascosto all'avvio)
const StatsDashboard = lazy(() => import('@/components/StatsDashboard').then(m => ({ default: m.StatsDashboard })))
// SchoolMorningPanel lazy (solo mattina feriale scolastica)
const SchoolMorningPanel = lazy(() => import('@/components/SchoolMorningPanel').then(m => ({ default: m.SchoolMorningPanel })))
import { SchoolSelection } from '@/components/SchoolSelection'
import { CityPanel } from '@/components/CityPanel'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { GameStats, SubjectGrades, GameTime, DEFAULT_GAME_STATE, SchoolType, getDefaultGradesForSchoolType, getSubjectDisplayName, Friend, Relationship, ScheduledExam, PlayerProfile, ThemeVariant } from '@/lib/types'
import { useGameStats } from '@/hooks/useGameStats'
import { useGameTime } from '@/hooks/useGameTime'
import { useEventEngine } from '@/hooks/useEventEngine'
import { useGameActions } from '@/hooks/useGameActions'
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
  randomChance, 
  checkGameOver,
  calculateReputationFromStats,
  getReputationLevel,
  getReputationEventModifier,
  calculateStudyGradeIncrease,
  canAvoidNegativeEventWithCharisma
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
import { 
  generateRandomFriend, 
  generateRandomRelationship, 
  checkNewFriendEvent,
  calculateRelationshipSuccess,
  getFriendStudyBonus
} from '@/lib/social-system'
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

  const schoolType = validateSchoolType(rawSchoolType)
  const playerProfile = rawPlayerProfile
  const grades = validateGrades(rawGrades, schoolType)
  const friends = validateFriends(rawFriends)
  const relationships = validateRelationships(rawRelationships)
  const girlfriend = rawGirlfriend

  const setSchoolType = setRawSchoolType
  const setPlayerProfile = setRawPlayerProfile
  const setGrades = setRawGrades
  const setFriends = setRawFriends
  const setRelationships = setRawRelationships
  const setGirlfriend = setRawGirlfriend

  const [gameOver, setGameOver] = useState(false)
  const [gameOverReason, setGameOverReason] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showReportCard, setShowReportCard] = useState(false)
  const [reportCardPassed, setReportCardPassed] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [schoolEvent, setSchoolEvent] = useState<SchoolEvent | null>(null)
  const [showSchoolEvent, setShowSchoolEvent] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showSubjectDialog, setShowSubjectDialog] = useState(false)
  // School morning state
  const [schoolMorningEvents, setSchoolMorningEvents] = useState<SchoolMorningEvent[]>([])
  const [showSchoolMorning, setShowSchoolMorning] = useState(false)

  const ariaLiveRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string) => {
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = message
    }
    toast(message)
  }, [])

  // --- Custom Hooks ---
  const { stats, setStats } = useGameStats(announce)

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
    announce
  })

  const events = useEventEngine({
    stats,
    setStats,
    friends,
    setFriends,
    relationships,
    setRelationships,
    girlfriend,
    setGirlfriend,
    gameTime,
    consumeAction,
    announce,
    phaseActionsRemaining
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
    relationships,
    setRelationships,
    girlfriend,
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
    currentPhase,
    dayType,
    phaseActionsRemaining,
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
    handleProvarciConAtipa, handleAtipaRinuncia, handleAtipaProva
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
    handleMinaccia,
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
  } = actions

  const handleRiposa = () => actions.handleRiposa()

  // Fix4: init useEffect — rileva mattina scolastica al caricamento della pagina
  useEffect(() => {
    if (
      dayType === 'feriale' &&
      currentPhase === 'mattina' &&
      gameTime.schoolYear.isSchoolPeriod &&
      !showSchoolMorning &&
      schoolMorningEvents.length === 0
    ) {
      const events = drawSchoolMorningEvents(6)
      setSchoolMorningEvents(events)
      setShowSchoolMorning(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [currentTheme])

  const handleSchoolSelection = (selected: SchoolType, profile: PlayerProfile, theme: ThemeVariant) => {
    playSound.success()
    setSchoolType(selected)
    setPlayerProfile(profile)
    setCurrentTheme(theme)
    setGrades(getDefaultGradesForSchoolType(selected))
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
        const updated = { ...current }
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
    
    if (outcome.gradeChanges) {
      const subjects = Object.keys(grades)
      const targetSubject = outcome.gradeChanges.subject === 'random' 
        ? subjects[Math.floor(Math.random() * subjects.length)]
        : outcome.gradeChanges.subject
      
      setGrades((current) => ({
        ...current,
        [targetSubject]: clampStat(current[targetSubject] + outcome.gradeChanges!.change, 0, 10)
      }))
    }
    
    playSound.eventTrigger()
    announce(outcome.message)
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
    
    if (reportCardPassed) {
      const newYear = gameTime.schoolYear.currentYear + 1
      
      setGameTime((current) => ({
        ...current,
        schoolYear: calculateNextSchoolYear(current.schoolYear),
        age: current.age + 1
      }))
      
      setGrades(schoolType ? getDefaultGradesForSchoolType(schoolType) : DEFAULT_GAME_STATE.grades)
      
      playSound.success()
      announce(`PROMOSSO! Ora sei in ${newYear}° superiore! I voti sono stati resettati.`)
    } else {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason('BOCCIATO! Media sotto il 6! Devi ripetere l\'anno!')
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || showResetDialog || showMetallariEvent || showAtipaEvent || showPoliceEvent || showStreetRaceEvent || showBulliEvent || !schoolType) return
      
      if (!e.ctrlKey && !e.altKey) return
      
      const key = e.key.toLowerCase()
      
      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        switch(key) {
          case '1': handlePalestra(); break
          case '2': handleLampada(); break
          case '3': handleLavoro(); break
          case '4': handleMotorino(); break
          case '5': handleStudia(); break
          case '6': handleCorrompi(); break
          case '7': handleMinaccia(); break
          case '8': handleRiposa(); break
          case '9': handleProvarciConAtipa(); break
          case 'd': handleDisco(); break
          case 'c': handleCinema(); break
          case 's': handleShoppingMall(); break
          case 'r': setShowResetDialog(true); break
        }
      }
      
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        if (key === 'h' || key === '?') {
          setShowKeyboardHelp(true)
          announce('Aiuto scorciatoie da tastiera aperto')
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver, showResetDialog, showMetallariEvent, showAtipaEvent, showPoliceEvent, showStreetRaceEvent, showBulliEvent, showReportCard, stats, grades, gameTime, schoolType])

  if (!schoolType) {
    return <SchoolSelection onSelectSchool={handleSchoolSelection} />
  }

  const currentMedia = calculateMedia(grades)

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
          const canAdvance = phaseActionsRemaining === 0
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
                  {canAdvance ? '✓ Pronto ad avanzare' : `${phaseActionsRemaining} azioni rimaste`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {showRiposa && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRiposa}
                    disabled={phaseActionsRemaining <= 0}
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
                  title={canAdvance ? `Avanza a: ${nextPhaseLabel}` : `Consuma prima le ${phaseActionsRemaining} azioni rimaste`}
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

        <Tabs defaultValue="school" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-2 bg-muted/50 p-1 h-auto">
            <TabsTrigger value="school" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <GraduationCap size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Scuola</span>
              <span className="sm:hidden">Scuola</span>
            </TabsTrigger>
            <TabsTrigger
              value="exams"
              className="rounded-none rounded-t-sm border border-b-0 border-border data-[state=active]:bg-card data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:bg-muted/30 data-[state=inactive]:text-muted-foreground px-3 py-2 text-xs font-semibold"
            >
              <Brain size={14} className="mr-1" weight="fill" />
              Verifiche
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="rounded-none rounded-t-sm border border-b-0 border-border data-[state=active]:bg-card data-[state=active]:border-accent data-[state=active]:text-accent data-[state=inactive]:bg-muted/30 data-[state=inactive]:text-muted-foreground px-3 py-2 text-xs font-semibold"
            >
              <UserCircle size={14} className="mr-1" weight="fill" />
              Amici
            </TabsTrigger>
            <TabsTrigger value="city" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Buildings size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Città</span>
              <span className="sm:hidden">Roma</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Chats size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Sociale</span>
              <span className="sm:hidden">Social</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Controllo</span>
              <span className="sm:hidden">⚙️</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trophy size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6 mt-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-primary mb-2">⚙️ PANNELLO DI CONTROLLO</h2>
              <p className="text-muted-foreground">Gestisci le impostazioni del gioco</p>
            </div>

            <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />

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
            {/* Fix4: SchoolMorningPanel — mattina scolastica feriale */}
            {showSchoolMorning && dayType === 'feriale' && currentPhase === 'mattina' && gameTime.schoolYear.isSchoolPeriod && (
              <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento mattina scolastica...</div>}>
                <SchoolMorningPanel
                  events={schoolMorningEvents}
                  stats={stats}
                  onStatChange={setStats}
                  onGainExtraAction={gainExtraAction}
                  onConsumeAction={consumeAction}
                  announce={announce}
                />
              </Suspense>
            )}
            <Card className="p-3 border-2 border-secondary bg-card">
              <h3 className="text-2xl font-bold mb-4 text-secondary flex items-center gap-2">
                <GraduationCap size={32} weight="fill" />
                VOTI SCOLASTICI
              </h3>
              <div
                role="table"
                aria-label="Voti scolastici"
                className="divide-y divide-border"
              >
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
                <div className="flex items-center justify-between">
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
              </div>
            </Card>

            <Card className="p-3 border-2 border-destructive bg-card">
              <h3 className="text-xl font-bold mb-4 text-destructive flex items-center gap-2">
                <HandCoins size={24} weight="fill" />
                METODI ALTERNATIVI
              </h3>
              <div className="space-y-3">
                <ActionButton
                  icon={<HandCoins size={48} />}
                  label="Corrompi"
                  shortcut="Ctrl+6"
                  onClick={handleCorrompi}
                  disabled={phaseActionsRemaining <= 0 || stats.soldi < 100 || !gameTime.schoolYear.isSchoolPeriod}
                  blockedReason={phaseActionsRemaining <= 0 ? 'Nessuna azione per questa fascia oraria' : stats.soldi < 100 ? 'Servono almeno 100€' : 'Non è periodo scolastico'}
                  variant="default"
                  ariaLabel="Corrompi un professore con una mazzetta da 100 euro. Aumenta i voti. Tasto rapido: Ctrl+6"
                  helpText="Corrompi un professore con 100 euro. Aumenta i voti di 0.5 punti in una materia casuale. Richiede periodo scolastico."
                  announce={announce}
                />
                <ActionButton
                  icon={<Fist size={48} />}
                  label="Minaccia"
                  shortcut="Ctrl+7"
                  onClick={handleMinaccia}
                  disabled={phaseActionsRemaining <= 0 || !gameTime.schoolYear.isSchoolPeriod}
                  blockedReason={phaseActionsRemaining <= 0 ? 'Nessuna azione per questa fascia oraria' : 'Non è periodo scolastico'}
                  variant="destructive"
                  ariaLabel="Minaccia un professore. Rischio 30% di espulsione! Aumenta molto i voti e la coattaggine. Tasto rapido: Ctrl+7"
                  helpText="Minaccia un professore. Rischio del 30% di essere espulso dal gioco! Se riesce, aumenta molto i voti e la coattaggine. Usare con cautela."
                  announce={announce}
                />
                <hr className="border-border my-2" />
                <ActionButton
                  icon={<Clock size={48} />}
                  label={`Avanza Fascia (${currentPhase ?? 'mattina'})`}
                  onClick={advancePhaseOnly}
                  disabled={phaseActionsRemaining > 0}
                  blockedReason={phaseActionsRemaining > 0 ? 'Consuma prima tutte le azioni della fase' : undefined}
                  variant="outline"
                  ariaLabel="Salta alla prossima fascia oraria della giornata (disponibile solo a 0 azioni rimaste)"
                  helpText="Salta alla prossima fascia oraria della giornata. Disponibile solo quando tutte le azioni della fase attuale sono state usate."
                  announce={announce}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-border text-xs text-destructive">
                <p className="font-bold">⚠️ ATTENZIONE: Metodi rischiosi! L'opzione Minaccia ha 30% di probabilità di ESPULSIONE!</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento dashboard...</div>}>
              <StatsDashboard stats={stats} grades={grades} />
            </Suspense>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                    disabled={phaseActionsRemaining <= 0}
                    blockedReason="Nessuna azione per questa fascia oraria"
                    variant="secondary"
                    ariaLabel="Chiacchiera con qualcuno. Gratis. +5 Carisma, +3 Reputazione"
                    helpText="Chiacchiera con qualcuno. Gratis. Aumenta il Carisma di 5 e la Reputazione di 3."
                    announce={announce}
                  />
                  <ActionButton
                    icon={<Running size={48} />}
                    label="Giro al Parco"
                    onClick={handleParco}
                    disabled={phaseActionsRemaining <= 0}
                    blockedReason="Nessuna azione per questa fascia oraria"
                    variant="secondary"
                    ariaLabel="Giro rilassante al parco. Gratis. +5 Carisma, -5 Stanchezza, +2 Reputazione"
                    helpText="Giro rilassante al parco. Gratis. Aumenta il Carisma di 5, riduce la Stanchezza di 5 e aumenta la Reputazione di 2."
                    announce={announce}
                  />
                  <ActionButton
                    icon={<UserCircle size={48} />}
                    label="Telefona"
                    onClick={handleTelefona}
                    disabled={phaseActionsRemaining <= 0}
                    blockedReason="Nessuna azione per questa fascia oraria"
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
                    disabled={phaseActionsRemaining <= 0}
                    blockedReason="Nessuna azione per questa fascia oraria"
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
                    disabled={phaseActionsRemaining <= 0 || stats.soldi < 50 || stats.stanchezza > 80}
                    blockedReason={phaseActionsRemaining <= 0 ? 'Nessuna azione per questa fascia oraria' : stats.soldi < 50 ? 'Servono almeno 50€' : 'Sei troppo stanco per trafficare col motorino!'}
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
              actionsRemaining={phaseActionsRemaining}
              soldi={stats.soldi}
              muscoli={stats.muscoli}
              stanchezza={stats.stanchezza}
            />
          </TabsContent>

          <TabsContent value="exams" className="space-y-6 mt-6">
            <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento...</div>}>
              <ExamsPanel
                exams={scheduledExams}
                onPrepareExam={handlePrepareExam}
                actionsRemaining={phaseActionsRemaining}
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

          <TabsContent value="friends" className="space-y-6 mt-6">
            <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Caricamento...</div>}>
              <EnhancedFriendsPanel
                friends={friends}
                stats={stats}
                actionsRemaining={phaseActionsRemaining}
                onFriendAction={handleFriendAction}
                girlfriend={girlfriend}
                onGirlfriendAction={handleGirlfriendAction}
                onGirlfriendBreakup={handleGirlfriendBreakup}
              />
              <RelationshipsPanel
                relationships={relationships}
                stats={stats}
                onTryRelationship={handleTryRelationship}
                actionsRemaining={phaseActionsRemaining}
              />
            </Suspense>
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
        </Tabs>
      </div>

      <AlertDialog open={showMetallariEvent} onOpenChange={setShowMetallariEvent}>
        <AlertDialogContent className="border-2 border-destructive" aria-describedby="event-description">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive">
              ⚠️ EVENTO CASUALE ⚠️
            </AlertDialogTitle>
            <AlertDialogDescription id="event-description" className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleMetallariScappa} className="border-2">
              <Running size={24} className="mr-2" />
              Scappa (-10 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMetallariCombatti} className="bg-destructive border-2">
              <Fist size={24} className="mr-2" />
              Combatti (Serve Muscoli &gt; 60)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAtipaEvent} onOpenChange={setShowAtipaEvent}>
        <AlertDialogContent className="border-2 border-accent">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-accent flex items-center gap-2">
              <Heart size={32} weight="fill" className="text-accent" />
              RIMORCHIO TIME!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg space-y-2">
              <p>{currentEvent}</p>
              <p className="text-primary font-bold">
                Probabilità di successo: {atipaSuccessChance}%
              </p>
              <p className="text-sm text-muted-foreground">
                (Basato su Figosità, Coattaggine, Muscoli e Soldi)
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAtipaRinuncia} className="border-2">
              <Running size={24} className="mr-2" />
              Lascia stare (-5 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAtipaProva} className="bg-accent border-2">
              <Heart size={24} weight="fill" className="mr-2" />
              PROVA! (Gratis)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPoliceEvent} onOpenChange={setShowPoliceEvent}>
        <AlertDialogContent className="border-2 border-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-secondary flex items-center gap-2">
              <SirenLight size={32} weight="fill" className="text-secondary animate-pulse" />
              CONTROLLO POLIZIA!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePoliceScappa} className="border-2 border-destructive">
              <Running size={24} className="mr-2" />
              Scappa! (Serve Coattaggine &gt; 70)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePoliceCollabora} className="bg-secondary border-2">
              <HandCoins size={24} className="mr-2" />
              Dai Mazzetta (50€)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showStreetRaceEvent} onOpenChange={setShowStreetRaceEvent}>
        <AlertDialogContent className="border-2 border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-primary flex items-center gap-2">
              <Flag size={32} weight="fill" className="text-primary" />
              GARA DI MOTORINI!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg space-y-2">
              <p>{currentEvent}</p>
              <p className="text-primary font-bold">
                Probabilità di vincita: {raceWinChance}%
              </p>
              <p className="text-sm text-muted-foreground">
                (Basato su Coattaggine, Figosità e Muscoli)
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStreetRaceRifiuta} className="border-2">
              <Running size={24} className="mr-2" />
              Rifiuta (-15 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleStreetRaceAccetta} className="bg-primary border-2">
              <Flag size={24} weight="fill" className="mr-2" />
              ACCETTA LA SFIDA!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulliEvent} onOpenChange={setShowBulliEvent}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <ShieldWarning size={32} weight="fill" className="text-destructive" />
              INCONTRO CON I BULLI!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleBulliCedi} className="border-2">
              <HandCoins size={24} className="mr-2" />
              Cedi (-20 Soldi, -15 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBulliResisti} className="bg-destructive border-2">
              <Fist size={24} className="mr-2" />
              Resisti! (Serve Muscoli &gt; 50)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={gameOver} onOpenChange={() => {}}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl text-destructive text-center">
              GAME OVER!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xl text-center font-bold py-4">
              {gameOverReason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleReset} className="w-full">
              Ricomincia da Capo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Perderai TUTTA la progressione e ricomincerai da capo. Sicuro di voler resettare?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive">
              Sì, Resetta Tutto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Suspense fallback={null}>
        <ReportCardDialog
          open={showReportCard}
          grades={grades}
          media={currentMedia}
          isPassed={reportCardPassed}
          schoolYear={gameTime.schoolYear.currentYear}
          onContinue={handleReportCardContinue}
          isLastYear={gameTime.schoolYear.currentYear === 5 && reportCardPassed}
        />

        <SchoolEventDialog
          open={showSchoolEvent}
          event={schoolEvent}
          onChoice={handleSchoolEventChoice}
          onClose={() => setShowSchoolEvent(false)}
        />

        <KeyboardShortcutsDialog
          open={showKeyboardHelp}
          onOpenChange={setShowKeyboardHelp}
        />

        <SubjectSelectionDialog
          open={showSubjectDialog}
          onClose={() => setShowSubjectDialog(false)}
          grades={grades}
          onSelectSubject={handleStudySubject}
          stanchezza={stats.stanchezza}
        />
      </Suspense>
    </main>
  )
}

export default App
