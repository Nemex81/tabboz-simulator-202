<!-- linked-plan: docs/PIANO_IMPLEMENTATIVO_CORRETTIVO_v3.md -->
# TODO — Piano Correttivo v3

> Prima di ogni fase, Copilot DEVE leggere il file
> `docs/PIANO_IMPLEMENTATIVO_CORRETTIVO_v3.md` per consultare le specifiche
> tecniche complete, i tipi, le firme delle funzioni e le regole di
> compatibilita. Non procedere a memoria.

---

## [ ] STEP 1 — Quick Win (Rischio Zero)

**Effort**: ~20 min | **Rischio**: Nullo

### [ ] R1 — Fix girlfriend prop hardcoded

- [ ] In `src/App.tsx` riga ~1650, sostituire `girlfriend={null}` con `girlfriend={girlfriend ?? null}`
- [ ] Verifica: tab amici mostra fidanzata se presente
- [ ] `npx tsc --noEmit` zero errori

### [ ] R2 — Elimina FriendsPanel.tsx (dead code)

- [ ] Eliminare `src/components/FriendsPanel.tsx`
- [ ] `grep -r "FriendsPanel" src/` restituisce 0 risultati (escluso EnhancedFriendsPanel)
- [ ] `npx tsc --noEmit` zero errori

### [ ] R3 — Elimina SUBJECT_WEIGHTS deprecato

- [ ] Rimuovere blocco `export const SUBJECT_WEIGHTS` da `src/lib/types.ts` riga ~111
- [ ] `grep -r "SUBJECT_WEIGHTS" src/` restituisce 0 risultati
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 1**:
- [ ] Build passa senza errori TypeScript
- [ ] `girlfriend` dinamica visibile nel tab amici

---

## [ ] STEP 2 — Scala Relazioni (Priorita Anticipata)

**Effort**: ~2h | **Rischio**: Medio

> Pre-condizione: cancellare localStorage dal browser (DevTools -> Application -> Local Storage -> Clear All) prima di applicare le modifiche.

### [ ] R4a — classmate-relations.ts: scala [0,100]

- [ ] Cambiare `RELATION_MIN = 0`, `RELATION_MAX = 100`
- [ ] Valore neutro iniziale: `50` (era `0` su scala [-100,+100])
- [ ] `PROMOTION_THRESHOLD = 65` (da formula (30+100)/2 = 65)
- [ ] Aggiornare clamp per operare su [0,100]
- [ ] Rimuovere `classmateRelationToFriendship()` (la formula diventa identita)
- [ ] `npx tsc --noEmit` zero errori

### [ ] R4b — Reset KV (nessuna migrazione lazy)

- [ ] Documentare procedura reset localStorage nel README o in commento inline
- [ ] Nessuna funzione `migrateClassmate()` da creare

### [ ] R4c — teacher-relations.ts: scala [0,100]

- [ ] Cambiare `RELATION_MIN = 0`, `RELATION_MAX = 100`
- [ ] Valore neutro iniziale: `50`
- [ ] Aggiornare `sogliaRottura`: es. `-30` diventa `((-30)+100)/2 = 35`
- [ ] `ISTERESI = 10` (dimezzato proporzionalmente al nuovo range)
- [ ] Aggiornare funzione `clamp()` privata per [0,100]
- [ ] `CORRUPTION_CHANCE_MIN/MAX` e `THREAT_CHANCE_MIN/MAX` invariati (gia in percentuale)
- [ ] `MAX_MEMORIA = 20` invariato (contatore, non scala)
- [ ] Nessuna funzione `migrateTeacher()`
- [ ] `npx tsc --noEmit` zero errori

### [ ] R4d — promoteToFriend(): mappatura diretta

- [ ] In `src/lib/classmate-relations.ts` sostituire `classmateRelationToFriendship(classmate)` con `classmate.relation`
- [ ] In `src/lib/school-roster-transitions.ts`: rimuovere import `classmateRelationToFriendship`, usare `classmate.relation` direttamente
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 2**:
- [ ] Classmate relation inizia a 50 (non 0)
- [ ] Promozione avviene a soglia 65
- [ ] Dopo reset localStorage, relation compagno inizia a 50
- [ ] Teacher isteresi funziona su scala [0,100]

---

## [ ] STEP 3 — Fondamenta Centralizzazione

**Effort**: ~2h | **Rischio**: Basso

> Pre-condizione: STEP 2 completato.

### [ ] R5 — Crea game-balance.constants.ts

