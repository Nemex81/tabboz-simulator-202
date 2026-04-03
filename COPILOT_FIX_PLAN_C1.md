    # PIANO DI CORREZIONE COPILOT C1 — Regressione Sistemica post-V3+B1

**Repository:** Nemex81/tabboz-simulator-202 — Ramo: main  
**Generato da:** analisi completa su tutti i file sorgente (04/04/2026)  
**Dipendenze:** applicare DOPO COPILOT_FIX_PLAN_V3.md e B1

---

## RIEPILOGO ANOMALIE TROVATE

| ID | Severità | File | Descrizione breve |
|---|---|---|---|
| C1-1 | 🔴 CRITICA | App.tsx, useEventEngine.ts | `phaseActionsRemaining` non passato a `useEventEngine` → guard Atipa mai attivo |
| C1-2 | 🔴 CRITICA | App.tsx, useGameTime.ts | Pulsante "Dormi" disabilitato di notte (`maxActions=0`) → impossibile dormire |
| C1-3 | 🔴 CRITICA | useEventEngine.ts | `phaseActionsRemaining` in `handleProvarciConAtipa` è stale closure (no ref, non nelle deps) |
| C1-4 | 🟠 ALTA | App.tsx | 3 pannelli usano `gameTime.actionsRemaining` (legacy, mai decrementato) al posto di `phaseActionsRemaining` |
| C1-5 | 🟠 ALTA | useGameActions.ts | Azioni svago (palestra, lavoro, motorino, cinema, shopping) mancano guard mattina scolastica |
| C1-6 | 🟡 MEDIA | App.tsx | Dialog Atipa mostra ancora "Costa 80€" (costo rimosso in V3) |
| C1-7 | 🟡 MEDIA | phase-actions.ts, useGameActions.ts | `riposa` in `domenica.sera` nella mappa ma handler la blocca → incoerenza |
| C1-8 | 🟡 MEDIA | time-utils.ts | `nightRecovery` nei config mai applicato → dead config |

---

## FIX C1-1 — `phaseActionsRemaining` mancante nella chiamata `useEventEngine` in App.tsx

**File:** `src/App.tsx`  
**Priorità:** 🔴 CRITICA — il guard in `handleProvarciConAtipa` riceve `undefined`, il check `undefined <= 0` → `false`, l'Atipa è tentabile infinite volte

### Codice attuale (riga ~182):

```tsx
const events = useEventEngine({
    stats,
    setStats,
    friends,
    setFriends,
    relationships,
    setRelationships,
    girlfriend,
    setGirlfriend,
    gameTime,
    consumeAction,
    announce
  })
```

### Codice corretto:

```tsx
const events = useEventEngine({
    stats,
    setStats,
    friends,
    setFriends,
    relationships,
    setRelationships,
    girlfriend,
    setGirlfriend,
    gameTime,
    consumeAction,
    announce,
    phaseActionsRemaining,
  })
```

---

## FIX C1-2 — Pulsante "Dormi" disabilitato quando `phaseActionsRemaining === 0` (sempre a notte)

**File:** `src/App.tsx` (UI) + `src/hooks/useGameTime.ts` (handler)  
**Priorità:** 🔴 CRITICA — il giocatore non può MAI dormire di notte perché `maxActions=0` per tutte le notti in `DAY_PHASE_CONFIG`

### Problema architetturale

1. `time-utils.ts` definisce `notte.maxActions = 0` per tutti i DayType
2. Quando si avanza alla fase notte, `phaseActionsRemaining = 0`
3. Il pulsante Dormi in App.tsx ha `disabled={phaseActionsRemaining <= 0}` → **always disabled at night**
4. `handleDormi` in useGameTime.ts ha lo stesso guard `phaseActionsRemainingRef.current <= 0` → **handler blocca sempre**
5. L'unica opzione è "Avanza Fascia" che salta la notte senza recovery di stanchezza
6. Il `nightRecovery` nel config non è mai applicato → la stanchezza accumulata non si riduce mai automaticamente

### Fix parte A — `handleDormi`: rimuovere guard `phaseActionsRemaining`

L'azione "Dormi" è speciale: non è un'azione da slot, è una transizione di giornata. Non deve consumare azioni né essere bloccata da azioni esaurite.

**useGameTime.ts** — codice attuale (riga ~238):

