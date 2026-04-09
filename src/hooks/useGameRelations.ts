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
  CLASSMATE_INTERACTIONS,
  sampleInteractionDelta,
  PROMOTION_THRESHOLD,
  type ClassmateInteractionKey,
} from '@/lib/classmate-relations'
import {
  applyTeacherRelationChange,
  getCorruptionChance,
  getThreatSuccess,
} from '@/lib/teacher-relations'

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
  statDelta?: Partial<GameStats>
}

export type TeacherInteractionKey =
  | 'conversazione'
  | 'richiesta_spiegazione'
  | 'richiesta_revoca_voto'
  | 'corruzione'
  | 'minaccia'

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
      const interaction = CLASSMATE_INTERACTIONS[interactionKey]
      if (interaction.requiresPromotion && classmate.relation < PROMOTION_THRESHOLD) {
        return {
          success: false,
          message: `${classmate.name} non si fida ancora abbastanza di te.`,
        }
      }
      const delta = sampleInteractionDelta(interactionKey)
      const updated = applyClassmateRelation(classmate, delta)
      setClassRoster(prev => prev.map(c => c.id === classmateId ? updated : c))
      if (interaction.intelligenzaDelta !== 0) {
        setStats(prev => ({
          ...prev,
          intelligenza: Math.max(0, prev.intelligenza + interaction.intelligenzaDelta),
        }))
      }
      const promoted = updated.relation >= PROMOTION_THRESHOLD
      const message = `Interazione con ${classmate.name}: ${delta >= 0 ? '+' : ''}${delta} relazione.`
      announce(message)
      return {
        success: true,
        message,
        newTierLabel: promoted ? 'amicizia' : undefined,
        statDelta: interaction.intelligenzaDelta !== 0 ? { intelligenza: interaction.intelligenzaDelta } : undefined,
      }
    },
    [announce, classRoster, setClassRoster, setStats]
  )

  /**
   * Applica una modifica relazione su un Teacher.
   * Aggiorna il teacher nel roster tramite setTeachers.
   */
  const doTeacherInteraction = useCallback(
    (
      teacherId: string,
      interactionKey: TeacherInteractionKey
    ): DoInteractionResult => {
      if (!teachers || !setTeachers) {
        return { success: false, message: 'Docenti non disponibili.' }
      }
      const teacher = teachers.find(t => t.id === teacherId)
      if (!teacher) {
        return { success: false, message: 'Professore non trovato.' }
      }

      let relationDelta = 0
      let statDelta: Partial<GameStats> | undefined
      let success = true
      let message = ''

      switch (interactionKey) {
        case 'conversazione': {
          relationDelta = 3 + Math.round(Math.random() * 2)
          message = `Hai avuto una breve conversazione con ${teacher.name}. Relazione +${relationDelta}.`
          break
        }
        case 'richiesta_spiegazione': {
          relationDelta = 2
          statDelta = { intelligenza: 1 }
          message = `${teacher.name} ti ha spiegato meglio la lezione. Relazione +2, intelligenza +1.`
          break
        }
        case 'richiesta_revoca_voto': {
          const accepted = Math.random() * 100 < getCorruptionChance(teacher, 0)
          success = accepted
          relationDelta = accepted
            ? -(5 + Math.round(Math.random() * 5))
            : -(5 + Math.round(Math.random() * 10))
          message = accepted
            ? `${teacher.name} ha accettato di rivedere il voto. Relazione ${relationDelta}.`
            : `${teacher.name} ha rifiutato la richiesta di revoca. Relazione ${relationDelta}.`
          break
        }
        case 'corruzione': {
          const amount = 50
          const accepted = Math.random() * 100 < getCorruptionChance(teacher, amount)
          success = accepted
          relationDelta = accepted ? -10 : -20
          statDelta = { soldi: -amount }
          message = accepted
            ? `${teacher.name} ha accettato. Hai speso ${amount}€. Relazione -10.`
            : `${teacher.name} ha rifiutato con indignazione. Hai perso ${amount}€. Relazione -20.`
          break
        }
        case 'minaccia': {
          const threat = getThreatSuccess(teacher)
          success = threat.success
          message = threat.consequence
          break
        }
        default: {
          return { success: false, message: 'Interazione insegnante non supportata.' }
        }
      }

      const updated = applyTeacherRelationChange(teacher, relationDelta, interactionKey as TeacherMemoryEntry['type'], gameDate)
      setTeachers(prev => prev.map(t => t.id === teacherId ? updated : t))
      if (statDelta && Object.keys(statDelta).length > 0) {
        setStats(prev => {
          const next = { ...prev }
          for (const [key, value] of Object.entries(statDelta)) {
            if (typeof value !== 'number') continue
            const statKey = key as keyof GameStats
            next[statKey] = Math.max(0, (next[statKey] as number) + value) as never
          }
          return next
        })
      }
      announce(message)
      return { success, message, statDelta }
    },
    [announce, gameDate, setStats, setTeachers, teachers]
  )

  return { doInteraction, doClassmateInteraction, doTeacherInteraction }
}
