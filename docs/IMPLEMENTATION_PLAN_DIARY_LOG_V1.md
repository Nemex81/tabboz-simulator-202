# Piano Implementazione: Sistema Log + Diario (DIARY_LOG_V1)

> **Stato:** VALIDATO CON CORREZIONI E OTTIMIZZAZIONI
> **Data:** 6 aprile 2026
> **File coinvolti:** 6 (+1 opzionale App.tsx come step separato)

---

## Correzioni Applicate al Piano Originale

### CORREZIONE 1 — `currentDate` param ridondante
**Problema:** Il piano aggiungeva `currentDate: GameDate` come param separato a `useGameActions` e `useEventEngine`. Entrambi hanno già `gameTime: GameTime` nei params con `gameTimeRef` corrispondente, e `gameTime.currentDate` è la data di gioco.
**Fix:** Usare `gameTimeRef.current.currentDate` direttamente dentro i handler. `currentDate` NON viene aggiunto come param separato in nessuno dei due hook.
**Impatto App.tsx:** Non si passa `currentDate` a `useGameActions(...)` né a `useEventEngine(...)`.

### CORREZIONE 2 — `currentPhase` mancante in `useEventEngine`
**Confermato:** `useEventEngine` non ha `currentPhase` nei params né un ref per essa. È necessario aggiungerla. È l'unica eccezione alla correzione 1 (non è ridondante, è genuinamente assente).
**Fix:** Aggiungere solo `currentPhase: DayPhase` all'interfaccia `UseEventEngineParams` e passarla da `App.tsx`.

### CORREZIONE 3 — `handleGirlfriendAction` result detection vaga
**Problema:** Il piano diceva "result in base a result.message se contiene successo/fallimento" — rilevamento fragile su string.
**Fix:** Determinare il risultato in base a `result.statChanges`: somma i valori (escluso `soldi`); se netto positivo → `'positive'`, netto negativo → `'negative'`, altrimenti `'neutral'`. Oppure, se `result.updatedGirlfriend.relationshipStatus` è cambiato in positivo → `'positive'`.
**Implementazione concreta:**
```ts
const gfLogResult: GameLogEntry['result'] =
  result.statChanges && Object.values(result.statChanges).reduce((a, b) => a + b, 0) > 0
    ? 'positive'
    : result.statChanges && Object.values(result.statChanges).reduce((a, b) => a + b, 0) < 0
    ? 'negative'
    : 'neutral'
```

### OTTIMIZZAZIONE — `getRecentEntries` rimossa dall'hook
`getRecentEntries` restituisce `gameLog.slice(0, n)`, ma né `CharacterSheet` né `DiaryPanel` la usano — entrambi ricevono `gameLog` e fanno `slice(0, 7)` internamente. API dell'hook ridotta a `{ gameLog, addLogEntry, clearLog }`.

---

## File Coinvolti

| File | Operazione |
|---|---|
| `src/lib/types.ts` | Aggiunta interfaccia `GameLogEntry` + tipi correlati |
| `src/hooks/useGameLog.ts` | NUOVO hook dedicato al log |
| `src/hooks/useGameActions.ts` | Agganciare `addLogEntry` ai handler |
| `src/hooks/useEventEngine.ts` | Agganciare `addLogEntry` + aggiungere `currentPhase` |
| `src/components/DiaryPanel.tsx` | NUOVO componente tab Diario |
| `src/components/CharacterSheet.tsx` | Attivare tab Diario + anteprima log in tab Profilo |

**File NON toccati (STEP 1-6):** `App.tsx`, `useGameTime.ts`, `useGameStats.ts`, `GameDialogs.tsx`, tutti i file in `src/lib/`

---

## STEP 1 — `src/lib/types.ts`

