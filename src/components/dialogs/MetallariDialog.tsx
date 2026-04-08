import { memo } from 'react'
import { ShieldWarning } from '@phosphor-icons/react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface MetallariDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  currentEvent: string
  onScappa: () => void
  onCombatti: () => void
}

export const MetallariDialog = memo(function MetallariDialog({
  open, onOpenChange, currentEvent, onScappa, onCombatti,
}: MetallariDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-destructive">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
            <ShieldWarning size={32} weight="fill" />
            INCONTRO CON I METALLARI!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            {currentEvent}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onScappa}>SCAPPA!</AlertDialogCancel>
          <AlertDialogAction onClick={onCombatti}>COMBATTI!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
