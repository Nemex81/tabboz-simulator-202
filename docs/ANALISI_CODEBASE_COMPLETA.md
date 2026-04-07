# Analisi Completa del Codebase - Tabboz Simulator 2026

**Data**: 7 aprile 2026
**Scope**: Analisi di coerenza, coesione, compatibilita, efficienza UI, duplicazioni e strategia di revisione

---

## 1. Panoramica Strutturale

### Metriche generali

| Categoria | File | Righe stimate |
|-----------|------|---------------|
| App.tsx (orchestratore) | 1 | ~2000 |
| Componenti UI | 29 | ~5500 |
| Hook personalizzati | 11 | ~2200 |
| Moduli logica di gioco (lib/) | 29 | ~4300 |
| **Totale** | **70** | **~14.000** |

### Architettura attuale

```
App.tsx (2000 righe, monolitico)
  |-- useKV (9 stati persistenti)
  |-- useState (3 stati locali)
  |-- 11 custom hook
  |-- ~20 handler inline
  |-- JSX con 5 tab principali + sotto-tab
       |
       +-- school (home, voti, verifiche, amici, dashboard)
       +-- city (azioni urbane)
       +-- character (CharacterSheet con 6 sotto-tab)
       +-- social (azioni sociali)
       +-- status (tema, reset, obiettivo)
```

---

## 2. Bug Confermati

### BUG-1: girlfriend hardcoded a null nel tab amici

**File**: `src/App.tsx`, tab "amici"
**Problema**: `<EnhancedFriendsPanel girlfriend={null} .../>` invece di `girlfriend={girlfriend ?? null}`
**Impatto**: Nel tab amici la sezione ragazza non appare mai, nonostante i callback `onGirlfriendAction` e `onGirlfriendBreakup` siano correttamente passati.
**Fix**: Sostituire `girlfriend={null}` con `girlfriend={girlfriend ?? null}`
**Severita**: MEDIA

### BUG-2: SUBJECT_WEIGHTS deprecato ma ancora definito

**File**: `src/lib/types.ts`, riga ~111
**Problema**: Costante marcata `@deprecated` ma mai rimossa. Non e usata da nessuno.
**Fix**: Rimuovere la definizione.
**Severita**: BASSA (codice morto)

---

## 3. Codice Morto Confermato

| Elemento | File | Stato |
|----------|------|-------|
| `FriendsPanel.tsx` | `src/components/FriendsPanel.tsx` | Mai importato. Superseded da `EnhancedFriendsPanel` |
| `SUBJECT_WEIGHTS` | `src/lib/types.ts` | Deprecato, zero utilizzi |

---

## 4. Duplicazioni e Ridondanze

### 4.1 Sistema Sociale a 5 Vie (Critico)

Cinque moduli gestiscono relazioni con pattern, scale e interfacce diverse:

| Modulo | Scopo | Scala | Pattern |
|--------|-------|-------|---------|
| `social-system.ts` | Generazione amici base | affinita [0-100] | Legacy |
| `enhanced-friend-system.ts` | Generazione amici v2 (4 assi) | amicizia/romantico/odio/rivalita [0-100] | Corrente |
| `relation-system.ts` | 40+ interazioni + tier | 4 assi [0-100] | Corrente |
| `classmate-relations.ts` | Relazioni compagni | relation [-100, +100] | Blocco 3 |
| `teacher-relations.ts` | Relazioni professori | relazione [-100, +100] | Blocco 3 |

**Problemi identificati**:

1. **Incoerenza di scala**: Compagni e professori usano [-100, +100], amici usano [0, 100]. La promozione compagno-amico converte con formula lossy: `(relation + 100) / 2`
2. **Generatori duplicati**: `generateRandomFriend()` in social-system.ts e `generateEnhancedFriend()` in enhanced-friend-system.ts generano Friend con logiche diverse
3. **Sistema ragazza isolato**: `girlfriend-system.ts` usa assi propri (`interessePerTe`, `jealousyLevel`, `trustLevel`, `happinessLevel`) incompatibili con il sistema a 4 assi delle amicizie

