import { useCallback, useRef } from 'react'
import {
  GameStats,
  SubjectGrades,
  GameTime,
  LogEntryType,
  GameLogEntry,
  GameDate,
  DayPhase,
} from '@/lib/types'
import { Ragazza, performGirlfriendAction, shouldGirlfriendBreakup } from '@/lib/girlfriend-system'
import { clampStat } from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'

interface UseGirlfriendActionsParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  grades: SubjectGrades
  setGrades: (updater: ((prev: SubjectGrades) => SubjectGrades) | SubjectGrades) => void
  gameTime: GameTime
  girlfriend: Ragazza | null
  setGirlfriend: (v: Ragazza | null | ((prev: Ragazza | null) => Ragazza | null)) => void
  consumeAction: () => void
  announce: (msg: string, priority?: 'polite' | 'assertive') => void
  addLogEntry: (
    type: LogEntryType,
    title: string,
    description: string,
    result: GameLogEntry['result'],
    date: GameDate,
    phase: DayPhase
  ) => void
  currentPhase: DayPhase
  phaseActionsRemaining: number
}

export function useGirlfriendActions({
  stats,
  setStats,
  grades,
  setGrades,
  gameTime,
  girlfriend,
  setGirlfriend,
  consumeAction,
  announce,
  addLogEntry,
  currentPhase,
  phaseActionsRemaining,
}: UseGirlfriendActionsParams) {
  const statsRef = useRef(stats)
  statsRef.current = stats
  const gradesRef = useRef(grades)
  gradesRef.current = grades
  const gameTimeRef = useRef(gameTime)
  gameTimeRef.current = gameTime
  const girlfriendRef = useRef(girlfriend)
  girlfriendRef.current = girlfriend
  const phaseActionsRemainingRef = useRef(phaseActionsRemaining)
  phaseActionsRemainingRef.current = phaseActionsRemaining
  const currentPhaseRef = useRef(currentPhase)
  currentPhaseRef.current = currentPhase

  // B1-FIX-4: limita messaggi alla ragazza a 1 per fascia oraria
  const messaggioUsatoRef = useRef(false)
  const lastPhaseRef = useRef(currentPhase)
  if (currentPhase !== lastPhaseRef.current) {
    lastPhaseRef.current = currentPhase
    messaggioUsatoRef.current = false
  }

  // B1-FIX-4 applicato
  const handleGirlfriendAction = useCallback((action: string) => {
    const gf = girlfriendRef.current
    if (!gf) return
    const gt = gameTimeRef.current
    if (phaseActionsRemainingRef.current <= 0 && action !== 'messaggio') {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    // B1-FIX-4: messaggio — un solo messaggio gratuito per fascia oraria
    if (action === 'messaggio' && messaggioUsatoRef.current) {
      playSound.failure()
      announce('Hai già mandato un messaggio in questa fascia oraria! Non essere troppo appiccicoso.')
      return
    }
    if (action === 'messaggio') {
      messaggioUsatoRef.current = true
    }
    const currentDateString = `${gt.currentDate.day}/${gt.currentDate.month}/${gt.currentDate.year}`
    const s = statsRef.current
    const g = gradesRef.current
    const result = performGirlfriendAction(action, s, gf, currentDateString)
    setGirlfriend(result.updatedGirlfriend)
    if (result.statChanges) {
      setStats((current) => {
        const updated = { ...current }
        Object.entries(result.statChanges).forEach(([key, value]) => {
          if (typeof value !== 'number') return
          const statKey = key as keyof GameStats
          if (statKey === 'soldi') {
            ;(updated as unknown as Record<string, number>)[statKey] = clampStat((updated[statKey] as number) + value, 0, 1000)
          } else {
            ;(updated as unknown as Record<string, number>)[statKey] = clampStat((updated[statKey] as number) + value)
          }
        })
        return updated
      })
    }
    if (result.gradeChange && result.gradeChange > 0) {
      const subjects = Object.keys(g)
      subjects.forEach(subject => {
        setGrades((current) => ({
          ...current,
          [subject]: clampStat(current[subject] + result.gradeChange!, 0, 10)
        }))
      })
    }
    if (action !== 'messaggio') {
      consumeAction()
    }
    if (action === 'dichiarati' && result.updatedGirlfriend.relationshipStatus === 'fidanzata') {
      playSound.bigWin()
    } else if (action === 'dichiarati') {
      playSound.bigLoss()
    } else {
      playSound.success()
    }
    announce(result.message)
    const gfLogResult: 'positive' | 'negative' | 'neutral' = result.statChanges
      ? (Object.values(result.statChanges).filter((value): value is number => typeof value === 'number').reduce((a, b) => a + b, 0) > 0 ? 'positive'
        : Object.values(result.statChanges).filter((value): value is number => typeof value === 'number').reduce((a, b) => a + b, 0) < 0 ? 'negative'
         : 'neutral')
      : 'neutral'
    addLogEntry('social', `${action} con ${gf.nome}`, result.message, gfLogResult, gameTimeRef.current.currentDate, currentPhaseRef.current)
    if (shouldGirlfriendBreakup(result.updatedGirlfriend)) {
      playSound.gameOver()
      announce(`${gf.nome} ti ha lasciato! La relazione è finita...`)
      setGirlfriend(null)
    }
  }, [setGirlfriend, setStats, setGrades, consumeAction, announce, addLogEntry])

  const handleGirlfriendBreakup = useCallback(() => {
    const gf = girlfriendRef.current
    if (!gf) return
    playSound.failure()
    announce(`Hai lasciato ${gf.nome}. La storia è finita.`)
    setGirlfriend(null)
  }, [setGirlfriend, announce])

  return {
    handleGirlfriendAction,
    handleGirlfriendBreakup,
  }
}
