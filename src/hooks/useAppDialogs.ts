import { useState } from 'react'
import { SchoolEvent } from '@/lib/school-events'
import { SchoolMorningEvent } from '@/lib/school-morning-events'

export type MorningDisplay = 'school' | 'street' | null

export function useAppDialogs() {
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
  const [showTeacherDialog, setShowTeacherDialog] = useState(false)
  const [teacherActionType, setTeacherActionType] = useState<'corrompi' | 'minaccia'>('corrompi')
  const [schoolMorningEvents, setSchoolMorningEvents] = useState<SchoolMorningEvent[]>([])
  const [streetMorningEvents, setStreetMorningEvents] = useState<SchoolMorningEvent[]>([])
  // R6: singolo enum sostituisce showSchoolMorning + showStreetMorning
  const [morningDisplay, setMorningDisplay] = useState<MorningDisplay>(null)

  // Wrapper retrocompatibili per useGameTime e App.tsx
  const setShowSchoolMorning = (v: boolean) => setMorningDisplay(v ? 'school' : null)
  const setShowStreetMorning = (v: boolean) => setMorningDisplay(v ? 'street' : null)
  const showSchoolMorning = morningDisplay === 'school'
  const showStreetMorning = morningDisplay === 'street'

  return {
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
    // R6: enum principale
    morningDisplay,
    setMorningDisplay,
    // wrapper retrocompatibili (consumati da useGameTime e App.tsx legacy)
    showSchoolMorning,
    setShowSchoolMorning,
    showStreetMorning,
    setShowStreetMorning,
  }
}
