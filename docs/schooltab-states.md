# SchoolTab — Diagramma degli stati del sotto-tab `home`

Documento B3-1-T1. Analisi statica del codice reale.  
Nessuna modifica ai file sorgente. Nessun comportamento inventato.

---

## Sezione 1 — Variabili di controllo

Le seguenti variabili determinano quale pannello viene renderizzato
all'interno di `TabsContent value="home"` in `SchoolTab.tsx`.

| Nome nel codice | Tipo TypeScript | Calcolata in | Valori possibili |
|---|---|---|---|
| `dayType` | `string \| null \| undefined` (in prop) — runtime: `DayType = 'feriale' \| 'sabato' \| 'domenica' \| 'festivo'` | `App.tsx` via `useGameTime` hook → `GameTimeV2.dayType` | `'feriale'`, `'sabato'`, `'domenica'`, `'festivo'`, `null`, `undefined` |
| `currentPhase` | `string \| null \| undefined` (in prop) — runtime: `DayPhase = 'mattina' \| 'pomeriggio' \| 'sera' \| 'notte'` | `App.tsx` via `useGameTime` hook → `GameTime.currentPhase` | `'mattina'`, `'pomeriggio'`, `'sera'`, `'notte'`, `null`, `undefined` |
| `isSchoolPeriod` | `boolean` | `App.tsx` → `gameTime.schoolYear.isSchoolPeriod` | `true`, `false` |
| `schoolRecord.wentToSchoolToday` | `boolean` (campo di `SchoolRecord`) | `App.tsx` via `useSchoolSystem` → KV `tabboz-school-record` | `true`, `false` |
| `schoolDayState` | `SchoolDayState \| undefined` | `App.tsx` via `useSchoolSystem` → `_schoolDayStateFromHook` | oggetto `SchoolDayState` oppure `undefined` |
| `schoolDayState.slots` | `HourSlot[]` | idem | array di 7 elementi (3 lesson + 1 break + 3 lesson) oppure array vuoto |
| `schoolDayState.isComplete` | `boolean` | idem | `true`, `false` |
| `schoolDayState.currentSlotIndex` | `number` | idem | `0`–`6` |
| `schoolDayState.slots[currentSlotIndex].type` | `'lesson' \| 'break'` | idem, campo di `HourSlot` | `'lesson'`, `'break'` |
| `hasActiveSchoolSequence` | `boolean` (const locale in `SchoolTab`) | `SchoolTab.tsx` — derivata come AND di 7 condizioni (vedi Sezione 3) | `true`, `false` |
| `marinatoOggi` | `boolean` | `App.tsx` → `useState(false)` — impostato da `handleMarina` | `true`, `false` |
| `morningDisplay` | `'school' \| 'street' \| null` | `App.tsx` via `useAppDialogs` → `setMorningDisplay` | `'school'`, `'street'`, `null` |
| `afternoonEvent` | `AfternoonEvent \| null` | `App.tsx` via `useSchoolEffects` → passata come prop | oggetto `AfternoonEvent` oppure `null` |
| `schoolSubPanel` | `'home' \| 'teachers' \| 'break'` | `App.tsx` → `useState('home')` — cambiato da `setSchoolSubPanel` | `'home'`, `'teachers'`, `'break'` |

### Variabili secondarie usate solo come guard per i pulsanti interni (non determinano il pannello)

| Nome | Tipo | Scopo |
|---|---|---|
| `phaseActionsLeft` | `number` | disabilita pulsanti Vai a Scuola / Marina |
| `morningChoicePending` | `boolean` | stato di attesa scelta mattutina (banner in AppHeader) |

---

## Sezione 2 — Tabella degli stati

La logica di rendering dentro `TabsContent value="home"` quando `schoolSubPanel === 'home'`
è strutturata come sequenza di condizioni indipendenti, **non** come if-else-if.
Più pannelli possono essere visibili contemporaneamente.
L'ordine di rendering nel DOM è: SchoolHomePanel → messaggio contestuale → azioni mattina → SchoolBreakPanel / SchoolMorningPanel → SchoolMorningPanel street → AfternoonEventPanel.

