import { useState } from 'react'
import { SchoolMorningEvent } from '@/lib/school-morning-events'
import { SchoolEvent } from '@/lib/school-events'

export function useAppDialogs() {
  const [gameOver, setGameOver] = useState(false)
  const [gameOverReason, setGameOverReason] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showReportCard, setShowReportCard] = useState(false)
  const [reportCardPassed, setReportCardPassed] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [showSchoolEvent, setShowSchoolEvent] = useState(false)
  const [schoolEvent, setSchoolEvent] = useState<SchoolEvent | null>(null)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showSubjectDialog, setShowSubjectDialog] = useState(false)
  const [showTeacherDialog, setShowTeacherDialog] = useState(false)
  const [teacherActionType, setTeacherActionType] = useState<'corrompi' | 'minaccia'>('corrompi')
  const [schoolMorningEvents, setSchoolMorningEvents] = useState<SchoolMorningEvent[]>([])
  const [showSchoolMorning, setShowSchoolMorning] = useState(false)

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
    showSchoolMorning,
    setShowSchoolMorning,
  }
}
