import { lazy, Suspense } from 'react'
  Runnin
  Running,
  Fist,
  Shield
import {
  AlertDialog
  Alert
  ShieldWarning,
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
const SchoolEventDialog = lazy(() => import('@/components/SchoolEventDialog').then(m => ({ default: m.SchoolEventDialog })))
const KeyboardShortcutsDialog = lazy(() => import('@/components/KeyboardShortcutsDialog').then(m => ({ default: m.KeyboardShortcutsDialog })))
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
  showReportCard: boolean
  showPoliceEvent: boolean
  reportCardPassed: boolean
  handlePoliceScappa: () => void
  handlePoliceCollabora: () => void
  showStreetRaceEvent: boolean
  setShowSchoolEvent: (value: boolean) => void
  raceWinChance: number
  showSubjectDialog: boolean
  handleStreetRaceAccetta: () => void
  stanchezza: number
  setShowBulliEvent: (value: boolean) => void
  handleTeacherSelection: (su
  handleBulliResisti: () => void
}
  gameOverReason: string
  handleReset: () => void
  showResetDialog: boolean
  setShowResetDialog: (value: boolean) => void
  showReportCard: boolean
  setShowAtipaEvent,
  currentMedia: number
  handleAtipaProva,
  schoolYear: number
  handleReportCardContinue: () => void
  showSchoolEvent: boolean
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
              <SirenLi
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
  teacherActionType,
  soldi,
}: GameDialogsProps) {
  return (
    <>
      <AlertDialog open={showMetallariEvent} onOpenChange={setShowMetallariEvent}>
        <AlertDialogContent className="border-2 border-destructive" aria-describedby="event-description">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-destructive">
              ⚠️ EVENTO CASUALE ⚠️
            </AlertDialogTitle>
            <AlertDialogDescription id="event-description" className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleMetallariScappa} className="border-2">
              <Running size={24} className="mr-2" />
              Scappa (-10 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMetallariCombatti} className="bg-destructive border-2">
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
              RIMORCHIO TIME!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg space-y-2">
              <p>{currentEvent}</p>
              <p className="text-primary font-bold">
                Probabilità di successo: {atipaSuccessChance}%
              </p>
              <p className="text-sm text-muted-foreground">
                (Basato su Figosità, Coattaggine, Muscoli e Soldi)
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAtipaRinuncia} className="border-2">
              <Running size={24} className="mr-2" />
              Lascia stare (-5 Coattaggine)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAtipaProva} className="bg-accent border-2">
              <Heart size={24} weight="fill" className="mr-2" />
              PROVA! (Gratis)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPoliceEvent} onOpenChange={setShowPoliceEvent}>
        <AlertDialogContent className="border-2 border-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-secondary flex items-center gap-2">
              <SirenLight size={32} weight="fill" className="text-secondary animate-pulse" />
              CONTROLLO POLIZIA!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              {currentEvent}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePoliceScappa} className="border-2 border-destructive">
              <Running size={24} className="mr-2" />
              Scappa! (Serve Coattaggine &gt; 70)
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePoliceCollabora} className="bg-secondary border-2">
              <HandCoins size={24} className="mr-2" />
              Dai Mazzetta (50€)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showStreetRaceEvent} onOpenChange={setShowStreetRaceEvent}>
        <AlertDialogContent className="border-2 border-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-primary flex items-center gap-2">
              <Flag size={32} weight="fill" className="text-primary" />
              GARA DI MOTORINI!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg space-y-2">
              <p>{currentEvent}</p>
              <p className="text-primary font-bold">
                Probabilità di vincita: {raceWinChance}%
              </p>
              <p className="text-sm text-muted-foreground">
                (Basato su Coattaggine, Figosità e Muscoli)
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStreetRaceRifiuta} className="border-2">
              <Running size={24} className="mr-2" />
              Rifiuta (-15 Coattaggine)
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






















































































