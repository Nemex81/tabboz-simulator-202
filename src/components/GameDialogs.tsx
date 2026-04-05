import { lazy, Suspense } from 'react'
import {
  Shield
  Shield,
  HandC
  ShieldWarning,
  HandCoins,
  Fist,
  Running
} from '@phosphor-icons/react'
  AlertD
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,

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
  schoolEvent: SchoolEvent | null
  setShowSchoolEvent: (value: boolean
  setShowKeyboardHelp: (v
  setShowSubjectDialog: (value: boolean) => v
  stanchezza: number
  setShowTeacherDialog: (value: b
  teacherActionType: 'corrompi
}
export function GameDialogs({
  setShowMetallariEvent,
  handleMetallariScappa,
  showAtipaEvent,
  atipaSuccessChance,
  handleAtipaProva,
  setShowPoliceEvent,
  handlePoliceCollabora,
  setShowStreetRaceEvent,
  handleStreetRaceRifiuta,
  showBulliEvent,
  handleBulliCedi,
  gameOver,
  handleReset,
  setShowResetDialog,
  grades,
  reportCardPassed,
  handleReportCardContinu
  schoolEvent,
  setShowSchoolEvent,
  setShowKeyboardHelp,
  setShowSubjectDial
  stanchezza,
  setShowTeacherDialog,
  teacherActionType,
}: GameDialogsProps) {
    <>
        <AlertDialogContent
            <AlertDialogTitle className="text-2
              ⚠️ EVENTO CASU
            <AlertDialogDescription className="t
            </AlertDialogDescription>
          <AlertDial
              <Running size=
            </AlertDialogCancel>
              <Fist size={24} className="mr-2" />
            </AlertDialogAction>
        </Alert


            <AlertDialogTitle
              RIMORCH
            <AlertDialog
              <
              </p>
          </AlertDialogHea
            <Aler
            </AlertD
              PROVA!
          </AlertDialo
      </AlertDialog
      <AlertDialog
          <AlertDialo
              <Shield
            </AlertDialo
              {current
          </AlertDialogHe
            <Ale
            </AlertDialogC
              Dai i nomi
          </Alert
      </AlertDialog>
      <AlertDialog
          <AlertDialo
           
            </Ale
              
                Pr
            </AlertDi
          <AlertD
         
            <Al
              ACCET
          </A
      </AlertDialog>
      <AlertDialog
          <Ale
              <ShieldWarni
            </AlertDi
              {curr
          </AlertDialo
            <AlertDi
              Cedi (-20
            <AlertDia
             
          </AlertDia
      </AlertDialog>
      <AlertDialog open={
          <AlertDial
        
            <AlertDial
  return (
      
              🔄 Riprova da capo
          </AlertDialogFooter>
          <AlertDialogHeader>
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogHeader>
              ⚠️ EVENTO CASUALE ⚠️
            </AlertDialogTitle>
            </AlertDialogDescription>
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogFooter>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleMetallariScappa} className="border-2">
              <Running size={24} className="mr-2" />
        {showReportCard && (
            open={showReportCard
            currentMedia={currentMedia}
            schoolYear={schoolYear}
          />
            </AlertDialogAction>

        </AlertDialogContent>
          <SchoolEve

        )}

          <AlertDialogHeader>
            open={showKeyboardHelp}
          />
      </Suspense>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
            onClose={() => setShowS
            stanchezza={stanchezza}
        )}

            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            soldi={soldi}
        )}
            </AlertDialogCancel>
}

            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>







            </AlertDialogTitle>













      </AlertDialog>












              </p>





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
