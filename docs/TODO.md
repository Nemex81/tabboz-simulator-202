<!-- linked-plan: docs/PIANO_IMPLEMENTATIVO_CORRETTIVO_v3.md -->
# TODO — Piano Correttivo v3

> Prima di ogni fase, Copilot DEVE leggere il file
> `docs/PIANO_IMPLEMENTATIVO_CORRETTIVO_v3.md` per consultare le specifiche
> tecniche complete, i tipi, le firme delle funzioni e le regole di
> compatibilita. Non procedere a memoria, esegui sempr eun analisi anche dello stato attuale del codice prima di iniziare.

---

## [x] STEP 1 — Quick Win (Rischio Zero)

**Effort**: ~20 min | **Rischio**: Nullo

### [x] R1 — Fix girlfriend prop hardcoded

- [x] In `src/App.tsx` riga ~1650, sostituire `girlfriend={null}` con `girlfriend={girlfriend ?? null}`
- [x] Verifica: tab amici mostra fidanzata se presente
- [x] `npx tsc --noEmit` zero errori

### [x] R2 — Elimina FriendsPanel.tsx (dead code)

- [x] Eliminare `src/components/FriendsPanel.tsx`
- [x] `grep -r "FriendsPanel" src/` restituisce 0 risultati (escluso EnhancedFriendsPanel)
- [x] `npx tsc --noEmit` zero errori

### [x] R3 — Elimina SUBJECT_WEIGHTS deprecato

- [x] Rimuovere blocco `export const SUBJECT_WEIGHTS` da `src/lib/types.ts` riga ~111
- [x] `grep -r "SUBJECT_WEIGHTS" src/` restituisce 0 risultati
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 1**:

- [x] Build passa senza errori TypeScript
- [x] `girlfriend` dinamica visibile nel tab amici

---

## [x] STEP 2 — Scala Relazioni (Priorita Anticipata)

**Effort**: ~2h | **Rischio**: Medio

> Pre-condizione: cancellare localStorage dal browser (DevTools -> Application -> Local Storage -> Clear All) prima di applicare le modifiche.

### [x] R4a — classmate-relations.ts: scala [0,100]

- [x] Cambiare `RELATION_MIN = 0`, `RELATION_MAX = 100`
- [x] Valore neutro iniziale: `50` (era `0` su scala [-100,+100])
- [x] `PROMOTION_THRESHOLD = 65` (da formula (30+100)/2 = 65)
- [x] Aggiornare clamp per operare su [0,100]
- [x] Rimuovere `classmateRelationToFriendship()` (la formula diventa identita)
- [x] `npx tsc --noEmit` zero errori

### [x] R4b — Reset KV (nessuna migrazione lazy)

- [x] Documentare procedura reset localStorage nel README o in commento inline
- [x] Nessuna funzione `migrateClassmate()` da creare

### [x] R4c — teacher-relations.ts: scala [0,100]

- [x] Cambiare `RELATION_MIN = 0`, `RELATION_MAX = 100`
- [x] Valore neutro iniziale: `50`
- [x] Aggiornare `sogliaRottura`: es. `-30` diventa `((-30)+100)/2 = 35`
- [x] `ISTERESI = 10` (dimezzato proporzionalmente al nuovo range)
- [x] Aggiornare funzione `clamp()` privata per [0,100]
- [x] `CORRUPTION_CHANCE_MIN/MAX` e `THREAT_CHANCE_MIN/MAX` invariati (gia in percentuale)
- [x] `MAX_MEMORIA = 20` invariato (contatore, non scala)
- [x] Nessuna funzione `migrateTeacher()`
- [x] `npx tsc --noEmit` zero errori

### [x] R4d — promoteToFriend(): mappatura diretta

- [x] In `src/lib/classmate-relations.ts` sostituire `classmateRelationToFriendship(classmate)` con `classmate.relation`
- [x] In `src/lib/school-roster-transitions.ts`: rimuovere import `classmateRelationToFriendship`, usare `classmate.relation` direttamente
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 2**:

- [x] Classmate relation inizia a 50 (non 0)
- [x] Promozione avviene a soglia 65
- [x] Dopo reset localStorage, relation compagno inizia a 50
- [x] Teacher isteresi funziona su scala [0,100]

---

## [x] STEP 3 — Fondamenta Centralizzazione

**Effort**: ~2h | **Rischio**: Basso

> Pre-condizione: STEP 2 completato.

### [x] R5 — Crea game-balance.constants.ts

- [x] Creare `src/lib/game-balance.constants.ts`
- [x] Definire: `STAT_CAPS`, `RELATION`, `ECONOMY`, `SCHOOL`, `REPUTATION_WEIGHTS`, `BET`
- [x] Aggiornare file consumer per importare da qui invece di hardcodare
- [x] `npx tsc --noEmit` zero errori