### Pannello sempre presente: `SchoolHomePanel`

`SchoolHomePanel` è renderizzato **sempre** quando `schoolSubPanel === 'home'`, indipendentemente da tutte le altre variabili. È il pannello di base invariante.

### Pannello condizionale: blocco azioni mattina (`VAI A SCUOLA` + `MARINA`)

Condizione di attivazione del blocco:

```
currentPhase === 'mattina' && dayType === 'feriale' && isSchoolPeriod
```

All'interno del blocco, il pulsante `Marina` appare solo se:

```
!schoolRecord.wentToSchoolToday && !marinatoOggi
```

### Pannello condizionale: `SchoolBreakPanel` (slot intervallo)

```
hasActiveSchoolSequence === true
&& schoolDayState !== undefined
&& schoolDayState.slots[schoolDayState.currentSlotIndex]?.type === 'break'
```

### Pannello condizionale: `SchoolMorningPanel` (slot lezione attiva)

```
hasActiveSchoolSequence === true
&& schoolDayState?.slots[schoolDayState?.currentSlotIndex]?.type !== 'break'
```

Nota: questa condizione è complementare a quella del `SchoolBreakPanel`; entrambe
dipendono da `hasActiveSchoolSequence`. Non possono essere vere contemporaneamente
perché `type` è `'lesson' | 'break'`.

### Pannello condizionale: `SchoolMorningPanel` (contesto strada — marinatori)

```
morningDisplay === 'street'
&& dayType === 'feriale'
&& currentPhase === 'mattina'
&& marinatoOggi === true
```

### Pannello condizionale: `AfternoonEventPanel`

```
afternoonEvent !== null
&& (currentPhase === 'pomeriggio' || currentPhase === 'sera')
```

---

### Tabella riassuntiva delle combinazioni rilevanti

Le colonne `SMP-scuola` e `SMP-strada` indicano rispettivamente
SchoolMorningPanel in contesto scuola e SchoolMorningPanel in contesto strada.
`SBP` = SchoolBreakPanel, `AEP` = AfternoonEventPanel.

| dayType | currentPhase | isSchoolPeriod | wentToSchoolToday | hasActiveSchoolSequence | Slot corrente type | marinatoOggi | morningDisplay | afternoonEvent | Pannelli visibili (in ordine DOM) |
|---------|---|---|---|---|---|---|---|---|---|
| `feriale` | `mattina` | `true` | `false` | `false` | — | `false` | `null` | `null` | SchoolHomePanel + blocco azioni (VAI A SCUOLA + MARINA) |
| `feriale` | `mattina` | `true` | `false` | `false` | — | `true` | `street` | `null` | SchoolHomePanel + blocco azioni (VAI A SCUOLA, no Marina) + SMP-strada |
| `feriale` | `mattina` | `true` | `true` | `true` | `lesson` | `false` | `school` | `null` | SchoolHomePanel + blocco azioni (VAI A SCUOLA disabilitato, no Marina) + SMP-scuola |
| `feriale` | `mattina` | `true` | `true` | `true` | `break` | `false` | `school` | `null` | SchoolHomePanel + blocco azioni (VAI A SCUOLA disabilitato) + SBP |
| `feriale` | `mattina` | `true` | `true` | `false` (schoolDayState.isComplete) | — | `false` | `null` | `null` | SchoolHomePanel + blocco azioni (VAI A SCUOLA disabilitato) |
| `feriale` | `pomeriggio` | `true` | `true` | `false` | — | — | `null` | obj | SchoolHomePanel + AEP |
| `feriale` | `pomeriggio` | `true` | `true` | `false` | — | — | `null` | `null` | SchoolHomePanel (solo) |
| `feriale` | `sera` | `true` | `true` | `false` | — | — | `null` | obj | SchoolHomePanel + AEP |
| `feriale` | `sera` | `true` | `true` | `false` | — | — | `null` | `null` | SchoolHomePanel (solo) |
| `feriale` | `notte` | `true` | — | `false` | — | — | — | — | SchoolHomePanel (solo) — blocco azioni non visibile |
| `sabato` | `mattina` | — | — | `false` | — | — | — | — | SchoolHomePanel (solo) — blocco azioni non visibile (dayType ≠ feriale) |
| `domenica` | `mattina` | — | — | `false` | — | — | — | — | SchoolHomePanel (solo) |
| `festivo` | `mattina` | — | — | `false` | — | — | — | — | SchoolHomePanel (solo) |
| `feriale` | `mattina` | `false` | — | `false` | — | — | — | — | SchoolHomePanel (solo) — blocco azioni non visibile (isSchoolPeriod false) |
| `null`/`undefined` | qualsiasi | — | — | `false` | — | — | — | — | SchoolHomePanel (solo) — tutte le condizioni che richiedono dayType falliscono |

