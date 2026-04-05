import { useState } from 'react'
import { SchoolMorningEvent } from '@/lib/school-
import { SchoolMorningEvent } from '@/lib/school-morning-events'

  const [showReportCard, setShowR
  const [gameWon, setGameWon] = useState(false)
  const [showSchoolEvent, setShowSchoolEvent] = useState(f
  const [showSubjectDialog, setShowSubjectDialog] = useState(fa
  const [teacherActionType, setTeacherActionType] = useState<
  const [showSchoolMorning, setShowSchoolMorning] = useState(fals
  return {
    setGameOver,
    setGameOverReason,
    setShowResetDialog,
    setShowReportCard,
    setReportCardPassed,
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
    setShowScho
    schoolEvent,

    showSchoolEvent,

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

