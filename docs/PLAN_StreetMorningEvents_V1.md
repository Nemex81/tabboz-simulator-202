# PLAN — Sistema Eventi Mattutini Contestuali (Street Morning Events)
<!-- status: READY -->
<!-- version: 1.0 -->
<!-- date: 2026-04-07 -->
<!-- linked-design: RELATIONS_RELATIONS_SYSTEM_PLAN.md -->
<!-- related-todo: docs/TODO.md -->

## 1. Riepilogo progetto

Rendere il sistema di eventi mattutini contestuale alla scelta del giocatore (vai a scuola / marina),
introducendo:

- `isAtSchool: boolean` in `SchoolRecord` (flag KV persistente)
- Pool eventi `street-morning-events.ts` speculare a `school-morning-events.ts`
- Render condizionale del pannello mattutino in base al contesto
- Propagazione di `isAtSchool` a `useEventEngine` come parametro opzionale (MVP fase 2)

---

## 2. Validazione progetto (eseguita prima del piano)

| # | Punto proposta originale | Stato | Note |
|---|---|---|---|
| 1a | `isAtSchool` mancante in `SchoolRecord` | CONFERMATO | Campo non esiste, `DEFAULT_SCHOOL_RECORD` non lo contiene |
| 1b | Pool unico `SCHOOL_MORNING_EVENTS` non filtrato | CONFERMATO | Solo eventi scolastici, marina priva di contenuto |
| 1c | `handleMarina` non genera eventi | CONFERMATO | Azzera eventi scolastici, nessun pool alternativo |
| Corr.1 | Tipo categoria eventi mattutini | CORRETTO | Tipo unificato in `src/lib/types.ts` come `MorningEventCategory`, non in file school-specific |
| Corr.2 | `useAppDialogs` deve ricevere nuovi state per street panel | CORRETTO | Aggiungere `streetMorningEvents`, `showStreetMorning` con setter |
| Corr.3 | Guard render StreetMorningPanel usa `marinatoOggi` | CORRETTO | Non `isAtSchool`, per coerenza con la logica UI esistente in App.tsx |
| Corr.4 | Reset `isAtSchool` al cambio giorno | CORRETTO | Consolidare in `useGameTime` nello stesso write KV che resetta `wentToSchoolToday` |
| Passo F | Propagazione `isAtSchool` a `useEventEngine` | OPZIONALE MVP | `useEventEngine` non riceve `SchoolRecord` oggi; rimandato alla fase 2 |

---

## 3. Architettura target

```
Flusso scuola
  handleVaiAScuola()
    ├── setSchoolRecord(isAtSchool = true, wentToSchoolToday = true)
    ├── drawSchoolMorningEvents(6) → setSchoolMorningEvents()
    └── setShowSchoolMorning(true)

Flusso marina
  handleMarina()
    ├── setSchoolRecord(isAtSchool = false)   ← NUOVO
    ├── drawStreetMorningEvents(6) → setStreetMorningEvents()  ← NUOVO
    └── setShowStreetMorning(true)            ← NUOVO

Cambio giorno (useGameTime)
  ├── wentToSchoolToday = false
  └── isAtSchool = false                     ← NUOVO (reset KV)

App.tsx — render
  showSchoolMorning  &&  wentToSchoolToday   → SchoolMorningPanel context="school"
  showStreetMorning  &&  marinatoOggi        → SchoolMorningPanel context="street"
```

---

## 4. Passi di implementazione

### Passo A — `src/lib/types.ts`

**File:** `src/lib/types.ts`
**Modifiche:**

1. Aggiungere il tipo condiviso `MorningEventCategory` con valori unificati school+street.
2. Aggiungere `isAtSchool: boolean` all'interfaccia `SchoolRecord` dopo `wentToSchoolToday`.
3. Aggiungere `isAtSchool: false` a `DEFAULT_SCHOOL_RECORD`.

```typescript
export type MorningEventCategory =
  | 'didattica' | 'sociale' | 'istituto'
  | 'strada' | 'casa' | 'citta' | 'amici'

// Modifica interfaccia SchoolRecord
export interface SchoolRecord {
  assenze: number
  note: number
  sospensioni: number
  condotta: number
  wentToSchoolToday: boolean
  isAtSchool: boolean          // ← NUOVO: true solo se fisicamente a scuola oggi
  consecutiveGoodDays: number
}

export const DEFAULT_SCHOOL_RECORD: SchoolRecord = {
  assenze: 0,
  note: 0,
  sospensioni: 0,
  condotta: 8.0,
  wentToSchoolToday: false,
  isAtSchool: false,           // ← NUOVO
  consecutiveGoodDays: 0
}
```

