import { memo } from 'react'
import { HandFist } from '@phosphor-icons/react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface BulliDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  currentEvent: string
  onCedi: () => void
  onResisti: () => void
}

export const BulliDialog = memo(function BulliDialog({
  open, onOpenChange, currentEvent, onCedi, onResisti,
}: BulliDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-destructive">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
            <HandFist size={32} weight="fill" />
            INCONTRO CON I BULLI!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            {currentEvent}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCedi}>Cedi</AlertDialogCancel>
          <AlertDialogAction onClick={onResisti}>Resisti!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
