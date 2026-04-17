import { Buildings, ChartBar, Chats, GraduationCap, IdentificationCard, Keyboard, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { DailyControls } from '@/components/DailyControls'
import { TimeDisplay } from '@/components/TimeDisplay'
import type { DayPhase, DayType, GameTime, PlayerProfile } from '@/lib/types'

interface AppHeaderProps {
  playerProfile: PlayerProfile | null
  gameTime: GameTime
  currentPhase: DayPhase | null | undefined
  dayType: DayType | null | undefined
  phaseActionsRemaining: number
  interazioniRimaste: number
  isSchoolMorningSequenceInProgress: boolean
  morningChoicePending: boolean
  onOpenKeyboardHelp: () => void
  onGoToSchool: () => void
  handleRiposa: () => void
  handleDormi: () => void
  handleAdvancePhaseGuarded: () => void
}

export function AppHeader({
  playerProfile,
  gameTime,
  currentPhase,
  dayType,
  phaseActionsRemaining,
  interazioniRimaste,
  isSchoolMorningSequenceInProgress,
  morningChoicePending,
  onOpenKeyboardHelp,
  onGoToSchool,
  handleRiposa,
  handleDormi,
  handleAdvancePhaseGuarded,
}: AppHeaderProps) {
  return (
    <>
      <header className="text-center">
        <h1 className="text-4xl md:text-6xl font-black text-primary neon-text-glow mb-2 tracking-wider">
          TABBOZ SIMULATOR
        </h1>
        <p className="text-xl md:text-2xl text-secondary font-bold">2026 EDITION - VITA DA COATTO</p>
        {playerProfile && (
          <div className="mt-3 flex items-center justify-center gap-3 text-lg text-accent">
            <User size={24} weight="fill" />
            <span className="font-bold">{playerProfile.name}</span>
            <span className="text-muted-foreground">•</span>
            <span>{playerProfile.gender === 'maschio' ? '♂ Maschio' : '♀ Femmina'}</span>
            <span className="text-muted-foreground">•</span>
            <span>{gameTime.age} anni</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Usa <kbd className="px-2 py-1 bg-muted rounded text-primary">Ctrl+numero</kbd> o <kbd className="px-2 py-1 bg-muted rounded text-primary">Ctrl+lettera</kbd> per le scorciatoie.
          </p>
          <Button
            onClick={onOpenKeyboardHelp}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Keyboard size={20} className="mr-2" weight="fill" />
            Aiuto Tasti (Alt+H)
          </Button>
        </div>
      </header>

      <TimeDisplay
        gameTime={gameTime}
        currentPhase={currentPhase ?? undefined}
        dayType={dayType ?? undefined}
        phaseActionsRemaining={phaseActionsRemaining}
        interazioniRimaste={interazioniRimaste}
      />

      <DailyControls
        currentPhase={currentPhase ?? null}
        dayType={dayType ?? null}
        phaseActionsRemaining={phaseActionsRemaining}
        isSchoolMorningSequenceInProgress={isSchoolMorningSequenceInProgress}
        isSchoolPeriod={gameTime.schoolYear.isSchoolPeriod}
        handleRiposa={handleRiposa}
        handleDormi={handleDormi}
        handleAdvancePhaseGuarded={handleAdvancePhaseGuarded}
      />

      {morningChoicePending && (
        <div
          role="alert"
          className="mb-4 p-4 bg-destructive/20 border-2 border-destructive rounded-lg text-center animate-pulse"
        >
          <p className="text-destructive font-bold text-lg">
            🏫 È mattina! Prima devi scegliere: vai a scuola o la marini?
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Vai al tab <strong>Scuola → Voti</strong> e fai la tua scelta per sbloccare tutte le altre attività.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onGoToSchool}
            className="mt-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-[3px]"
            aria-label="Vai al tab Scuola per fare la scelta mattutina"
          >
            Vai a Scuola ora
          </Button>
        </div>
      )}
    </>
  )
}