// src/hooks/useSoundFeedback.ts
// R13 — Hook centralizzato per feedback sonoro semantico.
// Mappa nomi di azione ad effetti sonori, evitando import diretti nei pannelli.

import { useCallback } from 'react'
import { playSound } from '@/lib/sound-effects'

export type SoundAction =
  | 'success'
  | 'failure'
  | 'statUp'
  | 'statDown'
  | 'moneySpent'
  | 'moneyEarned'
  | 'bigWin'
  | 'bigLoss'
  | 'event'
  | 'danger'
  | 'reputationUp'
  | 'gameOver'
  | 'click'
  | 'reset'

const ACTION_SOUND_MAP: Record<SoundAction, () => void> = {
  success: playSound.success,
  failure: playSound.failure,
  statUp: playSound.statIncrease,
  statDown: playSound.statDecrease,
  moneySpent: playSound.moneySpent,
  moneyEarned: playSound.moneyEarned,
  bigWin: playSound.bigWin,
  bigLoss: playSound.bigLoss,
  event: playSound.eventTrigger,
  danger: playSound.dangerAlert,
  reputationUp: playSound.reputationUp,
  gameOver: playSound.gameOver,
  click: playSound.buttonClick,
  reset: playSound.reset,
}

export function useSoundFeedback() {
  const play = useCallback((action: SoundAction): void => {
    ACTION_SOUND_MAP[action]?.()
  }, [])

  return { play }
}
