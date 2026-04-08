import { lazy, memo, Suspense } from 'react'
import type { GameDialogsProps } from '@/components/dialogs/game-dialogs.types'
import { MetallariDialog } from '@/components/dialogs/MetallariDialog'
import { AtipaEventDialog } from '@/components/dialogs/AtipaEventDialog'
import { PoliceDialog } from '@/components/dialogs/PoliceDialog'
import { StreetRaceDialog } from '@/components/dialogs/StreetRaceDialog'
import { BulliDialog } from '@/components/dialogs/BulliDialog'
import { GameOverDialog } from '@/components/dialogs/GameOverDialog'
import { ResetDialog } from '@/components/dialogs/ResetDialog'

export type { GameDialogsProps }

const ReportCardDialog = lazy(() => import('@/components/ReportCardDialog').then(m => ({ default: m.ReportCardDialog })))
const KeyboardShortcutsDialog = lazy(() => import('@/components/KeyboardShortcutsDialog').then(m => ({ default: m.KeyboardShortcutsDialog })))
const SchoolEventDialog = lazy(() => import('@/components/SchoolEventDialog').then(m => ({ default: m.SchoolEventDialog })))
const SubjectSelectionDialog = lazy(() => import('@/components/SubjectSelectionDialog').then(m => ({ default: m.SubjectSelectionDialog })))
const TeacherSelectionDialog = lazy(() => import('@/components/TeacherSelectionDialog').then(m => ({ default: m.TeacherSelectionDialog })))

export const GameDialogs = memo(function GameDialogs(p: GameDialogsProps) {
  return (
    <>
      <MetallariDialog open={p.showMetallariEvent} onOpenChange={p.setShowMetallariEvent}
        currentEvent={p.currentEvent} onScappa={p.handleMetallariScappa} onCombatti={p.handleMetallariCombatti} />
      <AtipaEventDialog open={p.showAtipaEvent} onOpenChange={p.setShowAtipaEvent}
        atipaSuccessChance={p.atipaSuccessChance} onRinuncia={p.handleAtipaRinuncia} onProva={p.handleAtipaProva} />
      <PoliceDialog open={p.showPoliceEvent} onOpenChange={p.setShowPoliceEvent}
        currentEvent={p.currentEvent} onScappa={p.handlePoliceScappa} onCollabora={p.handlePoliceCollabora} />
      <StreetRaceDialog open={p.showStreetRaceEvent} onOpenChange={p.setShowStreetRaceEvent}
        raceWinChance={p.raceWinChance} onRifiuta={p.handleStreetRaceRifiuta} onAccetta={p.handleStreetRaceAccetta} betInfo={p.betInfo} />
      <BulliDialog open={p.showBulliEvent} onOpenChange={p.setShowBulliEvent}
        currentEvent={p.currentEvent} onCedi={p.handleBulliCedi} onResisti={p.handleBulliResisti} />
      <GameOverDialog open={p.gameOver} gameOverReason={p.gameOverReason} onReset={p.handleReset} />
      <ResetDialog open={p.showResetDialog} onOpenChange={p.setShowResetDialog} onReset={p.handleReset} />

      <Suspense fallback={null}>
        {p.showReportCard && (
          <ReportCardDialog open={p.showReportCard} grades={p.grades} media={p.currentMedia}
            isPassed={p.reportCardPassed} schoolYear={p.schoolYear} onContinue={p.handleReportCardContinue}
            condotta={p.condotta} assenze={p.assenze} />
        )}
        {p.showSchoolEvent && p.schoolEvent && (
          <SchoolEventDialog open={p.showSchoolEvent} event={p.schoolEvent}
            onChoice={p.handleSchoolEventChoice} onClose={() => p.setShowSchoolEvent(false)} />
        )}
        {p.showKeyboardHelp && (
          <KeyboardShortcutsDialog open={p.showKeyboardHelp}
            onOpenChange={(open) => { if (!open) p.setShowKeyboardHelp(false) }} />
        )}
        {p.showSubjectDialog && (
          <SubjectSelectionDialog open={p.showSubjectDialog} onSelectSubject={p.handleStudySubject}
            onClose={() => p.setShowSubjectDialog(false)} stanchezza={p.stanchezza} grades={p.grades} />
        )}
        {p.showTeacherDialog && (
          <TeacherSelectionDialog open={p.showTeacherDialog} onSelectTeacher={p.handleTeacherSelection}
            onClose={() => p.setShowTeacherDialog(false)} actionType={p.teacherActionType}
            soldi={p.soldi} grades={p.grades} />
        )}
      </Suspense>
    </>
  )
})
