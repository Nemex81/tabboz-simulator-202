# Piano di Implementazione Tecnica — Sistema Scolastico Avanzato

<!-- status: DRAFT -->
<!-- design-source: Documento di Progetto — Sistema Scolastico Avanzato (chat 2026-04-07) -->

---

## 0. Rapporto di Validazione

### Esito: CONVALIDA CONDIZIONALE — 8 correzioni necessarie

Il design e logicamente completo e ben strutturato. L'analisi incrociata
con il codebase esistente ha identificato 8 punti di incompatibilita
che questo piano corregge prima dell'implementazione.

### 0.1 Cosa esiste e puo essere riutilizzato

| Asset esistente | File | Note |
|---|---|---|
| `SubjectDefinition` con campo `weeklyHours?` | `src/lib/subjects.ts` | Popolato solo per italiano (4h). Va completato per tutte le materie |
| `getActiveSubjectsForYear(schoolType, year)` | `src/lib/subjects.ts` | Restituisce materie attive per tipo/anno. Base per generare orario |
| `COMMON_SUBJECTS` + `SPECIFIC_SUBJECTS` | `src/lib/subjects.ts` | Catalogo completo materie per 6 indirizzi, 5 anni |
| `Friend.originType = 'compagno_classe'` | `src/lib/types.ts` | Concetto di compagno gia presente. Va usato per il registro classe |
| `RelationStats` (4 assi) | `src/lib/relation-system.ts` | Sistema relazionale gia completo per amici. Non usabile direttamente per professori (scala diversa) |
| `SchoolRecord` con `isAtSchool`, `wentToSchoolToday` | `src/lib/types.ts` | Flag di presenza gia implementato |
| `SchoolMorningEvent` / `SchoolMorningChoice` | `src/lib/school-morning-events.ts` | Interfaccia riutilizzabile per eventi strutturati delle ore |
| `SchoolMorningPanel` | `src/components/SchoolMorningPanel.tsx` | Componente UI riutilizzabile con refactor per sequenzialita |
| `school-events.ts` (teacher/parent events) | `src/lib/school-events.ts` | Eventi scolastici. Vanno arricchiti con contesto professore |
| `useGameTime` (year transitions) | `src/hooks/useGameTime.ts` | Gestisce fine anno, pagelle, promozione. Va esteso per transizioni roster |
| `useGameRelations` (4-axis interactions) | `src/hooks/useGameRelations.ts` | Riutilizzabile per interazioni compagni intervallo |

### 0.2 Otto correzioni al design originale

**C1 — `weeklyHours` incompleto.**
Il design assume l'esistenza di ore settimanali per materia. Solo italiano
ha `weeklyHours: 4`. Correzione: popolare `weeklyHours` per tutte le
materie in `COMMON_SUBJECTS` e `SPECIFIC_SUBJECTS` prima di generare
l'orario.

**C2 — Scala relazione professore incompatibile.**
Il design propone -100/+100. Il sistema `RelationStats` esistente usa
0-100 per 4 assi indipendenti. Correzione: creare un'interfaccia
`TeacherRelation` dedicata con scala -100/+100, separata da `RelationStats`.
I professori **non** sono Friend e non usano il sistema 4-assi.

**C3 — Classe come roster strutturato vs Friend casuali.**
Il design chiede un registro-classe generato a inizio partita. Il sistema
attuale genera Friend casuali via eventi. Correzione: creare un array
dedicato `ClassRoster` in KV, separato da `friends[]`. I compagni
promossi ad amici vengono **copiati** in `friends[]` con
`originType: 'compagno_classe'`. Il roster e la fonte, friends e la
destinazione.

**C4 — Flusso mattutino sequenziale vs eventi random.**
Il design propone 6 ore bloccanti sequenziali. Il sistema attuale pesca
N eventi random da un pool. Correzione: la mattinata diventa una
**state machine** (`SchoolDayState`) con `currentHour: 0-5`,
`breakCompleted: boolean`, e un array di `HourSlot[]` pre-generati
dalla combinazione orario + professore. `SchoolMorningPanel` viene
evoluto per renderizzare uno slot alla volta con navigazione
"avanti" bloccante.