**Impatto:** Tutti i siti che usano spread `{ ...(current ?? DEFAULT_SCHOOL_RECORD) }` ereditano
automaticamente il valore `false` per i record KV esistenti (backward-compatible).

---

### Passo B — `src/lib/street-morning-events.ts` (file nuovo)

**File:** `src/lib/street-morning-events.ts` (da creare)
**Struttura:** identica a `school-morning-events.ts` — stessa interfaccia `SchoolMorningEvent`,
stessa firma `drawStreetMorningEvents(maxEvents: number): SchoolMorningEvent[]`.

**Correzione tipo categorie (Nota 1, Opzione B):**

- In `src/lib/school-morning-events.ts` rimuovere la definizione locale `SchoolMorningCategory`.
- Importare `MorningEventCategory` da `@/lib/types` e usarlo in `SchoolMorningEvent.category`.
- In `src/lib/street-morning-events.ts` importare `MorningEventCategory` da `@/lib/types`.
- Non definire tipi categoria locali nei moduli evento.

**Categorie e ID evento (minimo 10 eventi):**

| ID | Categoria | Titolo | Prob |
|---|---|---|---|
| `st_dormi_tardi` | `casa` | Dormi fino alle 11 | 50 |
| `st_tv_mattutina` | `casa` | Televisione mattutina | 40 |
| `st_giro_motorino` | `citta` | Giro in motorino con gli amici | 30 |
| `st_bar_vicino_scuola` | `citta` | Bar vicino alla scuola | 35 |
| `st_sala_giochi` | `citta` | Sala giochi aperta di mattina | 25 |
| `st_sconosciuto_strano` | `strada` | Incontro strano in strada | 20 |
| `st_gruppetto_coatti` | `strada` | Gruppetto di coatti al parco | 30 |
| `st_amico_marina_con_te` | `amici` | Un amico marina con te | 40 |
| `st_genitori_ti_beccano` | `casa` | I genitori ti beccano a casa | 20 |
| `st_passeggiata_solitaria` | `strada` | Giro da solo — momento di pace | 35 |

```typescript
// school-morning-events.ts
import { GameStats, Friend, MorningEventCategory } from '@/lib/types'

export interface SchoolMorningEvent {
  id: string
  category: MorningEventCategory
  // ...
}

// street-morning-events.ts
import { GameStats, MorningEventCategory } from '@/lib/types'
```

**Funzione draw:**

```typescript
export function drawStreetMorningEvents(maxEvents: number = 3): SchoolMorningEvent[] {
  const eligible = STREET_MORNING_EVENTS.filter(e => Math.random() * 100 < e.probability)
  return eligible.sort(() => Math.random() - 0.5).slice(0, maxEvents)
}
```

**Tutti gli outcome devono usare i campi già esistenti in `GameStats`:**
`intelligenza, stanchezza, carisma, soldi, reputazione, coattaggine, figosita, muscoli`

---

### Passo C — `src/hooks/useAppDialogs.ts`

**File:** `src/hooks/useAppDialogs.ts`
**Modifiche:** aggiungere 2 state pair per il pannello strada.

```typescript
// Aggiungere dopo le righe showSchoolMorning:
const [streetMorningEvents, setStreetMorningEvents] = useState<SchoolMorningEvent[]>([])
const [showStreetMorning, setShowStreetMorning] = useState(false)

// Aggiungere al return:
streetMorningEvents,
setStreetMorningEvents,
showStreetMorning,
setShowStreetMorning,
```

---

### Passo D — `src/App.tsx` — Destructuring dialogs

**Sezione:** destructuring del return di `useAppDialogs()` (attorno a linea 158)
**Aggiungere:** `streetMorningEvents, setStreetMorningEvents, showStreetMorning, setShowStreetMorning`

---

### Passo E — `src/App.tsx` — Import

**Aggiungere** l'import di `drawStreetMorningEvents` accanto a quello esistente:

```typescript
import { drawSchoolMorningEvents, SchoolMorningEvent } from '@/lib/school-morning-events'
import { drawStreetMorningEvents } from '@/lib/street-morning-events'
```

---

### Passo F — `src/App.tsx` — `handleVaiAScuola`

**Modifica:** aggiungere `isAtSchool: true` allo spread di `setSchoolRecord` (linea ~403).

```typescript
setSchoolRecord((current): SchoolRecord => ({
  ...(current ?? DEFAULT_SCHOOL_RECORD),
  wentToSchoolToday: true,
  isAtSchool: true          // ← NUOVO
}))
```

