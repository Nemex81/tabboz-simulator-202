# Piano di Correzione — Tabboz Simulator 2026
**Documento per GitHub Copilot | Versione 1.0 | 03 Aprile 2026**

---

## Contesto e Obiettivo

Questo documento descrive le correzioni da implementare nel repository `Nemex81/tabboz-simulator-202` a seguito di un'analisi completa del codice post-refactoring. Le modifiche devono essere applicate in ordine di priorità, file per file, senza alterare funzionalità già funzionanti. Ogni sezione indica: file da modificare, comportamento attuale (errato), comportamento atteso (corretto) e il codice da applicare.

**Regola generale per Copilot:** non toccare nessun file che non sia esplicitamente citato. Non rinominare variabili, non riorganizzare import, non riformattare codice non coinvolto. Le modifiche devono essere chirurgiche.

---

## PRIORITÀ 1 — Bug Critico: Crash su "Rifiuta" nella Gara Motorino

### File: `src/hooks/useEventEngine.ts`

### Problema

Quando appare il dialog della gara motorino e l'utente preme "Rifiuta", l'app crasha. La causa è un problema di ordinamento degli aggiornamenti di stato React: `setStats()` viene eseguito prima di `setShowStreetRaceEvent(false)`. Questo causa un re-render del componente AlertDialog con il dialog ancora visibile (`showStreetRaceEvent = true`) mentre lo stato interno sta già cambiando, producendo un render inconsistente.

### Comportamento Attuale (ERRATO)

```typescript
const handleStreetRaceRifiuta = useCallback(() => {
  playSound.failure()
  setShowStreetRaceEvent(false)       // ← SECONDO: troppo tardi
  setStats((current) => ({
    ...current,
    coattaggine: clampStat(current.coattaggine - 15),
    figosita: clampStat(current.figosita - 10)
  }))
  announce('Hai RIFIUTATO la sfida! Sei un FIFONE! -15 Coattaggine, -10 Figosità')
}, [setStats, announce])
```

### Comportamento Atteso (CORRETTO)

`setShowStreetRaceEvent(false)` deve essere la **prima istruzione eseguita**, prima di qualsiasi `setStats`, per chiudere il dialog prima che React elabori le modifiche di stato derivate.

### Modifica da Applicare

Sostituire l'intera funzione `handleStreetRaceRifiuta` con:

```typescript
const handleStreetRaceRifiuta = useCallback(() => {
  // Chiudere il dialog PRIMA di qualsiasi aggiornamento di stato
  setShowStreetRaceEvent(false)
  playSound.failure()
  setStats((current) => ({
    ...current,
    coattaggine: clampStat(current.coattaggine - 15),
    figosita: clampStat(current.figosita - 10)
  }))
  announce('Hai RIFIUTATO la sfida! Sei un FIFONE! -15 Coattaggine, -10 Figosità')
}, [setStats, announce])
```

**Nota:** Applicare la stessa regola "dialog close first" a tutte le altre handler degli eventi se non già rispettata, verificando che `setShowMetallariEvent(false)`, `setShowPoliceEvent(false)`, `setShowBulliEvent(false)` siano sempre la prima riga delle rispettive handler.

---

## PRIORITÀ 2 — Sistema Fasce Orarie: `advanceToNextDay` non resetta la fase

### File: `src/hooks/useGameTime.ts`

### Problema

Quando il giocatore preme "Riposa" con 0 azioni rimanenti, viene chiamata `advanceToNextDay()`. Questa funzione avanza la data e resetta `gameTime.actionsRemaining` a `maxActionsPerDay`, ma **non resetta** le KV `tabboz-phase` (currentPhase) e `tabboz-phase-actions` (phaseActionsRemaining). Il risultato è che al mattino del giorno nuovo, `phaseActionsRemaining` è ancora 0 (rimasto dalla notte) e `currentPhase` rimane a `notte`, mostrando dati errati nella `TimeDisplay`.

### Comportamento Attuale (ERRATO)

In `advanceToNextDay`, dopo la chiamata a `advanceGameTime(current)`, mancano i reset di fase. Il nuovo giorno inizia con la fase bloccata all'ultimo valore della notte precedente.

### Comportamento Atteso (CORRETTO)

Dopo ogni avanzamento di giorno, il sistema deve:
1. Calcolare il `DayType` del nuovo giorno via `getDayType(newGameTime.currentDate)`
2. Settare `currentPhase` a `'mattina'`
3. Settare `phaseActionsRemaining` al valore `DAY_PHASE_CONFIG[newDayType]['mattina'].maxActions`

### Modifica da Applicare

All'interno della funzione `advanceToNextDay`, **dentro il callback di `setRawGameTime`**, aggiungere i tre reset subito dopo la riga `const newGameTime = advanceGameTime(current)`:

```typescript
const advanceToNextDay = useCallback(() => {
  setRawGameTime((current) => {
    const newGameTime = advanceGameTime(current)
    
    // --- AGGIUNTA: reset fasce orarie al nuovo giorno ---
    const newDayType = getDayType(newGameTime.currentDate)
    setDayType(newDayType)
    setCurrentPhase('mattina')
    setPhaseActionsRemaining(DAY_PHASE_CONFIG[newDayType]['mattina'].maxActions)
    // --- FINE AGGIUNTA ---

    const currentMedia = calculateMedia(gradesRef.current)
    const st = schoolTypeRef.current

    // ... resto della logica invariata ...
  })
  // ... resto invariato ...
}, [ /* aggiungere setDayType, setCurrentPhase, setPhaseActionsRemaining alle dipendenze */ ])
```

**Aggiornare l'array delle dipendenze del `useCallback`** aggiungendo: `setDayType`, `setCurrentPhase`, `setPhaseActionsRemaining`.

**Verificare** che `getDayType` e `DAY_PHASE_CONFIG` siano già importati in cima al file (lo sono, da `@/lib/time-utils`).

---

## PRIORITÀ 3 — `handleRiposa` consuma stanchezza senza consumare azione

### File: `src/hooks/useGameActions.ts`

### Problema

`handleRiposa` riduce la stanchezza di 40 punti. Se il giocatore ha ancora azioni rimaste (`actionsRemaining > 0`), la stanchezza viene ridotta senza chiamare `consumeAction()`. Questo permette di riposarsi infinite volte nello stesso slot temporale, azzerando la stanchezza senza alcun costo di azione — meccanica sbilanciata.

### Comportamento Attuale (ERRATO)

```typescript
const handleRiposa = useCallback((advanceToNextDay: () => void) => {
  playSound.buttonClick()
  setStats((current) => ({
    ...current,
    stanchezza: clampStat(current.stanchezza - 40)
  }))
  if (gameTimeRef.current.actionsRemaining === 0) {
    advanceToNextDay()
  } else {
    announce('Hai riposato un po\'! -40 Stanchezza')
    // ← manca consumeAction()
  }
}, [setStats, announce])
```

### Comportamento Atteso (CORRETTO)

Il riposo deve sempre consumare un'azione, sia quando avanza il giorno, sia quando rimangono azioni disponibili.

### Modifica da Applicare

Sostituire l'intera funzione `handleRiposa` con:

```typescript
const handleRiposa = useCallback((advanceToNextDay: () => void) => {
  playSound.buttonClick()
  setStats((current) => ({
    ...current,
    stanchezza: clampStat(current.stanchezza - 40)
  }))
  if (gameTimeRef.current.actionsRemaining <= 1) {
    // Ultima azione o già a 0: consuma e avanza al giorno successivo
    consumeAction()
    advanceToNextDay()
  } else {
    // Ha ancora azioni: consuma comunque l'azione
    consumeAction()
    announce('Hai riposato un po\'! -40 Stanchezza')
  }
}, [setStats, consumeAction, announce])
```

**Aggiornare l'array delle dipendenze** aggiungendo `consumeAction`.

---

## PRIORITÀ 4 — `handleMotorino` manca del controllo stanchezza

### File: `src/hooks/useGameActions.ts`

### Problema

Tutte le azioni fisiche (`handlePalestra`, `handleLavoro`) hanno una guardia che blocca l'esecuzione se `stanchezza > 80`. `handleMotorino` non ha questa guardia, permettendo di truccare il motorino con stanchezza massima.

### Modifica da Applicare

All'interno di `handleMotorino`, dopo il controllo `soldi < 50`, aggiungere:

```typescript
if (s.stanchezza > 80) {
  playSound.failure()
  announce('Sei troppo DISTRUTTO per trafficare col motorino! Riposa prima!')
  return
}
```

Il blocco va inserito esattamente dopo:
```typescript
if (s.soldi < 50) {
  playSound.failure()
  announce('Non hai abbastanza GRANA per truccare il motorino! Servono 50€')
  return
}
// ← INSERIRE QUI
playSound.buttonClick()
```

**Aggiornare anche il pulsante in `App.tsx`**: nella prop `disabled` del `ActionButton` per "Motorino", aggiungere la condizione `|| stats.stanchezza > 80` e aggiornare `blockedReason` con un messaggio coerente.

---

## PRIORITÀ 5 — Annuncio soldi errato nella perdita gara motorino

### File: `src/hooks/useEventEngine.ts`

### Problema

Quando il giocatore perde la gara, il messaggio di `announce` dice sempre `-80 Soldi (scommessa)` anche se il giocatore ne aveva meno di 80 (in quel caso `clampStat` porta il saldo a 0 ma la perdita reale è inferiore). Il messaggio è fuorviante.

### Comportamento Attuale (ERRATO)

```typescript
// Nella sezione sconfitta di handleStreetRaceAccetta:
announce('Hai PERSO la gara! Che SCHIFO! -20 Figosità, -15 Coattaggine, -80 Soldi (scommessa)')
```

### Modifica da Applicare

