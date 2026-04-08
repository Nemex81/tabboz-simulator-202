// STEP 13.5 — wiring onOpenStreetRace
import { useCallback, useRef } from 'react'
import { BetInfo, generateStreetRace } from '@/lib/bet-system'
import {
  GameStats,
  GameTime,
  LogEntryType,
  GameLogEntry,
  GameDate,
  DayPhase,
  DayType,
} from '@/lib/types'
import { clampStat } from '@/lib/game-utils'
import { playSound } from '@/lib/sound-effects'

interface UseEconomyActionsParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  gameTime: GameTime
  consumeAction: () => void
  announce: (msg: string) => void
  triggerRandomEvent: () => void
  checkForNewFriend: (location: string) => void
  checkForNewRelationship: () => void
  checkForNewGirlfriend: () => void
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
}

export function useEconomyActions({
  stats,
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

  const handleLavoro = useCallback(() => {
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
    if (s.muscoli < 40) {
      playSound.failure()
      announce('Sei troppo SMILZO per fare il buttadifuori! Servono 40 Muscoli', 'assertive')
      return
    }
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per lavorare! Riposa!', 'assertive')
      return
    }
    playSound.buttonClick()
    playSound.moneyEarned()
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi + 80, 0, 1000),
      stanchezza: clampStat(current.stanchezza + 20),
      coattaggine: clampStat(current.coattaggine + 5)
    }))
    consumeAction()
    announce('Hai lavorato come BUTTADIFUORI! +80 Soldi, +5 Coattaggine, +20 Stanchezza')
    addLogEntry('action_neutral', 'Lavoro come buttafuori', 'Hai lavorato come BUTTADIFUORI! +80 Soldi, +5 Coattaggine, +20 Stanchezza', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    triggerRandomEvent()
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
    if (s.soldi < 50) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per truccare il motorino! Servono 50€', 'assertive')
      return
    }
    if (s.stanchezza > 80) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per trafficare col motorino! Riposa prima!', 'assertive')
      return
    }
    // STEP 13.5 — gara motorino sera/sabato
    if ((dayTypeRef.current === 'sabato' || dayTypeRef.current === 'festivo')
      && currentPhaseRef.current === 'sera'
      && onOpenStreetRaceRef.current) {
      const race = generateStreetRace(s.reputazione)
      consumeAction()
      announce('Una GARA ti aspetta! Qualcuno vuole sfidarti stasera...')
      addLogEntry('event_neutral', 'Sfida in gara di motorini', 'Una sfida diretta stasera!', 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
      onOpenStreetRaceRef.current(race)
      return
    }
    playSound.buttonClick()
    playSound.statIncrease()
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 20),
      figosita: clampStat(current.figosita + 15),
      soldi: clampStat(current.soldi - 50, 0, 1000)
    }))
    consumeAction()
    announce('Motorino TRUCCATO! Ora SGASA di brutto! +20 Coattaggine, +15 Figosità, -50 Soldi')
    addLogEntry('action_neutral', 'Motorino truccato', 'Motorino TRUCCATO! Ora SGASA di brutto! +20 Coattaggine, +15 Figosità, -50 Soldi', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, addLogEntry])

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
    if (s.soldi < 100) {
      playSound.failure()
      announce('Non hai abbastanza GRANA per fare shopping! Servono 100€', 'assertive')
      return
    }
    playSound.buttonClick()
    playSound.statIncrease()
    setStats((current) => ({
      ...current,
      figosita: clampStat(current.figosita + 20),
      coattaggine: clampStat(current.coattaggine + 10),
      carisma: clampStat(current.carisma + 5),
      soldi: clampStat(current.soldi - 100, 0, 1000)
    }))
    consumeAction()
    announce('Hai comprato VESTITI FICHISSIMI! Ora sei una BOMBA! +20 Figosità, +10 Coattaggine, +5 Carisma, -100 Soldi')
    checkForNewFriend('al centro commerciale')
    checkForNewRelationship()
    checkForNewGirlfriend()
    triggerRandomEvent()
    addLogEntry('action_neutral', 'Shopping al centro commerciale', 'Hai comprato VESTITI FICHISSIMI! Ora sei una BOMBA! +20 Figosità, +10 Coattaggine, +5 Carisma, -100 Soldi', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, consumeAction, announce, triggerRandomEvent, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend, addLogEntry])

  return {
    handleLavoro,
    handleMotorino,
    handleShoppingMall,
  }
}