### 4.2 Clamping delle Statistiche Non Centralizzato

- Funzione centrale: `clampStat(value, min=0, max=100)` in `game-utils.ts`
- Ma 20+ occorrenze di `Math.max(0, Math.min(100, val))` sparse in exam-system, classmate-relations, school-break-actions, ecc.
- Caso speciale: `soldi` clampato a [0, 1000] solo in `data-validation.ts`, non in `clampStat`

### 4.3 Costanti di Bilanciamento Sparse

Nessun file centralizzato per le costanti di bilanciamento del gioco. Distribuite in 6+ file:

| Costante | File |
|----------|------|
| Moltiplicatori esami | `exam-system.ts` |
| Importi scommesse | `bet-system.ts` |
| Formula reputazione (5 pesi) | `game-utils.ts` |
| Successo sociale | `game-utils.ts` |
| Modificatori stress per trait | `character-traits.ts` |
| Azioni per fase | `phase-actions.ts` |

### 4.4 Pattern morningChoicePending Ripetuto

In `CityPanel.tsx` il pattern `morningChoicePending ? 'Scegli prima se andare...' : ...` e ripetuto identico su 6+ pulsanti. Andrebbe estratto in un helper o costante.

### 4.5 showSchoolMorning + showStreetMorning Come Stato Duale

Due booleani (`showSchoolMorning`, `showStreetMorning`) modellano un concetto unico: il tipo di mattina attiva. Dovrebbe essere un singolo enum: `morningDisplay: 'school' | 'street' | null`.

---

## 5. Incoerenze UI

### 5.1 React.memo Applicato in Modo Disomogeneo

| Con memo (11) | Senza memo (18) |
|---------------|----------------|
| ActionButton, AfternoonEventPanel, EnhancedFriendsPanel, FriendsPanel, RelationCard, RelationsPanel, SchoolBreakPanel, SchoolHomePanel, StatDisplay, StatsDashboard, TeachersPanel, TimeDisplay | CharacterSheet, CityPanel, DiaryPanel, ExamsPanel, GameDialogs, GirlfriendPanel, GradeProgressPanel, HealthRecordPanel, KeyboardShortcutsDialog, RelationshipsPanel, ReportCardDialog, SchoolEventDialog, SchoolMorningPanel, SchoolSelection, SubjectSelectionDialog, TeacherSelectionDialog, ThemeSelector |

Componenti grandi come `CharacterSheet` (~380 righe), `GameDialogs` (~350), `GirlfriendPanel` (~350) non hanno memo, causando re-render inutili a ogni cambio props del parent.

### 5.2 Accessibilita Disomogenea

**Buona copertura**: ActionButton, DiaryPanel, HealthRecordPanel, SchoolBreakPanel, StatDisplay, SubjectSelectionDialog, TeacherSelectionDialog

**Copertura carente**: GradeProgressPanel (nessun aria-*), RelationshipsPanel (tab senza aria-label), SchoolEventDialog (nessuna variazione aria-label), CityPanel (stati disabled senza spiegazione accessibile)

### 5.3 Effetti Sonori Incoerenti

| Componente | Suoni |
|------------|-------|
| SchoolBreakPanel | `playSound.buttonClick()` su ogni azione |
| TeachersPanel | `playSound.buttonClick()` su ogni interazione |
| GirlfriendPanel | Nessun suono |
| EnhancedFriendsPanel | Nessun suono |
| CityPanel | Delegato ai handler (pattern diverso) |

### 5.4 Naming Confuso tra Pannelli Relazioni

| Componente | Scopo reale |
|------------|-------------|
| `RelationsPanel` | Mostra amicizie (usa EnhancedFriendsPanel) |
| `RelationshipsPanel` | Mostra conquiste romantiche |
| `RelationCard` | Card singola per interazione a 4 assi |
| `EnhancedFriendsPanel` | Pannello amici completo |
| `FriendsPanel` | Pannello amici legacy (MORTO) |