```typescript
const handleDormi = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {
      playSound.failure()
      announce('Hai esaurito le azioni per questa fascia oraria!')
      return
    }
    const phase = currentPhaseRef.current
```

**Codice corretto:**

```typescript
// C1-FIX-2: dormi non è un'azione di fase — è una transizione di giornata
const handleDormi = useCallback(() => {
    const phase = currentPhaseRef.current
```

(Rimuovere intero blocco guard `phaseActionsRemainingRef.current <= 0`)

### Fix parte B — Pulsante "Dormi" in App.tsx

**Codice attuale (riga ~884):**

```tsx
<ActionButton
    icon={<Sparkle size={48} />}
    label="Dormi"
    onClick={handleDormi}
    disabled={phaseActionsRemaining <= 0}
    blockedReason="Nessuna azione per questa fascia oraria"
    variant="secondary"
    ariaLabel="Vai a dormire la sera (recupero totale) o di notte (recupero 80%) e passa al giorno successivo"
/>
```

**Codice corretto:**

```tsx
<ActionButton
    icon={<Sparkle size={48} />}
    label="Dormi"
    onClick={handleDormi}
    disabled={currentPhase !== 'sera' && currentPhase !== 'notte'}
    blockedReason="Puoi dormire solo la sera o di notte"
    variant="secondary"
    ariaLabel="Vai a dormire la sera (recupero totale) o di notte (recupero 80%) e passa al giorno successivo"
/>
```

---

## FIX C1-3 — `phaseActionsRemaining` stale closure in `handleProvarciConAtipa`

**File:** `src/hooks/useEventEngine.ts`  
**Priorità:** 🔴 CRITICA — la dipendenza non è in deps array, valore stale nel useCallback

### Problema

`handleProvarciConAtipa` usa `phaseActionsRemaining` (valore, non ref) ma la dipendenza non è in deps:

```typescript
const handleProvarciConAtipa = useCallback(() => {
    if (phaseActionsRemaining <= 0) {  // ← valore stale
      ...
    }
    ...
}, [consumeAction, announce])  // ← manca phaseActionsRemaining
```

### Soluzione

Aggiungere un ref per `phaseActionsRemaining` nel corpo di `useEventEngine`, e usarlo nel callback.

**Aggiungere dopo i ref esistenti (riga ~65):**

```typescript
const phaseActionsRemainingRef = useRef(phaseActionsRemaining)
phaseActionsRemainingRef.current = phaseActionsRemaining
```

**Modificare `handleProvarciConAtipa` (riga ~300):**

```typescript
const handleProvarciConAtipa = useCallback(() => {
    if (phaseActionsRemainingRef.current <= 0) {  // ← usa ref
```

Le dipendenze rimangono `[consumeAction, announce]` senza aggiunta.

---

## FIX C1-4 — Pannelli usano `gameTime.actionsRemaining` legacy al posto di `phaseActionsRemaining`

**File:** `src/App.tsx`  
**Priorità:** 🟠 ALTA — i pulsanti nei pannelli Esami, Relazioni e Fidanzata non si disabilitano mai (il contatore legacy non viene decrementato)

### Problema

`gameTime.actionsRemaining` proviene da `advanceGameTime()` che resetta a `maxActionsPerDay` ogni giorno.  
`consumeAction()` decrementa SOLO `phaseActionsRemaining`.  
Risultato: `gameTime.actionsRemaining` non scende mai → i disabled nei pannelli non si attivano.

### Fix — 3 sostituzioni in App.tsx

**ExamsPanel (riga ~1110):**

```tsx
// DA:
actionsRemaining={gameTime.actionsRemaining}
// A:
actionsRemaining={phaseActionsRemaining}
```

**RelationshipsPanel (riga ~1141):**

```tsx
// DA:
actionsRemaining={gameTime.actionsRemaining}
// A:
actionsRemaining={phaseActionsRemaining}
```

**GirlfriendPanel (riga ~1169):**

```tsx
// DA:
actionsRemaining={gameTime.actionsRemaining}
// A:
actionsRemaining={phaseActionsRemaining}
```

---

## FIX C1-5 — Guard mattina scolastica mancante su azioni tempo libero

**File:** `src/hooks/useGameActions.ts`  
**Priorità:** 🟠 ALTA — il giocatore può andare in palestra, lavorare, truccare il motorino, andare al cinema e fare shopping DURANTE le ore di scuola

