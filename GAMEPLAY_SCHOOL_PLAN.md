# Piano di Integrazione — Sistema Scolastico Gameplay

> **Data:** 5 Aprile 2026  
> **Stato:** Validato — Pronto per implementazione  
> **Obiettivo:** Rendere voti, assenze e condotta meccaniche attive e impattanti nel gameplay, garantendo tensione narrativa sostenuta e divertimento.  
> **Revisione:** v2 — Corretto dopo validazione contro codebase reale.

---

## Principio di Design

Il gioco vive sull'**ansia da media scolastica** — è la tensione narrativa centrale.
Se i voti non scendono mai in modo percepibile, le scelte del giocatore diventano irrilevanti.
Se scendono troppo in fretta, il gioco diventa frustrante.
L'obiettivo è una **curva di tensione sostenuta**, non un crollo improvviso.

---

## Regola Fondamentale — Scelta Scuola/Marinare

> **L'evento "andare a scuola" viene innescato SOLO premendo il pulsante "Vai a Scuola".**

Il giocatore ha sempre la libertà di scegliere se andare a scuola o marinare.

- **Vai a Scuola** → `wentToSchoolToday = true`, possibilità di eventi scolastici, nessun incremento assenze.
- **Marina** → `wentToSchoolToday = false`, `assenze += 2`, nessun evento scolastico quel giorno, guadagno libertà (uscite, azioni extra).
- **Assente giustificato** (opzione futura) → `assenze += 1`, nessun evento scolastico.

Nessun evento scolastico (interrogazioni, compiti, ecc.) può scattare se il giocatore non ha premuto "Vai a Scuola".

### Nota tecnica — Due flussi di eventi scolastici nel codebase

Il codice ha **due sistemi distinti** di eventi scolastici:

1. **SchoolMorningEvents** (`src/lib/school-morning-events.ts` → `drawSchoolMorningEvents`)  
   Triggerati da `handleVaiAScuola` in `App.tsx`. Rappresentano la mattinata scolastica (interrogazioni, compiti, vita di classe). Scattano **solo se il giocatore preme "Vai a Scuola"**.

2. **TeacherEvents** (`src/lib/school-events.ts` → `getTeacherEvent`)  
   Triggerati in `useGameTime.ts` → `advanceToNextDay` con 15% di probabilità. Sono eventi indipendenti (prof assente, progetto, ecc.).

Il piano deve operare su **entrambi i flussi**, non solo su uno.

### Nota tecnica — useEventEngine NON gestisce eventi scolastici

`useEventEngine.ts` gestisce **solo eventi cittadini** (metallari, polizia, gare motorini, bulli, rimorchio). Gli eventi scolastici passano da `useGameTime.ts` e `App.tsx`. Nessuno step di questo piano deve toccare `useEventEngine.ts`.

---

## Step 1 — Feedback Visivo Delta (Priorità Massima)

**Problema:** I cambiamenti a voti, condotta e assenze sono invisibili al giocatore.  
**Fix:** Dopo ogni evento che modifica queste statistiche, mostrare un toast dedicato con il delta esplicito.

**Formato toast:**
```
📉 Matematica: 5 → 3 | Media: 6.4 → 6.1 | Condotta: 8 → 7
```

**File coinvolti:** `App.tsx` → `handleSchoolEventChoice` (eventi teacher), `App.tsx` → `handleVaiAScuola` (eventi morning)  
**Dipendenze:** Nessuna — implementabile subito.

---

## Step 2 — Sistema Pesi Materie + Materia a Rischio

### Pesi per il calcolo della media

| Materia | Peso | Motivazione |
|---|---|---|
| Matematica | 1.5x | Materia fondamentale, molte ore |
| Italiano | 1.5x | Materia fondamentale, molte ore |
| Materia specifica scuola* | 1.3x | Caratterizzante dell'indirizzo |
| Inglese | 1.0x | Standard |
| Altre materie | 1.0x | Standard |
| Ed. Fisica | 0.5x | Minor peso reale |

*Informatica per Tecnico, Agronomia per Agraria, Disegno per Artistico.

### Meccanica "Materia a Rischio"

