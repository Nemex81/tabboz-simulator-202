# PIANO IMPLEMENTATIVO — TASK-A · TASK-B · TASK-C

> **Data redazione**: 09 Aprile 2026
> **Autore**: Luca Profita (orchestrazione) + Perplexity AI (strategia)
> **Ordine di esecuzione**: TASK-A → TASK-B → TASK-C (sequenziale, difficoltà crescente)
> **Punti sorgente**: 7 richieste di miglioramento concordate il 09/04/2026

---

## Mappa dei 7 punti originali → task

| Punto | Descrizione | Task |
|---|---|---|
| 1 | Visualizzare giorno della settimana accanto alla data | TASK-A / A1 |
| 2 | Fix probabilità nuovo amico (non capita mai) | TASK-C / C3 |
| 3 | Bug azioni extra non vengono mai consumate | TASK-A / A2 |
| 4 | Uniformare costi servizi alle costanti centralizzate | TASK-A / A3 |
| 5 | Job system: 6 tipi di lavoro con fasce orarie | TASK-B |
| 6 | BaseCharacter: modello base per tutti i personaggi | TASK-C / C1 |
| 7 | Pool interazioni separato dalle azioni normali | TASK-C / C2 |

---

# TASK-A — Fix e cosmesi ⭐

> **Difficoltà**: Bassa — modifiche chirurgiche a file esistenti, zero nuove architetture.
> **Prerequisiti**: nessuno.
> **Validazione**: `npx tsc --noEmit` → 0 errori dopo ogni sotto-task.

---

## A1 — Visualizzare il giorno della settimana accanto alla data

### Contesto
`GameDate { day, month, year }` è definito in `src/lib/types.ts`.
`src/lib/time-utils.ts` contiene già funzioni di formattazione data.
La data corrente viene renderizzata in un componente/pannello nell'UI
(cercare dove viene visualizzata la stringa della data).

### Strategia
1. Aggiungere in `src/lib/time-utils.ts` una funzione helper pura:

```typescript
export function getDayOfWeekLabel(date: GameDate): string {
  const d = new Date(date.year, date.month - 1, date.day)
  const label = d.toLocaleDateString('it-IT', { weekday: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
```

2. Trovare il punto di rendering della data nell'UI (cerca la stringa
   della data nel JSX). Affiancare il risultato di `getDayOfWeekLabel`
   alla data già visualizzata.

   **Formato atteso in UI**: `Lunedì 15 Settembre 2026`
   oppure `Lunedì — 15/09/2026`
   (scegliere il formato più coerente con lo stile visivo esistente).

### File da toccare
- `src/lib/time-utils.ts` → aggiungere helper `getDayOfWeekLabel`
- 1 file UI che renderizza la data (da identificare con ricerca)

### Checklist A1
- [ ] `getDayOfWeekLabel` esportata da `time-utils.ts`
- [ ] Giorno della settimana visibile nell'UI accanto alla data
- [ ] Formato in italiano, prima lettera maiuscola

---

## A2 — Bug: le azioni extra non vengono mai consumate

### Contesto
In `src/lib/types.ts` l'interfaccia `GameTime` ha:
```typescript
actionsRemaining: number   // azioni normali della fase corrente
extraActions: number       // azioni extra guadagnate da eventi
```
`DEFAULT_GAME_STATE` inizializza `extraActions: 0`.
La funzione `gainExtraAction()` esiste ed è passata come param in
`UseGameActionsParams` (`src/hooks/types.ts`).

**Bug**: quando `actionsRemaining` arriva a 0, `extraActions` non viene
mai scalato — le azioni extra sono di fatto inutilizzabili.

### Strategia
1. Trovare in `src/hooks/useGameTime.ts` (o equivalente) la funzione
   `consumeAction()`.

2. Verificare la logica attuale. Probabilmente è:
```typescript
if (actionsRemaining > 0) setActionsRemaining(prev => prev - 1)
```

3. Correggere in:
```typescript
if (actionsRemaining > 0) {
  setActionsRemaining(prev => prev - 1)
} else if (extraActions > 0) {
  setExtraActions(prev => prev - 1)
}
```

4. Correggere il check `canAct` (o `phaseActionsRemaining > 0`):
   → diventa `actionsRemaining + extraActions > 0`.