Suggerimento: rinominare `RelationsPanel` in `FriendshipsPanel` per chiarezza.

### 5.5 Gestione Stati Vuoti Disomogenea

| Componente | Stato vuoto gestito |
|------------|---------------------|
| FriendsPanel (legacy) | Si - Card con icona e messaggio |
| EnhancedFriendsPanel | Si - Card con icona |
| ExamsPanel | Si - Card con icona |
| RelationshipsPanel | No - render vuoto silenzioso |
| GradeProgressPanel | No |
| TeacherSelectionDialog | No |

---

## 6. Complessita Eccessiva

### 6.1 App.tsx: Componente Monolitico (~2000 righe)

- 9 `useKV` + 3 `useState` + 11 custom hook
- ~20 handler inline
- JSX con 5 tab, sotto-tab, condizionali annidati
- Oggetto `gameDialogsProps` con 48+ proprieta costruito inline a ogni render
- Nessun ErrorBoundary

### 6.2 useGameActions: Hook God-Object (~500 righe)

Gestisce ~20 tipi di azione (studio, sociale, lavoro, esami, ragazza, professori, shopping) in un unico hook. Andrebbe decomposto.

### 6.3 GameDialogs: Dispatcher Monolitico (~350 righe)

Riceve 48 props, gestisce 8+ dialog modali. Pattern isterizzato: ogni dialogo potrebbe essere un componente autonomo con context.

### 6.4 Handler Lunghi

| Handler | Righe | Complessita |
|---------|-------|-------------|
| `handleVaiAScuola` | ~100 | 9 check validazione + generazione slot |
| `handleSchoolEventChoice` | ~80 | Risoluzione outcome multipath |
| `handleReportCardContinue` | ~50 | Logica promozione/bocciatura |

---

## 7. Problemi di Bilanciamento

### 7.1 Formula Reputazione

```
reputazione = coattaggine*0.25 + muscoli*0.15 + figosita*0.20
            + min(soldi/10, 100)*0.10 + min(media*10, 100)*0.10
            + carisma*0.20
```

Pesi non sommano a 1.0 (sommano esattamente 1.0, ma il cap su soldi e media introduce distorsione: un giocatore con 1000 soldi e un giocatore con 100 soldi ottengono lo stesso bonus).

### 7.2 Conversione Compagno-Amico Lossy

Relazione compagno [-100, +100] convertita con `(relation + 100) / 2` ad amicizia [0, 100].
- Compagno con relation 0 (neutro) -> amicizia 50 (gia discretamente amici)
- Compagno con relation -50 (ostile) -> amicizia 25 (ancora amico?)

La soglia di promozione `PROMOTION_THRESHOLD = 30` corrisponde a `(30+100)/2 = 65` amicizia, ragionevole ma la conversione intermedia e fuorviante.

---

## 8. Strategia di Revisione

### Priorita CRITICA (bug e codice morto)

| ID | Azione | File coinvolti | Effort |
|----|--------|---------------|--------|
| R1 | Fix girlfriend prop hardcoded null nel tab amici | `App.tsx` | 5 min |
| R2 | Rimuovere `FriendsPanel.tsx` (dead code) | `components/FriendsPanel.tsx` | 5 min |
| R3 | Rimuovere `SUBJECT_WEIGHTS` deprecato | `lib/types.ts` | 5 min |

### Priorita ALTA (coerenza e manutenibilita)

| ID | Azione | File coinvolti | Effort |
|----|--------|---------------|--------|
| R4 | Unificare scala relazioni a [0, 100] | `classmate-relations.ts`, `teacher-relations.ts`, `types.ts` | 2-3h |
| R5 | Centralizzare costanti bilanciamento in `game-balance.constants.ts` | Nuovo file + 6 moduli | 1-2h |
| R6 | Estrarre `morningDisplay: enum` da 2 booleani | `App.tsx`, `useAppDialogs.ts` | 30 min |
| R7 | Centralizzare clamping statistiche (eliminare inline Math.max/min) | 6+ file in lib/ | 1h |
| R8 | Applicare React.memo a CharacterSheet, GameDialogs, GirlfriendPanel | 3 file | 30 min |

