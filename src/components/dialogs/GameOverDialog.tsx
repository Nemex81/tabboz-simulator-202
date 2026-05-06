import { memo } from 'react'
import { HandCoins } from '@phosphor-icons/react'
import {
  AlertDialog, AlertDialogAction, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface GameOverDialogProps {
  open: boolean
  gameOverReason: string
  onReset: () => void
}

export const GameOverDialog = memo(function GameOverDialog({
  open, gameOverReason, onReset,
}: GameOverDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={() => {}}>
      <AlertDialogContent className="border-2 border-destructive">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2">
            <HandCoins size={32} weight="fill" />
            GAME OVER
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            {gameOverReason}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onReset}>Ricomincia</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