**C5 — Intervallo come slot speciale.**
Non esiste nessun concetto di pausa o azione singola intra-mattinata.
Correzione: l'intervallo e modellato come un `HourSlot` speciale
(type `'break'`) inserito tra slot 2 e 3 con un proprio set di
azioni/scelte. Non consuma le azioni di fase ma ha la sua azione dedicata.

**C6 — Transizioni annuali roster inesistenti.**
`useGameTime` gestisce fine anno (pagella, promozione) ma non ha
concetto di roster. Correzione: aggiungere logica di transizione in
un nuovo modulo `school-roster-transitions.ts` chiamato da
`useGameTime` al momento della promozione.

**C7 — KV storage plan mancante.**
Il design non specifica come persistere le nuove strutture.
Correzione: definire chiavi KV esplicite per ogni nuova entita.

**C8 — Pannello professori non progettato a livello UI.**
Il design descrive il pannello a livello logico ma non specifica
come si integra nel tab system esistente. Correzione: il pannello
professori e un **sotto-tab** del pannello scolastico, accessibile
dalla home scuola come i compagni.

---

### 0.3 Tre correzioni aggiuntive (C9, C10, C11)

Applicate prima dell'inizio del Blocco 1, a seguito di revisione del
piano. Queste non cambiano l'architettura ma precisano formule,
comportamenti e interfacce che altrimenti Copilot implementerebbe in
modo arbitrario.

**C9 — Formula relazione iniziale professore (addendum a Fase 1E).**
La formula originale `simpatia * 8 - 30` produce valori deterministici
(tutti i prof con stessa simpatia partono identici). La correzione
aggiunge un rumore gaussiano per simulare la prima impressione:

```
relazione iniziale = (simpatia * 6 - 20) + Math.round((Math.random() - 0.5) * 16)
```

Range effettivo: da -22 (simpatia=1, rumore minimo) a +48 (simpatia=10,
rumore massimo). Per simpatia=5 il range e [2, 18] — quasi sempre
leggermente positivo, ma mai certo. Il rumore viene calcolato una
sola volta alla generazione e persistito in KV: non viene mai
ricalcolato. Nota: i valori `-28` e `[-18,+18] per simpatia=5`
citati nella proposta originale sono inesatti — i valori corretti
sono quelli sopra.

**C10 — Consumo totale azioni mattutine a inizio scuola (addendum a Fase 2B).**
Il piano originale specifica che "Vai a Scuola" consuma una sola
azione. Il sistema ha `maxActions: 2` per la mattina feriale
(confermato in `DAY_PHASE_CONFIG.feriale.mattina`). Consumare una
sola azione lascia 1 azione sospesa inutilizzabile durante la
mattinata scolastica.

La correzione: al momento di premere "Vai a Scuola", vengono
consumaste TUTTE le azioni mattutine rimanenti. La mattinata
scolastica sostituisce completamente il tempo libero mattutino.
Le azioni pomeridiane (2-3 in base al giorno) rimangono intatte.

Implementazione in `useGameTime`:
```typescript
// Nuova funzione da aggiungere e restituire nell'oggetto return
const consumeAllMorningActions = useCallback(() => {
  setPhaseActionsRemaining(0)
}, [setPhaseActionsRemaining])
```

In `handleVaiAScuola` (App.tsx): sostituire `consumeAction()` con
`consumeAllMorningActions()`. Effetto collaterale positivo: il
pulsante "Pronto ad avanzare" (condizione `phaseActionsRemaining === 0`)
si sblocca immediatamente dopo aver scelto di andare a scuola,
coerentemente con il fatto che la mattina e occupata.

**C11 — `BreakContext` arricchito con `todayTeachers` e `completedSlots` (addendum a Fase 4A).**
Il `BreakContext` originale include `teachers[]` (tutti i prof) ma
non distingue chi e fisicamente presente quel giorno ne quali ore
sono gia state svolte. Questo rende impossibile implementare
correttamente l'azione "chiedi revoca voto".

