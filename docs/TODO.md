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
- [ ] Marcare `generateRandomFriend` in `social-system.ts` come `@deprecated`
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

## [ ] STEP 9 — Decomposizione App.tsx

**Effort**: ~12-16h | **Sessioni**: 4+ | **Rischio**: Alto

> Pre-condizioni: STEP 4, 5, 6 completati.

### [ ] R9a — SchoolTab.tsx (Sessione 1)

- [ ] Creare `src/components/tabs/SchoolTab.tsx`
- [ ] Estrarre `<TabsContent value="school">` da App.tsx (righe ~1188-1670)
- [ ] Definire e passare tutte le props necessarie (stats, grades, schoolType, ecc.)
- [ ] `npx tsc --noEmit` zero errori

### [ ] R9b — CityTab.tsx (Sessione 2)

- [ ] Creare `src/components/tabs/CityTab.tsx`
- [ ] Estrarre `<TabsContent value="city">` da App.tsx
- [ ] `npx tsc --noEmit` zero errori

### [ ] R9c — SocialTab.tsx + StatusTab.tsx (Sessione 3)

- [ ] Creare `src/components/tabs/SocialTab.tsx`
- [ ] Creare `src/components/tabs/StatusTab.tsx`
- [ ] Estrarre rispettive TabsContent da App.tsx
- [ ] `npx tsc --noEmit` zero errori

### [ ] R9d — Estrazione handler lunghi (Sessione 4)

- [ ] Creare `src/lib/school-actions.ts`: estrarre `handleVaiAScuola` (L448-L520, 72 righe) come funzione pura
- [ ] Creare `src/lib/school-event-handlers.ts`: estrarre `handleSchoolEventChoice` (L663-L742) e `handleReportCardContinue` (L742-L800+)
- [ ] Mantenere in App.tsx solo il wiring (chiamata pura + setState)
- [ ] Aggiungere test per le funzioni pure estratte
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 9**:
- [ ] App.tsx < 800 righe
- [ ] SchoolTab, CityTab, SocialTab, StatusTab funzionano come prima
- [ ] Handler estratti sono funzioni pure con test

---

## [ ] STEP 10 — Decomposizione useGameActions e GameDialogs

**Effort**: ~8h | **Sessioni**: 3-4 | **Rischio**: Alto

> Pre-condizioni: STEP 7 e STEP 9 completati.

### [ ] R10a-d — Split useGameActions

- [ ] Creare `src/hooks/useStudyActions.ts` (handleStudia, handleStudySubject, handleCorrompi, handleMinaccia, handlePrepareExam)
- [ ] Creare `src/hooks/useSocialActions.ts` (handleDisco, handleCinema, handleChiacchiera, handleParco, handleTelefona, handleTryRelationship)
- [ ] Creare `src/hooks/useGirlfriendActions.ts` (handleGirlfriendAction, handleGirlfriendBreakup)
- [ ] Creare `src/hooks/useEconomyActions.ts` (handleLavoro, handleShoppingMall, handleMotorino)
- [ ] `useGameActions.ts` diventa facciata che compone i sotto-hook, interfaccia pubblica invariata
- [ ] `useGameActions.ts` < 200 righe
- [ ] `npx tsc --noEmit` zero errori

### [ ] R11 — Split GameDialogs

- [ ] Creare `src/components/dialogs/MetallariDialog.tsx`
- [ ] Creare `src/components/dialogs/AtipaEventDialog.tsx`
- [ ] Creare `src/components/dialogs/PoliceDialog.tsx`
- [ ] Creare `src/components/dialogs/StreetRaceDialog.tsx`
- [ ] Creare `src/components/dialogs/BulliDialog.tsx`
- [ ] Creare `src/components/dialogs/GameOverDialog.tsx`
- [ ] Creare `src/components/dialogs/ResetDialog.tsx`
- [ ] `GameDialogs.tsx` diventa orchestratore < 100 righe
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 10**:
- [ ] useGameActions.ts < 200 righe (facciata)
- [ ] GameDialogs.tsx < 100 righe (orchestratore)
- [ ] Ogni sotto-hook e sotto-dialog ha singola responsabilita

---

## [ ] STEP 11 — Architettura Relazioni (Futuro)

> Da pianificare separatamente. Non blocca STEP 1-10.

### [ ] R18 — girlfriendToRelation() adapter

- [ ] Creare funzione `girlfriendToRelation(girlfriend: Ragazza): RelationStats`
- [ ] Integrare la fidanzata nel sistema 4-assi

### [ ] R4h — Deprecazione formale social-system.ts

- [ ] Marcare tutte le export di `social-system.ts` come `@deprecated`
- [ ] Migrare `useEventEngine.ts` da `social-system.ts` a `enhanced-friend-system.ts`
- [ ] Eliminare `social-system.ts`

---

## Note per Copilot

- Consulta SEMPRE `docs/PIANO_IMPLEMENTATIVO_CORRETTIVO_v3.md` prima di implementare ogni step
- Gli step vanno eseguiti **nell'ordine indicato** (rispettare le dipendenze)
- STEP 5 e 6 possono partire in parallelo a STEP 3-4
- STEP 7 e' indipendente da tutti
- STEP 9 richiede STEP 4, 5, 6 completati
- Ogni fase termina con `npx tsc --noEmit` -> zero errori prima di spuntare la checkbox
- Pre-condizione STEP 2: cancellare localStorage browser prima di applicare le modifiche
