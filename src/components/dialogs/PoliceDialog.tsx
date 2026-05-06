import { memo } from 'react'
import { Shield } from '@phosphor-icons/react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface PoliceDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  currentEvent: string
  onScappa: () => void
  onCollabora: () => void
}

export const PoliceDialog = memo(function PoliceDialog({
  open, onOpenChange, currentEvent, onScappa, onCollabora,
}: PoliceDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-destructive">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
            <Shield size={32} weight="fill" />
            POLIZIA!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            {currentEvent}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onScappa}>SCAPPA!</AlertDialogCancel>
          <AlertDialogAction onClick={onCollabora}>Dai i nomi (Collabora)</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