### Problema

I seguenti handler NON hanno il guard `feriale + mattina + isSchoolPeriod`:
- `handlePalestra`
- `handleLavoro`
- `handleMotorino`
- `handleCinema`
- `handleShoppingMall`
- `handleTryRelationship`

Nota: `handleLampada` e `handleStudia` hanno già il guard. `handleCorrompi` e `handleMinaccia` sono azioni scolastiche e non richiedono il blocco.

### Fix — aggiungere guardia identica in ogni handler

Subito dopo il check `phaseActionsRemainingRef.current <= 0`, aggiungere in ciascuno:

```typescript
if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina' && gt.schoolYear.isSchoolPeriod) {
  playSound.failure()
  announce('Sei a scuola! Non puoi farlo adesso.')
  return
}
```

**Handlers da modificare:**

1. `handlePalestra` — dopo `if (phaseActionsRemainingRef.current <= 0)` (riga ~110)
2. `handleLavoro` — dopo `if (phaseActionsRemainingRef.current <= 0)` (riga ~165)
3. `handleMotorino` — dopo `if (phaseActionsRemainingRef.current <= 0)` (riga ~198)
4. `handleCinema` — dopo `if (phaseActionsRemainingRef.current <= 0)` (riga ~470)
5. `handleShoppingMall` — dopo `if (phaseActionsRemainingRef.current <= 0)` (riga ~510)
6. `handleTryRelationship` — dopo `if (phaseActionsRemainingRef.current <= 0)` (riga ~533)

Nota: `handleDisco` ha già un guard `currentPhase === 'mattina'` (generico, non solo feriale). È sufficiente perché la discoteca non ha senso di mattina in nessun giorno.

---

## FIX C1-6 — Testo dialog Atipa mostra ancora "Costa 80€"

**File:** `src/App.tsx`  
**Priorità:** 🟡 MEDIA — testo fuorviante dopo rimozione costo in V3/A9

### Codice attuale (riga ~1225):

```tsx
<AlertDialogAction onClick={handleAtipaProva} className="bg-accent border-2">
    <Heart size={24} weight="fill" className="mr-2" />
    PROVA! (Costa 80€)
</AlertDialogAction>
```

### Codice corretto:

```tsx
<AlertDialogAction onClick={handleAtipaProva} className="bg-accent border-2">
    <Heart size={24} weight="fill" className="mr-2" />
    PROVA! (Gratis)
</AlertDialogAction>
```

---

## FIX C1-7 — `riposa` in `domenica.sera` nella mappa azioni ma bloccata dall'handler

**File:** `src/lib/phase-actions.ts`  
**Priorità:** 🟡 MEDIA — incoerenza che confonde l'UI futura se PHASE_ACTIONS venisse usata

### Problema

`phase-actions.ts` → `domenica.sera` include:
```typescript
{ id: 'riposa', label: 'Riposati' },
```

Ma `handleRiposa` blocca se `phase !== 'pomeriggio'` e `phase !== 'mattina' (non feriale)`.

### Codice corretto — rimuovere `riposa` da `domenica.sera`:

```typescript
domenica: {
    ...
    sera: [
      { id: 'studia', label: 'Rivedi gli appunti', requiresSchoolPeriod: true },
      { id: 'dormi', label: 'Vai a dormire (recupero totale)' },
    ],
    ...
}
```

---

## FIX C1-8 — `nightRecovery` nei config mai applicato (dead config)

**File:** `src/lib/time-utils.ts`  
**Priorità:** 🟡 MEDIA — il config esiste ma nessun codice lo usa; la stanchezza non si riduce automaticamente di notte se il giocatore non usa "Dormi"

### Problema

`DAY_PHASE_CONFIG[*].notte.nightRecovery` è -20/-25/-30 a seconda del DayType, ma:
1. `advancePhaseOnly` non lo consume al passaggio notte→mattina
2. `advanceToNextDay` non lo applica

### Fix — applicare nightRecovery in `advancePhaseOnly` quando la transizione è notte→mattina

**File:** `src/hooks/useGameTime.ts`  
**Codice attuale in `advancePhaseOnly` (blocco `nextPhase === 'mattina'`):**

