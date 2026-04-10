import { useCallback, useRef } from 'react'
import { useKV } from '@/hooks/useHydratedKV'
import {
  GameStats,
  GameDate,
  DayPhase,
  HealthConditionId,
  HealthRecord,
  ActiveCondition,
  DEFAULT_HEALTH_RECORD,
  HEALTH_CONDITIONS,
  LogEntryType,
  GameLogEntry,
} from '@/lib/types'
import { clampStat } from '@/lib/game-utils'

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Aggiunge `days` giorni a una GameDate (overflow semplificato 30 giorni/mese). */
function addDaysToDate(date: GameDate, days: number): GameDate {
  let { day, month, year } = date
  day += days
  while (day > 30) {
    day -= 30
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }
  return { ...date, day, month, year }
}

/** Restituisce true se `current` è uguale o successivo a `target`. */
function isDateReached(current: GameDate, target: GameDate): boolean {
  if (current.year !== target.year) return current.year > target.year
  if (current.month !== target.month) return current.month > target.month
  return current.day >= target.day
}

// ── Ciclo mestruale — durata ciclo 28 gg, sintomi per 5 gg ───────────────────
const CICLO_INTERVAL_DAYS = 28
const CICLO_ONSET_WINDOW = 2 // ±giorni di tolleranza per l'auto-onset

interface UseHealthSystemParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  playerGender: 'maschio' | 'femmina'
  addLogEntry: (
    type: LogEntryType,
    title: string,
    description: string,
    result: GameLogEntry['result'],
    date: GameDate,
    phase: DayPhase
  ) => void
}

