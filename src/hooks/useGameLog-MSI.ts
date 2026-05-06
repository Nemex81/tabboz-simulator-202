import { useCallback } from 'react'
import { useKV } from '@/hooks/useHydratedKV'
import { GameLogEntry, GameDate, DayPhase, DayPhaseLabel, LogEntryType, MAX_LOG_ENTRIES } from '@/lib/types'

let _logCounter = 0

function generateLogId(): string {
  _logCounter++
  return `log_${Date.now()}_${_logCounter}`
}

function phaseToLabel(phase: DayPhase): DayPhaseLabel {
  const map: Record<DayPhase, DayPhaseLabel> = {
    mattina: 'Mattina',
    pomeriggio: 'Pomeriggio',
    sera: 'Sera',
    notte: 'Notte',
  }
  return map[phase]
}

export function useGameLog() {
  const [gameLog, setGameLog] = useKV<GameLogEntry[]>('tabboz-game-log', [])

  const addLogEntry = useCallback((
    type: LogEntryType,
    title: string,
    description: string,
    result: GameLogEntry['result'],
    date: GameDate,
    phase: DayPhase
  ): void => {
    const entry: GameLogEntry = {
      id: generateLogId(),
      type,
      phase: phaseToLabel(phase),
      date,
      title,
      description,
      result,
    }
    setGameLog((prev) => {
      const currentLog = prev ?? []
      const updated = [entry, ...currentLog]
      return updated.slice(0, MAX_LOG_ENTRIES)
    })
  }, [])

  const clearLog = useCallback(() => setGameLog([]), [])

  return { gameLog: gameLog ?? [], addLogEntry, clearLog }
}
