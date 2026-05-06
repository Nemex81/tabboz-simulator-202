import { useState, useCallback, useRef } from 'react'
import { GameStats, Friend, Relationship, GameTime, PlayerProfile } from '@/lib/types'
import { ActivePartner, asActivePartner, generateGirlfriendFromRelationship, upsertActivePartnerCollection } from '@/lib/girlfriend-system'
import {
  randomChance,
  clampStat,
  getReputationEventModifier,
  canAvoidNegativeEventWithCharisma
} from '@/lib/game-utils'
import {
  createRelationshipSourceKey,
  FEMALE_PARTNER_NAMES,
  generateRandomRelationship,
  MALE_PARTNER_NAMES,
} from '@/lib/relationship-utils'
import { generateExtraFriend } from '@/lib/enhanced-friend-system'
import { getFriendGenChance, LOCATION_PROB_BONUS } from '@/lib/relation-system'
import { playSound } from '@/lib/sound-effects'
import { getAfternoonEvent, AfternoonLocation, AfternoonEvent } from '@/lib/afternoon-events'
import { BetInfo, generateStreetRace } from '@/lib/bet-system'
import {
  canStartNewRomanticRelationship,
  getCompatibleCandidateOrientation,
  getPreferredPartnerGenderOrRandom,
  isRomanticallyCompatible,
  MAX_RELATIONSHIPS_REACHED_MESSAGE,
} from '@/lib/gender-utils'

const LOCATION_NORMALIZATION: Record<string, keyof typeof LOCATION_PROB_BONUS> = {
  quartiere: 'quartiere',
  'in giro per il paese': 'quartiere',
  'al parco': 'quartiere',
  'al cinema': 'quartiere',
  'in palestra': 'palestra',
  palestra: 'palestra',
  online: 'online',
  rete: 'online',
  'in rete': 'online',
  'al centro commerciale': 'lavoro',
  lavoro: 'lavoro',
  'in discoteca': 'festa',
  festa: 'festa',
}

const FRIEND_LOCATION_TEXT: Record<keyof typeof LOCATION_PROB_BONUS, string> = {
  classe: 'a scuola',
  corridoio: 'in corridoio',
  quartiere: 'in quartiere',
  palestra: 'in palestra',
  online: 'online',
  festa: 'a una festa',
  sport: 'durante un attivita sportiva',
  lavoro: 'al lavoro',
}

function buildPickupRelationship(
  name: string,
  gender: Relationship['gender'],
  sourceKey: string,
  metAt?: Relationship['metAt'],
  orientamentoSessuale?: Relationship['orientamentoSessuale'],
  preference: Relationship['preference'] = 'figosita',
  difficulty: Relationship['difficulty'] = 'media',
): Relationship {
  return {
    id: `relationship_pickup_${Date.now()}_${Math.random()}`,
    name,
    sourceKey,
    sourceType: 'pickup',
    metAt,
    gender,
    orientamentoSessuale,
    difficulty,
    preference,
    relationshipLevel: 1,
    isActive: true,
  }
}

interface UseEventEngineParams {
  stats: GameStats
  setStats: (updater: ((prev: GameStats) => GameStats) | GameStats) => void
  friends: Friend[]
  setFriends: (updater: ((prev: Friend[]) => Friend[]) | Friend[]) => void
  relationships: Relationship[]
  setRelationships: (updater: ((prev: Relationship[]) => Relationship[]) | Relationship[]) => void
  setActivePartners: React.Dispatch<React.SetStateAction<ActivePartner[]>>
  gameTime: GameTime
  consumeAction: () => void
  announce: (msg: string, priority?: 'polite' | 'assertive') => void
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
  playerProfile: PlayerProfile | null
}

