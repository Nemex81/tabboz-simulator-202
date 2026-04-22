// src/lib/character-traits.ts
// Sistema Tratti Caratteriali — ispirato a CK3.
// I tratti definiscono CHI è il personaggio, non cosa sa fare.
// Influenzano modificatori passivi alle stat e la soglia di psychStress.

import { GameStats } from '@/lib/types'

export type TraitId =
  | 'gregario'    | 'solitario'
  | 'coraggioso'  | 'codardo'
  | 'ambizioso'   | 'pigro'
  | 'onesto'      | 'bugiardo'
  | 'calmo'       | 'irascibile'
  | 'carismatico' | 'timido'
  | 'atletico'    | 'imbranato'
  | 'creativo'    | 'conformista'

export interface CharacterTrait {
  id: TraitId
  label: string
  emoji: string
  opposite: TraitId | null
  stressModifier: number
  statBonuses: Partial<GameStats>
  description: string
}

export const ALL_TRAITS: Record<TraitId, CharacterTrait> = {
  gregario:     { id: 'gregario',     label: 'Gregario',     emoji: '😄', opposite: 'solitario',   stressModifier: -5, statBonuses: { carisma: 1 },       description: 'Ami stare in compagnia. Le azioni sociali ti stressano meno.' },
  solitario:    { id: 'solitario',    label: 'Solitario',    emoji: '🎧', opposite: 'gregario',    stressModifier: +5, statBonuses: { intelligenza: 1 },   description: 'Preferisci stare da solo. Le azioni sociali ti costano di più.' },
  coraggioso:   { id: 'coraggioso',   label: 'Coraggioso',   emoji: '🦁', opposite: 'codardo',     stressModifier: -3, statBonuses: { coattaggine: 1 },   description: 'Non ti spaventi facilmente. Meno stress nelle situazioni a rischio.' },
  codardo:      { id: 'codardo',      label: 'Codardo',      emoji: '🐔', opposite: 'coraggioso',  stressModifier: +8, statBonuses: {},                   description: 'Eviti i confronti. Situazioni rischiose generano molto stress.' },
  ambizioso:    { id: 'ambizioso',    label: 'Ambizioso',    emoji: '🏆', opposite: 'pigro',       stressModifier: +3, statBonuses: { reputazione: 1 },   description: 'Punti sempre in alto. Ottieni più reputazione ma accumuli stress.' },
  pigro:        { id: 'pigro',        label: 'Pigro',        emoji: '🛋️', opposite: 'ambizioso',   stressModifier: -8, statBonuses: { stanchezza: -1 },   description: 'Prendi la vita con calma. Meno stress ma meno progressi.' },
  onesto:       { id: 'onesto',       label: 'Onesto',       emoji: '✋', opposite: 'bugiardo',    stressModifier: -2, statBonuses: { carisma: 1 },       description: 'Non sai mentire. Guadagni fiducia più facilmente.' },
  bugiardo:     { id: 'bugiardo',     label: 'Bugiardo',     emoji: '🤥', opposite: 'onesto',      stressModifier: +4, statBonuses: { figosita: 1 },      description: 'Dici quello che fa comodo. Funziona, ma pesa sulla coscienza.' },
  calmo:        { id: 'calmo',        label: 'Calmo',        emoji: '😌', opposite: 'irascibile',  stressModifier: -6, statBonuses: {},                   description: 'Difficile farti perdere la testa. Stress sempre sotto controllo.' },
  irascibile:   { id: 'irascibile',   label: 'Irascibile',   emoji: '😤', opposite: 'calmo',       stressModifier: +6, statBonuses: { coattaggine: 1 },   description: 'Scatti facilmente. Guadagni coattaggine ma accumuli stress veloce.' },
  carismatico:  { id: 'carismatico',  label: 'Carismatico',  emoji: '⭐', opposite: 'timido',      stressModifier: -4, statBonuses: { carisma: 2 },       description: 'Le persone ti ascoltano naturalmente.' },
  timido:       { id: 'timido',       label: 'Timido',       emoji: '🙈', opposite: 'carismatico', stressModifier: +7, statBonuses: { intelligenza: 1 },  description: 'Fai fatica nelle situazioni sociali. Ci vuole più coraggio.' },
  atletico:     { id: 'atletico',     label: 'Atletico',     emoji: '💪', opposite: 'imbranato',   stressModifier: -3, statBonuses: { muscoli: 2 },       description: 'Il fisico viene naturale. Palestra più efficace.' },
  imbranato:    { id: 'imbranato',    label: 'Imbranato',    emoji: '🤦', opposite: 'atletico',    stressModifier: +4, statBonuses: {},                   description: 'Non sei portato per lo sport. Ci vuole il doppio della fatica.' },
  creativo:     { id: 'creativo',     label: 'Creativo',     emoji: '🎨', opposite: 'conformista', stressModifier: -2, statBonuses: { figosita: 1 },      description: 'Pensi fuori dagli schemi. Ti distingui dagli altri.' },
  conformista:  { id: 'conformista',  label: 'Conformista',  emoji: '🐑', opposite: 'creativo',    stressModifier: -1, statBonuses: { reputazione: 1 },   description: 'Segui le regole. Meno rischi, meno sorprese.' },
}

export const generateRandomTraits = (count: 2 | 3 = 2): TraitId[] => {
  const allIds = Object.keys(ALL_TRAITS) as TraitId[]
  const result: TraitId[] = []
  while (result.length < count) {
    const candidate = allIds[Math.floor(Math.random() * allIds.length)]
    const trait = ALL_TRAITS[candidate]
    const hasOpposite = trait.opposite && result.includes(trait.opposite)
    if (!hasOpposite && !result.includes(candidate)) {
      result.push(candidate)
    }
  }
  return result
}

export const getTraitsStressModifier = (traits: TraitId[]): number =>
  traits.reduce((sum, id) => sum + ALL_TRAITS[id].stressModifier, 0)

export const getTraitsStatBonuses = (traits: TraitId[]): Partial<GameStats> => {
  const result: Partial<GameStats> = {}
  const numericResult = result as unknown as Record<string, number | undefined>
  for (const id of traits) {
    for (const [key, val] of Object.entries(ALL_TRAITS[id].statBonuses)) {
      numericResult[key] = (numericResult[key] ?? 0) + (val as number)
    }
  }
  return result
}
