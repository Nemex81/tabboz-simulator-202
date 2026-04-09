// src/lib/classmate-relations.ts
// Fase 3B — Logica relazionale con i compagni di classe.
// Funzioni pure, zero dipendenze React.

import type { Classmate, Friend, FriendType } from '@/lib/types'
import type { RelationStats } from '@/lib/relation-system'

// ── Costanti ──────────────────────────────────────────────────────────────────

const RELATION_MIN = 0
const RELATION_MAX = 100

/** Soglia minima di relazione per promuovere un compagno ad amico. */
export const PROMOTION_THRESHOLD = 65

// ── Tipi ──────────────────────────────────────────────────────────────────────

export type ClassmateInteractionKey =
  | 'chiacchiera'
  | 'studia_insieme'
  | 'risolvi_conflitto'
  | 'litiga'
  | 'promuovi_amico'

export interface ClassmateInteraction {
  key: ClassmateInteractionKey
  label: string
  description: string
  /** Delta applicato a `Classmate.relation`.
   *  Se è un range [min, max] viene campionato uniformemente. */
  relationDelta: [number, number]
  /** Delta aggiuntivo su stats.intelligenza (0 se non applicabile). */
  intelligenzaDelta: number
  /** Se true, richiede relation >= PROMOTION_THRESHOLD */
  requiresPromotion: boolean
}

// ── Catalogo interazioni ──────────────────────────────────────────────────────

export const CLASSMATE_INTERACTIONS: Record<ClassmateInteractionKey, ClassmateInteraction> = {
  chiacchiera: {
    key: 'chiacchiera',
    label: 'Chiacchiera',
    description: 'Una conversazione leggera tra un\'ora e l\'altra.',
    relationDelta: [3, 8],
    intelligenzaDelta: 0,
    requiresPromotion: false,
  },
  studia_insieme: {
    key: 'studia_insieme',
    label: 'Studia insieme',
    description: 'Ripetete assieme: aumenta la relazione e la concentrazione.',
    relationDelta: [2, 5],
    intelligenzaDelta: 1,
    requiresPromotion: false,
  },
  risolvi_conflitto: {
    key: 'risolvi_conflitto',
    label: 'Risolvi conflitto',
    description: 'Provate a chiarirvi dopo una tensione in classe.',
    relationDelta: [10, 20],
    intelligenzaDelta: 0,
    requiresPromotion: false,
  },
  litiga: {
    key: 'litiga',
    label: 'Litigate',
    description: 'Una discussione che finisce male.',
    relationDelta: [-20, -10],
    intelligenzaDelta: 0,
    requiresPromotion: false,
  },
  promuovi_amico: {
    key: 'promuovi_amico',
    label: 'Diventate amici',
    description: 'Siete abbastanza in sintonia da diventare veri amici.',
    relationDelta: [0, 0],
    intelligenzaDelta: 0,
    requiresPromotion: true,
  },
}

// ── Funzioni pubbliche ────────────────────────────────────────────────────────

/**
 * Applica un delta alla relazione del compagno, con clamping [0, 100].
 *
 * @param classmate - Oggetto sorgente (NON mutato).
 * @param delta     - Valore da aggiungere.
 * @returns Nuovo oggetto Classmate con `relation` aggiornata.
 */
export function applyClassmateRelation(classmate: Classmate, delta: number): Classmate {
  const newRelation = Math.max(RELATION_MIN, Math.min(RELATION_MAX, classmate.relation + delta))
  return { ...classmate, relation: newRelation }
}

/**
 * Calcola il delta effettivo per un tipo di interazione campionando il range.
 *
 * @param interactionKey - Chiave interazione.
 * @returns Delta numerico da passare ad `applyClassmateRelation`.
 */
export function sampleInteractionDelta(interactionKey: ClassmateInteractionKey): number {
  const interaction = CLASSMATE_INTERACTIONS[interactionKey]
  const [min, max] = interaction.relationDelta
  if (min === max) return min
  return Math.round(min + Math.random() * (max - min))
}

/**
 * Promuove un compagno ad amico, creando un oggetto `Friend` con
 * `originType: 'compagno_classe'` e `amicizia` mappata dalla relazione attuale.
 *
 * @param classmate  - Compagno da promuovere.
 * @param schoolYear - Anno scolastico corrente (usato come `schoolYearMet`).
 * @throws Error se `classmate.relation < PROMOTION_THRESHOLD`.
 * @returns Nuovo oggetto Friend compatibile con il sistema relazioni.
 */
export function promoteToFriend(classmate: Classmate, schoolYear: number): Friend {
  if (classmate.relation < PROMOTION_THRESHOLD) {
    throw new Error(
      `Impossibile promuovere ${classmate.name}: relazione ${classmate.relation} < ${PROMOTION_THRESHOLD}`
    )
  }

  const amicizia = classmate.relation

  const rel: RelationStats = {
    amicizia,
    romantico: 0,
    amore: 0,
    odio: 0,
    rivalita: 0,
  }

  const friend: Friend = {
    id: classmate.id,
    name: classmate.name,
    type: classmate.type as FriendType,
    intelligenza: classmate.intelligenza,
    unlocked: true,
    originType: 'compagno_classe',
    metAt: 'classe',
    schoolYearMet: schoolYear,
    rel,
  }

  return friend
}