export function useHealthSystem({
  stats,
  setStats,
  playerGender,
  addLogEntry,
}: UseHealthSystemParams) {
  const [healthRecord, setHealthRecord] = useKV<HealthRecord>(
    'tabboz-health-record',
    DEFAULT_HEALTH_RECORD
  )

  const statsRef = useRef(stats)
  statsRef.current = stats
  const healthRecordRef = useRef<HealthRecord | undefined>(healthRecord)
  healthRecordRef.current = healthRecord
  // ── applyCondition ────────────────────────────────────────────
  const applyCondition = useCallback(
    (id: HealthConditionId, currentDate: GameDate, currentPhase: DayPhase) => {
      const template = HEALTH_CONDITIONS[id]
      if (!template) return

      // Guard: restrizione di genere
      if (template.genderRestricted && playerGender !== template.genderRestricted) return

      // Guard: condizione già attiva
      if ((healthRecordRef.current ?? DEFAULT_HEALTH_RECORD).conditions.some((c) => c.id === id)) return

      // Calcola e applica debuff one-shot (non cumulative)
      const appliedModifiers: Partial<Record<keyof GameStats, number>> = {}
      if (!template.cumulative) {
        setStats((prev) => {
          const next = { ...prev }
          for (const [key, mod] of Object.entries(template.statModifiers)) {
            const k = key as keyof GameStats
            const maxVal = k === 'soldi' ? 1000 : 100
            const before = next[k] as number
            const after = clampStat((before as number) + (mod as number), 0, maxVal)
            ;(next as unknown as Record<string, number>)[k] = after
            appliedModifiers[k] = after - before
          }
          return next
        })
      }

      const newCondition: ActiveCondition = {
        id,
        startDate: currentDate,
        daysElapsed: 0,
        appliedModifiers: template.cumulative ? {} : appliedModifiers,
      }

      setHealthRecord((prev) => ({
        ...(prev ?? DEFAULT_HEALTH_RECORD),
        conditions: [...(prev ?? DEFAULT_HEALTH_RECORD).conditions, newCondition],
      }))

      addLogEntry(
        'health',
        `${template.label} — insorgenza`,
        `${template.description} (gravità: ${template.severity})`,
        template.severity === 'lieve' ? 'neutral' : 'negative',
        currentDate,
        currentPhase
      )
    },
    [playerGender, setStats, setHealthRecord, addLogEntry]
  )

  // ── removeCondition ───────────────────────────────────────────
  const removeCondition = useCallback(
    (id: HealthConditionId, currentDate: GameDate, currentPhase: DayPhase) => {
      const template = HEALTH_CONDITIONS[id]
      const condition = (healthRecordRef.current ?? DEFAULT_HEALTH_RECORD).conditions.find((c) => c.id === id)
      if (!condition || !template) return

      // Ripristina debuff one-shot (solo condizioni non cumulative)
      if (!template.cumulative && Object.keys(condition.appliedModifiers).length > 0) {
        setStats((prev) => {
          const next = { ...prev }
          for (const [key, mod] of Object.entries(condition.appliedModifiers)) {
            const k = key as keyof GameStats
            const maxVal = k === 'soldi' ? 1000 : 100
            ;(next as unknown as Record<string, number>)[k] = clampStat(
              (next[k] as number) - (mod as number),
              0,
              maxVal
            )
          }
          return next
        })
      }

      setHealthRecord((prev) => ({
        ...(prev ?? DEFAULT_HEALTH_RECORD),
        conditions: (prev ?? DEFAULT_HEALTH_RECORD).conditions.filter((c) => c.id !== id),
      }))

      addLogEntry(
        'health',
        `${template.label} — guarigione`,
        `Sei guarito da: ${template.label}. I malus sono stati rimossi.`,
        'positive',
        currentDate,
        currentPhase
      )
    },
    [setStats, setHealthRecord, addLogEntry]
  )

  // ── tickConditions ────────────────────────────────────────────
  // Chiamato una volta al giorno da advanceToNextDay
  const tickConditions = useCallback(
    (currentDate: GameDate) => {
      const currentConditions = (healthRecordRef.current ?? DEFAULT_HEALTH_RECORD).conditions
      if (currentConditions.length === 0) return

      const toRemove: HealthConditionId[] = []

      // FIX1: calcola updatedConditions FUORI dal setter per evitare
      // side-effect (setStats) annidati dentro setHealthRecord — unsafe in StrictMode
      const updatedConditions = currentConditions.map((c) => {
        const template = HEALTH_CONDITIONS[c.id]
        if (!template) return c
        const updated = { ...c, daysElapsed: c.daysElapsed + 1 }

        // Condizioni cumulative: applica danno giornaliero
        if (template.cumulative) {
          setStats((s) => {
            const next = { ...s }
            for (const [key, mod] of Object.entries(template.statModifiers)) {
              const k = key as keyof GameStats
              const maxVal = k === 'soldi' ? 1000 : 100
              ;(next as unknown as Record<string, number>)[k] = clampStat(
                (next[k] as number) + (mod as number),
                0,
                maxVal
              )
            }
            return next
          })
        }

        // Check durata finita
        if (template.durationDays !== null && updated.daysElapsed >= template.durationDays) {
          toRemove.push(c.id)
        }

        // Check auto-resolve
        if (template.autoResolve) {
          const s = statsRef.current
          const shouldResolve =
            (template.autoResolve.check === 'stress_low' && s.stress < template.autoResolve.threshold) ||
            (template.autoResolve.check === 'morale_high' && s.morale > template.autoResolve.threshold)
          if (shouldResolve) {
            toRemove.push(c.id)
          }
        }

        return updated
      })

      // FIX1: setter puro — nessun side-effect al suo interno
      setHealthRecord((prev) => ({ ...(prev ?? DEFAULT_HEALTH_RECORD), conditions: updatedConditions }))

      // Rimuovi condizioni scadute fuori dal setter per evitare nesting
      for (const id of toRemove) {
        removeCondition(id, currentDate, 'mattina')
      }

      // ── STEP 9E: Ciclo mestruale (solo femmina) ─────────────────
      if (playerGender === 'femmina') {
        const rec = healthRecordRef.current ?? DEFAULT_HEALTH_RECORD
        const hasCiclo = rec.conditions.some((c) => c.id === 'ciclo_mestruale')

        if (!hasCiclo) {
          const nextCycle = rec.nextCycleDate
          if (!nextCycle) {
            // Prima esecuzione: programma il primo ciclo tra 14 giorni
            setHealthRecord((prev) => ({
              ...(prev ?? DEFAULT_HEALTH_RECORD),
              nextCycleDate: addDaysToDate(currentDate, CICLO_INTERVAL_DAYS / 2),
            }))
          } else if (isDateReached(currentDate, nextCycle)) {
            // È arrivato il giorno del ciclo
            applyCondition('ciclo_mestruale', currentDate, 'mattina')
            // Programma il prossimo tra 28 giorni
            setHealthRecord((prev) => ({
              ...(prev ?? DEFAULT_HEALTH_RECORD),
              nextCycleDate: addDaysToDate(currentDate, CICLO_INTERVAL_DAYS),
            }))
          }
        }

        // ── Gravidanza: milestone ogni 30 gg ────────────────────────
        const gravidanza = rec.conditions.find((c) => c.id === 'gravidanza')
        if (gravidanza) {
          const milestone = gravidanza.daysElapsed
          if (milestone === 90) {
            addLogEntry('health', 'Gravidanza — 3° mese', '🤰 Tre mesi di gravidanza. Il tuo corpo sta cambiando.', 'neutral', currentDate, 'mattina')
          } else if (milestone === 180) {
            addLogEntry('health', 'Gravidanza — 6° mese', '🤰 Sei mesi di gravidanza. Presto dovrai prendere decisioni importanti.', 'neutral', currentDate, 'mattina')
          }
        }
      }
    },
    [setHealthRecord, setStats, removeCondition, playerGender, applyCondition, addLogEntry]
  )

  // ── checkAutoConditions ───────────────────────────────────────
  // Chiamato ogni avanzamento di fase da advancePhaseOnly
  const checkAutoConditions = useCallback(
    (currentDate: GameDate, currentPhase: DayPhase) => {
      const s = statsRef.current
      const activeIds = new Set((healthRecordRef.current ?? DEFAULT_HEALTH_RECORD).conditions.map((c) => c.id))

      for (const template of Object.values(HEALTH_CONDITIONS)) {
        if (!template.autoOnset) continue
        if (template.genderRestricted && playerGender !== template.genderRestricted) continue
        if (activeIds.has(template.id)) continue

        const shouldOnset =
          (template.autoOnset.check === 'stress_high' && s.stress > template.autoOnset.threshold) ||
          (template.autoOnset.check === 'morale_low' && s.morale < template.autoOnset.threshold)

        if (shouldOnset) {
          applyCondition(template.id, currentDate, currentPhase)
        }
      }
    },
    [playerGender, applyCondition]
  )

  // ── canAttendSchool ───────────────────────────────────────────
  const canAttendSchool = useCallback((): boolean => {
    return !(healthRecordRef.current ?? DEFAULT_HEALTH_RECORD).conditions.some((c) => {
      const template = HEALTH_CONDITIONS[c.id]
      return template?.forcesAbsence === true
    })
  }, [])

  return {
    healthRecord,
    setHealthRecord,
    applyCondition,
    removeCondition,
    tickConditions,
    checkAutoConditions,
    canAttendSchool,
  }
}
