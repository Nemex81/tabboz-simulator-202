# Piano STEP 8 — Copertura Log Completa

> **Stato:** VALIDATO CON CORREZIONI
> **Data:** 6 aprile 2026
> **File coinvolti:** 3 (+1 App.tsx come coordinatore)
> **Build target:** zero errori TypeScript

---

## Correzioni Applicate al Piano Originale

### CORREZIONE 1 — `gameTimeRef` assente in `useGameTime.ts`
**Problema:** Il piano originale usa `gameTimeRef.current.currentDate` in `handleDormi` (8B-2) e `advancePhaseOnly` (8B-5), ma questo ref **non esiste** nel file. Esistono solo: `gradesRef`, `statsRef`, `schoolTypeRef`, `phaseActionsRemainingRef`, `currentPhaseRef`.
**Fix:** Aggiungere nel blocco ref di `useGameTime.ts`:
```ts
const gameTimeRef = useRef(gameTime)
gameTimeRef.current = gameTime
```
Poi usare `gameTimeRef.current.currentDate` in `handleDormi`.

### CORREZIONE 2 — `advancePhaseOnly`: usare `gameTime.currentDate` (già in deps)
**Problema:** Il piano diceva `gameTimeRef.current.currentDate` per l'absence log in `advancePhaseOnly`, ma `gameTime` è già nell'array deps di quel `useCallback`. Usare un ref sarebbe ridondante.
**Fix:** Nel STEP 8B-5 usare `gameTime.currentDate` (non `gameTimeRef.current.currentDate`). Non aggiungere `gameTimeRef` ai deps di `advancePhaseOnly`.

### CORREZIONE 3 — `advanceToNextDay` assenza notturna: `currentGt` già disponibile
**Problema:** Il piano diceva `gameTimeRef.current.currentDate` per l'assenza notturna in `advanceToNextDay`, ma il codice già calcola `const currentGt = validateGameTime(rawGameTime)` due righe prima nello stesso scope.
**Fix:** Nel STEP 8B-4 usare `currentGt.currentDate` (già in scope) invece di creare un ref separato.

### CORREZIONE 4 — Paghetta in `setRawGameTime`: chiarimento pattern
**Problema:** Il piano avverte che `addLogEntry` non va chiamata dentro un `setRawGameTime` setter (con istruzione esplicita solo per `advancePhaseOnly`), ma omette di menzionare che la paghetta `announce` in `advanceToNextDay` è **già dentro** il setter `setRawGameTime`. La stessa preoccupazione si applica anche lì.
**Chiarimento:** Il codebase già chiama `announce`, `setStats`, `playSound` dentro callback `useKV` setter — questo pattern è consolidato ovunque nell'hook. Per la paghetta in `advanceToNextDay`, `addLogEntry` va chiamata subito dopo `announce(...)` dentro il setter, coerentemente con il pattern esistente. Non è un'eccezione ma una prassi accettata in questo codebase.

---

## Analisi Gap (Confermata)

| Area | File | Handler/Evento | Problema |
|---|---|---|---|
| A | `App.tsx` | `handleVaiAScuola` | Nessun `addLogEntry` |
| B | `App.tsx` | `handleSchoolEventChoice` | Nessun `addLogEntry` |
| C | `useGameTime.ts` | `handleDormi`, `advancePhaseOnly`, `advanceToNextDay` | Hook non riceve `addLogEntry` |
| D | `SchoolMorningPanel.tsx` | `handleChoice` | Componente non riceve `addLogEntry` |

---

## File Coinvolti

| File | Operazione |
|---|---|
| `src/hooks/useGameTime.ts` | Aggiungere `gameTimeRef`, `addLogEntry` all'interfaccia + 5 chiamate log |
| `src/components/SchoolMorningPanel.tsx` | Aggiungere `addLogEntry` + `currentDate` alle props + chiamata in `handleChoice` |
| `src/App.tsx` | 2 `addLogEntry` + passare `addLogEntry` a `useGameTime` e `currentDate` a `SchoolMorningPanel` |

---

## Ordine di Esecuzione

```
STEP 8B (useGameTime) → STEP 8C (SchoolMorningPanel) → STEP 8A (App.tsx)
```

---

