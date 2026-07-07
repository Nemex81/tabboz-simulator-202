import { useState } from 'react'
import { SchoolEvent } from '@/lib/school-events'
import { SchoolMorningEvent } from '@/lib/school-morning-events'
import type { JobDefinition } from '@/lib/job-system'

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

  // TASK-B: stato dialog selezione lavoro
  const [showJobSelectionDialog, setShowJobSelectionDialog] = useState(false)
  const [availableJobsForDialog, setAvailableJobsForDialog] = useState<JobDefinition[]>([])
  const [showMotorinoGarage, setShowMotorinoGarage] = useState(false)

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
    morningDisplay,
    setMorningDisplay,
    // TASK-B: job selection dialog
    showJobSelectionDialog,
    setShowJobSelectionDialog,
    availableJobsForDialog,
    setAvailableJobsForDialog,
    showMotorinoGarage,
    setShowMotorinoGarage,
  }
}
