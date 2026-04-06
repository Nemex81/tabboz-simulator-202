# Piano di Implementazione — Tabboz Simulator 2026

> Documento generato il 03/04/2026  
> Basato su analisi diretta del codice sorgente del repository.

---

## Indice

1. [Stato Attuale e Problemi Chiave](#1-stato-attuale-e-problemi-chiave)
2. [Ottimizzazioni Prioritarie](#2-ottimizzazioni-prioritarie)
3. [Sistema Fasce Orarie — Progettazione Logica](#3-sistema-fasce-orarie--progettazione-logica)
4. [Roadmap Operativa](#4-roadmap-operativa)
5. [Note di Bilanciamento Gameplay](#5-note-di-bilanciamento-gameplay)

---

## 1. Stato Attuale e Problemi Chiave

### 1.1 Sistema Temporale Binario

Il file `src/lib/time-utils.ts` gestisce il tempo in modo **binario**: o è periodo scolastico (`isSchoolPeriod`) o non lo è. Le azioni giornaliere sono un semplice contatore `actionsRemaining` (default: 3) che si azzera ad ogni `advanceDay()`. Non esiste nessuna distinzione tra mattina, pomeriggio, sera e notte. La funzione `isSaturday()` esiste solo per triggerare la paghetta — non struttura la giornata in modo diverso.

**Conseguenza diretta**: eventi scolastici come interrogazioni e compiti in classe possono tecnicamente accadere di domenica sera o in estate, perché in `school-events.ts` non c'è nessun filtro temporale applicato prima della generazione dell'evento.

### 1.2 Doppio Modello Amici (Legacy + Enhanced)

Coesistono due sistemi incompatibili:

| File | Tipo usato | Campo legame |
|---|---|---|
| `src/lib/social-system.ts` | `Friend` (da `types.ts`) | `legameLevel: number` |
| `src/lib/enhanced-friend-system.ts` | `EnhancedFriend` (locale) | `affinita: number` |

Sono la stessa entità con nomi e campi diversi. Questo causa incoerenze nel calcolo dei bonus (es. `getFriendStudyBonus` in `social-system.ts` usa `legameLevel`, mentre `FRIEND_ACTIONS` usa `affinita`).

### 1.3 App.tsx Monolitico

Tutta la logica di gioco, gestione eventi, wiring UI e persistenza sono concentrate in `src/App.tsx`. Non esistono custom hook dedicati. Questo rende difficile testare le singole meccaniche e aumenta il rischio di regressioni ad ogni modifica.

### 1.4 Bug di Bilanciamento: calculateExamGrade

In `src/lib/exam-system.ts`, la formula per un esame `brutale` con preparazione e intelligenza = 50:

```
gradeChange = 2 * (1 + 50/100) * 0.35 = 2 * 1.5 * 0.35 = 1.05
diffPenalty = -1.0
risultato netto = +0.05
```

Prepararsi per un esame brutale aumenta il voto di soli 0.05 punti. Il moltiplicatore `brutale` (0.35) è troppo punitivo combinato con la `diffPenalty` di -1.0.

### 1.5 Soldi Negativi

In `src/lib/enhanced-friend-system.ts`, la funzione `applyFriendActionEffects` sottrae i soldi direttamente (`stats.soldi - 10`) senza una guardia centralizzata, nonostante `FRIEND_ACTIONS` abbia già i `requirements` con controllo soldi. Se il controllo in `App.tsx` è assente o incompleto, il saldo può diventare negativo.

### 1.6 Randomizzazione Non Deterministica

Tutto il codice usa `Math.random()` direttamente. Questo rende impossibile riprodurre una partita per il debug e costruire test affidabili sulle meccaniche di gioco.

---

## 2. Ottimizzazioni Prioritarie

Ordine di esecuzione consigliato prima di aggiungere nuove funzionalità.

### - [x] Priorità 1 — Guardia Centralizzata per i Soldi

**File coinvolti**: `src/lib/game-utils.ts`, `src/lib/enhanced-friend-system.ts`, `src/App.tsx`

Aggiungere in `game-utils.ts` una funzione `spendMoney()`:

```typescript
export const spendMoney = (
  currentSoldi: number,
  amount: number,
  actionName: string
): { success: boolean; newSoldi: number; errorMessage?: string } => {
  if (amount < 0) {
    return { success: false, newSoldi: currentSoldi, errorMessage: 'Importo non valido' }
  }
  if (currentSoldi < amount) {
    return {
      success: false,
      newSoldi: currentSoldi,
      errorMessage: `Non hai abbastanza soldi per "${actionName}". Servono ${amount}€, hai ${currentSoldi}€.`
    }
  }
  return { success: true, newSoldi: currentSoldi - amount }
}
```

Tutti i punti del codice che sottraggono soldi devono passare per questa funzione. I pulsanti in JSX devono avere `disabled={stats.soldi < COSTO}` con `aria-label` descrittivo.

### - [x] Priorità 2 — Consolidare il Modello Friend

**File coinvolti**: `src/lib/types.ts`, `src/lib/social-system.ts`, `src/lib/enhanced-friend-system.ts`

Unificare in un unico tipo `Friend` in `types.ts`:

```typescript
export type FriendType = 'coatto' | 'secchione' | 'sportivo' | 'ribelle' | 'generico'

export interface Friend {
  id: string
  name: string
  type: FriendType
  affinita: number          // ex-legameLevel, range 0-100
  intelligenza?: number
  unlocked: boolean
}
```

Rimuovere `EnhancedFriend` da `enhanced-friend-system.ts` e aggiornare tutti i riferimenti.

### - [x] Priorità 3 — Fix Bilanciamento calculateExamGrade

**File coinvolti**: `src/lib/exam-system.ts`

```typescript
// PRIMA
const DIFFICULTY_MULTIPLIERS = {
  facile: 1.5, normale: 1.0, difficile: 0.6, brutale: 0.35
}
const diffPenalty = { facile: 0.5, normale: 0, difficile: -0.5, brutale: -1.0 }

// DOPO (valori corretti)
const DIFFICULTY_MULTIPLIERS = {
  facile: 1.5, normale: 1.0, difficile: 0.7, brutale: 0.5
}
const diffPenalty = { facile: 0.3, normale: 0, difficile: -0.3, brutale: -0.5 }
```

Con intelligenza=50 e preparazione, un esame brutale darà ora:
`2 * 1.5 * 0.5 - 0.5 = 1.0` → guadagno reale e sensato.

### - [x] Priorità 4 — Refactor App.tsx in Custom Hook

**File da creare**:
- `src/hooks/useGameTime.ts` — gestione tempo e fasce orarie
- `src/hooks/useGameActions.ts` — esecuzione e validazione azioni
- `src/hooks/useEventEngine.ts` — generazione e risoluzione eventi
- `src/hooks/useGameStats.ts` — stato statistiche e reputazione

`App.tsx` diventa un orchestratore che monta i hook e passa le prop ai componenti. Non contiene logica di dominio.

### - [x] Priorità 5 — Seed Random

**File coinvolti**: `src/lib/game-utils.ts`, `src/lib/types.ts`

Aggiungere `seed: number` a `GameState`. Implementare un generatore LCG (Linear Congruential Generator):

```typescript
let _seed = 0

export const initRandom = (seed: number) => { _seed = seed }

export const seededRandom = (): number => {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return (_seed >>> 0) / 0xffffffff
}

export const randomChance = (percentage: number): boolean => {
  return seededRandom() * 100 < percentage
}
```

Il seed viene generato una volta alla creazione della partita (`Date.now()`) e salvato nello storage. Ogni partita è ora riproducibile.

### - [ ] Priorità 6 — Memoizzazione Componenti

**File coinvolti**: `src/components/` (pannelli statistiche, dialog stabili)

Wrappare i componenti puramente presentazionali con `React.memo`. Avvolgere `calculateReputationFromStats` in `useMemo` nell'hook `useGameStats`. Caricare i dialog meno frequenti con `React.lazy` + `Suspense`.

---

## 3. Sistema Fasce Orarie — Progettazione Logica

### 3.1 Nuovi Tipi (Layer 1)

**File da modificare**: `src/lib/types.ts`

```typescript
export type DayPhase = 'mattina' | 'pomeriggio' | 'sera' | 'notte'

export type DayType = 'feriale' | 'sabato' | 'domenica' | 'festivo'

export interface DayPhaseConfig {
  phase: DayPhase
  label: string        // es. "Mattina ☀️"
  timeRange: string    // es. "07:00 - 13:00"
  maxActions: number
  energyCost: number   // stanchezza base per ogni azione in questa fascia
  recoveryBonus: number // recupero stanchezza durante la notte (solo fase 'notte')
}

// Estensione di GameTime (non sostituzione, per compatibilità)
export interface GameTimeV2 extends GameTime {
  currentPhase: DayPhase
  dayType: DayType
  phaseActionsRemaining: number
}
```

`DayPhaseConfig` è una tabella **statica** (non fa parte dello stato persistito). Dello stato della partita vengono salvati solo `currentPhase`, `dayType`, `phaseActionsRemaining`.

### 3.2 Configurazione Fasce (Layer 2)

**File da modificare**: `src/lib/time-utils.ts`

Tabella statica `DAY_PHASE_CONFIG` con parametri per ogni combinazione fascia/tipo-giorno:

```
FERIALE
  mattina    → 07:00–13:00 | 2 azioni | energyCost +5  | recovery 0
  pomeriggio → 13:00–18:00 | 2 azioni | energyCost +8  | recovery 0
  sera       → 18:00–23:00 | 1 azione | energyCost +10 | recovery 0
  notte      → 23:00–07:00 | 0 azioni | energyCost 0   | recovery -20

SABATO
  mattina    → 08:00–13:00 | 2 azioni | energyCost +5  | recovery 0
  pomeriggio → 13:00–19:00 | 3 azioni | energyCost +8  | recovery 0
  sera       → 19:00–24:00 | 2 azioni | energyCost +10 | recovery 0
  notte      → 00:00–08:00 | 0 azioni | energyCost 0   | recovery -25

DOMENICA
  mattina    → 09:00–13:00 | 1 azione | energyCost +5  | recovery 0
  pomeriggio → 13:00–18:00 | 2 azioni | energyCost +8  | recovery 0
  sera       → 18:00–22:00 | 1 azione | energyCost +10 | recovery 0
  notte      → 22:00–09:00 | 0 azioni | energyCost 0   | recovery -30
```

**Nota sulla notte**: non ha azioni giocabili. È la fase di recupero obbligatorio. Se il giocatore è esausto (stanchezza > 80) e non raggiunge la notte, subisce una penalità ai voti la mattina successiva.

### 3.3 Classificazione del Giorno (Layer 3)

**Funzione da aggiungere in** `src/lib/time-utils.ts`:

```typescript
export const getDayType = (date: GameDate): DayType => {
  const jsDate = new Date(date.year, date.month - 1, date.day)
  const dow = jsDate.getDay() // 0=Dom, 6=Sab

  // Festività italiane fisse
  const festivita = [
    `${date.year}-01-01`, // Capodanno
    `${date.year}-01-06`, // Epifania
    `${date.year}-04-25`, // Liberazione
    `${date.year}-05-01`, // Festa del Lavoro
    `${date.year}-06-02`, // Repubblica
    `${date.year}-08-15`, // Ferragosto
    `${date.year}-11-01`, // Ognissanti
    `${date.year}-12-08`, // Immacolata
    `${date.year}-12-25`, // Natale
    `${date.year}-12-26`, // Santo Stefano
  ]
  const key = `${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`

  if (festivita.includes(key)) return 'festivo'
  if (dow === 0) return 'domenica'
  if (dow === 6) return 'sabato'
  return 'feriale'
}
```

> **TODO futuro**: aggiungere il calcolo della Pasqua mobile (algoritmo di Gauss).

### 3.4 Avanzamento per Fase (Layer 4)

Sostituire il flusso `advanceDay → reset azioni` con `advancePhase`:

```
Sequenza fasi in un giorno:
  mattina → pomeriggio → sera → notte → [advanceDay] → mattina del giorno dopo

advancePhase(gameTime: GameTimeV2): GameTimeV2:
  1. Calcola la fase successiva nella sequenza
  2. Se la fase successiva è 'mattina':
     a. Chiama advanceDay() per avanzare la data
     b. Applica il recovery della notte (riduce stanchezza)
     c. Calcola getDayType() per il nuovo giorno
     d. Controlla se c'è un esame programmato (scheduledExams[].daysUntil--)
  3. Resetta phaseActionsRemaining dal DAY_PHASE_CONFIG
  4. Restituisce il nuovo stato
```

### 3.5 Vincoli per Evento (Layer 5)

**File da modificare**: `src/lib/school-events.ts` e tutti i file che generano eventi.

Aggiungere l'interfaccia `EventConstraint` in `types.ts`:

```typescript
export interface EventConstraint {
  allowedPhases: DayPhase[]
  allowedDayTypes: DayType[]
  requiresSchoolPeriod?: boolean
  minSchoolYear?: number       // es. lavoro part-time solo dal 3° anno
  blockedWhenExhausted?: boolean // stanchezza > 80 blocca certi eventi
}
```

Ogni categoria di evento riceve i suoi vincoli:

| Categoria Evento | Fasi Consentite | Tipi Giorno | Note |
|---|---|---|---|
| Interrogazione / Compito | `mattina` | `feriale` | `requiresSchoolPeriod: true` |
| Studio con amico secchione | `pomeriggio` | `feriale` | `requiresSchoolPeriod: true` |
| Lavoro part-time | `pomeriggio` | `feriale`, `sabato` | `minSchoolYear: 3` |
| Uscita con amici | `sera` | `feriale`, `sabato` | — |
| Gara di motorini | `pomeriggio`, `sera` | `sabato` | — |
| Discoteca | `sera` | `sabato` | — |
| Rissa / Metallari | `notte` | `sabato` | alto rischio |
| Gita fuori porta | `mattina`, `pomeriggio` | `sabato`, `domenica` | — |
| Pranzo di famiglia | `mattina` | `domenica` | bonus paghetta se media alta |
| Studio pre-lunedì | `pomeriggio`, `sera` | `domenica` | `requiresSchoolPeriod: true` |
| Evento genitori | `sera`, `pomeriggio` | `feriale`, `domenica` | triggerato da media bassa |

### 3.6 Pool Azioni per Fascia (Layer 6)

**Nuovo file da creare**: `src/lib/phase-actions.ts`

Mappa statica che associa a ogni `(DayPhase, DayType)` la lista di `actionId` disponibili. Questa mappa viene usata da `getAvailableActions()` nel hook `useGameActions`.

```
MATTINA FERIALE (scuola)
  - 'studia_in_classe'
  - 'interrogazione_programmata'
  - 'parla_compagno'
  - [evento casuale scolastico — roll automatico, non azione del giocatore]

POMERIGGIO FERIALE
  - 'vai_in_palestra'
  - 'studia_a_casa'
  - 'studia_con_amico'        (richiede amico di tipo 'secchione')
  - 'vai_al_bar'
  - 'lavoro_part_time'        (dal 3° anno, se sbloccato)

SERA FERIALE
  - 'guarda_tv'               (recupero stanchezza lieve)
  - 'vai_al_cinema'           (richiede tipa attiva)
  - 'esci_con_amici'
  - 'vai_a_dormire_presto'    (bonus recovery notturno +10)
  - [evento casuale notturno — probabilità bassa]

NOTTE (automatica)
  - 'dormi'                   (automatica, nessuna scelta)
  - 'resta_sveglio'           (opzionale: +8 int per studio, +20 stanchezza)

MATTINA SABATO
  - 'dormi_fino_a_tardi'      (recupera stanchezza)
  - 'vai_al_mercato'
  - 'allenamento_sportivo'
  - [evento casuale weekend mattina]

POMERIGGIO SABATO
  - 'partita_di_calcio'
  - 'shopping_in_centro'
  - 'giro_motorino'
  - 'vai_da_tipa'

SERA SABATO  ← fascia più ricca di eventi
  - 'discoteca'               (costo alto, rischio polizia, alto coattaggine)
  - 'pizzeria_con_gang'
  - 'serata_a_casa_di_qualcuno'
  - 'gara_di_motorini'
  - [evento raro: rissa, metallari — probabilità ~15%]

DOMENICA MATTINA
  - 'dormi_fino_a_tardissimo' (recupero massimo)
  - 'pranzo_di_famiglia'      (paghetta extra se media >= 7)

DOMENICA POMERIGGIO
  - 'studia_per_la_settimana'
  - 'sport_domenicale'

DOMENICA SERA (evento fisso narrativo)
  - 'ansia_del_lunedi'        → vedi Layer 7
```

### 3.7 Evento Speciale: "Domenica Sera — Ansia del Lunedì" (Layer 7)

Evento narrativo **fisso** che si trigga ogni domenica sera durante il periodo scolastico. Non è opzionale — appare sempre come notifica prima di procedere alla notte.

```
media >= 7.0
  → "Sei a posto, lunedì si spacca! 💪"
  → Effetti: +5 carisma. Nessuna penalità.

media 5.0–6.9
  → "Hmm, qualche materia fa un po' schifo..."
  → Scelta giocatore:
    [Studia ancora un po'] → +0.2 media casuale, +15 stanchezza
    [Lascia perdere]       → nessun effetto

media < 5.0
  → "PANICO TOTALE! Sei a rischio bocciatura! 😱"
  → Stanchezza +10 automatica (ansia notturna)
  → Scelta forzata:
    [Studia ADESSO]        → +0.4 media casuale, +25 stanchezza
    [Crolla dal sonno]     → -0.1 media, recupero stanchezza normale
```

### 3.8 Modifiche Minime ad App.tsx (Layer 8)

Il principio è **non riscrivere** App.tsx ma aggiungere tre variabili di stato e due handler:

**Stato aggiuntivo** (da aggiungere a fianco dello stato esistente):
```typescript
const [currentPhase, setCurrentPhase] = useState<DayPhase>('mattina')
const [dayType, setDayType] = useState<DayType>('feriale')
const [phaseActionsRemaining, setPhaseActionsRemaining] = useState<number>(2)
```

**Handler da modificare**:
- `handleAdvanceTime()` → delega a `advancePhase()` invece di `advanceDay()`
- Aggiungere `getAvailableActions()` che filtra le azioni per `currentPhase` + `dayType` + `isSchoolPeriod`
- Aggiungere `getAvailableRandomEvents()` che filtra l'event pool per la fase corrente prima del roll

---

## 4. Roadmap Operativa

### Fase A — Stabilizzazione (da fare prima di tutto)

| Stato | # | Intervento | File | Priorità |
|---|---|---|---|---|
| - [x] | A1 | Guardia centralizzata `spendMoney()` | `game-utils.ts`, `enhanced-friend-system.ts`, `App.tsx` | 🔴 Alta |
| - [x] | A2 | Consolidare modello `Friend` (rimuovi `EnhancedFriend`) | `types.ts`, `social-system.ts`, `enhanced-friend-system.ts` | 🔴 Alta |
| - [x] | A3 | Fix bilanciamento `calculateExamGrade` | `exam-system.ts` | 🟡 Media |
| - [x] | A4 | Refactor `App.tsx` in custom hook | `src/hooks/` (nuovi file) | 🔴 Alta |
| - [x] | A5 | Seed random con LCG | `game-utils.ts`, `types.ts` | 🟡 Media |

### Fase B — Sistema Fasce Orarie

| Stato | # | Intervento | File | Note |
|---|---|---|---|---|
| - [x] | B1 | Aggiungi tipi `DayPhase`, `DayType`, `DayPhaseConfig`, `GameTimeV2` | `types.ts` | Prerequisito di tutto |
| - [x] | B2 | Aggiungi `getDayType()` e `DAY_PHASE_CONFIG` | `time-utils.ts` | Non rompe niente di esistente |
| - [x] | B3 | Implementa `advancePhase()` | `time-utils.ts` | Sostituisce `advanceDay` nel flusso |
| - [x] | B4 | Aggiungi `EventConstraint` e vincoli agli eventi esistenti | `types.ts`, `school-events.ts` | Filtra eventi per contesto |
| - [x] | B5 | Crea `phase-actions.ts` con pool azioni per fascia | `src/lib/phase-actions.ts` | Nuovo file |
| - [x] | B6 | Integra in `App.tsx` (o hook `useGameTime`) | `App.tsx` / `useGameTime.ts` | Solo dopo A4 |
| - [x] | B7 | Evento speciale "Ansia del Lunedì" | `school-events.ts` | Dopo B4 |
| - [x] | B8 | UI: mostra fascia oraria corrente e azioni disponibili filtrate | `src/components/` | Ultimo step |

### Fase C — Ottimizzazioni Performance e UX

| Stato | # | Intervento | File | Note |
|---|---|---|---|---|
| - [x] | C1 | `React.memo` sui pannelli statistiche | `src/components/` | Dopo A4 |
| - [x] | C2 | `React.lazy` per dialog poco frequenti | `src/components/` | Dopo A4 |
| - [x] | C3 | Dashboard riassuntiva con grafici (TanStack Query + lib grafici già installate) | Nuovo componente | Ultima priorità |
| - [x] | C4 | Feedback visivi per azioni bloccate (tooltip con requisiti) | `src/components/` | Dopo B8 |

---

## 5. Note di Bilanciamento Gameplay

### Economia

Il rapporto attuale costo/beneficio di alcune azioni è sbilanciato:

- **Corruzione professore**: costo 100€, beneficio moderato. Considerare riduzione a 60-70€ o aumentare il beneficio a +1.5 voto invece di +1.
- **Minaccia**: rischio estremo vs reward. Aggiungere un calcolo che tenga conto di `muscoli` e `reputazione` per modulare il rischio.
- **Paghetta settimanale**: importo fisso non scala con l'anno scolastico. Proposta: 20€ al 1° anno → 50€ al 5° anno.

### Progressione sui 5 Anni

Difficoltà consigliata per anno scolastico:

| Anno | Moltiplicatore difficoltà esami | Probabilità eventi negativi | Note |
|---|---|---|---|
| 1° | 0.8 | 10% | Anno di ambientamento |
| 2° | 1.0 | 15% | Difficoltà base |
| 3° | 1.1 | 20% | Introduce lavoro part-time |
| 4° | 1.2 | 25% | Pressione per il diploma |
| 5° | 1.4 | 30% | + Esame di maturità finale |

### Stanchezza

La stanchezza attuale non ha un meccanismo di recupero chiaramente comunicato al giocatore. Con il sistema fasce orarie, il recupero avviene automaticamente durante la **notte** secondo il `recoveryBonus` della config. Aggiungere un indicatore visivo che mostri quando il giocatore è "esausto" (>80) con conseguenze visibili (voti -0.5 automatici il giorno dopo se si supera 90).

---

## Appendice: File da Creare / Modificare

### File Nuovi
```
src/hooks/useGameTime.ts
src/hooks/useGameActions.ts
src/hooks/useEventEngine.ts
src/hooks/useGameStats.ts
src/lib/phase-actions.ts
```

### File Modificati
```
src/lib/types.ts              ← nuovi tipi DayPhase, DayType, Friend unificato
src/lib/time-utils.ts         ← getDayType(), advancePhase(), DAY_PHASE_CONFIG
src/lib/game-utils.ts         ← spendMoney(), seededRandom(), initRandom()
src/lib/exam-system.ts        ← fix DIFFICULTY_MULTIPLIERS e diffPenalty
src/lib/enhanced-friend-system.ts ← usa tipo Friend unificato
src/lib/social-system.ts      ← usa tipo Friend unificato
src/lib/school-events.ts      ← aggiunge EventConstraint agli eventi
src/App.tsx                   ← delega logica ai hook, aggiunge stato fasce
```

---

*Fine documento — aggiornare con ogni modifica significativa all'architettura.*

---

## STEP 10 — Fix TypeScript Totale (Completato)

**Data**: completato in sessione multipla (Fase C → STEP 10)  
**Stato**: ✅ `tsc --noEmit` → **0 errori**

### Errori risolti (127 → 0)

| Categoria | File | Fix Applicato |
|---|---|---|
| Blocco A | `types.ts` | Aggiunto `ExamDifficulty`, `FriendType` (`+generico`), `EventConstraint` (`+blockedWhenExhausted`), `PlayerProfile.traits` |
| Blocco B | `game-utils.ts` | `getReputationLevel` → `{label, description}`; `getReputationEventModifier` aggiunto `default` |
| Blocco C | `data-validation.ts` | Aggiunto `stress/morale/salute` ai return; `daysUntil ?? 0` |
| Blocco D | `useHealthSystem.ts` | `dayOfMonth` → `day`; `healthRecordRef.current ?? DEFAULT_HEALTH_RECORD` |
| Blocco E | `HealthRecordPanel.tsx` | `durationDays` null check; `dayOfMonth` → `day` |
| Blocco F | 6 file componenti | `HandFist`, `PersonSimpleRun`, `TrendUp` (icon rename) |
| Blocco G | `GameDialogs.tsx` | `onClose` → `onOpenChange`; `onSelectSubject` → `onSelectTeacher`; `grades` prop aggiunto |
| Blocco H | `exam-system.ts`, `enhanced-friend-system.ts` | `default: return ''` in switch |
| Blocco I | `school-events.ts` | Aggiunto key `liceo` a `specificEvents` |
| Blocco J | `ExamsPanel.tsx` | `daysUntil ?? 2` |
| Blocco K | `useGameStats.ts` | `useKV` undefined; `getReputationLevel` → `.label` |
| Blocco L | `useGameTime.ts` | 15 errori: `dayType`, `currentPhase`, `advanceGameTime`, `setSchoolRecord`, `DEFAULT_SCHOOL_RECORD` |
| Blocco M | `App.tsx` | Hook props, callbacks, JSX props, `phaseActionsLeft` alias, `currentTheme ?? 'default'` |

### Alias `phaseActionsLeft`

In `App.tsx` è stato aggiunto:
```typescript
const phaseActionsLeft = phaseActionsRemaining ?? 0
```
Usato in tutti i `disabled={}` e `blockedReason={}` JSX per evitare TS18048 su `number | undefined`.

### Documento Test
Vedere [docs/TESTING_STEP10.md](./TESTING_STEP10.md) per la checklist di test manuale completa.

