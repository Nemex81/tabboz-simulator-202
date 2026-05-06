import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useA11y, type A11yPriority } from '@/components/A11yLiveRegion'
import { getDayOfWeekLabel } from '@/lib/time-utils'
import type { AfternoonEvent } from '@/lib/afternoon-events'
import { HEALTH_CONDITIONS, type DayPhase, type GameDate, type GameStats, type HealthConditionId } from '@/lib/types'

type AnnounceFn = (message: string, priority?: A11yPriority) => void

type NarratedStatKey = Exclude<keyof GameStats, 'soldi' | 'media' | 'hasMotorino'>

interface UseGameNarratorParams {
  currentDate: GameDate
  currentPhase: DayPhase | null
  phaseActionsRemaining: number
  stats: GameStats
  afternoonEvent: AfternoonEvent | null
  activeConditionIds: HealthConditionId[]
}

const NARRATED_STATS: NarratedStatKey[] = [
  'muscoli',
  'coattaggine',
  'stanchezza',
  'stress',
  'morale',
  'figosita',
  'reputazione',
  'intelligenza',
  'carisma',
  'salute',
]

const STAT_LABELS: Record<NarratedStatKey, string> = {
  muscoli: 'Muscoli',
  coattaggine: 'Coattaggine',
  stanchezza: 'Stanchezza',
  stress: 'Stress',
  morale: 'Morale',
  figosita: 'Figosita',
  reputazione: 'Reputazione',
  intelligenza: 'Intelligenza',
  carisma: 'Carisma',
  salute: 'Salute',
}

function useDebouncedAnnouncement(
  valueKey: string,
  messageFactory: () => { message: string; priority?: A11yPriority } | null,
  announce: AnnounceFn,
  isMountedRef: MutableRefObject<boolean>,
) {
  const lastKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isMountedRef.current) {
      lastKeyRef.current = valueKey
      return
    }

    if (lastKeyRef.current === valueKey) {
      return
    }

    lastKeyRef.current = valueKey
    const payload = messageFactory()
    if (!payload) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      announce(payload.message, payload.priority)
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [announce, isMountedRef, messageFactory, valueKey])
}

export function useGameNarrator({
  currentDate,
  currentPhase,
  phaseActionsRemaining,
  stats,
  afternoonEvent,
  activeConditionIds,
}: UseGameNarratorParams) {
  const { announce } = useA11y()
  const isMountedRef = useRef(false)
  const previousStatsRef = useRef(stats)
  const previousSaluteRef = useRef(stats.salute)
  const previousSoldiRef = useRef(stats.soldi)
  const previousConditionIdsRef = useRef(activeConditionIds)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const dateKey = `${currentDate.day}-${currentDate.month}-${currentDate.year}`
  const phaseKey = `${currentPhase ?? 'nessuna'}-${phaseActionsRemaining}`
  const afternoonEventKey = afternoonEvent ? `${afternoonEvent.id}-${afternoonEvent.title}` : 'none'
  const activeConditionsKey = activeConditionIds.join('|')

  const statDeltaKey = useMemo(() => (
    NARRATED_STATS.map((key) => `${key}:${stats[key]}`).join('|')
  ), [stats])

  useDebouncedAnnouncement(
    dateKey,
    () => ({
      message: `Giorno ${currentDate.day}, ${getDayOfWeekLabel(currentDate)}.`,
      priority: 'polite',
    }),
    announce,
    isMountedRef,
  )

  useDebouncedAnnouncement(
    phaseKey,
    () => {
      if (!currentPhase) {
        return null
      }

      const phaseLabel = currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)
      return {
        message: `Nuova fase: ${phaseLabel}. Azioni disponibili: ${phaseActionsRemaining}.`,
        priority: 'assertive',
      }
    },
    announce,
    isMountedRef,
  )

  useDebouncedAnnouncement(
    afternoonEventKey,
    () => {
      if (!afternoonEvent) {
        return null
      }

      return {
        message: `${afternoonEvent.title}. ${afternoonEvent.description}`,
        priority: 'assertive',
      }
    },
    announce,
    isMountedRef,
  )

  useEffect(() => {
    if (!isMountedRef.current) {
      previousSaluteRef.current = stats.salute
      return
    }

    const previousSalute = previousSaluteRef.current
    previousSaluteRef.current = stats.salute

    if (stats.salute >= 30 || previousSalute < 30) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      announce(`Attenzione: salute critica al ${Math.round(stats.salute)}%. Considera di riposarti.`, 'assertive')
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [announce, stats.salute])

  useEffect(() => {
    if (!isMountedRef.current) {
      previousSoldiRef.current = stats.soldi
      return
    }

    const previousSoldi = previousSoldiRef.current
    previousSoldiRef.current = stats.soldi

    if (stats.soldi >= 50 || previousSoldi < 50) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      announce(`Soldi bassi: ${Math.round(stats.soldi)} lire rimaste.`, 'polite')
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [announce, stats.soldi])

  useEffect(() => {
    const previousStats = previousStatsRef.current
    previousStatsRef.current = stats

    if (!isMountedRef.current) {
      return
    }

    const changedStats = NARRATED_STATS
      .map((key) => ({
        key,
        delta: stats[key] - previousStats[key],
        value: stats[key],
      }))
      .filter((entry) => Math.abs(entry.delta) >= 5)

    if (changedStats.length === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      for (const entry of changedStats) {
        const direction = entry.delta > 0 ? 'In aumento' : 'In calo'
        announce(`${STAT_LABELS[entry.key]}: ${Math.round(entry.value)} su 100. ${direction}.`, 'polite')
      }
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [announce, statDeltaKey, stats])

  useEffect(() => {
    const previousConditionIds = previousConditionIdsRef.current
    previousConditionIdsRef.current = activeConditionIds

    if (!isMountedRef.current) {
      return
    }

    const addedConditionId = activeConditionIds.find((id) => !previousConditionIds.includes(id))
    if (addedConditionId) {
      const template = HEALTH_CONDITIONS[addedConditionId]
      if (!template) {
        return
      }

      const timeoutId = window.setTimeout(() => {
        announce(`${template.label}. ${template.description}`, 'assertive')
      }, 300)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    const removedConditionId = previousConditionIds.find((id) => !activeConditionIds.includes(id))
    if (!removedConditionId) {
      return
    }

    const template = HEALTH_CONDITIONS[removedConditionId]
    if (!template) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      announce(`Condizione risolta: ${template.label}.`, 'polite')
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeConditionIds, activeConditionsKey, announce])
}