- [ ] Creare `src/lib/game-balance.constants.ts`
- [ ] Definire: `STAT_CAPS`, `RELATION`, `ECONOMY`, `SCHOOL`, `REPUTATION_WEIGHTS`, `BET`
- [ ] Aggiornare file consumer per importare da qui invece di hardcodare
- [ ] `npx tsc --noEmit` zero errori

### [ ] R7 — Sostituzione inline clamp con clampStat()

- [ ] `data-validation.ts` riga 130: Math.max/Min inline -> `clampStat(val, 0, max)`
- [ ] `data-validation.ts` righe 170, 172: -> `clampStat(val)`
- [ ] `classmate-relations.ts` riga 91: -> `clampStat(val, RELATION.MIN, RELATION.MAX)`
- [ ] `relation-system.ts` righe 431-435 (5x): -> `clampStat(Math.round(val))`
- [ ] `relation-system.ts` riga 529: -> `clampStat(val)`
- [ ] `girlfriend-system.ts` riga 533: -> `clampStat(val)`
- [ ] `enhanced-friend-system.ts` righe 294, 298 (2x): -> `clampStat(val)`
- [ ] `school-timetable.ts` riga 137: -> `clampStat(val, 0, 4)`
- [ ] `teacher-relations.ts`: rimuovere `clamp()` privata, importare `clampStat`
- [ ] `npx tsc --noEmit` zero errori

### [ ] R7b — clampStat() esteso con STAT_CAPS

- [ ] Aggiornare `src/lib/game-utils.ts` riga 3-5: overload con chiave stringa o min/max numerici
- [ ] Retrocompatibilita garantita: firma originale `(value, min?, max?)` ancora funzionante
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 3**:
- [ ] Tutte le costanti estratte importate da game-balance.constants.ts
- [ ] `clampStat('soldi')` ritorna [0,1000]
- [ ] Zero occorrenze di `Math.max(0, Math.min(100,...))` non giustificate

---

## [ ] STEP 4 — useGameRelations come Hub Unico

**Effort**: ~1.5h | **Rischio**: Medio

> Pre-condizioni: STEP 2 e STEP 3 completati.

### [ ] R4e — doClassmateInteraction()

- [ ] Aggiungere `doClassmateInteraction(classmateId, interactionKey)` in `src/hooks/useGameRelations.ts`
- [ ] Trova classmate, applica interazione, aggiorna roster, segnala se supera soglia promozione
- [ ] `npx tsc --noEmit` zero errori

### [ ] R4f — doTeacherInteraction()

- [ ] Aggiungere `doTeacherInteraction(teacherId, interactionKey)` in `src/hooks/useGameRelations.ts`
- [ ] Trova teacher, applica via `applyTeacherRelationChange()`, aggiorna roster, controlla ostilita
- [ ] `npx tsc --noEmit` zero errori

### [ ] R4g — Pannelli passano per l'hub

- [ ] `TeachersPanel.tsx` riga 16: rimuovere import diretto di `applyTeacherRelationChange`
- [ ] `SchoolBreakPanel.tsx`: rimuovere import diretti da teacher-relations
- [ ] Pannelli ricevono `doTeacherInteraction` / `doClassmateInteraction` come prop da App.tsx
- [ ] Marcare `generateRandomFriend` in `social-system.ts` come `@deprecated`
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 4**:
- [ ] TeachersPanel e SchoolBreakPanel non importano direttamente da lib/
- [ ] `doClassmateInteraction` e `doTeacherInteraction` ritornano risultati coerenti con `doInteraction`

---

## [ ] STEP 5 — Stato App e UI Core

**Effort**: ~1.5h | **Rischio**: Basso

### [ ] R6 — morningDisplay enum

- [ ] In `src/hooks/useAppDialogs.ts`: sostituire `showSchoolMorning` + `showStreetMorning` con `morningDisplay: 'school' | 'street' | null`
- [ ] Aggiornare destructuring e tutti i punti in App.tsx (pattern setter/getter)
- [ ] `npx tsc --noEmit` zero errori

### [ ] R16 — Helper cityActionDisabled()

- [ ] Aggiungere `getActionState()` locale in `src/components/CityPanel.tsx`
- [ ] Eliminare ripetizione del pattern disabled/blockedReason sui 6 ActionButton
- [ ] `npx tsc --noEmit` zero errori

### [ ] R8 — React.memo e useMemo

