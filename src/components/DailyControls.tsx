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

  const canAdvance = phaseActionsRemaining === 0 && !isSchoolMorningSequenceInProgress

  const advanceStatusLabel =
    isSchoolMorningSequenceInProgress
      ? '🏫 Lezioni in corso'
      : canAdvance
        ? '✓ Pronto ad avanzare'
        : `${phaseActionsRemaining} azioni rimaste`

  const advanceButtonTitle =
    isSchoolMorningSequenceInProgress
      ? 'Completa prima tutte le ore di scuola per passare alla fase successiva'
      : canAdvance
        ? `Avanza a: ${nextPhaseLabel} (Ctrl+N)`
        : `Consuma prima le ${phaseActionsRemaining} azioni rimaste`

  const advanceAriaLabel =
    isSchoolMorningSequenceInProgress
      ? `Avanza alla prossima fase della giornata: ${nextPhaseLabel}. Pulsante disabilitato. Devi completare prima tutte le ore di scuola.`
      : `Avanza alla prossima fase della giornata: ${nextPhaseLabel}. Azioni rimaste per questa fase: ${phaseActionsRemaining}. ${canAdvance ? 'Pulsante abilitato. Premi per avanzare.' : 'Pulsante disabilitato. Devi consumare tutte le azioni prima di avanzare.'} Scorciatoia da tastiera: Ctrl+N`

  const showRiposa =
    currentPhase === 'pomeriggio' ||
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
            canAdvance
              ? 'bg-primary/20 text-primary'
              : isSchoolMorningSequenceInProgress
                ? 'bg-secondary/20 text-secondary'
                : 'bg-destructive/15 text-destructive'
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
            disabled={phaseActionsRemaining <= 0}
            title="Recupera parte della stanchezza (consuma 1 azione)"
            aria-label="Riposa: recupera parte della stanchezza, consuma un'azione"
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