### [x] R7 — Sostituzione inline clamp con clampStat()

- [x] `data-validation.ts` riga 130: Math.max/Min inline -> `clampStat(val, 0, max)`
- [x] `data-validation.ts` righe 170, 172: -> `clampStat(val)`
- [x] `classmate-relations.ts` riga 91: -> `clampStat(val, RELATION.MIN, RELATION.MAX)`
- [x] `relation-system.ts` righe 431-435 (5x): -> `clampStat(Math.round(val))`
- [x] `relation-system.ts` riga 529: -> `clampStat(val)`
- [x] `girlfriend-system.ts` riga 533: -> `clampStat(val)`
- [x] `enhanced-friend-system.ts` righe 294, 298 (2x): -> `clampStat(val)`
- [x] `school-timetable.ts` riga 137: -> `clampStat(val, 0, 4)`
- [x] `teacher-relations.ts`: rimuovere `clamp()` privata, importare `clampStat`
- [x] `npx tsc --noEmit` zero errori

### [x] R7b — clampStat() esteso con STAT_CAPS

- [x] Aggiornare `src/lib/game-utils.ts` riga 3-5: overload con chiave stringa o min/max numerici
- [x] Retrocompatibilita garantita: firma originale `(value, min?, max?)` ancora funzionante
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 3**:

- [x] Tutte le costanti estratte importate da game-balance.constants.ts
- [x] `clampStat('soldi')` ritorna [0,1000]
- [x] Zero occorrenze di `Math.max(0, Math.min(100,...))` non giustificate

---

## [x] STEP 4 — useGameRelations come Hub Unico

**Effort**: ~1.5h | **Rischio**: Medio

> Pre-condizioni: STEP 2 e STEP 3 completati.

### [x] R4e — doClassmateInteraction()

- [x] Aggiungere `doClassmateInteraction(classmateId, interactionKey)` in `src/hooks/useGameRelations.ts`
- [x] Trova classmate, applica interazione, aggiorna roster, segnala se supera soglia promozione
- [x] `npx tsc --noEmit` zero errori

### [x] R4f — doTeacherInteraction()

- [x] Aggiungere `doTeacherInteraction(teacherId, interactionKey)` in `src/hooks/useGameRelations.ts`
- [x] Trova teacher, applica via `applyTeacherRelationChange()`, aggiorna roster, controlla ostilita
- [x] `npx tsc --noEmit` zero errori

### [x] R4g — Pannelli passano per l'hub

- [x] `TeachersPanel.tsx` riga 16: rimuovere import diretto di `applyTeacherRelationChange`
- [x] `SchoolBreakPanel.tsx`: gia usa sole callback (nessun import diretto da teacher-relations) — ok
- [x] Pannelli ricevono `doTeacherInteraction` / `doClassmateInteraction` come prop da App.tsx
- [ ] Marcare `generateRandomFriend` in `social-system.ts` come `@deprecated` (JSDoc con rimando a `enhanced-friend-system.ts`)
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 4**:

- [x] TeachersPanel non importa direttamente da lib/teacher-relations
- [x] `doClassmateInteraction` e `doTeacherInteraction` ritornano risultati coerenti con `doInteraction`

---

## [x] STEP 5 — Stato App e UI Core

**Effort**: ~1.5h | **Rischio**: Basso

### [x] R6 — morningDisplay enum

- [x] In `src/hooks/useAppDialogs.ts`: sostituire `showSchoolMorning` + `showStreetMorning` con `morningDisplay: 'school' | 'street' | null`
- [x] Retrocompatibilita wrapper `setShowSchoolMorning`/`setShowStreetMorning` per useGameTime
- [x] `npx tsc --noEmit` zero errori

### [x] R16 — Helper cityActionDisabled()

- [x] Aggiungere `getActionState()` locale in `src/components/CityPanel.tsx`
- [x] Eliminare ripetizione del pattern disabled/blockedReason sui 6 ActionButton
- [x] `npx tsc --noEmit` zero errori

### [x] R8 — React.memo e useMemo

- [x] Wrappare `CharacterSheet` con `React.memo`
- [x] Wrappare `GameDialogs` con `React.memo`
- [x] Wrappare `GirlfriendPanel` con `React.memo`
- [ ] Spezzare `gameDialogsProps` in sub-objects con `useMemo` (rimandato a STEP 9: richiede ristrutturazione App.tsx per rispettare regole hook)
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 5**:

- [x] `morningDisplay` e un singolo state enum
- [x] CityPanel ha zero ripetizione nel pattern disabled
- [ ] `gameDialogsProps` memoizzato (rimandato a STEP 9)

---

## [x] STEP 6 — Naming, Stati Vuoti e Accessibilita

**Effort**: ~2h | **Rischio**: Basso

### [x] R12 — Rinomina RelationsPanel

- [x] Rinominare `src/components/RelationsPanel.tsx` -> `FriendshipsPanel.tsx`
- [x] Aggiornare import in CharacterSheet.tsx
- [x] Rinominare export `RelationsPanel` -> `FriendshipsPanel` e `RelationsPanelProps` -> `FriendshipsPanelProps`
- [x] `npx tsc --noEmit` zero errori

### [x] R15 — Stati vuoti mancanti

- [x] `GradeProgressPanel.tsx`: aggiungere check `gpaSubjects.length === 0` con messaggio accessibile
- [x] `TeacherSelectionDialog.tsx`: aggiungere check `subjects.length === 0` (edge case difensivo)
- [x] RelationshipsPanel NON da toccare (stato vuoto gia presente)
- [x] `npx tsc --noEmit` zero errori

### [x] R14 — aria-label e role mancanti

- [x] `GradeProgressPanel.tsx` root div: aggiunto `role="region" aria-label="Progresso voti"`
- [x] `CityPanel.tsx` root div: aggiunto `role="region" aria-label="Pannello citta"`
- [x] `RelationshipsPanel.tsx` root div: aggiunto `role="region" aria-label="Relazioni sentimentali"`
- [x] `SchoolEventDialog.tsx`: Radix AlertDialog fornisce gia role="alertdialog" — ok
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 6**:

- [x] `FriendshipsPanel.tsx` esiste, `RelationsPanel.tsx` eliminato
- [x] GradeProgressPanel mostra stato vuoto se nessuna materia
- [x] 3 componenti hanno `aria-label`/`role` aggiunto

---

## [x] STEP 7 — Audio Unificato

**Effort**: ~1h | **Rischio**: Basso

### [x] R13 — useSoundFeedback hook

- [x] Creare `src/hooks/useSoundFeedback.ts` con `SoundAction` type e `ACTION_SOUND_MAP`
- [x] Esporre `play(action: SoundAction)` callback
- [x] `npx tsc --noEmit` zero errori

### [x] R13b — Aggiornamento pannelli muti

- [x] `GirlfriendPanel.tsx`: aggiunto `useSoundFeedback`, `play('click')` su azioni, `play('bigWin')` su dichiarazione, `play('moneySpent')` su regalo
- [x] `EnhancedFriendsPanel.tsx`: aggiunto `useSoundFeedback`, `play('click')` su interazioni amicizia
- [x] `npx tsc --noEmit` zero errori

### [x] R13c — CityPanel allineamento

- [x] CityPanel delega suoni agli handler di App.tsx — feedback sonoro gia presente tramite playSound.buttonClick() in ciascun handler. Nessuna modifica necessaria.

**Criteri di accettazione STEP 7**:

- [x] useSoundFeedback hook esiste e mappa tutte le azioni
- [x] GirlfriendPanel e EnhancedFriendsPanel producono feedback sonoro

---

## [x] STEP 8 — Bilanciamento Formula Reputazione

**Effort**: ~1h | **Rischio**: Medio (gameplay)

> Pre-condizione: STEP 3 completato (REPUTATION_WEIGHTS da game-balance.constants.ts).

### [x] R19 — Correzione formula reputazione

- [x] `src/lib/game-utils.ts` riga 134: sostituire `Math.min(stats.soldi / 10, 100)` con `clampStat(stats.soldi, 'soldi') / 10`
- [x] `src/lib/game-utils.ts` riga 135: sostituire `Math.min(stats.media * 10, 100)` con `clampStat(stats.media, 'media') * 10`
- [x] `npx tsc --noEmit` zero errori

### [x] R19b — Pesi in costanti

- [x] Sostituire i 6 `const *Weight` locali in game-utils.ts con import da `REPUTATION_WEIGHTS`
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 8**:

- [x] Formula reputazione usa REPUTATION_WEIGHTS
- [x] soldi/media scalano linearmente senza cap implicito

---

## [x] STEP 9 — Decomposizione App.tsx

**Effort**: ~12-16h | **Sessioni**: 4+ | **Rischio**: Alto
**Stato**: Completato con deroga approvata dall'utente. App.tsx ridotto a 839 righe invece del target originario < 800.
**Piano di completamento**: `docs/PIANO_COMPLETAMENTO_FASI_9_10.md`

> Pre-condizioni: STEP 4, 5, 6 completati.

