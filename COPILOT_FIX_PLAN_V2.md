# Piano di Correzione V2 — Tabboz Simulator

**Data:** 2026-04-03
**Autore:** Analisi automatica da Perplexity AI
**Repo:** Nemex81/tabboz-simulator-202
**Branch:** main

---

## Indice

1. [Analisi dello stato attuale](#1-analisi-stato-attuale)
2. [Anomalie rilevate](#2-anomalie-rilevate)
3. [Strategia correttiva](#3-strategia-correttiva)
4. [Fix 1 — Rimozione `studia` dalla mattina feriale e gating corretto](#fix-1)
5. [Fix 2 — Mattina scolastica: azioni dedicate e testo contestuale](#fix-2)
6. [Fix 3 — Nuovo file `school-morning-events.ts`](#fix-3)
7. [Fix 4 — Hook: trigger eventi scolastici mattutini in `useGameTime`](#fix-4)
8. [Fix 5 — Sistema `extraActions` (conversione variabile globale)](#fix-5)
9. [Checklist di test](#checklist-di-test)

---

## 1. Analisi Stato Attuale

### File esaminati

| File | Ruolo |
|---|---|
| `src/lib/phase-actions.ts` | Mappa statica azioni per `(DayType, DayPhase)` |
| `src/lib/time-utils.ts` | Configurazione `DAY_PHASE_CONFIG`, `PHASE_SEQUENCE` |
| `src/hooks/useGameTime.ts` | Gestione tempo, fasi, `consumeAction`, `advancePhaseOnly` |
| `src/hooks/useGameActions.ts` | Handler azioni: controlla `gt.actionsRemaining` (variabile **globale**) |
| `src/lib/school-events.ts` | Pool eventi scolastici esistenti (prof, genitori) |
| `src/lib/types.ts` | Tipi `DayPhase`, `DayType`, `GameTime`, `GameStats` |

### Variabile azioni attuale

`GameTime.actionsRemaining` è una variabile **globale giornaliera** ereditata dalla versione precedente.
Il sistema di fasi orarie usa invece `phaseActionsRemaining` (persistito come `tabboz-phase-actions`).

**Problema:** tutti gli handler in `useGameActions.ts` controllano `gt.actionsRemaining === 0` (globale), ignorando completamente `phaseActionsRemaining`. Le due variabili scalano in parallelo ma quella di controllo resta quella vecchia.

---

## 2. Anomalie Rilevate

### A — Nessun gating reale sulle azioni per fascia oraria

`PHASE_ACTIONS` in `phase-actions.ts` definisce correttamente quali azioni sono disponibili per fascia, ma **nessun handler in `useGameActions.ts` legge questa mappa**. Il giocatore può chiamare `handleDisco()` o `handlePalestra()` in qualsiasi momento perché i guard nei callback controllano solo `gt.actionsRemaining` e non la fase corrente.

### B — `studia` presente nella mattina feriale come attività diretta

In `PHASE_ACTIONS.feriale.mattina` compare `{ id: 'studia', label: 'Studia (mattina scolastica)' }`. Questa entry fa credere che studiare sia un'azione libera al mattino, ma la mattina scolastica dovrebbe essere **un blocco narrativo gestito automaticamente** (sei a scuola), con eventi random che scattano durante le ore di lezione.

### C — Assenza di eventi randomizzati durante la mattina scolastica

La fase `mattina` dei giorni feriali (periodo scolastico) non genera alcun evento scolastico in-session. I soli eventi scolastici esistenti (`getTeacherEvent`, `getParentEventByMedia`) vengono triggerati nell'`advanceToNextDay`, non durante la mattina.

### D — `studia` è solo un'attività extra-scolastica ma non è bloccata alla mattina

`handleStudia()` non controlla la fase corrente. Dovrebbe essere disponibile solo nel **pomeriggio** e nella **sera**.

### E — `actionsRemaining` globale non dismessa

`GameTime.actionsRemaining` continua ad essere l'unico gate reale sulle azioni. `phaseActionsRemaining` viene decrementata ma non bloccante. Il PRD originale prevede la migrazione verso il sistema a fasi, ma non è ancora avvenuta nei handler.

---

## 3. Strategia Correttiva

### Principio guida

> La mattina feriale in periodo scolastico è **automatica**: il personaggio è a scuola. Il giocatore non sceglie azioni libere — riceve eventi narrativi. Le azioni libere tornano dal pomeriggio in poi.

### Architettura target

```
Mattina feriale (isSchoolPeriod=true)
  └── SchoolMorningPanel (nuovo componente)
        ├── 3 slot evento random (bassa/media probabilità)
        │     ├── Categoria: didattica (interrogazione a sorpresa, compiti)
        │     ├── Categoria: sociale (bullo, amicizia, crush)
        │     └── Categoria: istituto (assemblea, uscita didattica, preside)
        └── Bottone: "Fine mattina → Vai al pomeriggio" (chiama advancePhaseOnly)

Pomeriggio / Sera feriale
  └── Pannello azioni normale (palestra, studia, lavoro, motorino, cinema…)
        └── studia disponibile SOLO qui (non più in mattina)

Sistema azioni
  └── phaseActionsRemaining → variabile PRIMARIA di controllo
  └── actionsRemaining (GameTime) → rinominato extraActions
        └── si guadagna tramite: eventi speciali, decisioni narrative, obiettivi
```

---

## Fix 1 — Rimozione `studia` dalla mattina feriale e gating azioni per fase {#fix-1}

**File:** `src/lib/phase-actions.ts`

### Cosa cambia

1. Rimuovere `studia` da `PHASE_ACTIONS.feriale.mattina`.
2. Aggiungere `studia` a `PHASE_ACTIONS.feriale.pomeriggio` se non già presente (già c'è — ✅).
3. Aggiungere `studia` a `PHASE_ACTIONS.domenica.pomeriggio` e `.sera` (già presenti — ✅).
4. Bloccare `disco`, `lampada`, `corrompi`, `minaccia` nella mattina feriale (già assenti — ✅).
5. Aggiungere una entry speciale `scuola` in `feriale.mattina` per marcare il blocco scolastico.

### Patch da applicare

```typescript
// src/lib/phase-actions.ts
// PRIMA — feriale.mattina:
mattina: [
  { id: 'studia', label: 'Studia (mattina scolastica)', requiresSchoolPeriod: true },
  { id: 'riposa', label: 'Torna a dormire (bugiardo!)' },
],

// DOPO — feriale.mattina:
mattina: [
  // 'studia' rimossa: la mattina è gestita da SchoolMorningPanel
  // Unica azione libera rimasta è riposa (finge di stare a casa malato)
  { id: 'riposa', label: 'Sei a scuola! (salta per oggi)' },
],
```

> **Nota:** il pannello UI deve rilevare `dayType === 'feriale' && currentPhase === 'mattina' && isSchoolPeriod` e mostrare `SchoolMorningPanel` invece del pannello azioni standard.

---

## Fix 2 — Mattina scolastica: azioni dedicate e testo contestuale {#fix-2}

**File:** `src/hooks/useGameActions.ts`

### Aggiunta guardia fase negli handler sensibili

Ogni handler che non ha senso alla mattina feriale deve controllare la fase corrente. Aggiungere `currentPhase` e `dayType` ai parametri di `UseGameActionsParams`:

```typescript
// Aggiungere ai parametri dell'hook:
interface UseGameActionsParams {
  // ... esistenti ...
  currentPhase: DayPhase       // ← NUOVO
  dayType: DayType             // ← NUOVO
  phaseActionsRemaining: number // ← NUOVO (sostituisce actionsRemaining come gate primario)
}
```

### Aggiornare il guard primario in tutti gli handler

Sostituire il check esistente:
```typescript
// PRIMA (in ogni handler):
if (gt.actionsRemaining === 0) {
  announce('Nessuna azione rimasta! ...')
  return
}

// DOPO:
if (phaseActionsRemaining <= 0) {
  announce('Hai esaurito le azioni per questa fascia oraria!')
  return
}
```

### Handler `handleStudia` — blocco in mattina feriale

```typescript
const handleStudia = useCallback(() => {
  // NUOVO: studia non disponibile durante le ore scolastiche
  if (dayType === 'feriale' && currentPhase === 'mattina' && gameTimeRef.current.schoolYear.isSchoolPeriod) {
    playSound.failure()
    announce('Sei a scuola! Non puoi studiare per conto tuo adesso.')
    return
  }
  // ... resto del codice invariato ...
}, [..., currentPhase, dayType])
```

### Handler `handleDisco` — blocco esplicito in mattina

```typescript
const handleDisco = useCallback(() => {
  // NUOVO: discoteca non disponibile di mattina
  if (currentPhase === 'mattina') {
    playSound.failure()
    announce('La discoteca di mattina?! Ci vuoi andare a quest\'ora?!')
    return
  }
  // ... resto invariato ...
}, [..., currentPhase])
```

Applicare lo stesso pattern a: `handleLampada` (blocca in mattina feriale), `handleLavoro` (blocca mattina), `handlePalestra` (lascia libero — ha senso anche al mattino sabato/domenica).

---

## Fix 3 — Nuovo file `school-morning-events.ts` {#fix-3}

**File da creare:** `src/lib/school-morning-events.ts`

Questo file definisce il pool di eventi randomizzati che scattano durante la mattina scolastica. Ogni evento appartiene a una categoria e ha una probabilità di innesco.

```typescript
// src/lib/school-morning-events.ts

import { GameStats, SchoolType } from '@/lib/types'
import { clampStat } from '@/lib/game-utils'

export type SchoolMorningCategory = 'didattica' | 'sociale' | 'istituto'

export interface SchoolMorningEvent {
  id: string
  category: SchoolMorningCategory
  title: string
  description: string
  probability: number           // 0–100
  choices: SchoolMorningChoice[]
}

export interface SchoolMorningChoice {
  label: string
  outcome: (stats: GameStats) => { delta: Partial<GameStats>; message: string }
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
        outcome: (s) => {
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
        outcome: (s) => ({ delta: { intelligenza: clampStat(s.intelligenza + 2) - s.intelligenza }, message: 'Che noia, ma sei bravo! +2 Intelligenza' }),
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
            ? { delta: { carisma: 8, reputazione: 5 }, message: 'Bella chiacchierata! Potrebbe diventare un amico. +8 Carisma, +5 Reputazione', }
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
            : { delta: { coattaggine: 5, stanchezza: 10 }, message: 'Ti imbrogliato col microfono. Imbarazzo totale. +5 Coattaggine' }
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
        outcome: (s) => ({ delta: { intelligenza: 4, stanchezza: 5 }, message: 'Hai usato l\'ora libera bene. +4 Intelligenza, +5 Stanchezza' }),
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
]

/**
 * Seleziona casualmente fino a `maxEvents` eventi per la mattina scolastica,
 * rispettando le probabilità individuali di ogni evento.
 */
export function drawSchoolMorningEvents(maxEvents = 3): SchoolMorningEvent[] {
  const eligible = SCHOOL_MORNING_EVENTS.filter(e => Math.random() * 100 < e.probability)
  // Mescola e prende al massimo maxEvents
  const shuffled = eligible.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, maxEvents)
}
```

---

## Fix 4 — Hook: trigger eventi scolastici mattutini in `useGameTime` {#fix-4}

**File:** `src/hooks/useGameTime.ts`

### Aggiunta parametri hook

```typescript
// Aggiungere all'interfaccia UseGameTimeParams:
interface UseGameTimeParams {
  // ... esistenti ...
  setSchoolMorningEvents: (events: SchoolMorningEvent[]) => void  // ← NUOVO
  setShowSchoolMorning: (v: boolean) => void                      // ← NUOVO
}
```

### Aggiunta logica in `advancePhaseOnly`

Quando la fase avanza verso `mattina` in un giorno feriale scolastico, generare gli eventi della mattina:

```typescript
const advancePhaseOnly = useCallback(() => {
  const currentIdx = PHASE_SEQUENCE.indexOf(currentPhase)
  const nextIdx = (currentIdx + 1) % PHASE_SEQUENCE.length
  const nextPhase = PHASE_SEQUENCE[nextIdx]

  if (nextPhase === 'mattina') {
    setRawGameTime((current) => {
      const newGt = advanceGameTime(current)
      const newDayType = getDayType(newGt.currentDate)
      setDayType(newDayType)
      setCurrentPhase('mattina')
      setPhaseActionsRemaining(DAY_PHASE_CONFIG[newDayType]['mattina'].maxActions)

      // NUOVO: genera eventi scolastici se è un giorno feriale scolastico
      if (newDayType === 'feriale' && newGt.schoolYear.isSchoolPeriod) {
        const morningEvents = drawSchoolMorningEvents(3)
        setSchoolMorningEvents(morningEvents)
        setShowSchoolMorning(true)
      }

      return newGt
    })
  } else {
    const cfg = DAY_PHASE_CONFIG[dayType][nextPhase]
    setCurrentPhase(nextPhase)
    setPhaseActionsRemaining(cfg.maxActions)
  }
  playSound.buttonClick()
  announce(`Fascia oraria: ${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)}`)
}, [currentPhase, dayType, setRawGameTime, setCurrentPhase, setDayType, setPhaseActionsRemaining,
    setSchoolMorningEvents, setShowSchoolMorning, announce])
```

---

## Fix 5 — Sistema `extraActions` (conversione variabile globale) {#fix-5}

### Strategia

`GameTime.actionsRemaining` diventa **`GameTime.extraActions`** — azioni bonus guadagnate, non scalano automaticamente ogni giorno.

Il gate primario diventa `phaseActionsRemaining` in ogni handler.

### Modifiche a `src/lib/types.ts`

```typescript
// PRIMA:
export interface GameTime {
  // ...
  actionsRemaining: number
}

// DOPO:
export interface GameTime {
  // ...
  extraActions: number   // azioni bonus guadagnate tramite eventi speciali
}
```

### Modifiche a `src/lib/time-utils.ts` — DEFAULT

```typescript
// Aggiornare il valore default:
export const DEFAULT_GAME_TIME: GameTime = {
  // ...
  extraActions: 0,   // si parte a 0, si guadagnano tramite eventi
}
```

### Modifiche a `useGameTime.ts` — rimossa la riduzione automatica

```typescript
// PRIMA (in consumeAction):
const consumeAction = useCallback(() => {
  setRawGameTime((current) => ({
    ...current,
    actionsRemaining: Math.max(0, current.actionsRemaining - 1)  // ← da rimuovere
  }))
  setPhaseActionsRemaining((n) => Math.max(0, n - 1))
}, [setRawGameTime, setPhaseActionsRemaining])

// DOPO:
const consumeAction = useCallback(() => {
  // Solo phaseActionsRemaining viene decrementata
  setPhaseActionsRemaining((n) => Math.max(0, n - 1))
}, [setPhaseActionsRemaining])
```

### Nuova funzione `gainExtraAction`

```typescript
const gainExtraAction = useCallback(() => {
  setRawGameTime((current) => ({
    ...current,
    extraActions: current.extraActions + 1
  }))
  announce('Hai guadagnato un\'AZIONE EXTRA! Usala saggiamente.')
}, [setRawGameTime, announce])
```

Esporre `gainExtraAction` nel return hook e passarla ai componenti che gestiscono eventi scolastici.

### Come si guadagnano `extraActions` — idee consigliate

| Evento | extraActions guadagnate |
|---|---|
| Scelta coraggiosa in evento scolastico (es. sfida il bullo, intervieni all'assemblea) | +1 |
| Uscita didattica partecipata attivamente | +1 |
| Fuga riuscita durante l'ora libera | +1 |
| Obiettivo settimanale completato (es. 3 giorni senza saltare scuola) | +2 |
| Evento speciale narrativo weekend (es. gara motorini vinta) | +1 |
| Promozione di anno scolastico | +3 (bonus annuale) |

L'`extraActions` può essere usata come "jolly" nella UI: un bottone "Usa azione extra" disponibile in qualunque fascia quando `extraActions > 0`, che permette di sbloccare temporaneamente un'azione fuori orario.

---

## Checklist di Test {#checklist-di-test}

Dopo aver applicato tutti i fix, verificare manualmente:

- [ ] **T1** — Giorno feriale, mattina, periodo scolastico: appare `SchoolMorningPanel`, NON le azioni standard. `handleDisco()` e `handleStudia()` non sono accessibili.
- [ ] **T2** — `SchoolMorningPanel` mostra 1–3 eventi random. Almeno un evento per categoria nell'arco di 3 mattine consecutive.
- [ ] **T3** — Scelta in un evento con `grantsExtraAction: true` incrementa `GameTime.extraActions` di 1.
- [ ] **T4** — Pomeriggio feriale: `handleStudia()` disponibile e funzionante senza errori.
- [ ] **T5** — Sera feriale: `handleDisco()` disponibile (se `stanchezza <= 70` e `soldi >= 60`).
- [ ] **T6** — `phaseActionsRemaining` raggiunge 0 → tutti gli handler mostrano "Hai esaurito le azioni per questa fascia!" e non eseguono.
- [ ] **T7** — `advancePhaseOnly` avanza correttamente da mattina → pomeriggio → sera → notte → mattina (giorno successivo).
- [ ] **T8** — Sabato mattina: `handlePalestra()` e `handleLampada()` disponibili, `handleDisco()` bloccato (era già in sera).
- [ ] **T9** — `GameTime.extraActions` persiste correttamente tra sessioni (KV storage).
- [ ] **T10** — Durante le vacanze estive: `SchoolMorningPanel` NON appare, mattina feriale mostra azioni normali.

---

## Ordine di applicazione consigliato

```
1. src/lib/school-morning-events.ts     ← CREA (nuovo file)
2. src/lib/types.ts                     ← modifica: actionsRemaining → extraActions
3. src/lib/phase-actions.ts             ← modifica: rimuovi studia da feriale.mattina
4. src/hooks/useGameTime.ts             ← modifica: consumeAction, advancePhaseOnly, gainExtraAction
5. src/hooks/useGameActions.ts          ← modifica: parametri, guard phaseActionsRemaining, blocchi fase
6. src/App.tsx                          ← modifica: passa currentPhase/dayType/phaseActionsRemaining a useGameActions;
                                                     mostra SchoolMorningPanel quando dayType=feriale && phase=mattina && isSchoolPeriod
7. src/components/SchoolMorningPanel    ← CREA (nuovo componente React)
```

> **Regola:** applicare in quest'ordine perché ogni step dipende dal precedente. Non iniziare il punto 5 prima che il punto 2 sia compilato correttamente (TypeScript segnalerà errori di tipo come guida).
