import { lazy, Suspense } from 'react'
import {
  Heart,
  Shield,
  Flag,
  ShieldWarning,
  HandCoins,
  Fist,
  Running
} from '@phosphor-icons/react'
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
import { SubjectGrades, SchoolEvent } from '@/lib/types'

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

export function GameDialogs({
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
  soldi,
}: GameDialogsProps) {
  return (
    <>
      <AlertDialog open={showMetallariEvent} onOpenChange={setShowMetallariEvent}>
        <AlertDialogContent className="border-2 border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-primary flex items-center gap-2">
              <Running size={32} weight="fill" className="text-primary" />
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
            <AlertDialogAction onClick={handleMetallariCombatti} className="bg-primary border-2">
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
              RIMORCHIO!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              <p>{currentEvent}</p>
              <p className="mt-4 font-bold text-accent">
                Probabilità di successo: {atipaSuccessChance}%
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAtipaRinuncia} className="border-2">
              Lascia perdere
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAtipaProva} className="bg-accent border-2">
              PROVA!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPoliceEvent} onOpenChange={setShowPoliceEvent}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
              <Shield size={32} weight="fill" className="text-destructive" />
              POLIZIA!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePoliceScappa} className="border-2">
              Scappa
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePoliceCollabora} className="bg-destructive border-2">
              Dai i nomi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showStreetRaceEvent} onOpenChange={setShowStreetRaceEvent}>
        <AlertDialogContent className="border-2 border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-primary flex items-center gap-2">
              <Flag size={32} weight="fill" className="text-primary" />
              GARA CLANDESTINA!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              <p>{currentEvent}</p>
              <p className="mt-4 font-bold text-primary">
                Probabilità di vittoria: {raceWinChance}%
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStreetRaceRifiuta} className="border-2">
              Rifiuta
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
              Resisti (Serve Muscoli &gt; 50)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={gameOver}>
        <AlertDialogContent className="border-4 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl text-destructive text-center">
              💀 GAME OVER 💀
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-center">
              {gameOverReason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleReset} className="w-full bg-destructive">
              🔄 Riprova da capo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="border-2 border-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive">
              ⚠️ CONFERMA RESET
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              Sei sicuro di voler resettare TUTTO il gioco? Perderai tutti i progressi!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive border-2">
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
            currentMedia={currentMedia}
            passed={reportCardPassed}
            schoolYear={schoolYear}
            onContinue={handleReportCardContinue}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
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
            onClose={() => setShowKeyboardHelp(false)}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {showSubjectDialog && (
          <SubjectSelectionDialog
            open={showSubjectDialog}
            onClose={() => setShowSubjectDialog(false)}
            onSelectSubject={handleStudySubject}
            stanchezza={stanchezza}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {showTeacherDialog && (
          <TeacherSelectionDialog
            open={showTeacherDialog}
            onClose={() => setShowTeacherDialog(false)}
            onSelectSubject={handleTeacherSelection}
            actionType={teacherActionType}
            soldi={soldi}
          />
        )}
      </Suspense>
    </>
  )
}
