import { memo } from 'react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface AtipaEventDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  atipaSuccessChance: number
  onRinuncia: () => void
  onProva: () => void
}

export const AtipaEventDialog = memo(function AtipaEventDialog({
  open, onOpenChange, atipaSuccessChance, onRinuncia, onProva,
}: AtipaEventDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-accent">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-accent">
            💖 RIMORCHIA NEL QUARTIERE!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            <p className="mb-2">Hai adocchiato una tipa nel quartiere! Vuoi provarci?</p>
            <p className="text-sm text-muted-foreground">
              Probabilità di successo: {atipaSuccessChance}%
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onRinuncia}>Rinuncia</AlertDialogCancel>
          <AlertDialogAction onClick={onProva}>PROVA!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