L'interfaccia corretta:
```typescript
interface BreakContext {
  stats: GameStats
  teachers: Teacher[]              // tutti i professori (per lookup)
  todayTeachers: Teacher[]         // solo i prof presenti oggi (da daySchedule)
  classRoster: Classmate[]
  schoolRecord: SchoolRecord
  completedSlots: HourSlot[]       // ore gia completate (per 'chiedi revoca voto')
  selectedTarget?: string
}
```

Derivazione dei due nuovi campi:
```typescript
// todayTeachers: filtro da daySchedule (gia in SchoolDayState)
const todayTeachers = daySchedule
  .map(slot => teachers.find(t => t.id === slot.teacherId))
  .filter((t): t is Teacher => t !== undefined)

// completedSlots: slot di tipo lesson gia completati oggi
const completedSlots = schoolDayState.slots
  .filter(s => s.completed && s.type === 'lesson')
```

Entrambi derivabili da dati gia presenti — nessun nuovo KV.

---

## 1. Nuove Chiavi KV (C7)

| Chiave KV | Tipo | Default | Descrizione |
|---|---|---|---|
| `tabboz-weekly-timetable` | `WeeklyTimetable` | `null` | Orario settimanale 5x6 |
| `tabboz-class-roster` | `Classmate[]` | `[]` | Registro compagni anno corrente |
| `tabboz-teachers` | `Teacher[]` | `[]` | Corpo docente anno corrente |
| `tabboz-school-day-state` | `SchoolDayState \| null` | `null` | Stato macchina mattinata in corso |

---

## 2. Nuovi Tipi (src/lib/types.ts)

### 2.1 Orario Settimanale

```typescript
// Singola cella dell'orario: materia + professore assegnato
interface TimetableSlot {
  subjectKey: string           // chiave materia da SubjectDefinition
  teacherId: string            // id del Teacher assegnato
}

// Griglia settimanale: 5 giorni x 6 ore
type WeeklyTimetable = {
  [day in 0 | 1 | 2 | 3 | 4]: TimetableSlot[]  // 6 slot per giorno (lun-ven)
}
```

### 2.2 Compagno di Classe

```typescript
interface Classmate {
  id: string
  name: string
  type: FriendType                    // coatto | secchione | sportivo | ribelle | generico
  intelligenza: number                // 20-100
  relation: number                    // -100 a +100, parte da 0
  personality: ClassmatePersonality   // archetipo narrativo
  promotedToFriend: boolean           // true quando il giocatore lo aggiunge agli amici
  yearJoined: number                  // anno scolastico in cui e entrato nella classe
}

type ClassmatePersonality =
  | 'secchione' | 'bullo' | 'simpatico' | 'silenzioso'
  | 'sportivo' | 'ribelle' | 'nerd' | 'popolare'
  | 'timido' | 'leader'
```

### 2.3 Professore

```typescript
interface Teacher {
  id: string
  name: string
  subjectKey: string              // materia insegnata
  gender: 'M' | 'F'

  // Attributi (1-10)
  severita: number
  simpatia: number
  corruttibilita: number
  resistenzaMinacce: number

  // Relazione col giocatore (-100 a +100)
  relazione: number
  sogliaRottura: number           // sotto questo valore -> modalita ostile
  isOstile: boolean               // derivato da relazione < sogliaRottura

  // Memoria
  memoria: TeacherMemoryEntry[]
  corruptionCount: number         // tentativi corruzione riusciti (scala difficolta futura)
  threatCount: number             // tentativi minaccia subiti (scala sorveglianza)
}

interface TeacherMemoryEntry {
  type: 'corruzione' | 'minaccia' | 'buon_voto' | 'cattivo_voto'
      | 'conversazione' | 'richiesta_spiegazione' | 'richiesta_revoca_voto'
  date: GameDate
  detail: string
  impactOnRelation: number        // quanto ha cambiato la relazione
}
```

### 2.4 Stato Mattinata Scolastica