## STEP 8B — `src/hooks/useGameTime.ts`

### 8B-0 — Aggiungere `gameTimeRef` nel blocco ref (CORREZIONE 1)

Nel blocco ref esistente (dopo `currentPhaseRef`), aggiungere:
```ts
const gameTimeRef = useRef(gameTime)
gameTimeRef.current = gameTime
```

### 8B-1 — Aggiornare `UseGameTimeParams`

Aggiungere in fondo all'interfaccia, prima della `}` di chiusura:
```ts
  addLogEntry: (
    type: import('@/lib/types').LogEntryType,
    title: string,
    description: string,
    result: import('@/lib/types').GameLogEntry['result'],
    date: import('@/lib/types').GameDate,
    phase: import('@/lib/types').DayPhase
  ) => void
```

Aggiungere nel destructuring della funzione `useGameTime`: `addLogEntry`.

### 8B-2 — `handleDormi`

Dopo `announce(msg)` e prima di `playSound.success()`:
```ts
const dormiResult: 'neutral' | 'positive' = isNight ? 'neutral' : 'positive'
addLogEntry(
  'system',
  isNight ? 'Notte insonne' : 'Notte di sonno',
  msg,
  dormiResult,
  gameTimeRef.current.currentDate,
  currentPhaseRef.current
)
```

Aggiungere `addLogEntry` nei deps del `useCallback`:
```ts
}, [setStats, announce, advanceToNextDay, addLogEntry])
```

### 8B-3 — `advanceToNextDay` — paghetta

Il blocco `announce(...)` della paghetta è **dentro** `setRawGameTime((current) => { ... })`. Questo è il pattern esistente dell'hook (che già chiama `announce`, `setStats`, `playSound` dentro setter). Coerentemente, aggiungere `addLogEntry` subito dopo la `announce`:

```ts
announce(`SABATO! I tuoi ti hanno dato la PAGHETTA! +${paghetta}€ (media ≥ 7)`)
addLogEntry('system', 'Paghetta ricevuta!', `SABATO! I tuoi ti hanno dato la PAGHETTA! +${paghetta}€ (media ≥ 7)`, 'positive', newGameTime.currentDate, 'mattina')
return { ...newGameTime, lastPaghettaDate: newGameTime.currentDate }
```

### 8B-4 — `advanceToNextDay` — assenza notturna (CORREZIONE 3)

Il branch assenza notturna è **fuori** dal setter, nello stesso scope di `const currentGt = validateGameTime(rawGameTime)`. Aggiungere dopo `announce(...)`:

```ts
announce('📋 Sei andato a dormire senza andare a scuola! +1 Assenza, -0.2 Condotta.')
addLogEntry('school', 'Assenza non giustificata', '📋 Sei andato a dormire senza andare a scuola! +1 Assenza, -0.2 Condotta.', 'negative', currentGt.currentDate, 'notte')
```

