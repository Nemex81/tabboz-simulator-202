import { memo } from 'react'
import { Flag } from '@phosphor-icons/react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { BetInfo } from '@/lib/bet-system'
import { getDifficoltaText, getDifficoltaColor } from '@/lib/bet-system'

export interface StreetRaceDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  raceWinChance: number
  onRifiuta: () => void
  onAccetta: () => void
  betInfo?: BetInfo
}

export const StreetRaceDialog = memo(function StreetRaceDialog({
  open, onOpenChange, raceWinChance, onRifiuta, onAccetta, betInfo,
}: StreetRaceDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-primary">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-primary flex items-center gap-2">
            <Flag size={32} weight="fill" />
            GARA DI MOTORINI!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            <p className="mb-2">Ti sfidano a una gara di motorini!</p>
            <p className="text-sm text-muted-foreground">
              Probabilità di vittoria: {raceWinChance}%
            </p>
            {betInfo && (
              <div
                className="mt-3 p-3 rounded border border-muted bg-muted/30"
                role="region"
                aria-label="Dettagli sfida"
                aria-live="polite"
              >
                <p className="font-bold text-foreground">
                  Sfida: <span className={getDifficoltaColor(betInfo.difficolta)}>
                    {betInfo.nomeAvversario} — {getDifficoltaText(betInfo.difficolta)}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{betInfo.descrizione}</p>
                <p className="text-sm mt-2">
                  Scommessa: <span className="font-bold text-destructive">{betInfo.importo}€</span>
                  {' '}→ Vincita potenziale: <span className="font-bold text-primary">{betInfo.vincitaPotenziale}€</span>
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onRifiuta}>Rifiuta</AlertDialogCancel>
          <AlertDialogAction onClick={onAccetta}>ACCETTA!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
