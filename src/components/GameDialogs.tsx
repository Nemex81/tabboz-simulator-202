import { lazy, Suspense } from 'react'
import {
  Shield,
  ShieldWarning,
  HandCoins,
  Fist,
import {
  Flag
} from '@phosphor-icons/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
const SubjectSelecti
  AlertDialogTitle
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
  showResetDialog: boolean
  handleAtipaProva: () => void
  grades: SubjectGrades
  setShowPoliceEvent: (value: boolean) => void
  handlePoliceScappa: () => void
  handlePoliceCollabora: () => void
  schoolEvent: SchoolEvent | n
  setShowStreetRaceEvent: (value: boolean) => void
  showKeyboardHelp: boo
  handleStreetRaceRifiuta: () => void
  setShowSubjectDialog: (value: boole
  showBulliEvent: boolean
  showTeacherDialog: boolean
  handleBulliCedi: () => void
  teacherActionType: 'corrompi' 
  gameOver: boolean
  gameOverReason: string
  handleReset: () => void
  setShowMetallariEvent,
  setShowResetDialog: (value: boolean) => void
  handleMetallariCombatti
  grades: SubjectGrades
  atipaSuccessChance,
  reportCardPassed: boolean
  showPoliceEvent,
  handleReportCardContinue: () => void
  handlePoliceCollabora,
  schoolEvent: SchoolEvent | null
  soldi,
  return (
      <AlertDialog open={sh
          <AlertDialogHeader>
              <ShieldWarning
            </AlertDialogTitle>
              {currentEvent}
          </AlertDia
            <AlertDialogCanc
              SCAPPA!
            <AlertDialogAction onClick={handleMetal
              COMBATTI!
          </Ale
 

          <AlertDialogHeader>
              💖 RIMO
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
           
            <Aler
              
              </p>
          </AlertDial
            <Aler
         
              <
            </Alert
        </Ale

        <AlertDial
            <A
              INCONTRO CON
            <AlertDia
            </Alert
          <AlertDialog
              <HandC
            </AlertDial
              <Fist s
            <
        </AlertDialo

        <AlertDialogConte
            <AlertDi
        
              {gameOve
          
      
            </AlertDialogAction>
        </AlertDialogContent>

        <AlertDialogContent className="border-2 border-destructive">
            <AlertDialogTitle className="text-2xl text-destructive">
            </AlertDialogTitle>
              Sei sicuro di vol
          </AlertDialogHeader>
            <AlertDialogCanc
            </AlertDialogCancel>
              Sì, RESET TUTTO
          </AlertDialogFooter
      </AlertDialog>
      <Suspense fallback={null}>
          <ReportCard
            grades={grades}
            passed={reportCardPassed}
            onContinue={handleReportCardContinue}
        )}

        {showSchoolEvent && sc
            open={showSchoolE
            onChoice

      </Suspense>
      <Suspense fallback={null}>
          <KeyboardShortcutsD
            onClose={() => setShowKeyboardHelp(false)}
        )}

        {showSubjectDialog && (
            open={showSubjectDialog}
            onSelectSubject={handleStudySubject}
            stanchezza={stanchezza}
        )}

        {showTeacherDialog && 
            open={showTeacher
            onSelectSubject={handleTeacherSelection}
            soldi={sol
        )}
    </>
}














































































































































































