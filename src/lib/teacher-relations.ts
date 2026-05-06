// src/lib/teacher-relations.ts
// Fase 3A — Logica relazionale con i professori.
// Funzioni pure, zero dipendenze React.

import type { Teacher, TeacherMemoryEntry, GameDate } from '@/lib/types'

// ── Costanti ──────────────────────────────────────────────────────────────────

const MAX_MEMORIA = 20
const RELATION_MIN = 0
const RELATION_MAX = 100
const CORRUPTION_CHANCE_MIN = 5
const CORRUPTION_CHANCE_MAX = 85
const THREAT_CHANCE_MIN = 5
const THREAT_CHANCE_MAX = 70
const ISTERESI = 10   // margine sopra sogliaRottura prima che isOstile torni false

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function resolveOstilita(teacher: Teacher, newRelazione: number): boolean {
  if (newRelazione < teacher.sogliaRottura) return true
  if (newRelazione > teacher.sogliaRottura + ISTERESI) return false
  // Zona di isteresi: mantieni il valore attuale
  return teacher.isOstile
}

// ── Funzioni pubbliche ────────────────────────────────────────────────────────

/**
 * Applica un cambiamento alla relazione con il professore e aggiorna i campi
 * derivati (isOstile, corruptionCount, threatCount, corruttibilita, memoria).
 *
 * @param teacher  - Copia dell'oggetto Teacher da aggiornare (NON mutato).
 * @param change   - Delta numerico da applicare a `relazione`.
 *                   Per corruzione riuscita: già applicato, la funzione gestisce
 *                   solo il calo di corruttibilita.
 *                   Per minaccia subita: già applicato come penalty extra dalla funzione.
 * @param reason   - Tipo di interazione, registrato in `memoria`.
 * @param date     - Data corrente di gioco, registrata in `memoria`.
 * @returns Nuovo oggetto Teacher con tutti i campi aggiornati.
 */
export function applyTeacherRelationChange(
  teacher: Teacher,
  change: number,
  reason: TeacherMemoryEntry['type'],
  date: GameDate
): Teacher {
  let effectiveChange = change
  let newCorruttibilita = teacher.corruttibilita

  // ── Penalità specifiche per tipo di interazione ────────────────────────────
  if (reason === 'minaccia') {
    // Relazione extra penalizzata dalla resistenza
    effectiveChange = -(15 + teacher.resistenzaMinacce * 2)
  }

  if (reason === 'corruzione') {
    // La corruttibilita cala per ogni tentativo riuscito (minimo 1)
    newCorruttibilita = Math.max(1, teacher.corruttibilita - 0.5)
  }

  // ── Calcolo nuova relazione ────────────────────────────────────────────────
  const newRelazione = clamp(teacher.relazione + effectiveChange, RELATION_MIN, RELATION_MAX)

  // ── Aggiornamento contatori ────────────────────────────────────────────────
  const newCorruptionCount =
    reason === 'corruzione' ? teacher.corruptionCount + 1 : teacher.corruptionCount
  const newThreatCount =
    reason === 'minaccia' ? teacher.threatCount + 1 : teacher.threatCount

  // ── Aggiornamento memoria (FIFO, max 20 voci) ─────────────────────────────
  const entry: TeacherMemoryEntry = {
    type: reason,
    date,
    detail: buildMemoryDetail(reason, effectiveChange),
    impactOnRelation: effectiveChange,
  }
  const newMemoria = [...teacher.memoria, entry].slice(-MAX_MEMORIA)

  return {
    ...teacher,
    relazione: newRelazione,
    corruttibilita: newCorruttibilita,
    corruptionCount: newCorruptionCount,
    threatCount: newThreatCount,
    isOstile: resolveOstilita(teacher, newRelazione),
    memoria: newMemoria,
  }
}

/**
 * Calcola la probabilità percentuale che il professore accetti una corruzione.
 * Formula: (corruttibilita * 10 + amount / 5 - corruptionCount * 8), clamped 5-85.
 *
 * @param teacher - Oggetto Teacher.
 * @param amount  - Quantità di soldi offerti.
 * @returns Probabilità in percentuale (5-85).
 */
export function getCorruptionChance(teacher: Teacher, amount: number): number {
  const raw =
    teacher.corruttibilita * 10 +
    amount / 5 -
    teacher.corruptionCount * 8
  return clamp(Math.round(raw), CORRUPTION_CHANCE_MIN, CORRUPTION_CHANCE_MAX)
}

/**
 * Calcola l'esito di un tentativo di minaccia al professore.
 * Formula: (10 - resistenzaMinacce) * 10, clamped 5-70.
 *
 * @param teacher - Oggetto Teacher.
 * @returns Oggetto con `success` (boolean) e `consequence` (sting narrativa).
 */
export function getThreatSuccess(
  teacher: Teacher
): { success: boolean; consequence: string } {
  const chance = clamp((10 - teacher.resistenzaMinacce) * 10, THREAT_CHANCE_MIN, THREAT_CHANCE_MAX)
  const roll = Math.random() * 100
  const success = roll < chance

  const consequence = success
    ? buildSuccessThreatConsequence(teacher)
    : buildFailureThreatConsequence(teacher)

  return { success, consequence }
}

// ── Narrativa ─────────────────────────────────────────────────────────────────

function buildMemoryDetail(reason: TeacherMemoryEntry['type'], delta: number): string {
  switch (reason) {
    case 'corruzione':
      return delta >= 0
        ? 'Corruzione riuscita: il prof ha accettato.'
        : 'Tentativo di corruzione fallito.'
    case 'minaccia':
      return `Minaccia subita. Relazione: ${delta > 0 ? '+' : ''}${delta}.`
    case 'buon_voto':
      return 'Ottima prestazione interrogazione/compito.'
    case 'cattivo_voto':
      return 'Prestazione insufficiente interrogazione/compito.'
    case 'conversazione':
      return 'Breve conversazione durante l\'intervallo.'
    case 'richiesta_spiegazione':
      return 'Richiesta di spiegazione dopo la lezione.'
    case 'richiesta_revoca_voto':
      return 'Tentativo di far revocare un voto.'
    default:
      return `Interazione (${reason}). Delta: ${delta}.`
  }
}

function buildSuccessThreatConsequence(teacher: Teacher): string {
  const outcomes = [
    `${teacher.name} impallidisc e annuisce nervosamente. La minaccia ha funzionato.`,
    `${teacher.name} abbassa lo sguardo. Non dirà niente a nessuno.`,
    `"Va bene, lasceremo perdere." — ${teacher.name} cede.`,
    `${teacher.name} sembra spaventato/a. Ottieni quello che vuoi.`,
  ]
  return outcomes[Math.floor(Math.random() * outcomes.length)]
}

function buildFailureThreatConsequence(teacher: Teacher): string {
  const outcomes = [
    `${teacher.name} non si fa intimidire. Anzi, ora è furioso/a.`,
    `"Puoi provarci." — ${teacher.name} ti fissa con aria sfidante.`,
    `La minaccia ritorna contro di te: ${teacher.name} riferisce tutto al preside.`,
    `${teacher.name} ride della tua minaccia. Pessima mossa.`,
  ]
  return outcomes[Math.floor(Math.random() * outcomes.length)]
}
