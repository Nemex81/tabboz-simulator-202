// STEP 13.5 — wiring onOpenStreetRace
// TASK-B — job system gateway + executor
import { useCallback, useRef } from 'react'
import { BetInfo, generateStreetRace } from '@/lib/bet-system'
import {
  GameStats,
  GameTime,
  Relationship,
  LogEntryType,
  GameLogEntry,
  GameDate,
  DayPhase,
  DayType,
} from '@/lib/types'
import { clampStat } from '@/lib/game-utils'
import { ECONOMY } from '@/lib/game-balance.constants'
import { playSound } from '@/lib/sound-effects'
import {
  JOBS,
  JobId,
  JobDefinition,
  getJobsForContext,
  getJobBlockedReason,
} from '@/lib/job-system'

interface UseEconomyActionsParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  gameTime: GameTime
  consumeAction: () => void
  announce: (msg: string, priority?: 'polite' | 'assertive') => void
  triggerRandomEvent: (actionType?: string) => void
  checkForNewFriend: (location: string) => void
  checkForNewRelationship: (metAt?: Relationship['metAt']) => void
  checkForNewGirlfriend: (metAt?: Relationship['metAt']) => void
  addLogEntry: (
    type: LogEntryType,
    title: string,
    description: string,
    result: GameLogEntry['result'],
    date: GameDate,
    phase: DayPhase
  ) => void
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
  marinatoOggi: boolean
  onOpenStreetRace?: (betInfo: BetInfo) => void
  onOpenJobSelection?: (jobs: JobDefinition[]) => void
  onOpenGarage?: () => void
}

