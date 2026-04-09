import { useCallback, useRef } from 'react'
import {
  GameStats,
  GameTime,
  Relationship,
  Friend,
  DayPhase,
  DayType,
  LogEntryType,
  GameLogEntry,
  GameDate,
  HealthConditionId,
} from '@/lib/types'
import {
  clampStat,
  randomChance,
  getReputationEventModifier,
  getMentalStateModifiers,
} from '@/lib/game-utils'
import { ECONOMY } from '@/lib/game-balance.constants'
import { applyFriendActionEffects, FRIEND_ACTIONS } from '@/lib/enhanced-friend-system'
import { calculateRelationshipSuccess } from '@/lib/relationship-utils'
import { Ragazza, generateGirlfriendFromRelationship } from '@/lib/girlfriend-system'
import { playSound } from '@/lib/sound-effects'

interface UseSocialActionsParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  gameTime: GameTime
  friends: Friend[]
  setFriends: (updater: ((prev: Friend[]) => Friend[]) | Friend[]) => void
  relationships: Relationship[]
  setRelationships: (updater: ((prev: Relationship[]) => Relationship[]) | Relationship[]) => void
  setGirlfriend: (v: Ragazza | null | ((prev: Ragazza | null) => Ragazza | null)) => void
  consumeAction: () => void
  consumeInterazione: () => void
  announce: (msg: string) => void
  triggerRandomEvent: () => void
  checkForNewFriend: (location: string) => void
  checkForNewRelationship: () => void
  checkForNewGirlfriend: () => void
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
  canInteract: boolean
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