- [ ] Wrappare `CharacterSheet` con `React.memo`
- [ ] Wrappare `GameDialogs` con `React.memo`
- [ ] Wrappare `GirlfriendPanel` con `React.memo`
- [ ] Spezzare `gameDialogsProps` in `schoolDialogProps`, `cityDialogProps`, `socialDialogProps` con `useMemo`
- [ ] Aggiornare `GameDialogs` per ricevere `school`, `city`, `social` invece di superficie piatta
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 5**:
- [ ] `morningDisplay` e un singolo state enum
- [ ] CityPanel ha zero ripetizione nel pattern disabled
- [ ] `gameDialogsProps` memoizzato (useMemo)

---

## [ ] STEP 6 — Naming, Stati Vuoti e Accessibilita

**Effort**: ~2h | **Rischio**: Basso

### [ ] R12 — Rinomina RelationsPanel

- [ ] Rinominare `src/components/RelationsPanel.tsx` -> `FriendshipsPanel.tsx`
- [ ] Aggiornare import in App.tsx e tutti gli importatori
- [ ] Aggiungere JSDoc header a FriendshipsPanel, RelationshipsPanel, EnhancedFriendsPanel
- [ ] `npx tsc --noEmit` zero errori

### [ ] R15 — Stati vuoti mancanti

- [ ] `GradeProgressPanel.tsx`: aggiungere check `gpaSubjects.length === 0` con messaggio accessibile
- [ ] `TeacherSelectionDialog.tsx`: aggiungere check `subjects.length === 0` (edge case difensivo)
- [ ] RelationshipsPanel NON da toccare (stato vuoto gia presente)
- [ ] `npx tsc --noEmit` zero errori

### [ ] R14 — aria-label e role mancanti

- [ ] `GradeProgressPanel.tsx` root div: aggiungere `role="region" aria-label="Progresso voti"`
- [ ] `CityPanel.tsx` root div: aggiungere `role="region" aria-label="Pannello citta"`
- [ ] `RelationshipsPanel.tsx` root div: aggiungere `role="region" aria-label="Relazioni sentimentali"`
- [ ] `SchoolEventDialog.tsx`: verificare se Radix fornisce gia aria-label, aggiungere se mancante
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 6**:
- [ ] `FriendshipsPanel.tsx` esiste, `RelationsPanel.tsx` eliminato
- [ ] GradeProgressPanel mostra stato vuoto se nessuna materia
- [ ] 4 componenti hanno `aria-label`/`role`

---

## [ ] STEP 7 — Audio Unificato

**Effort**: ~1h | **Rischio**: Basso

### [ ] R13 — useSoundFeedback hook

- [ ] Creare `src/hooks/useSoundFeedback.ts` con `SoundAction` type e `ACTION_SOUND_MAP`
- [ ] Esporre `play(action: SoundAction)` callback
- [ ] `npx tsc --noEmit` zero errori

### [ ] R13b — Aggiornamento pannelli muti

- [ ] `GirlfriendPanel.tsx`: aggiungere `useSoundFeedback`, trigger `play('success')` / `play('failure')` / `play('bigWin')` / `play('bigLoss')`
- [ ] `EnhancedFriendsPanel.tsx`: analogo pattern per interazioni amicizia
- [ ] `npx tsc --noEmit` zero errori

### [ ] R13c — CityPanel allineamento

- [ ] Valutare e aggiungere `play('click')` su azioni pulsante in CityPanel se non gia delegato ad App.tsx
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 7**:
- [ ] useSoundFeedback hook esiste e mappa tutte le azioni
- [ ] GirlfriendPanel e EnhancedFriendsPanel producono feedback sonoro

---

## [ ] STEP 8 — Bilanciamento Formula Reputazione

**Effort**: ~1h | **Rischio**: Medio (gameplay)

> Pre-condizione: STEP 3 completato (REPUTATION_WEIGHTS da game-balance.constants.ts).

### [ ] R19 — Correzione formula reputazione

- [ ] `src/lib/game-utils.ts` riga 134: sostituire `Math.min(stats.soldi / 10, 100)` con `clampStat(stats.soldi, 'soldi') / 10`
- [ ] `src/lib/game-utils.ts` riga 135: sostituire `Math.min(stats.media * 10, 100)` con `clampStat(stats.media, 'media') * 10`
- [ ] `npx tsc --noEmit` zero errori

### [ ] R19b — Pesi in costanti

- [ ] Sostituire i 6 `const *Weight` locali in game-utils.ts con import da `REPUTATION_WEIGHTS`
- [ ] `npx tsc --noEmit` zero errori

**Criteri di accettazione STEP 8**:
- [ ] Formula reputazione usa REPUTATION_WEIGHTS
- [ ] soldi/media scalano linearmente senza cap implicito

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
