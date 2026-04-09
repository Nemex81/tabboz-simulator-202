import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog'
import { AtipaEventDialog } from '@/components/dialogs/AtipaEventDialog'
import { BulliDialog } from '@/components/dialogs/BulliDialog'
import { GameOverDialog } from '@/components/dialogs/GameOverDialog'
import { ResetDialog } from '@/components/dialogs/ResetDialog'
import type { SocialDialogsProps } from '@/components/dialogs/game-dialogs.types'

interface SocialDialogsGroupProps {
  social: SocialDialogsProps
  currentEvent: string
}

export function SocialDialogsGroup({ social, currentEvent }: SocialDialogsGroupProps) {
  return (
    <>
      <AtipaEventDialog
        open={social.showAtipaEvent}
        onOpenChange={social.setShowAtipaEvent}
        atipaSuccessChance={social.atipaSuccessChance}
        onRinuncia={social.handleAtipaRinuncia}
        onProva={social.handleAtipaProva}
      />
      <BulliDialog
        open={social.showBulliEvent}
        onOpenChange={social.setShowBulliEvent}
        currentEvent={currentEvent}
        onCedi={social.handleBulliCedi}
        onResisti={social.handleBulliResisti}
      />
      <GameOverDialog
        open={social.gameOver}
        gameOverReason={social.gameOverReason}
        onReset={social.handleReset}
      />
      <ResetDialog
        open={social.showResetDialog}
        onOpenChange={social.setShowResetDialog}
        onReset={social.handleReset}
      />
      {social.showKeyboardHelp && (
        <KeyboardShortcutsDialog
          open={social.showKeyboardHelp}
          onOpenChange={(open) => {
            if (!open) social.setShowKeyboardHelp(false)
          }}
        />
      )}
    </>
  )
}