Aggiungere `addLogEntry` nei deps di `advanceToNextDay` (in fondo all'array esistente).

### 8B-5 — `advancePhaseOnly` — assenza del giorno (CORREZIONE 2)

Il branch assenza è dentro `setRawGameTime((current) => { ... })`. La condizione dipende da `schoolRecord.wentToSchoolToday`, `dayType`, `gameTime.schoolYear.isSchoolPeriod` — tutti disponibili nell'outer scope.

**Pattern da seguire:** estrarre la condizione prima del setter, chiamare `addLogEntry` dopo:

```ts
// ← INSERIRE PRIMA del setRawGameTime(...)
const wasAbsent =
  !schoolRecord.wentToSchoolToday &&
  dayType === 'feriale' &&
  gameTime.schoolYear.isSchoolPeriod

// ... (il setRawGameTime esiste già — non modificarlo)
// setRawGameTime((current) => { ... }) // ← lasciare invariato

// ← INSERIRE DOPO il setRawGameTime(...)
if (wasAbsent) {
  addLogEntry('school', 'Assenza scolastica', '📋 Non sei andato a scuola ieri! La giornata è contata come assenza.', 'negative', gameTime.currentDate, 'mattina')
}
```

Aggiungere `addLogEntry` nei deps di `advancePhaseOnly` (in fondo all'array esistente).

⚠️ **Nota importante**: non toccare la logica esistente dentro il setter `setRawGameTime` di `advancePhaseOnly` — la `announce` e la `setSchoolRecord` già presenti restano invariate. Il `wasAbsent` è solo una variabile locale per il log, complementare alla logica esistente.

---

## STEP 8C — `src/components/SchoolMorningPanel.tsx`

### 8C-1 — Aggiornare `SchoolMorningPanelProps`

Aggiungere in fondo all'interfaccia:
```ts
  addLogEntry: (
    type: import('@/lib/types').LogEntryType,
    title: string,
    description: string,
    result: import('@/lib/types').GameLogEntry['result'],
    date: import('@/lib/types').GameDate,
    phase: import('@/lib/types').DayPhase
  ) => void
  currentDate: import('@/lib/types').GameDate
```

Aggiungere nel destructuring del componente: `addLogEntry, currentDate`.

### 8C-2 — `handleChoice` — aggiungere log dopo `announce(result.message)`

```ts
announce(result.message)
const deltaSum = Object.entries(result.delta)
  .filter(([k]) => k !== 'soldi')
  .reduce((acc, [, v]) => acc + (v ?? 0), 0)
const logResult: import('@/lib/types').GameLogEntry['result'] =
  deltaSum > 0 ? 'positive' : deltaSum < 0 ? 'negative' : 'neutral'
addLogEntry(
  event.category === 'didattica' ? 'school' : 'social',
  event.title,
  result.message,
  logResult,
  currentDate,
  'mattina'
)
```

Aggiungere `addLogEntry` e `currentDate` nei deps del `useCallback`:
```ts
[resolvedIds, stats, onStatChange, onGainExtraAction, onConsumeAction, announce, addLogEntry, currentDate]
```

---

## STEP 8A — `src/App.tsx`

### 8A-1 — `handleVaiAScuola`

Dopo `announce('Sei andato a scuola! +2 Intelligenza, +10 Stanchezza. Segui le lezioni!')` aggiungere:
```ts
addLogEntry('school', 'Vai a scuola', 'Sei andato a scuola! +2 Intelligenza, +10 Stanchezza. Segui le lezioni!', 'positive', gameTime.currentDate, currentPhase)
```

(`handleVaiAScuola` è una funzione anonima inline, non un `useCallback` — nessun deps da aggiornare.)

### 8A-2 — `handleSchoolEventChoice`

Dopo `announce(outcome.message)` (e prima di `if (deltaMsg) toast(deltaMsg)`):
```ts
addLogEntry(
  'school',
  schoolEvent?.title ?? 'Evento scolastico',
  outcome.message,
  outcome.statChanges
    ? (Object.values(outcome.statChanges).reduce((a, b) => a + b, 0) >= 0 ? 'positive' : 'negative')
    : 'neutral',
  gameTime.currentDate,
  currentPhase
)
```

(`handleSchoolEventChoice` è una funzione anonima inline — nessun deps da aggiornare.)

### 8A-3 — Passare `addLogEntry` a `useGameTime`

Nel blocco `useGameTime({ ... })` aggiungere in fondo alla lista params (dopo `setGameOverReason`):
```ts
addLogEntry,
```

### 8A-4 — Passare `addLogEntry` e `currentDate` a `<SchoolMorningPanel>`

```tsx
<SchoolMorningPanel
  events={schoolMorningEvents}
  stats={stats}
  onStatChange={setStats}
  onGainExtraAction={gainExtraAction}
  onConsumeAction={consumeAction}
  announce={announce}
  addLogEntry={addLogEntry}
  currentDate={gameTime.currentDate}
/>
```

---

## Checklist Pre-Implementazione

- [ ] `gameTimeRef` non esiste in `useGameTime.ts` → aggiungere nel blocco ref (STEP 8B-0)
- [ ] `addLogEntry` non è nell'interfaccia `UseGameTimeParams` → aggiungere (STEP 8B-1)
- [ ] `handleDormi` non ha log → aggiungere con `gameTimeRef.current.currentDate` (STEP 8B-2)
- [ ] Paghetta in `setRawGameTime` setter → `addLogEntry` chiamata dentro setter (pattern esistente) (STEP 8B-3)
- [ ] Assenza notturna usa già `currentGt.currentDate` → nessun ref extra necessario (STEP 8B-4)
- [ ] Assenza `advancePhaseOnly` → estrarre `wasAbsent` PRIMA del setter, log DOPO (STEP 8B-5)
- [ ] `SchoolMorningPanel` non ha `addLogEntry` né `currentDate` nelle props → aggiungere entrambe (STEP 8C)
- [ ] `handleVaiAScuola` in `App.tsx` → aggiungere log (STEP 8A-1)
- [ ] `handleSchoolEventChoice` in `App.tsx` → aggiungere log (STEP 8A-2)
- [ ] `useGameTime({...})` in `App.tsx` → passare `addLogEntry` (STEP 8A-3)
- [ ] `<SchoolMorningPanel>` in `App.tsx` → passare `addLogEntry` e `currentDate` (STEP 8A-4)

---

## Prompt per Copilot

> **STEP 8 — Completamento copertura log diario.**
>
> Implementa le seguenti modifiche seguendo esattamente questo piano:
>
> **1. `src/hooks/useGameTime.ts`**
> - Aggiungere nel blocco ref esistente (dopo `currentPhaseRef`): `const gameTimeRef = useRef(gameTime); gameTimeRef.current = gameTime`
> - Aggiungere `addLogEntry` all'interfaccia `UseGameTimeParams` (stessa firma degli altri hook) e nel destructuring
> - In `handleDormi`: dopo `announce(msg)` e prima di `playSound.success()`, loggare `'system'` con title `'Notte insonne'` (se `isNight`) o `'Notte di sonno'` (se sera), result `'neutral'`/`'positive'`, fase `currentPhaseRef.current`, data `gameTimeRef.current.currentDate`; aggiungere `addLogEntry` ai deps
> - In `advanceToNextDay` paghetta: dopo `announce(...)` dentro il setter, aggiungere `addLogEntry('system', 'Paghetta ricevuta!', ..., 'positive', newGameTime.currentDate, 'mattina')`; aggiungere `addLogEntry` ai deps di `advanceToNextDay`
> - In `advanceToNextDay` assenza notturna (fuori dal setter): dopo `announce(...)` usare `addLogEntry('school', 'Assenza non giustificata', ..., 'negative', currentGt.currentDate, 'notte')` — `currentGt` è già disponibile in scope
> - In `advancePhaseOnly`: estrarre `const wasAbsent = !schoolRecord.wentToSchoolToday && dayType === 'feriale' && gameTime.schoolYear.isSchoolPeriod` PRIMA di `setRawGameTime`; dopo il setter chiamare `if (wasAbsent) addLogEntry('school', 'Assenza scolastica', ..., 'negative', gameTime.currentDate, 'mattina')`; aggiungere `addLogEntry` ai deps
>
> **2. `src/components/SchoolMorningPanel.tsx`**
> - Aggiungere `addLogEntry` e `currentDate: GameDate` alle props `SchoolMorningPanelProps` e nel destructuring
> - In `handleChoice`: dopo `announce(result.message)`, calcolare `deltaSum` escludendo `soldi`, determinare `logResult`, chiamare `addLogEntry` con tipo `'school'` se `event.category === 'didattica'` altrimenti `'social'`; fase hardcoded `'mattina'`; data `currentDate`; aggiungere `addLogEntry` e `currentDate` ai deps del `useCallback`
>
> **3. `src/App.tsx`**
> - In `handleVaiAScuola`: dopo `announce(...)`, aggiungere `addLogEntry('school', 'Vai a scuola', ..., 'positive', gameTime.currentDate, currentPhase)`
> - In `handleSchoolEventChoice`: dopo `announce(outcome.message)`, loggare `'school'` con title `schoolEvent?.title ?? 'Evento scolastico'`, result calcolato da `outcome.statChanges` (somma ≥ 0 → positive, < 0 → negative, undefined → neutral)
> - In `useGameTime({...})`: aggiungere `addLogEntry,` ai params passati
> - In `<SchoolMorningPanel ...>`: aggiungere `addLogEntry={addLogEntry}` e `currentDate={gameTime.currentDate}`
>
> **Vincoli:** zero errori TypeScript, nessuna modifica alla logica esistente, solo aggiungere le chiamate log e i tipi necessari.
