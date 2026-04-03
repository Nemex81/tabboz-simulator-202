# Piano di Correzione V3 — Tabboz Simulator
**Data:** 2026-04-03  
**Baseline:** Piano V2 completamente applicato, 0 errori TypeScript  
**Fonte anomalie:** Test manuale post-V2  

---

## Indice

1. [Analisi diagnostica stato corrente](#1-analisi-diagnostica)
2. [Anomalia A1 — Riposa disponibile nella mattina scolastica](#a1)
3. [Anomalia A2 — Interrogazione/verifica non vincolate alla mattina scolastica](#a2)
4. [Anomalia A3 — Eventi mattina paralleli agli eventi fissi della giornata](#a3)
5. [Anomalia A4 — Incremento intelligenza non decimale + voto non proporzionale](#a4)
6. [Anomalia A5 — Pool eventi mattina limitato a 3 (target: 6)](#a5)
7. [Anomalia A6 — Azione "Dormi" mancante (sera/notte)](#a6)
8. [Anomalia A7 — Riposa: recupero parziale + disponibilità ristretta](#a7)
9. [Anomalia A8 — Azioni sociali a pagamento troppo numerose](#a8)
10. [Anomalia A9 — Atipa richiede 80€ (da rimuovere)](#a9)
11. [Ordine di applicazione](#ordine)
12. [Checklist di test](#test)

---

## 1. Analisi Diagnostica

### File coinvolti

| File | Ruolo | Anomalie trovate |
|---|---|---|
| `src/hooks/useGameActions.ts` | Tutti gli handler azioni | A1, A4, A7, A8, A9 |
| `src/hooks/useEventEngine.ts` | Handler eventi random (Atipa, etc.) | A9 |
| `src/lib/phase-actions.ts` | Mappa azioni per fascia oraria | A1, A7, A8 |
| `src/lib/school-morning-events.ts` | Pool eventi mattina scolastica | A2, A5 |
| `src/lib/game-utils.ts` | `calculateStudyGradeIncrease` | A4 |
| `src/hooks/useGameTime.ts` | `advancePhaseOnly`, `drawSchoolMorningEvents(3)` | A3, A5 |
| `src/App.tsx` | UI, disabled logic, drawSchoolMorningEvents (init) | A3, A5, A6, A7, A8, A9 |

### Situazione attuale rilevante

**`handleRiposa` (useGameActions.ts ~riga 375):**
```typescript
const handleRiposa = useCallback(() => {
  if (phaseActionsRemainingRef.current <= 0) { return }
  // ❌ MANCA: nessun blocco per feriale+mattina+isSchoolPeriod
  setStats(...stanchezza - 40...)
  consumeAction()
  announce('Hai riposato un po\'! -40 Stanchezza')
}, ...)
```

**`calculateStudyGradeIncrease` (game-utils.ts ~riga 95):**
```typescript
export const calculateStudyGradeIncrease = (intelligenza: number, hasFriendBonus: boolean = false): number => {
  const baseIncrease = 0.2 * (intelligenza / 50)  // → 0.04..0.4 ✅ proporzionale
  const friendMultiplier = hasFriendBonus ? 1.5 : 1
  return Number((baseIncrease * friendMultiplier).toFixed(1))
}
```

**`handleStudySubject` — intelligenzaGain (useGameActions.ts ~riga 265):**
```typescript
const intelligenzaGain = Math.floor(Math.random() * 3) + 1  // ❌ 1, 2, 3 (interi, no decimali)
```

**`drawSchoolMorningEvents` — chiamate (useGameTime.ts + App.tsx):**
```typescript
drawSchoolMorningEvents(3)  // ❌ target: 6
```

**`handleAtipaProva` — costo 80€ (useEventEngine.ts ~riga 330):**
```typescript
// ❌ Su successo scala 80€
setStats((current) => ({
  ...current,
  figosita: clampStat(current.figosita + 20),
  coattaggine: clampStat(current.coattaggine + 10),
  soldi: clampStat(current.soldi - 80, 0, 1000)  // ← DA RIMUOVERE
}))
announce(`${name} ha detto SÌ! Uscita EPICA! +20 Figosità, +10 Coattaggine, -80 Soldi`)
```

**App.tsx btn Atipa:**
```typescript
disabled={phaseActionsRemaining <= 0 || stats.soldi < 80}  // ← stats.soldi < 80 DA RIMUOVERE
blockedReason={... : 'Servono almeno 80€'}  // ← DA RIMUOVERE
```

**PHASE_ACTIONS feriale.mattina:**
```typescript
mattina: [
  { id: 'riposa', label: 'Sei a scuola! (salta per oggi)' },  // ← ancora presente, con label ambigua
],
```

---

## A1 — Riposa NON disponibile nella mattina feriale scolastica {#a1}

### Problema
`handleRiposa` è eseguibile durante `feriale+mattina+isSchoolPeriod`. Manca il blocco esplicito nell'handler. Inoltre `PHASE_ACTIONS.feriale.mattina` contiene ancora `{ id: 'riposa' }` con label sbagliata ("Sei a scuola!"), che induce confusione.

### Strategia
1. Aggiungere guard in `handleRiposa` per bloccare `feriale+mattina+isSchoolPeriod`.
2. Rimuovere completamente `riposa` da `PHASE_ACTIONS.feriale.mattina` (la mattina scolastica è gestita da `SchoolMorningPanel`; non ci sono azioni libere).
3. Aggiornare `App.tsx`: il button "Riposa" deve essere `disabled` anche quando `dayType==='feriale' && currentPhase==='mattina' && gameTime.schoolYear.isSchoolPeriod`.

### Patch — `src/hooks/useGameActions.ts`

```typescript
const handleRiposa = useCallback(() => {
  if (phaseActionsRemainingRef.current <= 0) {
    playSound.failure()
    announce('Hai esaurito le azioni per questa fascia oraria!')
    return
  }
  // A1: riposa non disponibile durante la mattina scolastica
  const gt = gameTimeRef.current
  if (dayTypeRef.current === 'feriale' && currentPhaseRef.current === 'mattina' && gt.schoolYear.isSchoolPeriod) {
    playSound.failure()
    announce('Sei a scuola! Non puoi riposare adesso.')
    return
  }
  // A7: limite fascia - solo pomeriggio e mattina festivi/sabato/domenica
  const ph = currentPhaseRef.current
  const dt = dayTypeRef.current
  const isRestAllowed = ph === 'pomeriggio' || (ph === 'mattina' && dt !== 'feriale')
  if (!isRestAllowed) {
    playSound.failure()
    announce('Il riposo parziale è disponibile solo al pomeriggio (o la mattina nei giorni non scolastici)!')
    return
  }
  playSound.buttonClick()
  // A7: recupero parziale 25-35% di stanchezza
  const recoveryPct = 0.25 + Math.random() * 0.10
  setStats((current) => ({
    ...current,
    stanchezza: clampStat(current.stanchezza - Math.round(current.stanchezza * recoveryPct))
  }))
  consumeAction()
  announce(`Hai riposato un po\'! Recuperato il ${Math.round(recoveryPct * 100)}% di Stanchezza`)
}, [setStats, consumeAction, announce])
```

### Patch — `src/lib/phase-actions.ts`

```typescript
feriale: {
  mattina: [
    // Mattina feriale scolastica: NESSUNA azione libera
    // La UI mostra SchoolMorningPanel invece del pannello azioni
  ],
  ...
}
```

---

## A2 — Interrogazione/verifica restano vincolate alla mattina scolastica {#a2}

### Problema
Gli eventi `sm_interrogazione_a_sorpresa` e `sm_verifica_a_sorpresa` sono già **correttamente in `SchoolMorningPanel`** (che si mostra solo se `feriale+mattina+isSchoolPeriod`). ✅ Nessun bug strutturale qui.

Il problema effettivo è che `shouldTriggerSurpriseQuiz()` in `handleStudySubject` può triggerare una "verifica a sorpresa" anche di pomeriggio o sera mentre si studia — il che è concettualmente corretto (la verifica riguarda il prossimo giorno), ma può confondersi con gli eventi mattutini.

### Strategia
- **NonModificare** la logica esistente `shouldTriggerSurpriseQuiz` in studySubject — è un evento futuro, non una verifica in corso.
- Rinominare il messaggio e il tooltip per chiarire: "Una verifica sorpresa è stata programmata per domani!" invece di lasciarlo ambiguo.
- Aggiungere commento nel codice per esplicitare che gli eventi `SchoolMorningPanel` sono già vincolati alla fascia corretta.

### Patch — `src/hooks/useGameActions.ts` (handleStudySubject)

```typescript
// esistente — aggiornare solo il testo dell'announce
if (shouldTriggerSurpriseQuiz() && gt.schoolYear.isSchoolPeriod) {
  // ...
  announce(`ATTENZIONE: il prof ha annunciato una verifica a sorpresa domani in ${getSubjectDisplayName(surpriseSubject)}! Risultato preliminare: ${quizResult.message}`)
}
```

---

## A3 — Eventi mattina paralleli agli eventi fissi della giornata {#a3}

### Problema
Il `SchoolMorningPanel` (eventi narrativi mattutini) viene mostrato **al posto** del pannello azioni standard. Gli eventi fissi della giornata (`advanceToNextDay` → teacher event, paghetta, programmed exams) avvengono al cambio giorno. Non c'è conflitto diretto, ma l'architettura attuale fa sì che:
1. La UI del tab "school" mostri solo `SchoolMorningPanel` (bloccante) finché non si preme "Fine mattina".
2. Non è possibile accedere agli altri pannelli del gioco durante la mattina scolastica.

### Strategia
- Il `SchoolMorningPanel` rimane nella tab "school" come primo elemento, ma **non blocca la navigazione agli altri tab** (amici, fidanzata, dashboard, ecc.).
- Aggiungere una nota UI che indica "Hai X eventi mattutini da gestire" quando `showSchoolMorning === true`.
- Gli eventi fissi (esami programmati, teacher events, ecc.) rimangono in `advanceToNextDay` — sono temporalmente separati (fine giornata → inizio nuova):
  - `advanceToNextDay` = eventi che scattano quando passi al **giorno successivo** (sera→notte→fine)
  - `SchoolMorningPanel` = eventi che scattano **all'inizio del mattino** del nuovo giorno → già paralleli, non si sovrappongono.
- **Nessun conflitto reale** — l'architettura è già corretta. L'unica modifica UTC: rendere `SchoolMorningPanel` non bloccante sulla navigazione tra tab (già così — non usa `modal`, non impedisce cambio tab).

### Verifica
- `SchoolMorningPanel` è renderizzato **dentro** `<TabsContent value="school">`, non come overlay dell'intera pagina.
- L'utente può navigare sugli altri tab liberamente.
- ✅ Non serve alcuna modifica strutturale; serve solo verificare che la UI non crei l'impressione di blocco.

---

## A4 — Incremento intelligenza decimale + voto proporzionale a intelligenza {#a4}

### Problema

**Intelligenzagain:** attualmente `Math.floor(Math.random() * 3) + 1` → 1, 2 o 3 punti interi.  
Il target è `0.0X` (decimali minimi, tipo 0.01–0.05).

**Incremento voto:** già proporzionale (`0.2 * intelligenza/50`) ma il risultato viene arrotondato a 1 decimale, perdendo la granularità bassa. Con `intelligenza=10` → `0.04` che diventa `0.0` dopo `toFixed(1)`.

### Strategia

1. Cambiare `intelligenzaGain` in un valore decimale: `0.01 + (intelligenza / 100) * 0.04`  
   → a intelligenza=10 guadagni 0.01, a intelligenza=100 guadagni 0.05.
2. Modificare `calculateStudyGradeIncrease` per usare 2 decimali invece di 1:  
   `Number((baseIncrease * friendMultiplier).toFixed(2))` — evita l'azzeramento a bassa intelligenza.
3. Aggiornare `announce` per mostrare il guadagno correttamente formattato.

### Patch — `src/lib/game-utils.ts`

```typescript
export const calculateStudyGradeIncrease = (intelligenza: number, hasFriendBonus: boolean = false): number => {
  const baseIncrease = 0.2 * (intelligenza / 50)
  const friendMultiplier = hasFriendBonus ? 1.5 : 1
  return Number((baseIncrease * friendMultiplier).toFixed(2))  // ← 2 decimali
}
```

### Patch — `src/hooks/useGameActions.ts` (handleStudySubject)

```typescript
// PRIMA:
const intelligenzaGain = Math.floor(Math.random() * 3) + 1

// DOPO:
const intelligenzaGain = Number((0.01 + (statsRef.current.intelligenza / 100) * 0.04).toFixed(2))
```

E nel `setStats`:
```typescript
setStats((current) => ({
  ...current,
  stanchezza: clampStat(current.stanchezza + 20),
  coattaggine: clampStat(current.coattaggine - 5),
  intelligenza: clampStat(current.intelligenza + intelligenzaGain)
}))
```

Nota: `intelligenza` in `GameStats` è `number`, ma `clampStat` usa `Math.max/min` sul valore numerico — funziona anche con decimali. Tuttavia mostrare 50.12 come intelligenza può sembrare strano. Soluzione: incrementare l'intelligenza in centesimi internamente, oppure sommare e lasciare che si accumuli lentamente. Consiglio: mantenere l'intelligenza come un numero intero nella visualizzazione ma permettere accumulo tramite una soglia (ogni 1.0 accumulati = +1 intero). **Più semplice** e coerente con il design attuale: tenere il guadagno piccolo ma lasciare il calcolo come `Number` standard. Il clamping attuale `clampStat(stat, 0, 100)` funziona correttamente con valori decimali.

---

## A5 — Pool eventi mattina: 3 → 6 {#a5}

### Problema
`drawSchoolMorningEvents(3)` chiamato in due posti:
1. `src/hooks/useGameTime.ts` — `advancePhaseOnly` quando entra in mattina feriale
2. `src/App.tsx` — `useEffect` init al caricamento della pagina

### Patch

Entrambi i posti: `drawSchoolMorningEvents(3)` → `drawSchoolMorningEvents(6)`

---

## A6 — Nuova azione "Dormi" (sera + notte) {#a6}

### Requisiti
- Disponibile in: `sera` e `notte`
- Effetto sera: ripristino stanchezza al 100% (stanchezza → 0) + avanza al mattino successivo
- Effetto notte (es. dopo lavoro buttafuori): ripristino stanchezza all'80% (stanchezza *= 0.2) + avanza al mattino successivo
- In entrambi i casi: chiama `advanceToNextDay()` dopo il recupero

### File da modificare
1. `src/lib/types.ts` — aggiungere `'dormi'` all'unione `ActionId` in `phase-actions.ts`
2. `src/lib/phase-actions.ts` — aggiungere `{ id: 'dormi', label: 'Vai a dormire' }` a `feriale.sera`, `feriale.notte`, `sabato.sera`, `sabato.notte`, `domenica.sera`, `domenica.notte`, `festivo.sera`, `festivo.notte`
3. `src/hooks/useGameActions.ts` — aggiungere `handleDormi`, aggiungere `advanceToNextDay` ai parametri
4. `src/App.tsx` — esporre `handleDormi`, aggiungere button UI, passare `advanceToNextDay` al hook

### Patch — `src/hooks/useGameActions.ts`

```typescript
// Interfaccia: aggiungere advanceToNextDay
interface UseGameActionsParams {
  // ...
  advanceToNextDay: () => void  // ← NUOVO per handleDormi
}

// Handler:
const handleDormi = useCallback(() => {
  if (phaseActionsRemainingRef.current <= 0) {
    playSound.failure()
    announce('Hai esaurito le azioni per questa fascia oraria!')
    return
  }
  const phase = currentPhaseRef.current
  if (phase !== 'sera' && phase !== 'notte') {
    playSound.failure()
    announce('Puoi dormire solo la sera o di notte!')
    return
  }
  playSound.buttonClick()
  const isNight = phase === 'notte'
  setStats((current) => {
    const recovery = isNight ? Math.round(current.stanchezza * 0.80) : current.stanchezza
    return { ...current, stanchezza: clampStat(current.stanchezza - recovery) }
  })
  const msg = isNight
    ? 'Sei crollato di notte! Riposo parziale (80%). Ci si vede domani!'
    : 'Dormi come un ghiro! Stanchezza AZZERATA. Buonanotte!'
  announce(msg)
  playSound.success()
  advanceToNextDay()
}, [setStats, announce, advanceToNextDay])
```

### Patch — `src/lib/phase-actions.ts`

Aggiungere `'dormi'` a `ActionId` e aggiungere l'entry in `*.sera` e `*.notte` per tutti i DayType (`feriale`, `sabato`, `domenica`, `festivo`):

```typescript
export type ActionId =
  | ... (esistenti)
  | 'dormi'  // ← NUOVO

// Nelle sera di ogni DayType:
{ id: 'dormi', label: 'Vai a dormire (recupero totale)' }

// Nelle notte di ogni DayType (sostituisce il vecchio riposa notturno):
{ id: 'dormi', label: 'Dormi (recupero 80%)' }
```

---

## A7 — Riposa: recupero parziale 25-35%, disponibilità ristretta {#a7}

### Requisiti
- **Effetto:** recupera tra il 25% e il 35% della stanchezza attuale (non un valore fisso)
- **Disponibilità:** solo in `pomeriggio` (tutti i tipi) + `mattina` nei giorni festivi/sabato/domenica (non feriale)
- Rimuovere `riposa` da `sera` e `notte` di tutti i DayType (sostituito da `dormi`)

### Patch — `src/hooks/useGameActions.ts` (vedi A1 per il codice completo)

Il recovery con percentuale è già incluso nel patch A1:
```typescript
const recoveryPct = 0.25 + Math.random() * 0.10  // 25-35%
stanchezza: clampStat(current.stanchezza - Math.round(current.stanchezza * recoveryPct))
```

### Patch — `src/lib/phase-actions.ts`

```typescript
// Rimuovere da:
feriale.sera    → no riposa (sostituito da dormi)
feriale.notte   → no riposa (sostituito da dormi)
sabato.sera     → no riposa
sabato.notte    → no riposa
domenica.sera   → lasciare (è domenica, giorno non scolastico) ← ECCEZIONE
domenica.notte  → no riposa (sostituito da dormi)
festivo.sera    → no riposa
festivo.notte   → no riposa (sostituito da dormi)

// Aggiungere/mantenere:
feriale.pomeriggio  → { id: 'riposa', label: 'Riposa un po\' (25-35% stanchezza)' }
sabato.mattina      → ✅ già presente
domenica.mattina    → ✅ già presente
festivo.mattina     → ✅ già presente
domenica.pomeriggio → aggiungere riposa
sabato.pomeriggio   → aggiungere riposa
festivo.pomeriggio  → aggiungere riposa
```

---

## A8 — Aggiungere azioni sociali gratuite {#a8}

### Requisiti
Rendere più numerose le azioni **sociali senza costo monetario**, specialmente di interazione con persone.

### Nuove azioni proposte (tutte gratuite, consumano 1 azione di fase)

| Id | Label | Fascia | Effetto |
|---|---|---|---|
| `chiacchiera` | Chiacchiera con qualcuno | pomeriggio, sera | +5 Carisma, +3 Reputazione, chance amico |
| `parco` | Giro al parco | pomeriggio (feriale, sabato, domenica, festivo) | +5 Carisma, -5 Stanchezza, chance amico/relazione |
| `telefona` | Telefona agli amici | pomeriggio, sera | +3 Carisma, consolida amicizie esistenti |
| `studia_gruppo` | Studia in gruppo | pomeriggio (periodo scolastico) | +0.1 voto random, +4 Intelligenza decimale |

### File da modificare
1. `src/lib/phase-actions.ts` — `ActionId` + entries per fascia
2. `src/hooks/useGameActions.ts` — handler per ciascuna
3. `src/App.tsx` — bottoni UI nel tab "social"

### Patch — `src/lib/phase-actions.ts`

```typescript
export type ActionId = ... | 'chiacchiera' | 'parco' | 'telefona' | 'studia_gruppo'

feriale.pomeriggio → aggiungere:
  { id: 'parco', label: 'Giro al parco' },
  { id: 'chiacchiera', label: 'Chiacchiera in giro' },

feriale.sera → aggiungere:
  { id: 'telefona', label: 'Telefona a qualcuno' },
  { id: 'chiacchiera', label: 'Chiacchiera col vicino' },

sabato.pomeriggio → aggiungere parco, chiacchiera
sabato.mattina → aggiungere parco
domenica.pomeriggio → aggiungere chiacchiera, telefona
festivo → aggiungere parco, chiacchiera
```

### Patch — `src/hooks/useGameActions.ts`

```typescript
const handleChiacchiera = useCallback(() => {
  if (phaseActionsRemainingRef.current <= 0) { playSound.failure(); announce('...'); return }
  playSound.buttonClick()
  setStats((current) => ({
    ...current,
    carisma: clampStat(current.carisma + 5),
    reputazione: clampStat(current.reputazione + 3),
    stanchezza: clampStat(current.stanchezza + 5)
  }))
  consumeAction()
  announce('Hai chiacchierato con qualcuno! +5 Carisma, +3 Reputazione')
  checkForNewFriend('in giro per il paese')
  checkForNewRelationship()
}, [setStats, consumeAction, announce, checkForNewFriend, checkForNewRelationship])

const handleParco = useCallback(() => {
  if (phaseActionsRemainingRef.current <= 0) { playSound.failure(); announce('...'); return }
  playSound.buttonClick()
  setStats((current) => ({
    ...current,
    carisma: clampStat(current.carisma + 5),
    stanchezza: clampStat(current.stanchezza - 5),
    reputazione: clampStat(current.reputazione + 2)
  }))
  consumeAction()
  announce('Giro rilassante al parco! +5 Carisma, -5 Stanchezza, +2 Reputazione')
  checkForNewFriend('al parco')
  checkForNewRelationship()
  checkForNewGirlfriend()
}, [setStats, consumeAction, announce, checkForNewFriend, checkForNewRelationship, checkForNewGirlfriend])

const handleTelefona = useCallback(() => {
  if (phaseActionsRemainingRef.current <= 0) { playSound.failure(); announce('...'); return }
  if (friendsRef.current.length === 0) {
    playSound.failure()
    announce('Non hai amici da chiamare! Esci e socializza prima.')
    return
  }
  playSound.buttonClick()
  setStats((current) => ({
    ...current,
    carisma: clampStat(current.carisma + 3),
  }))
  const randomFriend = friendsRef.current[Math.floor(Math.random() * friendsRef.current.length)]
  consumeAction()
  announce(`Hai chiamato ${randomFriend.name}! Bella chiacchierata. +3 Carisma`)
}, [setStats, consumeAction, announce])
```

---

## A9 — Atipa: rimuovere costo 80€ {#a9}

### Problema
1. `handleProvarciConAtipa` (avvio) non scala soldi, ma App.tsx mostra il pulsante disabled se `soldi < 80`.
2. `handleAtipaProva` (successo) scala 80€: `soldi: clampStat(current.soldi - 80, 0, 1000)`.
3. `handleAtipaRinuncia` non scala soldi ✅.

Il rifiuto dovrebbe penalizzare solo **figosità e carisma**, senza soldi.

### Patch — `src/hooks/useEventEngine.ts`

```typescript
// handleAtipaProva — SUCCESSO: rimuovere soldi
// PRIMA:
setStats((current) => ({
  ...current,
  figosita: clampStat(current.figosita + 20),
  coattaggine: clampStat(current.coattaggine + 10),
  soldi: clampStat(current.soldi - 80, 0, 1000)  // ← DA RIMUOVERE
}))
announce(`${name} ha detto SÌ! Uscita EPICA! +20 Figosità, +10 Coattaggine, -80 Soldi`)

// DOPO:
setStats((current) => ({
  ...current,
  figosita: clampStat(current.figosita + 20),
  coattaggine: clampStat(current.coattaggine + 10),
  carisma: clampStat(current.carisma + 5)
}))
announce(`${name} ha detto SÌ! +20 Figosità, +10 Coattaggine, +5 Carisma`)
```

```typescript
// handleAtipaRinuncia — perdita figosità su rifiuto
// PRIMA:
setStats((current) => ({ ...current, coattaggine: clampStat(current.coattaggine - 5) }))
announce('Hai CAGATO sotto! -5 Coattaggine')

// DOPO — rimane invariato, era già senza soldi ✅
```

### Patch — `src/App.tsx` (bottone Atipa)

```typescript
// PRIMA:
disabled={phaseActionsRemaining <= 0 || stats.soldi < 80}
blockedReason={phaseActionsRemaining <= 0 ? '...' : 'Servono almeno 80€'}

// DOPO:
disabled={phaseActionsRemaining <= 0}
blockedReason={'Nessuna azione per questa fascia oraria'}
ariaLabel="Prova a rimorchiare un'atipa. Se rifiuta perdi un po' di Figosità e Carisma; se accetta guadagni entrambi."
```

> **Nota:** anche il guard in `handleProvarciConAtipa` (useEventEngine.ts) usa ancora `gt.actionsRemaining === 0` (non aggiornato in V2 perché è in useEventEngine, separato da useGameActions). Aggiornare anche quello a `phaseActionsRemaining`.

---

## Ordine di applicazione consigliato {#ordine}

```
1. src/lib/game-utils.ts
   → A4: calculateStudyGradeIncrease usa toFixed(2)

2. src/lib/phase-actions.ts
   → A1: rimuovi riposa da feriale.mattina (array vuoto)
   → A6: aggiungi 'dormi' a ActionId + entries in sera/notte tutti i DayType
   → A7: rimuovi riposa da sera/notte; mantieni solo pomeriggio + mattina non feriale
   → A8: aggiungi chiacchiera/parco/telefona a ActionId + entries per fascia

3. src/hooks/useGameActions.ts
   → A1: guard handleRiposa per mattina feriale + cambio recovery a percentuale A7
   → A4: intelligenzaGain decimale in handleStudySubject
   → A6: aggiungere handleDormi + advanceToNextDay al params interface
   → A8: aggiungere handleChiacchiera, handleParco, handleTelefona

4. src/hooks/useEventEngine.ts
   → A9: rimuovere soldi da handleAtipaProva
   → A9: aggiornare guard da actionsRemaining a phaseActionsRemaining

5. src/hooks/useGameTime.ts
   → A5: drawSchoolMorningEvents(3) → drawSchoolMorningEvents(6)

6. src/App.tsx
   → A1: aggiornare disabled logic per handleRiposa
   → A5: drawSchoolMorningEvents(3) → drawSchoolMorningEvents(6) (init useEffect)
   → A6: passare advanceToNextDay a useGameActions + esporre handleDormi + button UI
   → A8: aggiungere pulsanti chiacchiera, parco, telefona nel tab social
   → A9: rimuovere stats.soldi < 80 dal disabled/blockedReason di Atipa
```

---

## Checklist di Test {#test}

- [ ] **T1** — Mattina feriale+isSchoolPeriod: bottone "Riposa" è disabilitato con tooltip corretto.
- [ ] **T2** — Pomeriggio feriale: bottone "Riposa" disponibile; recupera 25-35% della stanchezza corrente.
- [ ] **T3** — Sabato mattina: bottone "Riposa" disponibile; recupera 25-35%.
- [ ] **T4** — Sera qualsiasi: bottone "Dormi" disponibile; stanchezza → 0 e si avanza al giorno successivo.
- [ ] **T5** — Notte (dopo lavoro): bottone "Dormi" disponibile; stanchezza ridotta dell'80% e si avanza.
- [ ] **T6** — Studiare con intelligenza=20: incremento voto ~0.08, intelligenzaGain ~0.01-0.02.
- [ ] **T7** — Studiare con intelligenza=80: incremento voto ~0.32, intelligenzaGain ~0.04.
- [ ] **T8** — SchoolMorningPanel mostra fino a 6 eventi (se la probabilità li genera).
- [ ] **T9** — Atipa: il pulsante non richiede 80€ (sempre disponibile se c'è stanchezza/phase OK).
- [ ] **T10** — Atipa rifiuto: perdi figosità e carisma, NON soldi.
- [ ] **T11** — Atipa successo: guadagni figosità, coattaggine e carisma, NON perdi soldi.
- [ ] **T12** — Azioni parco/chiacchiera/telefona disponibili senza costo monetario; aumentano carisma/reputazione.
- [ ] **T13** — Navigazione tra i tab possibile anche durante la mattina scolastica (SchoolMorningPanel non blocca).
- [ ] **T14** — 0 errori TypeScript dopo tutte le modifiche.
