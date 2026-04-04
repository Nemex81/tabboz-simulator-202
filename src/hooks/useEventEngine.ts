import { useState, useCallback, useRef } from 'react'
import { GameStats, Friend, Relationship, GameTime } from '@/lib/types'
import { Ragazza, generateRandomGirlfriend } from '@/lib/girlfriend-system'
import {
  randomChance,
  clampStat,
  getReputationEventModifier,
  canAvoidNegativeEventWithCharisma
} from '@/lib/game-utils'
import { generateRandomFriend, checkNewFriendEvent, generateRandomRelationship } from '@/lib/social-system'
import { playSound } from '@/lib/sound-effects'

interface UseEventEngineParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  friends: Friend[]
  setFriends: (updater: ((prev: Friend[]) => Friend[]) | Friend[]) => void
  relationships: Relationship[]
  setRelationships: (updater: ((prev: Relationship[]) => Relationship[]) | Relationship[]) => void
  girlfriend: Ragazza | null
  setGirlfriend: (v: Ragazza | null | ((prev: Ragazza | null) => Ragazza | null)) => void
  gameTime: GameTime
  consumeAction: () => void
  announce: (msg: string) => void
  phaseActionsRemaining: number
}

export function useEventEngine({
  stats,
  setStats,
  friends,
  setFriends,
  relationships,
  setRelationships,
  girlfriend,
  setGirlfriend,
  gameTime,
  consumeAction,
  announce,
  phaseActionsRemaining
}: UseEventEngineParams) {
  const [showMetallariEvent, setShowMetallariEvent] = useState(false)
  const [showAtipaEvent, setShowAtipaEvent] = useState(false)
  const [atipaName, setAtipaName] = useState('')
  const [atipaSuccessChance, setAtipaSuccessChance] = useState(0)
  const [showPoliceEvent, setShowPoliceEvent] = useState(false)
  const [showStreetRaceEvent, setShowStreetRaceEvent] = useState(false)
  const [showBulliEvent, setShowBulliEvent] = useState(false)
  const [raceWinChance, setRaceWinChance] = useState(0)
  const [currentEvent, setCurrentEvent] = useState('')

  // Refs per accesso stabile ai valori correnti negli useCallback
  const statsRef = useRef(stats)
  statsRef.current = stats
  const friendsRef = useRef(friends)
  friendsRef.current = friends
  const relationshipsRef = useRef(relationships)
  relationshipsRef.current = relationships
  const girlfriendRef = useRef(girlfriend)
  girlfriendRef.current = girlfriend
  const gameTimeRef = useRef(gameTime)
  gameTimeRef.current = gameTime
  const raceWinChanceRef = useRef(raceWinChance)
  raceWinChanceRef.current = raceWinChance
  const atipaNameRef = useRef(atipaName)
  atipaNameRef.current = atipaName
  const atipaSuccessChanceRef = useRef(atipaSuccessChance)
  atipaSuccessChanceRef.current = atipaSuccessChance
  const phaseActionsRemainingRef = useRef(phaseActionsRemaining)
  phaseActionsRemainingRef.current = phaseActionsRemaining

  const checkForNewFriend = useCallback((location: string) => {
    if (checkNewFriendEvent(statsRef.current.carisma, location) && friendsRef.current.length < 4) {
      const newFriend = generateRandomFriend()
      setFriends((current) => [...current, newFriend])
      playSound.success()
      announce(`Hai conosciuto ${newFriend.name} ${location}! Nuovo amico aggiunto alla RUBRICA! (${newFriend.type.toUpperCase()})`)
    }
  }, [setFriends, announce])

  const checkForNewRelationship = useCallback(() => {
    if (relationshipsRef.current.length < 6 && randomChance(20)) {
      const newRelationship = generateRandomRelationship()
      setRelationships((current) => [...current, newRelationship])
      playSound.eventTrigger()
      announce(`Hai notato ${newRelationship.name}! Aggiunta alle ragazze disponibili!`)
    }
  }, [setRelationships, announce])

  const checkForNewGirlfriend = useCallback(() => {
    if (girlfriendRef.current) return
    if (randomChance(10)) {
      const newGirl = generateRandomGirlfriend()
      setGirlfriend(newGirl)
      playSound.eventTrigger()
      announce(`Hai notato ${newGirl.nome} ${newGirl.cognome}! Sembra interessante...`)
    }
  }, [setGirlfriend, announce])

  const triggerRandomEvent = useCallback(() => {
    const s = statsRef.current
    const reputationModifier = getReputationEventModifier(s.reputazione)
    const baseRoll = Math.random() * 100
    const adjustedRoll = baseRoll * reputationModifier.encounterChanceMultiplier

    if (adjustedRoll < 12) {
      if (canAvoidNegativeEventWithCharisma(s.carisma)) {
        playSound.success()
        announce('I METALLARI ti riconoscono! Con la tua PARLANTINA li hai convinti a lasciarti stare!')
        return
      }
      if (reputationModifier.respectBonus >= 15) {
        playSound.success()
        announce('I METALLARI ti riconoscono e ti salutano con rispetto! La tua REPUTAZIONE ti precede!')
        return
      }
      playSound.dangerAlert()
      setShowMetallariEvent(true)
      setCurrentEvent('Incontro con i METALLARI! Vogliono la tua grana!')
      announce('Evento casuale: Incontro con i METALLARI! Vogliono la tua grana!')
    } else if (adjustedRoll < 22) {
      if (canAvoidNegativeEventWithCharisma(s.carisma)) {
        playSound.success()
        setStats((current) => ({ ...current, carisma: clampStat(current.carisma + 5) }))
        announce('I POLIZIOTTI ti hanno fermato ma con la tua PARLANTINA li hai convinti! +5 Carisma!')
        return
      }
      if (reputationModifier.respectBonus >= 15) {
        playSound.success()
        announce('I POLIZIOTTI ti hanno fermato ma ti lasciano andare! Sei troppo RISPETTATO nel quartiere!')
        return
      }
      playSound.dangerAlert()
      setShowPoliceEvent(true)
      setCurrentEvent('I POLIZIOTTI ti hanno fermato! Controllo documenti!')
      announce('Evento casuale: Controllo della POLIZIA!')
    } else if (adjustedRoll < 30) {
      const winChance = Math.min(85, Math.max(15,
        (s.coattaggine * 0.5) +
        (s.figosita * 0.3) +
        (s.muscoli * 0.2) +
        reputationModifier.positiveOutcomeBonus
      ))
      setRaceWinChance(Math.round(winChance))
      playSound.eventTrigger()
      setShowStreetRaceEvent(true)
      setCurrentEvent('Un TAMARRO ti sfida ad una GARA con il motorino!')
      announce(`Evento casuale: GARA di motorini! Possibilità di vincita: ${Math.round(winChance)}%`)
    } else if (adjustedRoll < 36) {
      if (reputationModifier.respectBonus >= 10) {
        playSound.success()
        announce('I BULLI della scuola ti vedono e si allontanano! Hanno PAURA della tua REPUTAZIONE!')
        return
      }
      playSound.dangerAlert()
      setShowBulliEvent(true)
      setCurrentEvent('I BULLI della scuola ti vogliono rubare la merenda!')
      announce('Evento casuale: Incontro con i BULLI!')
    }
  }, [setStats, announce])

  const handleMetallariScappa = useCallback(() => {
    setShowMetallariEvent(false)
    playSound.failure()
    setStats((current) => ({ ...current, coattaggine: clampStat(current.coattaggine - 10) }))
    announce('Sei scappato come un CONIGLIO! -10 Coattaggine')
  }, [setStats, announce])

  const handleMetallariCombatti = useCallback(() => {
    setShowMetallariEvent(false)
    if (statsRef.current.muscoli > 60) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 15),
        soldi: clampStat(current.soldi + 30, 0, 1000)
      }))
      announce('Li hai STESI! +15 Coattaggine, +30 Soldi rubati')
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 50, 0, 1000),
        muscoli: clampStat(current.muscoli - 5)
      }))
      announce('Ti hanno FATTO IL CULO! -50 Soldi, -5 Muscoli')
    }
  }, [setStats, announce])

  const handlePoliceScappa = useCallback(() => {
    setShowPoliceEvent(false)
    if (statsRef.current.coattaggine > 70) {
      playSound.success()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 10)
      }))
      announce('Sei SCAPPATO dai poliziotti! Che COATTO! +10 Coattaggine')
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 100, 0, 1000),
        coattaggine: clampStat(current.coattaggine - 15)
      }))
      announce('Ti hanno BECCATO! Multa di 100€! -100 Soldi, -15 Coattaggine')
    }
  }, [setStats, announce])

  const handlePoliceCollabora = useCallback(() => {
    setShowPoliceEvent(false)
    if (statsRef.current.soldi >= 50) {
      playSound.moneySpent()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 50, 0, 1000)
      }))
      announce('Hai dato una MAZZETTA! Ti lasciano andare. -50 Soldi')
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: 0,
        coattaggine: clampStat(current.coattaggine - 20)
      }))
      announce('Non hai GRANA per la mazzetta! Ti hanno portato in questura! -Tutti i Soldi, -20 Coattaggine')
    }
  }, [setStats, announce])

  // B1-FIX-2 applicato
  const handleStreetRaceAccetta = useCallback(() => {
    setShowStreetRaceEvent(false)
    if (randomChance(raceWinChanceRef.current)) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 25),
        figosita: clampStat(current.figosita + 20),
        soldi: clampStat(current.soldi + 150, 0, 1000)
      }))
      announce('Hai VINTO la gara! Sei una LEGGENDA! +25 Coattaggine, +20 Figosità, +150 Soldi')
    } else {
      playSound.bigLoss()
      const actualLoss = Math.min(80, statsRef.current.soldi)
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 20),
        coattaggine: clampStat(current.coattaggine - 15),
        soldi: clampStat(current.soldi - actualLoss, 0, 1000)
      }))
      announce(`Hai PERSO la gara! Che SCHIFO! -20 Figosità, -15 Coattaggine, -${actualLoss} Soldi (scommessa)`)
    }
  }, [setStats, announce])

  const handleStreetRaceRifiuta = useCallback(() => {
    setShowStreetRaceEvent(false)
    playSound.failure()
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine - 15),
      figosita: clampStat(current.figosita - 10)
    }))
    announce('Hai RIFIUTATO la sfida! Sei un FIFONE! -15 Coattaggine, -10 Figosità')
  }, [setStats, announce])

  const handleBulliResisti = useCallback(() => {
    setShowBulliEvent(false)
    if (statsRef.current.muscoli > 50) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 20),
        muscoli: clampStat(current.muscoli + 5)
      }))
      announce('Li hai MENATI! Ora ti RISPETTANO! +20 Coattaggine, +5 Muscoli')
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 30, 0, 1000),
        coattaggine: clampStat(current.coattaggine - 10),
        muscoli: clampStat(current.muscoli - 5)
      }))
      announce('Ti hanno PESTATO! -30 Soldi, -10 Coattaggine, -5 Muscoli')
    }
  }, [setStats, announce])

  const handleBulliCedi = useCallback(() => {
    setShowBulliEvent(false)
    playSound.failure()
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - 20, 0, 1000),
      coattaggine: clampStat(current.coattaggine - 15)
    }))
    announce('Hai CEDUTO alla loro prepotenza! Sei un PERDENTE! -20 Soldi, -15 Coattaggine')
  }, [setStats, announce])

  // B1-FIX-3 applicato
  const handleProvarciConAtipa = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Nessuna azione rimasta per questa fascia oraria!')
      return
    }
    const s = statsRef.current
    playSound.buttonClick()
    playSound.eventTrigger()
    const names = ['Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer']
    const randomName = names[Math.floor(Math.random() * names.length)]
    setAtipaName(randomName)

    const reputationModifier = getReputationEventModifier(s.reputazione)
    const successChance = Math.min(90, Math.max(10,
      (s.figosita * 0.4) +
      (s.coattaggine * 0.3) +
      (s.muscoli * 0.2) +
      (s.soldi / 10) +
      reputationModifier.positiveOutcomeBonus
    ))
    setAtipaSuccessChance(Math.round(successChance))
    setCurrentEvent(`Hai adocchiato ${randomName} al centro commerciale! Ti vuoi provare?`)
    setShowAtipaEvent(true)
    consumeAction()
    announce(`Evento: Hai incontrato ${randomName}! Possibilità di successo: ${Math.round(successChance)}%`)
  }, [consumeAction, announce])

  // B1-FIX-3 applicato
  const handleAtipaRinuncia = useCallback(() => {
    setShowAtipaEvent(false)
    playSound.failure()
    setStats((current) => ({ ...current, coattaggine: clampStat(current.coattaggine - 5) }))
    // consumeAction() rimossa — già chiamata in handleProvarciConAtipa
    announce('Hai CAGATO sotto! -5 Coattaggine')
  }, [setStats, announce])

  const handleAtipaProva = useCallback(() => {
    setShowAtipaEvent(false)
    const name = atipaNameRef.current
    if (randomChance(atipaSuccessChanceRef.current)) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 20),
        coattaggine: clampStat(current.coattaggine + 10),
        carisma: clampStat(current.carisma + 5)
      }))
      announce(`${name} ha detto SÌ! +20 Figosità, +10 Coattaggine, +5 Carisma`)
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 15),
        coattaggine: clampStat(current.coattaggine - 10)
      }))
      announce(`${name} ti ha dato il PALO! Bruciata DEVASTANTE! -15 Figosità, -10 Coattaggine`)
    }
    // consumeAction() rimossa — già chiamata in handleProvarciConAtipa
  }, [setStats, announce])

  return {
    // Dialog state
    showMetallariEvent, setShowMetallariEvent,
    showAtipaEvent, setShowAtipaEvent,
    atipaName, atipaSuccessChance,
    showPoliceEvent, setShowPoliceEvent,
    showStreetRaceEvent, setShowStreetRaceEvent,
    showBulliEvent, setShowBulliEvent,
    raceWinChance,
    currentEvent,
    // Funzioni
    checkForNewFriend,
    checkForNewRelationship,
    checkForNewGirlfriend,
    triggerRandomEvent,
    handleMetallariScappa,
    handleMetallariCombatti,
    handlePoliceScappa,
    handlePoliceCollabora,
    handleStreetRaceAccetta,
    handleStreetRaceRifiuta,
    handleBulliResisti,
    handleBulliCedi,
    handleProvarciConAtipa,
    handleAtipaRinuncia,
    handleAtipaProva
  }
}
