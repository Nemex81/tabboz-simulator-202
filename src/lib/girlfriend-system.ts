import { GameStats } from '@/lib/types'
import { randomChance } from '@/lib/game-utils'

export type AspettoType = 'carina' | 'bellissima' | 'normale' | 'alternativa'
export type PersonalitaType = 'timida' | 'estroversa' | 'secchiona' | 'ribelle' | 'vanitosa'

export interface Hobby {
  name: string
  icon: string
}

export interface Ragazza {
  id: string
  nome: string
  cognome: string
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
}

const NOMI_FEMMINILI = [
  'Jessica', 'Samantha', 'Deborah', 'Vanessa', 'Sabrina', 'Jennifer',
  'Melissa', 'Cristina', 'Nicole', 'Daniela', 'Federica', 'Valentina',
  'Alessia', 'Martina', 'Chiara', 'Elisa', 'Francesca', 'Giulia'
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

export const generateRandomGirlfriend = (): Ragazza => {
  const nome = NOMI_FEMMINILI[Math.floor(Math.random() * NOMI_FEMMINILI.length)]
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
    statPreferita
  }
}

export const getAspettoDescription = (aspetto: AspettoType): string => {
  switch (aspetto) {
    case 'bellissima':
      return 'Una BOMBA ATOMICA! Tutti se la girano a guardarla'
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
      return 'Ribelle e anticonformista, fa quello che le pare'
    case 'vanitosa':
      return 'Vanitosa e attenta all\'immagine, pretende il meglio'
  }
}

export const getWhatSheLikes = (personalita: PersonalitaType, statPreferita: string): string[] => {
  const likes: string[] = []
  
  switch (personalita) {
    case 'vanitosa':
      likes.push('Apprezza chi ha FIGOSITÀ alta')
      likes.push('Vuole essere trattata da regina')
      likes.push('Adora i complimenti e l\'attenzione')
      break
    case 'secchiona':
      likes.push('Apprezza chi ha INTELLIGENZA alta')
      likes.push('Le piace parlare di scuola e cultura')
      likes.push('Rispetta chi studia seriamente')
      break
    case 'ribelle':
      likes.push('Apprezza chi ha COATTAGGINE')
      likes.push('Le piacciono i tipi tosti e decisi')
      likes.push('Odia le regole e la noia')
      break
    case 'estroversa':
      likes.push('Apprezza chi ha CARISMA alto')
      likes.push('Adora uscire e divertirsi')
      likes.push('Le piace chi sa farla ridere')
      break
    case 'timida':
      likes.push('Apprezza la gentilezza e la pazienza')
      likes.push('Preferisce uscite tranquille')
      likes.push('Ha bisogno di tempo per aprirsi')
      break
  }
  
  if (statPreferita === 'muscoli') {
    likes.push('😍 Le piacciono i MUSCOLOSI')
  } else if (statPreferita === 'figosita') {
    likes.push('😍 Le piacciono i FIGHI')
  } else if (statPreferita === 'intelligenza') {
    likes.push('😍 Le piacciono gli INTELLIGENTI')
  } else if (statPreferita === 'carisma') {
    likes.push('😍 Le piace chi sa PARLARE BENE')
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
