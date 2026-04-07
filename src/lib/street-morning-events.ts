// src/lib/street-morning-events.ts
// Pool di eventi randomizzati per la mattina fuori scuola (marina o assenza).

import { GameStats, MorningEventCategory } from '@/lib/types'
import { SchoolMorningEvent, SchoolMorningChoice } from '@/lib/school-morning-events'

// Re-export dei tipi per consumatori del modulo
export type { SchoolMorningEvent, SchoolMorningChoice }

// ─── POOL EVENTI FUORI SCUOLA ─────────────────────────────────────────────────

export const STREET_MORNING_EVENTS: SchoolMorningEvent[] = [

  // ── CATEGORIA: CASA ──────────────────────────────────────────────────────

  {
    id: 'st_dormi_tardi',
    category: 'casa' as MorningEventCategory,
    title: 'Dormi fino alle 11',
    description: 'Il letto è caldo, il soffitto è familiare. Perché alzarsi? Ti rigiri tra le lenzuola finché non senti dei rumori giù.',
    probability: 50,
    choices: [
      {
        label: 'Dormi ancora — te lo meriti',
        outcome: () => {
          const caught = Math.random() < 0.3
          return caught
            ? { delta: { stanchezza: -30, reputazione: -5 }, message: 'Hai dormito benissimo, ma i tuoi ti hanno scoperto! -5 Reputazione, -30 Stanchezza' }
            : { delta: { stanchezza: -40 }, message: 'Sonno rigenerante. Ti svegli fresco come una rosa. -40 Stanchezza' }
        },
      },
      {
        label: 'Ti alzi e fai finta di stare male',
        outcome: () => ({ delta: { coattaggine: 8, stanchezza: -15 }, message: 'La tua recitazione è convincente. I tuoi ci credono. +8 Coattaggine, -15 Stanchezza' }),
        grantsExtraAction: true,
      },
    ],
  },

  {
    id: 'st_tv_mattutina',
    category: 'casa' as MorningEventCategory,
    title: 'Televisione mattutina',
    description: 'Canali spazzatura, televendite, cartoni di terza categoria. Ma almeno sei comodo sul divano.',
    probability: 40,
    choices: [
      {
        label: 'Guardi tutto con distacco critico',
        outcome: () => ({ delta: { intelligenza: 1, stanchezza: -10 }, message: 'Strano, ci hai trovato qualcosa di interessante. +1 Intelligenza' }),
      },
      {
        label: 'Ti addormenti davanti alla TV',
        outcome: () => ({ delta: { stanchezza: -25 }, message: 'Il teleschermo ti cullato nel sonno. -25 Stanchezza' }),
        grantsExtraAction: false,
      },
      {
        label: 'Cambi canale ogni 10 secondi per un\'ora',
        outcome: () => ({ delta: { stanchezza: -5, coattaggine: 3 }, message: 'Alta cultura televisiva. +3 Coattaggine' }),
      },
    ],
  },

  {
    id: 'st_genitori_ti_beccano',
    category: 'casa' as MorningEventCategory,
    title: 'I genitori ti beccano a casa',
    description: 'Tuo padre rientra inaspettatamente a metà mattina. Ti trova in pigiama sul divano mentre dovresti essere a scuola.',
    probability: 20,
    choices: [
      {
        label: 'Ammetti di aver marinato',
        outcome: () => ({ delta: { reputazione: -10, soldi: -20, coattaggine: -5 }, message: 'Punizione in arrivo. -20 Soldi di paghetta, -10 Reputazione' }),
      },
      {
        label: 'Inventi una scusa elaborata (malattia)',
        outcome: () => {
          const believed = Math.random() < 0.4
          return believed
            ? { delta: { coattaggine: 15, stanchezza: -5 }, message: 'Ti crede! Ci vuole talento. +15 Coattaggine' }
            : { delta: { reputazione: -15, soldi: -30 }, message: 'Non ti crede. La situazione peggiora. -30 Soldi, -15 Reputazione' }
        },
      },
    ],
  },

  // ── CATEGORIA: CITTA' ────────────────────────────────────────────────────

  {
    id: 'st_bar_vicino_scuola',
    category: 'citta' as MorningEventCategory,
    title: 'Bar vicino alla scuola',
    description: 'Il bar a 200 metri dall\'istituto è il punto di ritrovo dei marinatori. Un cappuccino, un cornetto, e il rischio di incontrare qualcuno che conosci.',
    probability: 35,
    choices: [
      {
        label: 'Entri tranquillo e ti siedi al bancone',
        outcome: () => {
          const profAround = Math.random() < 0.2
          return profAround
            ? { delta: { coattaggine: 20, reputazione: -10 }, message: 'C\'è un prof! Vi siete guardati. Imbarazzo totale. +20 Coattaggine, -10 Reputazione' }
            : { delta: { carisma: 5, stanchezza: -5 }, message: 'Colazione rilassata, chiacchiere con il barista. +5 Carisma' }
        },
      },
      {
        label: 'Ordini e ti siedi nell\'angolo più nascosto',
        outcome: () => ({ delta: { stanchezza: -10, coattaggine: 5 }, message: 'Nessuno ti nota. Perfetto. -10 Stanchezza, +5 Coattaggine' }),
        grantsExtraAction: true,
      },
    ],
  },

  {
    id: 'st_sala_giochi',
    category: 'citta' as MorningEventCategory,
    title: 'Sala giochi aperta di mattina',
    description: 'Di mattina è deserta e i crediti costano meno. Hai trovato il luogo perfetto per ammazzare il tempo.',
    probability: 25,
    choices: [
      {
        label: 'Giochi per due ore di fila',
        outcome: () => {
          const spent = Math.floor(Math.random() * 15) + 5
          return { delta: { coattaggine: 12, soldi: -spent, intelligenza: -1 }, message: `Sessione epica. -${spent} Soldi, +12 Coattaggine, -1 Intelligenza` }
        },
      },
      {
        label: 'Un solo gettone, poi te ne vai',
        outcome: () => ({ delta: { coattaggine: 4, soldi: -2 }, message: 'Moderazione. Rara virtù. +4 Coattaggine, -2 Soldi' }),
        grantsExtraAction: true,
      },
    ],
  },

  {
    id: 'st_giro_motorino',
    category: 'citta' as MorningEventCategory,
    title: 'Giro in motorino con gli amici',
    description: 'Qualcuno ti chiama per un giro. Le strade sono quasi vuote di mattina. Libertà su due ruote.',
    probability: 30,
    choices: [
      {
        label: 'Vai a tutto gas — massima velocità',
        outcome: () => {
          const fined = Math.random() < 0.25
          return fined
            ? { delta: { coattaggine: 20, soldi: -50, reputazione: 5 }, message: 'Multa! Brucia 50 soldi, ma tutti ti guardano ammirazione. +20 Coattaggine, -50 Soldi' }
            : { delta: { coattaggine: 18, figosita: 8, stanchezza: -10 }, message: 'Giro adrenalinico senza conseguenze! +18 Coattaggine, +8 Figosità' }
        },
      },
      {
        label: 'Giro tranquillo, godendoti il panorama',
        outcome: () => ({ delta: { stanchezza: -15, carisma: 5 }, message: 'Mattina fresca e rilassante. -15 Stanchezza, +5 Carisma' }),
        grantsExtraAction: true,
      },
    ],
  },

  // ── CATEGORIA: STRADA ────────────────────────────────────────────────────

  {
    id: 'st_sconosciuto_strano',
    category: 'strada' as MorningEventCategory,
    title: 'Incontro strano in strada',
    description: 'Un tipo dall\'aria ambigua ti fissa dalla panchina. Ti fa un cenno quando passi. Non sai se ignorarlo o salutare.',
    probability: 20,
    choices: [
      {
        label: 'Lo ignori e acceleri il passo',
        outcome: () => ({ delta: { stanchezza: -5 }, message: 'Prudente. Non si sa mai. Nessuna conseguenza.' }),
        grantsExtraAction: true,
      },
      {
        label: 'Ti fermi e gli parli',
        outcome: () => {
          const roll = Math.random()
          if (roll < 0.33) return { delta: { coattaggine: 15, reputazione: 5 }, message: 'Era uno in gamba. Vi siete raccontati mille cose. +15 Coattaggine' }
          if (roll < 0.66) return { delta: { carisma: 8 }, message: 'Conversazione strana ma stimolante. +8 Carisma' }
          return { delta: { soldi: -10, stanchezza: 15 }, message: 'Ti ha fregato 10 soldi con una storia inventata. -10 Soldi' }
        },
      },
    ],
  },

  {
    id: 'st_gruppetto_coatti',
    category: 'strada' as MorningEventCategory,
    title: 'Gruppetto di coatti al parco',
    description: 'Al parco c\'è un gruppetto rumoroso che occupa le panchine. Musica sparata, linguaggio colorito. Ti guardano mentre passi.',
    probability: 30,
    choices: [
      {
        label: 'Ti avvicini — conosci qualcuno lì?',
        outcome: (s) => {
          const fit = Math.random() < (s.coattaggine / 100)
          return fit
            ? { delta: { coattaggine: 20, reputazione: 8 }, message: 'Ti integri perfettamente. Sei uno di loro. +20 Coattaggine, +8 Reputazione' }
            : { delta: { stanchezza: 10, coattaggine: -5 }, message: 'Non ti considerano abbastanza coatto. Imbarazzo. +10 Stanchezza' }
        },
      },
      {
        label: 'Ci passi davanti indifferente',
        outcome: () => {
          const hassled = Math.random() < 0.2
          return hassled
            ? { delta: { muscoli: 2, stanchezza: 10 }, message: 'Ti provocano. Rispondi a tono. +2 Muscoli' }
            : { delta: {}, message: 'Ti lasciano in pace. Giornata tranquilla.' }
        },
      },
    ],
  },

  // ── CATEGORIA: AMICI ─────────────────────────────────────────────────────

  {
    id: 'st_amico_marina_con_te',
    category: 'amici' as MorningEventCategory,
    title: 'Un amico marina con te',
    description: 'Ricevi un messaggio: "Anche io sono fuori, dove sei?". Non sei solo nel crimine.',
    probability: 40,
    choices: [
      {
        label: 'Vi trovate e girate insieme',
        outcome: () => ({ delta: { carisma: 10, stanchezza: -15, reputazione: 5 }, message: 'Mattinata in compagnia! Molto meglio che da soli. +10 Carisma, +5 Reputazione' }),
        grantsExtraAction: false,
      },
      {
        label: 'Rispondi ma rimani per conto tuo',
        outcome: () => ({ delta: { carisma: 3 }, message: 'Un po\' di socialità a distanza. +3 Carisma' }),
        grantsExtraAction: true,
      },
      {
        label: 'Non rispondi — giornata solitaria',
        outcome: () => ({ delta: { stanchezza: -5 }, message: 'Hai bisogno di stare con te stesso.' }),
      },
    ],
  },

  {
    id: 'st_passeggiata_solitaria',
    category: 'strada' as MorningEventCategory,
    title: 'Giro da solo — momento di pace',
    description: 'Le strade di mattina hanno un ritmo diverso. Negozi che aprono, anziani con il cane, silenzio relativo. Ti ricarichi.',
    probability: 35,
    choices: [
      {
        label: 'Cammini senza meta per un\'ora',
        outcome: () => ({ delta: { stanchezza: -20, carisma: 5, intelligenza: 1 }, message: 'Chiarezza mentale. A volte la solitudine fa bene. -20 Stanchezza, +5 Carisma, +1 Intelligenza' }),
        grantsExtraAction: true,
      },
      {
        label: 'Ti fermi a osservare la gente al bar',
        outcome: () => ({ delta: { carisma: 8, stanchezza: -10 }, message: 'Osservazione silenziosa. Capisci più cose del mondo. +8 Carisma' }),
      },
    ],
  },

]

// ─── FUNZIONE DRAW ───────────────────────────────────────────────────────────

/**
 * Seleziona casualmente fino a `maxEvents` eventi per la mattina fuori scuola,
 * rispettando le probabilità individuali di ogni evento.
 */
export function drawStreetMorningEvents(maxEvents: number = 3): SchoolMorningEvent[] {
  const eligible = STREET_MORNING_EVENTS.filter(e => Math.random() * 100 < e.probability)
  return eligible.sort(() => Math.random() - 0.5).slice(0, maxEvents)
}
