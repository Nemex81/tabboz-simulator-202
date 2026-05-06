/**
 * Job System — TASK-B
 * Definisce i 6 tipi di lavoro part-time con fasce orarie, prerequisiti ed effetti.
 */
import type { DayPhase, DayType, GameStats } from '@/lib/types'

export type JobId =
  | 'buttafuori'
  | 'cameriere'
  | 'rider'
  | 'fattorino'
  | 'dogsitter'
  | 'volantinaggio'

export interface JobDefinition {
  id: JobId
  label: string
  description: string
  payPerShift: number
  allowedPhases: DayPhase[]
  allowedDayTypes: DayType[]
  minSchoolYear: number
  minStats: Partial<GameStats>
  statEffects: Partial<GameStats>
  icon?: string
}

interface JobContext {
  schoolYear?: number
}

export const JOBS: Record<JobId, JobDefinition> = {
  buttafuori: {
    id: 'buttafuori',
    label: 'Buttafuori',
    description: "Controlli l'ingresso di un locale notturno",
    payPerShift: 50,
    allowedPhases: ['sera', 'notte'],
    allowedDayTypes: ['feriale', 'sabato', 'festivo'],
    minSchoolYear: 3,
    minStats: { muscoli: 70 } as Partial<GameStats>,
    statEffects: { muscoli: 1, stress: 5, reputazione: 2 } as Partial<GameStats>,
    icon: '🚪',
  },
  cameriere: {
    id: 'cameriere',
    label: 'Cameriere',
    description: 'Servi ai tavoli in un ristorante',
    payPerShift: 25,
    allowedPhases: ['pomeriggio', 'sera'],
    allowedDayTypes: ['feriale', 'sabato'],
    minSchoolYear: 2,
    minStats: { carisma: 40 } as Partial<GameStats>,
    statEffects: { carisma: 1, stanchezza: 10, stress: 3 } as Partial<GameStats>,
    icon: '\u{1F37D}\uFE0F',
  },
  rider: {
    id: 'rider',
    label: 'Rider',
    description: 'Consegne in motorino per servizi di delivery',
    payPerShift: 20,
    allowedPhases: ['pomeriggio'],
    allowedDayTypes: ['feriale', 'sabato'],
    minSchoolYear: 2,
    minStats: { hasMotorino: true } as Partial<GameStats>,
    statEffects: { stanchezza: 8, morale: 2 } as Partial<GameStats>,
    icon: '\u{1F6F5}',
  },
  fattorino: {
    id: 'fattorino',
    label: 'Fattorino',
    description: 'Consegna pacchi a piedi o in bici',
    payPerShift: 18,
    allowedPhases: ['mattina', 'pomeriggio'],
    allowedDayTypes: ['feriale'],
    minSchoolYear: 2,
    minStats: {} as Partial<GameStats>,
    statEffects: { stanchezza: 10, stress: 2 } as Partial<GameStats>,
    icon: '\u{1F4E6}',
  },
  dogsitter: {
    id: 'dogsitter',
    label: 'Dogsitter',
    description: 'Porta a spasso i cani del quartiere',
    payPerShift: 15,
    allowedPhases: ['mattina', 'pomeriggio'],
    allowedDayTypes: ['feriale', 'sabato', 'domenica'],
    minSchoolYear: 1,
    minStats: {} as Partial<GameStats>,
    statEffects: { morale: 5, stanchezza: 5 } as Partial<GameStats>,
    icon: '\u{1F415}',
  },
  volantinaggio: {
    id: 'volantinaggio',
    label: 'Volantinaggio',
    description: 'Distribuisci volantini pubblicitari',
    payPerShift: 12,
    allowedPhases: ['mattina'],
    allowedDayTypes: ['feriale'],
    minSchoolYear: 1,
    minStats: {} as Partial<GameStats>,
    statEffects: { stanchezza: 6, morale: 1 } as Partial<GameStats>,
    icon: '\u{1F4C4}',
  },
}

const STAT_LABELS: Record<string, string> = {
  muscoli: 'Muscoli',
  carisma: 'Carisma',
  coattaggine: 'Coattaggine',
  figosita: 'Figosità',
  reputazione: 'Reputazione',
  intelligenza: 'Intelligenza',
  soldi: 'Soldi',
  stanchezza: 'Stanchezza',
  stress: 'Stress',
  morale: 'Morale',
  salute: 'Salute',
}

/**
 * Restituisce il motivo per cui un job è disabilitato, oppure null se disponibile.
 */
export function getJobDisabledReason(job: JobDefinition, stats: GameStats): string | null {
  const ms = job.minStats as Record<string, unknown>
  const st = stats as unknown as Record<string, unknown>
  for (const key of Object.keys(ms)) {
    const req = ms[key]
    const val = st[key]
    if (req === undefined) continue
    if (typeof req === 'boolean') {
      if (val !== req) {
        if (key === 'hasMotorino') return 'Richiede il motorino truccato'
        return `Richiede ${key}`
      }
    } else if (typeof req === 'number' && typeof val === 'number') {
      if (val < req) {
        const label = STAT_LABELS[key] ?? key
        return `Richiede ${label} ≥ ${req} — tuoi: ${val}`
      }
    }
  }
  return null
}

export function getJobBlockedReason(
  job: JobDefinition,
  stats: GameStats,
  context: JobContext = {}
): string | null {
  if (typeof context.schoolYear === 'number' && context.schoolYear < job.minSchoolYear) {
    return `Richiede almeno il ${job.minSchoolYear}° anno — sei al ${context.schoolYear}°`
  }
  return getJobDisabledReason(job, stats)
}

/**
 * Restituisce i lavori disponibili per la fase e il tipo di giorno correnti.
 */
export function getJobsForContext(
  phase: DayPhase,
  dayType: DayType
): JobDefinition[] {
  return (Object.values(JOBS) as JobDefinition[]).filter(
    j => j.allowedPhases.includes(phase) && j.allowedDayTypes.includes(dayType)
  )
}
