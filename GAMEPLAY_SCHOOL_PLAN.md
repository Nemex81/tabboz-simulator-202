# Piano di Integrazione — Sistema Scolastico Gameplay

> **Data:** Aprile 2026  
> **Stato:** In pianificazione  
> **Obiettivo:** Rendere voti, assenze e condotta meccaniche attive e impattanti nel gameplay, garantendo tensione narrativa sostenuta e divertimento.

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

---

## Step 1 — Feedback Visivo Delta (Priorità Massima)

**Problema:** I cambiamenti a voti, condotta e assenze sono invisibili al giocatore.  
**Fix:** Dopo ogni evento che modifica queste statistiche, mostrare un toast dedicato con il delta esplicito.

**Formato toast:**
```
📉 Matematica: 5 → 3 | Media: 6.4 → 6.1 | Condotta: 8 → 7
```

**File coinvolti:** `App.tsx` → `handleSchoolEventChoice`  
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

**File coinvolti:** `src/lib/game-utils.ts` (nuova funzione `calculateWeightedMedia`), `App.tsx` (`handleSchoolEventChoice`)  
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

- **Marina volontariamente** (pulsante dedicato): `assenze += 2`
- **Assente giustificato** (malattia, evento speciale): `assenze += 1`
- **Presente a scuola**: `assenze` invariato

### Valvola di sfogo

Certificato medico falso (evento raro, costa soldi): annulla 2 assenze ma rischio punizione se scoperto.

**File coinvolti:** `useGameActions.ts` (logica marina), `App.tsx` (controllo soglie), `school-events.ts` (evento speciale rischio non ammissione)  
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
- Comportarsi bene per 5 giorni consecutivi: `+0.3`
- Evento "chiedi scusa al prof" (costa 30 soldi): `+1.0`
- Fine quadrimestre con buona media: `+0.5`

**File coinvolti:** `school-events.ts` (già usa `conductChange`), `App.tsx` (logica scrutinio), `ReportCardDialog.tsx` (mostrare condotta nella pagella)  
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

**File coinvolti:** `school-events.ts` (aggiornamento delta e aggiunta tier), `useEventEngine.ts` (logica trigger per tier)  
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

**File coinvolti:** `App.tsx` (logica `handleReportCardContinue`), `ReportCardDialog.tsx` (UI pagella estesa), `school-events.ts` (evento debito formativo)  
**Dipendenze:** Tutti gli step precedenti.

---

## Ordine di Implementazione

```
Step 1 (feedback visivo)  →  Step 2 (pesi + rischio)  →  Step 4 (condotta)  →  Step 3 (assenze)  →  Step 5 (tier eventi)  →  Step 6 (scrutinio)
```

Ogni step è testabile indipendentemente prima di procedere al successivo.

---

## File Coinvolti — Mappa Riepilogativa

| File | Step coinvolti |
|---|---|
| `src/lib/types.ts` | 2 (pesi), 3 (assenze), 4 (condotta) |
| `src/lib/game-utils.ts` | 2 (calculateWeightedMedia) |
| `src/lib/school-events.ts` | 5 (tier eventi), 6 (debiti) |
| `src/hooks/useGameActions.ts` | 3 (marina → assenze) |
| `src/hooks/useEventEngine.ts` | 5 (trigger tier) |
| `src/components/App.tsx` | 1, 3, 4, 6 |
| `src/components/ReportCardDialog.tsx` | 4 (mostra condotta), 6 (pagella estesa) |