export function useEventEngine({
  stats,
  setStats,
  friends,
  setFriends,
  relationships,
  setRelationships,
  setActivePartners,
  gameTime,
  consumeAction,
  announce,
  phaseActionsRemaining,
  addLogEntry,
  currentPhase,
  playerProfile,
}: UseEventEngineParams) {
  const [showMetallariEvent, setShowMetallariEvent] = useState(false)
  const [showAtipaEvent, setShowAtipaEvent] = useState(false)
  const [atipaName, setAtipaName] = useState('')
  const [atipaGender, setAtipaGender] = useState<Relationship['gender']>('F')
  const [atipaOrientation, setAtipaOrientation] = useState<Relationship['orientamentoSessuale']>('eterosessuale')
  const [atipaEncounterKey, setAtipaEncounterKey] = useState('')
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
  const gameTimeRef = useRef(gameTime)
  gameTimeRef.current = gameTime
  const raceWinChanceRef = useRef(raceWinChance)
  raceWinChanceRef.current = raceWinChance
  const atipaNameRef = useRef(atipaName)
  atipaNameRef.current = atipaName
  const atipaGenderRef = useRef(atipaGender)
  atipaGenderRef.current = atipaGender
  const atipaOrientationRef = useRef(atipaOrientation)
  atipaOrientationRef.current = atipaOrientation
  const atipaEncounterKeyRef = useRef(atipaEncounterKey)
  atipaEncounterKeyRef.current = atipaEncounterKey
  const atipaSuccessChanceRef = useRef(atipaSuccessChance)
  atipaSuccessChanceRef.current = atipaSuccessChance
  const phaseActionsRemainingRef = useRef(phaseActionsRemaining)
  phaseActionsRemainingRef.current = phaseActionsRemaining
  const currentPhaseRef = useRef(currentPhase)
  currentPhaseRef.current = currentPhase
  const betInfoRef = useRef<BetInfo | null>(betInfo)
  betInfoRef.current = betInfo
  const playerProfileRef = useRef(playerProfile)
  playerProfileRef.current = playerProfile

  const upsertRelationship = useCallback((relationship: Relationship) => {
    setRelationships((current) => {
      const existingRelationship = current.find((entry) => {
        if (relationship.sourceKey && entry.sourceKey) {
          return entry.sourceKey === relationship.sourceKey
        }

        if (entry.id === relationship.id) {
          return true
        }

        return (
          !entry.sourceKey &&
          !relationship.sourceKey &&
          entry.name === relationship.name &&
          (entry.gender ?? relationship.gender) === (relationship.gender ?? entry.gender)
        )
      })

      if (!existingRelationship) {
        return [...current, relationship]
      }

      return current.map((entry) => (
        entry.id !== existingRelationship.id
          ? entry
          : {
              ...entry,
              sourceKey: entry.sourceKey ?? relationship.sourceKey,
              sourceType: entry.sourceType ?? relationship.sourceType,
              metAt: entry.metAt ?? relationship.metAt,
              gender: entry.gender ?? relationship.gender,
              orientamentoSessuale: entry.orientamentoSessuale ?? relationship.orientamentoSessuale,
              difficulty: relationship.difficulty,
              preference: relationship.preference,
              relationshipLevel: Math.max(entry.relationshipLevel, relationship.relationshipLevel),
              isActive: entry.isActive || relationship.isActive,
            }
      ))
    })
  }, [setRelationships])

  const upsertActivePartner = useCallback((partner: ActivePartner) => {
    setActivePartners((current) => upsertActivePartnerCollection(current, partner))
  }, [setActivePartners])

  const checkForNewFriend = useCallback((location: string) => {
    const normalizedLocation = LOCATION_NORMALIZATION[location] ?? 'quartiere'
    // Tentativo evento narrativo pomeridiano/serale (priorità su generazione silenziosa)
    const phase = currentPhaseRef.current
    if (phase === 'pomeriggio' || phase === 'sera') {
      const evt = getAfternoonEvent(normalizedLocation as AfternoonLocation)
      if (evt) {
        setAfternoonEvent(evt)
        return  // evento narrativo trovato — non generare amico silenzioso
      }
    }

    // Fallback: generazione silenziosa (codice originale invariato)
    const carismaBonus = Math.floor(statsRef.current.carisma / 10)
    const locationBonus = LOCATION_PROB_BONUS[normalizedLocation] ?? 0
    const rawChance = 15 + carismaBonus + locationBonus
    const adjustedChance = getFriendGenChance(rawChance, friendsRef.current.length)
    if (Math.random() * 100 < adjustedChance) {
      const newFriend = generateExtraFriend(normalizedLocation)
      setFriends((current) => [...current, newFriend])
      playSound.success()
      const description = `Hai conosciuto ${newFriend.name} ${FRIEND_LOCATION_TEXT[normalizedLocation]}! Nuovo amico aggiunto alla rubrica. (${newFriend.type.toUpperCase()})`
      announce(description)
      addLogEntry('social', `Nuovo amico: ${newFriend.name}`, description, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
    }
  }, [setFriends, announce, addLogEntry])

  const checkForNewRelationship = useCallback((metAt?: Relationship['metAt']) => {
    if (relationshipsRef.current.length < 6 && randomChance(20)) {
      const currentPlayer = playerProfileRef.current
      const playerGender = currentPlayer?.gender ?? 'maschio'
      const playerOrientation = currentPlayer?.orientamentoSessuale ?? 'eterosessuale'
      const targetGender = getPreferredPartnerGenderOrRandom(playerGender, playerOrientation)
      const targetOrientation = getCompatibleCandidateOrientation(playerGender, playerOrientation, targetGender)
      if (!isRomanticallyCompatible(playerGender, playerOrientation, targetGender, targetOrientation)) {
        return
      }
      const newRelationship = generateRandomRelationship(targetGender, metAt, targetOrientation)
      upsertRelationship(newRelationship)
      playSound.eventTrigger()
      announce(`Hai notato ${newRelationship.name}! Nuovo interesse romantico disponibile.`)
    }
  }, [announce, upsertRelationship])

  const checkForNewGirlfriend = useCallback((metAt?: Relationship['metAt']) => {
    if (!canStartNewRomanticRelationship(statsRef.current, relationshipsRef.current)) {
      announce(MAX_RELATIONSHIPS_REACHED_MESSAGE, 'assertive')
      return
    }
    if (randomChance(10)) {
      const currentPlayer = playerProfileRef.current
      const playerGender = currentPlayer?.gender ?? 'maschio'
      const playerOrientation = currentPlayer?.orientamentoSessuale ?? 'eterosessuale'
      const targetGender = getPreferredPartnerGenderOrRandom(playerGender, playerOrientation)
      const targetOrientation = getCompatibleCandidateOrientation(playerGender, playerOrientation, targetGender)
      if (!isRomanticallyCompatible(playerGender, playerOrientation, targetGender, targetOrientation)) {
        return
      }
      const newRelationship = {
        ...generateRandomRelationship(targetGender, metAt, targetOrientation),
        sourceKey: createRelationshipSourceKey('direct-girlfriend'),
        sourceType: 'direct_girlfriend' as const,
        relationshipLevel: 1,
        isActive: true,
      }
      const currentDate = gameTimeRef.current.currentDate
      const currentDateString = `${currentDate.day}/${currentDate.month}/${currentDate.year}`
      const newGirl = generateGirlfriendFromRelationship(newRelationship, currentDateString)
      upsertRelationship(newRelationship)
      upsertActivePartner(asActivePartner(newGirl, newRelationship.sourceKey ?? `legacy-partner:${newGirl.id}`))
      playSound.eventTrigger()
      announce(`Hai fatto colpo su ${newRelationship.name}! Nuova relazione attiva.`)
    }
  }, [announce, upsertActivePartner, upsertRelationship])

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
    if (!canStartNewRomanticRelationship(statsRef.current, relationshipsRef.current)) {
      playSound.failure()
      announce(MAX_RELATIONSHIPS_REACHED_MESSAGE, 'assertive')
      return
    }
    const s = statsRef.current
    const currentPlayer = playerProfileRef.current
    const playerGender = currentPlayer?.gender ?? 'maschio'
    const playerOrientation = currentPlayer?.orientamentoSessuale ?? 'eterosessuale'
    const targetGender = getPreferredPartnerGenderOrRandom(playerGender, playerOrientation)
    const targetOrientation = getCompatibleCandidateOrientation(playerGender, playerOrientation, targetGender)
    if (!isRomanticallyCompatible(playerGender, playerOrientation, targetGender, targetOrientation)) {
      playSound.failure()
      announce('Non trovi nessuno compatibile in questo momento.', 'assertive')
      return
    }
    playSound.buttonClick()
    playSound.eventTrigger()
    const names = targetGender === 'M' ? MALE_PARTNER_NAMES : FEMALE_PARTNER_NAMES
    const randomName = names[Math.floor(Math.random() * names.length)]
    setAtipaName(randomName)
    setAtipaGender(targetGender)
    setAtipaOrientation(targetOrientation)

    const reputationModifier = getReputationEventModifier(s.reputazione)
    const successChance = Math.min(90, Math.max(10,
      (s.figosita * 0.4) +
      (s.coattaggine * 0.3) +
      (s.muscoli * 0.2) +
      (s.soldi / 10) +
      reputationModifier.positiveOutcomeBonus
    ))
    setAtipaEncounterKey(createRelationshipSourceKey('pickup'))
    setAtipaSuccessChance(Math.round(successChance))
    setCurrentEvent(`Hai incrociato ${randomName} nel quartiere! Vuoi provarci?`)
    setShowAtipaEvent(true)
    consumeAction()
    announce(`Evento: occasione per rimorchiare nel quartiere con ${randomName}. Possibilità di successo: ${Math.round(successChance)}%`)
  }, [consumeAction, announce])

  // B1-FIX-3 applicato
  const handleAtipaRinuncia = useCallback(() => {
    setShowAtipaEvent(false)
    playSound.failure()
    setStats((current) => ({ ...current, coattaggine: clampStat(current.coattaggine - 5) }))
    // consumeAction() rimossa — già chiamata in handleProvarciConAtipa
    announce('Hai CAGATO sotto! -5 Coattaggine')
    addLogEntry('social', 'Rimorchia nel quartiere — rinunciato', 'Hai CAGATO sotto! -5 Coattaggine', 'negative', gameTimeRef.current.currentDate, currentPhaseRef.current)
  }, [setStats, announce, addLogEntry])

  const handleAtipaProva = useCallback(() => {
    setShowAtipaEvent(false)
    const name = atipaNameRef.current
    if (randomChance(atipaSuccessChanceRef.current)) {
      if (!canStartNewRomanticRelationship(statsRef.current, relationshipsRef.current)) {
        playSound.failure()
        announce(MAX_RELATIONSHIPS_REACHED_MESSAGE, 'assertive')
        return
      }
      const newRelationship = buildPickupRelationship(
        name,
        atipaGenderRef.current,
        atipaEncounterKeyRef.current || `pickup:fallback:${name}`,
        'quartiere',
        atipaOrientationRef.current,
      )
      const currentPlayer = playerProfileRef.current
      const playerGender = currentPlayer?.gender ?? 'maschio'
      const playerOrientation = currentPlayer?.orientamentoSessuale ?? 'eterosessuale'
      if (!isRomanticallyCompatible(
        playerGender,
        playerOrientation,
        newRelationship.gender ?? 'F',
        newRelationship.orientamentoSessuale ?? 'eterosessuale',
      )) {
        playSound.failure()
        announce('Questa persona non e compatibile con il tuo orientamento.', 'assertive')
        return
      }
      const currentDate = gameTimeRef.current.currentDate
      const currentDateString = `${currentDate.day}/${currentDate.month}/${currentDate.year}`

      playSound.bigWin()
      upsertRelationship(newRelationship)
      upsertActivePartner(
        asActivePartner(
          generateGirlfriendFromRelationship(newRelationship, currentDateString),
          newRelationship.sourceKey ?? `legacy-partner:${newRelationship.id}`,
        ),
      )
      setStats((current) => ({
        ...current,
        figosita: clampStat(current.figosita + 20),
        coattaggine: clampStat(current.coattaggine + 10),
        carisma: clampStat(current.carisma + 5)
      }))
      announce(`${name} ha detto SÌ! +20 Figosità, +10 Coattaggine, +5 Carisma`)
      addLogEntry('social', `Rimorchia nel quartiere con ${name} — successo`, `${name} ha detto SÌ! +20 Figosità, +10 Coattaggine, +5 Carisma`, 'positive', gameTimeRef.current.currentDate, currentPhaseRef.current)
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
  }, [setStats, announce, addLogEntry, upsertActivePartner, upsertRelationship])

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
