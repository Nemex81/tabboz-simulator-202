import type { SchoolActivitySettings, GameStats, HourSlot, Teacher, TimetableSlot, GameDate, Friend, AutoSchoolDayReport } from './types'
import { clampStat } from './game-utils'

export const ARCHETYPES: Record<
  Exclude<SchoolActivitySettings['archetype'], 'custom'>,
  Omit<SchoolActivitySettings, 'mode' | 'archetype'>
> = {
  secchione: {
    aulaDidattica: 'impegno',
    aulaSociale: 'opportunista',
    intervalloMode: 'studia',
  },
  tamarro: {
    aulaDidattica: 'invisibile',
    aulaSociale: 'sfida',
    intervalloMode: 'socializza',
  },
  fancazzista: {
    aulaDidattica: 'invisibile',
    aulaSociale: 'evita',
    intervalloMode: 'riposa',
  },
  casino: {
    aulaDidattica: 'disturbo',
    aulaSociale: 'collabora',
    intervalloMode: 'casino',
  },
  bullo: {
    aulaDidattica: 'disturbo',
    aulaSociale: 'sfida',
    intervalloMode: 'casino',
  },
  mediatore: {
    aulaDidattica: 'copia',
    aulaSociale: 'evita',
    intervalloMode: 'socializza',
  },
  randagio: {
    aulaDidattica: 'invisibile',
    aulaSociale: 'opportunista',
    intervalloMode: 'socializza',
  },
}

// Mappa le strategie alle scelte (indice 0-based) per ciascun evento
export const EVENT_CHOICE_MAP: Record<string, Partial<Record<string, number>>> = {
  // --- Eventi Generali ---
  sm_bullo_corridoio: {
    evita: 2,
    sfida: 1,
    opportunista: 0,
  },
  sm_nuovo_amico: {
    collabora: 0,
    socializza: 0,
    evita: 1,
    invisibile: 1,
    sfida: 2,
    opportunista: 2,
  },
  sm_crush_in_classe: {
    collabora: 0,
    sfida: 1,
    disturbo: 1,
    evita: 2,
    invisibile: 2,
  },
  sm_lite_tra_compagni: {
    collabora: 0,
    sfida: 1,
    disturbo: 1,
    evita: 2,
    invisibile: 2,
  },
  sm_assemblea_istituto: {
    impegno: 0,
    collabora: 0,
    invisibile: 1,
    evita: 1,
    disturbo: 2,
    sfida: 2,
  },
  sm_uscita_didattica: {
    impegno: 0,
    invisibile: 1,
    evita: 1,
  },
  sm_prof_assente: {
    impegno: 0,
    disturbo: 1,
    sfida: 1,
  },
  sm_compagno_istituto: {
    collabora: 0,
    opportunista: 1,
    impegno: 1,
  },
  sm_ritardo_bus: {
    impegno: 0,
    invisibile: 1,
    evita: 1,
  },
  sm_pettegolezzo_al_cancello: {
    opportunista: 0,
    sfida: 0,
    evita: 1,
    invisibile: 1,
  },
  sm_ragazzi_altra_sezione: {
    collabora: 0,
    sfida: 1,
    evita: 2,
    invisibile: 2,
  },
  sm_sfida_motorino_cancello: {
    sfida: 0,
    evita: 1,
    invisibile: 1,
  },
  sm_dimenticato_zaino: {
    impegno: 0,
    evita: 0,
    invisibile: 1,
    disturbo: 1,
  },
  sm_ragazza_altra_scuola: {
    collabora: 0,
    sfida: 1,
    disturbo: 1,
    evita: 2,
    invisibile: 2,
  },
  sm_rissa_fuori_cancello: {
    disturbo: 0,
    sfida: 0,
    opportunista: 1,
    impegno: 1,
    evita: 2,
    invisibile: 2,
  },
  sm_ansia_interrogazione: {
    impegno: 0,
    copia: 1,
    opportunista: 1,
    invisibile: 2,
    evita: 2,
  },
  sm_intervallo_prima_suoneria: {
    opportunista: 0,
    disturbo: 0,
    impegno: 1,
    invisibile: 1,
  },

  // --- Eventi Contestuali/Strutturati ---
  cse_interrogazione_a_sorpresa: {
    impegno: 0,
    copia: 0,
    evita: 1,
    invisibile: 1,
  },
  cse_compito_in_classe: {
    impegno: 0,
    copia: 1,
    opportunista: 1,
    collabora: 2,
    disturbo: 2,
  },
  cse_nota_sul_registro: {
    evita: 0,
    impegno: 0,
    sfida: 1,
    disturbo: 1,
  },
  cse_cellulare_squilla: {
    evita: 0,
    impegno: 0,
    opportunista: 1,
    copia: 1,
    sfida: 2,
    disturbo: 2,
  },
  cse_compagno_chiede_aiuto: {
    collabora: 0,
    impegno: 0,
    disturbo: 1,
    opportunista: 2,
    evita: 2,
  },
  cse_giustificazione: {
    impegno: 0,
    evita: 0,
    copia: 1,
    opportunista: 1,
  },
  cse_prof_spiegazione_noiosa: {
    impegno: 0,
    invisibile: 1,
    evita: 1,
    disturbo: 2,
    sfida: 2,
  },
  cse_compagno_dorme: {
    collabora: 0,
    disturbo: 1,
    sfida: 1,
    evita: 2,
    invisibile: 2,
  },
  cse_prof_compito_corretto: {
    impegno: 0,
    collabora: 0,
    sfida: 1,
    disturbo: 1,
    evita: 2,
    invisibile: 2,
  },
  cse_interrogazione_compagno: {
    collabora: 0,
    disturbo: 0,
    opportunista: 1,
    sfida: 1,
    impegno: 2,
    invisibile: 2,
  },
  cse_proposta_filone: {
    impegno: 0,
    disturbo: 1,
    sfida: 1,
  },
  cse_compagno_ruba_merenda: {
    sfida: 0,
    opportunista: 1,
    impegno: 1,
    evita: 2,
    invisibile: 2,
  },
  cse_colletta_regalo_prof: {
    collabora: 0,
    impegno: 0,
    sfida: 1,
    disturbo: 1,
    opportunista: 2,
    evita: 2,
  },
}