5. Verificare che i pulsanti azione nell'UI non vengano disabilitati
   quando `actionsRemaining === 0` ma `extraActions > 0`.

### File da toccare
- `src/hooks/useGameTime.ts` — funzione `consumeAction` + check `canAct`
- Eventuale componente UI che disabilita i pulsanti azione

### Checklist A2
- [ ] `consumeAction` scala `extraActions` quando `actionsRemaining === 0`
- [ ] `canAct` controlla `actionsRemaining + extraActions > 0`
- [ ] Pulsanti UI abilitati quando `extraActions > 0`

---

## A3 — Uniformare i costi dei servizi alle costanti centralizzate

### Contesto
`src/lib/game-balance.constants.ts` contiene `ECONOMY.*` — i valori
**canonici e corretti** per tutti i costi. Il bug segnalato: alcuni handler
di azione usano numeri hardcodati inline invece delle costanti, causando
discrepanze tra costo descritto nell'UI e costo effettivamente scalato.
**Esempio confermato**: cinema descritto 15€, scala 40€.

### Strategia
1. Fare grep su `src/` per costi monetari hardcodati nei file handler
   (pattern: `soldi.*- \d+` o valori letterali `40`, `30`, `15`
   nei file `useEconomyActions.ts`, `useLifestyleActions.ts`,
   `phase-actions.ts`).

2. Per ogni costo hardcodato trovato:
   - Se la costante esiste in `game-balance.constants.ts` → sostituire
     il valore con `ECONOMY.NOME_COSTANTE`.
   - Se la costante non esiste → aggiungerla PRIMA di referenziarla.

3. Servizi da verificare obbligatoriamente:
   cinema, discoteca, palestra, shopping, motorino.

4. **NON modificare** i valori delle costanti esistenti —
   solo garantire che gli handler le usino.

### File da toccare
- `src/lib/game-balance.constants.ts` — solo per costanti mancanti
- `src/hooks/useEconomyActions.ts`
- `src/hooks/useLifestyleActions.ts` (se esiste)
- `src/lib/phase-actions.ts`

### Checklist A3
- [ ] Zero costi hardcodati nei file handler
- [ ] Tutti i costi usano `ECONOMY.*`
- [ ] Nessun valore di costante esistente modificato

---

## Output atteso TASK-A
- [ ] A1 completo
- [ ] A2 completo
- [ ] A3 completo
- [ ] `npx tsc --noEmit` → 0 errori
- [ ] `docs/TODO.md` aggiornato con TASK-A completato

---

# TASK-B — Job System ⭐⭐

> **Difficoltà**: Media — nuovo file `job-system.ts` + dialog UI.
> **Prerequisiti**: TASK-A completato (consigliato ma non strettamente necessario).
> **Validazione**: `npx tsc --noEmit` → 0 errori.

---

## Contesto
Attualmente `src/lib/phase-actions.ts` ha una singola entry generica `lavoro`
con prerequisito `minSchoolYear: 3`, senza tipo specifico né fascia oraria.
L'obiettivo è creare un sistema di lavori multipli, selezionabili dal
giocatore, ognuno con fascia oraria dedicata e prerequisiti bilanciati.

---

## B1 — Nuovo file `src/lib/job-system.ts`

Definire:

```typescript
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
  description: string             // descrizione narrativa breve (1 riga)
  payPerShift: number             // € guadagnati per turno
  allowedPhases: DayPhase[]       // fasi orarie disponibili
  allowedDayTypes: DayType[]      // tipi di giorno disponibili
  minSchoolYear: number           // anno scolastico minimo
  minStats: Partial<GameStats>    // requisiti minimi sulle statistiche
  statEffects: Partial<GameStats> // effetti per turno lavorato (+ o -)
  icon?: string                   // emoji per UI
}

export const JOBS: Record<JobId, JobDefinition>
```

## B2 — Definizioni dei 6 lavori