```typescript
interface HourSlot {
  hourIndex: number               // 0-5 (prima ora = 0, sesta ora = 5)
  type: 'lesson' | 'break'
  subjectKey?: string             // assente per break
  teacherId?: string              // assente per break
  ordinaryEvent: OrdinaryHourEvent
  structuredEvent?: SchoolMorningEvent   // presente con ~35% probabilita
  completed: boolean
  playerChoice?: string           // id della scelta fatta (per log)
}

interface OrdinaryHourEvent {
  message: string
  statDelta: Partial<GameStats>   // tipicamente +1 intelligenza o +2 stanchezza
}

interface SchoolDayState {
  date: GameDate                  // data della mattinata in corso
  slots: HourSlot[]               // 7 elementi: 3 ore + break + 3 ore
  currentSlotIndex: number        // 0-6, slot attivo
  isComplete: boolean
}
```

---

## 3. Blocco 1 — Strutture Dati Base

### Fase 1A — Popolare `weeklyHours` (C1)

**File:** `src/lib/subjects.ts`

Aggiungere `weeklyHours` a tutte le materie in `COMMON_SUBJECTS` e
tutte le entry in `SPECIFIC_SUBJECTS` per tutti e 6 gli indirizzi.

Valori realistici per il sistema scolastico italiano:

| Materia tipo | Ore/settimana |
|---|---|
| Materia principale indirizzo | 4-5 |
| Materia secondaria | 2-3 |
| Materia comune core (ita, mat) | 3-4 |
| Materia comune leggera (ed.fisica, religione) | 1-2 |

Criterio: il totale ore per indirizzo/anno deve essere 28-32
(compatibile con 6 ore/giorno x 5 giorni = 30 slot).

### Fase 1B — Nuovi tipi in `types.ts`

**File:** `src/lib/types.ts`

Aggiungere tutte le interfacce della sezione 2 di questo piano:
- `TimetableSlot`, `WeeklyTimetable`
- `ClassmatePersonality`, `Classmate`
- `Teacher`, `TeacherMemoryEntry`
- `OrdinaryHourEvent`, `HourSlot`, `SchoolDayState`
- Costanti di default: `DEFAULT_SCHOOL_DAY_STATE`

### Fase 1C — Generatore Orario Settimanale

**File:** `src/lib/school-timetable.ts` (NUOVO)

```
generateWeeklyTimetable(
  schoolType: SchoolType,
  schoolYear: number,
  teachers: Teacher[]
): WeeklyTimetable
```

Algoritmo:
1. Ottenere materie attive con `getActiveSubjectsForYear()`
2. Per ogni materia, calcolare slot settimanali da `weeklyHours`
3. Distribuire su 5 giorni rispettando vincoli:
   - Max 2 occorrenze della stessa materia per giorno
   - Materie impegnative (peso >= 1.3) preferite nelle prime 3 ore
   - Nessun buco nell'orario (6 ore piene per giorno)
4. Assegnare `teacherId` a ogni slot dalla lista docenti

### Fase 1D — Generatore Registro Classe

**File:** `src/lib/school-roster.ts` (NUOVO)

```
generateClassRoster(schoolYear: number): Classmate[]
```

- Genera 18-25 compagni
- Distribuzione personalita: 20% secchioni, 15% bulli, 20% simpatici,
  15% silenziosi, 10% sportivi, 10% ribelli, 10% altro
- Relazione iniziale: da -10 a +10 (random)
- Tutti con `promotedToFriend: false`

### Fase 1E — Generatore Corpo Docente

**File:** `src/lib/school-teachers.ts` (NUOVO)

```
generateTeachers(
  schoolType: SchoolType,
  schoolYear: number
): Teacher[]
```

- Un professore per ogni materia attiva nell'anno
- Nomi generati da pool maschile/femminile
- Attributi 1-10 generati con distribuzione gaussiana centrata su 5
- `relazione` iniziale: `(simpatia * 6 - 20) + Math.round((Math.random() - 0.5) * 16)`
  (range effettivo -22 a +48; rumore calcolato una sola volta, persistito in KV — vedi C9)
- `sogliaRottura`: `-30 - (severita * 5)` (range -35 a -80)
- `memoria`: vuota, `corruptionCount: 0`, `threatCount: 0`
- `isOstile`: derivato da `relazione < sogliaRottura`

### Fase 1F — Init all'avvio partita

