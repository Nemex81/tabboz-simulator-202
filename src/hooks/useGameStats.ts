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

  return {
    stats,
    setStats: setRawStats
  }
}
