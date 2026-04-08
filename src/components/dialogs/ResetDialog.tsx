import { memo } from 'react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface ResetDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  onReset: () => void
}

export const ResetDialog = memo(function ResetDialog({
  open, onOpenChange, onReset,
}: ResetDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-destructive">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-destructive">
            Reset Completo
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler resettare tutto il gioco? Perderai tutti i progressi!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={onReset}>Sì, RESET TUTTO</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
