// src/lib/school-morning-events.ts
// Pool di eventi randomizzati per la mattina scolastica.

import { GameStats, Friend, MorningEventCategory } from '@/lib/types'
import { generateSchoolFriend } from './enhanced-friend-system'

export interface SchoolMorningEvent {
  id: string
  category: MorningEventCategory
  title: string
  description: string
  probability: number           // 0–100
  choices: SchoolMorningChoice[]
}

export interface SchoolMorningChoice {
  label: string
  outcome: (stats: GameStats) => { delta: Partial<GameStats>; message: string; newFriend?: Friend }
  grantsExtraAction?: boolean   // true → +1 extraAction al giocatore
}

// ─── POOL EVENTI ─────────────────────────────────────────────────────────────

export const SCHOOL_MORNING_EVENTS: SchoolMorningEvent[] = [

  // ── CATEGORIA: SOCIALE ───────────────────────────────────────────────────

  {
    id: 'sm_bullo_corridoio',
    category: 'sociale',
    title: 'Il bullo del corridoio',
    description: 'Marco, il bullo delle terze, ti blocca al corridoio durante il cambio ora. "Ehi, dammi i soldi della merenda."',
    probability: 30,
    choices: [
      {
        label: 'Gli dai i soldi (cedi)',
        outcome: () => ({ delta: { soldi: -5, coattaggine: -10 }, message: 'Hai ceduto. -5 Soldi, -10 Coattaggine. Ti senti una mer*a.' }),
      },
      {
        label: 'Lo sfidi a muso duro',
        outcome: (s) => {
          const win = Math.random() < (s.muscoli / 100)
          return win
            ? { delta: { coattaggine: 20, reputazione: 15 }, message: 'Lo hai fronteggiato e si è fatto da parte! +20 Coattaggine, +15 Reputazione' }
            : { delta: { stanchezza: 20, coattaggine: -5 }, message: 'Ti ha dato un cazzotto. -5 Coattaggine, +20 Stanchezza' }
        },
      },
      {
        label: 'Scappi dalla parte opposta',
        outcome: () => ({ delta: { stanchezza: -5, coattaggine: -5 }, message: 'Hai evitato lo scontro con una fuga strategica. -5 Coattaggine' }),
        grantsExtraAction: true,
      },
    ],
  },

  {
    id: 'sm_nuovo_amico',
    category: 'sociale',
    title: 'Nuovo compagno di classe',
    description: 'Alla tua destra è seduto un tipo nuovo che non hai mai visto. Sembra a suo agio e sorride.',
    probability: 25,
    choices: [
      {
        label: 'Lo avvicino e gli parlo',
        outcome: (s) => {
          const success = Math.random() < (s.carisma / 100)
          return success
            ? { delta: { carisma: 8, reputazione: 5 }, message: 'Bella chiacchierata! Nuovo amico aggiunto alla rubrica! +8 Carisma, +5 Reputazione', newFriend: generateSchoolFriend('compagno_classe') }
            : { delta: { stanchezza: 5 }, message: 'Conversazione un po\' imbarazzante. Ci riproverai.' }
        },
        grantsExtraAction: false,
      },
      {
        label: 'Lo ignoro — prima le mie cose',
        outcome: () => ({ delta: {}, message: 'Non fai niente. Opportunità persa? Chi lo sa.' }),
      },
    ],
  },

  {
    id: 'sm_crush_in_classe',
    category: 'sociale',
    title: 'La tua crush ti ha guardato!',
    description: 'Durante la lezione, quella/quello che ti piace da mesi ti lancia uno sguardo. Significativo? Casuale?',
    probability: 20,
    choices: [
      {
        label: 'Sorrido e abbasso gli occhi (timido)',
        outcome: () => ({ delta: { carisma: 5 }, message: 'Piccolo momento dolce. +5 Carisma' }),
      },
      {
        label: 'Gli/le passo un bigliettino',
        outcome: (s) => {
          const success = Math.random() < ((s.figosita + s.carisma) / 200)
          return success
            ? { delta: { figosita: 15, carisma: 10 }, message: 'Ha risposto con un cuoricino! +15 Figosità, +10 Carisma' }
            : { delta: { figosita: -10, stanchezza: 10 }, message: 'Ha riso col compagno di banco. Terra, inghiottimi. -10 Figosità' }
        },
        grantsExtraAction: true,
      },
    ],
  },

  {
    id: 'sm_lite_tra_compagni',
    category: 'sociale',
    title: 'Rissa nel corridoio!',
    description: 'Due compagni si stanno menando in corridoio durante la ricreazione. Tutti intorno a guardare.',
    probability: 20,
    choices: [
      {
        label: 'Guardo e tifo (spettatore)',
        outcome: () => ({ delta: { coattaggine: 5 }, message: 'Classico dramma scolastico. +5 Coattaggine' }),
      },
      {
        label: 'Li separo (ci provo)',
        outcome: (s) => {
          const success = Math.random() < (s.muscoli / 100)
          return success
            ? { delta: { reputazione: 20, carisma: 10 }, message: 'Li hai separati! Tutti ti applaudono. +20 Reputazione, +10 Carisma' }
            : { delta: { stanchezza: 25, coattaggine: 8 }, message: 'Ti sei preso una gomitata involontaria. Eroico ma malconcio. +25 Stanchezza' }
        },
      },
      {
        label: 'Chiamo il professore',
        outcome: () => ({ delta: { intelligenza: 3, coattaggine: -10 }, message: 'La cosa si risolve pacificamente. Ma qualcuno ti chiama "leccac*lo". -10 Coattaggine, +3 Intelligenza' }),
      },
    ],
  },

  // ── CATEGORIA: ISTITUTO ───────────────────────────────────────────────────

  {
    id: 'sm_assemblea_istituto',
    category: 'istituto',
    title: 'Assemblea studentesca',
    description: 'Il preside annuncia un\'assemblea straordinaria. Si parla di nuovi regolamenti sull\'uso del cellulare.',
    probability: 15,
    choices: [
      {
        label: 'Intervengo al microfono',
        outcome: (s) => {
          const success = Math.random() < (s.carisma / 100)
          return success
            ? { delta: { carisma: 20, reputazione: 15 }, message: 'Il tuo intervento fa colpo su tutti! +20 Carisma, +15 Reputazione' }
            : { delta: { coattaggine: 5, stanchezza: 10 }, message: 'Ti sei imbrogliato col microfono. Imbarazzo totale. +5 Coattaggine' }
        },
        grantsExtraAction: true,
      },
      {
        label: 'Ascolto tranquillo',
        outcome: () => ({ delta: { stanchezza: -5 }, message: 'Assemblea noiosa ma almeno non fai niente di stupido. -5 Stanchezza' }),
      },
      {
        label: 'Gioco col telefono in silenzio',
        outcome: () => {
          const caught = Math.random() < 0.3
          return caught
            ? { delta: { coattaggine: 20, stanchezza: 10 }, message: 'Il preside te lo sequestra! +20 Coattaggine, +10 Stanchezza' }
            : { delta: { stanchezza: -10 }, message: 'Nessuno se n\'è accorto. -10 Stanchezza' }
        },
      },
    ],
  },

  {
    id: 'sm_uscita_didattica',
    category: 'istituto',
    title: 'Uscita didattica!',
    description: 'Oggi si va al museo della scienza. Hai firmato la liberatoria ma non ricordavi che era oggi.',
    probability: 12,
    choices: [
      {
        label: 'Partecipo con entusiasmo',
        outcome: () => ({ delta: { intelligenza: 5, stanchezza: 15, carisma: 5 }, message: 'Gita interessante! Hai anche socializzato sul pullman. +5 Intelligenza, +5 Carisma, +15 Stanchezza' }),
        grantsExtraAction: true,
      },
      {
        label: 'Sto in fondo e gioco col telefono',
        outcome: () => ({ delta: { stanchezza: -10, coattaggine: 5 }, message: 'Gita passata a fare niente. -10 Stanchezza, +5 Coattaggine' }),
      },
    ],
  },

  {
    id: 'sm_prof_assente',
    category: 'istituto',
    title: 'Prof assente!',
    description: 'Il gruppo classe di WhatsApp esplode alle 7:30: \'Oggi il prof di matematica non c\'è, c\'è il supplente!\' La notizia arriva mentre sei ancora per strada.',
    probability: 30,
    choices: [
      {
        label: 'Rallento il passo — tanto c\'è il supplente',
        outcome: () => ({ delta: { stanchezza: -5 }, message: 'Arrivi rilassato. Risparmi energie.' }),
      },
      {
        label: 'Avverto gli altri del gruppo',
        outcome: () => ({ delta: { carisma: 3, reputazione: 5 }, message: '+3 Carisma, +5 Reputazione.' }),
      },
      {
        label: 'Arrivo comunque puntuale — impressiono il supplente',
        outcome: () => ({ delta: { intelligenza: 2 }, message: 'Puntuale anche con il supplente. +2 Intelligenza.' }),
      },
    ],
  },
  // ── EVENTO: COMPAGNO ISTITUTO (unico canale per originType 'compagno_istituto') ──

  {
    id: 'sm_compagno_istituto',
    category: 'sociale',
    title: 'Ragazzo di un\'altra classe in cortile',
    description: 'Prima della campanella, in cortile, noti un tipo che non hai mai visto. Non è della tua sezione, forse è una classe parallela o del corso serale.',
    probability: 8,
    choices: [
      {
        label: 'Ti presenti e attacchi bottone',
        outcome: (s) => {
          const newFriend = generateSchoolFriend('compagno_istituto')
          return {
            delta: { carisma: 2 },
            message: `Hai conosciuto ${newFriend.name}! Un nuovo compagno di istituto! +2 Carisma`,
            newFriend,
          }
        },
      },
      {
        label: 'Lo osservi da lontano',
        outcome: () => ({
          delta: {},
          message: 'Ti limiti a guardare. Opportunità persa?',
        }),
      },
    ],
  },

  // ── NUOVI EVENTI: SOCIALE ────────────────────────────────────────────────

  {
    id: 'sm_ritardo_bus',
    category: 'sociale',
    title: 'Il bus è in ritardo',
    description: 'Il bus scolastico è in ritardo di venti minuti. Siete in dieci ad aspettare alla fermata. Qualcuno ha già tirato fuori il telefono.',
    probability: 18,
    choices: [
      {
        label: 'Attacco bottone con chi aspetta',
        outcome: (s) => {
          const success = Math.random() < (s.carisma / 100)
          return success
            ? { delta: { carisma: 5 }, message: 'Nuova conoscenza alla fermata. +5 Carisma.' }
            : { delta: { stanchezza: 5 }, message: 'Non era di buon umore. +5 Stanchezza.' }
        },
      },
      {
        label: 'Mando messaggio al prof in anticipo',
        outcome: () => ({ delta: { intelligenza: 2 }, message: 'Previdente. +2 Intelligenza.' }),
      },
      {
        label: 'Vado a piedi — arrivo prima io',
        outcome: () => ({ delta: { stanchezza: 15, coattaggine: 5 }, message: 'Arrivi trafelato ma ce la fai. +15 Stanchezza, +5 Coattaggine.' }),
      },
    ],
  },

  {
    id: 'sm_pettegolezzo_al_cancello',
    category: 'sociale',
    title: 'Pettegolezzo bomba prima di entrare',
    description: 'Prima di entrare un compagno ti prende da parte. Ha sentito qualcosa di grosso su qualcuno della classe. Aria di cospirazione.',
    probability: 20,
    choices: [
      {
        label: 'Ascolto e partecipo',
        outcome: () => ({ delta: { carisma: 3, reputazione: 5 }, message: '+3 Carisma, +5 Reputazione.' }),
      },
      {
        label: 'Non mi interessa, entro',
        outcome: () => ({ delta: {}, message: 'Entri prima degli altri. Azione extra.' }),
        grantsExtraAction: true,
      },
      {
        label: 'Diffondo la voce subito',
        outcome: () => {
          const success = Math.random() < 0.5
          return success
            ? { delta: { reputazione: 8 }, message: 'La voce si diffonde e tu sei la fonte. +8 Reputazione.' }
            : { delta: { reputazione: -12, stanchezza: 10 }, message: 'Era falsa. Figuraccia. -12 Reputazione.' }
        },
      },
    ],
  },

  {
    id: 'sm_ragazzi_altra_sezione',
    category: 'sociale',
    title: 'Il gruppo della 3B',
    description: 'In cortile un gruppo della 3B ti chiama. Sembrano simpatici. Vuoi fare bella figura prima di entrare.',
    probability: 25,
    choices: [
      {
        label: 'Mi avvicino e mi presento',
        outcome: (s) => {
          const success = Math.random() < (s.carisma / 100)
          if (success) {
            const newFriend = generateSchoolFriend('compagno_istituto')
            return { delta: { carisma: 8, reputazione: 10 }, message: '+8 Carisma, +10 Reputazione, nuovo contatto.', newFriend }
          }
          return { delta: { stanchezza: 5 }, message: 'Momento imbarazzante. +5 Stanchezza.' }
        },
      },
      {
        label: 'Li osservo da lontano',
        outcome: () => ({ delta: { stanchezza: -5 }, message: 'Nessun rischio, nessun guadagno. -5 Stanchezza.' }),
      },
      {
        label: 'Apro con una battuta',
        outcome: () => {
          const success = Math.random() < 0.4
          return success
            ? { delta: { coattaggine: 10, reputazione: 8 }, message: '+10 Coattaggine, +8 Reputazione.' }
            : { delta: { coattaggine: 10, reputazione: -5 }, message: 'La battuta non ha funzionato. +10 Coattaggine, -5 Reputazione.' }
        },
      },
    ],
  },

  {
    id: 'sm_sfida_motorino_cancello',
    category: 'sociale',
    title: 'Sfida di motorini fuori dal cancello',
    description: 'Un tipo del quarto anno commenta il tuo motorino: \'È lento, il mio è meglio.\' Sfida silenziosa davanti a tutti.',
    probability: 20,
    choices: [
      {
        label: 'Lo ignoro',
        outcome: () => ({ delta: {}, message: 'Saggio. Azione extra.' }),
        grantsExtraAction: true,
      },
      {
        label: 'Accetto la sfida per dopo scuola',
        outcome: () => ({ delta: { coattaggine: 15, reputazione: 5 }, message: '+15 Coattaggine, +5 Reputazione.' }),
      },
      {
        label: 'Gli faccio vedere i cavalli ora',
        outcome: () => {
          const multa = Math.random() < 0.3
          return multa
            ? { delta: { coattaggine: 20, soldi: -50 }, message: 'Arriva un vigile. +20 Coattaggine, -50 Soldi.' }
            : { delta: { coattaggine: 20, figosita: 8 }, message: '+20 Coattaggine, +8 Figosità.' }
        },
      },
    ],
  },

  {
    id: 'sm_dimenticato_zaino',
    category: 'sociale',
    title: 'Libro dimenticato a casa',
    description: 'A metà strada realizzi di aver dimenticato il libro di matematica. La prima ora è proprio matematica.',
    probability: 22,
    choices: [
      {
        label: 'Chiedo in prestito al compagno',
        outcome: () => ({ delta: { carisma: 3 }, message: '+3 Carisma.' }),
      },
      {
        label: 'Torno di corsa a casa',
        outcome: () => ({ delta: { stanchezza: 20, intelligenza: 2 }, message: 'Hai il libro. +20 Stanchezza, +2 Intelligenza.' }),
      },
      {
        label: 'Me ne frego — invento scusa',
        outcome: () => {
          const success = Math.random() < 0.5
          return success
            ? { delta: { coattaggine: 8 }, message: 'Il prof ci ha creduto. +8 Coattaggine.' }
            : { delta: { coattaggine: 8, intelligenza: -2 }, message: 'Scusa smontata. +8 Coattaggine, -2 Intelligenza.' }
        },
      },
    ],
  },

  {
    id: 'sm_ragazza_altra_scuola',
    category: 'sociale',
    title: 'Quella/o dell\'altro istituto',
    description: 'Al semaforo davanti alla scuola c\'è qualcuno di un altro istituto. Vi siete già visti. Oggi si ferma e ti guarda.',
    probability: 15,
    choices: [
      {
        label: 'La/Lo saluto e attacco discorso',
        outcome: () => {
          const newFriend = generateSchoolFriend('compagno_istituto')
          return { delta: { figosita: 10, carisma: 8 }, message: '+10 Figosità, +8 Carisma, nuovo contatto.', newFriend }
        },
      },
      {
        label: 'Fingo di guardare il telefono',
        outcome: () => ({ delta: { stanchezza: -5 }, message: 'Troppo timido. Opportunità persa. -5 Stanchezza.' }),
      },
      {
        label: 'Offro passaggio sul motorino',
        outcome: () => {
          const highVis = Math.random() < 0.3
          return highVis
            ? { delta: { figosita: 20, carisma: 15, reputazione: 10 }, message: '+20 Figosità, +15 Carisma, +10 Reputazione.' }
            : { delta: { figosita: 20, carisma: 15 }, message: '+20 Figosità, +15 Carisma.' }
        },
      },
    ],
  },

  {
    id: 'sm_rissa_fuori_cancello',
    category: 'sociale',
    title: 'Rissa fuori dal cancello',
    description: 'Prima di entrare c\'è un capannello. Due tipi di scuole diverse se le stanno dando fuori dal cancello. I prof non sono ancora usciti.',
    probability: 18,
    choices: [
      {
        label: 'Mi fermo a guardare',
        outcome: () => ({ delta: { coattaggine: 5 }, message: '+5 Coattaggine.' }),
      },
      {
        label: 'Chiamo i prof',
        outcome: () => ({ delta: { intelligenza: 3, coattaggine: -10 }, message: '+3 Intelligenza, -10 Coattaggine.' }),
      },
      {
        label: 'Mi intrometto',
        outcome: (s) => {
          const success = Math.random() < (s.muscoli / 100)
          return success
            ? { delta: { reputazione: 20, carisma: 10 }, message: '+20 Reputazione, +10 Carisma. Eroe del cortile.' }
            : { delta: { stanchezza: 30 }, message: 'Ti sei preso qualche spinta. +30 Stanchezza.' }
        },
      },
    ],
  },

  {
    id: 'sm_ansia_interrogazione',
    category: 'sociale',
    title: 'Ansia pre-interrogazione',
    description: 'Ieri il prof ha detto che oggi interroga. Sul bus tutti si scambiano appunti e panico. Tu sai di non aver studiato abbastanza.',
    probability: 15,
    choices: [
      {
        label: 'Rileggo gli appunti veloce sul bus',
        outcome: () => ({ delta: { intelligenza: 3, stanchezza: 5 }, message: 'Preparato al minimo. +3 Intelligenza.' }),
      },
      {
        label: 'Chiedo a un compagno di spiegarmi',
        outcome: (s) => {
          const success = Math.random() < (s.carisma / 100)
          return success
            ? { delta: { intelligenza: 5, carisma: 2 }, message: '+5 Intelligenza, +2 Carisma.' }
            : { delta: { stanchezza: 10 }, message: 'Non aveva voglia. +10 Stanchezza.' }
        },
      },
      {
        label: 'Lascio perdere — mi interrogherà un altro',
        outcome: () => ({ delta: { coattaggine: 5 }, message: 'Classico ragionamento da studente strategico. +5 Coattaggine.' }),
        grantsExtraAction: true,
      },
    ],
  },

  {
    id: 'sm_intervallo_prima_suoneria',
    category: 'sociale',
    title: 'Quindici minuti prima della campanella',
    description: 'Sei arrivato con 15 minuti di anticipo. Il cortile è già animato. Puoi fare di tutto prima che suoni la campanella.',
    probability: 20,
    choices: [
      {
        label: 'Organizzo una partita a calcio',
        outcome: (s) => {
          const success = Math.random() < (s.muscoli / 100)
          return success
            ? { delta: { muscoli: 5, carisma: 8, reputazione: 5 }, message: '+5 Muscoli, +8 Carisma, +5 Reputazione.' }
            : { delta: { stanchezza: 15 }, message: 'Mal organizzata. +15 Stanchezza.' }
        },
      },
      {
        label: 'Sto con il mio gruppo di sempre',
        outcome: () => ({ delta: { carisma: 3, stanchezza: -5 }, message: '+3 Carisma, -5 Stanchezza.' }),
      },
      {
        label: 'Mi avvicino a qualcuno che mi piace',
        outcome: (s) => {
          const success = Math.random() < ((s.figosita + s.carisma) / 200)
          return success
            ? { delta: { figosita: 12, carisma: 10 }, message: '+12 Figosità, +10 Carisma.' }
            : { delta: { figosita: -5, stanchezza: 5 }, message: 'Momento sbagliato. -5 Figosità, +5 Stanchezza.' }
        },
      },
    ],
  },
]

/**
 * Seleziona casualmente fino a `maxEvents` eventi per la mattina scolastica,
 * rispettando le probabilità individuali di ogni evento.
 */
export function drawSchoolMorningEvents(maxEvents = 3): SchoolMorningEvent[] {
  const eligible = SCHOOL_MORNING_EVENTS.filter(e => Math.random() * 100 < e.probability)
  const shuffled = eligible.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, maxEvents)
}