---

### Passo G — `src/App.tsx` — `handleMarina`

**Stato attuale:**
```typescript
const handleMarina = () => {
  if (schoolRecord.wentToSchoolToday || marinatoOggi) { ... return }
  setMarinatoOggi(true)
  setShowSchoolMorning(false)
  setSchoolMorningEvents([])
  setMorningChoicePending(false)
  handleMarinaFromHook()
}
```

**Modifica target:**
```typescript
const handleMarina = () => {
  if (schoolRecord.wentToSchoolToday || marinatoOggi) { ... return }
  setMarinatoOggi(true)
  setShowSchoolMorning(false)
  setSchoolMorningEvents([])
  setMorningChoicePending(false)

  // isAtSchool resta false — solo la marina è attiva
  setSchoolRecord((current): SchoolRecord => ({
    ...(current ?? DEFAULT_SCHOOL_RECORD),
    isAtSchool: false
  }))

  // Genera eventi di strada e mostra il pannello
  const streetEvents = drawStreetMorningEvents(6)
  setStreetMorningEvents(streetEvents)
  setShowStreetMorning(true)

  handleMarinaFromHook()
}
```

---

### Passo H-bis — `src/hooks/useGameTime.ts` — reset KV consolidato

**Correzione race condition (Nota 2, Opzione B):** consolidare il reset giornaliero
di `isAtSchool` nello stesso write KV che già resetta `wentToSchoolToday`.

```typescript
setSchoolRecord((current): SchoolRecord => ({
  ...(current ?? DEFAULT_SCHOOL_RECORD),
  wentToSchoolToday: false,
  isAtSchool: false, // stesso write KV, nessuna race
}))
```

---

### Passo H — `src/App.tsx` — Reset cambio giorno

**Localizzare:** useEffect che resetta `marinatoOggi` al cambio di giorno (linea ~440).
**Aggiungere** solo reset locali UI per pannello strada:

```typescript
useEffect(() => {
  setMarinatoOggi(false)
  setShowStreetMorning(false)          // ← NUOVO
  setStreetMorningEvents([])           // ← NUOVO
}, [gameTime.currentDate.day, gameTime.currentDate.month, gameTime.currentDate.year])
```

**NOTA:** Il reset `isAtSchool=false` avviene in `useGameTime` nello stesso write KV
di `wentToSchoolToday=false`, evitando doppie scritture concorrenti da `App.tsx`.

---

### Passo I — `src/App.tsx` — Reset al cambio di fase

**Localizzare:** useEffect che azzera `showSchoolMorning` quando si esce dalla mattina (linea ~448).
**Aggiungere** chiusura del pannello strada:

```typescript
useEffect(() => {
  if (currentPhase !== 'mattina') {
    setShowSchoolMorning(false)
    setShowStreetMorning(false)        // ← NUOVO
  }
}, [currentPhase])
```

---

### Passo L — `src/components/SchoolMorningPanel.tsx` — prop `context`

**Modifiche:**

1. Aggiungere prop `context: 'school' | 'street'` all'interfaccia `SchoolMorningPanelProps`.
2. Rendere il banner superiore e le label categoria contestuali.

```typescript
// Nuove label per categorie strada
const categoryLabel: Record<MorningEventCategory, string> = {
  didattica: '📚 Didattica',
  sociale: '👥 Sociale',
  istituto: '🏫 Istituto',
  strada: '🛤️ Strada',
  casa: '🏠 Casa',
  citta: '🏙️ Città',
  amici: '👫 Amici',
}

const categoryColor: Record<MorningEventCategory, string> = {
  didattica: 'bg-blue-100 text-blue-800',
  sociale: 'bg-green-100 text-green-800',
  istituto: 'bg-orange-100 text-orange-800',
  strada: 'bg-gray-100 text-gray-800',
  casa: 'bg-yellow-100 text-yellow-800',
  citta: 'bg-purple-100 text-purple-800',
  amici: 'bg-pink-100 text-pink-800',
}

// Banner contestuale nell'export principale:
const contextBanner = context === 'school' ? (
  <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 text-center">
    <p className="font-bold text-amber-800">🏫 Mattina scolastica</p>
    <p className="text-sm text-amber-700">
      Sei a scuola. Gestisci gli eventi della mattina, poi usa i controlli per passare al pomeriggio.
    </p>
  </div>
) : (
  <div className="rounded-lg bg-slate-100 border border-slate-300 p-3 text-center">
    <p className="font-bold text-slate-700">🛤️ Mattina per strada</p>
    <p className="text-sm text-slate-600">
      Hai marinato. Vediamo cosa succede in giro oggi...
    </p>
  </div>
)
```