### [x] R9a — SchoolTab.tsx

- [x] `src/components/tabs/SchoolTab.tsx` — 672 righe — esiste e usato
- [x] `<TabsContent value="school">` delega completamente al componente
- [x] Props complete (stats, grades, schoolType, handlers, ecc.)
- [x] `npx tsc --noEmit` zero errori

### [x] R9b — CityTab.tsx

- [x] `src/components/tabs/CityTab.tsx` — 33 righe — esiste e usato
- [x] `<TabsContent value="city">` delega completamente al componente
- [x] `npx tsc --noEmit` zero errori

### [x] R9c — SocialTab.tsx + StatusTab.tsx

- [x] `src/components/tabs/SocialTab.tsx` — 186 righe — esiste e usato
- [x] `src/components/tabs/StatusTab.tsx` — 119 righe — esiste e usato
- [x] `npx tsc --noEmit` zero errori

### [x] R9d — Estrazione handler (parziale completata)

- [x] `src/lib/school-actions.ts` — 60 righe — `buildSchoolDayState` estratta come funzione pura
- [x] `src/lib/school-event-handlers.ts` — 111 righe — `computeEventGradeChange` e `computeReportCardVerdict` estratte
- [x] Handler orchestrazione scolastica spostati in `src/hooks/useSchoolHandlers.ts`
- [ ] Test per le funzioni pure estratte: rinviati a uno step successivo
- [x] `gameDialogsProps` spezzato in 3 sotto-oggetti memoizzati (`schoolDialogProps`, `cityDialogProps`, `socialDialogProps`)

### [x] R9e — Completamento riduzione App.tsx (vedere PIANO_COMPLETAMENTO)

- [x] `src/hooks/useSchoolHandlers.ts`: estratti gli handler scolastici inline da App.tsx
- [x] `src/components/DailyControls.tsx`: estratto il blocco IIFE "Controlli Giornata" dal JSX
- [x] `src/hooks/useSchoolEffects.ts`: estratti gli useEffect F4/F5/F6 da App.tsx
- [x] Memoizzati i 3 sotto-oggetti `useMemo` (`schoolDialogProps`, `cityDialogProps`, `socialDialogProps`)
- [ ] Test per `school-actions.ts` e `school-event-handlers.ts` rinviati
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 9**:

- [x] App.tsx ridotto a 839 righe, accettato dall'utente come risultato finale di STEP 9
- [ ] SchoolTab, CityTab, SocialTab, StatusTab funzionano come prima
- [~] Handler estratti: wiring ridotto e funzioni pure avviate; test dedicati ancora da completare
- [x] `gameDialogsProps` memoizzato in sotto-oggetti

---

## [x] STEP 10 — Decomposizione useGameActions e GameDialogs

**Effort**: ~5.5h | **Sessioni**: 3-4 | **Rischio**: Alto
**Stato**: Completato. Discovery, routing e implementazione delegati agli agenti specializzati e verificati nel workspace.
**Piano dettagliato**: `docs/PIANO_COMPLETAMENTO_FASI_9_10.md` sezione 3

> Pre-condizioni: STEP 9 completato.

### [x] R10a-d — Split useGameActions

- [x] Creare `src/hooks/useStudyActions.ts` (handleStudia, handleStudySubject, handleCorrompi, handleCorrompiSubject, handleMinaccia, handleMinacciaSubject, handlePrepareExam)
- [x] Creare `src/hooks/useSocialActions.ts` (handleDisco, handleCinema, handleChiacchiera, handleParco, handleTelefona, handleTryRelationship)
- [x] Creare `src/hooks/useGirlfriendActions.ts` (handleGirlfriendAction, handleGirlfriendBreakup)
- [x] Creare `src/hooks/useEconomyActions.ts` (handleLavoro, handleShoppingMall, handleMotorino)
- [x] `useGameActions.ts` diventa facciata che compone i sotto-hook, interfaccia pubblica invariata
- [x] `useGameActions.ts` < 200 righe
- [x] `npx tsc --noEmit` zero errori

### [x] R11 — Split GameDialogs

- [x] Creare `src/components/dialogs/MetallariDialog.tsx`
- [x] Creare `src/components/dialogs/AtipaEventDialog.tsx`
- [x] Creare `src/components/dialogs/PoliceDialog.tsx`
- [x] Creare `src/components/dialogs/StreetRaceDialog.tsx`
- [x] Creare `src/components/dialogs/BulliDialog.tsx`
- [x] Creare `src/components/dialogs/GameOverDialog.tsx`
- [x] Creare `src/components/dialogs/ResetDialog.tsx`
- [x] `GameDialogs.tsx` diventa orchestratore < 100 righe
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 10**:

- [x] useGameActions.ts < 200 righe (facciata)
- [x] GameDialogs.tsx < 100 righe (orchestratore)
- [x] Ogni sotto-hook e sotto-dialog ha singola responsabilita

---

## [x] STEP 11 — Architettura Relazioni

### [x] R18 — girlfriendToRelation() adapter

- [x] Creare funzione `girlfriendToRelation(girlfriend: Ragazza): RelationStats`
- [x] Integrare la fidanzata nel sistema 4-assi

### [x] R4h — Deprecazione formale social-system.ts

- [x] Marcare tutte le export di `social-system.ts` come `@deprecated`
- [x] Migrare `useEventEngine.ts`: `generateRandomFriend` → `generateExtraFriend` (enhanced-friend-system)
- [x] Rimuovere import stale da `App.tsx` (5 funzioni mai usate nel corpo)
- [x] Spostare helper sentimentali in `src/lib/relationship-utils.ts`
- [x] Spostare `getFriendStudyBonus()` in `src/lib/enhanced-friend-system.ts`
- [x] Eliminare `social-system.ts`

**Accettazione criteri:**

- [x] `src/lib/girlfriend-system.ts`: `girlfriendToRelation()` esportata
- [x] `useEventEngine.ts` non importa più `generateRandomFriend` da `social-system`
- [x] `App.tsx` non importa più da `social-system`
- [x] Nessun file in `src/` importa più da `social-system`
- [x] Zero errori TypeScript `npx tsc --noEmit`

---

---

## [x] STEP 12 — Integrazione phase-actions.ts

**Effort**: ~3-4h | **Rischio**: Medio | **Pre-condizioni**: STEP 10 completato
**Analisi**: `docs/ANALISI_CODEBASE_COMPLETA.md` (sessione 08 Apr 2026)
**Stato**: Completato — 08 Apr 2026.

### 12.1 — Fix interno a phase-actions.ts

- [x] In `getAvailableActions()`: aggiunto parametro `isExhausted: boolean = false` e filtro per `blockedWhenExhausted`
- [x] `npx tsc --noEmit` zero errori

### 12.2 — ACTION_HANDLER_MAP in useGameActions

- [x] Aggiunto `handleDormi: () => void` ai `UseGameActionsParams` in `src/hooks/types.ts`
- [x] Importato `getAvailableActions`, `PhaseActionEntry`, `ActionId` da `@/lib/phase-actions`
- [x] Costruito `ACTION_HANDLER_MAP: Partial<Record<ActionId, () => void>>` interno alla facciata
- [x] Esposti nel return: `availableActions: PhaseActionEntry[]` e `getHandlerForAction(id: ActionId)`
- [x] Calcolo `availableActions` tramite `getAvailableActions` con tutti i parametri contestuali
- [x] Commento TODO per `studia_gruppo` (handler non implementato)
- [x] `npx tsc --noEmit` zero errori

### 12.3 — Wiring App.tsx → CityTab

- [x] In `App.tsx`: `handleDormi` passato a `useGameActions`; `availableActions` e `getHandlerForAction` passate a `CityTab`
- [x] `npx tsc --noEmit` zero errori

### 12.4 — CityTab e CityPanel dinamici

- [x] `CityTab.tsx`: aggiunte props opzionali `availableActions` e `onAction`, propagate a `CityPanel`
- [x] `CityPanel.tsx`: aggiunta Card dinamica "Azioni disponibili ora" con `role="list"` e `aria-labelledby`
- [x] Ogni bottone dinamico ha `aria-label` da `entry.label`
- [x] `npx tsc --noEmit` zero errori

### 12.5 — Marcatura TODO handler mancanti

- [x] Commento `// TODO STEP 12: studia_gruppo — handler non implementato` presente in ACTION_HANDLER_MAP
- [x] `handleStudiaGruppo` implementato in `useStudyActions.ts` e collegato ad `ACTION_HANDLER_MAP` (completato post-STEP 12)
- [x] Costanti `STUDY.GROUP_*` aggiunte a `game-balance.constants.ts`; valori hardcoded sostituiti con costanti (08 Apr 2026)

**Criteri di accettazione STEP 12**:

- [x] `getAvailableActions` viene chiamata da `useGameActions`
- [x] Le azioni filtrate per fase/giorno arrivano a `CityTab` come lista dinamica
- [x] Azioni con `aria-label` descrittivo per screen reader
- [x] Build TypeScript pulita — zero errori tsc

---

## [x] STEP 13 — Integrazione bet-system.ts + StreetRaceDialog

