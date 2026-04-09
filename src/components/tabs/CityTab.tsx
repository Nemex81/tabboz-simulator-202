import { CityPanel } from '@/components/CityPanel'
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
  morningChoicePending: boolean
  actionsRemaining: number
  soldi: number
  muscoli: number
  stanchezza: number
  availableActions?: PhaseActionEntry[]
  onAction?: (id: ActionId) => void
}

export function CityTab(props: CityTabProps) {
  return (
    <CityPanel
      playerGender={props.playerGender}
      onDisco={props.onDisco}
      onCinema={props.onCinema}
      onShopping={props.onShopping}
      onPalestra={props.onPalestra}
      onLampada={props.onLampada}
      onLavoro={props.onLavoro}
      morningChoicePending={props.morningChoicePending}
      actionsRemaining={props.actionsRemaining}
      soldi={props.soldi}
      muscoli={props.muscoli}
      stanchezza={props.stanchezza}
      availableActions={props.availableActions}
      onAction={props.onAction}
    />
  )
}
