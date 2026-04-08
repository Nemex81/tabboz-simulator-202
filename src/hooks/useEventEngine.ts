import { useState, useCallback, useRef } from 'react'
import { GameStats, Friend, Relationship, GameTime } from '@/lib/types'
import { Ragazza, generateRandomGirlfriend } from '@/lib/girlfriend-system'
import {
  randomChance,
  clampStat,
  getReputationEventModifier,
  canAvoidNegativeEventWithCharisma
} from '@/lib/game-utils'
import { generateRandomRelationship } from '@/lib/relationship-utils'
import { generateExtraFriend } from '@/lib/enhanced-friend-system'
import { getFriendGenChance, LOCATION_PROB_BONUS } from '@/lib/relation-system'
import { playSound } from '@/lib/sound-effects'
import { getAfternoonEvent, AfternoonLocation, AfternoonEvent } from '@/lib/afternoon-events'
import { BetInfo, generateStreetRace } from '@/lib/bet-system'

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
  addLogEntry: (
    type: import('@/lib/types').LogEntryType,
    title: string,
    description: string,
    result: import('@/lib/types').GameLogEntry['result'],
    date: import('@/lib/types').GameDate,
    phase: import('@/lib/types').DayPhase
  ) => void
  currentPhase: import('@/lib/types').DayPhase
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
  phaseActionsRemaining,
  addLogEntry,
  currentPhase
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
  const [afternoonEvent, setAfternoonEvent] = useState<AfternoonEvent | null>(null)
  const [betInfo, setBetInfo] = useState<BetInfo | null>(null)

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
  const currentPhaseRef = useRef(currentPhase)
  currentPhaseRef.current = currentPhase
  const betInfoRef = useRef<BetInfo | null>(betInfo)
  betInfoRef.current = betInfo

  const checkForNewFriend = useCallback((location: string) => {
    // Tentativo evento narrativo pomeridiano/serale (priorità su generazione silenziosa)
    const phase = currentPhaseRef.current
    if (phase === 'pomeriggio' || phase === 'sera') {
      const evt = getAfternoonEvent(location as AfternoonLocation)
      if (evt) {
        setAfternoonEvent(evt)
        return  // evento narrativo trovato — non generare amico silenzioso
      }
    }

    // Fallback: generazione silenziosa (codice originale invariato)
    const carismaBonus = Math.floor(statsRef.current.carisma / 10)
    const locationBonus = LOCATION_PROB_BONUS[location] ?? 0
    const rawChance = 15 + carismaBonus + locationBonus
    const adjustedChance = getFriendGenChance(rawChance, friendsRef.current.length)
    if (Math.random() * 100 < adjustedChance) {
      const newFriend = generateExtraFriend(location)
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
        addLogEntry('event_positive', 'Metallari evitati', 'I METALLARI ti riconoscono! Con la tua PARLANTINA li hai convinti a lasciarti stare!', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
        return
      }
      if (reputationModifier.respectBonus >= 15) {
        playSound.success()
        announce('I METALLARI ti riconoscono e ti salutano con rispetto! La tua REPUTAZIONE ti precede!')
        addLogEntry('event_positive', 'Rispettato dai metallari', 'I METALLARI ti riconoscono e ti salutano con rispetto! La tua REPUTAZIONE ti precede!', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
        return
      }
      playSound.dangerAlert()
      setShowMetallariEvent(true)
      setCurrentEvent('Incontro con i METALLARI! Vogliono la tua grana!')
      announce('Evento casuale: Incontro con i METALLARI! Vogliono la tua grana!')
      addLogEntry('event_negative', 'Incontro con i metallari', 'Evento casuale: Incontro con i METALLARI! Vogliono la tua grana!', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else if (adjustedRoll < 22) {
      if (canAvoidNegativeEventWithCharisma(s.carisma)) {
        playSound.success()
        setStats((current) => ({ ...current, carisma: clampStat(current.carisma + 5) }))
        announce('I POLIZIOTTI ti hanno fermato ma con la tua PARLANTINA li hai convinti! +5 Carisma!')
        addLogEntry('event_positive', 'Fermati dalla polizia — via libera', 'I POLIZIOTTI ti hanno fermato ma con la tua PARLANTINA li hai convinti! +5 Carisma!', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
        return
      }
      if (reputationModifier.respectBonus >= 15) {
        playSound.success()
        announce('I POLIZIOTTI ti hanno fermato ma ti lasciano andare! Sei troppo RISPETTATO nel quartiere!')
        addLogEntry('event_positive', 'Rispettato dalla polizia', 'I POLIZIOTTI ti hanno fermato ma ti lasciano andare! Sei troppo RISPETTATO nel quartiere!', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
        return
      }
      playSound.dangerAlert()
      setShowPoliceEvent(true)
      setCurrentEvent('I POLIZIOTTI ti hanno fermato! Controllo documenti!')
      announce('Evento casuale: Controllo della POLIZIA!')
      addLogEntry('event_negative', 'Controllo della polizia', 'Evento casuale: Controllo della POLIZIA!', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else if (adjustedRoll < 30) {
      const winChance = Math.min(85, Math.max(15,
        (s.coattaggine * 0.5) +
        (s.figosita * 0.3) +
        (s.muscoli * 0.2) +
        reputationModifier.positiveOutcomeBonus
      ))
      const race = generateStreetRace(s.reputazione)
      setBetInfo(race)
      setRaceWinChance(Math.round(winChance))
      playSound.eventTrigger()
      setShowStreetRaceEvent(true)
      setCurrentEvent('Un TAMARRO ti sfida ad una GARA con il motorino!')
      announce(`Evento casuale: GARA di motorini! Possibilità di vincita: ${Math.round(winChance)}%`)
      addLogEntry('event_neutral', 'Sfida a gara di motorini', `Evento casuale: GARA di motorini! Possibilità di vincita: ${Math.round(winChance)}%`, 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else if (adjustedRoll < 36) {
      if (reputationModifier.respectBonus >= 10) {
        playSound.success()
        announce('I BULLI della scuola ti vedono e si allontanano! Hanno PAURA della tua REPUTAZIONE!')
        addLogEntry('event_positive', 'Rispettato dai bulli', 'I BULLI della scuola ti vedono e si allontanano! Hanno PAURA della tua REPUTAZIONE!', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
        return
      }
      playSound.dangerAlert()
      setShowBulliEvent(true)
      setCurrentEvent('I BULLI della scuola ti vogliono rubare la merenda!')
      announce('Evento casuale: Incontro con i BULLI!')
      addLogEntry('event_negative', 'Incontro con i bulli', 'Evento casuale: Incontro con i BULLI!', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setStats, announce, addLogEntry])

  const handleMetallariScappa = useCallback(() => {
    setShowMetallariEvent(false)
    playSound.failure()
    setStats((current) => ({ ...current, coattaggine: clampStat(current.coattaggine - 10) }))
    announce('Sei scappato come un CONIGLIO! -10 Coattaggine')
    addLogEntry('event_negative', 'Metallari — fuga', 'Sei scappato come un CONIGLIO! -10 Coattaggine', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, announce, addLogEntry])

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
      addLogEntry('event_positive', 'Metallari — vinto', 'Li hai STESI! +15 Coattaggine, +30 Soldi rubati', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 50, 0, 1000),
        muscoli: clampStat(current.muscoli - 5)
      }))
      announce('Ti hanno FATTO IL CULO! -50 Soldi, -5 Muscoli')
      addLogEntry('event_negative', 'Metallari — perso', 'Ti hanno FATTO IL CULO! -50 Soldi, -5 Muscoli', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setStats, announce, addLogEntry])

  const handlePoliceScappa = useCallback(() => {
    setShowPoliceEvent(false)
    if (statsRef.current.coattaggine > 70) {
      playSound.success()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 10)
      }))
      announce('Sei SCAPPATO dai poliziotti! Che COATTO! +10 Coattaggine')
      addLogEntry('event_positive', 'Polizia — fuga riuscita', 'Sei SCAPPATO dai poliziotti! Che COATTO! +10 Coattaggine', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 100, 0, 1000),
        coattaggine: clampStat(current.coattaggine - 15)
      }))
      announce('Ti hanno BECCATO! Multa di 100€! -100 Soldi, -15 Coattaggine')
      addLogEntry('event_negative', 'Polizia — beccato in fuga', 'Ti hanno BECCATO! Multa di 100€! -100 Soldi, -15 Coattaggine', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setStats, announce, addLogEntry])

  const handlePoliceCollabora = useCallback(() => {
    setShowPoliceEvent(false)
    if (statsRef.current.soldi >= 50) {
      playSound.moneySpent()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 50, 0, 1000)
      }))
      announce('Hai dato una MAZZETTA! Ti lasciano andare. -50 Soldi')
      addLogEntry('event_neutral', 'Polizia — mazzetta', 'Hai dato una MAZZETTA! Ti lasciano andare. -50 Soldi', 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: 0,
        coattaggine: clampStat(current.coattaggine - 20)
      }))
      announce('Non hai GRANA per la mazzetta! Ti hanno portato in questura! -Tutti i Soldi, -20 Coattaggine')
      addLogEntry('event_negative', 'Polizia — questura', 'Non hai GRANA per la mazzetta! Ti hanno portato in questura! -Tutti i Soldi, -20 Coattaggine', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setStats, announce, addLogEntry])

  // B1-FIX-2 applicato
  const handleStreetRaceAccetta = useCallback(() => {
    setShowStreetRaceEvent(false)
    if (randomChance(raceWinChanceRef.current)) {
      playSound.bigWin()
      setStats((current) => ({
        ...current,
        coattaggine: clampStat(current.coattaggine + 25),
        figosita: clampStat(current.figosita + 20),
        soldi: clampStat(current.soldi + (betInfoRef.current?.vincitaPotenziale ?? 150), 0, 1000)
      }))
      announce('Hai VINTO la gara! Sei una LEGGENDA! +25 Coattaggine, +20 Figosità, +150 Soldi')
      addLogEntry('event_positive', 'Gara motorini — vinta', 'Hai VINTO la gara! Sei una LEGGENDA! +25 Coattaggine, +20 Figosità, +150 Soldi', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.bigLoss()
      const actualLoss = Math.min(betInfoRef.current?.importo ?? 80, statsRef.current.soldi)
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 20),
        coattaggine: clampStat(current.coattaggine - 15),
        soldi: clampStat(current.soldi - actualLoss, 0, 1000)
      }))
      announce(`Hai PERSO la gara! Che SCHIFO! -20 Figosità, -15 Coattaggine, -${actualLoss} Soldi (scommessa)`)
      addLogEntry('event_negative', 'Gara motorini — persa', `Hai PERSO la gara! Che SCHIFO! -20 Figosità, -15 Coattaggine, -${actualLoss} Soldi (scommessa)`, 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setStats, announce, addLogEntry])

  const handleStreetRaceRifiuta = useCallback(() => {
    setShowStreetRaceEvent(false)
    playSound.failure()
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine - 15),
      figosita: clampStat(current.figosita - 10)
    }))
    announce('Hai RIFIUTATO la sfida! Sei un FIFONE! -15 Coattaggine, -10 Figosità')
    addLogEntry('event_neutral', 'Gara motorini — rifiutata', 'Hai RIFIUTATO la sfida! Sei un FIFONE! -15 Coattaggine, -10 Figosità', 'neutral', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, announce, addLogEntry])

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
      addLogEntry('event_positive', 'Bulli — respinti', 'Li hai MENATI! Ora ti RISPETTANO! +20 Coattaggine, +5 Muscoli', 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        soldi: clampStat(current.soldi - 30, 0, 1000),
        coattaggine: clampStat(current.coattaggine - 10),
        muscoli: clampStat(current.muscoli - 5)
      }))
      announce('Ti hanno PESTATO! -30 Soldi, -10 Coattaggine, -5 Muscoli')
      addLogEntry('event_negative', 'Bulli — pestato', 'Ti hanno PESTATO! -30 Soldi, -10 Coattaggine, -5 Muscoli', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setStats, announce, addLogEntry])

  const handleBulliCedi = useCallback(() => {
    setShowBulliEvent(false)
    playSound.failure()
    setStats((current) => ({
      ...current,
      soldi: clampStat(current.soldi - 20, 0, 1000),
      coattaggine: clampStat(current.coattaggine - 15)
    }))
    announce('Hai CEDUTO alla loro prepotenza! Sei un PERDENTE! -20 Soldi, -15 Coattaggine')
    addLogEntry('event_negative', 'Bulli — ceduto', 'Hai CEDUTO alla loro prepotenza! Sei un PERDENTE! -20 Soldi, -15 Coattaggine', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, announce, addLogEntry])

  // B1-FIX-3 applicato
  const handleProvarciConAtipa = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Nessuna azione rimasta per questa fascia oraria!', 'assertive')
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
    addLogEntry('social', 'Atipa — rinunciato', 'Hai CAGATO sotto! -5 Coattaggine', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, announce, addLogEntry])

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
      addLogEntry('social', `Atipa con ${name} — successo`, `${name} ha detto SÌ! +20 Figosità, +10 Coattaggine, +5 Carisma`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    } else {
      playSound.bigLoss()
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita - 15),
        coattaggine: clampStat(current.coattaggine - 10)
      }))
      announce(`${name} ti ha dato il PALO! Bruciata DEVASTANTE! -15 Figosità, -10 Coattaggine`)
      addLogEntry('social', `Palo da ${name}`, `${name} ti ha dato il PALO! Bruciata DEVASTANTE! -15 Figosità, -10 Coattaggine`, 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
    // consumeAction() rimossa — già chiamata in handleProvarciConAtipa
  }, [setStats, announce, addLogEntry])

  const handleAfternoonChoice = useCallback((choiceId: string) => {
    if (!afternoonEvent) return
    const choice = afternoonEvent.choices.find(c => c.id === choiceId)
    if (!choice) return

    const result = choice.outcome(statsRef.current)

    // Applica delta stats
    if (Object.keys(result.delta).length > 0) {
      setStats(prev => {
        const updated = { ...prev }
        for (const [key, val] of Object.entries(result.delta)) {
          if (key in updated && typeof val === 'number') {
            (prev as unknown as Record<string, number>)[key] = clampStat(
              (prev as unknown as Record<string, number>)[key] + val
            )
          }
        }
        return updated
      })
    }

    // Aggiungi nuovo amico se generato
    if (result.newFriend) {
      setFriends(prev => [...prev, result.newFriend!])
      playSound.success()
    }

    // Gestisci rivalitaDelta — applicato a un amico random esistente (ae_festa_litigata)
    if (result.rivalitaDelta && friendsRef.current.length > 0) {
      const randomIdx = Math.floor(Math.random() * friendsRef.current.length)
      setFriends(prev => prev.map((f, i) => {
        if (i !== randomIdx || !f.rel) return f
        return {
          ...f,
          rel: { ...f.rel, rivalita: Math.min(100, (f.rel.rivalita ?? 0) + result.rivalitaDelta!) }
        }
      }))
    }

    announce(result.message)
    addLogEntry(
      'social',
      afternoonEvent.title,
      result.message,
      result.newFriend ? 'positive' : 'neutral',
      gameTimeRef.current.currentDate,
      currentPhaseRef.current
    )

    setAfternoonEvent(null)
  }, [afternoonEvent, setStats, setFriends, announce, addLogEntry])

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
    handleAtipaProva,
    // Afternoon events
    afternoonEvent,
    setAfternoonEvent,
    handleAfternoonChoice,
    betInfo,
    setBetInfo,
  }
}
