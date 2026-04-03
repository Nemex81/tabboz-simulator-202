import React, { useEffect, useRef, useState } from 'react'
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
import { ReportCardDialog } from '@/components/ReportCardDialog'
import { SchoolSelection } from '@/components/SchoolSelection'
import { SchoolEventDialog } from '@/components/SchoolEventDialog'
import { FriendsPanel } from '@/components/FriendsPanel'
import { RelationshipsPanel } from '@/components/RelationshipsPanel'
import { ExamsPanel } from '@/components/ExamsPanel'
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog'
import { SubjectSelectionDialog } from '@/components/SubjectSelectionDialog'
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
import { GameStats, SubjectGrades, GameTime, DEFAULT_GAME_STATE, SchoolType, getDefaultGradesForSchoolType, getSubjectDisplayName, Friend, Relationship, ScheduledExam } from '@/lib/types'
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
  const [rawStats, setRawStats] = useKV<GameStats>('tabboz-stats', DEFAULT_GAME_STATE.stats)
  const [rawGrades, setRawGrades] = useKV<SubjectGrades>('tabboz-grades', DEFAULT_GAME_STATE.grades)
  const [rawGameTime, setRawGameTime] = useKV<GameTime>('tabboz-time', DEFAULT_GAME_STATE.gameTime)
  const [rawFriends, setRawFriends] = useKV<Friend[]>('tabboz-friends', [])
  const [rawRelationships, setRawRelationships] = useKV<Relationship[]>('tabboz-relationships', [])
  const [rawScheduledExams, setRawScheduledExams] = useKV<ScheduledExam[]>('tabboz-exams', [])
  
  const schoolType = validateSchoolType(rawSchoolType)
  const stats = validateStats(rawStats)
  const grades = validateGrades(rawGrades, schoolType)
  const gameTime = validateGameTime(rawGameTime)
  const friends = validateFriends(rawFriends)
  const relationships = validateRelationships(rawRelationships)
  const scheduledExams = validateScheduledExams(rawScheduledExams)
  
  const setSchoolType = setRawSchoolType
  const setStats = setRawStats
  const setGrades = setRawGrades
  const setGameTime = setRawGameTime
  const setFriends = setRawFriends
  const setRelationships = setRawRelationships
  const setScheduledExams = setRawScheduledExams
  
  const [gameOver, setGameOver] = useState(false)
  const [gameOverReason, setGameOverReason] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showReportCard, setShowReportCard] = useState(false)
  const [reportCardPassed, setReportCardPassed] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<string>('')
  const [showMetallariEvent, setShowMetallariEvent] = useState(false)
  const [showAtipaEvent, setShowAtipaEvent] = useState(false)
  const [atipaName, setAtipaName] = useState('')
  const [atipaSuccessChance, setAtipaSuccessChance] = useState(0)
  const [showPoliceEvent, setShowPoliceEvent] = useState(false)
  const [showStreetRaceEvent, setShowStreetRaceEvent] = useState(false)
  const [showBulliEvent, setShowBulliEvent] = useState(false)
  const [raceWinChance, setRaceWinChance] = useState(0)
  const [schoolEvent, setSchoolEvent] = useState<SchoolEvent | null>(null)
  const [showSchoolEvent, setShowSchoolEvent] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showSubjectDialog, setShowSubjectDialog] = useState(false)
  
  const ariaLiveRef = useRef<HTMLDivElement>(null)
  const prevReputationRef = useRef<number>(stats.reputazione)

  const announce = (message: string) => {
    if (ariaLiveRef.current) {
      ariaLiveRef.current.textContent = message
    }
    toast(message)
  }

  const handleSchoolSelection = (selected: SchoolType) => {
    playSound.success()
    setSchoolType(selected)
    setGrades(getDefaultGradesForSchoolType(selected))
    announce(`Hai scelto: ${selected.toUpperCase()}! Buona fortuna!`)
  }

  const consumeAction = () => {
    setGameTime((current) => ({
      ...current,
      actionsRemaining: Math.max(0, current.actionsRemaining - 1)
    }))
  }

  const advanceToNextDay = () => {
    setGameTime((current) => {
      const newGameTime = advanceGameTime(current)
      
      const currentMedia = calculateMedia(grades)
      if (shouldReceivePaghetta(newGameTime.currentDate, current.lastPaghettaDate)) {
        if (currentMedia >= 7) {
          const paghetta = 50
          setStats((s) => ({ ...s, soldi: clampStat(s.soldi + paghetta, 0, 1000) }))
          playSound.moneyEarned()
          announce(`SABATO! I tuoi ti hanno dato la PAGHETTA! +${paghetta}€ (media ≥ 7)`)
          return { ...newGameTime, lastPaghettaDate: newGameTime.currentDate }
        } else {
          const parentEvent = getParentEventByMedia(currentMedia, stats)
          if (parentEvent) {
            setSchoolEvent(parentEvent)
            setShowSchoolEvent(true)
          }
          return { ...newGameTime, lastPaghettaDate: newGameTime.currentDate }
        }
      }
      
      if (shouldShowReportCard(newGameTime.currentDate, newGameTime.schoolYear.reportCardDate)) {
        const media = calculateMedia(grades)
        const passed = media >= 6
        setReportCardPassed(passed)
        setShowReportCard(true)
        
        if (passed && newGameTime.schoolYear.currentYear === 5) {
          setGameWon(true)
        }
      }
      
      if (Math.random() < 0.15 && newGameTime.schoolYear.isSchoolPeriod && schoolType) {
        const teacherEvent = getTeacherEvent(schoolType)
        setSchoolEvent(teacherEvent)
        setShowSchoolEvent(true)
      }
      
      setScheduledExams((currentExams) => {
        const updatedExams = currentExams.map(exam => {
          const newDaysUntil = exam.daysUntil - 1
          
          if (newDaysUntil === 3 && !exam.announced) {
            const announcementText = getDifficultyAnnouncement(getSubjectDisplayName(exam.subject), exam.difficulty)
            playSound.eventTrigger()
            announce(announcementText)
            return { ...exam, daysUntil: newDaysUntil, announced: true }
          }
          
          if (newDaysUntil <= 0) {
            const examGrade = calculateExamGrade(
              grades[exam.subject] || 6,
              stats.intelligenza,
              exam.isPrepared,
              currentMedia,
              exam.difficulty
            )
            setGrades((g) => ({
              ...g,
              [exam.subject]: examGrade
            }))
            const diffText = getDifficultyText(exam.difficulty)
            const resultText = exam.isPrepared 
              ? `VERIFICA ${diffText} di ${getSubjectDisplayName(exam.subject)}! Eri PREPARATO! Voto: ${examGrade.toFixed(1)}`
              : `VERIFICA ${diffText} di ${getSubjectDisplayName(exam.subject)}! Non eri preparato... Voto: ${examGrade.toFixed(1)}`
            announce(resultText)
            return null
          }
          return { ...exam, daysUntil: newDaysUntil }
        }).filter((e): e is ScheduledExam => e !== null)
        
        if (newGameTime.schoolYear.isSchoolPeriod && updatedExams.length < 3 && Math.random() < 0.3 && schoolType) {
          const subjects = Object.keys(grades)
          const newExam = generateScheduledExam(subjects)
          announce(`NUOVA VERIFICA programmata di ${getSubjectDisplayName(newExam.subject)} tra ${newExam.daysUntil} giorni! Difficoltà: ${getDifficultyText(newExam.difficulty)}`)
          return [...updatedExams, newExam]
        }
        
        return updatedExams
      })
      
      return newGameTime
    })
    playSound.success()
    announce('Nuovo giorno! Azioni ripristinate.')
  }

  useEffect(() => {
    const newReputation = calculateReputationFromStats(stats)
    const oldLevel = getReputationLevel(prevReputationRef.current)
    const newLevel = getReputationLevel(newReputation)
    
    if (Math.abs(newReputation - stats.reputazione) > 2) {
      setStats((current) => ({ ...current, reputazione: newReputation }))
      
      if (oldLevel !== newLevel) {
        playSound.reputationUp()
        announce(`CAMBIO DI REPUTAZIONE! Ora sei: ${newLevel}`)
      }
    }
    
    prevReputationRef.current = newReputation
  }, [stats.coattaggine, stats.muscoli, stats.figosita, stats.soldi, stats.media, stats.carisma, setStats])

  useEffect(() => {
    const checkStatus = checkGameOver({ ...stats, media: calculateMedia(grades) })
    if (checkStatus.isOver) {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason(checkStatus.reason)
      announce(checkStatus.reason)
    }
  }, [stats, grades])

  const triggerRandomEvent = () => {
    const reputationModifier = getReputationEventModifier(stats.reputazione)
    const baseRoll = Math.random() * 100
    const adjustedRoll = baseRoll * reputationModifier.encounterChanceMultiplier
    
    if (adjustedRoll < 12) {
      if (canAvoidNegativeEventWithCharisma(stats.carisma)) {
        playSound.success()
        announce('I METALLARI ti riconoscono! Con la tua PARLANTINA li hai convinti a lasciarti stare!')
        return
      }
      const respectBonus = reputationModifier.respectBonus
      if (respectBonus >= 15) {
        playSound.success()
        announce('I METALLARI ti riconoscono e ti salutano con rispetto! La tua REPUTAZIONE ti precede!')
        return
      }
      playSound.dangerAlert()
      setShowMetallariEvent(true)
      setCurrentEvent('Incontro con i METALLARI! Vogliono la tua grana!')
      announce('Evento casuale: Incontro con i METALLARI! Vogliono la tua grana!')
    } else if (adjustedRoll < 22) {
      if (canAvoidNegativeEventWithCharisma(stats.carisma)) {
        playSound.success()
        setStats((current) => ({ ...current, carisma: clampStat(current.carisma + 5) }))
        announce('I POLIZIOTTI ti hanno fermato ma con la tua PARLANTINA li hai convinti! +5 Carisma!')
        return
      }
      if (reputationModifier.respectBonus >= 15) {
        playSound.success()
        announce('I POLIZIOTTI ti hanno fermato ma ti lasciano andare! Sei troppo RISPETTATO nel quartiere!')
        return
      }
      playSound.dangerAlert()
      setShowPoliceEvent(true)
      setCurrentEvent('I POLIZIOTTI ti hanno fermato! Controllo documenti!')
      announce('Evento casuale: Controllo della POLIZIA!')
    } else if (adjustedRoll < 30) {
      const winChance = Math.min(85, Math.max(15, 
        (stats.coattaggine * 0.5) + 
        (stats.figosita * 0.3) + 
        (stats.muscoli * 0.2) +
        reputationModifier.positiveOutcomeBonus
      ))
      setRaceWinChance(Math.round(winChance))
      playSound.eventTrigger()
      setShowStreetRaceEvent(true)
      setCurrentEvent('Un TAMARRO ti sfida ad una GARA con il motorino!')
      announce(`Evento casuale: GARA di motorini! Possibilità di vincita: ${Math.round(winChance)}%`)
    } else if (adjustedRoll < 36) {
      if (reputationModifier.respectBonus >= 10) {
        playSound.success()
        announce('I BULLI della scuola ti vedono e si allontanano! Hanno PAURA della tua REPUTAZIONE!')
        return
      }
      playSound.dangerAlert()
      setShowBulliEvent(true)
      setCurrentEvent('I BULLI della scuola ti vogliono rubare la merenda!')
      announce('Evento casuale: Incontro con i BULLI!')
    }
  }

  const checkForNewFriend = (location: string) => {
    if (checkNewFriendEvent(stats.carisma, location)) {
      const newFriend = generateRandomFriend()
      setFriends((current) => [...current, newFriend])
      playSound.success()
      announce(`Hai conosciuto ${newFriend.name} ${location}! Nuovo amico aggiunto alla RUBRICA! (${newFriend.specialty})`)
    }
  }

  const checkForNewRelationship = () => {
    if (relationships.length < 6 && randomChance(20)) {
      const newRelationship = generateRandomRelationship()
      setRelationships((current) => [...current, newRelationship])
      playSound.eventTrigger()
      announce(`Hai notato ${newRelationship.name}! Aggiunta alle ragazze disponibili!`)
    }
  }

  const handleTryRelationship = (relationshipId: string) => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta!')
      return
    }
    if (stats.soldi < 80) {
      playSound.failure()
      announce('Servono 80€ per uscire!')
      return
    }

    const relationship = relationships.find(r => r.id === relationshipId)
    if (!relationship) return

    const successChance = calculateRelationshipSuccess(stats, relationship)
    
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
        soldi: clampStat(current.soldi - 80, 0, 1000)
      }))
      consumeAction()
      announce(`${relationship.name} ha detto SÌ! Siete INSIEME! +30 Figosità, +15 Carisma, -80 Soldi`)
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
    }
  }

  const handlePrepareExam = (examSubject: string) => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta!')
      return
    }
    if (stats.stanchezza > 80) {
      playSound.failure()
      announce('Troppo stanco per studiare!')
      return
    }

    const examIndex = scheduledExams.findIndex(e => e.subject === examSubject)
    if (examIndex === -1) return

    const exam = scheduledExams[examIndex]
    const result = prepareForExam(exam, stats.intelligenza)

    setScheduledExams((current) =>
      current.map((e, i) =>
        i === examIndex ? { ...e, isPrepared: true } : e
      )
    )

    setStats((current) => ({
      ...current,
      intelligenza: clampStat(current.intelligenza + result.intelligenceGain),
      stanchezza: clampStat(current.stanchezza + 25)
    }))

    consumeAction()
    playSound.success()
    announce(result.message)
  }

  const handleMetallariScappa = () => {
    playSound.failure()
    setShowMetallariEvent(false)
    setStats((current) => ({ ...current, coattaggine: clampStat(current.coattaggine - 10) }))
    announce('Sei scappato come un CONIGLIO! -10 Coattaggine')
  }

  const handleMetallariCombatti = () => {
    setShowMetallariEvent(false)
    if (stats.muscoli > 60) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 15),
        soldi: clampStat(current.soldi + 30, 0, 1000)
      }))
      announce('Li hai STESI! +15 Coattaggine, +30 Soldi rubati')
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 50, 0, 1000),
        muscoli: clampStat(current.muscoli - 5)
      }))
      announce('Ti hanno FATTO IL CULO! -50 Soldi, -5 Muscoli')
    }
  }

  const handlePoliceScappa = () => {
    setShowPoliceEvent(false)
    if (stats.coattaggine > 70) {
      playSound.success()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 10)
      }))
      announce('Sei SCAPPATO dai poliziotti! Che COATTO! +10 Coattaggine')
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 100, 0, 1000),
        coattaggine: clampStat(current.coattaggine - 15)
      }))
      announce('Ti hanno BECCATO! Multa di 100€! -100 Soldi, -15 Coattaggine')
    }
  }

  const handlePoliceCollabora = () => {
    setShowPoliceEvent(false)
    if (stats.soldi >= 50) {
      playSound.moneySpent()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 50, 0, 1000)
      }))
      announce('Hai dato una MAZZETTA! Ti lasciano andare. -50 Soldi')
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: 0,
        coattaggine: clampStat(current.coattaggine - 20)
      }))
      announce('Non hai GRANA per la mazzetta! Ti hanno portato in questura! -Tutti i Soldi, -20 Coattaggine')
    }
  }

  const handleStreetRaceAccetta = () => {
    setShowStreetRaceEvent(false)
    
    if (randomChance(raceWinChance)) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 25),
        figosita: clampStat(current.figosita + 20),
        soldi: clampStat(current.soldi + 150, 0, 1000)
      }))
      announce('Hai VINTO la gara! Sei una LEGGENDA! +25 Coattaggine, +20 Figosità, +150 Soldi')
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 20),
        coattaggine: clampStat(current.coattaggine - 15),
        soldi: clampStat(current.soldi - 80, 0, 1000)
      }))
      announce('Hai PERSO la gara! Che SCHIFO! -20 Figosità, -15 Coattaggine, -80 Soldi (scommessa)')
    }
  }

  const handleStreetRaceRifiuta = () => {
    playSound.failure()
    setShowStreetRaceEvent(false)
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine - 15),
      figosita: clampStat(current.figosita - 10)
    }))
    announce('Hai RIFIUTATO la sfida! Sei un FIFONE! -15 Coattaggine, -10 Figosità')
  }

  const handleBulliResisti = () => {
    setShowBulliEvent(false)
    if (stats.muscoli > 50) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 20),
        muscoli: clampStat(current.muscoli + 5)
      }))
      announce('Li hai MENATI! Ora ti RISPETTANO! +20 Coattaggine, +5 Muscoli')
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 30, 0, 1000),
        coattaggine: clampStat(current.coattaggine - 10),
        muscoli: clampStat(current.muscoli - 5)
      }))
      announce('Ti hanno PESTATO! -30 Soldi, -10 Coattaggine, -5 Muscoli')
    }
  }

  const handleBulliCedi = () => {
    playSound.failure()
    setShowBulliEvent(false)
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - 20, 0, 1000),
      coattaggine: clampStat(current.coattaggine - 15)
    }))
    announce('Hai CEDUTO alla loro prepotenza! Sei un PERDENTE! -20 Soldi, -15 Coattaggine')
  }

  const handlePalestra = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (stats.soldi < 20) {
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
      stanchezza: clampStat(current.stanchezza + 15)
    }))
    consumeAction()
    announce('Hai pompato FERRO! +10 Muscoli, +5 Figosità, -20 Soldi, +15 Stanchezza')
    checkForNewFriend('in palestra')
    checkForNewRelationship()
    triggerRandomEvent()
  }

  const handleLampada = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (stats.soldi < 30) {
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
    triggerRandomEvent()
  }

  const handleLavoro = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (stats.muscoli < 40) {
      playSound.failure()
      announce('Sei troppo SMILZO per fare il buttadifuori! Servono 40 Muscoli')
      return
    }
    if (stats.stanchezza > 80) {
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
    triggerRandomEvent()
  }

  const handleMotorino = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (stats.soldi < 50) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per truccare il motorino! Servono 50€')
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
    triggerRandomEvent()
  }

  const handleStudia = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (!gameTime.schoolYear.isSchoolPeriod) {
      playSound.failure()
      announce('Non puoi studiare durante le VACANZE ESTIVE! Goditi l\'estate!')
      return
    }
    if (stats.stanchezza > 80) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per studiare! Riposa!')
      return
    }
    playSound.buttonClick()
    setShowSubjectDialog(true)
  }

  const handleStudySubject = (selectedSubject: string) => {
    setShowSubjectDialog(false)
    
    const hasFriendBonus = getFriendStudyBonus(friends) > 0
    const gradeIncrease = calculateStudyGradeIncrease(stats.intelligenza, hasFriendBonus)
    const intelligenzaGain = Math.floor(Math.random() * 3) + 1
    
    setGrades((current) => ({
      ...current,
      [selectedSubject]: clampStat(current[selectedSubject] + gradeIncrease, 0, 10)
    }))
    setStats((current) => ({
      ...current,
      stanchezza: clampStat(current.stanchezza + 20),
      coattaggine: clampStat(current.coattaggine - 5),
      intelligenza: clampStat(current.intelligenza + intelligenzaGain)
    }))
    consumeAction()
    playSound.statIncrease()
    
    const bonusText = hasFriendBonus ? ' (BONUS AMICO INTELLIGENTE!)' : ''
    announce(`Hai studiato ${getSubjectDisplayName(selectedSubject)}! +${gradeIncrease.toFixed(1)} al voto, +${intelligenzaGain} Intelligenza${bonusText}, +20 Stanchezza, -5 Coattaggine`)
    
    if (shouldTriggerSurpriseQuiz() && gameTime.schoolYear.isSchoolPeriod) {
      const subjects = Object.keys(grades) as Array<keyof SubjectGrades>
      const surpriseSubject = subjects[Math.floor(Math.random() * subjects.length)]
      const quizResult = calculateSurpriseQuizGrade(grades[surpriseSubject], stats)
      setGrades((current) => ({
        ...current,
        [surpriseSubject]: quizResult.newGrade
      }))
      playSound.eventTrigger()
      announce(`${quizResult.message} in ${getSubjectDisplayName(surpriseSubject)}!`)
    }
  }

  const handleCorrompi = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (!gameTime.schoolYear.isSchoolPeriod) {
      playSound.failure()
      announce('La scuola è CHIUSA! Aspetta settembre!')
      return
    }
    if (stats.soldi < 100) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per la MAZZETTA! Servono 100€')
      return
    }
    playSound.buttonClick()
    playSound.moneySpent()
    const subjects = Object.keys(grades) as Array<keyof SubjectGrades>
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    
    setGrades((current) => ({
      ...current,
      [randomSubject]: clampStat(current[randomSubject] + 2, 0, 10)
    }))
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - 100, 0, 1000)
    }))
    consumeAction()
    playSound.success()
    announce(`MAZZETTA al prof di ${randomSubject.toUpperCase()}! +2 al voto, -100 Soldi. EZPZ!`)
  }

  const handleMinaccia = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (!gameTime.schoolYear.isSchoolPeriod) {
      playSound.failure()
      announce('La scuola è CHIUSA! Aspetta settembre!')
      return
    }
    playSound.buttonClick()
    if (randomChance(30)) {
      playSound.gameOver()
      setGameOver(true)
      setGameOverReason('Hai PESTATO il prof ma ti hanno ESPULSO! Torna a settembre, violento!')
      announce('ESPULSO dalla scuola per violenza!')
      return
    }
    
    playSound.bigWin()
    const subjects = Object.keys(grades) as Array<keyof SubjectGrades>
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    
    setGrades((current) => ({
      ...current,
      [randomSubject]: clampStat(current[randomSubject] + 3, 0, 10)
    }))
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 15)
    }))
    consumeAction()
    announce(`Hai MINACCIATO il prof di ${randomSubject.toUpperCase()}! +3 al voto, +15 Coattaggine. Rischiosa ma ha funzionato!`)
  }

  const handleRiposa = () => {
    playSound.buttonClick()
    setStats((current) => ({
      ...current,
      stanchezza: clampStat(current.stanchezza - 40)
    }))
    
    if (gameTime.actionsRemaining === 0) {
      advanceToNextDay()
    } else {
      announce('Hai riposato un po\'! -40 Stanchezza')
    }
  }

  const handleDisco = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (stats.soldi < 60) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per entrare in discoteca! Servono 60€')
      return
    }
    if (stats.stanchezza > 70) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per andare in disco! Riposa!')
      return
    }
    
    playSound.buttonClick()
    const reputationModifier = getReputationEventModifier(stats.reputazione)
    
    const successChance = Math.min(85, Math.max(20, 
      (stats.figosita * 0.4) + 
      (stats.coattaggine * 0.3) + 
      (stats.muscoli * 0.2) +
      (stats.carisma * 0.25) +
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
        stanchezza: clampStat(current.stanchezza + 25)
      }))
      announce('Serata EPICA in disco! Hai fatto STRAGE! +25 Figosità, +15 Coattaggine, +10 Carisma, -60 Soldi, +25 Stanchezza')
    } else {
      playSound.failure()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 10),
        soldi: clampStat(current.soldi - 60, 0, 1000),
        stanchezza: clampStat(current.stanchezza + 20)
      }))
      announce('Serata SCARSA in disco! Nessuno ti ha filato! -10 Figosità, -60 Soldi, +20 Stanchezza')
    }
    consumeAction()
    checkForNewFriend('in discoteca')
    checkForNewRelationship()
    triggerRandomEvent()
  }

  const handleCinema = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (stats.soldi < 40) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per il cinema! Servono 40€')
      return
    }
    
    playSound.buttonClick()
    const roll = Math.random()
    if (roll < 0.4) {
      playSound.success()
      const names = ['Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer']
      const randomName = names[Math.floor(Math.random() * names.length)]
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 15),
        carisma: clampStat(current.carisma + 10),
        soldi: clampStat(current.soldi - 80, 0, 1000),
        stanchezza: clampStat(current.stanchezza - 10)
      }))
      announce(`Hai incontrato ${randomName} al cinema! Avete visto il film INSIEME! +15 Figosità, +10 Carisma, -80 Soldi (biglietti + popcorn), -10 Stanchezza`)
    } else {
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 40, 0, 1000),
        stanchezza: clampStat(current.stanchezza - 15)
      }))
      announce('Hai visto un bel film! Serata tranquilla. -40 Soldi, -15 Stanchezza')
    }
    consumeAction()
    checkForNewFriend('al cinema')
    checkForNewRelationship()
    triggerRandomEvent()
  }

  const handleShoppingMall = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    if (stats.soldi < 100) {
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
    triggerRandomEvent()
  }

  const handleProvarciConAtipa = () => {
    if (gameTime.actionsRemaining === 0) {
      playSound.failure()
      announce('Nessuna azione rimasta! Vai a riposare per passare al giorno successivo!')
      return
    }
    playSound.buttonClick()
    playSound.eventTrigger()
    const names = ['Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer']
    const randomName = names[Math.floor(Math.random() * names.length)]
    setAtipaName(randomName)
    
    const reputationModifier = getReputationEventModifier(stats.reputazione)
    
    const successChance = Math.min(90, Math.max(10, 
      (stats.figosita * 0.4) + 
      (stats.coattaggine * 0.3) + 
      (stats.muscoli * 0.2) + 
      (stats.soldi / 10) +
      reputationModifier.positiveOutcomeBonus
    ))
    
    setAtipaSuccessChance(Math.round(successChance))
    setCurrentEvent(`Hai adocchiato ${randomName} al centro commerciale! Ti vuoi provare?`)
    setShowAtipaEvent(true)
    announce(`Evento: Hai incontrato ${randomName}! Possibilità di successo: ${Math.round(successChance)}% (bonus reputazione: +${reputationModifier.positiveOutcomeBonus})`)
  }

  const handleAtipaRinuncia = () => {
    playSound.failure()
    setShowAtipaEvent(false)
    setStats((current) => ({ ...current, coattaggine: clampStat(current.coattaggine - 5) }))
    consumeAction()
    announce(`Hai CAGATO sotto! -5 Coattaggine`)
  }

  const handleAtipaProva = () => {
    setShowAtipaEvent(false)
    
    if (randomChance(atipaSuccessChance)) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 20),
        coattaggine: clampStat(current.coattaggine + 10),
        soldi: clampStat(current.soldi - 80, 0, 1000)
      }))
      announce(`${atipaName} ha detto SÌ! Uscita EPICA! +20 Figosità, +10 Coattaggine, -80 Soldi (cinema + pizza)`)
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 15),
        coattaggine: clampStat(current.coattaggine - 10)
      }))
      announce(`${atipaName} ti ha dato il PALO! Bruciata DEVASTANTE! -15 Figosità, -10 Coattaggine`)
    }
    consumeAction()
  }

  const handleReset = () => {
    playSound.reset()
    setStats(DEFAULT_GAME_STATE.stats)
    setGrades(schoolType ? getDefaultGradesForSchoolType(schoolType) : DEFAULT_GAME_STATE.grades)
    setGameTime(DEFAULT_GAME_STATE.gameTime)
    setFriends([])
    setRelationships([])
    setScheduledExams([])
    setGameOver(false)
    setGameOverReason('')
    setShowResetDialog(false)
    setGameWon(false)
    setSchoolType(null)
    announce('Gioco RESETTATO! Scegli di nuovo l\'indirizzo!')
  }

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

        <section aria-labelledby="quick-stats">
          <h2 id="quick-stats" className="sr-only">Panoramica Statistiche</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatDisplay 
              icon={<Lightning size={28} weight="fill" />}
              label="Coattaggine"
              value={stats.coattaggine}
            />
            <StatDisplay 
              icon={<Barbell size={28} weight="fill" />}
              label="Muscoli"
              value={stats.muscoli}
            />
            <StatDisplay 
              icon={<Sparkle size={28} weight="fill" />}
              label="Figosità"
              value={stats.figosita}
            />
            <StatDisplay 
              icon={<Brain size={28} weight="fill" />}
              label="Intelligenza"
              value={stats.intelligenza}
            />
            <StatDisplay 
              icon={<Chats size={28} weight="fill" />}
              label="Carisma"
              value={stats.carisma}
            />
            <StatDisplay 
              icon={<CurrencyDollar size={28} weight="fill" />}
              label="Soldi"
              value={stats.soldi}
              max={1000}
            />
            <StatDisplay 
              icon={<GraduationCap size={28} weight="fill" />}
              label="Media"
              value={currentMedia}
              max={10}
            />
            <StatDisplay 
              icon={<Battery size={28} weight="fill" />}
              label="Stanchezza"
              value={stats.stanchezza}
            />
          </div>
        </section>

        <TimeDisplay gameTime={gameTime} />

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 bg-muted/50 p-1 h-auto">
            <TabsTrigger value="status" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Profilo</span>
              <span className="sm:hidden">Status</span>
            </TabsTrigger>
            <TabsTrigger value="school" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <GraduationCap size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Scuola</span>
              <span className="sm:hidden">Scuola</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Verifiche</span>
              <span className="sm:hidden">Test</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <UserCircle size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Amici</span>
              <span className="sm:hidden">Amici</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Buildings size={20} className="mr-2" weight="fill" />
              <span className="hidden sm:inline">Sociale</span>
              <span className="sm:hidden">Vita</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6 mt-6">
            <Card className="p-6 border-2 border-primary bg-card/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Crown size={48} weight="fill" className="text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground uppercase font-semibold">
                      REPUTAZIONE
                    </div>
                    <div className="text-3xl font-bold text-primary neon-text-glow">
                      {getReputationLevel(stats.reputazione)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-primary">
                    {Math.round(stats.reputazione)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    / 100
                  </div>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 neon-glow"
                  style={{ width: `${stats.reputazione}%` }}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                <p>La tua reputazione nel quartiere influenza gli eventi casuali e come ti vedono gli altri.</p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-accent bg-gradient-to-br from-accent/10 to-primary/10">
              <div className="flex items-start gap-4">
                <Trophy size={48} weight="fill" className="text-accent flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-accent mb-2">🎯 OBIETTIVO DEL GIOCO</h3>
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
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-primary bg-card">
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                  <User size={24} weight="fill" />
                  CARATTERISTICHE FISICHE
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground uppercase font-semibold flex items-center gap-2">
                        <Lightning size={20} weight="fill" className="text-primary" />
                        Coattaggine
                      </span>
                      <span className="text-2xl font-bold text-primary">{stats.coattaggine}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${stats.coattaggine}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground uppercase font-semibold flex items-center gap-2">
                        <Barbell size={20} weight="fill" className="text-secondary" />
                        Muscoli
                      </span>
                      <span className="text-2xl font-bold text-secondary">{stats.muscoli}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${stats.muscoli}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground uppercase font-semibold flex items-center gap-2">
                        <Sparkle size={20} weight="fill" className="text-accent" />
                        Figosità
                      </span>
                      <span className="text-2xl font-bold text-accent">{stats.figosita}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-300" style={{ width: `${stats.figosita}%` }} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-accent bg-card">
                <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
                  <Brain size={24} weight="fill" />
                  CARATTERISTICHE MENTALI
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground uppercase font-semibold flex items-center gap-2">
                        <Brain size={20} weight="fill" className="text-primary" />
                        Intelligenza
                      </span>
                      <span className="text-2xl font-bold text-primary">{stats.intelligenza}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${stats.intelligenza}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Boost studio: +{calculateStudyGradeIncrease(stats.intelligenza).toFixed(1)} per azione
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground uppercase font-semibold flex items-center gap-2">
                        <Chats size={20} weight="fill" className="text-accent" />
                        Carisma
                      </span>
                      <span className="text-2xl font-bold text-accent">{stats.carisma}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-300" style={{ width: `${stats.carisma}%` }} />
                    </div>
                    {stats.carisma > 70 && (
                      <div className="text-xs text-accent mt-1 font-bold">
                        ✨ PARLANTINA ATTIVA! 20% di evitare guai!
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded">
                    <p><strong>Intelligenza:</strong> Moltiplica i voti quando studi</p>
                    <p className="mt-1"><strong>Carisma:</strong> Migliora le interazioni sociali</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-secondary bg-card">
                <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
                  <CurrencyDollar size={24} weight="fill" />
                  RISORSE
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground uppercase font-semibold flex items-center gap-2">
                        <CurrencyDollar size={20} weight="fill" className="text-accent" />
                        Soldi
                      </span>
                      <span className="text-2xl font-bold text-accent">{stats.soldi}€</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all duration-300" style={{ width: `${(stats.soldi / 1000) * 100}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Max: 1000€</div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground uppercase font-semibold flex items-center gap-2">
                        <Battery size={20} weight="fill" className={stats.stanchezza > 80 ? 'text-destructive' : 'text-muted-foreground'} />
                        Stanchezza
                      </span>
                      <span className={`text-2xl font-bold ${stats.stanchezza > 80 ? 'text-destructive' : 'text-foreground'}`}>{stats.stanchezza}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${stats.stanchezza > 80 ? 'bg-destructive' : 'bg-muted-foreground'}`} style={{ width: `${stats.stanchezza}%` }} />
                    </div>
                    {stats.stanchezza > 80 && (
                      <div className="text-xs text-destructive mt-1 font-bold">Troppo stanco! Devi riposare!</div>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground uppercase font-semibold flex items-center gap-2">
                        <GraduationCap size={20} weight="fill" className={currentMedia < 6 ? 'text-destructive' : 'text-secondary'} />
                        Media Scolastica
                      </span>
                      <span className={`text-2xl font-bold ${currentMedia < 6 ? 'text-destructive' : 'text-secondary'}`}>{currentMedia.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${currentMedia < 6 ? 'bg-destructive' : 'bg-secondary'}`} style={{ width: `${(currentMedia / 10) * 100}%` }} />
                    </div>
                    {currentMedia < 4 && (
                      <div className="text-xs text-destructive mt-1 font-bold animate-pulse">BOCCIATO!</div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Reset Gioco (Ctrl+R)
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="school" className="space-y-6 mt-6">
            <Card className="p-6 border-2 border-secondary bg-card">
              <h3 className="text-2xl font-bold mb-6 text-secondary flex items-center gap-2">
                <GraduationCap size={32} weight="fill" />
                VOTI SCOLASTICI
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(grades).map(([subject, grade]) => (
                  <div key={subject} className="text-center p-4 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                      {getSubjectDisplayName(subject)}
                    </div>
                    <div className={`text-3xl font-bold ${grade < 6 ? 'text-destructive' : 'text-secondary'}`}>
                      {grade.toFixed(1)}
                    </div>
                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${grade < 6 ? 'bg-destructive' : 'bg-secondary'}`}
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

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-primary bg-card">
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                  <Brain size={24} weight="fill" />
                  STUDIO & RIPOSO
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    icon={<Brain size={48} />}
                    label="Studia"
                    shortcut="Ctrl+5"
                    onClick={handleStudia}
                    disabled={gameTime.actionsRemaining === 0 || stats.stanchezza > 80 || !gameTime.schoolYear.isSchoolPeriod}
                    variant="secondary"
                    ariaLabel="Studia per aumentare i voti. Costa stanchezza, riduce coattaggine. Tasto rapido: Ctrl+5"
                  />
                  <ActionButton
                    icon={<Battery size={48} />}
                    label="Riposa"
                    shortcut="Ctrl+8"
                    onClick={handleRiposa}
                    variant="secondary"
                    ariaLabel="Riposa per ridurre la stanchezza. Tasto rapido: Ctrl+8"
                  />
                </div>
              </Card>

              <Card className="p-6 border-2 border-destructive bg-card">
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
                    disabled={gameTime.actionsRemaining === 0 || stats.soldi < 100 || !gameTime.schoolYear.isSchoolPeriod}
                    variant="default"
                    ariaLabel="Corrompi un professore con una mazzetta da 100 euro. Aumenta i voti. Tasto rapido: Ctrl+6"
                  />
                  <ActionButton
                    icon={<Fist size={48} />}
                    label="Minaccia"
                    shortcut="Ctrl+7"
                    onClick={handleMinaccia}
                    disabled={gameTime.actionsRemaining === 0 || !gameTime.schoolYear.isSchoolPeriod}
                    variant="destructive"
                    ariaLabel="Minaccia un professore. Rischio 30% di espulsione! Aumenta molto i voti e la coattaggine. Tasto rapido: Ctrl+7"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-border text-xs text-destructive">
                  <p className="font-bold">⚠️ ATTENZIONE: Metodi rischiosi! L'opzione Minaccia ha 30% di probabilità di ESPULSIONE!</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-primary bg-card">
                <h3 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                  <Barbell size={24} weight="fill" />
                  MIGLIORAMENTO FISICO
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    icon={<Barbell size={48} />}
                    label="Palestra"
                    shortcut="Ctrl+1"
                    onClick={handlePalestra}
                    disabled={gameTime.actionsRemaining === 0 || stats.soldi < 20}
                    ariaLabel="Vai in palestra per pompare muscoli. Costa 20 euro e aumenta la stanchezza. Tasto rapido: Ctrl+1"
                  />
                  <ActionButton
                    icon={<Sun size={48} />}
                    label="Lampada"
                    shortcut="Ctrl+2"
                    onClick={handleLampada}
                    disabled={gameTime.actionsRemaining === 0 || stats.soldi < 30}
                    ariaLabel="Vai alla lampada abbronzante per aumentare la coattaggine. Costa 30 euro. Tasto rapido: Ctrl+2"
                  />
                  <ActionButton
                    icon={<Motorcycle size={48} />}
                    label="Motorino"
                    shortcut="Ctrl+4"
                    onClick={handleMotorino}
                    disabled={gameTime.actionsRemaining === 0 || stats.soldi < 50}
                    ariaLabel="Trucca il motorino per aumentare molto la coattaggine. Costa 50 euro. Tasto rapido: Ctrl+4"
                  />
                </div>
              </Card>

              <Card className="p-6 border-2 border-accent bg-card">
                <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
                  <Heart size={24} weight="fill" />
                  SVAGO & RIMORCHIO
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    icon={<Heart size={48} />}
                    label="Atipa"
                    shortcut="Ctrl+9"
                    onClick={handleProvarciConAtipa}
                    disabled={gameTime.actionsRemaining === 0 || stats.soldi < 80}
                    variant="default"
                    ariaLabel="Prova a rimorchiare un'atipa. Richiede 80 euro per l'uscita. Dipende da Figosità, Coattaggine e Muscoli. Tasto rapido: Ctrl+9"
                  />
                  <ActionButton
                    icon={<MusicNotes size={48} />}
                    label="Discoteca"
                    shortcut="Ctrl+D"
                    onClick={handleDisco}
                    disabled={gameTime.actionsRemaining === 0 || stats.soldi < 60 || stats.stanchezza > 70}
                    variant="default"
                    ariaLabel="Vai in discoteca per ballare e fare colpo. Costa 60 euro. Tasto rapido: Ctrl+D"
                  />
                  <ActionButton
                    icon={<FilmSlate size={48} />}
                    label="Cinema"
                    shortcut="Ctrl+C"
                    onClick={handleCinema}
                    disabled={gameTime.actionsRemaining === 0 || stats.soldi < 40}
                    variant="secondary"
                    ariaLabel="Vai al cinema per rilassarti e magari incontrare qualcuno. Costa 40 euro. Tasto rapido: Ctrl+C"
                  />
                </div>
              </Card>

              <Card className="p-6 border-2 border-secondary bg-card">
                <h3 className="text-xl font-bold mb-4 text-secondary flex items-center gap-2">
                  <Briefcase size={24} weight="fill" />
                  LAVORO & DENARO
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    icon={<Briefcase size={48} />}
                    label="Lavoro"
                    shortcut="Ctrl+3"
                    onClick={handleLavoro}
                    disabled={gameTime.actionsRemaining === 0 || stats.muscoli < 40 || stats.stanchezza > 80}
                    ariaLabel="Lavora come buttadifuori. Richiede 40 muscoli. Guadagni soldi e coattaggine. Tasto rapido: Ctrl+3"
                  />
                  <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                    <p className="font-semibold mb-1">Requisiti:</p>
                    <p>• Muscoli ≥ 40</p>
                    <p>• Stanchezza {'<'} 80</p>
                    <p className="mt-2 text-secondary font-semibold">Ricompensa: +80€, +5 Coattaggine</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-accent bg-card">
                <h3 className="text-xl font-bold mb-4 text-accent flex items-center gap-2">
                  <ShoppingCart size={24} weight="fill" />
                  SHOPPING
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    icon={<ShoppingCart size={48} />}
                    label="Shopping"
                    shortcut="Ctrl+S"
                    onClick={handleShoppingMall}
                    disabled={gameTime.actionsRemaining === 0 || stats.soldi < 100}
                    variant="default"
                    ariaLabel="Fai shopping per comprare vestiti nuovi. Costa 100 euro. Tasto rapido: Ctrl+S"
                  />
                  <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
                    <p className="font-semibold mb-1">Vestiti nuovi:</p>
                    <p>• +20 Figosità</p>
                    <p>• +10 Coattaggine</p>
                    <p className="mt-2 text-destructive font-semibold">Costo: 100€</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6 mt-6">
            <ExamsPanel
              exams={scheduledExams}
              onPrepareExam={handlePrepareExam}
              actionsRemaining={gameTime.actionsRemaining}
              stanchezza={stats.stanchezza}
            />
            <Card className="p-6 border-2 border-accent bg-card/50">
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
            <FriendsPanel friends={friends} />
            <RelationshipsPanel
              relationships={relationships}
              stats={stats}
              onTryRelationship={handleTryRelationship}
              actionsRemaining={gameTime.actionsRemaining}
            />
            <Card className="p-6 border-2 border-accent bg-card/50">
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
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive">
              ⚠️ EVENTO CASUALE ⚠️
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
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
              PROVA! (Costa 80€)
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
    </main>
  )
}

export default App
