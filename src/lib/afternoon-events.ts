// src/lib/afternoon-events.ts
// Pool di eventi narrativi per le fasi pomeridiane/serali.
// Pattern identico a school-morning-events.ts — interfacce + catalogo + funzione di selezione.

import { GameStats, Friend } from '@/lib/types'
import { generateExtraFriend, generateSchoolFriend } from '@/lib/enhanced-friend-system'

// ── Tipi ──────────────────────────────────────────────────────────────────────

export type AfternoonLocation =
  | 'palestra' | 'festa' | 'sport' | 'online'
  | 'quartiere' | 'lavoro' | 'centro_commerciale'

export interface AfternoonChoice {
  id: string
  label: string
  outcome: (stats: GameStats) => {
    delta: Partial<GameStats>
    message: string
    newFriend?: Friend
    /** Se presente, applicare rivalita a un amico random esistente (gestito dal layer hook) */
    rivalitaDelta?: number
  }
}

export interface AfternoonEvent {
  id: string
  location: AfternoonLocation
  title: string
  description: string
  probability: number     // 0-100
  choices: AfternoonChoice[]
}

// ── Catalogo ──────────────────────────────────────────────────────────────────

export const AFTERNOON_EVENTS: AfternoonEvent[] = [

  // 1. PALESTRA — sfida
  {
    id: 'ae_palestra_sfida',
    location: 'palestra',
    title: 'Sfida in palestra',
    description: 'Qualcuno ti sfida a una serie di esercizi.',
    probability: 25,
    choices: [
      {
        id: 'accetta',
        label: 'Accetta la sfida',
        outcome: (s) => {
          if (s.muscoli > 40) {
            const newFriend = generateExtraFriend('palestra')
            return {
              delta: { muscoli: 8, carisma: 5 },
              message: `Hai vinto! ${newFriend.name} ti rispetta. +8 Muscoli, +5 Carisma`,
              newFriend,
            }
          }
          return {
            delta: { stanchezza: 15, morale: -5 },
            message: 'Non ce l\'hai fatta... +15 Stanchezza, -5 Morale',
          }
        },
      },
      {
        id: 'declina',
        label: 'Declina educatamente',
        outcome: () => ({
          delta: { stanchezza: -5 },
          message: 'Ti risparmi la fatica. -5 Stanchezza',
        }),
      },
    ],
  },

  // 2. FESTA — presentazione
  {
    id: 'ae_festa_presentazione',
    location: 'festa',
    title: 'Ti presentano qualcuno',
    description: 'Un tuo conoscente ti presenta qualcuno di nuovo.',
    probability: 30,
    choices: [
      {
        id: 'avvicinati',
        label: 'Ti avvicini e fai conversazione',
        outcome: () => {
          const newFriend = generateExtraFriend('festa')
          return {
            delta: { carisma: 3 },
            message: `Hai conosciuto ${newFriend.name}! +3 Carisma`,
            newFriend,
          }
        },
      },
      {
        id: 'disparte',
        label: 'Rimani in disparte',
        outcome: () => ({
          delta: { morale: -3 },
          message: 'Stai per conto tuo. -3 Morale',
        }),
      },
    ],
  },

  // 3. SPORT — torneo
  {
    id: 'ae_sport_torneo',
    location: 'sport',
    title: 'Avversario simpatico',
    description: 'Stai giocando e un avversario ti sembra simpatico.',
    probability: 20,
    choices: [
      {
        id: 'approccio',
        label: 'Lo approcci a fine partita',
        outcome: () => {
          const newFriend = generateExtraFriend('sport')
          return {
            delta: { carisma: 2 },
            message: `Hai conosciuto ${newFriend.name}! +2 Carisma`,
            newFriend,
          }
        },
      },
      {
        id: 'vai_via',
        label: 'Te ne vai',
        outcome: () => ({
          delta: {},
          message: 'Partita e via, niente di nuovo.',
        }),
      },
    ],
  },

  // 4. ONLINE — gaming
  {
    id: 'ae_online_gaming',
    location: 'online',
    title: 'Compagno di gioco',
    description: 'Fai una partita online con uno sconosciuto, giocate bene insieme.',
    probability: 20,
    choices: [
      {
        id: 'scrivi',
        label: 'Gli scrivi in privato',
        outcome: () => {
          const newFriend = generateExtraFriend('online')
          return {
            delta: { morale: 5 },
            message: `Hai conosciuto ${newFriend.name} online! +5 Morale`,
            newFriend,
          }
        },
      },
      {
        id: 'esci',
        label: 'Esci dal gioco',
        outcome: () => ({
          delta: {},
          message: 'Bella partita, ma ognuno per la sua strada.',
        }),
      },
    ],
  },

  // 5. QUARTIERE — incontro
  {
    id: 'ae_quartiere_incontro',
    location: 'quartiere',
    title: 'Faccia nota',
    description: 'Rivedi una persona del quartiere che non vedevi da tempo.',
    probability: 20,
    choices: [
      {
        id: 'fermati',
        label: 'Ti fermi a parlare',
        outcome: () => {
          const newFriend = generateExtraFriend('quartiere')
          return {
            delta: { carisma: 3 },
            message: `Hai ritrovato ${newFriend.name}! +3 Carisma`,
            newFriend,
          }
        },
      },
      {
        id: 'finta',
        label: 'Fai finta di niente',
        outcome: () => ({
          delta: { morale: -2 },
          message: 'Lo/la ignori. Un po\' di imbarazzo. -2 Morale',
        }),
      },
    ],
  },

  // 6. LAVORO — collega
  {
    id: 'ae_lavoro_collega',
    location: 'lavoro',
    title: 'Invito del collega',
    description: 'Un collega ti invita a prendere qualcosa dopo il turno.',
    probability: 25,
    choices: [
      {
        id: 'accetta',
        label: 'Accetti l\'invito',
        outcome: () => {
          const newFriend = generateExtraFriend('lavoro')
          return {
            delta: { morale: 8, stanchezza: 5 },
            message: `Serata con ${newFriend.name}! +8 Morale, +5 Stanchezza`,
            newFriend,
          }
        },
      },
      {
        id: 'declina',
        label: 'Declini, sei stanco',
        outcome: () => ({
          delta: {},
          message: 'Vai dritto a casa. Soldi risparmiati.',
        }),
      },
    ],
  },

  // 7. CENTRO COMMERCIALE — incontro scolastico fuori contesto
  {
    id: 'ae_centro_incontro',
    location: 'centro_commerciale',
    title: 'Incontro fuori contesto',
    description: 'Incontri per caso qualcuno della tua scuola fuori contesto.',
    probability: 15,
    choices: [
      {
        id: 'saluta',
        label: 'Lo saluti e vi fermate a parlare',
        outcome: () => {
          // Unico afternoon event che genera compagno_istituto
          const newFriend = generateSchoolFriend('compagno_istituto')
          return {
            delta: { carisma: 2 },
            message: `Hai conosciuto ${newFriend.name} della tua scuola! +2 Carisma`,
            newFriend,
          }
        },
      },
      {
        id: 'ignora',
        label: 'Lo ignori',
        outcome: () => ({
          delta: {},
          message: 'Fai finta di non vederlo/a.',
        }),
      },
    ],
  },

  // 8. FESTA — litigata (usa rivalitaDelta — richiede Passo 1 completato)
  {
    id: 'ae_festa_litigata',
    location: 'festa',
    title: 'Provocazione alla festa',
    description: 'La serata degenera, qualcuno ti provoca.',
    probability: 15,
    choices: [
      {
        id: 'rispondi',
        label: 'Rispondi per le rime',
        outcome: () => ({
          delta: { morale: -10, reputazione: 5 },
          message: 'Sei stato duro. +5 Reputazione, -10 Morale',
          rivalitaDelta: 20,  // applicato a un amico random dal layer hook in useEventEngine.ts
        }),
      },
      {
        id: 'allontanati',
        label: 'Ti allontani',
        outcome: () => ({
          delta: { morale: -5 },
          message: 'Eviti guai, ma la cosa ti pesa. -5 Morale',
        }),
      },
    ],
  },
]

// ── Funzione di selezione ─────────────────────────────────────────────────────

/**
 * Restituisce un evento casuale per la location specificata, rispettando le
 * probabilità individuali. Restituisce null se nessun evento si attiva.
 */
export function getAfternoonEvent(
  location: AfternoonLocation
): AfternoonEvent | null {
  const candidates = AFTERNOON_EVENTS.filter(e => e.location === location)
  if (candidates.length === 0) return null
  const triggered = candidates.filter(e => Math.random() * 100 < e.probability)
  if (triggered.length === 0) return null
  return triggered[Math.floor(Math.random() * triggered.length)]
}
