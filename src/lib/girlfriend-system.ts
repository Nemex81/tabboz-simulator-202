import { BinaryGenderCode, GameStats, Relationship, SexualOrientation } from '@/lib/types'
import { randomChance, clampStat } from '@/lib/game-utils'
import type { RelationStats } from '@/lib/relation-system'
import {
  DEFAULT_SEXUAL_ORIENTATION,
  getPartnerAdjective,
  getPartnerObjectPronoun,
} from '@/lib/gender-utils'

export type AspettoType = 'carina' | 'bellissima' | 'normale' | 'alternativa'
export type PersonalitaType = 'timida' | 'estroversa' | 'secchiona' | 'ribelle' | 'vanitosa'
export type RelationshipStatus = 'sconosciuta' | 'conoscente' | 'amica' | 'interessata' | 'fidanzata' | 'ex'

export interface Hobby {
  name: string
  icon: string
}

export interface DateActivity {
  id: string
  date: string
  activity: string
  interesseGain: number
  notes: string
}

export interface RelationshipStats {
  totalDates: number
  messagesExchanged: number
  giftsGiven: number
  fightsHad: number
  dateActivities: DateActivity[]
  relationshipStartDate?: string
  daysTogether: number
  jealousyLevel: number
  trustLevel: number
  happinessLevel: number
}

export interface Ragazza {
  id: string
  nome: string
  cognome: string
  gender: BinaryGenderCode
  orientamentoSessuale: SexualOrientation
  eta: number
  classe: string
  aspetto: AspettoType
  personalita: PersonalitaType
  interessePerTe: number
  figositaRichiesta: number
  statusSociale: number
  gelosa: boolean
  hobby: Hobby[]
  coloreCapelli: string
  scuola: string
  statPreferita: 'figosita' | 'muscoli' | 'intelligenza' | 'carisma'
  relationshipStatus: RelationshipStatus
  stats: RelationshipStats
  lastInteractionDate?: string
}

interface GenerateRomanticPartnerOptions {
  targetGender?: BinaryGenderCode
}

const NOMI_FEMMINILI = [
  'Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer',
  'Melissa', 'Cristina', 'Nicole', 'Daniela', 'Federica', 'Valentina',
  'Alessia', 'Martina', 'Chiara', 'Elisa', 'Francesca', 'Giulia'
]

const NOMI_MASCHILI = [
  'Davide', 'Mirko', 'Cristian', 'Fabio', 'Luca', 'Kevin', 'Daniele',
  'Marco', 'Simone', 'Andrea', 'Alessandro', 'Matteo', 'Lorenzo', 'Federico'
]

const COGNOMI = [
  'Rossi', 'Bianchi', 'Ferrari', 'Russo', 'Marino', 'Greco',
  'Romano', 'Gallo', 'Costa', 'Ricci', 'Fontana', 'Barbieri'
]

const SCUOLE = [
  'Stesso liceo', 'Liceo Scientifico Galilei', 'Liceo Classico Manzoni',
  'ITIS Marconi', 'Istituto Alberghiero', 'Liceo Linguistico'
]