| JobId | Fasce orarie | Giorni | Paga | Requisiti minimi | Effetti per turno |
|---|---|---|---|---|---|
| `buttafuori` | sera, notte | feriale, sabato, festivo | 50€ | muscoli ≥ 70, anno ≥ 3 | muscoli +1, stress +5, reputazione +2 |
| `cameriere` | pomeriggio, sera | feriale, sabato | 25€ | carisma ≥ 40, anno ≥ 2 | carisma +1, stanchezza +10, stress +3 |
| `rider` | pomeriggio | feriale, sabato | 20€ | hasMotorino = true, anno ≥ 2 | stanchezza +8, morale +2, soldi +20 |
| `fattorino` | mattina, pomeriggio | feriale | 18€ | anno ≥ 2 | stanchezza +10, stress +2 |
| `dogsitter` | mattina, pomeriggio | feriale, sabato, domenica | 15€ | anno ≥ 1 | morale +5, stanchezza +5 |
| `volantinaggio` | mattina | feriale | 12€ | anno ≥ 1 | stanchezza +6, morale +1 |

**Nota per `rider`**: il requisito `hasMotorino` si traduce in un flag
`boolean`. Verificare se esiste già nello stato del giocatore (es. una
proprietà dell'inventario o degli oggetti posseduti). Se non esiste,
aggiungere `hasMotorino: boolean` nello stato e valorizzarla `false`
di default. Il motorino si ottiene tramite acquisto in gioco.

## B3 — Aggiornamento `src/lib/phase-actions.ts`

L'entry `lavoro` esistente diventa un **gateway**:
- Mantenere l'entry con gli stessi prerequisiti base (anno ≥ 2)
- Quando il giocatore la seleziona, invece di eseguire l'azione
  direttamente, apre `JobSelectionDialog`
- Il dialog mostra solo i lavori disponibili nella fase e nel giorno
  correnti, e solo quelli per cui si hanno i prerequisiti

## B4 — Nuovo componente `src/components/JobSelectionDialog.tsx`

Dialog React che:
- Riceve `availableJobs: JobDefinition[]` come prop
- Mostra ogni lavoro con: nome, paga/turno, fascia oraria, descrizione
- I lavori per cui mancano i prerequisiti sono visibili ma disabilitati
  con motivazione specifica (es. `"Richiede muscoli 70 — tuoi: 45"`)
- Alla selezione, chiama `onSelectJob(jobId: JobId)`
- Bottone "Annulla" per chiudere senza azione

## B5 — Handler `handleLavoro(jobId: JobId)`

Aggiungere in `src/hooks/useEconomyActions.ts`:
- Verifica prerequisiti del job selezionato (river ifica di sicurezza)
- Applica `statEffects` del job al personaggio
- Aggiunge `payPerShift` ai soldi
- Chiama `consumeAction()` + `announce()` + `addLogEntry()`

## B6 — Wiring in `App.tsx`

Passare `onOpenJobSelection` callback a `useGameActions` seguendo
esattamente il pattern usato per `onOpenStreetRace` in STEP 13.5
(catena `App.tsx → useGameActions → useEconomyActions`).

---

## Output atteso TASK-B
- [ ] `src/lib/job-system.ts` con `JOBS` e `JobDefinition` completi
- [ ] 6 lavori definiti con fasce orarie, requisiti ed effetti
- [ ] `src/components/JobSelectionDialog.tsx` funzionante
- [ ] `phase-actions.ts` entry `lavoro` → apre il dialog
- [ ] Handler `handleLavoro` applica effetti e paga
- [ ] `npx tsc --noEmit` → 0 errori
- [ ] `docs/TODO.md` aggiornato con TASK-B completato

---

# TASK-C — BaseCharacter · pool interazioni · fix amico ⭐⭐⭐

> **Difficoltà**: Alta — refactor `types.ts` + nuova logica di stato + fix probabilità.
> **Prerequisiti**: TASK-A e TASK-B completati.
> **Validazione**: `npx tsc --noEmit` → 0 errori.
> **Test manuale**: un nuovo amico deve poter comparire dopo qualche
>   attività sociale nella sessione di gioco normale.

---

## C1 — BaseCharacter: modello base condiviso per tutti i personaggi

### Contesto
Attualmente `Friend`, `Teacher`, `Classmate`, `PlayerProfile` sono
interfacce parallele con campi ridondanti ma senza genitore comune.
Vedi `src/lib/types.ts` per le definizioni attuali complete:
- `Friend` ha `intelligenza`, `originType`, `metAt`
- `Teacher` ha `relazione`, `gender`, `name`, `id`
- `Classmate` ha `intelligenza`, `relation`, `name`, `id`
- `PlayerProfile` ha `name`, `gender`

### Strategia

Aggiungere in `src/lib/types.ts` **prima** di `Friend`:

```typescript
/**
 * BaseCharacter — modello base condiviso da tutti i personaggi del gioco.
 * Friend, Teacher, Classmate e PlayerProfile estendono questa interfaccia.
 */
export interface BaseCharacter {
  id: string
  name: string
  gender: 'M' | 'F'
  age?: number
  // Attributi sociali base (scala 0–100)
  carisma: number
  intelligenza: number
  // Relazione col giocatore (scala 0–100, 50 = neutro)
  relazione: number
  // Metadata di incontro
  originType?: 'compagno_classe' | 'compagno_istituto' | 'extrascolastico' | 'player'
  metAt?: string
  // Pool interazioni NPC (preparazione futura simulazione NPC-to-NPC)
  interazioniPerFase?: number  // default 3 se non specificato
}
```

Aggiornare le interfacce esistenti (estensione non-distruttiva):
- `Friend extends BaseCharacter` — rimuovere da `Friend` i campi già
  in `BaseCharacter` (`intelligenza`, `originType`, `metAt`). Aggiungere
  i campi `carisma` e `relazione` mancanti alle factory di generazione.
- `Teacher extends BaseCharacter` — aggiungere `extends BaseCharacter`;
  il campo `relazione` esiste già → OK. Mappare `gender` già presente.
- `Classmate extends BaseCharacter` — aggiungere `extends BaseCharacter`;
  rinominare `relation → relazione` per coerenza con la base.
- `PlayerProfile` — aggiungere `extends BaseCharacter` con
  `originType: 'player'`. Il campo `gender` in `PlayerProfile` è
  `'maschio' | 'femmina'` mentre in `BaseCharacter` è `'M' | 'F'`:
  **risolvere il conflitto** scegliendo un unico formato
  (raccomandato: `'M' | 'F'` per brevità, aggiornare dove necessario)
  oppure mantenere entrambi con un campo separato in `PlayerProfile`.

**ATTENZIONE**: tutti i costruttori/factory che creano oggetti di questi
tipi (`generateExtraFriend`, `generateSchoolFriend`, teacher factory,
classmate factory) devono essere aggiornati per includere i nuovi campi
base obbligatori. Verificare tutti i file che importano questi tipi.

---

## C2 — Pool interazioni separato dalle azioni normali

### Contesto
Attualmente le interazioni sociali (chiacchierare, telefonare, interagire
con amici) consumano le stesse azioni delle attività produttive (studiare,
palestra). Il risultato è che il giocatore deve scegliere tra vita sociale
e progressione delle stats, rendendo le interazioni punitive.

### Strategia

#### 2a. Aggiungere `interazioniRimaste` a `GameTime` in `src/lib/types.ts`
```typescript
export interface GameTime {
  // ... campi esistenti INVARIATI ...
  interazioniRimaste: number   // reset a maxInterazioni ad ogni cambio fase
  maxInterazioni: number       // default 3; scala con carisma al reset
}
```

`DEFAULT_GAME_STATE.gameTime` aggiornato:
```typescript
interazioniRimaste: 3,
maxInterazioni: 3,
```

#### 2b. Aggiungere in `src/hooks/useGameTime.ts`
```typescript
consumeInterazione(): void
// Scala interazioniRimaste se > 0
// Se 0: no-op + announce('Non hai più interazioni disponibili in questa fase.')

canInteract: boolean  // = interazioniRimaste > 0
```

#### 2c. Reset al cambio fase
Dove avviene il reset delle azioni per la fase successiva, aggiungere:
```typescript
const newMaxInterazioni = Math.min(5, 3 + Math.floor(carisma / 40))
// carisma 0–39  → 3 interazioni
// carisma 40–79 → 4 interazioni
// carisma 80+   → 5 interazioni
newGameTime.interazioniRimaste = newMaxInterazioni
newGameTime.maxInterazioni = newMaxInterazioni
```

#### 2d. Aggiornare le azioni sociali in `src/hooks/useSocialActions.ts`

Usare `consumeInterazione()` invece di `consumeAction()` per:
- `handleChiacchiera` — conversazione diretta con un personaggio
- `handleTelefona` — telefonata a un amico
- `handleIncontroAmico` — incontro con amico specifico
- Tutte le interazioni dirette NPC-to-giocatore avviate dal giocatore

Usare `consumeAction()` (invariato) per:
- `handleParco` — azione che include spostamento fisico
- `handleCinema` — attività che include costo e spostamento
- In generale: azioni che combinano movimento + socialità

#### 2e. Esporre `interazioniRimaste` e `canInteract` nell'UI
Aggiungere un indicatore visivo nell'UI accanto alle azioni normali,
mostrando le interazioni rimaste nella fase corrente
(es. icona dialogo + numero: `💬 3`).

---

## C3 — Fix probabilità: nuovo amico non compare mai

### Contesto
`src/lib/enhanced-friend-system.ts` ha `generateExtraFriend` e
`generateSchoolFriend`. La funzione `checkForNewFriend(location: string)`
è passata come param in `UseGameActionsParams` (`src/hooks/types.ts`).

### Diagnosi da eseguire
Leggere `src/hooks/useEventEngine.ts` e `src/hooks/useSocialActions.ts`
per verificare:

a) La probabilità base è < 5% (troppo bassa)?
b) Ci sono condizioni prerequisito troppo restrittive?
   (es. carisma > 60 quando il giocatore parte da 10)