**Effort**: ~2-3h | **Rischio**: Basso | **Pre-condizioni**: STEP 12 completato
**Analisi**: `docs/ANALISI_CODEBASE_COMPLETA.md` (sessione 08 Apr 2026)
**Stato**: Parzialmente completato (13.1–13.4 completati; 13.5 rinviato — richiede callback cross-hook)

### 13.1 — Allineamento costanti bet-system.ts

- [x] In `bet-system.ts`: importato `BET` da `@/lib/game-balance.constants`
- [x] Sostituiti tutti i valori hardcodati con costanti `BET.*`
- [x] `npx tsc --noEmit` zero errori

### 13.2 — betInfo state in useEventEngine

- [x] Importati `BetInfo`, `generateStreetRace` da `@/lib/bet-system`
- [x] Aggiunto stato `betInfo/setBetInfo` + ref stabile `betInfoRef`
- [x] In `triggerRandomEvent()` ramo gara: `generateStreetRace` chiamato, risultato salvato in `betInfo`
- [x] `handleStreetRaceAccetta` usa `betInfoRef.current?.vincitaPotenziale ?? 150` e `importo ?? 80`
- [x] `betInfo` e `setBetInfo` esposti nel return di `useEventEngine`
- [x] `npx tsc --noEmit` zero errori

### 13.3 — StreetRaceDialog arricchito

- [x] Aggiunto import `BetInfo`, `getDifficoltaText`, `getDifficoltaColor` da `@/lib/bet-system`
- [x] Aggiunta prop opzionale `betInfo?: BetInfo` a `StreetRaceDialogProps`
- [x] Nel JSX: blocco condizionale con `nomeAvversario`, `descrizione`, importo, vincita potenziale
- [x] Aggiunto `aria-live="polite"` sul blocco informativo
- [x] `npx tsc --noEmit` zero errori

### 13.4 — Wiring game-dialogs.types.ts + GameDialogs.tsx + App.tsx

- [x] In `game-dialogs.types.ts`: aggiunto `betInfo: BetInfo | null`
- [x] In `GameDialogs.tsx`: aggiunto `betInfo={p.betInfo}` a `<StreetRaceDialog>`
- [x] In `App.tsx`: aggiunto `betInfo: events.betInfo` in `cityDialogProps`
- [x] `npx tsc --noEmit` zero errori

### 13.5 — Motorino sera sabato (azione diretta da phase-actions)

- [x] In `useEconomyActions.ts`: aggiunto parametro opzionale `onOpenStreetRace?: (betInfo: BetInfo) => void`
- [x] In `handleMotorino`: se `dayTypeRef.current === 'sabato'`/`'festivo'` e `currentPhaseRef.current === 'sera'` e `onOpenStreetRace` presente → chiama `generateStreetRace(s.reputazione)`, poi invoca `onOpenStreetRace(race)` invece del comportamento "trucca motorino"
- [x] In `App.tsx`: passato `onOpenStreetRace` (callback che chiama `events.setBetInfo` + `setShowStreetRaceEvent(true)`)
- [x] Aggiornato `UseGameActionsParams` in `src/hooks/types.ts` con il nuovo param opzionale
- [x] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 13** (13.1–13.4 soddisfatti):

- [x] `generateStreetRace` viene chiamata da `useEventEngine` ad ogni sfida casuale
- [x] `StreetRaceDialog` mostra nome avversario, difficoltà, importo scommessa e vincita potenziale
- [x] Il risultato (vittoria/sconfitta) usa importo/vincita reale da `BetInfo`
- [x] Motorino sabato sera apre gara dialog (completato STEP 13.5)
- [x] `aria-live` presente sul blocco informativo del dialog
- [x] Build TypeScript pulita — zero errori tsc

### STEP 13.6 — Bilanciamento eventi mattina + interrogazioni programmate [x]

- [x] `sm_ritardo_bus` 30→18, `sm_pettegolezzo_al_cancello` 35→20
- [x] `sm_interrogazione_prevista` rinominato `sm_ansia_interrogazione` (disambiguazione `commonEvents`)
- [x] `school-structured-events`: tipo `orale|'scritto'` + `createScheduledOralExam()`

### TASK-A — Data UI + costi canonici [x]

- [x] `TimeDisplay.tsx`: aggiunto giorno della settimana in italiano tramite helper `getDayOfWeekLabel()`
- [x] `useGameTime.ts`: validato modello azioni corrente; `gainExtraAction()` e `consumeAction()` operano gia su `phaseActionsRemaining`, quindi nessun doppio stato da introdurre
- [x] `useSocialActions.ts`, `useEconomyActions.ts`, `useLifestyleActions.ts`: sostituiti costi hardcoded con `ECONOMY.*`
- [x] `game-balance.constants.ts`: aggiunta costante canonica `ECONOMY.MOTORINO_TRUCCO_COSTO`
- [x] `CityPanel.tsx` e `tabs/SocialTab.tsx`: messaggi/guard UI riallineati ai costi canonici
- [x] `npx tsc --noEmit` zero errori