---

### Passo M — `src/App.tsx` — Render pannello strada

**Localizzare:** il blocco JSX che renderizza `<SchoolMorningPanel>` (linea ~1213).
**Aggiungere** subito dopo il blocco esistente il render del pannello strada:

```tsx
{/* Pannello eventi scolastici */}
{showSchoolMorning && dayType === 'feriale' && currentPhase === 'mattina' && gameTime.schoolYear.isSchoolPeriod && schoolRecord.wentToSchoolToday && (
  <SchoolMorningPanel
    context="school"
    events={schoolMorningEvents}
    ...props invariati...
  />
)}

{/* Pannello eventi mattutini fuori scuola */}
{showStreetMorning && dayType === 'feriale' && currentPhase === 'mattina' && marinatoOggi && (
  <SchoolMorningPanel
    context="street"
    events={streetMorningEvents}
    ...props invariati...
  />
)}
```

---

### Passo N (opzionale, fase 2) — `src/hooks/useEventEngine.ts`

Aggiungere `isAtSchool?: boolean` ai parametri di `UseEventEngineParams`.
Usarlo per filtrare eventi pomeridiani contestuali.
**Non blocca il merge del MVP.**

---

## 5. Ordine di esecuzione raccomandato

```
A  types.ts              — base tipologica (nessuna dipendenza)
B  street-morning-events.ts — nuovo file lib (dipende solo da types.ts)
C  useAppDialogs.ts      — nuovi state (dipende da school-morning-events.ts per il tipo)
D-E App.tsx imports/destructuring
F  App.tsx handleVaiAScuola
G  App.tsx handleMarina
H-bis useGameTime.ts reset giornaliero KV (`wentToSchoolToday` + `isAtSchool`)
H  App.tsx reset cambio giorno
I  App.tsx reset cambio fase
L  SchoolMorningPanel.tsx context prop
M  App.tsx render condizionale
N  useEventEngine.ts (fase 2)
```

---

## 6. Verifiche post-implementazione

- [ ] `npx tsc --noEmit` — zero errori TypeScript
- [ ] Tutti i nuovi `category` in `streetMorningEvents` coperti da `categoryLabel` e `categoryColor`
- [ ] `DEFAULT_SCHOOL_RECORD` retrocompatibile (spread `??` nei siti esistenti)
- [ ] `handleMarina` non chiama `setSchoolRecord` se già risolto (guard `marinatoOggi` intatta)
- [ ] Pannello scuola e pannello strada **non** appaiono contemporaneamente
- [ ] Reset corretto al cambio giorno per entrambi i pannelli
- [ ] Accessibilità NVDA: banner contestuale leggibile da screen reader
- [ ] Almeno 8 eventi in `STREET_MORNING_EVENTS`

---

## 7. File coinvolti — riepilogo

| File | Tipo modifica |
|---|---|
| `src/lib/types.ts` | Modifica (`isAtSchool` in `SchoolRecord` + `DEFAULT_SCHOOL_RECORD`) |
| `src/lib/street-morning-events.ts` | Creazione (nuovo) |
| `src/lib/school-morning-events.ts` | Modifica (rimuove tipo locale categoria, importa `MorningEventCategory`) |
| `src/hooks/useAppDialogs.ts` | Modifica (2 nuovi state pair) |
| `src/hooks/useGameTime.ts` | Modifica (reset consolidato `wentToSchoolToday=false` + `isAtSchool=false` in un solo write KV) |
| `src/App.tsx` | Modifica (import, destructuring, handleVaiAScuola, handleMarina, 2 useEffect, render JSX) |
| `src/components/SchoolMorningPanel.tsx` | Modifica (prop `context`, nuove categorie) |
| `src/hooks/useEventEngine.ts` | Modifica opzionale fase 2 |

---

## 8. Stima complessità

| Passo | Righe stimate | Rischio |
|---|---|---|
| A | 3 | Basso |
| B | ~200 | Medio (contenuto narrativo) |
| C | 6 | Basso |
| D-E | 4 | Basso |
| F | 1 | Basso |
| G | 8 | Basso |
| H-bis | 1-2 | Basso |
| H | 5 | Basso |
| I | 2 | Basso |
| L | ~30 | Basso |
| M | ~15 | Basso |

**Totale stimato:** ~282 righe, nessun rischio architetturale alto.