```typescript
if (nextPhase === 'mattina') {
    setRawGameTime((current) => {
        const newGt = advanceGameTime(current)
        const newDayType = getDayType(newGt.currentDate)
        setDayType(newDayType)
        setCurrentPhase('mattina')
        setPhaseActionsRemaining(DAY_PHASE_CONFIG[newDayType]['mattina'].maxActions)
        // ...
        return newGt
    })
}
```

**Codice corretto — aggiungere recovery automatica della stanchezza:**

```typescript
if (nextPhase === 'mattina') {
    // C1-FIX-8: applica nightRecovery quando il giocatore avanza senza dormire
    const nightConfig = DAY_PHASE_CONFIG[dayType]['notte']
    if (nightConfig.nightRecovery < 0) {
      setStats((current) => ({
        ...current,
        stanchezza: clampStat(current.stanchezza + nightConfig.nightRecovery) // nightRecovery è negativo
      }))
    }
    setRawGameTime((current) => {
        const newGt = advanceGameTime(current)
        // ... resto invariato
    })
}
```

**Nota:** servono `setStats` e `clampStat` come dipendenze extra per `advancePhaseOnly`.  
`setStats` deve essere aggiunto ai params di `useGameTime` (interface `UseGameTimeParams` e destructure della funzione).

---

## ORDINE DI APPLICAZIONE

1. **C1-1** (App.tsx) — aggiunta `phaseActionsRemaining` a `useEventEngine` call
2. **C1-3** (useEventEngine.ts) — ref per `phaseActionsRemaining` + fix closure
3. **C1-2** (useGameTime.ts + App.tsx) — fix dormi button & handler
4. **C1-4** (App.tsx) — 3 pannelli → `phaseActionsRemaining`
5. **C1-5** (useGameActions.ts) — guard mattina scolastica su 6 handlers
6. **C1-6** (App.tsx) — testo dialog Atipa
7. **C1-7** (phase-actions.ts) — rimuovi `riposa` da `domenica.sera`
8. **C1-8** (useGameTime.ts) — nightRecovery applicato

---

## CHECKLIST DI TEST C1

| Test | Azione | Risultato atteso |
|---|---|---|
| T-C1-1 | Cliccare "Atipa" con 0 azioni rimaste | Azione bloccata con messaggio |
| T-C1-2 | Raggiungere la fase `notte` e cliccare "Dormi" | Pulsante attivo, stanchezza ridotta 80%, avanza al giorno dopo |
| T-C1-3 | In sera (feriale, 1 azione), usare l'azione per altro | Sera esaurita, avanza a notte → dormi resta clickabile |
| T-C1-4 | Verificare esami tab: usare azioni fino a 0 | Pulsante "Prepara" si disabilita |
| T-C1-5a | Di mattina feriale scolastica, tentare Palestra | Bloccata: "Sei a scuola!" |
| T-C1-5b | Di mattina feriale estivo, tentare Palestra | Permessa normalmente |
| T-C1-6 | Aprire dialog Atipa | Pulsante dice "PROVA! (Gratis)" non "Costa 80€" |
| T-C1-7 | Domenica sera: azioni disponibili | Non compare "Riposati", solo "Studia" e "Dormi" |
| T-C1-8 | Raggiungere notte, NON dormire, usare "Avanza Fascia" | Stanchezza si riduce di 20-30 punti (nightRecovery) |

---

## NOTE STRUTTURALI (non bloccanti per questo piano)

1. **PHASE_ACTIONS è completamente orfano:** `getAvailableActions()` e la mappa non sono usati da App.tsx. I bottoni sono hardcoded. Questo va bene per ora ma impedisce la coerenza automatica fase/azioni. Migliorabile in una fase futura.

2. **`gameTime.actionsRemaining` e `maxActionsPerDay` sono legacy dead code:** `advanceGameTime()` resetta `actionsRemaining` ma nulla lo decrementa nel nuovo sistema. Rimozione suggerita in un refactoring futuro.

3. **`seededRandom()` vs `Math.random()`:** Gli eventi mattutini (`school-morning-events.ts`) usano `Math.random()` mentre il resto del gioco usa `seededRandom()` tramite `randomChance()`. Incoerenza minore.

4. **`handleRiposa` wrapper in App.tsx:** `const handleRiposa = () => actions.handleRiposa()` crea un wrapper non memoizzato, vanificando la memoizzazione del useCallback originale. Risolvibile destructurando direttamente.
