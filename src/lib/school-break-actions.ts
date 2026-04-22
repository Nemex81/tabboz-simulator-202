// src/lib/school-break-actions.ts
// Fase 4A — 9 azioni per l'intervallo scolastico.
// Funzioni pure, zero dipendenze React.

import type {
  GameStats,
  Teacher,
  Classmate,
  HourSlot,
  SchoolRecord,
  TeacherMemoryEntry,
  GameDate,
  BreakActionType,
} from '@/lib/types'
import {
  applyTeacherRelationChange,
  getCorruptionChance,
  getThreatSuccess,
} from '@/lib/teacher-relations'
import { applyClassmateRelation } from '@/lib/classmate-relations'

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface BreakContext {
  stats: GameStats
  teachers: Teacher[]           // tutti i professori (per lookup)
  todayTeachers: Teacher[]      // solo i prof presenti oggi (da daySchedule) — C11
  classRoster: Classmate[]
  schoolRecord: SchoolRecord
  completedSlots: HourSlot[]    // slot lesson già completati — necessario per 'chiedi_revoca_voto' — C11
  selectedTarget?: string       // id compagno o professore
  currentDate: GameDate
}

export interface BreakResult {
  message: string
  statDelta: Partial<GameStats>
  /** Teacher aggiornato (se l'azione ha modificato la relazione). */
  updatedTeacher?: Teacher
  /** Compagno aggiornato (se l'azione ha modificato la relazione). */
  updatedClassmate?: Classmate
}

export interface BreakAction {
  type: BreakActionType
  label: string
  description: string
  category: 'compagno' | 'professore' | 'indipendente'
  available: (ctx: BreakContext) => boolean
  execute: (ctx: BreakContext) => BreakResult
}

// ── Helpers interni ───────────────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

function findTarget<T extends { id: string }>(list: T[], id?: string): T | undefined {
  if (!id) return undefined
  return list.find(item => item.id === id)
}

function emptyResult(message: string, statDelta?: Partial<GameStats>): BreakResult {
  return { message, statDelta: statDelta ?? {} }
}

// ── Azioni ────────────────────────────────────────────────────────────────────

const chiacchiera_compagno: BreakAction = {
  type: 'chiacchiera_compagno',
  label: 'Chiacchiera',
  description: 'Scambia due parole durante l\'intervallo. Migliora la relazione.',
  category: 'compagno',
  available: (ctx) => !!findTarget(ctx.classRoster, ctx.selectedTarget),
  execute: (ctx) => {
    const classmate = findTarget(ctx.classRoster, ctx.selectedTarget)
    if (!classmate) return emptyResult('Nessun compagno selezionato.')

    const relationDelta = randomInt(3, 8)
    const updated = applyClassmateRelation(classmate, relationDelta)
    return {
      message: `Hai chiacchierato con ${classmate.name}. Relazione +${relationDelta}.`,
      statDelta: { stanchezza: -2 },
      updatedClassmate: updated,
    }
  },
}

const studia_insieme: BreakAction = {
  type: 'studia_insieme',
  label: 'Studia insieme',
  description: 'Ripetete assieme. Migliora relazione e intelligenza.',
  category: 'compagno',
  available: (ctx) => !!findTarget(ctx.classRoster, ctx.selectedTarget),
  execute: (ctx) => {
    const classmate = findTarget(ctx.classRoster, ctx.selectedTarget)
    if (!classmate) return emptyResult('Nessun compagno selezionato.')

    const relationDelta = randomInt(2, 5)
    const updated = applyClassmateRelation(classmate, relationDelta)
    return {
      message: `Hai studiato con ${classmate.name}. Relazione +${relationDelta}, intelligenza +1.`,
      statDelta: { intelligenza: 1 },
      updatedClassmate: updated,
    }
  },
}

const risolvi_conflitto: BreakAction = {
  type: 'risolvi_conflitto',
  label: 'Risolvi conflitto',
  description: 'Tenta di fare pace. Disponibile solo se la relazione è negativa.',
  category: 'compagno',
  available: (ctx) => {
    const classmate = findTarget(ctx.classRoster, ctx.selectedTarget)
    return !!classmate && classmate.relation < 0
  },
  execute: (ctx) => {
    const classmate = findTarget(ctx.classRoster, ctx.selectedTarget)
    if (!classmate) return emptyResult('Nessun compagno selezionato.')

    const relationDelta = randomInt(10, 20)
    const updated = applyClassmateRelation(classmate, relationDelta)
    return {
      message: `Hai fatto pace con ${classmate.name}. Relazione +${relationDelta}.`,
      statDelta: {},
      updatedClassmate: updated,
    }
  },
}

