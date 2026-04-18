/**
 * DailyControls.tsx — pannello "Gestione Giornata" estratto da App.tsx (STEP 9.3).
 * Mostra il pulsante "Prossima fase", Riposa, Vai a dormire e lo stato avanzamento.
 */
import React from 'react'
import { Button } from '@/components/ui/button'

interface DailyControlsProps {
  currentPhase: string | null
  dayType: string | null
  phaseActionsRemaining: number
  phaseActionsMax?: number
  isSchoolMorningSequenceInProgress: boolean
  isSchoolPeriod: boolean
  handleRiposa: () => void
  handleDormi: () => void
  handleAdvancePhaseGuarded: () => void
}

export function DailyControls({
  currentPhase,
  dayType,
  phaseActionsRemaining,
  phaseActionsMax,
  isSchoolMorningSequenceInProgress,
  isSchoolPeriod,
  handleRiposa,
  handleDormi,
  handleAdvancePhaseGuarded,
}: DailyControlsProps) {
  const nextPhaseLabel =
    currentPhase === 'mattina' ? 'Pomeriggio' :
    currentPhase === 'pomeriggio' ? 'Sera' :
    currentPhase === 'sera' ? 'Notte' : 'Mattina'

  const canAdvance = !isSchoolMorningSequenceInProgress
  const actionsMax = phaseActionsMax ?? 2

  const advanceStatusLabel =
    isSchoolMorningSequenceInProgress
      ? '🏫 Lezioni in corso'
      : `Azioni: ${phaseActionsRemaining ?? 0}/${actionsMax}`

  const advanceButtonTitle =
    isSchoolMorningSequenceInProgress
      ? 'Completa prima tutte le ore di scuola per passare alla fase successiva'
      : `Avanza a: ${nextPhaseLabel} (Ctrl+Alt+Invio)`

  const advanceAriaLabel =
    isSchoolMorningSequenceInProgress
      ? `Avanza alla prossima fase della giornata: ${nextPhaseLabel}. Prima completa tutte le ore di scuola della mattina.`
      : `Avanza alla prossima fase della giornata: ${nextPhaseLabel}. Azioni disponibili nella fase corrente: ${phaseActionsRemaining ?? 0} su ${actionsMax}. Scorciatoia da tastiera: Ctrl+Alt+Invio`

  const showRiposa =
    currentPhase === 'pomeriggio' ||
    currentPhase === 'sera' ||
    (currentPhase === 'mattina' && (dayType !== 'feriale' || !isSchoolPeriod))

  const showDormi = currentPhase === 'sera' || currentPhase === 'notte'

  return (
    <div className="mb-4 p-4 bg-muted/30 rounded-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Gestione Giornata
        </span>
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isSchoolMorningSequenceInProgress
              ? 'bg-secondary/20 text-secondary'
              : 'border border-border bg-background text-foreground'
          }`}
        >
          {advanceStatusLabel}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {showRiposa && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRiposa}
            title="Recupera parte della stanchezza"
            aria-label="Riposa: recupera parte della stanchezza"
            className="flex items-center gap-1"
          >
            😴 <span>Riposa</span>
          </Button>
        )}
        {showDormi && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDormi}
            title="Vai a dormire: recupero totale, avanza al giorno dopo (sempre disponibile)"
            aria-label="Vai a dormire: recupero totale della stanchezza e avanzamento al giorno successivo"
            className="flex items-center gap-1"
          >
            🌙 <span>Vai a dormire</span>
          </Button>
        )}
        <Button
          variant={canAdvance ? 'default' : 'secondary'}
          size="sm"
          onClick={handleAdvancePhaseGuarded}
          disabled={!canAdvance}
          title={advanceButtonTitle}
          aria-label={advanceAriaLabel}
          className="flex items-center gap-1"
        >
          ▶ <span>Prossima fase</span>
          <span className="ml-1 text-xs opacity-70">({nextPhaseLabel})</span>
        </Button>
      </div>
    </div>
  )
}