### TASK-B — Job system [x]

- [x] Creato `src/lib/job-system.ts` con `JobId`, `JobDefinition`, `JOBS` e helper di availability/block reason
- [x] Aggiunto `hasMotorino: boolean` a `GameStats`, `DEFAULT_GAME_STATE` e validazione runtime
- [x] `phase-actions.ts`: gateway `lavoro` esteso alle fasce orarie compatibili con i 6 job
- [x] `useEconomyActions.ts`: separati gateway `handleLavoro()` ed executor `handleJobSelection(jobId)`
- [x] `JobSelectionDialog.tsx` integrato in `GameDialogs` e wiring completato in `App.tsx` / `useAppDialogs.ts`
- [x] `CityPanel.tsx`: pulsante Lavoro convertito a selettore job senza requisiti hardcoded obsoleti
- [x] Adattamento rispetto al piano: il gateway e visibile dal 1° anno per non bloccare `dogsitter` e `volantinaggio`; i vincoli reali sono applicati e mostrati nel dialog
- [x] Adattamento rispetto al piano: `hasMotorino` viene sbloccato dalla prima azione motorino riuscita, in assenza di un sistema inventario dedicato
- [x] `npx tsc --noEmit` zero errori

### TASK-C — BaseCharacter · pool interazioni · fix amico [x]

- [x] `types.ts`: aggiunto `BaseCharacter` compatibile e non distruttivo; `Friend`, `Teacher`, `Classmate`, `PlayerProfile` allineati senza migrare `gender` persistito né rinominare `relation`
- [x] `enhanced-friend-system.ts` e `school-roster.ts`: factory aggiornate con campi base opzionali utili (`gender`, `carisma`, `relazione` alias dove sensato)
- [x] `useGameTime.ts`: introdotto pool interazioni separato con KV dedicato (`tabboz-interazioni`, `tabboz-max-interazioni`) e reset per fase basato sul carisma
- [x] `useSocialActions.ts`: `chiacchiera`, `telefona` e `friendAction` usano il nuovo consumo interazioni; azioni di spostamento restano sul pool normale
- [x] `TimeDisplay.tsx`, `SocialTab.tsx`, `CharacterSheet.tsx` e pannelli amicizie: indicatore e wiring UI per le interazioni rimaste
- [x] `useEventEngine.ts`: fix reale del bug nuovi amici tramite normalizzazione location, bonus coerenti e `addLogEntry` nel diario
- [x] Adattamento rispetto al piano: la probabilità base era già al 15%; la correzione effettiva era nel mapping location e nella visibilità del risultato, non nel numero base
- [x] Adattamento rispetto al piano: il pool interazioni è stato implementato con KV separato per evitare doppio stato su `GameTime` e preservare la retrocompatibilità dei salvataggi
- [x] `npx tsc --noEmit` zero errori

---

## [x] Audit Accessibilità — 08 Apr 2026

**Analisi e revisione completa del sistema di accessibilità NVDA: feed vocali, markup, keyboard shortcuts.**

### Anomalie rilevate e corrette

- [x] **A1 — announce() non re-vocalizzava lo stesso messaggio**: aggiunto `clear + requestAnimationFrame` prima di impostare il testo (`App.tsx`)
- [x] **A3 — DailyControls Riposa/Dormì senza aria-label**: aggiunti `aria-label` descrittivi (`DailyControls.tsx`)
- [x] **A4 — TimeDisplay senza role semantico**: aggiunto `role="region" aria-label="Stato giornata corrente"` (`TimeDisplay.tsx`)
- [x] **A5 — alert morningChoicePending aveva aria-live ridondante**: rimossi `aria-live="assertive"` e `aria-atomic` (già impliciti in `role="alert"`) (`App.tsx`)
- [x] **A6 — emoji nelle stringhe announce lette da NVDA come descrizioni pittografiche**: rimossi 📋 ⚠️ 💬 🌟 dalle stringhe `announce()` in `useGameTime.ts`
- [x] **B2 — Shopping ariaLabel e guard UI mostravano 50€ ma costo reale è 100€**: allineati a 100€ (`CityPanel.tsx`)
- [x] **C1 — Ctrl+F e Ctrl+T documentati in KeyboardShortcutsDialog ma non implementati**: aggiunti i case 'f'/'t' in `useKeyboardShortcuts.ts`; aggiunto `setActiveTab` param; Tabs reso controllato in `App.tsx`
- [x] **A7 — Dual aria-live regions — 08 Apr 2026**: separata la regione `aria-live="assertive"` (errori/blocchi) da una nuova regione `aria-live="polite"` (successi/info). `announce()` ora accetta `priority: 'polite' | 'assertive'`, default `'polite'`. Aggiunti ~35 parametri `'assertive'` su ~50 chiamate totali nei 6 hook + `App.tsx`. Build: zero errori TypeScript.