c) La funzione viene chiamata ma non ha effetto (bug logico)?
d) La funzione non viene mai chiamata nei percorsi normali di gioco?

### Correzioni da applicare

1. **Probabilità**: portare la probabilità base per incontro amico
   durante attività sociale (parco, chiacchiera, cinema, palestra)
   a **15%**. Probabilità trigger automatico giornaliero (se esiste
   in `useEventEngine`): **5%**.

2. **Soglie di carisma**: se esistono soglie prerequisito `carisma > X`,
   abbassarle o rimuoverle per le attività delle fasi base.
   Il giocatore parte con `carisma: 10` — non può esistere un prerequisito
   superiore a 10 per gli incontri di base.

3. **Call site mancanti**: se `checkForNewFriend` non viene chiamata
   nei seguenti handler, aggiungerla:
   - `handleParco` → `checkForNewFriend('parco')`
   - `handleChiacchiera` → `checkForNewFriend('strada')`
   - `handleCinema` → `checkForNewFriend('cinema')`
   - `handlePalestra` (se esiste) → `checkForNewFriend('palestra')`

4. **NON aumentare eccessivamente** la probabilità: 15% per sessione
   è già alto. L'obiettivo è che dopo 5–10 attività sociali l'evento
   capiti almeno una volta, non che capiti ad ogni azione.

