import { lazy, Suspense } from 'react'
import { Shield, ShieldWarning, HandCoins, HandFist, Flag } from '@phosphor-icons/react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { SubjectGrades } from '@/lib/types'
import type { SchoolEvent } from '@/lib/school-events'

const ReportCardDialog = lazy(() => import('@/components/ReportCardDialog').then(m => ({ default: m.ReportCardDialog })))
const KeyboardShortcutsDialog = lazy(() => import('@/components/KeyboardShortcutsDialog').then(m => ({ default: m.KeyboardShortcutsDialog })))
const SchoolEventDialog = lazy(() => import('@/components/SchoolEventDialog').then(m => ({ default: m.SchoolEventDialog })))
const SubjectSelectionDialog = lazy(() => import('@/components/SubjectSelectionDialog').then(m => ({ default: m.SubjectSelectionDialog })))
const TeacherSelectionDialog = lazy(() => import('@/components/TeacherSelectionDialog').then(m => ({ default: m.TeacherSelectionDialog })))

export interface GameDialogsProps {
  showMetallariEvent: boolean
  setShowMetallariEvent: (value: boolean) => void
  currentEvent: string
  handleMetallariScappa: () => void
  handleMetallariCombatti: () => void
  showAtipaEvent: boolean
  setShowAtipaEvent: (value: boolean) => void
  atipaSuccessChance: number
  handleAtipaRinuncia: () => void
  handleAtipaProva: () => void
  showPoliceEvent: boolean
  setShowPoliceEvent: (value: boolean) => void
  handlePoliceScappa: () => void
  handlePoliceCollabora: () => void
  showStreetRaceEvent: boolean
  setShowStreetRaceEvent: (value: boolean) => void
  raceWinChance: number
  handleStreetRaceRifiuta: () => void
  handleStreetRaceAccetta: () => void
  showBulliEvent: boolean
  setShowBulliEvent: (value: boolean) => void
  handleBulliCedi: () => void
  handleBulliResisti: () => void
  gameOver: boolean
  gameOverReason: string
  handleReset: () => void
  showResetDialog: boolean
  setShowResetDialog: (value: boolean) => void
  showReportCard: boolean
  grades: SubjectGrades
  currentMedia: number
  reportCardPassed: boolean
  schoolYear: number
  handleReportCardContinue: () => void
  condotta: number
  assenze: number
  showSchoolEvent: boolean
  schoolEvent: SchoolEvent | null
  handleSchoolEventChoice: (choiceIndex: number) => void
  setShowSchoolEvent: (value: boolean) => void
  showKeyboardHelp: boolean
  setShowKeyboardHelp: (value: boolean) => void
  showSubjectDialog: boolean
  setShowSubjectDialog: (value: boolean) => void
  handleStudySubject: (subject: string) => void
  stanchezza: number
  showTeacherDialog: boolean
  setShowTeacherDialog: (value: boolean) => void
  handleTeacherSelection: (subject: string) => void
  teacherActionType: 'corrompi' | 'minaccia'
  soldi: number
}