**Casi IMPOSSIBILI per vincoli logici:**

| Combinazione | Motivo |
|---|---|
| `hasActiveSchoolSequence === true` + `dayType !== 'feriale'` | hasActiveSchoolSequence richiede `dayType === 'feriale'` come prima condizione |
| `hasActiveSchoolSequence === true` + `currentPhase !== 'mattina'` | hasActiveSchoolSequence richiede `currentPhase === 'mattina'` |
| `hasActiveSchoolSequence === true` + `isSchoolPeriod === false` | hasActiveSchoolSequence richiede `isSchoolPeriod === true` |
| `hasActiveSchoolSequence === true` + `wentToSchoolToday === false` | hasActiveSchoolSequence richiede `schoolRecord.wentToSchoolToday === true` |
| SBP visibile + SMP-scuola visibile contemporaneamente | I due pannelli dipendono dallo stesso `hasActiveSchoolSequence` ma le condizioni sul tipo di slot sono mutualmente esclusive (`'break'` vs `!== 'break'`) |
| SMP-strada visibile + `hasActiveSchoolSequence === true` | Per `hasActiveSchoolSequence` serve `wentToSchoolToday === true`; SMP-strada richiede `marinatoOggi === true`. `wentToSchoolToday` e `marinatoOggi` non sono formalmente esclusivi per tipo, ma `handleMarina` non imposta `wentToSchoolToday = true`. DA VERIFICARE se esistono guard applicative che li rendono mutuamente esclusivi. |

---

## Sezione 3 — Definizione di `hasActiveSchoolSequence`

Codice esatto estratto da `src/components/tabs/SchoolTab.tsx`:

```typescript
const hasActiveSchoolSequence =
  dayType === 'feriale' &&
  currentPhase === 'mattina' &&
  isSchoolPeriod &&
  schoolRecord.wentToSchoolToday &&
  schoolDayState !== undefined &&
  schoolDayState.slots.length > 0 &&
  !schoolDayState.isComplete
```

### Significato di ciascuna condizione

| Condizione | Significato in termini di stato di gioco |
|---|---|
| `dayType === 'feriale'` | È un giorno scolastico (lunedì–venerdì non festivo). Nei weekend e nei festivi la scuola non è attiva. |
| `currentPhase === 'mattina'` | La sequenza scolastica accade solo durante la fase mattutina. |
| `isSchoolPeriod` | Il calendario scolastico è aperto (tra settembre e giugno). Durante l'estate/vacanze questa flag è false. |
| `schoolRecord.wentToSchoolToday` | Il giocatore ha confermato di andare a scuola oggi (ha cliccato "Vai a Scuola"). False = non è ancora andato o ha marinato. |
| `schoolDayState !== undefined` | Lo stato della mattinata scolastica è stato inizializzato. Se undefined, la sequenza non è partita. |
| `schoolDayState.slots.length > 0` | L'orario della giornata ha almeno un'ora. Protegge da SchoolDayState con array vuoto (stato vuoto di default). |
| `!schoolDayState.isComplete` | La sequenza non è ancora terminata. Quando tutte le 7 slot (3+1+3) sono completate, isComplete diventa true e la sequenza non viene più mostrata. |