### File da toccare
- `src/lib/enhanced-friend-system.ts` — eventuale fix logico
- `src/hooks/useEventEngine.ts` — probabilità trigger automatico
- `src/hooks/useSocialActions.ts` — call site + probabilità

---

## Output atteso TASK-C
- [ ] C1: `BaseCharacter` definita in `types.ts`; `Friend`, `Teacher`,
       `Classmate` estendono `BaseCharacter`; factory aggiornate
- [ ] C2: `GameTime` ha `interazioniRimaste` + `maxInterazioni`;
       `consumeInterazione()` e `canInteract` in `useGameTime.ts`;
       reset al cambio fase; azioni sociali usano `consumeInterazione`;
       indicatore visivo nell'UI
- [ ] C3: probabilità nuovo amico 15% nelle attività sociali;
       soglie carisma compatibili con valore di partenza (10);
       `checkForNewFriend` chiamata nei handler principali
- [ ] `npx tsc --noEmit` → 0 errori
- [ ] `docs/TODO.md` aggiornato con TASK-C completato

---

## Note generali per tutti i task

- **Pattern wiring**: seguire sempre il pattern `App.tsx → useGameActions →
  useEconomyActions` con callback opzionale `?:` già usato per `onOpenStreetRace`.
- **No breaking changes**: tutte le modifiche di interfaccia usano
  campi opzionali `?:` dove possibile, per non rompere i costruttori
  esistenti prima che vengano aggiornati.
- **Aggiornamento docs**: ogni task completa con aggiornamento di
  `docs/TODO.md` marcando il task come `[x]`.
- **Build gate**: `npx tsc --noEmit` è il gate obbligatorio alla fine
  di ogni task. Zero errori = task superato.