export function GameDialogs(props: GameDialogsProps) {
  const {
    showMetallariEvent,
    setShowMetallariEvent,
    currentEvent,
    handleMetallariScappa,
    handleMetallariCombatti,
    showAtipaEvent,
    setShowAtipaEvent,
    atipaSuccessChance,
    handleAtipaRinuncia,
    handleAtipaProva,
    showPoliceEvent,
    setShowPoliceEvent,
    handlePoliceScappa,
    handlePoliceCollabora,
    showStreetRaceEvent,
    setShowStreetRaceEvent,
    raceWinChance,
    handleStreetRaceRifiuta,
    handleStreetRaceAccetta,
    showBulliEvent,
    setShowBulliEvent,
    handleBulliCedi,
    handleBulliResisti,
    gameOver,
    gameOverReason,
    handleReset,
    showResetDialog,
    setShowResetDialog,
    showReportCard,
    grades,
    currentMedia,
    reportCardPassed,
    schoolYear,
    handleReportCardContinue,
    condotta,
    assenze,
    showSchoolEvent,
    schoolEvent,
    handleSchoolEventChoice,
    setShowSchoolEvent,
    showKeyboardHelp,
    setShowKeyboardHelp,
    showSubjectDialog,
    setShowSubjectDialog,
    handleStudySubject,
    stanchezza,
    showTeacherDialog,
    setShowTeacherDialog,
    handleTeacherSelection,
    teacherActionType,
    soldi
  } = props

  return (
    <>
      <AlertDialog open={showMetallariEvent} onOpenChange={setShowMetallariEvent}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <ShieldWarning size={32} weight="fill" />
              INCONTRO CON I METALLARI!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleMetallariScappa}>
              SCAPPA!
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMetallariCombatti}>
              COMBATTI!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAtipaEvent} onOpenChange={setShowAtipaEvent}>
        <AlertDialogContent className="border-2 border-accent">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-accent">
              💖 RIMORCHIO!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              <p className="mb-2">Hai adocchiato un'atipa! Vuoi provarci?</p>
              <p className="text-sm text-muted-foreground">
                Probabilità di successo: {atipaSuccessChance}%
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAtipaRinuncia}>
              Rinuncia
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAtipaProva}>
              PROVA!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPoliceEvent} onOpenChange={setShowPoliceEvent}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <Shield size={32} weight="fill" />
              POLIZIA!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePoliceScappa}>
              SCAPPA!
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePoliceCollabora}>
              Dai i nomi (Collabora)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showStreetRaceEvent} onOpenChange={setShowStreetRaceEvent}>
        <AlertDialogContent className="border-2 border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-primary flex items-center gap-2">
              <Flag size={32} weight="fill" />
              GARA DI MOTORINI!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              <p className="mb-2">Ti sfidano a una gara di motorini!</p>
              <p className="text-sm text-muted-foreground">
                Probabilità di vittoria: {raceWinChance}%
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStreetRaceRifiuta}>
              Rifiuta
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleStreetRaceAccetta}>
              ACCETTA!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBulliEvent} onOpenChange={setShowBulliEvent}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <HandFist size={32} weight="fill" />
              INCONTRO CON I BULLI!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleBulliCedi}>
              Cedi
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBulliResisti}>
              Resisti!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={gameOver} onOpenChange={() => {}}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <HandCoins size={32} weight="fill" />
              GAME OVER
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {gameOverReason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleReset}>
              Ricomincia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive">
              Reset Completo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler resettare tutto il gioco? Perderai tutti i progressi!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Sì, RESET TUTTO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Suspense fallback={null}>
        {showReportCard && (
          <ReportCardDialog
            open={showReportCard}
            grades={grades}
            media={currentMedia}
            isPassed={reportCardPassed}
            schoolYear={schoolYear}
            onContinue={handleReportCardContinue}
            condotta={condotta}
            assenze={assenze}
          />
        )}

        {showSchoolEvent && schoolEvent && (
          <SchoolEventDialog
            open={showSchoolEvent}
            event={schoolEvent}
            onChoice={handleSchoolEventChoice}
            onClose={() => setShowSchoolEvent(false)}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {showKeyboardHelp && (
          <KeyboardShortcutsDialog
            open={showKeyboardHelp}
            onOpenChange={(open) => { if (!open) setShowKeyboardHelp(false) }}
          />
        )}

        {showSubjectDialog && (
          <SubjectSelectionDialog
            open={showSubjectDialog}
            onSelectSubject={handleStudySubject}
            onClose={() => setShowSubjectDialog(false)}
            stanchezza={stanchezza}
            grades={grades}
          />
        )}

        {showTeacherDialog && (
          <TeacherSelectionDialog
            open={showTeacherDialog}
            onSelectTeacher={handleTeacherSelection}
            onClose={() => setShowTeacherDialog(false)}
            actionType={teacherActionType}
            soldi={soldi}
            grades={grades}
          />
        )}
      </Suspense>
    </>
  )
}
