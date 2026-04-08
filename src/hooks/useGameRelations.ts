// src/hooks/useGameRelations.ts
// Hook che gestisce le interazioni del sistema relazioni 4-assi.
// Wrappa applyInteractionEffects e aggiorna Friend.rel + lastInteractionDay.
// Centralizza anche doClassmateInteraction e doTeacherInteraction (R4e/R4f).

import { useCallback } from 'react'
import { Friend, GameStats, GameDate, Classmate, Teacher, TeacherMemoryEntry } from '@/lib/types'
import {
  applyInteractionEffects,
  checkInteractionAvailable,
  dateToDayIndex,
  migrateLegacyFriend,
} from '@/lib/relation-system'
import {
  applyClassmateRelation,
  sampleInteractionDelta,
  PROMOTION_THRESHOLD,
  type ClassmateInteractionKey,
} from '@/lib/classmate-relations'
import { applyTeacherRelationChange } from '@/lib/teacher-relations'

interface UseGameRelationsParams {
  friends: Friend[]
  setFriends: (updater: ((prev: Friend[]) => Friend[]) | Friend[]) => void
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  gameDate: GameDate
  announce: (msg: string) => void
  // Parametri opzionali per hub compagni/professori (R4e/R4f)
  classRoster?: Classmate[]
  setClassRoster?: (updater: (prev: Classmate[]) => Classmate[]) => void
  teachers?: Teacher[]
  setTeachers?: (updater: (prev: Teacher[]) => Teacher[]) => void
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
  classRoster,
  setClassRoster,
  teachers,
  setTeachers,
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

  /**
   * Esegue un'interazione su un Classmate.
   * Aggiorna classmate.relation nel roster tramite setClassRoster.
   * Segnala se la relation supera PROMOTION_THRESHOLD.
   */
  const doClassmateInteraction = useCallback(
    (classmateId: string, interactionKey: ClassmateInteractionKey): DoInteractionResult => {
      if (!classRoster || !setClassRoster) {
        return { success: false, message: 'Roster non disponibile.' }
      }
      const classmate = classRoster.find(c => c.id === classmateId)
      if (!classmate) {
        return { success: false, message: 'Compagno non trovato.' }
      }
      const delta = sampleInteractionDelta(interactionKey)
      const updated = applyClassmateRelation(classmate, delta)
      setClassRoster(prev => prev.map(c => c.id === classmateId ? updated : c))
      const promoted = updated.relation >= PROMOTION_THRESHOLD
      const message = `Interazione con ${classmate.name}: ${delta >= 0 ? '+' : ''}${delta} relazione.`
      announce(message)
      return {
        success: true,
        message,
        newTierLabel: promoted ? 'amicizia' : undefined,
      }
    },
    [classRoster, setClassRoster, announce]
  )

  /**
   * Applica una modifica relazione su un Teacher.
   * Aggiorna il teacher nel roster tramite setTeachers.
   */
  const doTeacherInteraction = useCallback(
    (
      teacherId: string,
      delta: number,
      reason: TeacherMemoryEntry['type'],
      date: GameDate
    ): void => {
      if (!teachers || !setTeachers) return
      const teacher = teachers.find(t => t.id === teacherId)
      if (!teacher) return
      const updated = applyTeacherRelationChange(teacher, delta, reason, date)
      setTeachers(prev => prev.map(t => t.id === teacherId ? updated : t))
    },
    [teachers, setTeachers]
  )

  return { doInteraction, doClassmateInteraction, doTeacherInteraction }
}
