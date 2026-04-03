/**
 * Mappa statica delle azioni disponibili per fascia oraria e tipo di giorno.
 * Viene usata da `getAvailableActions()` in `useGameActions` per filtrare
 * le azioni che il giocatore può compiere nella fase corrente.
 */
import { DayPhase, DayType } from '@/lib/types'

export type ActionId =
  | 'palestra'
  | 'lampada'
  | 'lavoro'
  | 'motorino'
  | 'studia'
  | 'corrompi'
  | 'minaccia'
  | 'riposa'
  | 'disco'
  | 'cinema'
  | 'shopping'

export interface PhaseActionEntry {
  id: ActionId
  label: string
  minSchoolYear?: number
  requiresSchoolPeriod?: boolean
  blockedWhenExhausted?: boolean
}

/** Azioni disponibili per ogni combinazione (DayPhase, DayType). */
export const PHASE_ACTIONS: Record<DayType, Record<DayPhase, PhaseActionEntry[]>> = {
  feriale: {
    mattina: [
      // 'studia' rimossa: la mattina scolastica è gestita da SchoolMorningPanel
      { id: 'riposa', label: 'Sei a scuola! (salta per oggi)' },
    ],
    pomeriggio: [
      { id: 'palestra', label: 'Vai in palestra' },
      { id: 'studia', label: 'Studia a casa' },
      { id: 'lavoro', label: 'Lavoro part-time', minSchoolYear: 3 },
      { id: 'motorino', label: 'Giro col motorino' },
      { id: 'shopping', label: 'Shopping in centro' },
    ],
    sera: [
      { id: 'cinema', label: 'Vai al cinema' },
      { id: 'studia', label: 'Studia la sera' },
      { id: 'riposa', label: 'Riposati' },
      { id: 'motorino', label: 'Giro serale col motorino' },
    ],
    notte: [
      { id: 'riposa', label: 'Dormi (automatico)' },
    ],
  },
  sabato: {
    mattina: [
      { id: 'palestra', label: 'Allenamento mattutino' },
      { id: 'lampada', label: 'Lampada UV' },
      { id: 'shopping', label: 'Shopping al mercato' },
      { id: 'riposa', label: 'Dormi fino a tardi' },
    ],
    pomeriggio: [
      { id: 'palestra', label: 'Vai in palestra' },
      { id: 'motorino', label: 'Giro motorini' },
      { id: 'shopping', label: 'Shopping in centro' },
      { id: 'lavoro', label: 'Lavoro part-time', minSchoolYear: 3 },
    ],
    sera: [
      { id: 'disco', label: 'Discoteca' },
      { id: 'cinema', label: 'Cinema con amici' },
      { id: 'motorino', label: 'Gara di motorini' },
    ],
    notte: [
      { id: 'riposa', label: 'Dormi (automatico)' },
    ],
  },
  domenica: {
    mattina: [
      { id: 'riposa', label: 'Dormi fino a tardissimo' },
      { id: 'palestra', label: 'Sport domenicale' },
    ],
    pomeriggio: [
      { id: 'studia', label: 'Studia per la settimana', requiresSchoolPeriod: true },
      { id: 'palestra', label: 'Sport domenicale' },
      { id: 'motorino', label: 'Giro domenicale' },
    ],
    sera: [
      // La sera domenicale è occupata dall'evento narrativo "Ansia del Lunedì"
      { id: 'studia', label: 'Rivedi gli appunti', requiresSchoolPeriod: true },
      { id: 'riposa', label: 'Riposati' },
    ],
    notte: [
      { id: 'riposa', label: 'Dormi (automatico)' },
    ],
  },
  festivo: {
    mattina: [
      { id: 'riposa', label: 'Riposa il giorno di festa' },
      { id: 'palestra', label: 'Sport' },
    ],
    pomeriggio: [
      { id: 'shopping', label: 'Shopping' },
      { id: 'cinema', label: 'Cinema' },
      { id: 'motorino', label: 'Giro col motorino' },
    ],
    sera: [
      { id: 'disco', label: 'Discoteca festiva' },
      { id: 'cinema', label: 'Cinema serale' },
      { id: 'riposa', label: 'Riposati' },
    ],
    notte: [
      { id: 'riposa', label: 'Dormi (automatico)' },
    ],
  },
}

/**
 * Restituisce le azioni disponibili nella fascia corrente, filtrando per
 * anno scolastico e periodo scolastico.
 */
export const getAvailableActions = (
  phase: DayPhase,
  dayType: DayType,
  schoolYear: number,
  isSchoolPeriod: boolean
): PhaseActionEntry[] => {
  const pool = PHASE_ACTIONS[dayType][phase] ?? []
  return pool.filter(entry => {
    if (entry.minSchoolYear && schoolYear < entry.minSchoolYear) return false
    if (entry.requiresSchoolPeriod && !isSchoolPeriod) return false
    return true
  })
}