**File:** `src/App.tsx` e/o hook dedicato `src/hooks/useSchoolSystem.ts` (NUOVO)

Quando il giocatore sceglie il tipo di scuola (`SchoolSelection`):
1. Generare `Teacher[]` → salvare in KV `tabboz-teachers`
2. Generare `Classmate[]` → salvare in KV `tabboz-class-roster`
3. Generare `WeeklyTimetable` → salvare in KV `tabboz-weekly-timetable`

Hook `useSchoolSystem()` espone:
- `teachers`, `setTeachers`
- `classRoster`, `setClassRoster`
- `timetable`, `setTimetable`
- `schoolDayState`, `setSchoolDayState`
- `initSchoolYear(schoolType, year)` — genera le 3 strutture
- `getTeacherForSubject(subjectKey)` — lookup veloce
- `getTodaySchedule(dayOfWeek)` — restituisce le 6 materie del giorno

---

## 4. Blocco 2 — Mattinata Sequenziale

### Fase 2A — Generatore Slot Giornalieri

**File:** `src/lib/school-day-engine.ts` (NUOVO)

```
generateSchoolDaySlots(
  daySchedule: TimetableSlot[],   // 6 slot del giorno
  teachers: Teacher[],
  stats: GameStats
): HourSlot[]
```

Produce 7 `HourSlot`:
- Slot 0-2: ore 1-3 (tipo `'lesson'`)
- Slot 3: intervallo (tipo `'break'`)
- Slot 4-6: ore 4-6 (tipo `'lesson'`)

Per ogni slot `'lesson'`:
- `ordinaryEvent`: messaggio narrativo generato da materia + professore + ora
  (pool di template con placeholder). Delta stat: tipicamente
  `{ intelligenza: +1 }` o `{ stanchezza: +2 }` con variazione
  basata su severita professore.
- `structuredEvent`: generato con probabilita 35% base, modificata da:
  - `+10%` se `teacher.severita >= 8`
  - `-10%` se `teacher.relazione > 30`
  - `+15%` se `teacher.isOstile`

### Fase 2B — Refactor `handleVaiAScuola`

**File:** `src/App.tsx`

Il flusso attuale:
```
handleVaiAScuola → consuma azione → drawSchoolMorningEvents(6) → mostra panel
```

Diventa:
```
handleVaiAScuola →
  1. Imposta isAtSchool, wentToSchoolToday
  2. Ottieni daySchedule da timetable[dayOfWeek]
  3. Genera slots con generateSchoolDaySlots()
  4. Crea SchoolDayState = { date, slots, currentSlotIndex: 0, isComplete: false }
  5. Salva in KV tabboz-school-day-state
  6. Mostra SchoolMorningPanel in modalita sequenziale
  7. NON consuma le 3 azioni mattutine — la mattinata le consuma internamente
```

"Vai a Scuola" consuma **tutte** le azioni mattutine rimanenti (C10).
In pratica si chiama `consumeAllMorningActions()` invece di `consumeAction()`.
Le 6 ore scorrono senza consumare ulteriori azioni — sono il contenuto
della mattinata, non azioni separate. Le azioni pomeridiane rimangono intatte.

Nuova funzione da aggiungere in `useGameTime` e restituire nel suo oggetto
`return`: `consumeAllMorningActions(): void` — imposta `phaseActionsRemaining` a 0.

### Fase 2C — Evoluzione `SchoolMorningPanel`

**File:** `src/components/SchoolMorningPanel.tsx`

Il componente attualmente mostra N event-card con scelte. Evolve per
supportare due modalita:
- `context="street"` — comportamento attuale (pool eventi random)
- `context="school"` — nuovo comportamento sequenziale

In modalita `school`:
1. Mostra lo slot corrente (`schoolDayState.slots[currentSlotIndex]`)
2. Se lo slot ha solo `ordinaryEvent` → mostra messaggio + pulsante "Avanti"
3. Se lo slot ha `structuredEvent` → mostra scelte come ora
4. Dopo la risposta o il click "Avanti" → avanza `currentSlotIndex`
5. Se `currentSlotIndex === 3` (break) → mostra pannello intervallo
6. Quando tutti i 7 slot sono completati → chiude il panel, restituisce
   il controllo ad App.tsx che avanza alla fase pomeriggio

