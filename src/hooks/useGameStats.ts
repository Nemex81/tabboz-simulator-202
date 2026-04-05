import { useEffect, useMemo, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { GameStats } from '@/lib/types'
import { DEFAULT_GAME_STATE } from '@/lib/types'
import { validateStats } from '@/lib/data-validation'
import {
  calculateReputationFromStats,
  getReputationLevel,
  clampStat
} from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'

export function useGameStats(announce: (msg: string) => void) {
  const [rawStats, setRawStats] = useKV<GameStats>('tabboz-stats', DEFAULT_GAME_STATE.stats)
  const stats = validateStats(rawStats)

  const prevReputationRef = useRef<number>(stats.reputazione)
  // Ref per stabilizzare announce nell'useEffect senza aggiungerla alle deps
  const announceRef = useRef(announce)
  announceRef.current = announce

  // A3: tracciamento automatico variazioni stat per screen reader
  const prevStatsRef = useRef<GameStats>(stats)
  const skipFirstStatChangeRef = useRef(true)

  // Memoizza il calcolo della reputazione — si ricalcola solo se le stat rilevanti cambiano
  const computedReputation = useMemo(
    () => calculateReputationFromStats(stats),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stats.coattaggine, stats.muscoli, stats.figosita, stats.soldi, stats.media, stats.carisma]
  )

  useEffect(() => {
    const newReputation = computedReputation
    const oldLevel = getReputationLevel(prevReputationRef.current)
    const newLevel = getReputationLevel(newReputation)

    if (Math.abs(newReputation - stats.reputazione) > 2) {
      setRawStats((current) => ({ ...current, reputazione: newReputation }))

      if (oldLevel !== newLevel) {
        playSound.reputationUp()
        announceRef.current(`CAMBIO DI REPUTAZIONE! Ora sei: ${newLevel}`)
      }
    }

    prevReputationRef.current = newReputation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedReputation])

  // A3: annuncio automatico cambiamenti stat ≥5 e soglie critiche
  useEffect(() => {
    if (skipFirstStatChangeRef.current) {
      skipFirstStatChangeRef.current = false
      prevStatsRef.current = stats
      return
    }
    const prev = prevStatsRef.current
    const curr = stats
    const ann = announceRef.current

    const tracked: Array<[keyof GameStats, string]> = [
      ['coattaggine', 'Coattaggine'],
      ['muscoli', 'Muscoli'],
      ['figosita', 'Figosità'],
      ['intelligenza', 'Intelligenza'],
      ['carisma', 'Carisma'],
    ]
    for (const [key, label] of tracked) {
      const delta = (curr[key] as number) - (prev[key] as number)
      if (Math.abs(delta) >= 5) {
        ann(`${label} ${delta > 0 ? 'aumentata' : 'diminuita'} di ${Math.abs(delta)}. Ora: ${curr[key]}`)
      }
    }
    const soldDelta = curr.soldi - prev.soldi
    if (soldDelta !== 0) {
      ann(`Soldi: ${soldDelta > 0 ? '+' : ''}${soldDelta}€. Totale: ${curr.soldi}€`)
    }
    if (curr.stanchezza > 80 && prev.stanchezza <= 80) {
      ann('ATTENZIONE: Stanchezza critica! Devi riposare prima di poter continuare.')
    }
    prevStatsRef.current = stats
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawStats])

  return {
    stats,
    setStats: setRawStats
  }
}