export function useEconomyActions({
  stats,
  onOpenGarage,
  setStats,
  gameTime,
  consumeAction,
  announce,
  triggerRandomEvent,
  checkForNewFriend,
  checkForNewRelationship,
  checkForNewGirlfriend,
  addLogEntry,
  currentPhase,
  dayType,
  phaseActionsRemaining,
  marinatoOggi,
  onOpenStreetRace,
  onOpenJobSelection,
}: UseEconomyActionsParams) {
  const statsRef = useRef(stats)
  statsRef.current = stats
  const gameTimeRef = useRef(gameTime)
  gameTimeRef.current = gameTime
  const phaseActionsRemainingRef = useRef(phaseActionsRemaining)
  phaseActionsRemainingRef.current = phaseActionsRemaining
  const currentPhaseRef = useRef(currentPhase)
  currentPhaseRef.current = currentPhase
  const dayTypeRef = useRef(dayType)
  dayTypeRef.current = dayType
  const marinatoOggiRef = useRef(marinatoOggi)
  marinatoOggiRef.current = marinatoOggi
  const onOpenStreetRaceRef = useRef(onOpenStreetRace)
  onOpenStreetRaceRef.current = onOpenStreetRace
  const onOpenJobSelectionRef = useRef(onOpenJobSelection)
  onOpenJobSelectionRef.current = onOpenJobSelection
  const onOpenGarageRef = useRef(onOpenGarage)
  onOpenGarageRef.current = onOpenGarage

  // TASK-B: gateway — apre il dialog di selezione lavoro
  const handleLavoro = useCallback(() => {
    const gt = gameTimeRef.current
    const phase = currentPhaseRef.current
    const dayTypeVal = dayTypeRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    // Blocca durante ore scolastiche del mattino
    if (dayTypeVal === 'feriale' && phase === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi lavorare adesso.', 'assertive')
      return
    }
    const jobs = getJobsForContext(phase, dayTypeVal)
    if (jobs.length === 0) {
      playSound.failure()
      announce('Non ci sono lavori disponibili in questa fascia oraria.', 'assertive')
      return
    }
    playSound.buttonClick()
    onOpenJobSelectionRef.current?.(jobs)
  }, [announce])

  // TASK-B: executor — esegue il lavoro selezionato dal dialog
  const handleJobSelection = useCallback((jobId: JobId) => {
    const s = statsRef.current
    const job = JOBS[jobId]
    if (!job) return
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Sei troppo stanco per lavorare! Riposa prima.', 'assertive')
      return
    }
    if (gameTimeRef.current.schoolYear.currentYear < job.minSchoolYear) {
      playSound.failure()
      announce(`Non puoi fare questo lavoro: richiede almeno il ${job.minSchoolYear}° anno.`, 'assertive')
      return
    }
    if (!job.allowedPhases.includes(currentPhaseRef.current) || !job.allowedDayTypes.includes(dayTypeRef.current)) {
      playSound.failure()
      announce('Questo lavoro non è disponibile in questa fascia oraria.', 'assertive')
      return
    }
    const reason = getJobBlockedReason(job, s, { schoolYear: gameTimeRef.current.schoolYear.currentYear })
    if (reason) {
      playSound.failure()
      announce(`Non puoi fare questo lavoro: ${reason}`, 'assertive')
      return
    }
    playSound.buttonClick()
    playSound.moneyEarned()
    setStats((current) => {
      let next: GameStats = { ...current }
      // Applica effetti numerici delle statistiche
      for (const [k, v] of Object.entries(job.statEffects as Record<string, unknown>)) {
        if (typeof v !== 'number') continue
        const cur = (next as unknown as Record<string, unknown>)[k]
        if (typeof cur !== 'number') continue
        const maxVal = k === 'soldi' ? 1000 : k === 'media' ? 10 : 100
        next = { ...next, [k]: clampStat(cur + v, 0, maxVal) } as GameStats
      }
      // Aggiungi la paga del turno
      next = { ...next, soldi: clampStat(next.soldi + job.payPerShift, 0, 1000) }
      return next
    })
    consumeAction()
    announce(`Turno completato: ${job.label}. +${job.payPerShift}€. ${job.description}.`)
    addLogEntry(
      'action_neutral',
      `Lavoro: ${job.label}`,
      `Turno completato come ${job.label}. +${job.payPerShift}€; effetti: ${Object.entries(job.statEffects)
        .filter(([, value]) => typeof value === 'number')
        .map(([key, value]) => `${key} ${(value as number) > 0 ? '+' : ''}${value}`)
        .join(', ') || 'nessuno'}`,
      'positive',
      gameTimeRef.current.currentDate,
      currentPhaseRef.current
    )
    triggerRandomEvent('lavoro')
  }, [setStats, consumeAction, announce, triggerRandomEvent, addLogEntry])

  const handleMotorino = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    // C1-5: blocca durante ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi farlo adesso.', 'assertive')
      return
    }
    // STEP 13.5 — gara motorino sera/sabato
    if (s.hasMotorino && (dayTypeRef.current === 'sabato' || dayTypeRef.current === 'festivo')
      && currentPhaseRef.current === 'sera'
      && onOpenStreetRaceRef.current) {
      const race = generateStreetRace(s.reputazione)
      consumeAction()
      announce('Una GARA ti aspetta! Qualcuno vuole sfidarti stasera...')
      addLogEntry('event_neutral', 'Sfida in gara di motorini', 'Una sfida diretta stasera!', 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
      onOpenStreetRaceRef.current(race)
      return
    }
    if (onOpenGarageRef.current) {
      onOpenGarageRef.current()
    }
  }, [announce, consumeAction, addLogEntry])

  const handleShoppingMall = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    // C1-5: blocca durante ore scolastiche del mattino
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi farlo adesso.', 'assertive')
      return
    }
    if (s.soldi < ECONOMY.SHOPPING_COSTO) {
      playSound.failure()
      announce(`Non hai abbastanza GRANA per fare shopping! Servono ${ECONOMY.SHOPPING_COSTO}€`, 'assertive')
      return
    }
    playSound.buttonClick()
    playSound.statIncrease()
    setStats((current) => ({
      ...current,
      figosita: clampStat(current.figosita + 20),
      coattaggine: clampStat(current.coattaggine + 10),
      carisma: clampStat(current.carisma + 5),
      soldi: clampStat(current.soldi - ECONOMY.SHOPPING_COSTO, 0, 1000)
    }))
    consumeAction()
    announce(`Hai comprato VESTITI FICHISSIMI! Ora sei una BOMBA! +20 Figosità, +10 Coattaggine, +5 Carisma, -${ECONOMY.SHOPPING_COSTO} Soldi`)
    checkForNewFriend('al centro commerciale')
    checkForNewRelationship('quartiere')
    checkForNewGirlfriend('quartiere')
    triggerRandomEvent()
    addLogEntry('action_neutral', 'Shopping al centro commerciale', `Hai comprato VESTITI FICHISSIMI! Ora sei una BOMBA! +20 Figosità, +10 Coattaggine, +5 Carisma, -${ECONOMY.SHOPPING_COSTO} Soldi`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, consumeAction, announce, triggerRandomEvent, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend, addLogEntry])

  return {
    handleLavoro,
    handleJobSelection,
    handleMotorino,
    handleShoppingMall,
  }
}
