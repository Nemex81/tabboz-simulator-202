import { useState } from 'react'
import { SchoolEvent } from '@/lib/school-events'
export function useAppDialogs() {

export function useAppDialogs() {
  const [gameOver, setGameOver] = useState(false)
  const [gameOverReason, setGameOverReason] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
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

