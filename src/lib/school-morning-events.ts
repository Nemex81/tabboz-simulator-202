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

  // ── CATEGORIA: DIDATTICA ─────────────────────────────────────────────────

  {
    id: 'sm_interrogazione_a_sorpresa',
    category: 'didattica',
    title: 'Interrogazione a sorpresa!',
    description: 'Il prof entra in classe con il registro spalancato e un sorriso sospetto. "Oggi interrogo!"',
    probability: 35,
    choices: [
      {
        label: 'Rispondo come so (tiro al dado)',
        outcome: (s) => {
          const success = Math.random() < (s.intelligenza / 100)
          return success
            ? { delta: { intelligenza: 2 }, message: 'Ti sei cavato bene! Il prof annuisce soddisfatto. +2 Intelligenza' }
            : { delta: { stanchezza: 10 }, message: 'Figuraccia epica. Il prof ti guarda deluso. +10 Stanchezza' }
        },
      },
      {
        label: 'Faccio il malato e chiedo di uscire',
        outcome: () => ({ delta: { coattaggine: 5, stanchezza: -5 }, message: 'Scappi dall\'interrogazione! +5 Coattaggine, -5 Stanchezza' }),
        grantsExtraAction: true,
      },
    ],
  },

  {
    id: 'sm_compiti_non_fatti',
    category: 'didattica',
    title: 'Compiti non fatti!',
    description: 'Il prof raccoglie i compiti. Hai dimenticato di farli.',
    probability: 25,
    choices: [
      {
        label: 'Copio dal compagno di banco in extremis',
        outcome: () => {
          const success = Math.random() < 0.5
          return success
            ? { delta: { coattaggine: 8 }, message: 'Copiatura riuscita! Nessuno ha visto niente. +8 Coattaggine' }
            : { delta: { intelligenza: -3, coattaggine: 15 }, message: 'Beccato! Il prof ti dà nota sul registro. -3 Intelligenza, +15 Coattaggine' }
        },
      },
      {
        label: 'Ammetto di non averli fatti',
        outcome: () => ({ delta: { intelligenza: 3, stanchezza: 5 }, message: 'Il prof apprezza la sincerità... ma ti dà i compiti doppi per domani. +3 Intelligenza' }),
      },
    ],
  },

  {
    id: 'sm_lezione_noiosa',
    category: 'didattica',
    title: 'Lezione mortalmente noiosa',
    description: 'Il prof di storia legge il libro ad alta voce da 40 minuti. Gli occhi si chiudono da soli.',
    probability: 40,
    choices: [
      {
        label: 'Mi addormento (rischio)',
        outcome: () => {
          const caught = Math.random() < 0.4
          return caught
            ? { delta: { stanchezza: -20, coattaggine: 10 }, message: 'Sei stato svegliato di soprassalto dal prof! -20 Stanchezza, +10 Coattaggine' }
            : { delta: { stanchezza: -30 }, message: 'Sonno ristoratore in classe. Nessuno se n\'è accorto. -30 Stanchezza' }
        },
        grantsExtraAction: false,
      },
      {
        label: 'Passo il tempo a disegnare sul banco',
        outcome: () => ({ delta: { stanchezza: -10, coattaggine: 5 }, message: 'Hai prodotto capolavori. -10 Stanchezza, +5 Coattaggine' }),
      },
      {
        label: 'Ascolto e prendo appunti',
        outcome: () => ({ delta: { intelligenza: 2 }, message: 'Che noia, ma sei bravo! +2 Intelligenza' }),
      },
    ],
  },

  {
    id: 'sm_verifica_a_sorpresa',
    category: 'didattica',
    title: 'Verifica scritta a sorpresa!',
    description: 'Il prof distribuisce fogli bianchi senza preavviso. Silenzio tombale in classe.',
    probability: 20,
    choices: [
      {
        label: 'Faccio del mio meglio',
        outcome: (s) => {
          const score = Math.floor((s.intelligenza / 100) * 5) + 3
          return { delta: { stanchezza: 15 }, message: `Ti sembra di aver risposto abbastanza bene. Voto atteso: ~${score}/10. +15 Stanchezza` }
        },
      },
      {
        label: 'Provo a copiare dal compagno',
        outcome: () => {
          const caught = Math.random() < 0.45
          return caught
            ? { delta: { coattaggine: 20, stanchezza: 20 }, message: 'Beccato a copiare! Zero e nota. +20 Coattaggine, +20 Stanchezza' }
            : { delta: { coattaggine: 10 }, message: 'Copiatura silenziosa riuscita. Sollievo totale. +10 Coattaggine' }
        },
      },
    ],
  },

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
    description: 'L\'ora di matematica è coperta da un supplente che non sa niente della materia. Classe in festa.',
    probability: 30,
    choices: [
      {
        label: 'Ore libere — ne approfitto per studiare',
        outcome: () => ({ delta: { intelligenza: 4, stanchezza: 5 }, message: 'Hai usato l\'ora libera bene. +4 Intelligenza, +5 Stanchezza' }),
        grantsExtraAction: false,
      },
      {
        label: 'Giro per i corridoi con gli amici',
        outcome: () => ({ delta: { carisma: 8, reputazione: 5, stanchezza: -5 }, message: 'Ora libera e socialità! +8 Carisma, +5 Reputazione' }),
        grantsExtraAction: true,
      },
      {
        label: 'Scivolo fuori dall\'istituto',
        outcome: () => {
          const caught = Math.random() < 0.25
          return caught
            ? { delta: { coattaggine: 25, stanchezza: 20 }, message: 'Ti hanno beccato fuori dal cancello! Segnalazione ai genitori. +25 Coattaggine' }
            : { delta: { stanchezza: -20, coattaggine: 15 }, message: 'Fuga riuscita! Aria fresca e libertà. -20 Stanchezza, +15 Coattaggine' }
        },
        grantsExtraAction: true,
      },
    ],
  },
  // ── EVENTO: COMPAGNO ISTITUTO (unico canale per originType 'compagno_istituto') ──

  {
    id: 'sm_compagno_istituto',
    category: 'sociale',
    title: 'Incontro alla mensa scolastica',
    description: 'Durante la pausa pranzo incontri uno studente di un\'altra classe. Sembra simpatico.',
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
        label: 'Mangi per conto tuo',
        outcome: () => ({
          delta: {},
          message: 'Pranzo tranquillo, niente di nuovo.',
        }),
      },
    ],
  },]

/**
 * Seleziona casualmente fino a `maxEvents` eventi per la mattina scolastica,
 * rispettando le probabilità individuali di ogni evento.
 */
export function drawSchoolMorningEvents(maxEvents = 3): SchoolMorningEvent[] {
  const eligible = SCHOOL_MORNING_EVENTS.filter(e => Math.random() * 100 < e.probability)
  const shuffled = eligible.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, maxEvents)
}
