// src/hooks/useGameRelations.ts
// Hook che gestisce le interazioni del sistema relazioni 4-assi.
// Wrappa applyInteractionEffects e aggiorna Friend.rel + lastInteractionDay.

import { useCallback } from 'react'
import { Friend, GameStats, GameDate } from '@/lib/types'
import {
  applyInteractionEffects,
  checkInteractionAvailable,
  dateToDayIndex,
  migrateLegacyFriend,
} from '@/lib/relation-system'

interface UseGameRelationsParams {
  friends: Friend[]
  setFriends: (updater: ((prev: Friend[]) => Friend[]) | Friend[]) => void
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  gameDate: GameDate
  announce: (msg: string) => void
}

export interface DoInteractionResult {
  success: boolean
  message: string
  newTierLabel?: string
}

export function useGameRelations({
  friends,
  setFriends,
  stats,
  setStats,
  gameDate,
  announce,
}: UseGameRelationsParams) {
  /**
   * Esegue un'interazione relazionale su un Friend.
   * Aggiorna Friend.rel e Friend.lastInteractionDay.
   * Applica eventuali effetti su GameStats (es. soldi, reputazione).
   */
  const doInteraction = useCallback(
    (friendId: string, interactionId: string): DoInteractionResult => {
      const friend = friends.find(f => f.id === friendId)
      if (!friend) {
        return { success: false, message: 'Amico non trovato.' }
      }

      // Assicura che il friend abbia rel (migrazione lazy se necessario)
      const migratedFriend = migrateLegacyFriend(friend)
      const rel = migratedFriend.rel!

      // Verifica prerequisiti
      const { canUse, reason } = checkInteractionAvailable(interactionId, rel)
      if (!canUse) {
        return { success: false, message: reason ?? 'Interazione non disponibile.' }
      }

      // Applica effetti
      const { newRel, newStats, message, success } = applyInteractionEffects(
        interactionId,
        rel,
        stats,
        friend.type
      )

      const currentDayIndex = dateToDayIndex(gameDate)

      // Aggiorna friends in KV
      setFriends(prev =>
        prev.map(f => {
          if (f.id !== friendId) return f
          return {
            ...migrateLegacyFriend(f),
            rel: newRel,
            lastInteractionDay: currentDayIndex,
          }
        })
      )

      // Applica delta GameStats se presenti
      const statsKeys = Object.keys(newStats) as Array<keyof Partial<GameStats>>
      if (statsKeys.length > 0) {
        setStats(prev => {
          const updated = { ...prev }
          for (const key of statsKeys) {
            const delta = newStats[key]
            if (delta != null && typeof prev[key] === 'number') {
              // @ts-ignore — tutti i campi usati sono number
              updated[key] = Math.max(0, (prev[key] as number) + delta)
            }
          }
          return updated
        })
      }

      announce(message)
      return { success, message }
    },
    [friends, setFriends, stats, setStats, gameDate, announce]
  )

  return { doInteraction }
}