---

## Fix Infrastruttura

- [x] **Stale chunk fix** (08 Apr 2026) — rimossi 10 lazy() ingiustificati
  (< 20 kB): 5 dialog in GameDialogs.tsx + 5 panel in SchoolTab.tsx + GradeProgressPanel.
  ChunkErrorBoundary con auto-reload aggiunto su StatsDashboard (424 kB).
  Chunk dialog-*.js eliminato (Radix ora bundlato nel main).
  GameDialogs.tsx Suspense condiviso rimosso.
  FriendshipsPanel.tsx EnhancedFriendsPanel convertito a statico.
  Chunk JS da 12 a 2 (StatsDashboard-*.js + index-*.js).

---

## [x] STEP 14 — Riorganizzazione e ampliamento eventi scuola

**File modificati**: `src/lib/school-morning-events.ts`, `src/lib/school-events.ts`

### [x] 14.1 — Rimossi 4 eventi didattica ripetitivi da `school-morning-events.ts`

- [x] `sm_interrogazione_a_sorpresa` rimosso (migrato come `cse_*` in school-structured-events.ts)
- [x] `sm_compiti_non_fatti` rimosso (migrato come `cse_*` in school-structured-events.ts)
- [x] `sm_lezione_noiosa` rimosso
- [x] `sm_verifica_a_sorpresa` rimosso

### [x] 14.2 — Corretti 2 eventi

- [x] `sm_prof_assente`: description e 3 choices aggiornate (WhatsApp + scelte mattutine)
- [x] `sm_compagno_istituto`: title + description aggiornate (cortile pre-campanella)

### [x] 14.3 — Aggiunti 9 nuovi eventi `sociale` in `school-morning-events.ts`

- [x] `sm_ritardo_bus` (prob 30) — fermata del bus, 3 choices
- [x] `sm_pettegolezzo_al_cancello` (prob 35) — gossip prima di entrare, 3 choices
- [x] `sm_ragazzi_altra_sezione` (prob 25) — gruppo 3B, 3 choices + newFriend possibile
- [x] `sm_sfida_motorino_cancello` (prob 20) — sfida motorini, 3 choices + multa casuale
- [x] `sm_dimenticato_zaino` (prob 22) — libro dimenticato, 3 choices
- [x] `sm_ragazza_altra_scuola` (prob 15) — semaforo, 3 choices + newFriend
- [x] `sm_rissa_fuori_cancello` (prob 18) — rissa al cancello, 3 choices
- [x] `sm_interrogazione_prevista` (prob 28) — WhatsApp panico mattutino, 3 choices
- [x] `sm_intervallo_prima_suoneria` (prob 20) — anticipo 15 min, 3 choices

### [x] 14.4 — Aggiunti 5 nuovi eventi `teacher` in `school-events.ts` `commonEvents`

- [x] "Interrogazione a sorpresa!" (tier 1) — 3 choices, randomChance(40/35)
- [x] "Il prof raccoglie i compiti!" (tier 1) — 3 choices, randomChance(50/40)
- [x] "La lezione più noiosa dell'anno" (tier 1) — 3 choices, randomChance(40)
- [x] "Verifica a sorpresa!" (tier 2) — 3 choices, randomChance(40/50/45)
- [x] "Il supplente non sa nulla!" (tier 1) — 4 choices, randomChance(50/25)

### [x] 14.5 — Validazione

- [x] `npx tsc --noEmit` → zero errori

---

## Note per Copilot

- Consulta SEMPRE `docs/PIANO_IMPLEMENTATIVO_CORRETTIVO_v3.md` prima di implementare ogni step
- Gli step vanno eseguiti **nell'ordine indicato** (rispettare le dipendenze)
- STEP 5 e 6 possono partire in parallelo a STEP 3-4
- STEP 7 e' indipendente da tutti
- STEP 9 richiede STEP 4, 5, 6 completati
- Ogni fase termina con `npx tsc --noEmit` -> zero errori prima di spuntare la checkbox
- Pre-condizione STEP 2: cancellare localStorage browser prima di applicare le modifiche
- STEP 13.5 dipende da STEP 12 (per il wiring `onOpenStreetRace` via `useGameActions`)