---

## Sezione 4 — Analisi layout mobile

### Classi CSS del `TabsList`

```html
<TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-2 bg-card/50 p-1">
```

| Breakpoint | Colonne | Righe logiche per 5 trigger |
|---|---|---|
| mobile (< `md`, di default < 768px) | 3 | 2 righe: 3 trigger in riga 1, 2 trigger in riga 2 |
| `md` e superiore (≥ 768px) | 5 | 1 riga: 5 trigger sulla stessa linea |

### Classi CSS di ciascun `TabsTrigger`

Non sono presenti classi specifiche di dimensione testo o troncamento sui `TabsTrigger`.
Gli unici stili dichiarati sono le varianti di stato attivo (`data-[state=active]:bg-*`).
Le classi di dimensionamento predefinite di Radix UI e Shadcn/ui si applicano.

### Contenuto dei trigger

Ogni trigger contiene:
- Un'icona Phosphor (`size={18}`, peso `fill`) con `className="mr-2"`
- Un testo label (non abbreviato, non aria-hidden)

| Trigger | Icona | Label testo |
|---|---|---|
| `home` | `GraduationCap` | `Home` |
| `voti` | `GraduationCap` | `Voti` |
| `verifiche` | `Brain` | `Verifiche` |
| `amici` | `UserCircle` | `Amici` |
| `dashboard` | `Trophy` | `Dashboard` |

### Analisi statica a 320px

A 320px con `grid-cols-3`, ogni cella misura circa `(320px - 2×8px padding - 2×4px gap) / 3 ≈ 96px`.
I trigger contengono icona (18px) + `mr-2` (8px) + testo.

- `Home` (4 caratteri): a 96px non c'è troncamento atteso.
- `Voti` (4 caratteri): a 96px non c'è troncamento atteso.
- `Verifiche` (9 caratteri, ≈ 64px a font-size 14px/medium): **a rischio di troncamento** o wrapping in assenza di `whitespace-nowrap`.
- `Amici` (5 caratteri): margine stretto a 96px con icona, ma probabilmente visibile.
- `Dashboard` (9 caratteri, ≈ 64px): stesso rischio di `Verifiche`.

**Conclusione analisi statica**: le classi CSS dichiarate non includono `truncate`, `whitespace-nowrap` o `min-w-0`. Il componente `TabsTrigger` di Shadcn/ui include per default `whitespace-nowrap` nella CVA base. Se questa classe è presente, i label non si troncano ma il testo potrebbe uscire dai bordi della cella. Questo richiede **verifica browser a 320px** per concludere se ci sono overflow visivi reali.

---

## Sezione 5 — Punti aperti per decisione layout

I punti seguenti devono ricevere risposta prima di aprire qualsiasi PR di refactor.

### P1 — Compatibilità accordion vs navigazione SR di Radix Tabs

Radix UI Tabs implementa la navigazione `ArrowLeft`/`ArrowRight` come movimento tra i `TabsTrigger` dello stesso livello. Se `home` e `voti` vengono convertiti in un accordion verticale dentro il `TabsContent value="home"`, la navigazione tastiera tra i due pannelli richiederà una nuova implementazione (es. `Accordion` di Radix/Shadcn o gestione manuale di focus). La domanda è: il progettista accetta una navigazione diversa per `home`/`voti` rispetto agli altri 3 sotto-tab, oppure vuole mantenere un pattern uniforme per tutti e 5? Se si sceglie accordion, specificare quale pattern ARIA è preferito (`role="region"` con heading o `role="tabpanel"` annidato).