const conversazione_prof: BreakAction = {
  type: 'conversazione_prof',
  label: 'Conversazione',
  description: 'Uno scambio cordiale con il professore. Migliora la relazione.',
  category: 'professore',
  available: (ctx) => !!findTarget(ctx.todayTeachers, ctx.selectedTarget),
  execute: (ctx) => {
    const teacher = findTarget(ctx.todayTeachers, ctx.selectedTarget)
    if (!teacher) return emptyResult('Nessun professore selezionato.')

    const delta = randomInt(3, 5)
    const updated = applyTeacherRelationChange(teacher, delta, 'conversazione', ctx.currentDate)
    return {
      message: `Hai parlato con ${teacher.name}. Relazione +${delta}.`,
      statDelta: {},
      updatedTeacher: updated,
    }
  },
}

const chiedi_spiegazione: BreakAction = {
  type: 'chiedi_spiegazione',
  label: 'Chiedi spiegazione',
  description: 'Ulteriori chiarimenti sulla lezione appena terminata.',
  category: 'professore',
  available: (ctx) => !!findTarget(ctx.todayTeachers, ctx.selectedTarget),
  execute: (ctx) => {
    const teacher = findTarget(ctx.todayTeachers, ctx.selectedTarget)
    if (!teacher) return emptyResult('Nessun professore selezionato.')

    const updated = applyTeacherRelationChange(teacher, 2, 'richiesta_spiegazione', ctx.currentDate)
    return {
      message: `${teacher.name} ti ha spiegato il concetto. Relazione +2, intelligenza +1.`,
      statDelta: { intelligenza: 1 },
      updatedTeacher: updated,
    }
  },
}

const chiedi_revoca_voto: BreakAction = {
  type: 'chiedi_revoca_voto',
  label: 'Chiedi revoca voto',
  description: 'Chiedi al professore di rivedere un voto insufficiente.',
  category: 'professore',
  available: (ctx) =>
    ctx.completedSlots.length > 0 &&
    !!findTarget(ctx.todayTeachers, ctx.selectedTarget),
  execute: (ctx) => {
    const teacher = findTarget(ctx.todayTeachers, ctx.selectedTarget)
    if (!teacher) return emptyResult('Nessun professore selezionato.')
    if (ctx.completedSlots.length === 0) return emptyResult('Nessuna ora completata da cui richiedere la revoca.')

    // Base chance = getCorruptionChance con amount=0 (solo corruttibilita e count)
    const baseChance = getCorruptionChance(teacher, 0)
    const roll = Math.random() * 100

    if (roll < baseChance) {
      const delta = randomInt(-5, -10)  // range con varianza narrativa: il prof accontenta ma a malincuore
      const updated = applyTeacherRelationChange(teacher, delta, 'richiesta_revoca_voto', ctx.currentDate)
      return {
        message: `${teacher.name} ha accettato di rivedere il voto. Relazione ${delta}.`,
        statDelta: {},
        updatedTeacher: updated,
      }
    } else {
      const delta = randomInt(-15, -5)
      const updated = applyTeacherRelationChange(teacher, delta, 'richiesta_revoca_voto', ctx.currentDate)
      return {
        message: `${teacher.name} ha rifiutato la richiesta di revoca. Relazione ${delta}.`,
        statDelta: {},
        updatedTeacher: updated,
      }
    }
  },
}

