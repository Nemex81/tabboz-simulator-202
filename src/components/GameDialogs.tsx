import { lazy, Suspense } from 'react'
  Runnin
  Shield,
  HandC
  Flag,
import {
  AlertDialo
  AlertD
  Alert
  AlertDialogTitle,
import {
const ReportCa
const KeyboardShortc
const TeacherSelecti
export interface Game
  setShowMetallariEvent: 
  handleMetallariSca
  showAtipaEvent: bo
  atipaSuccessChanc
  handleAtipaProva: () => void
  setShowPoliceEvent: (value: boolean) => void

  setShowStreetRaceEvent: (value: boolean) => void
  handleStreetRaceRifiuta: () => void
  showBulliEvent: boolean
  handleBulliCedi: () => void
  gameOver: boolean

  setShowResetDialog: (value: boole
  grades: SubjectGrades
  reportCardPassed: boolean
  handleReportCardCont
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
            </AlertDialogTit
              {currentEvent}
          </AlertDialogHeader>
            <AlertDi
              Scappa (-10 Co
            <AlertDialogAction onClick={handleMe
              Combatti (Serve Muscoli &gt; 60)
          </AlertDialogFooter>
      </AlertDi
 

              <Heart size={32
            </AlertDi
              <p>{curren
               
              <p classNa
              </p>
          </Alert
            <AlertDi
              Lascia 
            <AlertDial
              PROVA
          </AlertD
      </AlertDialog>
      <AlertDialog op
          <AlertDialogHe
              <Shield 
            </AlertDialog
              {c
          </AlertDialogHea
            <AlertDialogCa
              Sca
            <AlertDi
              Dai 
          </AlertDial
      </Ale
      <AlertDialo
          <Ale
              <Fla
            </AlertDi
              <p>
         
              <
              </p>
          </A
            <AlertDialogCan
              Rifi
            <A
              ACCETTA LA S
          </AlertDial
      </AlertDialog
      <AlertDialog ope
          <AlertDial
              <ShieldWa
            </AlertDi
             
          </AlertDia
            <AlertDialo
              Cedi (-20 S
            <AlertDi
        
}: GameDialogsProps) {logAction>
  return (
    <>t>

      <AlertDialog open={gameOver}>
          <AlertDialogHeader>
          <AlertDialogHeader>
              ⚠️ EVENTO CASUALE ⚠️
              💀 GAME OVER 💀
            </AlertDialogTitle>
              {currentEvent}
              {gameOverReason}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <Running size={24} className="mr-2" />
              🔄 Riprova da capo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        </AlertDialogContent>uctive">
          <AlertDialogHeader>
ogTitle className="text-2xl text-destructive">
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
            </AlertDialogTitle>
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
      </AlertDialog>

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
              </p>
            onSelectSubject={handleTeacherSelection}
            actionType={teacherActionType}
            soldi={soldi}
          />
        )}
      </Suspense>
    </>
  )
}
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