const HOBBY_OPTIONS: Hobby[] = [
  { name: 'Musica', icon: '🎵' },
  { name: 'Sport', icon: '⚽' },
  { name: 'Cinema', icon: '🎬' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Lettura', icon: '📚' },
  { name: 'Danza', icon: '💃' },
  { name: 'Arte', icon: '🎨' },
  { name: 'Viaggi', icon: '✈️' },
  { name: 'Fotografia', icon: '📸' },
  { name: 'Moda', icon: '👗' }
]

const COLORI_CAPELLI = [
  'Biondi', 'Castani', 'Neri', 'Rossi', 'Biondi platino',
  'Castano chiaro', 'Mogano', 'Ramati'
]

export const generateRandomGirlfriend = (
  options: GenerateRomanticPartnerOptions = {}
): Ragazza => {
  const targetGender = options.targetGender ?? 'F'
  const namePool = targetGender === 'M' ? NOMI_MASCHILI : NOMI_FEMMINILI
  const nome = namePool[Math.floor(Math.random() * namePool.length)]
  const cognome = COGNOMI[Math.floor(Math.random() * COGNOMI.length)]
  const eta = Math.floor(Math.random() * 6) + 14
  const anno = Math.floor(Math.random() * 5) + 1
  const sezione = String.fromCharCode(65 + Math.floor(Math.random() * 5))
  
  const aspetti: AspettoType[] = ['carina', 'bellissima', 'normale', 'alternativa']
  const aspetto = aspetti[Math.floor(Math.random() * aspetti.length)]
  
  const personalita: PersonalitaType[] = ['timida', 'estroversa', 'secchiona', 'ribelle', 'vanitosa']
  const personalitaScelta = personalita[Math.floor(Math.random() * personalita.length)]
  
  const shuffledHobbies = [...HOBBY_OPTIONS].sort(() => Math.random() - 0.5)
  const numeroHobby = Math.floor(Math.random() * 2) + 2
  const hobby = shuffledHobbies.slice(0, numeroHobby)
  
  const statPreferite: Array<'figosita' | 'muscoli' | 'intelligenza' | 'carisma'> = 
    ['figosita', 'muscoli', 'intelligenza', 'carisma']
  const statPreferita = statPreferite[Math.floor(Math.random() * statPreferite.length)]
  
  let figositaRichiesta = 40
  let statusSociale = 50
  
  if (aspetto === 'bellissima') {
    figositaRichiesta = 70
    statusSociale = 80
  } else if (aspetto === 'carina') {
    figositaRichiesta = 50
    statusSociale = 60
  } else if (aspetto === 'alternativa') {
    figositaRichiesta = 30
    statusSociale = 40
  }
  
  if (personalitaScelta === 'vanitosa') {
    figositaRichiesta += 15
    statusSociale += 20
  } else if (personalitaScelta === 'timida') {
    figositaRichiesta -= 10
    statusSociale -= 15
  }
  
  const gelosa = personalitaScelta === 'vanitosa' || personalitaScelta === 'ribelle'
  
  return {
    id: `girl_${Date.now()}_${Math.random()}`,
    nome,
    cognome,
    gender: targetGender,
    orientamentoSessuale: DEFAULT_SEXUAL_ORIENTATION,
    eta,
    classe: `${anno}${sezione}`,
    aspetto,
    personalita: personalitaScelta,
    interessePerTe: 0,
    figositaRichiesta: Math.min(100, Math.max(20, figositaRichiesta)),
    statusSociale: Math.min(100, Math.max(20, statusSociale)),
    gelosa,
    hobby,
    coloreCapelli: COLORI_CAPELLI[Math.floor(Math.random() * COLORI_CAPELLI.length)],
    scuola: SCUOLE[Math.floor(Math.random() * SCUOLE.length)],
    statPreferita,
    relationshipStatus: 'sconosciuta',
    stats: {
      totalDates: 0,
      messagesExchanged: 0,
      giftsGiven: 0,
      fightsHad: 0,
      dateActivities: [],
      daysTogether: 0,
      jealousyLevel: gelosa ? 50 : 20,
      trustLevel: 50,
      happinessLevel: 50
    }
  }
}

/**
 * Crea una Ragazza a partire da una Relationship esistente (es. dopo il successo di handleTryRelationship).
 * Il nome viene estratto dalla relationship; gli attributi sono parzialmente derivati dalla difficoltà/preferenza.
 */
export const generateGirlfriendFromRelationship = (r: Relationship, currentDateString: string): Ragazza => {
  const parts = r.name.trim().split(' ')
  const nome = parts[0] ?? r.name
  const cognome = parts.slice(1).join(' ') || COGNOMI[Math.floor(Math.random() * COGNOMI.length)]

  // Mappa preferenza → statPreferita
  const statPreferita: 'figosita' | 'muscoli' | 'intelligenza' | 'carisma' =
    r.preference === 'figosita' ? 'figosita'
    : r.preference === 'muscoli' ? 'muscoli'
    : r.preference === 'intelligenza' ? 'intelligenza'
    : 'carisma'

  // Mappa difficoltà → aspetto e soglie
  const aspettoMap: Record<Relationship['difficulty'], AspettoType> = {
    facile: 'normale',
    media: 'carina',
    difficile: 'bellissima',
  }
  const aspetto = aspettoMap[r.difficulty]

  let figositaRichiesta = aspetto === 'bellissima' ? 70 : aspetto === 'carina' ? 50 : 40
  let statusSociale = aspetto === 'bellissima' ? 80 : aspetto === 'carina' ? 60 : 50

  const personalita: PersonalitaType[] = ['timida', 'estroversa', 'secchiona', 'ribelle', 'vanitosa']
  const personalitaScelta = personalita[Math.floor(Math.random() * personalita.length)]
  if (personalitaScelta === 'vanitosa') { figositaRichiesta += 15; statusSociale += 20 }
  else if (personalitaScelta === 'timida') { figositaRichiesta -= 10; statusSociale -= 15 }

  const gelosa = personalitaScelta === 'vanitosa' || personalitaScelta === 'ribelle'

  const shuffledHobbies = [...HOBBY_OPTIONS].sort(() => Math.random() - 0.5)
  const hobby = shuffledHobbies.slice(0, Math.floor(Math.random() * 2) + 2)

  const eta = Math.floor(Math.random() * 5) + 14
  const anno = Math.floor(Math.random() * 5) + 1
  const sezione = String.fromCharCode(65 + Math.floor(Math.random() * 5))

  return {
    id: `girl_rel_${r.id}_${Date.now()}`,
    nome,
    cognome,
    gender: r.gender ?? 'F',
    orientamentoSessuale: r.orientamentoSessuale ?? DEFAULT_SEXUAL_ORIENTATION,
    eta,
    classe: `${anno}${sezione}`,
    aspetto,
    personalita: personalitaScelta,
    interessePerTe: 80,
    figositaRichiesta: Math.min(100, Math.max(20, figositaRichiesta)),
    statusSociale: Math.min(100, Math.max(20, statusSociale)),
    gelosa,
    hobby,
    coloreCapelli: COLORI_CAPELLI[Math.floor(Math.random() * COLORI_CAPELLI.length)],
    scuola: SCUOLE[Math.floor(Math.random() * SCUOLE.length)],
    statPreferita,
    relationshipStatus: 'fidanzata',
    stats: {
      totalDates: 1,
      messagesExchanged: 0,
      giftsGiven: 0,
      fightsHad: 0,
      dateActivities: [],
      relationshipStartDate: currentDateString,
      daysTogether: 0,
      jealousyLevel: gelosa ? 50 : 20,
      trustLevel: 60,
      happinessLevel: 80,
    },
    lastInteractionDate: currentDateString,
  }
}

export const getAspettoDescription = (aspetto: AspettoType): string => {
  switch (aspetto) {
    case 'bellissima':
      return 'Una BOMBA ATOMICA! Attira tutti gli sguardi'
    case 'carina':
      return 'Davvero carina, bella presenza'
    case 'normale':
      return 'Normale, niente di speciale ma simpatica'
    case 'alternativa':
      return 'Stile alternativo, diversa dalle altre'
  }
}

export const getPersonalitaDescription = (personalita: PersonalitaType): string => {
  switch (personalita) {
    case 'timida':
      return 'Timida e riservata, parla poco ma ascolta molto'
    case 'estroversa':
      return 'Solare ed estroversa, sempre al centro dell\'attenzione'
    case 'secchiona':
      return 'Secchiona DOC, passa le giornate sui libri'
    case 'ribelle':
      return 'Ribelle e anticonformista, fa quello che vuole'
    case 'vanitosa':
      return 'Vanitosa e attenta all\'immagine, pretende il meglio'
  }
}

export const getWhatSheLikes = (personalita: PersonalitaType, statPreferita: string): string[] => {
  const likes: string[] = []
  
  switch (personalita) {
    case 'vanitosa':
      likes.push('Apprezza chi ha FIGOSITÀ alta')
      likes.push('Vuole sentirsi al centro dell\'attenzione')
      likes.push('Adora i complimenti e l\'attenzione')
      break
    case 'secchiona':
      likes.push('Apprezza chi ha INTELLIGENZA alta')
      likes.push('Ama parlare di scuola e cultura')
      likes.push('Rispetta chi studia seriamente')
      break
    case 'ribelle':
      likes.push('Apprezza chi ha COATTAGGINE')
      likes.push('Apprezza chi e tosto e deciso')
      likes.push('Odia le regole e la noia')
      break
    case 'estroversa':
      likes.push('Apprezza chi ha CARISMA alto')
      likes.push('Adora uscire e divertirsi')
      likes.push('Apprezza chi sa far ridere')
      break
    case 'timida':
      likes.push('Apprezza la gentilezza e la pazienza')
      likes.push('Preferisce uscite tranquille')
      likes.push('Ha bisogno di tempo per aprirsi')
      break
  }
  
  if (statPreferita === 'muscoli') {
    likes.push('😍 Apprezza chi ha un fisico atletico')
  } else if (statPreferita === 'figosita') {
    likes.push('😍 Apprezza chi ha stile e presenza')
  } else if (statPreferita === 'intelligenza') {
    likes.push('😍 Apprezza chi e intelligente')
  } else if (statPreferita === 'carisma') {
    likes.push('😍 Apprezza chi sa parlare bene')
  }
  
  return likes
}

export const calculateMissingStats = (
  stats: GameStats,
  ragazza: Ragazza
): { stat: string; missing: number }[] => {
  const missing: { stat: string; missing: number }[] = []
  
  if (stats.figosita < ragazza.figositaRichiesta) {
    missing.push({
      stat: 'Figosità',
      missing: ragazza.figositaRichiesta - stats.figosita
    })
  }
  
  const statValue = ragazza.statPreferita === 'figosita' 
    ? stats.figosita
    : ragazza.statPreferita === 'muscoli'
    ? stats.muscoli
    : ragazza.statPreferita === 'intelligenza'
    ? stats.intelligenza
    : stats.carisma
  
  const requiredForPreferred = 60
  if (statValue < requiredForPreferred) {
    const statName = ragazza.statPreferita === 'figosita'
      ? 'Figosità'
      : ragazza.statPreferita === 'muscoli'
      ? 'Muscoli'
      : ragazza.statPreferita === 'intelligenza'
      ? 'Intelligenza'
      : 'Carisma'
    
    missing.push({
      stat: statName,
      missing: requiredForPreferred - statValue
    })
  }
  
  return missing
}

export const calculateInteresseGain = (
  azione: string,
  stats: GameStats,
  ragazza: Ragazza
): number => {
  let baseGain = 0
  
  switch (azione) {
    case 'messaggio':
      baseGain = 5
      break
    case 'cinema':
      baseGain = 15
      break
    case 'motorino':
      baseGain = 20
      break
    case 'compiti':
      baseGain = 10
      break
    case 'ingelosire':
      baseGain = ragazza.statusSociale < 50 ? 10 : -10
      break
  }
  
  const carismaBonus = Math.floor(stats.carisma / 10)
  return Math.min(100, baseGain + carismaBonus)
}

export const updateRelationshipStatus = (ragazza: Ragazza): RelationshipStatus => {
  if (ragazza.interessePerTe >= 90 && ragazza.relationshipStatus === 'fidanzata') {
    return 'fidanzata'
  }
  if (ragazza.interessePerTe >= 70) {
    return 'fidanzata'
  }
  if (ragazza.interessePerTe >= 50) {
    return 'interessata'
  }
  if (ragazza.interessePerTe >= 30) {
    return 'amica'
  }
  if (ragazza.interessePerTe >= 10) {
    return 'conoscente'
  }
  return 'sconosciuta'
}

export const performGirlfriendAction = (
  action: string,
  stats: GameStats,
  ragazza: Ragazza,
  currentDate: string
): {
  updatedGirlfriend: Ragazza
  statChanges: Partial<GameStats>
  gradeChange?: number
  message: string
} => {
  const updatedGirlfriend = { ...ragazza }
  const statChanges: Partial<GameStats> = {}
  let message = ''
  let gradeChange: number | undefined = undefined
  const partnerPronoun = getPartnerObjectPronoun(ragazza.gender)
  const gratefulAdjective = getPartnerAdjective(ragazza.gender, 'grato', 'grata')
  const happyAdjective = getPartnerAdjective(ragazza.gender, 'felicissimo', 'felicissima')

  switch (action) {
    case 'messaggio':
      updatedGirlfriend.stats.messagesExchanged += 1
      updatedGirlfriend.interessePerTe = Math.min(100, updatedGirlfriend.interessePerTe + 5)
      updatedGirlfriend.stats.happinessLevel = Math.min(100, updatedGirlfriend.stats.happinessLevel + 2)
      message = `Hai mandato un messaggio a ${ragazza.nome}. ${partnerPronoun === 'gli' ? 'Gli' : 'Le'} e piaciuto! +5 Interesse`
      break

    case 'cinema':
      updatedGirlfriend.stats.totalDates += 1
      updatedGirlfriend.stats.dateActivities.push({
        id: `date_${Date.now()}`,
        date: currentDate,
        activity: 'Cinema',
        interesseGain: 15,
        notes: 'Serata al cinema insieme'
      })
      updatedGirlfriend.interessePerTe = Math.min(100, updatedGirlfriend.interessePerTe + 15)
      updatedGirlfriend.stats.happinessLevel = Math.min(100, updatedGirlfriend.stats.happinessLevel + 10)
      statChanges.figosita = 5
      statChanges.soldi = -40
      message = `Hai portato ${ragazza.nome} al cinema! Serata fantastica! +15 Interesse, +5 Figosità, -40 Soldi`
      break

    case 'motorino':
      updatedGirlfriend.stats.totalDates += 1
      updatedGirlfriend.stats.dateActivities.push({
        id: `date_${Date.now()}`,
        date: currentDate,
        activity: 'Giro in motorino',
        interesseGain: 20,
        notes: 'Giro col motorino'
      })
      updatedGirlfriend.interessePerTe = Math.min(100, updatedGirlfriend.interessePerTe + 20)
      updatedGirlfriend.stats.happinessLevel = Math.min(100, updatedGirlfriend.stats.happinessLevel + 15)
      updatedGirlfriend.stats.trustLevel = Math.min(100, updatedGirlfriend.stats.trustLevel + 5)
      statChanges.coattaggine = 5
      statChanges.soldi = -20
      message = `Hai portato ${ragazza.nome} a fare un giro col motorino! Si e divertit${ragazza.gender === 'M' ? 'o' : 'a'} un sacco! +20 Interesse, +5 Coattaggine, -20 Soldi`
      break

    case 'compiti':
      updatedGirlfriend.stats.totalDates += 1
      updatedGirlfriend.interessePerTe = Math.min(100, updatedGirlfriend.interessePerTe + 10)
      updatedGirlfriend.stats.trustLevel = Math.min(100, updatedGirlfriend.stats.trustLevel + 10)
      statChanges.coattaggine = -10
      gradeChange = 0.3
      message = `Hai fatto i compiti a ${ragazza.nome}! E molto ${gratefulAdjective}! +10 Interesse, +0.3 Media, -10 Coattaggine`
      break

    case 'regalo':
      updatedGirlfriend.stats.giftsGiven += 1
      const interesseGain = ragazza.personalita === 'vanitosa' ? 20 : 15
      updatedGirlfriend.interessePerTe = Math.min(100, updatedGirlfriend.interessePerTe + interesseGain)
      updatedGirlfriend.stats.happinessLevel = Math.min(100, updatedGirlfriend.stats.happinessLevel + 20)
      statChanges.soldi = -60
      message = `Hai fatto un regalo a ${ragazza.nome}! E ${happyAdjective}! +${interesseGain} Interesse, -60 Soldi`
      break

    case 'dichiarati':
      if (ragazza.interessePerTe >= 70) {
        updatedGirlfriend.relationshipStatus = 'fidanzata'
        updatedGirlfriend.stats.relationshipStartDate = currentDate
        updatedGirlfriend.stats.happinessLevel = 100
        updatedGirlfriend.stats.trustLevel = Math.min(100, updatedGirlfriend.stats.trustLevel + 20)
        statChanges.figosita = 30
        statChanges.carisma = 15
        message = `${ragazza.nome} ha detto SI! Ora sei FIDANZATO! +30 Figosita, +15 Carisma`
      } else {
        updatedGirlfriend.interessePerTe = Math.max(0, updatedGirlfriend.interessePerTe - 20)
        statChanges.figosita = -20
        statChanges.carisma = -10
        message = `${ragazza.nome} ti ha dato il PALO! Hai provato troppo presto! -20 Interesse, -20 Figosità, -10 Carisma`
      }
      break

    case 'litigio':
      updatedGirlfriend.stats.fightsHad += 1
      updatedGirlfriend.interessePerTe = Math.max(0, updatedGirlfriend.interessePerTe - 15)
      updatedGirlfriend.stats.happinessLevel = Math.max(0, updatedGirlfriend.stats.happinessLevel - 20)
      updatedGirlfriend.stats.trustLevel = Math.max(0, updatedGirlfriend.stats.trustLevel - 10)
      if (ragazza.gelosa) {
        updatedGirlfriend.stats.jealousyLevel = Math.min(100, updatedGirlfriend.stats.jealousyLevel + 20)
      }
      message = `Hai litigato con ${ragazza.nome}! Non è stata una bella scena... -15 Interesse`
      break
  }

  updatedGirlfriend.lastInteractionDate = currentDate
  updatedGirlfriend.relationshipStatus = updateRelationshipStatus(updatedGirlfriend)

  return {
    updatedGirlfriend,
    statChanges,
    gradeChange,
    message
  }
}

export const calculateRelationshipHealth = (ragazza: Ragazza): {
  health: number
  status: string
  warnings: string[]
} => {
  const warnings: string[] = []
  
  let health = 50
  
  health += ragazza.stats.happinessLevel * 0.3
  health += ragazza.stats.trustLevel * 0.3
  health -= ragazza.stats.jealousyLevel * 0.2
  health -= ragazza.stats.fightsHad * 5
  
  if (ragazza.stats.totalDates > 0) {
    health += Math.min(20, ragazza.stats.totalDates * 2)
  }
  
  health = clampStat(health)
  
  if (ragazza.stats.jealousyLevel > 70) {
    warnings.push('È molto gelosa! Fai attenzione!')
  }
  
  if (ragazza.stats.happinessLevel < 30) {
    warnings.push('Non sembra felice ultimamente...')
  }
  
  if (ragazza.stats.trustLevel < 40) {
    warnings.push('Non si fida molto di te')
  }
  
  if (ragazza.stats.fightsHad > 3) {
    warnings.push('Avete litigato troppe volte!')
  }
  
  const daysSinceLastInteraction = ragazza.lastInteractionDate 
    ? calculateDaysSinceInteraction(ragazza.lastInteractionDate)
    : 0
  
  if (daysSinceLastInteraction > 7) {
    warnings.push(`Non vedi ${ragazza.nome} da ${daysSinceLastInteraction} giorni!`)
  }
  
  let status = 'Eccellente'
  if (health < 80) status = 'Buona'
  if (health < 60) status = 'Stabile'
  if (health < 40) status = 'Problematica'
  if (health < 20) status = 'In crisi'
  
  return { health, status, warnings }
}

const calculateDaysSinceInteraction = (lastDate: string): number => {
  return 0
}

export const shouldGirlfriendBreakup = (ragazza: Ragazza): boolean => {
  if (ragazza.relationshipStatus !== 'fidanzata') return false
  
  const health = calculateRelationshipHealth(ragazza)
  
  if (health.health < 15) return true
  if (ragazza.stats.fightsHad > 5) return true
  if (ragazza.interessePerTe < 20) return true
  
  return false
}

// ── Adapter — Sistema 4-assi (R18) ───────────────────────────────────────────

/**
 * Converte una Ragazza nel formato RelationStats del sistema 4 assi.
 * Usato per integrare la fidanzata con il sistema relazioni avanzato.
 */
export function girlfriendToRelation(girlfriend: Ragazza): RelationStats {
  return {
    amicizia:  girlfriend.stats.trustLevel ?? 30,
    romantico: girlfriend.interessePerTe,
    amore:     girlfriend.stats.happinessLevel ?? 0,
    odio:      0,
    rivalita:  0,
  }
}