export function useSocialActions({
  stats,
  setStats,
  gameTime,
  friends,
  setFriends,
  relationships,
  setRelationships,
  setGirlfriend,
  consumeAction,
  consumeInterazione,
  announce,
  triggerRandomEvent,
  checkForNewFriend,
  checkForNewRelationship,
  checkForNewGirlfriend,
  currentPhase,
  dayType,
  phaseActionsRemaining,
  canInteract,
  marinatoOggi,
  addLogEntry,
  applyCondition,
}: UseSocialActionsParams) {
  const statsRef = useRef(stats)
  statsRef.current = stats
  const gameTimeRef = useRef(gameTime)
  gameTimeRef.current = gameTime
  const friendsRef = useRef(friends)
  friendsRef.current = friends
  const phaseActionsRemainingRef = useRef(phaseActionsRemaining)
  phaseActionsRemainingRef.current = phaseActionsRemaining
  const canInteractRef = useRef(canInteract)
  canInteractRef.current = canInteract
  const currentPhaseRef = useRef(currentPhase)
  currentPhaseRef.current = currentPhase
  const dayTypeRef = useRef(dayType)
  dayTypeRef.current = dayType
  const marinatoOggiRef = useRef(marinatoOggi)
  marinatoOggiRef.current = marinatoOggi

  const handleDisco = useCallback(() => {
    const gt = gameTimeRef.current
    const s = statsRef.current
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    // Fix2: discoteca non disponibile di mattina
    if (currentPhaseRef.current === 'mattina') {
      playSound.failure()
      announce('La discoteca di mattina?! Ci vuoi andare a quest\'ora?!', 'assertive')
      return
    }
    if (s.soldi < ECONOMY.DISCO_COSTO) {
      playSound.failure()
      announce(`Non hai abbastanza GRANA per entrare in discoteca! Servono ${ECONOMY.DISCO_COSTO}€`, 'assertive')
      return
    }
    if (s.stanchezza > 70) {
      playSound.failure()
      announce('Sei troppo DISTRUTTO per andare in disco! Riposa!', 'assertive')
      return
    }
    if (getMentalStateModifiers(s.stress ?? 0, s.morale ?? 60).isDiscoBlocked) {
      playSound.failure()
      announce('Sei troppo giù di morale per andare in disco!', 'assertive')
      addLogEntry('action_failure', 'Troppo giù per il disco', 'Sei troppo giù di morale per andare in disco!', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
      return
    }
    playSound.buttonClick()
    const reputationModifier = getReputationEventModifier(s.reputazione)
    const successChance = Math.min(85, Math.max(20,
      (s.figosita * 0.4) +
      (s.coattaggine * 0.3) +
      (s.muscoli * 0.2) +
      (s.carisma * 0.25) +
      reputationModifier.positiveOutcomeBonus
    ))
    if (randomChance(successChance)) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 25),
        coattaggine: clampStat(current.coattaggine + 15),
        carisma: clampStat(current.carisma + 10),
        soldi: clampStat(current.soldi - ECONOMY.DISCO_COSTO, 0, 1000),
        stanchezza: clampStat(current.stanchezza + 25),
        stress: clampStat(current.stress - 20),
        morale: clampStat(current.morale + 15)
      }))
      announce(`Serata EPICA in disco! Hai fatto STRAGE! +25 Figosità, +15 Coattaggine, +10 Carisma, -${ECONOMY.DISCO_COSTO} Soldi, +25 Stanchezza`)
      addLogEntry('action_success', 'Serata epica in disco', `Serata EPICA in disco! Hai fatto STRAGE! +25 Figosità, +15 Coattaggine, +10 Carisma, -${ECONOMY.DISCO_COSTO} Soldi, +25 Stanchezza`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.failure()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 10),
        soldi: clampStat(current.soldi - ECONOMY.DISCO_COSTO, 0, 1000),
        stanchezza: clampStat(current.stanchezza + 20),
        stress: clampStat(current.stress - 5),
        morale: clampStat(current.morale - 10)
      }))
      announce(`Serata SCARSA in disco! Nessuno ti ha filato! -10 Figosità, -${ECONOMY.DISCO_COSTO} Soldi, +20 Stanchezza`)
      addLogEntry('action_failure', 'Serata scarsa in disco', `Serata SCARSA in disco! Nessuno ti ha filato! -10 Figosità, -${ECONOMY.DISCO_COSTO} Soldi, +20 Stanchezza`, 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
    consumeAction()
    checkForNewFriend('in discoteca')
    checkForNewRelationship()
    checkForNewGirlfriend()
    triggerRandomEvent()
    // STEP 9C: rischio sbornia dopo la discoteca
    if (Math.random() < 0.15) {
      applyCondition('sbornia', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setStats, consumeAction, announce, triggerRandomEvent, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend, addLogEntry, applyCondition])

  const handleCinema = useCallback(() => {
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
    if (s.soldi < ECONOMY.CINEMA_COSTO) {
      playSound.failure()
      announce(`Non hai abbastanza GRANA per il cinema! Servono ${ECONOMY.CINEMA_COSTO}€`, 'assertive')
      return
    }
    playSound.buttonClick()
    const reputationModifier = getReputationEventModifier(s.reputazione)
    const successChance = Math.min(85, Math.max(20,
      (s.figosita * 0.4) +
      (s.carisma * 0.3) +
      reputationModifier.positiveOutcomeBonus
    ))
    if (randomChance(successChance)) {
      playSound.success()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 10),
        carisma: clampStat(current.carisma + 10),
        soldi: clampStat(current.soldi - ECONOMY.CINEMA_COSTO, 0, 1000),
        stanchezza: clampStat(current.stanchezza - 10),
        stress: clampStat(current.stress - 10),
        morale: clampStat(current.morale + 10)
      }))
      announce(`Film SPETTACOLARE! Serata fantastica! +10 Figosità, +10 Carisma, -${ECONOMY.CINEMA_COSTO} Soldi, -10 Stanchezza`)
      addLogEntry('action_success', 'Film spettacolare', `Film SPETTACOLARE! Serata fantastica! +10 Figosità, +10 Carisma, -${ECONOMY.CINEMA_COSTO} Soldi, -10 Stanchezza`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.failure()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - ECONOMY.CINEMA_COSTO, 0, 1000),
        stanchezza: clampStat(current.stanchezza - 15),
        stress: clampStat(current.stress - 10),
        morale: clampStat(current.morale + 10)
      }))
      announce(`Hai visto un bel film! Serata tranquilla. -${ECONOMY.CINEMA_COSTO} Soldi, -15 Stanchezza`)
      addLogEntry('action_neutral', 'Serata al cinema', `Hai visto un bel film! Serata tranquilla. -${ECONOMY.CINEMA_COSTO} Soldi, -15 Stanchezza`, 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
    consumeAction()
    checkForNewFriend('al cinema')
    checkForNewRelationship()
    checkForNewGirlfriend()
    triggerRandomEvent()
  }, [setStats, consumeAction, announce, triggerRandomEvent, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend, addLogEntry])

  const handleTryRelationship = useCallback((relationshipId: string) => {
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
    if (s.soldi < 80) {
      playSound.failure()
      announce('Servono 80€ per uscire!', 'assertive')
      return
    }
    const relationship = relationships.find(r => r.id === relationshipId)
    if (!relationship) return
    const successChance = calculateRelationshipSuccess(s, relationship)
    if (randomChance(successChance)) {
      playSound.bigWin()
      setRelationships((current) =>
        current.map(r =>
          r.id === relationshipId
            ? { ...r, isActive: true, relationshipLevel: 1 }
            : r
        )
      )
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 30),
        carisma: clampStat(current.carisma + 15),
      }))
      // Crea Ragazza dall'oggetto Relationship e imposta come fidanzata
      const gt = gameTimeRef.current
      const dateString = `${gt.currentDate.day}/${gt.currentDate.month}/${gt.currentDate.year}`
      const newGirlfriend = generateGirlfriendFromRelationship(relationship, dateString)
      setGirlfriend(newGirlfriend)
      consumeAction()
      announce(`${relationship.name} ha detto SÌ! Siete INSIEME! +30 Figosità, +15 Carisma`)
      addLogEntry('social', `${relationship.name} ha detto sì!`, `${relationship.name} ha detto SÌ! Siete INSIEME! +30 Figosità, +15 Carisma`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 20),
        carisma: clampStat(current.carisma - 10),
        soldi: clampStat(current.soldi - 40, 0, 1000)
      }))
      consumeAction()
      announce(`${relationship.name} ti ha dato il PALO! RIFIUTATO! -20 Figosità, -10 Carisma, -40 Soldi`)
      addLogEntry('social', `Palo da ${relationship.name}`, `${relationship.name} ti ha dato il PALO! RIFIUTATO! -20 Figosità, -10 Carisma, -40 Soldi`, 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [relationships, setRelationships, setStats, setGirlfriend, consumeAction, announce, addLogEntry])

  // A8 — Nuove azioni sociali gratuite
  // B1-FIX-5 applicato
  const handleChiacchiera = useCallback(() => {
    if (!canInteractRef.current) {
      playSound.failure()
      announce('Hai esaurito le interazioni per questa fascia oraria!', 'assertive')
      return
    }
    const gt = gameTimeRef.current
    const isSchoolMorning = dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina' && gt.schoolYear.isSchoolPeriod
    playSound.buttonClick()
    setStats((current) => ({
      ...current,
      carisma: clampStat(current.carisma + 5),
      reputazione: clampStat(current.reputazione + 3),
      stanchezza: clampStat(current.stanchezza + 5),
      stress: clampStat(current.stress - 5),
      morale: clampStat(current.morale + 5)
    }))
    const chiacchieraMsg = isSchoolMorning
      ? 'Chiacchieri con un compagno tra una lezione e l\'altra! +5 Carisma, +3 Reputazione'
      : 'Hai chiacchierato con qualcuno! +5 Carisma, +3 Reputazione'
    consumeInterazione()
    announce(chiacchieraMsg)
    addLogEntry('social', 'Chiacchierata con qualcuno', chiacchieraMsg, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    checkForNewFriend('quartiere')
    checkForNewRelationship()
  }, [setStats, consumeInterazione, announce, checkForNewFriend, checkForNewRelationship, addLogEntry])

  // B1-FIX-5 applicato
  const handleParco = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!', 'assertive')
      return
    }
    const gt = gameTimeRef.current
    if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina'
      && gt.schoolYear.isSchoolPeriod
      && !marinatoOggiRef.current) {
      playSound.failure()
      announce('Sei a scuola! Concentrati sulle lezioni.', 'assertive')
      return
    }
    playSound.buttonClick()
    setStats((current) => ({
      ...current,
      carisma: clampStat(current.carisma + 5),
      stanchezza: clampStat(current.stanchezza - 5),
      reputazione: clampStat(current.reputazione + 2),
      stress: clampStat(current.stress - 15),
      morale: clampStat(current.morale + 8)
    }))
    consumeAction()
    announce('Giro rilassante al parco! +5 Carisma, -5 Stanchezza, +2 Reputazione')
    addLogEntry('action_neutral', 'Giro al parco', 'Giro rilassante al parco! +5 Carisma, -5 Stanchezza, +2 Reputazione', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    checkForNewFriend('al parco')
    checkForNewRelationship()
    checkForNewGirlfriend()
    // STEP 9C: leggero rischio raffreddore al parco
    if (Math.random() < 0.05) {
      applyCondition('raffreddore', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setStats, consumeAction, announce, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend, addLogEntry, applyCondition])

  // B1-FIX-5 applicato
  const handleTelefona = useCallback(() => {
    if (!canInteractRef.current) {
      playSound.failure()
      announce('Hai esaurito le interazioni per questa fascia oraria!', 'assertive')
      return
    }
    const gt = gameTimeRef.current
    const isSchoolMorning = dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina' && gt.schoolYear.isSchoolPeriod
    if (friendsRef.current.length === 0) {
      playSound.failure()
      announce('Non hai amici da chiamare! Esci e socializza prima.', 'assertive')
      return
    }
    playSound.buttonClick()
    const randomFriend = friendsRef.current[Math.floor(Math.random() * friendsRef.current.length)]
    setStats((current) => ({
      ...current,
      carisma: clampStat(current.carisma + 3)
    }))
    consumeInterazione()
    announce(isSchoolMorning
      ? `Hai mandato un messaggio a ${randomFriend.name} durante la ricreazione! +3 Carisma`
      : `Hai chiamato ${randomFriend.name}! Bella chiacchierata. +3 Carisma`
    )
    addLogEntry('social', `Telefonata con ${randomFriend.name}`, isSchoolMorning
      ? `Hai mandato un messaggio a ${randomFriend.name} durante la ricreazione! +3 Carisma`
      : `Hai chiamato ${randomFriend.name}! Bella chiacchierata. +3 Carisma`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    checkForNewFriend('quartiere')
  }, [setStats, consumeInterazione, announce, addLogEntry, checkForNewFriend])

  const handleFriendAction = useCallback((friendId: string, actionId: string) => {
    const friend = friendsRef.current.find(f => f.id === friendId)
    const s = statsRef.current
    if (!friend) return
    const action = FRIEND_ACTIONS.find(a => a.id === actionId)
    if (!action) return
    if (!canInteractRef.current) {
      playSound.failure()
      announce('Hai esaurito le interazioni per questa fascia oraria!', 'assertive')
      return
    }
    const req = action.requirements(s, friend)
    if (!req.canDo) {
      playSound.failure()
      announce(req.reason || 'Non puoi fare questa azione', 'assertive')
      return
    }
    const result = applyFriendActionEffects(actionId, s, friend)
    // E1: aggiorna affinita (legacy) e rel.amicizia (new) nel KV
    const clampedAffinita = result.newAffinita
    setFriends((prev) =>
      prev.map((f) =>
        f.id !== friendId
          ? f
          : {
              ...f,
              affinita: clampedAffinita,
              rel: result.newRel ?? f.rel,
            }
      )
    )
    if (Object.keys(result.newStats).length > 0) {
      setStats((current) => {
        const updated = { ...current }
        Object.entries(result.newStats).forEach(([k, v]) => {
          const key = k as keyof GameStats
          const val = v as number
          if (key === 'soldi') {
            updated[key] = clampStat(val, 0, 1000)
          } else {
            updated[key] = clampStat(val)
          }
        })
        return updated
      })
    }
    consumeInterazione()
    playSound.success()
    announce(result.message)
  }, [setStats, setFriends, consumeInterazione, announce])

  return {
    handleDisco,
    handleCinema,
    handleTryRelationship,
    handleChiacchiera,
    handleParco,
    handleTelefona,
    handleFriendAction,
  }
}
