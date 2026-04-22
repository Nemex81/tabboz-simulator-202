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
  | 'dormi'
  | 'disco'
  | 'cinema'
  | 'shopping'
  | 'chiacchiera'
  | 'online'
  | 'parco'
  | 'telefona'
  | 'studia_gruppo'

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
      // A1: mattina scolastica feriale — nessuna azione libera, gestita da SchoolMorningPanel
      // Il lavoro è visibile per chi marina o fuori periodo scolastico
      { id: 'lavoro', label: 'Lavoro part-time' },
    ],
    pomeriggio: [
      { id: 'palestra', label: 'Vai in palestra' },
      { id: 'studia', label: 'Studia a casa' },
      { id: 'studia_gruppo', label: 'Studia in gruppo', requiresSchoolPeriod: true },
      { id: 'lavoro', label: 'Lavoro part-time' },
      { id: 'motorino', label: 'Giro col motorino' },
      { id: 'shopping', label: 'Shopping in centro' },
      { id: 'riposa', label: 'Riposa un po\' (25-35% stanchezza)' },
      { id: 'parco', label: 'Socializza nel quartiere' },
      { id: 'chiacchiera', label: 'Chiacchiera in giro' },
    ],
    sera: [
      { id: 'cinema', label: 'Vai al cinema' },
      { id: 'studia', label: 'Studia la sera' },
      { id: 'motorino', label: 'Giro serale col motorino' },
      { id: 'lavoro', label: 'Lavoro serale' },
      { id: 'telefona', label: 'Telefona a qualcuno' },
      { id: 'chiacchiera', label: 'Chiacchiera col vicino' },
      { id: 'dormi', label: 'Vai a dormire (recupero totale)' },
    ],
    notte: [
      { id: 'lavoro', label: 'Lavoro notturno' },
      { id: 'dormi', label: 'Dormi (recupero 80%)' },
    ],
  },
  sabato: {
    mattina: [
      { id: 'palestra', label: 'Allenamento mattutino' },
      { id: 'lampada', label: 'Lampada UV' },
      { id: 'shopping', label: 'Shopping al mercato' },
      { id: 'lavoro', label: 'Lavoro mattutino' },
      { id: 'riposa', label: 'Dormi fino a tardi' },
      { id: 'parco', label: 'Socializza nel quartiere' },
    ],
    pomeriggio: [
      { id: 'palestra', label: 'Vai in palestra' },
      { id: 'motorino', label: 'Giro motorini' },
      { id: 'shopping', label: 'Shopping in centro' },
      { id: 'lavoro', label: 'Lavoro part-time' },
      { id: 'riposa', label: 'Riposa un po\' (25-35% stanchezza)' },
      { id: 'parco', label: 'Socializza nel quartiere' },
      { id: 'chiacchiera', label: 'Chiacchiera in giro' },
    ],
    sera: [
      { id: 'disco', label: 'Discoteca' },
      { id: 'cinema', label: 'Cinema con amici' },
      { id: 'motorino', label: 'Gara di motorini' },
      { id: 'lavoro', label: 'Lavoro serale' },
      { id: 'dormi', label: 'Vai a dormire (recupero totale)' },
    ],
    notte: [
      { id: 'lavoro', label: 'Lavoro notturno' },
      { id: 'dormi', label: 'Dormi (recupero 80%)' },
    ],
  },
  domenica: {
    mattina: [
      { id: 'riposa', label: 'Dormi fino a tardissimo' },
      { id: 'palestra', label: 'Sport domenicale' },
      { id: 'lavoro', label: 'Lavoro mattutino' },
    ],
    pomeriggio: [
      { id: 'studia', label: 'Studia per la settimana', requiresSchoolPeriod: true },
      { id: 'studia_gruppo', label: 'Studia in gruppo', requiresSchoolPeriod: true },
      { id: 'palestra', label: 'Sport domenicale' },
      { id: 'motorino', label: 'Giro domenicale' },
      { id: 'lavoro', label: 'Lavoro pomeridiano' },
      { id: 'riposa', label: 'Riposa un po\' (25-35% stanchezza)' },
      { id: 'chiacchiera', label: 'Chiacchiera in giro' },
      { id: 'telefona', label: 'Telefona agli amici' },
    ],
    sera: [
      // La sera domenicale è occupata dall'evento narrativo "Ansia del Lunedì"
      { id: 'studia', label: 'Rivedi gli appunti', requiresSchoolPeriod: true },
      { id: 'dormi', label: 'Vai a dormire (recupero totale)' },
    ],
    notte: [
      { id: 'dormi', label: 'Dormi (recupero 80%)' },
    ],
  },
  festivo: {
    mattina: [
      { id: 'riposa', label: 'Riposa il giorno di festa' },
      { id: 'palestra', label: 'Sport' },
      { id: 'parco', label: 'Socializza nel quartiere' },
    ],
    pomeriggio: [
      { id: 'shopping', label: 'Shopping' },
      { id: 'cinema', label: 'Cinema' },
      { id: 'motorino', label: 'Giro col motorino' },
      { id: 'riposa', label: 'Riposa un po\' (25-35% stanchezza)' },
      { id: 'parco', label: 'Socializza nel quartiere' },
      { id: 'chiacchiera', label: 'Chiacchiera in giro' },
    ],
    sera: [
      { id: 'disco', label: 'Discoteca festiva' },
      { id: 'cinema', label: 'Cinema serale' },
      { id: 'lavoro', label: 'Lavoro serale' },
      { id: 'dormi', label: 'Vai a dormire (recupero totale)' },
    ],
    notte: [
      { id: 'lavoro', label: 'Lavoro notturno' },
      { id: 'dormi', label: 'Dormi (recupero 80%)' },
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
  isSchoolPeriod: boolean,
  isExhausted: boolean = false
): PhaseActionEntry[] => {
  const pool = PHASE_ACTIONS[dayType][phase] ?? []
  return pool.filter(entry => {
    if (entry.minSchoolYear && schoolYear < entry.minSchoolYear) return false
    if (entry.requiresSchoolPeriod && !isSchoolPeriod) return false
    if (isExhausted && entry.blockedWhenExhausted) return false
    return true
  })
}