### P2 — Priorità tra i 4 pannelli condizionali in home

I 4 pannelli condizionali (`SchoolBreakPanel`, `SchoolMorningPanel` scuola, `SchoolMorningPanel` strada, `AfternoonEventPanel`) non sono in un if-else-if ma in condizioni indipendenti. In teoria più di uno potrebbe essere visibile contemporaneamente se le condizioni si sovrappongono. La domanda è: la logica applicativa garantisce che solo uno sia attivo in un dato momento? In particolare:

- Può `afternoonEvent !== null` essere vera insieme a `hasActiveSchoolSequence === true`? Se sì, entrambi i pannelli vengono renderizzati nello stesso viewport.
- Può `morningDisplay === 'street'` essere vera insieme a `hasActiveSchoolSequence === true` (vedi nota "DA VERIFICARE" in Sezione 2)?

Il progettista deve confermare l'invariante applicativa o identificare dove la guard va aggiunta.

### P3 — Il pannello `voti` può diventare sezione verticale dentro `home`?

Attualmente `voti` è un sotto-tab separato con navigazione indipendente (frecce ArrowLeft/ArrowRight). Se diventasse una sezione scroll dentro `home`, si perderebbe la separazione di navigazione per gli utenti da tastiera: per raggiungere i voti bisognerebbe scorrere, non premere una freccia. La domanda è: il progettista considera accettabile questo cambio di modello di navigazione? Se sì, va definito un ancora navigabile (`#voti`) o un heading focalizzabile che permetta agli utenti SR di saltare direttamente alla sezione voti.

### P4 — Comportamento di `defaultValue="home"` dopo cambio fase

Il componente `Tabs` ha `defaultValue="home"`, che è il valore iniziale al mount. Se l'utente è nel sotto-tab `dashboard` e avanza la fase (es. da mattina a pomeriggio), il componente **non** viene smontato e rimontato, quindi `defaultValue` non scatta di nuovo: l'utente rimane su `dashboard`. La domanda è: questo è il comportamento desiderato, oppure al cambio di fase il tab deve essere resettato a `home` programmaticamente?

### P5 — Il nome del campo "isBreakTime" / slot corrente

La condizione per `SchoolBreakPanel` usa `schoolDayState.slots[schoolDayState.currentSlotIndex]?.type === 'break'`. Non esiste una variabile `isBreakTime` con quel nome nel codice: la condizione è inline. La domanda è: per il refactor conviene estrarre questa condizione in una variabile denominata (es. `isCurrentSlotBreak`) nel componente, oppure mantenerla inline?

---

## Sezione 6 — Metadati documento

```
Generato:    18 aprile 2026
Autore:      Agent-Analyze (analisi automatica — Agent mode: Agent-Analyze)
Stato:       bozza — in attesa di revisione progettista
File analizzati:
  - src/components/tabs/SchoolTab.tsx
  - src/components/SchoolHomePanel.tsx
  - src/components/SchoolMorningPanel.tsx
  - src/components/SchoolBreakPanel.tsx
  - src/components/AfternoonEventPanel.tsx
  - src/lib/types.ts (tipi DayPhase, DayType, SchoolDayState, HourSlot, SchoolRecord)
  - src/App.tsx (sezione props SchoolTab, useState marinatoOggi/morningChoicePending)
tsc al momento della generazione: non eseguito (task documentazione — nessun file src/ modificato)
```

## Stato implementazione B3-1-T5

- [x] Label mobile: icona only sotto md
- [x] Logica pannelli home: if-else-if esplicito con priorita definita
- [x] Reset sotto-tab a home al cambio mattina→pomeriggio
- [ ] Test visuale viewport 320px (manuale — non automatizzabile)
- [ ] Test NVDA navigazione sotto-tab dopo reset fase

Data implementazione: 18 aprile 2026