Calcolare la perdita reale prima dell'aggiornamento di stato e usarla nel messaggio:

```typescript
const handleStreetRaceAccetta = useCallback(() => {
  setShowStreetRaceEvent(false)
  if (randomChance(raceWinChanceRef.current)) {
    playSound.bigWin()
    setStats((current) => ({
      ...current,
      coattaggine: clampStat(current.coattaggine + 25),
      figosita: clampStat(current.figosita + 20),
      soldi: clampStat(current.soldi + 150, 0, 1000)
    }))
    announce('Hai VINTO la gara! Sei una LEGGENDA! +25 Coattaggine, +20 Figosità, +150 Soldi')
  } else {
    playSound.bigLoss()
    // Calcolo perdita reale prima di clampare
    const actualLoss = Math.min(80, statsRef.current.soldi)
    setStats((current) => ({
      ...current,
      figosita: clampStat(current.figosita - 20),
      coattaggine: clampStat(current.coattaggine - 15),
      soldi: clampStat(current.soldi - 80, 0, 1000)
    }))
    announce(`Hai PERSO la gara! Che SCHIFO! -20 Figosità, -15 Coattaggine, -${actualLoss} Soldi (scommessa)`)
  }
}, [setStats, announce])
```

---

## PRIORITÀ 6 — `handleCorrompi` usa chiave interna materia invece di display name

### File: `src/hooks/useGameActions.ts`

### Problema

Il messaggio di announce usa `randomSubject.toUpperCase()` che produce stringhe come `GESTAZIEND` o `EDOFISICA` invece dei nomi leggibili.

### Modifica da Applicare

Nella funzione `handleCorrompi`, sostituire la riga dell'announce:

```typescript
// PRIMA (errato):
announce(`MAZZETTA al prof di ${randomSubject.toUpperCase()}! +2 al voto, -100 Soldi. EZPZ!`)

// DOPO (corretto):
announce(`MAZZETTA al prof di ${getSubjectDisplayName(randomSubject)}! +2 al voto, -100 Soldi. EZPZ!`)
```

**Verificare** che `getSubjectDisplayName` sia già importato nel file (lo è, da `@/lib/types`).

---

## Checklist di Verifica Post-Fix

Dopo aver applicato tutte le modifiche, Copilot deve verificare i seguenti comportamenti prima di fare commit:

### Test 1 — Crash gara motorino
1. Avvia partita, vai in social → trucca il motorino
2. Quando appare l'evento "Un TAMARRO ti sfida", premi **Rifiuta**
3. **Atteso:** il dialog si chiude, appaiono i messaggi di penalità, nessun crash

### Test 2 — Reset fasce al nuovo giorno
1. Consuma tutte le azioni disponibili
2. Premi Riposa → il giorno avanza
3. **Atteso:** `currentPhase` nella TimeDisplay mostra `Mattina`, `phaseActionsRemaining` mostra il valore corretto per il tipo di giorno (feriale: 2, sabato: 2, domenica: 1)

### Test 3 — Riposa consuma azione
1. Con azioni > 0, premi Riposa
2. **Atteso:** il contatore azioni scende di 1, la stanchezza scende di 40

### Test 4 — Motorino bloccato con stanchezza alta
1. Porta la stanchezza sopra 80 (lavora più volte)
2. Vai in Sociale → premi Motorino
3. **Atteso:** il pulsante è disabilitato e/o appare il messaggio di blocco

### Test 5 — Messaggio soldi gara
1. Porta il personaggio a meno di 80 soldi
2. Accetta la gara motorino e perdila
3. **Atteso:** il messaggio mostra la perdita reale (es. `-45 Soldi`) non sempre `-80 Soldi`

### Test 6 — Nome materia nella corruzione
1. Vai in Scuola → premi Corrompi
2. **Atteso:** il toast mostra "MAZZETTA al prof di Matematica!" (o altra materia con nome leggibile), non "MATEMATICA" o "GESTAZIEND"

---

## Note Tecniche per Copilot

- **Non modificare `src/lib/time-utils.ts`**: la logica di `DAY_PHASE_CONFIG` e `PHASE_SEQUENCE` è corretta e non richiede interventi.
- **Non modificare `src/lib/types.ts`**: le interfacce `GameTime`, `GameTimeV2`, `DayPhase`, `DayType` sono già definite correttamente.
- **Non creare nuovi file**: tutte le modifiche sono contenute nei file esistenti indicati.
- **Mantenere i `useCallback` con i corretti array di dipendenze**: ogni modifica che aggiunge una nuova dipendenza (es. `consumeAction`) deve riflettersi nell'array `[...]` finale del callback.
- **Non alterare la logica di `advancePhaseOnly`**: funziona correttamente per l'avanzamento manuale della fascia; il problema riguarda solo `advanceToNextDay`.
- **Ordine dei commit suggerito**: un commit per ogni priorità, con messaggio descrittivo (es. `fix: chiudi dialog gara prima di setStats per evitare crash`).