Props aggiuntive necessarie:
```typescript
interface SchoolMorningPanelProps {
  // ...esistenti...
  schoolDayState?: SchoolDayState
  onAdvanceHour?: () => void
  onBreakAction?: (actionType: BreakActionType) => void
  onDayComplete?: () => void
  teachers?: Teacher[]
}
```

### Fase 2D — Template Eventi Ordinari

**File:** `src/lib/school-day-templates.ts` (NUOVO)

Pool di template narrativi per messaggi ordinari:

```typescript
const ORDINARY_TEMPLATES: Record<string, string[]> = {
  matematica: [
    "{ora} ora — Matematica. {teacher} spiega le equazioni alla lavagna. Stai seguendo.",
    "{ora} ora — Matematica. {teacher} assegna esercizi dal libro. Provi a concentrarti.",
    // ... 8-10 varianti per materia
  ],
  italiano: [...],
  // ... per ogni materia
  _fallback: [
    "{ora} ora — {materia}. {teacher} spiega con calma. La lezione procede.",
  ]
}
```

### Fase 2E — Template Eventi Strutturati Contestuali

**File:** `src/lib/school-structured-events.ts` (NUOVO)

Evolutione di `SCHOOL_MORNING_EVENTS` con contesto materia/professore:

```typescript
interface ContextualSchoolEvent extends SchoolMorningEvent {
  subjectFilter?: string[]        // materie compatibili (vuoto = tutte)
  severityRange?: [number, number] // range severita prof per attivare
  relationRange?: [number, number] // range relazione per attivare
}
```

Esempi:
- "Interrogazione a sorpresa" → `subjectFilter: undefined` (tutte),
  `severityRange: [5, 10]`
- "Compito in classe" → `subjectFilter` uguale alla materia dell'ora
- "Il prof vi manda fuori" → `relationRange: [-100, -20]`

---

## 5. Blocco 3 — Sistema Relazionale Completo

### Fase 3A — Relazione Professore

**File:** `src/lib/teacher-relations.ts` (NUOVO)

```
applyTeacherRelationChange(
  teacher: Teacher,
  change: number,
  reason: TeacherMemoryEntry['type'],
  date: GameDate
): Teacher   // ritorna teacher aggiornato
```

Regole:
- `relazione` clamped a [-100, +100]
- Se `relazione < sogliaRottura` → `isOstile = true`
- Se `relazione > sogliaRottura + 20` → `isOstile = false` (isteresi)
- Corruzione riuscita: `corruttibilita` cala di 0.5 per ogni successo
  (il prof diventa piu cauto)
- Minaccia subita: `relazione -= 15 + resistenzaMinacce * 2`
- Buon voto: `relazione += 3` (lento ma costante)
- Cattivo voto: `relazione -= 2`

```
getCorruptionChance(teacher: Teacher, amount: number): number
```
Formula: `(corruttibilita * 10 + amount / 5 - corruptionCount * 8)` clamped 5-85%

```
getThreatSuccess(teacher: Teacher): { success: boolean, consequence: string }
```
Formula: `(10 - resistenzaMinacce) * 10` clamped 5-70%

### Fase 3B — Relazione Compagni

**File:** `src/lib/classmate-relations.ts` (NUOVO)

I compagni usano una relazione semplificata (singolo asse -100/+100)
coerente con la scala professori. Quando un compagno viene promosso
ad amico, il valore viene mappato sull'asse `amicizia` di `RelationStats`:

```
classmateRelationToFriendship(classmate: Classmate): number
// map: [-100,+100] → [0, 100]
// formula: Math.round((classmate.relation + 100) / 2)
```

Interazioni disponibili con i compagni:
- Chiacchiera → `relation += 3-8`
- Studia insieme → `relation += 2-5`, `intelligenza += 1`
- Litiga → `relation -= 10-20`
- Promuovi ad amico → richiede `relation >= 30`, crea Friend in `friends[]`

### Fase 3C — Transizioni Annuali

