import { CityPanel } from '@/components/CityPanel'
import { AdvancePhaseButton } from '@/components/AdvancePhaseButton'
import type { PhaseActionEntry, ActionId } from '@/lib/phase-actions'
import type { NarrativePlayerGender } from '@/lib/types'

interface CityTabProps {
  playerGender: NarrativePlayerGender
  onDisco: () => void
  onCinema: () => void
  onShopping: () => void
  onPalestra: () => void
  onLampada: () => void
  onLavoro: () => void
  onConcessionario?: () => void
  onMeccanico?: () => void
  morningChoicePending: boolean
  actionsRemaining: number
  soldi: number
  muscoli: number
  stanchezza: number
  availableActions?: PhaseActionEntry[]
  onAction?: (id: ActionId) => void
  onAdvance: () => void
  nextPhaseLabel: string
}

export function CityTab(props: CityTabProps) {
  return (
    <>
      <h2 className="sr-only">Pannello città e azioni</h2>
      <CityPanel
        playerGender={props.playerGender}
        onDisco={props.onDisco}
        onCinema={props.onCinema}
        onShopping={props.onShopping}
        onPalestra={props.onPalestra}
        onLampada={props.onLampada}
        onLavoro={props.onLavoro}
        onConcessionario={props.onConcessionario}
        onMeccanico={props.onMeccanico}
        morningChoicePending={props.morningChoicePending}
        actionsRemaining={props.actionsRemaining}
        soldi={props.soldi}
        muscoli={props.muscoli}
        stanchezza={props.stanchezza}
        availableActions={props.availableActions}
        onAction={props.onAction}
      />
      <div className="mt-6 pt-4 border-t border-border flex justify-end">
        <AdvancePhaseButton
          disabled={false}
          label={props.nextPhaseLabel}
          onAdvance={props.onAdvance}
        />
      </div>
    </>
  )
}