const corruzione_prof: BreakAction = {
  type: 'corruzione_prof',
  label: 'Corrompi professore',
  description: 'Offri 50€ per migliorare il voto. Rischioso.',
  category: 'professore',
  available: (ctx) => {
    const teacher = findTarget(ctx.todayTeachers, ctx.selectedTarget)
    return !!teacher && teacher.corruttibilita >= 3 && ctx.stats.soldi >= 50
  },
  execute: (ctx) => {
    const teacher = findTarget(ctx.todayTeachers, ctx.selectedTarget)
    if (!teacher) return emptyResult('Nessun professore selezionato.')

    const AMOUNT = 50
    const chance = getCorruptionChance(teacher, AMOUNT)
    const roll = Math.random() * 100

    if (roll < chance) {
      // Successo: voto simbolico + costo + relazione -10
      const updated = applyTeacherRelationChange(teacher, -10, 'corruzione', ctx.currentDate)
      return {
        message: `${teacher.name} ha accettato. Media potrebbe migliorare. Hai speso ${AMOUNT}€. Relazione -10.`,
        statDelta: { soldi: -AMOUNT },
        updatedTeacher: updated,
      }
    } else {
      // Fallimento: perdi i soldi + relazione -20
      const updated = applyTeacherRelationChange(teacher, -20, 'corruzione', ctx.currentDate)
      return {
        message: `${teacher.name} ha rifiutato con indignazione. Hai perso ${AMOUNT}€. Relazione -20.`,
        statDelta: { soldi: -AMOUNT },
        updatedTeacher: updated,
      }
    }
  },
}

const minaccia_prof: BreakAction = {
  type: 'minaccia_prof',
  label: 'Minaccia professore',
  description: 'Tenta di intimidire il professore. Molto rischioso.',
  category: 'professore',
  available: (ctx) => {
    const teacher = findTarget(ctx.todayTeachers, ctx.selectedTarget)
    return !!teacher && !teacher.isOstile
  },
  execute: (ctx) => {
    const teacher = findTarget(ctx.todayTeachers, ctx.selectedTarget)
    if (!teacher) return emptyResult('Nessun professore selezionato.')

    const { success, consequence } = getThreatSuccess(teacher)
    const updated = applyTeacherRelationChange(teacher, success ? 0 : -30, 'minaccia', ctx.currentDate)
    return {
      message: consequence,
      statDelta: {},
      updatedTeacher: updated,
    }
  },
}

const bar_scolastico: BreakAction = {
  type: 'bar_scolastico',
  label: 'Bar scolastico',
  description: 'Compra qualcosa al bar. Costa 2€ ma recuperi energia.',
  category: 'indipendente',
  available: (ctx) => ctx.stats.soldi >= 2,
  execute: (_ctx) => ({
    message: 'Ti sei concesso qualcosa al bar. Stanchezza -5, umore +3.',
    statDelta: { soldi: -2, stanchezza: -5, morale: 3 },
  }),
}

const riposa: BreakAction = {
  type: 'riposa',
  label: 'Riposa',
  description: 'Stai fermo e ricarichi le batterie.',
  category: 'indipendente',
  available: (_ctx) => true,
  execute: (_ctx) => ({
    message: 'Hai riposato durante l\'intervallo. Stanchezza -8.',
    statDelta: { stanchezza: -8 },
  }),
}

// ── Catalogo pubblico ─────────────────────────────────────────────────────────

/**
 * Tutte le 9 azioni disponibili durante l'intervallo scolastico.
 * Ordinate per categoria: compagno → professore → indipendente.
 */
export const BREAK_ACTIONS: BreakAction[] = [
  chiacchiera_compagno,
  studia_insieme,
  risolvi_conflitto,
  conversazione_prof,
  chiedi_spiegazione,
  chiedi_revoca_voto,
  corruzione_prof,
  minaccia_prof,
  bar_scolastico,
  riposa,
]

/**
 * Mappa tipo → azione per lookup rapido.
 */
export const BREAK_ACTIONS_BY_TYPE: Record<BreakActionType, BreakAction> = {
  chiacchiera_compagno,
  studia_insieme,
  risolvi_conflitto,
  conversazione_prof,
  chiedi_spiegazione,
  chiedi_revoca_voto,
  corruzione_prof,
  minaccia_prof,
  bar_scolastico,
  riposa,
}

/**
 * Restituisce le azioni disponibili per una categoria, filtrate per contesto.
 */
export function getAvailableActions(
  ctx: BreakContext,
  category: 'compagno' | 'professore' | 'indipendente'
): BreakAction[] {
  return BREAK_ACTIONS.filter(a => a.category === category && a.available(ctx))
}