**File:** `src/lib/school-roster-transitions.ts` (NUOVO)

```
applyYearTransition(
  classRoster: Classmate[],
  teachers: Teacher[],
  schoolType: SchoolType,
  newYear: number,
  friends: Friend[]
): {
  newRoster: Classmate[],
  newTeachers: Teacher[],
  departedClassmates: Classmate[],   // bocciati → diventano amici extra
  newStudents: Classmate[],
  departedTeachers: Teacher[],
  newTeachersAdded: Teacher[]
}
```

**Compagni:**
- Bocciati: random 1-4 compagni
- I bocciati con `promotedToFriend: true` restano in `friends[]`
  ma cambiano `originType` a `'extrascolastico'`
- I bocciati con `promotedToFriend: false` vengono aggiunti
  automaticamente a `friends[]` con `originType: 'extrascolastico'`
  e relazione preservata (se >= 10)
- Nuovi studenti: random 0-2 con `relation: 5-15` (predisposizione amicizia)

**Professori:**
- Sostituiti: random 0-2
- I sostituiti vengono rimossi
- I nuovi arrivano con scheda vergine

Chiamata da `useGameTime` quando `schoolYear` avanza.

---

## 6. Blocco 4 — Intervallo e Pannello Scolastico

### Fase 4A — Sistema Intervallo

**File:** `src/lib/school-break-actions.ts` (NUOVO)

```typescript
type BreakActionType =
  | 'chiacchiera_compagno'
  | 'studia_insieme'
  | 'risolvi_conflitto'
  | 'conversazione_prof'
  | 'chiedi_spiegazione'
  | 'chiedi_revoca_voto'
  | 'corruzione_prof'
  | 'bar_scolastico'
  | 'riposa'

interface BreakAction {
  type: BreakActionType
  label: string
  description: string
  category: 'compagno' | 'professore' | 'indipendente'
  available: (ctx: BreakContext) => boolean   // condizioni di disponibilita
  execute: (ctx: BreakContext) => BreakResult
}

interface BreakContext {
  stats: GameStats
  teachers: Teacher[]              // tutti i professori (per lookup)
  todayTeachers: Teacher[]         // solo i prof presenti oggi (da daySchedule) — C11
  classRoster: Classmate[]
  schoolRecord: SchoolRecord
  completedSlots: HourSlot[]       // ore gia completate — necessario per 'chiedi revoca voto' — C11
  selectedTarget?: string          // id compagno o professore
}

interface BreakResult {
  message: string
  statDelta: Partial<GameStats>
  teacherRelationDelta?: { teacherId: string, delta: number }
  classmateRelationDelta?: { classmateId: string, delta: number }
  memoryEntry?: TeacherMemoryEntry
}
```

### Fase 4B — Pannello Intervallo (UI)

**File:** `src/components/SchoolBreakPanel.tsx` (NUOVO)

Componente mostrato quando `SchoolDayState.currentSlotIndex === 3`.
Offre 3 tab:
1. **Compagni** — lista compagni con azioni disponibili
2. **Professori** — lista prof presenti con azioni disponibili
3. **Altro** — bar scolastico, riposo

Il giocatore sceglie **una sola azione**, poi il pannello si chiude
e la mattinata prosegue con la quarta ora.

### Fase 4C — Home Scolastica Aggiornata

**File:** `src/components/SchoolHomePanel.tsx` (NUOVO o refactor di `SchoolMorningPanel`)

Mostra:
- Info anno/indirizzo (gia esistente)
- Contatore: "Amici fatti: X / Y compagni"
- Durante mattinata attiva: ora corrente + materia + professore
- Orario del giorno corrente (griglia 6 righe)
- Link a sotto-pannelli Compagni e Professori

### Fase 4D — Sotto-pannello Professori

**File:** `src/components/TeachersPanel.tsx` (NUOVO)

Lista professori con:
- Nome, materia
- Indicatore relazione sintetico (barra -100/+100 o emoji)
- Segnale visivo se `isOstile`
- Espandibile: storico interazioni (da `teacher.memoria`)
- Azioni disponibili fuori dalla mattinata (stesse dell'intervallo
  ma consumano azione pomeridiana)

