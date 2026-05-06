import { useCallback, useRef } from 'react'
import {
  GameStats,
  GameTime,
  Relationship,
  SchoolRecord,
  DayPhase,
  DayType,
  LogEntryType,
  GameLogEntry,
  GameDate,
  HealthConditionId,
} from '@/lib/types'
import { clampStat } from '@/lib/game-utils'
import { ECONOMY } from '@/lib/game-balance.constants'
import { playSound } from '@/lib/sound-effects'

interface UseLifestyleActionsParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  gameTime: GameTime
  schoolRecord: SchoolRecord
  setSchoolRecord: (updater: ((prev: SchoolRecord) => SchoolRecord) | SchoolRecord) => void
  consumeAction: () => void
  announce: (msg: string, priority?: 'polite' | 'assertive') => void
  triggerRandomEvent: () => void
  checkForNewFriend: (location: string) => void
  checkForNewRelationship: (metAt?: Relationship['metAt']) => void
  gainExtraAction: () => void
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
  marinatoOggi: boolean
  addLogEntry: (
    type: LogEntryType,
    title: string,
    description: string,
    result: GameLogEntry['result'],
    date: GameDate,
    phase: DayPhase
  ) => void
  applyCondition: (
    id: HealthConditionId,
    currentDate: GameDate,
    currentPhase: DayPhase
  ) => void
}

export function useLifestyleActions({
  stats,
  setStats,
  gameTime,
  schoolRecord: _schoolRecord,
  setSchoolRecord,
  consumeAction,
  announce,
  triggerRandomEvent,
  checkForNewFriend,
  checkForNewRelationship,
  gainExtraAction,
  currentPhase,
  dayType,
  phaseActionsRemaining,
  marinatoOggi,
  addLogEntry,
  applyCondition,
}: UseLifestyleActionsParams) {
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

  const handlePalestra = useCallback(() => {
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
    if (s.soldi < ECONOMY.PALESTRA_COSTO) {
      playSound.failure()
      announce(`Non hai abbastanza GRANA per la palestra! Servono ${ECONOMY.PALESTRA_COSTO}€`, 'assertive')
      return
    }
    playSound.buttonClick()
    playSound.statIncrease()
    setStats((current) => ({
      ...current,
      muscoli: clampStat(current.muscoli + 10),
      figosita: clampStat(current.figosita + 5),
      soldi: clampStat(current.soldi - ECONOMY.PALESTRA_COSTO, 0, 1000),
      stanchezza: clampStat(current.stanchezza + 15),
      morale: clampStat(current.morale + 5)
    }))
    consumeAction()
    announce(`Hai pompato FERRO! +10 Muscoli, +5 Figosità, -${ECONOMY.PALESTRA_COSTO} Soldi, +15 Stanchezza`)
    addLogEntry('action_neutral', 'Sessione in palestra', `Hai pompato FERRO! +10 Muscoli, +5 Figosità, -${ECONOMY.PALESTRA_COSTO} Soldi, +15 Stanchezza`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    checkForNewFriend('in palestra')
    checkForNewRelationship('palestra')
    triggerRandomEvent()
    // STEP 9C: rischio infortunio da palestra
    const injuryRoll = Math.random()
    if (injuryRoll < 0.02) {
      applyCondition('infortunio_grave', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else if (injuryRoll < 0.12) {
      applyCondition('infortunio_lieve', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setStats, consumeAction, announce, triggerRandomEvent, checkForNewFriend, checkForNewRelationship, addLogEntry, applyCondition])

  const handleLampada = useCallback(() => {
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    // Fix2: lampada non disponibile la mattina feriale (sei a scuola)
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina') {
      playSound.failure()
      announce('Vai a scuola! Non è ora di abbronzature.', 'assertive')
      return
    }
    if (s.soldi < ECONOMY.LAMPADA_COSTO) {
      playSound.failure()
      announce(`Non hai abbastanza GRANA per la lampada! Servono ${ECONOMY.LAMPADA_COSTO}€`, 'assertive')
      return
    }
    playSound.buttonClick()
    playSound.statIncrease()
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 15),
      figosita: clampStat(current.figosita + 10),
      soldi: clampStat(current.soldi - ECONOMY.LAMPADA_COSTO, 0, 1000)
    }))
    consumeAction()
    announce(`Ora sei ABBRONZATISSIMO! +15 Coattaggine, +10 Figosità, -${ECONOMY.LAMPADA_COSTO} Soldi`)
    addLogEntry('action_neutral', 'Lampada abbronzante', `Ora sei ABBRONZATISSIMO! +15 Coattaggine, +10 Figosità, -${ECONOMY.LAMPADA_COSTO} Soldi`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, addLogEntry])

  const handleRiposa = useCallback(() => {
    // A1: riposa non disponibile durante la mattina scolastica feriale
    const gt = gameTimeRef.current
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Non puoi riposare adesso.', 'assertive')
      return
    }
    // A7: riposa disponibile solo in pomeriggio, sera o mattina non-feriale
    const ph = currentPhaseRef.current
    const dt = dayTypeRef.current
    const isRestAllowed = ph === 'pomeriggio' || ph === 'sera' || (ph === 'mattina' && dt !== 'feriale')
    if (!isRestAllowed) {
      playSound.failure()
      announce('Il riposo parziale è disponibile solo al pomeriggio, alla sera o la mattina nei giorni non scolastici!', 'assertive')
      return
    }
    // A7: recupero parziale 25-35%
    const recoveryPct = 0.25 + Math.random() * 0.10
    playSound.buttonClick()
    setStats((current) => ({
      ...current,
      stanchezza: clampStat(current.stanchezza - Math.round(current.stanchezza * recoveryPct)),
      stress: clampStat(current.stress - 10),
      morale: clampStat(current.morale + 3)
    }))
    announce(`Hai riposato un po'! Recuperato il ${Math.round(recoveryPct * 100)}% di Stanchezza`)
    addLogEntry('action_neutral', `Riposo ${currentPhaseRef.current === 'mattina' ? 'mattutino' : currentPhaseRef.current === 'pomeriggio' ? 'pomeridiano' : 'serale'}`, `Hai riposato un po'! Recuperato il ${Math.round(recoveryPct * 100)}% di Stanchezza`, 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, announce, addLogEntry])

  const handleMarina = useCallback(() => {
    const gt = gameTimeRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    if (!(dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina' && gt.schoolYear.isSchoolPeriod)) {
      playSound.failure()
      announce('Puoi marinare solo la mattina di un giorno scolastico!', 'assertive')
      return
    }
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 5),
    }))
    setSchoolRecord((prev) => ({
      ...prev,
      assenze: prev.assenze + 1,
      consecutiveGoodDays: 0,
      wentToSchoolToday: true,
    }))
    gainExtraAction()
    consumeAction()
    playSound.buttonClick()
    announce("Hai MARINATO la scuola! +1 Assenza, +5 Coattaggine, guadagni un'azione extra. Goditi la libertà... per ora.")
    addLogEntry('school', 'Marinato la scuola', "Hai MARINATO la scuola! +1 Assenza, +5 Coattaggine, guadagni un'azione extra. Goditi la libertà... per ora.", 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, setSchoolRecord, gainExtraAction, consumeAction, announce, addLogEntry])

  return {
    handlePalestra,
    handleLampada,
    handleRiposa,
    handleMarina,
  }
}