Aggiungere in fondo al file, dopo `DEFAULT_SCHOOL_RECORD` (prima dell'EOF):

```ts
export type LogEntryType =
  | 'action_success'   // azione del giocatore riuscita
  | 'action_failure'   // azione del giocatore fallita
  | 'action_neutral'   // azione del giocatore neutra (es. studia)
  | 'event_positive'   // evento automatico positivo
  | 'event_negative'   // evento automatico negativo
  | 'event_neutral'    // evento automatico neutro
  | 'school'           // evento scolastico (voto, nota, sospensione)
  | 'social'           // evento sociale (amico, ragazza)
  | 'system'           // evento di sistema (fine anno, game over, nuovo anno)

export type DayPhaseLabel = 'Mattina' | 'Pomeriggio' | 'Sera' | 'Notte'

export interface GameLogEntry {
  id: string
  type: LogEntryType
  phase: DayPhaseLabel
  date: GameDate
  title: string
  description: string
  result: 'positive' | 'negative' | 'neutral'
}

export const MAX_LOG_ENTRIES = 200
```

**Note:** `DayPhase` e `GameDate` esistono già in types.ts — non duplicarli.

---

## STEP 2 — `src/hooks/useGameLog.ts` (FILE NUOVO)

```ts
import { useState, useCallback } from 'react'
import { GameLogEntry, GameDate, DayPhase, DayPhaseLabel, LogEntryType, MAX_LOG_ENTRIES } from '@/lib/types'

let _logCounter = 0

function generateLogId(): string {
  _logCounter++
  return `log_${Date.now()}_${_logCounter}`
}

function phaseToLabel(phase: DayPhase): DayPhaseLabel {
  const map: Record<DayPhase, DayPhaseLabel> = {
    mattina: 'Mattina',
    pomeriggio: 'Pomeriggio',
    sera: 'Sera',
    notte: 'Notte',
  }
  return map[phase]
}

export function useGameLog() {
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([])

  const addLogEntry = useCallback((
    type: LogEntryType,
    title: string,
    description: string,
    result: GameLogEntry['result'],
    date: GameDate,
    phase: DayPhase
  ): void => {
    const entry: GameLogEntry = {
      id: generateLogId(),
      type,
      phase: phaseToLabel(phase),
      date,
      title,
      description,
      result,
    }
    setGameLog((prev) => {
      const updated = [entry, ...prev]
      return updated.slice(0, MAX_LOG_ENTRIES)
    })
  }, [])

  const clearLog = useCallback(() => setGameLog([]), [])

  return { gameLog, addLogEntry, clearLog }
}
```

---

## STEP 3 — `src/hooks/useGameActions.ts`

### 3a — Aggiornamento `UseGameActionsParams`

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

**NON aggiungere `currentDate`** — usare `gameTimeRef.current.currentDate` direttamente.

Aggiungere `addLogEntry` nel destructuring della funzione `useGameActions`.

### 3b — Chiamate `addLogEntry` per ogni handler

**Pattern:** Dopo ogni `announce(...)`, aggiungere `addLogEntry(type, title, description, result, gameTimeRef.current.currentDate, currentPhaseRef.current)`.

La `description` è sempre il testo dell'announce già esistente.

| Handler | Contesto | type | title | result |
|---|---|---|---|---|
| `handlePalestra` | unico branch | `'action_neutral'` | `'Sessione in palestra'` | `'positive'` |
| `handleLampada` | unico branch | `'action_neutral'` | `'Lampada abbronzante'` | `'positive'` |
| `handleLavoro` | unico branch | `'action_neutral'` | `'Lavoro come buttafuori'` | `'positive'` |
| `handleMotorino` | unico branch | `'action_neutral'` | `'Motorino truccato'` | `'positive'` |
| `handleStudySubject` | `stressText === ''` | `'school'` | `` `Studiato ${getSubjectDisplayName(selectedSubject)}` `` | `'positive'` |
| `handleStudySubject` | `stressText !== ''` | `'school'` | `` `Studiato ${getSubjectDisplayName(selectedSubject)} — stress alto` `` | `'neutral'` |
| `handleDisco` | early return morale basso | `'action_failure'` | `'Troppo giù per il disco'` | `'negative'` |
| `handleDisco` | successo | `'action_success'` | `'Serata epica in disco'` | `'positive'` |
| `handleDisco` | fallimento | `'action_failure'` | `'Serata scarsa in disco'` | `'negative'` |
| `handleCinema` | successo | `'action_success'` | `'Film spettacolare'` | `'positive'` |
| `handleCinema` | fallimento | `'action_neutral'` | `'Serata al cinema'` | `'neutral'` |
| `handleRiposa` | unico branch | `'action_neutral'` | `'Riposo pomeridiano'` | `'neutral'` |
| `handleChiacchiera` | unico branch | `'social'` | `'Chiacchierata con qualcuno'` | `'positive'` |
| `handleParco` | unico branch | `'action_neutral'` | `'Giro al parco'` | `'positive'` |
| `handleMarina` | unico branch | `'school'` | `'Marinato la scuola'` | `'negative'` |
| `handleCorrompiSubject` | unico branch | `'school'` | `` `Mazzetta al prof di ${getSubjectDisplayName(subject)}` `` | `'neutral'` |
| `handleMinacciaSubject` | successo | `'school'` | `` `Minacciato il prof di ${getSubjectDisplayName(subject)}` `` | `'negative'` |
| `handleMinacciaSubject` | nota | `'school'` | `'Nota disciplinare'` | `'negative'` |
| `handleMinacciaSubject` | sospensione | `'school'` | `'Sospeso!'` | `'negative'` |
| `handleTryRelationship` | successo | `'social'` | `` `${relationship.name} ha detto sì!` `` | `'positive'` |
| `handleTryRelationship` | fallimento | `'social'` | `` `Palo da ${relationship.name}` `` | `'negative'` |
| `handleGirlfriendAction` | vedi sotto | `'social'` | `` `${action} con ${gf.nome}` `` | vedi CORREZIONE 3 |

**handleStudySubject — implementazione concreta:**
```ts
// Dopo announce, PRIMA di consumeAction/checkSurpriseQuiz:
const studyLogTitle = stressText !== ''
  ? `Studiato ${getSubjectDisplayName(selectedSubject)} — stress alto`
  : `Studiato ${getSubjectDisplayName(selectedSubject)}`
const studyLogResult: GameLogEntry['result'] = stressText !== '' ? 'neutral' : 'positive'
addLogEntry('school', studyLogTitle, announceMsg, studyLogResult, gameTimeRef.current.currentDate, currentPhaseRef.current)
```
(dove `announceMsg` è la stringa già passata all'announce, costruita prima)

**handleGirlfriendAction — implementazione concreta (CORREZIONE 3):**
```ts
const gfLogResult: GameLogEntry['result'] = result.statChanges
  ? (Object.values(result.statChanges).reduce((a, b) => a + b, 0) > 0 ? 'positive'
     : Object.values(result.statChanges).reduce((a, b) => a + b, 0) < 0 ? 'negative'
     : 'neutral')
  : 'neutral'
addLogEntry('social', `${action} con ${gf.nome}`, result.message, gfLogResult, gameTimeRef.current.currentDate, currentPhaseRef.current)
```

### 3c — Dipendenze useCallback

In ogni handler che chiama `addLogEntry`, aggiungere `addLogEntry` nell'array `deps` del `useCallback`.

---

## STEP 4 — `src/hooks/useEventEngine.ts`

### 4a — Aggiornamento `UseEventEngineParams`

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
  currentPhase: import('@/lib/types').DayPhase
```

**NON aggiungere `currentDate`** — già disponibile via `gameTimeRef.current.currentDate`.

Aggiungere nel destructuring: `addLogEntry, currentPhase`.

Aggiungere ref:
```ts
const currentPhaseRef = useRef(currentPhase)
currentPhaseRef.current = currentPhase
```

### 4b — Pattern eventi automatici in `triggerRandomEvent`

Per ogni evento risolto dentro `triggerRandomEvent`, dopo l'`announce(...)`, aggiungere:
```ts
addLogEntry(
  eventType,    // 'event_positive' | 'event_negative' | 'event_neutral'
  eventTitle,   // nome breve evento
  announceMsg,  // testo già passato ad announce
  eventResult,  // 'positive' | 'negative' | 'neutral'
  gameTimeRef.current.currentDate,
  currentPhaseRef.current
)
```

**Leggere il file prima di implementare** per identificare tutti i branch degli eventi e assegnare il tipo corretto (`event_positive`, `event_negative`, `event_neutral`).

⚠️ **Avvertenza:** `triggerRandomEvent` in `useEventEngine` ha ~15 eventi con branch propri. Non fare modifiche massive — aggiungere solo le chiamate `addLogEntry` senza toccare la logica esistente.

---

## STEP 5 — `src/components/DiaryPanel.tsx` (FILE NUOVO)

```tsx
import React from 'react'
import { BookOpen, CheckCircle, XCircle, MinusCircle } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { GameLogEntry, GameDate } from '@/lib/types'

interface DiaryPanelProps {
  gameLog: GameLogEntry[]
  previewOnly?: boolean
}

function formatDate(date: GameDate): string {
  return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`
}

function ResultIcon({ result }: { result: GameLogEntry['result'] }) {
  if (result === 'positive') return <CheckCircle size={16} weight="fill" className="text-secondary shrink-0" aria-hidden="true" />
  if (result === 'negative') return <XCircle size={16} weight="fill" className="text-destructive shrink-0" aria-hidden="true" />
  return <MinusCircle size={16} weight="fill" className="text-muted-foreground shrink-0" aria-hidden="true" />
}

function resultLabel(result: GameLogEntry['result']): string {
  if (result === 'positive') return 'Esito positivo'
  if (result === 'negative') return 'Esito negativo'
  return 'Esito neutro'
}

export function DiaryPanel({ gameLog, previewOnly = false }: DiaryPanelProps) {
  const entries = previewOnly ? gameLog.slice(0, 7) : gameLog

  if (entries.length === 0) {
    return (
      <Card className="p-6 border-2 border-muted bg-card">
        <p className="text-muted-foreground text-sm italic">
          Nessun evento registrato. Inizia a giocare per riempire il diario!
        </p>
      </Card>
    )
  }

  return (
    <section aria-labelledby="diary-title">
      {!previewOnly && (
        <Card className="p-4 border-2 border-accent bg-card mb-4">
          <h2 id="diary-title" className="text-2xl font-bold text-accent flex items-center gap-2">
            <BookOpen size={28} weight="fill" aria-hidden="true" />
            DIARIO — {entries.length} eventi registrati
          </h2>
        </Card>
      )}
      {previewOnly && (
        <h3 id="diary-title" className="sr-only">Anteprima diario — ultimi 7 eventi</h3>
      )}
      <ul
        role="log"
        aria-label={previewOnly ? 'Ultimi 7 eventi del diario' : 'Diario completo degli eventi'}
        aria-live="off"
        className="space-y-2"
      >
        {entries.map((entry) => (
          <li
            key={entry.id}
            role="listitem"
            className={`flex gap-3 items-start p-3 rounded-lg border ${
              entry.result === 'positive' ? 'border-secondary/30 bg-secondary/5' :
              entry.result === 'negative' ? 'border-destructive/30 bg-destructive/5' :
              'border-muted bg-muted/20'
            }`}
            aria-label={`${entry.date ? formatDate(entry.date) : ''}, ${entry.phase}: ${entry.title}. ${resultLabel(entry.result)}. ${entry.description}`}
          >
            <ResultIcon result={entry.result} />
            <div className="flex-1 min-w-0" aria-hidden="true">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-mono">
                  {entry.date ? formatDate(entry.date) : '??/??/????'}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{entry.phase}</span>
              </div>
              <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{entry.title}</p>
              {!previewOnly && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{entry.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

---

## STEP 6 — `src/components/CharacterSheet.tsx`

### 6a — Import
Aggiungere:
- `import { DiaryPanel } from '@/components/DiaryPanel'`
- `BookOpen` all'import da `@phosphor-icons/react` (già ci sono `IdentificationCard, Star, Trophy, GraduationCap`)

### 6b — Props
Aggiungere a `CharacterSheetProps`:
```ts
  gameLog: import('@/lib/types').GameLogEntry[]
```
Aggiungere nel destructuring: `gameLog`

### 6c — Attivare TabsTrigger "diario"
Sostituire:
```tsx
<TabsTrigger value="diario" disabled aria-label="Diario: non ancora disponibile">
  <span className="hidden sm:inline">Diario</span>
  <span className="sm:hidden">📓</span>
  <span className="ml-1 text-xs opacity-50">🔜</span>
</TabsTrigger>
```
Con:
```tsx
<TabsTrigger value="diario" aria-label="Diario degli eventi">
  <BookOpen size={18} className="mr-1" weight="fill" aria-hidden="true" />
  <span className="hidden sm:inline">Diario</span>
  <span className="sm:hidden">📓</span>
</TabsTrigger>
```

### 6d — TabsContent Diario
Aggiungere dopo `</TabsContent>` del tab "profilo":
```tsx
<TabsContent value="diario">
  <div className="mt-2">
    <DiaryPanel gameLog={gameLog} previewOnly={false} />
  </div>
</TabsContent>
```

### 6e — Anteprima nel tab Profilo
Aggiungere come quinta sezione nel `<div className="space-y-6">` del TabsContent "profilo", dopo lo Storico Scolastico:
```tsx
<section aria-labelledby="cs-diary-preview-title">
  <Card className="p-4 border-2 border-muted bg-card">
    <h3 id="cs-diary-preview-title" className="text-lg font-bold text-muted-foreground mb-3 flex items-center gap-2">
      <BookOpen size={20} weight="fill" aria-hidden="true" />
      ULTIMI EVENTI
    </h3>
    <DiaryPanel gameLog={gameLog} previewOnly={true} />
  </Card>
</section>
```

---

## STEP 7 — `src/App.tsx` (SEPARATO — non implementare in questo batch)

⚠️ Questo step va eseguito in un secondo prompt dedicato, file da 62KB.

1. `import { useGameLog } from '@/hooks/useGameLog'`
2. Destructura: `const { gameLog, addLogEntry, clearLog } = useGameLog()`
3. Passa a `useGameActions(...)`: aggiungere `addLogEntry`
4. Passa a `useEventEngine(...)`: aggiungere `addLogEntry, currentPhase` (dove `currentPhase` è già disponibile in App.tsx)
5. Passa a `<CharacterSheet ... gameLog={gameLog} />`
6. (Opzionale) Collega `clearLog` al bottone "Reset partita" nel pannello Controllo

---

## Checklist Pre-Implementazione

- [ ] `DayPhaseLabel`, `GameLogEntry`, `LogEntryType`, `MAX_LOG_ENTRIES` non esistono → da creare in `types.ts`
- [ ] `DayPhase`, `GameDate` **già esistenti** in `types.ts` — NON duplicare
- [ ] `useGameLog.ts` non esiste → da creare
- [ ] `DiaryPanel.tsx` non esiste → da creare
- [ ] `useGameActions`: aggiungere solo `addLogEntry` (NON `currentDate`)
- [ ] `useEventEngine`: aggiungere `addLogEntry` + `currentPhase` (NON `currentDate`)
- [ ] `CharacterSheet`: aggiungere `gameLog` prop + attivare tab Diario
- [ ] `App.tsx`: step separato (STEP 7)

---

## Ordine Esecuzione Consigliato

```
STEP 1 → STEP 2 → STEP 5 → STEP 6 → STEP 3 → STEP 4 → STEP 7 (separato)
```

Rationale: creare prima i tipi, poi gli hook/componenti nuovi (nessuna dipendenza), poi agganciare i hook esistenti (molte modifiche puntuali), poi App.tsx per ultimo.