### Fase 4E — Sotto-pannello Compagni (filtro scolastico)

**File:** Non serve un nuovo componente. Filtro su
`EnhancedFriendsPanel` con `originType === 'compagno_classe'`
oppure tab dedicato nella home scolastica che mostra `classRoster`.

---

## 7. Dipendenze tra Fasi

```
Blocco 1 (strutture dati):
  1A (weeklyHours) → 1C (generatore orario)
  1B (tipi) → 1C, 1D, 1E
  1C + 1D + 1E → 1F (init partita)

Blocco 2 (mattinata):
  1F → 2A (generatore slot)
  2A → 2B (refactor handleVaiAScuola)
  2D + 2E (template) → 2A
  2B → 2C (evoluzione panel)

Blocco 3 (relazioni):
  1D + 1E → 3A, 3B
  3A + 3B → 3C (transizioni)

Blocco 4 (intervallo + UI):
  2C + 3A + 3B → 4A (break system)
  4A → 4B (break panel)
  1F + 3A + 3B → 4C, 4D, 4E
```

---

## 8. Rischi e Mitigazioni

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Blocco 2 rompe il flusso mattutino corrente | Alto | Il refactor di `handleVaiAScuola` mantiene il fallback al sistema attuale se `timetable` e `null` (partite legacy) |
| KV migration per partite esistenti | Medio | Tutti i nuovi KV hanno default `null` o `[]`. Il codice gestisce il caso "strutture non generate" mostrando il flusso mattutino legacy |
| Complessita `SchoolMorningPanel` | Medio | Separare la logica sequenziale in un sotto-componente `SequentialLessonView` |
| Performance con 7 slot + eventi | Basso | Gli slot sono generati una volta e persistiti in KV. Nessun calcolo ripetuto |

---

## 9. File Nuovi e Modificati (Riepilogo)

### File NUOVI

| File | Blocco | Descrizione |
|---|---|---|
| `src/lib/school-timetable.ts` | 1 | Generatore orario settimanale |
| `src/lib/school-roster.ts` | 1 | Generatore registro classe |
| `src/lib/school-teachers.ts` | 1 | Generatore corpo docente |
| `src/hooks/useSchoolSystem.ts` | 1 | Hook centralizzato per le 3 strutture + schoolDayState |
| `src/lib/school-day-engine.ts` | 2 | Generatore slot giornalieri |
| `src/lib/school-day-templates.ts` | 2 | Template messaggi ordinari |
| `src/lib/school-structured-events.ts` | 2 | Eventi strutturati contestuali |
| `src/lib/teacher-relations.ts` | 3 | Logica relazionale professori |
| `src/lib/classmate-relations.ts` | 3 | Logica relazionale compagni |
| `src/lib/school-roster-transitions.ts` | 3 | Transizioni annuali roster |
| `src/lib/school-break-actions.ts` | 4 | Azioni intervallo |
| `src/components/SchoolBreakPanel.tsx` | 4 | UI pannello intervallo |
| `src/components/TeachersPanel.tsx` | 4 | UI pannello professori |

### File MODIFICATI

| File | Blocco | Modifica |
|---|---|---|
| `src/lib/subjects.ts` | 1 | Aggiunta `weeklyHours` a tutte le materie |
| `src/lib/types.ts` | 1 | Nuove interfacce (sezione 2 del piano) |
| `src/App.tsx` | 1, 2 | Integrazione `useSchoolSystem`, refactor `handleVaiAScuola` |
| `src/components/SchoolMorningPanel.tsx` | 2 | Evoluzione per modalita sequenziale |
| `src/hooks/useGameTime.ts` | 3 | Chiamata transizioni annuali |
| `src/components/SchoolSelection.tsx` | 1 | Trigger generazione strutture a scelta scuola |

---

## 10. Checklist Validazione per Fase

Ogni fase del TODO deve superare prima di passare alla successiva:

- `npx tsc --noEmit` → zero errori
- Nessun import circolare introdotto
- Partite esistenti (senza strutture generate) continuano a funzionare
- Se la fase tocca UI: banner/stati accessibili da tastiera + NVDA