Quando una materia scende sotto **5**:
- Indicatore rosso/arancio visibile nella UI accanto alla materia.
- Probabilità **doppia** di essere estratta dagli eventi scolastici.
- Il gioco ti "interroga di più" proprio dove sei debole — esattamente come nella realtà.

### Fix selezione materia random negli eventi

Invece di materia completamente casuale, scegliere **preferenzialmente tra le 3 materie con voto più basso**:
```ts
const worstSubjects = subjects
  .sort((a, b) => grades[a] - grades[b])
  .slice(0, 3)
const targetSubject = worstSubjects[Math.floor(Math.random() * worstSubjects.length)]
```

**File coinvolti:** `src/lib/game-utils.ts` (nuova funzione `calculateWeightedMedia`), `src/lib/types.ts` (mappa pesi per scuola), `App.tsx` (`handleSchoolEventChoice`), `src/lib/school-events.ts` (selezione materia pesata)  
**Dipendenze:** Step 1 consigliato prima.

---

## Step 3 — Assenze come Meccanica Attiva

**Stato attuale:** `assenze` si accumula in `SchoolRecord` ma non ha conseguenze concrete.

### Soglie e conseguenze

| Soglia assenze | Effetto |
|---|---|
| > 15 giorni | Lettera ai genitori → penalità soldi (punizione a casa) |
| > 25 giorni | Evento speciale "Rischio non ammissione" → pressione narrativa |
| > 35 giorni | **Game Over** — non ammesso allo scrutinio |

### Tipi di assenza

- **Marina volontariamente** (pulsante dedicato): `assenze += 2` — il giocatore sceglie attivamente di non andare a scuola.
- **Non presentato** (passiva, nessun pulsante premuto): `assenze += 1` — il giocatore semplicemente non ha premuto "Vai a Scuola". **Già implementato** in `useGameTime.ts` (`advancePhaseOnly`). Da mantenere.
- **Presente a scuola**: `assenze` invariato.

> **Nota tecnica:** La meccanica passiva (`assenze += 1`, `condotta -= 0.2`) esiste già nel codice. Lo Step 3 aggiunge il pulsante "Marina" esplicito che dà `assenze += 2` e azioni extra, rendendo la scelta attiva e consapevole. Le due meccaniche coesistono.

### Valvola di sfogo (Step futuro)

Certificato medico falso: annulla 2 assenze ma rischio punizione se scoperto. **Non incluso in questo step** — richiede design evento dedicato, da implementare dopo Step 5 (Tier eventi).

**File coinvolti:** `src/hooks/useGameActions.ts` (nuovo `handleMarina`), `src/hooks/useGameTime.ts` (assenze passive già presenti, aggiunta check soglie), `App.tsx` (pulsante marina, controllo soglie, Game Over), `src/lib/school-events.ts` (evento speciale "rischio non ammissione")  
**Dipendenze:** Step 2 consigliato prima.

---

## Step 4 — Condotta come Moltiplicatore Scrutinio

**Stato attuale:** `condotta` parte da 8, scende per le note, ma non influenza lo scrutinio.

### Tabella effetti condotta

| Condotta | Effetto scrutinio |
|---|---|
| 9–10 | Bonus: promossi anche con media 5.8 (Consiglio di Classe favorevole) |
| 7–8 | Neutro: promozione standard con media ≥ 6 |
| 6 | Malus: serve media ≥ 6.3 per essere promossi |
| 5 | Sospensione in corso → impossibile ricevere voti positivi da eventi |
| < 5 | **Game Over** — espulsione dalla scuola |

### Come si modifica la condotta

**Peggiora:**
- Nota sul registro: `-0.5`
- Sospensione: `-2.0`
- Copia e viene beccato: `-0.5` / `-1.5`
- Marina troppo spesso (>10 assenze): `-0.3` al mese

**Migliora:**
- Comportarsi bene per 5 giorni consecutivi: `+0.3` (richiede nuovo campo `consecutiveGoodDays: number` in `SchoolRecord`)
- Evento "chiedi scusa al prof" (costa 30 soldi): `+1.0`
- Fine quadrimestre con buona media: `+0.5`