export function getAutoChoiceIndex(
  eventId: string,
  category: string,
  settings: SchoolActivitySettings,
  numChoices: number
): number {
  const strategy = category === 'didattica' ? settings.aulaDidattica : settings.aulaSociale
  const eventMap = EVENT_CHOICE_MAP[eventId]
  if (eventMap && eventMap[strategy] !== undefined) {
    const idx = eventMap[strategy]!
    if (idx >= 0 && idx < numChoices) return idx
  }
  return 0 // default fallback
}

export function resolveAutoBreak(
  settings: SchoolActivitySettings,
  stats: GameStats
): { delta: Partial<GameStats>; message: string } {
  const mode = settings.intervalloMode
  switch (mode) {
    case 'studia':
      return {
        delta: { intelligenza: 1, stanchezza: 5 },
        message: "Hai passato l'intervallo a studiare ed a ripassare per l'ora successiva. (+1 Intelligenza, +5 Stanchezza)",
      }
    case 'socializza':
      return {
        delta: { carisma: 1, reputazione: 1, stanchezza: 3 },
        message: "Hai trascorso l'intervallo in corridoio parlando e socializzando con i compagni. (+1 Carisma, +1 Reputazione, +3 Stanchezza)",
      }
    case 'casino':
      return {
        delta: { coattaggine: 2, reputazione: 1, stanchezza: 8 },
        message: "Hai fatto un casino incredibile nei corridoi urlando ed inseguendo i compagni! (+2 Coattaggine, +1 Reputazione, +8 Stanchezza)",
      }
    case 'riposa':
      return {
        delta: { stanchezza: -15 },
        message: "Ti sei seduto tranquillo in disparte a rilassarti per recuperare energie. (-15 Stanchezza)",
      }
    case 'snack':
      if (stats.soldi >= 3) {
        return {
          delta: { soldi: -3, stanchezza: -10, morale: 5 },
          message: "Sei andato al bar ed hai speso 3 euro per una pizzetta calda ed una bibita. (-3 euro, -10 Stanchezza, +5 Morale)",
        }
      } else {
        return {
          delta: { stanchezza: -5 },
          message: "Volevi comprare una merenda al bar scolastico ma ti mancavano i soldi! Ti sei solo riposato. (-5 Stanchezza)",
        }
      }
    default:
      return {
        delta: { stanchezza: -5 },
        message: "Hai passato l'intervallo senza fare nulla in particolare. (-5 Stanchezza)",
      }
  }
}

// AutoSchoolDayReport viene ora importato da types.ts

export function resolveSchoolDayBlock(
  slots: HourSlot[],
  teachers: Teacher[],
  stats: GameStats,
  settings: SchoolActivitySettings
): AutoSchoolDayReport {
  const teacherMap = new Map<string, Teacher>()
  for (const t of teachers) {
    teacherMap.set(t.id, t)
  }

  const lessonsResolved: AutoSchoolDayReport['lessonsResolved'] = []
  let breakMsg = ''
  const totalDelta: Record<string, number> = {}
  const newFriends: Friend[] = []

  const addDelta = (d: Partial<GameStats>) => {
    for (const [k, v] of Object.entries(d)) {
      if (typeof v !== 'number') continue
      totalDelta[k] = (totalDelta[k] ?? 0) + v
    }
  }

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (slot.type === 'break') {
      const breakRes = resolveAutoBreak(settings, { ...stats, ...totalDelta } as unknown as GameStats)
      breakMsg = breakRes.message
      addDelta(breakRes.delta)
    } else {
      const teacher = slot.teacherId ? teacherMap.get(slot.teacherId) : undefined
      const ordDelta = slot.ordinaryEvent.statDelta
      addDelta(ordDelta)

      let eventMsg: string | undefined = undefined
      let autoChoiceLabel: string | undefined = undefined

      if (slot.structuredEvent) {
        const choiceIdx = getAutoChoiceIndex(
          slot.structuredEvent.id,
          slot.structuredEvent.category,
          settings,
          slot.structuredEvent.choices.length
        )
        const choice = slot.structuredEvent.choices[choiceIdx]
        if (choice) {
          autoChoiceLabel = choice.label
          const outcome = choice.outcome({ ...stats, ...totalDelta } as unknown as GameStats)
          eventMsg = outcome.message
          addDelta(outcome.delta)
          if (outcome.newFriend) {
            newFriends.push(outcome.newFriend)
          }
        }
      }

      lessonsResolved.push({
        hour: slot.hourIndex < 3 ? slot.hourIndex + 1 : slot.hourIndex,
        subject: slot.subjectKey ?? '',
        teacherName: teacher?.name ?? 'Professore',
        ordinaryMsg: slot.ordinaryEvent.message,
        eventMsg,
        autoChoiceLabel,
      })
    }
  }

  return {
    lessonsResolved,
    breakMsg,
    totalDelta,
    newFriends,
  }
}
