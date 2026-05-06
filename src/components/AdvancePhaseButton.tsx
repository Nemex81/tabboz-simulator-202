import { useId } from 'react'
import { Button } from '@/components/ui/button'

interface AdvancePhaseButtonProps {
  disabled: boolean
  label: string
  onAdvance: () => void
  blockedMessage?: string
}

export function AdvancePhaseButton({ disabled, label, onAdvance, blockedMessage }: AdvancePhaseButtonProps) {
  const id = useId()
  return (
    <Button
      className="focus-visible:ring-[3px]"
      variant="outline"
      size="sm"
      onClick={onAdvance}
      disabled={disabled}
      aria-label={`Avanza alla fase: ${label}`}
      aria-describedby={disabled ? `${id}-blocked` : undefined}
    >
      Prossima fase → {label}
      {disabled && (
        <span id={`${id}-blocked`} className="sr-only">
          {blockedMessage ?? 'Completa le azioni disponibili prima di avanzare'}
        </span>
      )}
    </Button>
  )
}