### Priorita MEDIA (refactoring strutturale)

| ID | Azione | File coinvolti | Effort |
|----|--------|---------------|--------|
| R9 | Decomporre App.tsx: estrarre SchoolTab, CityTab, SocialTab come componenti | `App.tsx` + 3 nuovi file | 3-4h |
| R10 | Decomporre useGameActions in handler specializzati (study, social, exam, girlfriend) | `useGameActions.ts` + 4 nuovi file | 2-3h |
| R11 | Decomporre GameDialogs: estrarre ogni dialog come componente autonomo | `GameDialogs.tsx` + 8 file | 2h |
| R12 | Rinominare RelationsPanel -> FriendshipsPanel | `RelationsPanel.tsx`, importatori | 15 min |
| R13 | Unificare pattern suoni: creare hook `useSoundFeedback` | Nuovo hook + 6 componenti | 1h |

### Priorita BASSA (qualita e accessibilita)

| ID | Azione | File coinvolti | Effort |
|----|--------|---------------|--------|
| R14 | Aggiungere aria-label ai componenti carenti | GradeProgressPanel, RelationshipsPanel, CityPanel, SchoolEventDialog | 1h |
| R15 | Aggiungere gestione stati vuoti a RelationshipsPanel, GradeProgressPanel | 2 componenti | 30 min |
| R16 | Estrarre pattern morningChoicePending in CityPanel | `CityPanel.tsx` | 15 min |
| R17 | Aggiungere ErrorBoundary attorno a App.tsx | `App.tsx`, `ErrorFallback.tsx` | 30 min |
| R18 | Integrare girlfriend-system nel sistema a 4 assi | `girlfriend-system.ts`, `relation-system.ts` | 4-5h |

---

## 9. Piano di Esecuzione Consigliato

### Fase 1: Quick Wins (1 sessione)

Eseguire R1, R2, R3 (bug e dead code) + R8 (memo) + R16 (pattern morningChoicePending).
Impatto: zero rischio, massimo beneficio immediato.

### Fase 2: Coerenza Dati (1-2 sessioni)

Eseguire R4 (scala unificata) + R5 (costanti bilancio) + R7 (clamping centralizzato) + R6 (enum morningDisplay).
Impatto: elimina incoerenze di scala, facilita bilanciamento futuro.

### Fase 3: Decomposizione (2-3 sessioni)

Eseguire R9 (App.tsx split) + R10 (useGameActions split) + R11 (GameDialogs split).
Impatto: manutenibilita e leggibilita drasticamente migliorate.

### Fase 4: Accessibilita e Polish (1-2 sessioni)

Eseguire R14, R15, R12, R13, R17.
Impatto: esperienza utente piu coerente, screen reader completamente supportato.

### Fase 5: Architettura Relazioni (futura)

Eseguire R18 (unificazione girlfriend) quando il sistema sociale e stabile.
Impatto: single source of truth per tutte le relazioni.

---

## 10. Riepilogo Severity

| Severity | Conteggio | Esempi |
|----------|-----------|--------|
| Bug confermato | 2 | girlfriend null, SUBJECT_WEIGHTS morto |
| Dead code | 2 | FriendsPanel.tsx, SUBJECT_WEIGHTS |
| Incoerenza critica | 3 | Scala relazioni, clamping, costanti bilancio |
| Incoerenza UI | 5 | memo, suoni, accessibilita, naming, stati vuoti |
| Complessita eccessiva | 4 | App.tsx, useGameActions, GameDialogs, handler lunghi |
| **Totale issue** | **16** | |

---

*Report generato automaticamente dall'analisi codebase del 7 aprile 2026.*
