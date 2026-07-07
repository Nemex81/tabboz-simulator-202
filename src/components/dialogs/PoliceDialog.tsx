import { memo } from 'react'
import { Shield, Sparkle, HandFist, ChatTeardropText, Megaphone } from '@phosphor-icons/react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export interface PoliceDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  currentEvent: string
  playerSoldi: number
  bribeCost: number
  hasMotorino: boolean
  onScappa: () => void
  onMazzetta: () => void
  onCarisma: () => void
  onCollabora: () => void // Dai i nomi / Fai la spia
}

export const PoliceDialog = memo(function PoliceDialog({
  open,
  onOpenChange,
  currentEvent,
  playerSoldi,
  bribeCost,
  hasMotorino,
  onScappa,
  onMazzetta,
  onCarisma,
  onCollabora,
}: PoliceDialogProps) {
  const canAffordBribe = playerSoldi >= bribeCost

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-2 border-destructive max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-destructive flex items-center gap-2 font-black tracking-wide">
            <Shield size={32} weight="fill" className="animate-pulse" />
            CONTROLLO DELLA POLIZIA!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-foreground font-semibold leading-relaxed mt-2">
            {currentEvent}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          {/* Opzione 1: Scappa */}
          <Button
            onClick={onScappa}
            variant="destructive"
            className="w-full font-bold flex items-center justify-center gap-2 py-5 text-sm"
          >
            <HandFist size={18} weight="fill" />
            {hasMotorino ? 'SCAPPA IN IMPENNATA!' : 'SCAPPA A PIEDI!'}
          </Button>

          {/* Opzione 2: Parlantina */}
          <Button
            onClick={onCarisma}
            variant="outline"
            className="w-full font-bold border-secondary text-secondary hover:bg-secondary/10 flex items-center justify-center gap-2 py-5 text-sm"
          >
            <ChatTeardropText size={18} weight="bold" />
            Prova a Parlare (Usa Carisma)
          </Button>

          {/* Opzione 3: Mazzetta */}
          <Button
            onClick={onMazzetta}
            disabled={!canAffordBribe}
            className="w-full font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 flex flex-col items-center justify-center py-6 text-sm"
          >
            <span className="flex items-center gap-2">
              <Sparkle size={18} weight="fill" />
              Paga Mazzetta ({bribeCost}€)
            </span>
            {!canAffordBribe && (
              <span className="text-[10px] opacity-90 font-mono mt-0.5">Non hai abbastanza soldi!</span>
            )}
          </Button>

          {/* Opzione 4: Collabora / Spia */}
          <Button
            onClick={onCollabora}
            variant="ghost"
            className="w-full font-bold text-destructive hover:bg-destructive/10 flex items-center justify-center gap-2 py-5 text-sm"
          >
            <Megaphone size={18} weight="bold" />
            Collabora (Fai i nomi degli organizzatori)
          </Button>
        </div>

        <div className="text-[10px] text-muted-foreground text-center mt-2 italic">
          Attento: fare la spia ti evita la multa ma distruggerà la tua reputazione da vero tamarro nel quartiere!
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
})
