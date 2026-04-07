// ─── school-structured-events.ts ─────────────────────────────────────────────
//
// Estende SchoolMorningEvent con filtri contestuali per materia e attributi
// del professore. NON modifica school-morning-events.ts.
//
// Conteggio eventi: 18 ContextualSchoolEvent totali
//   - 5 migrati/adattati da school-morning-events.ts
//   - 13 nuovi specifici per il contesto mattinata sequenziale

import type { GameStats, Friend } from '@/lib/types'
import type { SchoolMorningEvent, SchoolMorningChoice } from '@/lib/school-morning-events'
import { generateSchoolFriend } from '@/lib/enhanced-friend-system'

export interface ContextualSchoolEvent extends SchoolMorningEvent {
  /** Materie compatibili. undefined o [] = tutte le materie. */
  subjectFilter?: string[]
  /** [min, max] severità del professore per attivare l'evento. */
  severityRange?: [number, number]
  /** [min, max] relazione col professore per attivare l'evento. */
  relationRange?: [number, number]
}

// ─── EVENTI CONTESTUALI ───────────────────────────────────────────────────────

export const CONTEXTUAL_SCHOOL_EVENTS: ContextualSchoolEvent[] = [

  // ── Migrati/adattati da SCHOOL_MORNING_EVENTS ────────────────────────────

  {
    id: 'cse_interrogazione_a_sorpresa',
    category: 'didattica',
    title: 'Interrogazione a sorpresa!',
    description: 'Il prof entra con il registro spalancato. "{teacher} oggi interrogo!" — silenzio in classe.',
    probability: 35,
    subjectFilter: undefined,          // tutte le materie
    severityRange: [5, 10],            // solo prof severi
    choices: [
      {
        label: 'Rispondo come so',
        outcome: (s: GameStats) => {
          const success = Math.random() < (s.intelligenza / 100)
          return success
            ? { delta: { intelligenza: 2 }, message: 'Risposta accettata. Il prof annuisce. +2 Intelligenza' }
            : { delta: { stanchezza: 10 }, message: 'Figuraccia. Il prof nota la tua impreparazione. +10 Stanchezza' }
        },
      },
      {
        label: 'Faccio il malato',
        outcome: () => ({ delta: { coattaggine: 5, stanchezza: -5 }, message: 'Scappi dall\'interrogazione. +5 Coattaggine, -5 Stanchezza' }),
        grantsExtraAction: true,
      },
    ],
  },

  {
    id: 'cse_compiti_non_fatti',
    category: 'didattica',
    title: 'Compiti non fatti!',
    description: 'Il prof raccoglie i compiti. Tu non li hai fatti.',
    probability: 25,
    subjectFilter: undefined,
    choices: [
      {
        label: 'Copio dal compagno di banco',
        outcome: () => {
          const success = Math.random() < 0.5
          return success
            ? { delta: { coattaggine: 8 }, message: 'Nessuno ha visto. +8 Coattaggine' }
            : { delta: { intelligenza: -3, coattaggine: 15 }, message: 'Beccato! Il prof dà nota sul registro.' }
        },
      },
      {
        label: 'Ammetto di non averli fatti',
        outcome: () => ({ delta: { intelligenza: 3, stanchezza: 5 }, message: 'Il prof apprezza la sincerità. Compiti doppi per domani. +3 Intelligenza' }),
      },
    ],
  },

  {
    id: 'cse_prof_assente_supplente',
    category: 'istituto',
    title: 'Prof assente — arriva il supplente!',
    description: 'Il prof non c\'è. Un supplente che non conosce la materia distribuisce fotocopie.',
    probability: 30,
    subjectFilter: undefined,
    choices: [
      {
        label: 'Studio per conto mio',
        outcome: () => ({ delta: { intelligenza: 4, stanchezza: 5 }, message: 'Ora libera ben spesa. +4 Intelligenza' }),
      },
      {
        label: 'Giro per i corridoi',
        outcome: () => ({ delta: { carisma: 8, stanchezza: -5 }, message: 'Socialità intensa. +8 Carisma' }),
        grantsExtraAction: true,
      },
    ],
  },

  {
    id: 'cse_lezione_noiosa',
    category: 'didattica',
    title: 'Lezione mortalmente noiosa',
    description: 'Il prof legge il libro ad alta voce da 40 minuti. Gli occhi si chiudono.',
    probability: 40,
    severityRange: [1, 4],             // solo prof poco severi permettono il caos
    choices: [
      {
        label: 'Mi addormento (rischio)',
        outcome: () => {
          const caught = Math.random() < 0.4
          return caught
            ? { delta: { stanchezza: -20, coattaggine: 10 }, message: 'Svegliato di scatto! +10 Coattaggine, -20 Stanchezza' }
            : { delta: { stanchezza: -30 }, message: 'Sonno ristoratore. Nessuno se n\'è accorto. -30 Stanchezza' }
        },
      },
      {
        label: 'Disegno sul banco',
        outcome: () => ({ delta: { stanchezza: -10, coattaggine: 5 }, message: 'Capolavori sul quaderno. -10 Stanchezza' }),
      },
      {
        label: 'Ascolto e prendo appunti',
        outcome: () => ({ delta: { intelligenza: 2 }, message: 'Che noia, ma sei bravo. +2 Intelligenza' }),
      },
    ],
  },

  {
    id: 'cse_nuovo_compagno_in_aula',
    category: 'sociale',
    title: 'Nuovo compagno di classe',
    description: 'Alla tua destra è seduto un tipo nuovo. Sembra a suo agio e sorride.',
    probability: 20,
    subjectFilter: undefined,
    choices: [
      {
        label: 'Lo avvicino e gli parlo',
        outcome: (s: GameStats) => {
          const success = Math.random() < (s.carisma / 100)
          return success
            ? {
                delta: { carisma: 8, reputazione: 5 },
                message: 'Bella chiacchierata! Nuovo amico in rubrica. +8 Carisma, +5 Reputazione',
                newFriend: generateSchoolFriend('compagno_classe') as Friend,
              }
            : { delta: { stanchezza: 5 }, message: 'Conversazione imbarazzante. Riproverai.' }
        },
      },
      {
        label: 'Lo ignoro',
        outcome: () => ({ delta: {}, message: 'Opportunità persa? Chi lo sa.' }),
      },
    ],
  },

  // ── Nuovi eventi contestuali ──────────────────────────────────────────────

  {
    id: 'cse_verifica_scritta_a_sorpresa',
    category: 'didattica',
    title: 'Verifica scritta a sorpresa!',
    description: 'Il prof distribuisce fogli bianchi senza preavviso. Silenzio tombale.',
    probability: 20,
    subjectFilter: ['matematica', 'fisica', 'chimicaInt', 'inglese', 'italiano',
                    'informatica', 'basiDati', 'fisicaAvanzata', 'chimicaOrg'],
    severityRange: [5, 10],
    choices: [
      {
        label: 'Faccio del mio meglio',
        outcome: (s: GameStats) => {
          const score = Math.floor((s.intelligenza / 100) * 5) + 3
          return { delta: { stanchezza: 15 }, message: `Ti sembra di aver risposto bene. Voto atteso: ~${score}/10. +15 Stanchezza` }
        },
      },
      {
        label: 'Provo a copiare',
        outcome: () => {
          const caught = Math.random() < 0.45
          return caught
            ? { delta: { coattaggine: 20, stanchezza: 20 }, message: 'Beccato a copiare! Zero e nota. +20 Coattaggine' }
            : { delta: { coattaggine: 10 }, message: 'Copiatura silenziosa riuscita. Sollievo totale. +10 Coattaggine' }
        },
      },
    ],
  },

  {
    id: 'cse_compito_in_classe',
    category: 'didattica',
    title: 'Compito in classe annunciato',
    description: 'Era sul registro da una settimana. Oggi si consegna. La classe è silenziosa.',
    probability: 30,
    subjectFilter: ['italiano', 'storia', 'inglese', 'matematica', 'fisica',
                    'filosofia', 'latino', 'storiaArte', 'teoriaMusicale'],
    choices: [
      {
        label: 'Ho studiato — vado tranquillo',
        outcome: (s: GameStats) => {
          const bonus = Math.floor(s.intelligenza / 20)
          return { delta: { intelligenza: bonus, stanchezza: 10 }, message: `Ore di studio ben spese. +${bonus} Intelligenza, +10 Stanchezza` }
        },
      },
      {
        label: 'Non ho studiato — improvviso',
        outcome: (s: GameStats) => {
          const success = Math.random() < (s.intelligenza / 150)
          return success
            ? { delta: { coattaggine: 5 }, message: 'Fortuna sfacciata. Il compito era fattibile. +5 Coattaggine' }
            : { delta: { stanchezza: 20, intelligenza: -2 }, message: 'Risultato disastroso. -2 Intelligenza, +20 Stanchezza' }
        },
      },
    ],
  },

  {
    id: 'cse_prof_vi_manda_fuori',
    category: 'didattica',
    title: 'Il prof vi manda fuori!',
    description: 'La classe era troppo rumorosa. Il prof sbatte il registro e indica la porta.',
    probability: 25,
    subjectFilter: undefined,
    severityRange: [6, 10],
    relationRange: [-100, -20],        // solo con prof ostile o freddo
    choices: [
      {
        label: 'Esco senza protestare',
        outcome: () => ({ delta: { coattaggine: 10, stanchezza: -10 }, message: 'Aria fresca in corridoio. +10 Coattaggine, -10 Stanchezza' }),
        grantsExtraAction: true,
      },
      {
        label: 'Protesto ad alta voce',
        outcome: (s: GameStats) => {
          const brave = s.coattaggine > 60
          return brave
            ? { delta: { coattaggine: 20, reputazione: 15 }, message: 'Ovazione dalla classe! Poi vieni espulso comunque. +20 Coattaggine' }
            : { delta: { stanchezza: 15, coattaggine: -5 }, message: 'Il prof ti minaccia di nota. Torni in corridoio. -5 Coattaggine' }
        },
      },
    ],
  },

  {
    id: 'cse_spiegazione_alla_lavagna',
    category: 'didattica',
    title: 'Il prof ti chiama alla lavagna',
    description: 'Il tuo nome viene pronunciato lentamente. Tutti si girano.',
    probability: 30,
    subjectFilter: ['matematica', 'fisica', 'chimicaInt', 'informatica', 'basiDati',
                    'fisicaAvanzata', 'chimicaOrg', 'agronomia', 'teoriaMusicale'],
    choices: [
      {
        label: 'Vado con sicurezza',
        outcome: (s: GameStats) => {
          const success = Math.random() < (s.intelligenza / 100)
          return success
            ? { delta: { intelligenza: 3, carisma: 5 }, message: 'Esecuzione perfetta. Il prof approva. +3 Intelligenza, +5 Carisma' }
            : { delta: { stanchezza: 15, coattaggine: 8 }, message: 'Errore alla lavagna davanti a tutti. +8 Coattaggine' }
        },
      },
      {
        label: 'Dico che non so',
        outcome: () => ({ delta: { intelligenza: -1, stanchezza: 5 }, message: 'Il prof è deluso. Segna qualcosa sul registro. -1 Intelligenza' }),
      },
    ],
  },

  {
    id: 'cse_verifica_orale',
    category: 'didattica',
    title: 'Verifica orale',
    description: 'Il prof chiama il tuo nome per una verifica orale. Il cuore accelera.',
    probability: 25,
    subjectFilter: undefined,
    severityRange: [4, 10],
    choices: [
      {
        label: 'Rispondo con calma',
        outcome: (s: GameStats) => {
          const base = s.intelligenza / 100
          const success = Math.random() < base
          return success
            ? { delta: { intelligenza: 4, carisma: 3 }, message: 'Ottima risposta! Il prof sorride soddisfatto. +4 Intelligenza, +3 Carisma' }
            : { delta: { stanchezza: 12 }, message: 'Risposta parziale. Il prof prende nota. +12 Stanchezza' }
        },
      },
      {
        label: 'Cerco di deviare con domande',
        outcome: (s: GameStats) => {
          const success = Math.random() < (s.carisma / 100)
          return success
            ? { delta: { carisma: 8, stanchezza: 5 }, message: 'Domanda retorica efficace. Il prof si dimentica di interrogarti davvero. +8 Carisma' }
            : { delta: { coattaggine: 5, stanchezza: 10 }, message: 'Il prof non abbocca. Insiste. +5 Coattaggine' }
        },
      },
      {
        label: 'Improvviso',
        outcome: (s: GameStats) => {
          const roll = Math.random()
          if (roll < s.carisma / 150) return { delta: { coattaggine: 15, figosita: 5 }, message: 'Improvvisazione leggendaria. La classe ride e il prof concede. +15 Coattaggine' }
          return { delta: { intelligenza: -2, stanchezza: 15 }, message: 'Il bluff non regge. Figuraccia totale. -2 Intelligenza' }
        },
      },
    ],
  },

  {
    id: 'cse_pausa_spiegazione_domanda',
    category: 'didattica',
    title: 'Il prof fa una pausa — chi ha domande?',
    description: 'Il prof si ferma a metà spiegazione e guarda la classe. Pausa lunga.',
    probability: 15,
    subjectFilter: undefined,
    relationRange: [10, 100],          // solo con prof con buona relazione
    choices: [
      {
        label: 'Alzo la mano e chiedo',
        outcome: (s: GameStats) => {
          const coherent = s.intelligenza > 50
          return coherent
            ? { delta: { intelligenza: 3, carisma: 4 }, message: 'Domanda pertinente. Il prof risponde con piacere. +3 Intelligenza, +4 Carisma' }
            : { delta: { carisma: 2 }, message: 'Il prof risponde gentilmente. Hai capito meglio. +2 Carisma' }
        },
      },
      {
        label: 'Resto in silenzio',
        outcome: () => ({ delta: {}, message: 'Nessuna domanda. La lezione continua.' }),
      },
    ],
  },

  {
    id: 'cse_disputa_con_prof',
    category: 'didattica',
    title: 'Discussione animata col prof',
    description: 'Hai detto qualcosa di controverso. Il prof si ferma e ti guarda fisso.',
    probability: 15,
    subjectFilter: ['storia', 'filosofia', 'italiano', 'religione', 'storiaArte'],
    relationRange: [-50, 20],
    choices: [
      {
        label: 'Sostengo la mia posizione con calma',
        outcome: (s: GameStats) => {
          const success = Math.random() < (s.carisma / 100 + s.intelligenza / 200)
          return success
            ? { delta: { carisma: 10, reputazione: 8 }, message: 'Il prof ammette che hai un punto valido. +10 Carisma, +8 Reputazione' }
            : { delta: { coattaggine: 8, stanchezza: 10 }, message: 'Il prof non concede. "Dopo la lezione ne riparliamo." +8 Coattaggine' }
        },
      },
      {
        label: 'Mi scuso e lascio perdere',
        outcome: () => ({ delta: { stanchezza: 5 }, message: 'La pace è ristabilita. Rimane un filo di tensione.' }),
      },
    ],
  },

  {
    id: 'cse_cellulare_in_classe',
    category: 'istituto',
    title: 'Cellulare suona in classe!',
    description: 'Una suoneria rompe il silenzio. Il prof alza la testa.',
    probability: 20,
    subjectFilter: undefined,
    severityRange: [5, 10],
    choices: [
      {
        label: 'Lo silenzi immediatamente',
        outcome: () => ({ delta: { stanchezza: 5 }, message: 'Reazione rapida. Il prof fa finta di niente.' }),
      },
      {
        label: 'Fai finta che non sia il tuo',
        outcome: () => {
          const caught = Math.random() < 0.6
          return caught
            ? { delta: { coattaggine: 20, stanchezza: 10 }, message: 'Il prof sa benissimo com\'è andata. Confiscato fino a fine giornata. +20 Coattaggine' }
            : { delta: { coattaggine: 10 }, message: 'L\'hai fatta franca. Tutti sanno che era tuo. +10 Coattaggine' }
        },
      },
    ],
  },

  {
    id: 'cse_prof_racconta_aneddoto',
    category: 'didattica',
    title: 'Il prof racconta un aneddoto',
    description: 'Il prof si ferma dalla spiegazione e racconta un episodio della sua vita. La classe ascolta.',
    probability: 20,
    subjectFilter: undefined,
    relationRange: [20, 100],
    choices: [
      {
        label: 'Ascolto con interesse',
        outcome: () => ({ delta: { carisma: 3, stanchezza: -5 }, message: 'Momento umano nella giornata scolastica. +3 Carisma, -5 Stanchezza' }),
      },
      {
        label: 'Ne approfitto per fare altro',
        outcome: () => {
          const caught = Math.random() < 0.2
          return caught
            ? { delta: { coattaggine: 5, stanchezza: 5 }, message: 'Il prof ti vede. Sguardo eloquente. +5 Coattaggine' }
            : { delta: { stanchezza: -8 }, message: 'Hai recuperato un po\' di energia. -8 Stanchezza' }
        },
      },
    ],
  },

  {
    id: 'cse_lavoro_di_gruppo',
    category: 'didattica',
    title: 'Lavoro di gruppo!',
    description: 'Il prof divide la classe in gruppi casuali. Tu e altri tre compagni lavorate su un tema.',
    probability: 18,
    subjectFilter: ['italiano', 'storia', 'inglese', 'filosofia', 'storiaArte',
                    'biologia', 'scienzeInt', 'scienzeAlim'],
    choices: [
      {
        label: 'Prendo l\'iniziativa e organizzo il gruppo',
        outcome: (s: GameStats) => {
          const success = Math.random() < (s.carisma / 100)
          return success
            ? { delta: { carisma: 8, reputazione: 5 }, message: 'Ottima leadership. Il prof nota la tua organizzazione. +8 Carisma, +5 Reputazione' }
            : { delta: { stanchezza: 10 }, message: 'Il gruppo era difficile da gestire. Risultato medio. +10 Stanchezza' }
        },
      },
      {
        label: 'Partecipo senza mettermi in mostra',
        outcome: () => ({ delta: { intelligenza: 2 }, message: 'Contributo rilassato ma corretto. +2 Intelligenza' }),
      },
      {
        label: 'Lascio fare agli altri',
        outcome: () => ({
          delta: { coattaggine: 5, stanchezza: -10 },
          message: 'I compagni hanno fatto tutto. Riposo guadagnato ma reputazione in calo. +5 Coattaggine',
        }),
      },
    ],
  },

  {
    id: 'cse_nota_sul_registro',
    category: 'didattica',
    title: 'Il prof ti fa la nota!',
    description: 'Hai detto qualcosa di sbagliato nel momento sbagliato. Il prof apre il registro.',
    probability: 15,
    subjectFilter: undefined,
    severityRange: [7, 10],
    choices: [
      {
        label: 'Accetto la nota in silenzio',
        outcome: () => ({ delta: { coattaggine: 5, stanchezza: 8 }, message: 'Nota sul registro. I tuoi genitori la firmeranno stasera. +5 Coattaggine' }),
      },
      {
        label: 'Protesto: "Non è giusto!"',
        outcome: (s: GameStats) => {
          const brave = s.coattaggine > 70
          return brave
            ? { delta: { coattaggine: 15, reputazione: 10 }, message: 'La classe applaude. Il prof raddoppia la nota. +15 Coattaggine, +10 Reputazione' }
            : { delta: { stanchezza: 15, coattaggine: 8 }, message: 'Protesta debole. Seconda nota aggiunta. +8 Coattaggine, +15 Stanchezza' }
        },
      },
    ],
  },

  {
    id: 'cse_aiuto_compagno_banco',
    category: 'sociale',
    title: 'Il compagno di banco ha bisogno di aiuto',
    description: 'Chi siede accanto a te ti passa un bigliettino: "Non ho capito niente, aiutami."',
    probability: 22,
    subjectFilter: undefined,
    choices: [
      {
        label: 'Lo aiuto sottovoce',
        outcome: (s: GameStats) => {
          const caught = Math.random() < (0.3 - s.carisma / 500)
          return caught
            ? { delta: { coattaggine: 10, stanchezza: 5 }, message: 'Il prof vi vede. "Taci!" +10 Coattaggine' }
            : {
                delta: { carisma: 5, intelligenza: 1 },
                message: 'Spiegare rafforza anche la tua comprensione. +5 Carisma, +1 Intelligenza',
                newFriend: generateSchoolFriend('compagno_classe') as Friend,
              }
        },
      },
      {
        label: 'Mi dispiace, non posso',
        outcome: () => ({ delta: {}, message: 'Il compagno annuisce e fa da solo.' }),
      },
    ],
  },
]

// ─── getContextualEvents ──────────────────────────────────────────────────────

/**
 * Filtra gli eventi compatibili con la materia e gli attributi del professore.
 * Un evento è compatibile se:
 * - subjectFilter è undefined/vuoto OPPURE include subjectKey
 * - severityRange è undefined OPPURE teacherSeverita è dentro il range
 * - relationRange è undefined OPPURE teacherRelazione è dentro il range
 */
export function getContextualEvents(
  subjectKey: string,
  teacherSeverita: number,
  teacherRelazione: number
): ContextualSchoolEvent[] {
  return CONTEXTUAL_SCHOOL_EVENTS.filter(event => {
    // Filtro materia
    if (event.subjectFilter && event.subjectFilter.length > 0) {
      if (!event.subjectFilter.includes(subjectKey)) return false
    }
    // Filtro severità
    if (event.severityRange) {
      const [min, max] = event.severityRange
      if (teacherSeverita < min || teacherSeverita > max) return false
    }
    // Filtro relazione
    if (event.relationRange) {
      const [min, max] = event.relationRange
      if (teacherRelazione < min || teacherRelazione > max) return false
    }
    return true
  })
}