### Modifica a SchoolRecord

Aggiungere a `SchoolRecord` in `types.ts`:
```ts
consecutiveGoodDays: number  // tracker per bonus condotta (5 gg → +0.3)
```
Default: `0`. Reset a `0` quando il giocatore riceve una nota, una sospensione o marina.

### Reset annuale SchoolRecord

**Bug attuale:** `handleReportCardContinue` in `App.tsx` resetta i voti a 6 ma **NON resetta** assenze, note, sospensioni e condotta. Aggiungere reset:
```ts
setSchoolRecord({ ...DEFAULT_SCHOOL_RECORD })
```

**File coinvolti:** `src/lib/types.ts` (campo `consecutiveGoodDays`), `school-events.ts` (già usa `conductChange`), `App.tsx` (logica scrutinio + reset annuale), `ReportCardDialog.tsx` (mostrare condotta nella pagella), `src/hooks/useGameTime.ts` (incremento `consecutiveGoodDays` in `advancePhaseOnly`)  
**Dipendenze:** Step 1 per feedback visivo.

---

## Step 5 — Tier Eventi Scolastici

Gli eventi scolastici si dividono in tre livelli di intensità per creare ritmo vario.

### Tier 1 — Piccoli (frequenti, ogni 2-3 azioni scolastiche)
- Domanda del prof, interrogazione breve, controllo compiti
- Delta: **±0.5 / ±1.0** al voto
- Nessun preavviso

### Tier 2 — Medi (settimanali, con preavviso il giorno prima)
- Compito in classe, verifica scritta, presentazione orale
- Delta: **±1.5 / ±2.0** al voto
- Il giorno prima appare toast: *"⚠️ Domani compito di Matematica! Studia stasera."*
- Se il giocatore studia la sera prima → bonus +20% probabilità di successo

#### Meccanica preavviso — implementazione tecnica

Il preavviso usa il sistema `scheduledExams` già esistente in `useGameTime.ts`:
1. Aggiungere campo opzionale `scheduledSchoolEvent?: { type: string, subject: string, date: GameDate }` in `SchoolRecord`.
2. In `advanceToNextDay`, con probabilità ~25% a settimana, schedulare un evento Tier 2 per il giorno dopo.
3. Quando viene schedulato, lanciare `announce('⚠️ Domani compito di [Materia]!')`.
4. Il giorno successivo, in `handleVaiAScuola`, verificare se esiste un evento schedulato e attivarlo.
5. Se il giocatore marina, l'evento schedulato viene perso (assenza al compito → voto 2).

### Tier 3 — Boss (rari, 1-2 per quadrimestre)
- Scrutinio intermedio, colloquio genitori urgente, pagella di metà anno
- Effetto calcolato sulla media accumulata
- Conseguenze grandi: perdita motorino, zero paghetta, eventi genitori

### Calibrazione delta per impatto percepibile

Con 12 materie, un delta di -1 su una materia sposta la media di soli 0.08 punti — quasi invisibile.
I nuovi delta calibrati:

| Evento | Delta vecchio | Delta nuovo |
|---|---|---|
| Interrogazione male | -1 | -1.5 |
| Compito in classe zero | -3 | -2.5 (ma su materia pesata) |
| Copiato e beccato | -2 | -2.0 |
| Interrogazione bene | +1 | +1.0 (invariato) |
| Progetto specifico ottimo | +2 | +2.0 (invariato) |

**File coinvolti:** `src/lib/school-events.ts` (aggiornamento delta, aggiunta campo `tier` agli eventi, nuovi eventi Tier 2/3), `src/hooks/useGameTime.ts` (logica trigger tier, scheduling preavviso — **NON useEventEngine.ts**), `src/lib/types.ts` (campo `scheduledSchoolEvent` in `SchoolRecord`), `App.tsx` (handleVaiAScuola check evento schedulato)  
**Dipendenze:** Step 1 e Step 2.

---

## Step 6 — Scrutinio Finale Integrato

Il motore di promozione a fine anno usa tutte le componenti:

```
Promozione = (media_pesata >= soglia_condotta) AND (assenze < 35)
```

### Formula dettagliata

1. Calcola `media_pesata` con i pesi Step 2
2. Applica modificatore condotta (Step 4): abbassa o alza la soglia di promozione
3. Verifica veto assenze (Step 3): se `assenze >= 35` → non ammesso indipendentemente dalla media
4. Verifica materie insufficienti: se più di 3 materie sotto 5 → debiti formativi (evento speciale estivo)
5. Mostra pagella con tutti i dettagli: media, condotta, assenze, esito

### Debiti formativi (novità)

Se promosso con 1-3 materie sotto 6 → estate con **debito formativo**:
- Evento estivo speciale con mini-gioco di studio
- Se superato: promosso regolare
- Se non superato: **Game Over** a settembre

**File coinvolti:** `App.tsx` (logica `handleReportCardContinue`, reset `SchoolRecord` a fine anno), `ReportCardDialog.tsx` (UI pagella estesa: media pesata, condotta, assenze, debiti), `src/lib/school-events.ts` (evento debito formativo), `GameDialogs.tsx` (passaggio nuove props a `ReportCardDialog`)  
**Dipendenze:** Tutti gli step precedenti.

---

## Ordine di Implementazione

```
Step 1 (feedback visivo)  →  Step 2 (pesi + rischio)  →  Step 4 (condotta)  →  Step 3 (assenze)  →  Step 5 (tier eventi)  →  Step 6 (scrutinio)
```

Ogni step è testabile indipendentemente prima di procedere al successivo.

---

## File Coinvolti — Mappa Riepilogativa

| File | Step coinvolti | Note |
|---|---|---|
| `src/lib/types.ts` | 2, 3, 4, 5 | Pesi materie, `consecutiveGoodDays`, `scheduledSchoolEvent` |
| `src/lib/game-utils.ts` | 2 | `calculateWeightedMedia` (nuova) |
| `src/lib/school-events.ts` | 2, 5, 6 | Selezione materia pesata, tier eventi, debiti formativi |
| `src/lib/school-morning-events.ts` | 1, 5 | Feedback delta, possibile integrazione tier |
| `src/hooks/useGameActions.ts` | 3 | Nuovo `handleMarina` |
| `src/hooks/useGameTime.ts` | 3, 4, 5 | Check soglie assenze, `consecutiveGoodDays`, scheduling preavviso |
| `src/App.tsx` | 1, 3, 4, 6 | Toast delta, pulsante marina, scrutinio, reset SchoolRecord |
| `src/components/ReportCardDialog.tsx` | 4, 6 | Mostra condotta/assenze, pagella estesa, debiti |
| `src/components/GameDialogs.tsx` | 6 | Passaggio nuove props a ReportCardDialog |

> **`src/hooks/useEventEngine.ts`** — **NON coinvolto.** Gestisce solo eventi cittadini (metallari, polizia, gare, bulli).

---

## Problemi risolti in questa revisione (v2)

| # | Problema originale | Correzione |
|---|---|---|
| P1 | `useEventEngine.ts` indicato come coinvolto (errato) | Rimosso — eventi scolastici passano da `useGameTime.ts` e `App.tsx` |
| P2 | Due flussi eventi scolastici ignorati | Documentati: SchoolMorningEvents + TeacherEvents |
| P3 | File mapping Step 3 incompleto | Aggiunto `useGameTime.ts` (assenze passive) |
| P4 | Ambiguità assenze passive vs attive | Chiarito: coesistono (+1 passivo, +2 marina esplicita) |
| P5 | Preavviso Tier 2 senza meccanica tecnica | Aggiunta specifica implementazione via `scheduledSchoolEvent` |
| P6 | SchoolRecord non resettato a fine anno | Aggiunto reset in Step 4 e Step 6 |
| P7 | Tracker giorni consecutivi mancante | Aggiunto campo `consecutiveGoodDays` in SchoolRecord |
| P8 | Certificato medico falso senza dettagli | Spostato a step futuro post-Step 5 |
| P9 | Tabella file riepilogativa incompleta | Aggiornata con tutti i file reali coinvolti |
